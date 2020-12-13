// dependencies
const util = require('util');

// global variables
let pairs         = require('../models/pairs');
let db            = require('../models/dbConfig');
let addonBacktest = require('../models/elements/backtest');

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
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username);
    }

    res.render("user/journal/backtest/index",
      {
        dataList: results,
        options: { year: 'numeric', month: 'long', day: 'numeric' },
        currencies: pairs
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
      console.log(err);
      // COMBAK: log error
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
      console.log(err);
      // COMBAK: log error
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
  // loads the backtest addons to an object
  var addons = {
    list: addonBacktest.htmlList,
    newOption: addonBacktest.optionList
  }
  res.render("user/journal/backtest/new",
    {
      currencies: pairs,
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
        // COMBAK: log error
        req.flash('error', res.__('Something went wrong, please try again.'))
        return res.redirect('/' + req.user.username + '/journal/backtest/new');
      }
      var backtest_id = backtestId.insertId;
      if ('varName' in req.body) {
        var addAddons = 'INSERT INTO backtest_addons (backtest_id, description, is_integers, option1, option2, option3, option4, option5, option6) VALUES ?'
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
            var addon = [backtest_id, req.body.varName[i], req.body.intList[i]]
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
            // COMBAK: log error
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
       MAX(CASE WHEN backtest_addons_id = '1' THEN addon_value END) addon1,
       MAX(CASE WHEN backtest_addons_id = '2' THEN addon_value END) addon2,
       MAX(CASE WHEN backtest_addons_id = '3' THEN addon_value END) addon3,
       MAX(CASE WHEN backtest_addons_id = '4' THEN addon_value END) addon4,
       MAX(CASE WHEN backtest_addons_id = '5' THEN addon_value END) addon5,
       MAX(CASE WHEN backtest_addons_id = '6' THEN addon_value END) addon6
       FROM backtest_addons_data bad
    RIGHT JOIN backtest_data bd on bad.backtest_data_id = bd.id
    LEFT JOIN pairs p on bd.pair_id = p.id
    LEFT JOIN timeframes t on bd.timeframe_id = t.id
    LEFT JOIN strategies s on s.id = bd.strategy_id
    WHERE bd.backtest_id = ?
    GROUP BY identifier, direction, direction, result, pair, timeframe, strategy;`
  db.query(getBacktest, [req.params.id, req.user.id], (err, backtestInfo) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/backtest');
    }
    db.query(getAddons, backtestInfo[0].id, (err, backtestAddons) => {
      if (err) {
        console.log(err);
        // COMBAK: log error
        req.flash('error', res.__('Something went wrong, please try again.'))
        return res.redirect('/' + req.user.username + '/journal/backtest');
      }
      db.query(getData, backtestInfo[0].id, (err, backtestData) => {
        if (err) {
          console.log(err);
          // COMBAK: log error
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
       MAX(CASE WHEN backtest_addons_id = '1' THEN addon_value END) addon1,
       MAX(CASE WHEN backtest_addons_id = '2' THEN addon_value END) addon2,
       MAX(CASE WHEN backtest_addons_id = '3' THEN addon_value END) addon3,
       MAX(CASE WHEN backtest_addons_id = '4' THEN addon_value END) addon4,
       MAX(CASE WHEN backtest_addons_id = '5' THEN addon_value END) addon5,
       MAX(CASE WHEN backtest_addons_id = '6' THEN addon_value END) addon6
       FROM backtest_addons_data bad
    RIGHT JOIN backtest_data bd on bad.backtest_data_id = bd.id
    LEFT JOIN pairs p on bd.pair_id = p.id
    LEFT JOIN timeframes t on bd.timeframe_id = t.id
    LEFT JOIN strategies s on s.id = bd.strategy_id
    WHERE bd.backtest_id = ?
    GROUP BY bd.id, identifier, direction, direction, result, pair, pair_id, timeframe, strategy;`
  db.query(getBacktest, [req.params.id, req.user.id], (err, backtestInfo) => {
    if (err) {
      console.log(err);
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/backtest');
    }
    db.query(getAddons, backtestInfo[0].id, (err, backtestAddons) => {
      if (err) {
        console.log(err);
        // COMBAK: log error
        req.flash('error', res.__('Something went wrong, please try again.'))
        return res.redirect('/' + req.user.username + '/journal/backtest');
      }
      db.query(getData, backtestInfo[0].id, (err, backtestData) => {
        if (err) {
          // COMBAK: log error
          req.flash('error', res.__('Something went wrong, please try again.'))
          return res.redirect('/' + req.user.username + '/journal/backtest');
        }
        res.render("user/journal/backtest/edit",
          {
            currencies: pairs,
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
    if (parseData.data.length > 0) {
      parseData.data.forEach((row) => {
        row[4] = pairs.get(row[4]).id
      });
      var deleteAddonsData = await query('DELETE FROM backtest_addons_data WHERE backtest_id = ?', req.params.id);
      var deleteData = await query('DELETE FROM backtest_data WHERE backtest_id = ?', req.params.id);
      var addData = await query('INSERT INTO backtest_data (identifier, backtest_id, direction, result, pair_id, strategy_id, timeframe_id) VALUES ?', [parseData.data])
      var getNewIDs = await query('SELECT id FROM backtest_data WHERE backtest_id = ? ORDER BY id ASC', req.params.id, (err, results) => {
        if (err) {
          console.log(err);
          // COMBAK: log error
          req.flash('error', res.__('Something went wrong, please try again.'))
          return res.redirect('/' + req.user.username + '/journal/backtest');
        }
        if (parseData.addons.length > 0) {
          var setAddons = parseData.addons.length / results.length
          for (var i = 0; i < parseData.addons.length; i = i + setAddons) {
            var correspondingID = i / 6;
            for (var y = i; y < i + setAddons; y++) {
              parseData.addons[y].push(results[correspondingID].id)
            }
          }
        }
        db.query('INSERT INTO backtest_addons_data (backtest_addons_id, addon_value, backtest_id, backtest_data_id) VALUES ?', [parseData.addons], (err, results) => {
          if (err) {
            console.log(err);
            // COMBAK: log error
            req.flash('error', res.__('Something went wrong, please try again.'))
            return res.redirect('/' + req.user.username + '/journal/backtest');
          }
          req.flash('success', res.__('The backtest was saved successfully.'))
          res.redirect("/" + req.user.username + "/journal/backtest");
        })
      })
    }
  })()
}

module.exports.deleteBacktest = (req, res) => {
  (async () => {
    var deleteAddonsData = await query('DELETE FROM backtest_addons_data WHERE backtest_id = ?', req.params.id)
    var deleteBacktestData = await query('DELETE FROM backtest_data WHERE backtest_id = ?', req.params.id)
    var deleteAddons = await query('DELETE FROM backtest_addons WHERE backtest_id = ?', req.params.id)
    var deleteBacktest = await query('DELETE FROM backtest WHERE id = ?', req.params.id)
    req.flash('success', res.__('Backtest was deleted successfully.'))
    res.redirect("/" + req.user.username + "/journal/backtest");
  })()


}
