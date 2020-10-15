let express = require('express');
let fetch = require('node-fetch');
let router = express.Router({mergeParams: true});
let pairs = require('../models/pairs');
let currencies = require('../models/currencies');
let categories = require('../models/categoriesPairs');
let middleware = require('../middleware')
let db = require('../models/dbConfig');

// INDEX ENTRIES ROUTE
router.get("/", middleware.isLoggedIn, (req, res) => {
  var getAllEntries = 'SELECT *, DATE_FORMAT(entry_dt, \'%d ' + res.__('of') + ' %M %Y\') AS date FROM entries ORDER BY entry_dt DESC;'
  var dataList = []
  db.query(getAllEntries, (err, results) => {
    if (err) {
      req.flash('error', 'Something went wrong, please try again.')
      return res.redirect('/' + req.user.username);
    }
    results.forEach((result) => {
      dataList.push({
        id: result.id,
        pair: pairs[Number(result.pair_id) - 1],
        date: result.date,
        result: result.result,
        status: result.status,
        strategy: userStrategies[userIdStrategies.findIndex(strategy => strategy == result.strategy_id)],
        timeframe: timeframes[Number(result.timeframe_id) - 1]
      })
    })
    res.render("user/journal/entry/index", {dataList: dataList});
  })
})

// NEW ENTRY ROUTE
router.get("/new", middleware.isLoggedIn, (req, res) => {
  var selectTas = 'SELECT id, pair_id, DATE_FORMAT(created_at, \'%d de %M %Y\') AS created_long FROM tanalysis WHERE user_id = ?;'
  var allTas = {
    id: [],
    title: []
  }
  db.query(selectTas, req.user.id, (err, results) => {
    if (err) throw err;
    // stores each technical analysis to an object array
    results.forEach((ta) => {
      allTas.id.push(ta.id);
      allTas.title.push(pairs[Number(ta.pair_id - 1)] + ', ' + ta.created_long)
    })
    res.render("user/journal/entry/new",
      {
        currencies:pairs,
        strategies:userStrategies,
        timeframes:timeframes,
        tas:allTas
      }
    );
  })
})

// NEW ENTRY LOGIC
router.post("/", middleware.isLoggedIn, (req, res) => {
  // checks whether the entry contains the required fields
  if (req.body.size == '') {
    req.flash("error", "Position size cannot be blank.")
    return res.redirect("/" + req.user.username + "/journal/entry/new")
  } else if (req.body.entryPrice == '') {
    req.flash("error", "Entry price cannot be blank.")
    return res.redirect("/" + req.user.username + "/journal/entry/new")
  } else if (req.body.entryDate == '') {
    req.flash("error", "Entry date cannot be blank.")
    return res.redirect("/" + req.user.username + "/journal/entry/new")
  }
  // creates an object with the new entry variables
  else {
    var newEntry = {
      user_id: req.user.id,
      pair_id: req.body.pair,
      category: req.body.category,
      size: Number(req.body.size),
      strategy_id: userIdStrategies[req.body.strategy],
      timeframe_id: req.body.timeframe,
      entry_price: req.body.entryPrice
    }
    // sets the entry date and time of the entry
    if (req.body.entryTime == '') {
      newEntry.entry_dt = req.body.entryDate + ' 00:00:00'
    } else {
      // NOTE: the entry time probably needs some formating
      // FIXME: create MIDDLEWARE that checks the time input
      newEntry.entry_dt = req.body.entryDate + ' ' + req.body.entryTime
    }
    // sets the operation direction of the entry
    if (req.body.direction == 1) {
      newEntry.direction = 'long';
    } else if (req.body.direction == -1) {
      newEntry.direction = 'short';
    } else {
      req.flash("error", "Entry direction cannot be blank.")
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
        req.flash("error", "The entry was not connected to any TA. Please, try again.")
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
        req.flash("error", "Exit price cannot be blank for closed entries.")
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
        newEntry.pofits = req.body.profits;
      } else {
        var base = currencies[req.user.currency_id - 1]
        var trade = pairs[Number(req.body.pair)].substring(4,7);
        fetch(`https://api.exchangeratesapi.io/latest?base=${trade}`)
        .then(res => res.json())
        .then((data) => {
          var entryAmount;
          if (req.body.direction == 1) {
            entryAmount = Math.round(((req.body.closePrice - req.body.entryPrice) * Number(req.body.size) * 100000 + Number.EPSILON) * 100) / 100;
          } else {
            entryAmount = Math.round(((req.body.entryPrice - req.body.closePrice) * Number(req.body.size) * 100000 + Number.EPSILON) * 100) / 100;
          }
          newEntry.profits = data["rates"][base] * entryAmount;
        })
        .catch((err) => {
          if (err) {
            // COMBAK: log error
            req.flash('error', 'Something went wrong, please try again later.')
            return res.redirect('/' + req.user.username + "/journal/entry");
          }
        })
      }
    }
    // saves the entry to the DB
    db.query('INSERT INTO entries SET ?', newEntry, (err, response) => {
      if (err) {
        // COMBAK: log error
        req.flash('error', 'Something went wrong, please try again later.')
        return res.redirect('/' + req.user.username + "/journal/entry");
      }
      res.redirect("/" + req.user.username + "/journal/entry");
    })
  }
})

// SHOW ENTRY ROUTE
router.get("/:id", middleware.isLoggedIn, (req, res) => {
  // inserts DB queries to a variable
  var getEntry = 'SELECT *, DATE_FORMAT(entry_dt, \'%d de %M %Y\') AS created_long, DATE_FORMAT(entry_dt, \'%Y-%m-%d\') AS created_short, DATE_FORMAT(entry_dt, \'%H:%i\') AS created_time, DATE_FORMAT(exit_dt, \'%Y-%m-%d\') AS closed_short FROM entries WHERE id = ?;'
  // object where the entry information will be stored
  var entryInfo = { }
  db.query(getEntry, req.params.id, (err, results) => {
    if (err) throw err;
    // mandatory entry fields
    entryInfo.id = results[0].id;
    entryInfo.title = pairs[Number(results[0].pair_id) - 1] + ', ' + results[0].created_long;
    entryInfo.pair = Number(results[0].pair_id) - 1;
    entryInfo.category = results[0].category;
    entryInfo.size = results[0].size;
    entryInfo.strategy = userIdStrategies.findIndex(strategy => strategy == results[0].strategy_id);
    entryInfo.timeframe = Number(results[0].timeframe_id) - 1;
    entryInfo.entryDate = results[0].created_short;
    entryInfo.entryTime = results[0].created_time;
    entryInfo.direction = results[0].direction;
    entryInfo.entryPrice = results[0].entry_price;
    // optional mandatory fields
    // checks the entry's stop loss value
    if (results[0].stop_loss != null) {
      entryInfo.stopLoss = results[0].stop_loss;
    }
    // checks the entry's take profit value
    if (results[0].take_profit != null) {
      entryInfo.takeProfit = results[0].take_profit;
    }
    // checks the entry's commnet value
    if (results[0].comment != null) {
      entryInfo.comment = results[0].comment;
    }
    // checks the status of the entry (open or closed)
    if (results[0].status == 1) {
      entryInfo.exitDate = results[0].closed_short;
      entryInfo.exitPrice = results[0].exit_price;
      entryInfo.result = results[0].result;
    } else {
      entryInfo.status = 0;
    }
    // checks the entry's technical analysis value
    if (results[0].ta_id != null) {
      entryInfo.taId = results[0].ta_id;
    }
    res.render("user/journal/entry/show",
      {
        currencies:pairs,
        categories:categories,
        strategies:userStrategies,
        timeframes:timeframes,
        entry:entryInfo
      }
    );
  })
})

// UPDATE ENTRY ROUTE
router.get("/:id/edit", middleware.isLoggedIn, (req, res) => {
  // inserts DB queries to a variable
  var getEntry = 'SELECT *, DATE_FORMAT(entry_dt, \'%d de %M %Y\') AS created_long, DATE_FORMAT(entry_dt, \'%Y-%m-%d\') AS created_short, DATE_FORMAT(entry_dt, \'%H:%i\') AS created_time, DATE_FORMAT(exit_dt, \'%Y-%m-%d\') AS closed_short FROM entries WHERE id = ?;'
  var selectTas = 'SELECT id, pair_id, DATE_FORMAT(created_at, \'%d de %M %Y\') AS created_long FROM tanalysis WHERE user_id = ?;'
  // object where the entry information will be stored
  var entryInfo = { }
  // object where the existing technical analysis will be stored
  var allTas = {
    id: [],
    title: [],
  }
  db.query(getEntry, req.params.id, (err, results) => {
    if (err) throw err;
    // mandatory entry fields
    entryInfo.id = results[0].id;
    entryInfo.title = pairs[Number(results[0].pair_id) - 1] + ', ' + results[0].created_long;
    entryInfo.pair = Number(results[0].pair_id) - 1;
    entryInfo.category = results[0].category;
    entryInfo.size = results[0].size;
    entryInfo.strategy = userIdStrategies.findIndex(strategy => strategy == results[0].strategy_id);
    entryInfo.timeframe = Number(results[0].timeframe_id) - 1;
    entryInfo.entryDate = results[0].created_short;
    entryInfo.entryTime = results[0].created_time;
    entryInfo.direction = results[0].direction;
    entryInfo.entryPrice = results[0].entry_price;
    // optional mandatory fields
    // checks the entry's stop loss value
    if (results[0].stop_loss != null) {
      entryInfo.stopLoss = results[0].stop_loss;
    }
    // checks the entry's take profit value
    if (results[0].take_profit != null) {
      entryInfo.takeProfit = results[0].take_profit;
    }
    // checks the entry's commnet value
    if (results[0].comment != null) {
      entryInfo.comment = results[0].comment;
    }
    // checks the status of the entry (open or closed)
    if (results[0].status == 1) {
      entryInfo.exitDate = results[0].closed_short;
      entryInfo.exitPrice = results[0].exit_price;
      entryInfo.result = results[0].result;
    } else {
      entryInfo.status = 0;
    }
    // checks the entry's technical analysis value
    if (results[0].ta_id != null) {
      entryInfo.taId = results[0].ta_id;
    }
    // gets the technical analysis from the user
    db.query(selectTas, req.user.id, (err, results) => {
      if (err) throw err;
      // stores each technical analysis to an object array
      results.forEach((ta) => {
        allTas.id.push(ta.id);
        allTas.title.push(pairs[Number(ta.pair_id - 1)] + ', ' + ta.created_long)
      })
      res.render("user/journal/entry/edit",
        {
          currencies:pairs,
          categories:categories,
          strategies:userStrategies,
          timeframes:timeframes,
          entry:entryInfo,
          tas:allTas
        }
      );
    })
  })
})

// UPDATE ENTRY LOGIC
router.put("/:id", middleware.isLoggedIn, (req, res) => {
  console.log('Body: ');
  console.log(req.body);
  // checks whether the entry contains the required fields
  if (req.body.size == '') {
    req.flash("error", "Position size cannot be blank.")
    res.redirect("/" + req.user.username + "/journal/entry/new")
  } else if (req.body.entryPrice == '') {
    req.flash("error", "Entry price cannot be blank.")
    res.redirect("/" + req.user.username + "/journal/entry/new")
  } else if (req.body.entryDate == '') {
    req.flash("error", "Entry date cannot be blank.")
    res.redirect("/" + req.user.username + "/journal/entry/new")
  }
  // creates an object with the new entry variables
  else {
    var newEntry = {
      user_id: req.user.id,
      pair_id: Number(req.body.pair) + 1,
      category: req.body.category,
      size: Number(req.body.size),
      strategy_id: userIdStrategies[req.body.strategy],
      timeframe_id: Number(req.body.timeframe) + 1,
      entry_price: req.body.entryPrice,
    }
    // sets the entry date and time of the entry
    if (req.body.entryTime == '') {
      newEntry.entry_dt = req.body.entryDate + ' 00:00:00'
    } else {
      // NOTE: the entry time probably needs some formating
      // FIXME: create MIDDLEWARE that checks the time input
      newEntry.entry_dt = req.body.entryDate + ' ' + req.body.entryTime
    }
    // sets the operation direction of the entry
    if (req.body.direction == 1) {
      newEntry.direction = 'long';
    } else if (req.body.direction == -1) {
      newEntry.direction = 'short';
    } else {
      req.flash("error", "Entry direction cannot be blank.")
      res.redirect("/" + req.user.username + "/journal/entry/new")
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
      newEntry.ta_id = req.body.entryTa;
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
        req.flash("error", "Exit price cannot be blank for closed entries.")
        res.redirect("/" + req.user.username + "/journal/entry/new")
      } else {
        newEntry.exit_price = req.body.closePrice;
      }
      newEntry.status = req.body.status;
      newEntry.result = req.body.result;
    }
    // updated the entry on the DB
    db.query('UPDATE entries SET ? WHERE id = ?', [newEntry, req.params.id], (err, response) => {
      if (err) throw err;
      // prints the # of rows that were changed (should be one)
      // console.log(response.changedRows);
      res.redirect("/" + req.user.username + "/journal/entry");
    })
  }
})

// DELETE ENTRY ROUTE
router.delete("/:id", middleware.isLoggedIn, (req, res) => {
  var deleteEntry = 'DELETE FROM entries WHERE id = ?'
  // deletes the technical analysis from the DB
  db.query(deleteEntry, req.params.id, (err) => {
    if (err) throw err;
    res.redirect("/" + req.user.username + "/journal");
  })
})

module.exports = router;
