// dependencies
const util = require('util');

// global variables
let pairs         = require('../models/pairs');
let db            = require('../models/dbConfig');
let addonBacktest = require('../models/elements/backtest');
let logger        = require('../models/winstonConfig')

// node native promisify
const query = util.promisify(db.query).bind(db);

module.exports.index = (req, res) => {
  var getAllBacktest = `SELECT b.id, created_at, b.result, pair, timeframe, strategy FROM backtest b
    LEFT JOIN pairs p ON b.pair_id = p.id
    LEFT JOIN timeframes t ON b.timeframe_id = t.id
    LEFT JOIN strategies s ON b.strategy_id = s.id
    WHERE b.user_id = ? ORDER BY created_at DESC LIMIT 25;`;
  db.query(getAllBacktest, req.user.id, (err, results) => {
    if (err) {
      logger.error({
        message: 'BACKTEST (index) could not retrieve getAllBacktest',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username);
    }

    res.render("user/journal/backtest/index",
      {
        dataList: results,
        options: { year: 'numeric', month: 'long', day: 'numeric' },
        currencies: req.session.assets
      }
    );
  })
}

module.exports.indexInfinite = (req, res) => {
  getBacktest = `SELECT b.id, created_at, b.result, pair, timeframe, strategy FROM backtest b
    LEFT JOIN pairs p ON b.pair_id = p.id
    LEFT JOIN timeframes t ON b.timeframe_id = t.id
    LEFT JOIN strategies s ON b.strategy_id = s.id
    WHERE b.user_id = ? ORDER BY created_at DESC LIMIT 25 OFFSET ?;`
  if (req.body.query) { getBacktest = req.body.query + ' OFFSET ?;'}
  db.query(getBacktest, [req.user.id, Number(req.body.offset)], (err, results) => {
    if (err) {
      logger.error({
        message: 'BACKTEST (index) could not retrieve INFINITE SCROLL getBacktest',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username);
    }
    return res.json({
      dataList: results,
      options: { year: 'numeric', month: 'long', day: 'numeric' },
      multipleText: res.__('Multiple')
    })
  })
}

module.exports.filter = (req, res) => {
  var createFilter = ''
  if (req.body.create) { createFilter = '&& created_at >= ' + req.body.create + ' >= created_at' }
  var getBacktest = `SELECT b.id, created_at, b.result, pair, timeframe, strategy FROM backtest b
    LEFT JOIN pairs p ON b.pair_id = p.id
    LEFT JOIN timeframes t ON b.timeframe_id = t.id
    LEFT JOIN strategies s ON b.strategy_id = s.id
    WHERE b.user_id = ? && (${req.body.pairs} || pair IS NULL)
      && (${req.body.strategy} || strategy IS NULL) && (${req.body.timeframe} || timeframe IS NULL)
      && (${req.body.result}) ${createFilter}
    ORDER BY ${req.body.sort} ${req.body.order} LIMIT 25`
  db.query(getBacktest, req.user.id, (err, results) => {
    if (err) {
      logger.error({
        message: 'BACKTEST (index) could not resolve filter',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username);
    }
    return res.json({
      dataList: results,
      options: { year: 'numeric', month: 'long', day: 'numeric' },
      multipleText: res.__('Multiple'),
      query: getBacktest
    })
  })
}

module.exports.renderNewForm = (req, res) => {
  if (Object.keys(req.session.assets).length === 0) {
    req.flash('error', res.__('You are not able to access here without any assets. Go to settings to add an asset.'))
    return res.redirect('/' + req.user.username + '/journal/backtest');
  }
  // loads the backtest addons to an object
  var addons = {
    list: addonBacktest.htmlList,
    newOption: addonBacktest.optionList
  }
  res.render("user/journal/backtest/new",
    {
      currencies: req.session.assets,
      addons: addons
    }
  )
}

module.exports.createBacktest = (req, res) => {
  if (!(req.body.outcome)) {
    req.flash('error', res.__('The results\' type has to be defined.'))
    res.redirect('/' + req.user.username + '/journal/backtest/new');
  } else {
    // creates an object with the new backtest main variables
    var newBacktest = {
      user_id: req.user.id,
      result: req.body.outcome
    }
    newBacktest.pair_id = (req.body.pairs == 0) ? null :req.body.selectPair;
    switch (req.body.direction) {
      case '0':
        newBacktest.direction = null;
        break;
      case '1':
        newBacktest.direction = 'long';
        break;
      case '-1':
        newBacktest.direction = 'short';
        break;
    }
    newBacktest.strategy_id = (req.body.strategy == 0) ? null :req.body.selectStrategy;
    newBacktest.timeframe_id = (req.body.timeframe == 0) ? null :req.body.selectTimeframe;
    // stores the principal backtest parametes into the DB
    db.query('INSERT INTO backtest SET ?', newBacktest, (err, backtestId) => {
      if (err) {
        logger.error({
          message: 'BACKTEST (new) could not create a new Backtest',
          endpoint: req.method + ': ' + req.originalUrl,
          programMsg: err
        })
        req.flash('error', res.__('Something went wrong, please try again.'))
        return res.redirect('/' + req.user.username + '/journal/backtest/new');
      }
      var backtest_id = backtestId.insertId;
      if ('varName' in req.body) {
        var addAddons = 'INSERT INTO backtest_addons (backtest_id, which_addon, description, is_integers, option1, option2, option3, option4, option5, option6) VALUES ?'
        // creates an object with the new backtest addons variables
        var newAddons = []
        var counterAddon = 0;
        // multiple addons
        if (Array.isArray(req.body.varName)) {
          for (var i = 0; i < req.body.varName.length; i++) {
            if (req.body.varName[i] == '') {
              req.flash('error', res.__('The addons\' title cannot be blank.'))
              return res.redirect('/' + req.user.username + '/journal/backtest/new');
            }
            var addon = [backtest_id, i + 1, req.body.varName[i], req.body.intList[i]]
            // configures an integers value addon
            if (req.body.intList[i] == 1) {
              addon.push(null, null, null, null, null, null)
            }
            // configures an options value addons
            else {
              if (req.body.varOption[counterAddon] == '') {
                req.flash('error', res.__('The addons\' options are required.'))
                return res.redirect('/' + req.user.username + '/journal/backtest/new');
              }
              for (var y = counterAddon; y < Number(counterAddon) + Number(req.body.arrOption[i]); y++) {
                addon.push(req.body.varOption[y])
              }
              if (req.body.arrOption[i] < 6) {
                for (var r = 0; r < 6 - req.body.arrOption[i]; r++) {
                  addon.push(null)
                }
              }
            }
            counterAddon += Number(req.body.arrOption[i])
            newAddons.push(addon);
          }
        }
        // single addon
        else {
          if (req.body.varName == '') {
            req.flash('error', res.__('The addon\'s title cannot be blank.'))
            return res.redirect('/' + req.user.username + '/journal/backtest/new');
          }
          var addon = [backtest_id, req.body.varName, req.body.intList]
          // configures an integers value addon
          if (req.body.intList == 1) {
            addon.push(null, null, null, null, null, null)
          }
          // configures an options value addons
          else {
            if (req.body.varOption[0] == '') {
              req.flash('error', res.__('The addon\'s options are required.'))
              return res.redirect('/' + req.user.username + '/journal/backtest/new');
            }
            for (var y = 0; y < req.body.arrOption; y++) {
              if (!req.body.varOption[y] == '') {
                addon.push(req.body.varOption[y])
              } else {
                addon.push(null)
              }
            }
            if (req.body.arrOption < 6) {
              for (var r = 0; r < 6 - req.body.arrOption; r++) {
                addon.push(null)
              }
            }
          }
          newAddons.push(addon);
        }
        // stores the backtest addons into the DB
        db.query(addAddons, [newAddons], (err, complete) => {
          if (err) {
            logger.error({
              message: 'BACKTEST (new) could not create addons',
              endpoint: req.method + ': ' + req.originalUrl,
              programMsg: err
            })
            req.flash('error', res.__('Something went wrong, please try again.'))
            return res.redirect('/' + req.user.username + '/journal/backtest');
          }
          res.redirect("/" + req.user.username + "/journal/backtest/" + backtest_id + "/edit");
        })
      } else {
        res.redirect("/" + req.user.username + "/journal/backtest/" + backtest_id + "/edit");
      }
    })
  }
}

module.exports.showBacktest = (req, res) => {
  // inserts DB queries to a variable
  var getBacktest = `SELECT b.id, created_at, b.result, pair, timeframe, strategy FROM backtest b
    LEFT JOIN pairs p ON b.pair_id = p.id
    LEFT JOIN timeframes t ON b.timeframe_id = t.id
    LEFT JOIN strategies s ON b.strategy_id = s.id
    WHERE b.id = ? AND b.user_id = ?;`;
  var getAddons = 'SELECT * FROM backtest_addons WHERE backtest_id = ? ORDER BY id;'
  var getData = `SELECT identifier, direction, result, pair, timeframe, strategy,
        addon1, addon2, addon3, addon4, addon5, addon6
       FROM backtest_data bd
    LEFT JOIN pairs p on bd.pair_id = p.id
    LEFT JOIN timeframes t on bd.timeframe_id = t.id
    LEFT JOIN strategies s on s.id = bd.strategy_id
    WHERE bd.backtest_id = ?;`
  db.query(getBacktest, [req.params.id, req.user.id], (err, backtestInfo) => {
    if (err) {
      logger.error({
        message: 'BACKTEST (show) could not getBacktest',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/backtest');
    }
    db.query(getAddons, backtestInfo[0].id, (err, backtestAddons) => {
      if (err) {
        logger.error({
          message: 'BACKTEST (show) could not getAddons',
          endpoint: req.method + ': ' + req.originalUrl,
          programMsg: err
        })
        req.flash('error', res.__('Something went wrong, please try again.'))
        return res.redirect('/' + req.user.username + '/journal/backtest');
      }
      db.query(getData, backtestInfo[0].id, (err, backtestData) => {
        if (err) {
          logger.error({
            message: 'BACKTEST (show) could not getData',
            endpoint: req.method + ': ' + req.originalUrl,
            programMsg: err
          })
          req.flash('error', res.__('Something went wrong, please try again.'))
          return res.redirect('/' + req.user.username + '/journal/backtest');
        }
        res.render("user/journal/backtest/show",
          {
            backtest: backtestInfo[0],
            addons: backtestAddons,
            data: backtestData,
            options: { year: 'numeric', month: 'long', day: 'numeric' }
          }
        )
      })
    })
  })
}

module.exports.renderEditForm = (req, res) => {
  // inserts DB queries to a variable
  var getBacktest = `SELECT b.id, created_at, b.result, pair, pair_id, timeframe, strategy FROM backtest b
    LEFT JOIN pairs p ON b.pair_id = p.id
    LEFT JOIN timeframes t ON b.timeframe_id = t.id
    LEFT JOIN strategies s ON b.strategy_id = s.id
    WHERE b.id = ? AND b.user_id = ?;`
  var getAddons = 'SELECT * FROM backtest_addons WHERE backtest_id = ? ORDER BY id;'
  var getData = `SELECT bd.id, identifier, direction, result, pair, pair_id, timeframe, strategy,
        addon1, addon2, addon3, addon4, addon5, addon6
       FROM backtest_data bd
    LEFT JOIN pairs p on bd.pair_id = p.id
    LEFT JOIN timeframes t on bd.timeframe_id = t.id
    LEFT JOIN strategies s on s.id = bd.strategy_id
    WHERE bd.backtest_id = ?;`
  db.query(getBacktest, [req.params.id, req.user.id], (err, backtestInfo) => {
    if (err) {
      logger.error({
        message: 'BACKTEST (edit) could not getBacktest',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/backtest');
    }
    db.query(getAddons, backtestInfo[0].id, (err, backtestAddons) => {
      if (err) {
        logger.error({
          message: 'BACKTEST (edit) could not getAddons',
          endpoint: req.method + ': ' + req.originalUrl,
          programMsg: err
        })
        req.flash('error', res.__('Something went wrong, please try again.'))
        return res.redirect('/' + req.user.username + '/journal/backtest');
      }
      db.query(getData, backtestInfo[0].id, (err, backtestData) => {
        if (err) {
          logger.error({
            message: 'BACKTEST (edit) could not getData',
            endpoint: req.method + ': ' + req.originalUrl,
            programMsg: err
          })
          req.flash('error', res.__('Something went wrong, please try again.'))
          return res.redirect('/' + req.user.username + '/journal/backtest');
        }
        res.render("user/journal/backtest/edit",
          {
            currencies: req.session.assets,
            backtest: backtestInfo[0],
            addons: backtestAddons,
            data: backtestData,
            options: { year: 'numeric', month: 'long', day: 'numeric' }
          }
        )
      })
    })
  })
}

module.exports.updateBacktest = (req, res) => {
  var parseData = JSON.parse(req.body.serverData);
  (async () => {
    try {
      var getAddonsNumber = await query(`SELECT id FROM backtest_addons WHERE backtest_id = ?`, req.params.id)
      var dataAddons = ''
      for (var i = 0; i < getAddonsNumber.length; i++) {
        dataAddons += ', addon' + (1 + i)
      }
      var deleteData = await query('DELETE FROM backtest_data WHERE backtest_id = ?', req.params.id)
      if (parseData.data.length > 0) {
        parseData.data.forEach((row) => {
          row[4] = req.session.assets[row[4]].id
        })
        var addData = await query(`INSERT INTO backtest_data (identifier, backtest_id, direction, result, pair_id, strategy_id, timeframe_id${dataAddons}) VALUES ?`, [parseData.data])
      }
    } catch (err) {
      logger.error({
        message: 'BACKTEST (edit) something went wrong',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/backtest');
    } finally {
      req.flash('success', res.__('The backtest was saved successfully.'))
      return res.redirect("/" + req.user.username + "/journal/backtest");
    }
  })()
}

module.exports.deleteBacktest = (req, res) => {
  (async () => {
    try {
      var deleteBacktestData = await query('DELETE FROM backtest_data WHERE backtest_id = ?', req.params.id)
      var deleteAddons = await query('DELETE FROM backtest_addons WHERE backtest_id = ?', req.params.id)
      var deleteBacktest = await query('DELETE FROM backtest WHERE id = ?', req.params.id)
    } catch (err) {
      logger.error({
        message: 'BACKTEST (delete) something went wrong',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
    } finally {
      req.flash('success', res.__('Backtest was deleted successfully.'))
      return res.redirect("/" + req.user.username + "/journal/backtest");
    }
  })()
}
