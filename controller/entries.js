// dependencies
const util  = require('util');
let fetch   = require('node-fetch');

// global variables
let pairs       = require('../models/pairs');
let currencies  = require('../models/currencies');
let categories  = require('../models/categories');
let db          = require('../models/dbConfig');
let logger      = require('../models/winstonConfig');

// node native promisify
const query = util.promisify(db.query).bind(db);

// validates time values
function validateHhMm(input) {
    var isValid = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/.test(input);
    return isValid;
  }

module.exports.index = (req, res) => {
  var getEntries = 'SELECT * FROM entries WHERE user_id = ? ORDER BY entry_dt DESC LIMIT 25;';
  var getEntries = `SELECT e.id, pair, e.entry_dt, result, status, strategy, timeframe FROM entries e
    JOIN strategies s on e.strategy_id = s.id
    JOIN pairs p on e.pair_id = p.id
    JOIN timeframes t on e.timeframe_id = t.id
    WHERE e.user_id = ? ORDER BY entry_dt DESC LIMIT 25;`
  db.query(getEntries, req.user.id, (err, results) => {
    if (err) {
      logger.error({
        message: 'ENTRIES (index) could not getEntries',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username);
    }
    res.render("user/journal/entry/index",
      {
        dataList: results,
        options: { year: 'numeric', month: 'long', day: 'numeric' },
        currencies: req.session.assets,
        categories: categories,
      }
    );
  })
}

module.exports.indexInfinite = (req, res) => {
  var getEntries = `SELECT e.id, pair, e.entry_dt, result, status, strategy, timeframe FROM entries e
    JOIN strategies s on e.strategy_id = s.id
    JOIN pairs p on e.pair_id = p.id
    JOIN timeframes t on e.timeframe_id = t.id
    WHERE e.user_id = ? ORDER BY entry_dt DESC LIMIT 25 OFFSET ?;`;
  if (req.body.query) { getEntries = req.body.query + ' OFFSET ?;'}
  db.query(getEntries, [req.user.id, Number(req.body.offset)], (err, results) => {
    if (err) {
      logger.error({
        message: 'ENTRIES (index) could not INFINITE SCROLL getEntries',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
    }
    return res.json({
      dataList: results,
      options: { year: 'numeric', month: 'long', day: 'numeric' }
    });
  })
}

module.exports.filter = (req, res) => {
  var createFilter = ''
  var exitFilter = ''
  if (req.body.create) { createFilter = '&& entry_dt >= ' + req.body.create + ' >= entry_dt' }
  if (req.body.exit) { exitFilter = '&& exit_dt >= ' + req.body.exit + '>= exit_dt' }
  var getEntries = `SELECT *, entries.id AS id FROM entries
    JOIN pairs ON entries.pair_id = pairs.id
    JOIN strategies ON entries.strategy_id = strategies.id
    JOIN timeframes ON entries.timeframe_id = timeframes.id
    WHERE entries.user_id = ? && (${req.body.pairs}) && (${req.body.categories})
      && (${req.body.strategy}) && (${req.body.timeframe})
      && (${req.body.result}) ${createFilter} ${exitFilter}
    ORDER BY ${req.body.sort} ${req.body.order} LIMIT 25`;
  db.query(getEntries, req.user.id, (err, results) => {
    if (err) {
      logger.error({
        message: 'ENTRIES (index) could not FILTER getEntries',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username);
    }
    return res.json({
      dataList: results,
      options: { year: 'numeric', month: 'long', day: 'numeric' },
      query: getEntries
    });
  })
}

module.exports.renderNewForm = (req, res) => {
  if (Object.keys(req.session.assets).length === 0) {
    req.flash('error', res.__('You are not able to access here without any assets. Go to settings to add an asset.'))
    return res.redirect('/' + req.user.username + '/journal/entry');
  }
  var getTas = `SELECT ta.id, pair, created_at FROM tanalysis ta
    JOIN pairs p on ta.pair_id = p.id WHERE ta.user_id = ?;`
  var selectCurrency = 'SELECT currency FROM currencies WHERE id = ?;'
  db.query(getTas, req.user.id, (err, taInfo) => {
    if (err) {
      logger.error({
        message: 'ENTRIES (new) could not getTas',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/entry');
    }
    db.query(selectCurrency, req.user.currency_id, (err, result) => {
      if (err) {
        logger.error({
          message: 'ENTRIES (new) could not selectCurrency',
          endpoint: req.method + ': ' + req.originalUrl,
          programMsg: err
        })
        req.flash('error', res.__('Something went wrong, please try again.'))
        return res.redirect('/' + req.user.username + '/journal/entry');
      }
      res.render("user/journal/entry/new",
        {
          currency: result[0].currency,
          currencies: req.session.assets,
          technicalAnalysis: taInfo,
          options: { year: 'numeric', month: 'long', day: 'numeric' }
        }
      );
    })
  })
}

module.exports.createEntry = async (req, res) => {
  // checks whether the entry contains the required fields
  if (req.body.size == '') {
    req.flash("error", res.__('Position size cannot be blank.'))
    return res.redirect("/" + req.user.username + "/journal/entry/new")
  } else if (req.body.entryPrice == '') {
    req.flash("error", res.__('Entry price cannot be blank.'))
    return res.redirect("/" + req.user.username + "/journal/entry/new")
  } else if (req.body.entryDate == '') {
    req.flash("error", res.__('Entry date cannot be blank.'))
    return res.redirect("/" + req.user.username + "/journal/entry/new")
  }
  // creates an object with the new entry variables
  else {
    var newEntry = {
      user_id: req.user.id,
      pair_id: req.body.pair,
      category: req.body.category,
      size: Number(req.body.size),
      strategy_id: req.body.strategy,
      timeframe_id: req.body.timeframe,
      entry_price: req.body.entryPrice
    }
    // sets the entry date and time of the entry
    if (req.body.entryTime == '') {
      newEntry.entry_dt = req.body.entryDate + ' 00:00:00'
    } else {
      if (validateHhMm(req.body.entryTime)) {
        newEntry.entry_dt = req.body.entryDate + ' ' + req.body.entryTime
      } else {
        req.flash("error", res.__('The entry time has to be typed in military time. For instnace, 14:45.'))
        return res.redirect("/" + req.user.username + "/journal/entry/new")
      }
    }
    // sets the operation direction of the entry
    if (req.body.direction == 1) {
      newEntry.direction = 'long';
    } else if (req.body.direction == -1) {
      newEntry.direction = 'short';
    } else {
      req.flash("error", res.__('Entry direction cannot be blank.'))
      return res.redirect("/" + req.user.username + "/journal/entry/new")
    }
    // sets the stop loss of the entry
    if (req.body.stopLoss != '') {
      newEntry.stop_loss = req.body.stopLoss;
    }
    // sets the take profit of the entry
    if (req.body.takeProfit != '') {
      newEntry.take_profit = req.body.takeProfit;
    }
    // connects a technical analysis to the entry (if any)
    if (req.body.selectTa == 'select') {
      if (req.body.entryTa != '') {
        newEntry.ta_id = req.body.entryTa;
      } else {
        req.flash("error", res.__('The entry was not connected to any TA. Please, try again.'))
        return res.redirect("/" + req.user.username + "/journal/entry/new")
      }
    }
    // sets the comment field of the entry
    if (req.body.comment != '') {
      newEntry.comment = req.body.comment;
    }
    // sets closure of the entry
    if (req.body.status == 1) {
      if (req.body.exitDate == '') {
        newEntry.exit_dt = new Date();
      } else {
        newEntry.exit_dt = req.body.exitDate + ' 00:00:00'
      }
      if (req.body.closePrice == '') {
        req.flash("error", res.__('Exit price cannot be blank for closed entries.'))
        return res.redirect("/" + req.user.username + "/journal/entry/new")
      } else {
        newEntry.exit_price = req.body.closePrice;
      }
      newEntry.status = req.body.status;
      newEntry.fees = 0;
      newEntry.result = req.body.result;
      // sets the fees of the entry
      if (req.body.fees != '') {
        newEntry.fees = req.body.fees;
      }
      // sets the profits of the entry
      if (req.body.profits != '') {
        newEntry.profits = req.body.profits;
      } else {
        var getTradingPair = await query('SELECT pair FROM pairs WHERE id = ?', req.body.pair)
        if (req.session.assets[getTradingPair[0].pair].rate) {
          var quote = getTradingPair[0].pair.split('/')[1];
          var getBase = await query('SELECT currency FROM currencies WHERE id = ?', req.user.currency_id)
          await fetch(`https://api.exchangeratesapi.io/latest?base=${quote}`)
          .then(res => res.json())
          .then((data) => {
            switch (req.session.assets[getTradingPair[0].pair].category) {
              case 'Forex':
                var lotSize = (quote === 'JPY') ? 1000 : 100000;
                var entryAmount;
                if (req.body.direction == 1) {
                  entryAmount = Math.round(((req.body.closePrice - req.body.entryPrice) * Number(req.body.size) * lotSize + Number.EPSILON) * 100) / 100;
                } else {
                  entryAmount = Math.round(((req.body.entryPrice - req.body.closePrice) * Number(req.body.size) * lotSize + Number.EPSILON) * 100) / 100;
                }
                newEntry.profits = data["rates"][getBase[0].currency] * entryAmount;
                break;
              case 'Crypto':
                var base = getTradingPair[0].pair.split('/')[1];
                var entryAmount
                if (req.body.direction == 1) {
                  entryAmount = Math.round(((req.body.closePrice - req.body.entryPrice) * Number(req.body.size) + Number.EPSILON) * 100) / 100;
                } else {
                  entryAmount = Math.round(((req.body.entryPrice - req.body.closePrice) * Number(req.body.size) + Number.EPSILON) * 100) / 100;
                }
                newEntry.profits = data["rates"][getBase[0].currency] * entryAmount
                break;
            }
          })
          .catch((err) => {
            if (err) {
              logger.error({
                message: 'ENTRIES (new) could not make the API call',
                endpoint: req.method + ': ' + req.originalUrl,
                programMsg: err
              })
              req.flash('error', res.__('Something went wrong, please try again later.'))
              return res.redirect('/' + req.user.username + "/journal/entry");
            }
          })
        } else {
          req.flash('error', res.__('We don\'t have the rate for this asset. Please, introduce your profits.'))
          return res.redirect('/' + req.user.username + "/journal/entry/new");
        }
      }
    }
    // saves the entry to the DB
    db.query('INSERT INTO entries SET ?', newEntry, (err, response) => {
      if (err) {
        logger.error({
          message: 'ENTRIES (new) could not create the new entry',
          endpoint: req.method + ': ' + req.originalUrl,
          programMsg: err
        })
        req.flash('error', res.__('Something went wrong, please try again later.'))
        return res.redirect('/' + req.user.username + "/journal/entry");
      }
      req.flash('success', res.__('The entry was created successfully.'))
      res.redirect("/" + req.user.username + "/journal/entry");
    })
  }
}

module.exports.showEntry = (req, res) => {
  var getEntry = `SELECT *, e.id AS id, e.category AS category, DATE_FORMAT(entry_dt, '%H:%i') AS created_time FROM entries e
    JOIN strategies s ON e.strategy_id = s.id
    JOIN pairs p ON e.pair_id = p.id
    JOIN timeframes t on e.timeframe_id = t.id
    WHERE e.id = ?;`
  var getCurrency = 'SELECT currency FROM currencies WHERE id = ?;';
  db.query(getEntry, req.params.id, (err, entryInfo) => {
    if (err) {
      logger.error({
        message: 'ENTRIES (show) could not getEntry',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again later.'))
      return res.redirect('/' + req.user.username + "/journal/entry");
    }
    if (!entryInfo.length) {
      return res.redirect('/' + req.user.username + "/journal/entry");
    }
    db.query(getCurrency, req.user.currency_id, (err, result) => {
      if (err) {
        logger.error({
          message: 'ENTRIES (show) could not getCurrency',
          endpoint: req.method + ': ' + req.originalUrl,
          programMsg: err
        })
        req.flash('error', res.__('Something went wrong, please try again later.'))
        return res.redirect('/' + req.user.username + "/journal/entry");
      }
      res.render("user/journal/entry/show",
        {
          currency: result[0].currency,
          currencies: pairs,
          entryInfo: entryInfo[0],
          options: { year: 'numeric', month: 'long', day: 'numeric' }
        }
      );
    })
  })
}

module.exports.renderEditForm = (req, res) => {
  // inserts DB queries to a variable
  var getEntry = `SELECT *, e.id AS id, e.category AS category, DATE_FORMAT(entry_dt, '%Y-%m-%d') AS open_format,
      DATE_FORMAT(entry_dt, '%Y-%m-%d') AS close_format FROM entries e
    JOIN strategies s ON e.strategy_id = s.id
    JOIN pairs p ON e.pair_id = p.id
    JOIN timeframes t on e.timeframe_id = t.id
    WHERE e.id = ?;`
  var getTas = `SELECT ta.id, pair, created_at FROM tanalysis ta
    JOIN pairs p on ta.pair_id = p.id WHERE ta.user_id = ?;`
  var selectCurrency = 'SELECT currency FROM currencies WHERE id = ?;'
  db.query(getEntry, req.params.id, (err, entryInfo) => {
    if (err) {
      logger.error({
        message: 'ENTRIES (edit) could not getEntry',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again later.'))
      return res.redirect('/' + req.user.username + "/journal/entry");
    }
    // gets the technical analysis from the user
    db.query(getTas, req.user.id, (err, taInfo) => {
      if (err) {
        logger.error({
          message: 'ENTRIES (edit) could not getTas',
          endpoint: req.method + ': ' + req.originalUrl,
          programMsg: err
        })
        req.flash('error', res.__('Something went wrong, please try again later.'))
        return res.redirect('/' + req.user.username + "/journal/entry");
      }
      db.query(selectCurrency, req.user.currency_id, (err, result) => {
        if (err) {
          logger.error({
            message: 'ENTRIES (edit) could not selectCurrency',
            endpoint: req.method + ': ' + req.originalUrl,
            programMsg: err
          })
          req.flash('error', res.__('Something went wrong, please try again later.'))
          return res.redirect('/' + req.user.username + "/journal/entry");
        }
        res.render("user/journal/entry/edit",
          {
            currency: result[0].currency,
            currencies: req.session.assets,
            entryInfo: entryInfo[0],
            technicalAnalysis: taInfo,
            options: { year: 'numeric', month: 'long', day: 'numeric' }
          }
        );
      })
    })
  })
}

module.exports.updateEntry = async (req, res) => {
  // checks whether the entry contains the required fields
  if (req.body.size == '') {
    req.flash("error", res.__('Position size cannot be blank.'))
    res.redirect("/" + req.user.username + "/journal/entry/" + req.params.id + "/edit")
  } else if (req.body.entryPrice == '') {
    req.flash("error", res.__('Entry price cannot be blank.'))
    res.redirect("/" + req.user.username + "/journal/entry/" + req.params.id + "/edit")
  } else if (req.body.entryDate == '') {
    req.flash("error", res.__('Entry date cannot be blank.'))
    res.redirect("/" + req.user.username + "/journal/entry/" + req.params.id + "/edit")
  }
  // creates an object with the new entry variables
  else {
    var newEntry = {
      user_id: req.user.id,
      pair_id: req.body.pair,
      category: req.body.category,
      size: Number(req.body.size),
      strategy_id: req.body.strategy,
      timeframe_id: req.body.timeframe,
      entry_price: req.body.entryPrice,
    }
    // sets the entry date and time of the entry
    if (req.body.entryTime == '') {
      newEntry.entry_dt = req.body.entryDate + ' 00:00:00'
    } else {
      if (validateHhMm(req.body.entryTime)) {
        newEntry.entry_dt = req.body.entryDate + ' ' + req.body.entryTime
      } else {
        req.flash("error", res.__('The entry time has to be typed in military time. For instnace, 14:45.'))
        return res.redirect("/" + req.user.username + "/journal/entry/" + req.params.id + "/edit")
      }
    }
    // sets the operation direction of the entry
    if (req.body.direction == 1) {
      newEntry.direction = 'long';
    } else if (req.body.direction == -1) {
      newEntry.direction = 'short';
    } else {
      req.flash("error", res.__('Entry direction cannot be blank.'))
      res.redirect("/" + req.user.username + "/journal/entry/" + req.params.id + "/edit")
    }
    // sets the stop loss of the entry
    if (req.body.stopLoss != '') {
      newEntry.stop_loss = req.body.stopLoss;
    }
    // sets the take profit of the entry
    if (req.body.takeProfit != '') {
      newEntry.take_profit = req.body.takeProfit;
    }
    // connects a technical analysis to the entry (if any)
    if (req.body.selectTa == 'select') {
      if (req.body.entryTa != '') {
        newEntry.ta_id = req.body.entryTa;
      } else {
        req.flash("error", res.__('The entry was not connected to any TA. Please, try again.'))
        return res.redirect("/" + req.user.username + "/journal/entry/" + req.params.id + "/edit")
      }
    }
    // sets the comment field of the entry
    if (req.body.comment != '') {
      newEntry.comment = req.body.comment;
    }
    // sets closure of the entry
    if (req.body.status == 1) {
      if (req.body.exitDate == '') {
        newEntry.exit_dt = new Date();
      } else {
        newEntry.exit_dt = req.body.exitDate + ' 00:00:00'
      }
      if (req.body.closePrice == '') {
        req.flash("error", res.__('Exit price cannot be blank for closed entries.'))
        res.redirect("/" + req.user.username + "/journal/entry/" + req.params.id + "/edit")
      } else {
        newEntry.exit_price = req.body.closePrice;
      }
      newEntry.status = req.body.status;
      newEntry.fees = 0;
      newEntry.result = req.body.result;
      // sets the fees of the entry
      if (req.body.fees != '') {
        newEntry.fees = req.body.fees;
      }
      // sets the profits of the entry
      if (req.body.profits != '') {
        newEntry.profits = req.body.profits;
      } else {
        var getTradingPair = await query('SELECT pair FROM pairs WHERE id = ?', req.body.pair)
        if (req.session.assets[getTradingPair[0].pair].rate) {
          var quote = getTradingPair[0].pair.split('/')[1];
          var getBase = await query('SELECT currency FROM currencies WHERE id = ?', req.user.currency_id)
          await fetch(`https://api.exchangeratesapi.io/latest?base=${quote}`)
          .then(res => res.json())
          .then((data) => {
            switch (req.session.assets[getTradingPair[0].pair].category) {
              case 'Forex':
                var lotSize = (quote === 'JPY') ? 1000 : 100000;
                var entryAmount;
                if (req.body.direction == 1) {
                  entryAmount = Math.round(((req.body.closePrice - req.body.entryPrice) * Number(req.body.size) * lotSize + Number.EPSILON) * 100) / 100;
                } else {
                  entryAmount = Math.round(((req.body.entryPrice - req.body.closePrice) * Number(req.body.size) * lotSize + Number.EPSILON) * 100) / 100;
                }
                newEntry.profits = data["rates"][getBase[0].currency] * entryAmount;
                break;
              case 'Crypto':
                var base = getTradingPair[0].pair.split('/')[1];
                var entryAmount
                if (req.body.direction == 1) {
                  entryAmount = Math.round(((req.body.closePrice - req.body.entryPrice) * Number(req.body.size) + Number.EPSILON) * 100) / 100;
                } else {
                  entryAmount = Math.round(((req.body.entryPrice - req.body.closePrice) * Number(req.body.size) + Number.EPSILON) * 100) / 100;
                }
                newEntry.profits = data["rates"][getBase[0].currency] * entryAmount
                break;
            }
          })
          .catch((err) => {
            if (err) {
              logger.error({
                message: 'ENTRIES (edit) could not make the API call',
                endpoint: req.method + ': ' + req.originalUrl,
                programMsg: err
              })
              req.flash('error', res.__('Something went wrong, please try again later.'))
              return res.redirect('/' + req.user.username + "/journal/entry");
            }
          })
        } else {
          req.flash('error', res.__('We don\'t have the rate for this asset. Please, introduce your profits.'))
          return res.redirect('/' + req.user.username + "/journal/entry/" + req.params.id + "/edit");
        }
      }
    } else {
      newEntry.status = 0;
      newEntry.exit_dt = null;
      newEntry.exit_price = null;
      newEntry.profits = null;
      newEntry.fees = null;
      newEntry.result = null;
    }
    // updated the entry on the DB
    db.query('UPDATE entries SET ? WHERE id = ?', [newEntry, req.params.id], (err, response) => {
      if (err) {
        logger.error({
          message: 'ENTRIES (edit) could not edit entry',
          endpoint: req.method + ': ' + req.originalUrl,
          programMsg: err
        })
        req.flash('error', res.__('Something went wrong, please try again later.'))
        return res.redirect('/' + req.user.username + "/journal/entry");
      }
      req.flash('success', res.__('The entry was updated successfully.'))
      res.redirect("/" + req.user.username + "/journal/entry");
    })
  }
}

module.exports.deleteEntry = (req, res) => {
  var deleteEntry = 'DELETE FROM entries WHERE id = ?'
  db.query(deleteEntry, req.params.id, (err) => {
    if (err) {
      logger.error({
        message: 'ENTRIES (delete) could not deleteEntry',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again later.'))
      return res.redirect('/' + req.user.username + "/journal/entry");
    }
    res.redirect("/" + req.user.username + "/journal/entry");
  })
}
