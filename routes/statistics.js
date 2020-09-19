var express = require('express');
const util = require('util');
var router = express.Router({mergeParams: true});
let pairs = require("../models/pairs");
let timeframes = require("../models/timeframes");
let categories = require("../models/categoriesPairs");
let middleware = require('../middleware');
let connection = require('../models/connectDB');
// node native promisify
const query = util.promisify(connection.query).bind(connection);

// sorts the entry quantity to preview the statistics showcase
function getMax7(ar) {
  if (ar.length < 7) return ar;
  var max = [[ar[0],0],[ar[1],1],[ar[2],2],[ar[3],3],[ar[4],4],[ar[5],5],[ar[6],6]],
      i,j;
  for (i = 7;i<ar.length;i++){
      for (j = 0;j<max.length;j++){
          if (ar[i] > max[j][0]){
              max[j] = [ar[i],i];
              if (j<2){
                  max.sort(function(a,b) { return a[0]-b[0]; });
              }
             break;
          }
      }
  }
  return max;
}

// ACCOUNT PROFITS
router.get("/profits/:period", middleware.isLoggedIn, (req, res) => {
  var amount = 0;
  var percent = 0;
  (async () => {
    try {
      switch (req.params.period) {
        case 'today':
          var getEntries = await query('SELECT profits, fees FROM entries WHERE entry_dt > CURDATE() AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cweek':
          var getEntries = await query('SELECT profits, fees FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE(), 1) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lweek':
          var getEntries = await query('SELECT profits, fees FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cmonth':
          var getEntries = await query('SELECT profits, fees FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND MONTH(entry_dt) = MONTH(CURDATE()) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lmonth':
          var getEntries = await query('SELECT profits, fees FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(entry_dt) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cquarter':
          var getEntries = await query('SELECT profits, fees FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND QUARTER(entry_dt) = QUARTER(CURDATE()) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lquarter':
          var getEntries = await query('SELECT profits, fees FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 QUARTER) AND QUARTER(entry_dt) = QUARTER(CURDATE() - INTERVAL 1 QUARTER) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'all':
          var getEntries = await query('SELECT profits, fees FROM entries WHERE status = 1 AND user_id = ?;', req.user.id);
          break;
      }
      getEntries.forEach((entry) => {
        var entryPercent = Math.round((((entry.profits - entry.fees) / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
        amount += (entry.profits - entry.fees);
        percent += entryPercent;
      })
    } catch (e) {
      throw e;
    } finally {
      res.json({
        amount: amount,
        percent: percent
      })
    }
  })()
})

// ACCOUNT CUSTOM PROFITS
router.get("/profits/custom/:from/:to", middleware.isLoggedIn, (req, res) => {
  var amount = 0;
  var percent = 0;
  (async () => {
    try {
      var getEntries = await query('SELECT profits, fees FROM entries WHERE status = 1 AND user_id = ? AND entry_dt > ? AND entry_dt < ?;', [req.user.id, req.params.from, req.params.to]);
      getEntries.forEach((entry) => {
        var entryPercent = Math.round((((entry.profits - entry.fees) / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
        amount += (entry.profits - entry.fees);
        percent += entryPercent;
      })
    } catch (e) {
      throw e;
    } finally {
      res.json({
        amount: amount,
        percent: percent
      })
    }
  })()
})

// ACCOUNT ENTRIES - WIN & LOSS & BE
router.get("/entries/:period", middleware.isLoggedIn, (req, res) => {
  var win = 0;
  var loss = 0;
  var be = 0;
  (async () => {
    try {
      switch (req.params.period) {
        case 'today':
          var getEntries = await query('SELECT result FROM entries WHERE entry_dt > CURDATE() AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cweek':
          var getEntries = await query('SELECT result FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE(), 1) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lweek':
          var getEntries = await query('SELECT result FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cmonth':
          var getEntries = await query('SELECT result FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND MONTH(entry_dt) = MONTH(CURDATE()) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lmonth':
          var getEntries = await query('SELECT result FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(entry_dt) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cquarter':
          var getEntries = await query('SELECT result FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND QUARTER(entry_dt) = QUARTER(CURDATE()) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lquarter':
          var getEntries = await query('SELECT result FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 QUARTER) AND QUARTER(entry_dt) = QUARTER(CURDATE() - INTERVAL 1 QUARTER) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'all':
          var getEntries = await query('SELECT result FROM entries WHERE status = 1 AND user_id = ?;', req.user.id);
          break;
      }
      getEntries.forEach((entry) => {
        switch (entry.result) {
          case 'win':
            win += 1;
            break;
          case 'loss':
            loss += 1;
            break;
          case 'be':
            be += 1
            break;
        }
      })
    } catch (e) {
      throw e;
    } finally {
      res.json({
        win: win,
        loss: loss,
        be: be
      })
    }
  })()
})

// ACCOUNT CUSTOM ENTRIES - WIN & LOSS & BE
router.get("/entries/custom/:from/:to", middleware.isLoggedIn, (req, res) => {
  var win = 0;
  var loss = 0;
  var be = 0;
  (async () => {
    try {
      var getEntries = await query('SELECT result FROM entries WHERE status = 1 AND user_id = ? AND entry_dt > ? AND entry_dt < ?;', [req.user.id, req.params.from, req.params.to]);
      getEntries.forEach((entry) => {
        switch (entry.result) {
          case 'win':
            win += 1;
            break;
          case 'loss':
            loss += 1;
            break;
          case 'be':
            be += 1
            break;
        }
      })
    } catch (e) {
      throw e;
    } finally {
      res.json({
        win: win,
        loss: loss,
        be: be
      })
    }
  })()
})

// BEST BEST ASSET
router.get("/best-asset/:period", middleware.isLoggedIn, (req, res) => {
  var amount = 0;
  var percent = 0;
  var pair = 'N/A';
  (async () => {
    try {
      switch (req.params.period) {
        case 'today':
          var getEntries = await query('SELECT profits, fees, pair_id FROM entries WHERE entry_dt > CURDATE() AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cweek':
          var getEntries = await query('SELECT profits, fees, pair_id FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE(), 1) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lweek':
          var getEntries = await query('SELECT profits, fees, pair_id FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cmonth':
          var getEntries = await query('SELECT profits, fees, pair_id FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND MONTH(entry_dt) = MONTH(CURDATE()) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lmonth':
          var getEntries = await query('SELECT profits, fees, pair_id FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(entry_dt) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cquarter':
          var getEntries = await query('SELECT profits, fees, pair_id FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND QUARTER(entry_dt) = QUARTER(CURDATE()) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lquarter':
          var getEntries = await query('SELECT profits, fees, pair_id FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 QUARTER) AND QUARTER(entry_dt) = QUARTER(CURDATE() - INTERVAL 1 QUARTER) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'all':
          var getEntries = await query('SELECT profits, fees, pair_id FROM entries WHERE status = 1 AND user_id = ?;', req.user.id);
          break;
      }
      var pairsAmount = Array(pairs.length).fill(0);
      var pairsPercent = Array(pairs.length).fill(0);
      getEntries.forEach((entry) => {
        var entryPercent = Math.round((((entry.profits - entry.fees) / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
        pairsAmount[Number(entry.pair_id) - 1] += (entry.profits - entry.fees);
        pairsPercent[Number(entry.pair_id) - 1] += entryPercent;
      })
      amount = Math.max(...pairsAmount);
      percent = pairsPercent[pairsAmount.indexOf(amount)];
      if (amount > 0) {
        pair = pairs[pairsAmount.indexOf(amount)]
      }
    } catch (e) {
      throw e;
    } finally {
      res.json({
        amount: amount,
        percent: percent,
        pair: pair
      })
    }
  })()
})

// BEST CUSTOM BEST ASSET
router.get("/best-asset/custom/:from/:to", middleware.isLoggedIn, (req, res) => {
  var amount = 0;
  var percent = 0;
  var pair = 'N/A';
  (async () => {
    try {
      var getEntries = await query('SELECT profits, fees, pair_id FROM entries WHERE status = 1 AND user_id = ? AND entry_dt > ? AND entry_dt < ?;', [req.user.id, req.params.from, req.params.to]);
      var pairsAmount = Array(pairs.length).fill(0);
      var pairsPercent = Array(pairs.length).fill(0);
      getEntries.forEach((entry) => {
        var entryPercent = Math.round((((entry.profits - entry.fees) / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
        pairsAmount[Number(entry.pair_id) - 1] += (entry.profits - entry.fees);
        pairsPercent[Number(entry.pair_id) - 1] += entryPercent;
      })
      amount = Math.max(...pairsAmount);
      percent = pairsPercent[pairsAmount.indexOf(amount)];
      if (amount > 0) {
        pair = pairs[pairsAmount.indexOf(amount)]
      }
    } catch (e) {
      throw e;
    } finally {
      res.json({
        amount: amount,
        percent: percent,
        pair: pair
      })
    }
  })()
})

// ACCOUNT STRATEGIES
router.get("/strategies/:period", middleware.isLoggedIn, (req, res) => {
  // creates an object to store the strategy stats
  var strategyStats = { }
  userIdStrategies.forEach((id, i) => {
    strategyStats[Number(id, i)] = {
      name: userStrategies[i],
      quantity: 0,
      win: 0,
      loss: 0,
      be: 0,
      percent: 0
    }
  });
  (async () => {
    try {
      switch (req.params.period) {
        case 'today':
          var getEntries = await query('SELECT strategy_id, result, profits, fees FROM entries WHERE entry_dt > CURDATE() AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cweek':
          var getEntries = await query('SELECT strategy_id, result, profits, fees FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE(), 1) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lweek':
          var getEntries = await query('SELECT strategy_id, result, profits, fees FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cmonth':
          var getEntries = await query('SELECT strategy_id, result, profits, fees FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND MONTH(entry_dt) = MONTH(CURDATE()) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lmonth':
          var getEntries = await query('SELECT strategy_id, result, profits, fees FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(entry_dt) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cquarter':
          var getEntries = await query('SELECT strategy_id, result, profits, fees FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND QUARTER(entry_dt) = QUARTER(CURDATE()) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lquarter':
          var getEntries = await query('SELECT strategy_id, result, profits, fees FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 QUARTER) AND QUARTER(entry_dt) = QUARTER(CURDATE() - INTERVAL 1 QUARTER) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'all':
          var getEntries = await query('SELECT strategy_id, result, profits, fees FROM entries WHERE status = 1 AND user_id = ?;', req.user.id);
          break;
      }
      getEntries.forEach((entry) => {
        strategyStats[entry.strategy_id].quantity++;
        var entryPercent = Math.round((((entry.profits - entry.fees) / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
        switch (entry.result) {
          case 'win':
            strategyStats[entry.strategy_id].win++;
            break;
          case 'loss':
            strategyStats[entry.strategy_id].loss++;
            break;
          case 'be':
            strategyStats[entry.strategy_id].be++;
            break;
        }
        strategyStats[entry.strategy_id].percent += entryPercent;
      })
    } catch (e) {
      throw e;
    } finally {
      res.json({
        strategyStats: strategyStats
      })
    }
  })()
})

// ACCOUNT ASSETS
router.get("/assets/:period", middleware.isLoggedIn, (req, res) => {
  // creates an object to store the asset stats
  var assetStats = {
    quantity: Array(pairs.length).fill(0),
    win:      Array(pairs.length).fill(0),
    loss:     Array(pairs.length).fill(0),
    be:       Array(pairs.length).fill(0),
    amount:   Array(pairs.length).fill(0),
    percent:  Array(pairs.length).fill(0)
  };
  (async () => {
    try {
      switch (req.params.period) {
        case 'today':
          var getEntries = await query('SELECT pair_id, result, profits, fees FROM entries WHERE entry_dt > CURDATE() AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cweek':
          var getEntries = await query('SELECT pair_id, result, profits, fees FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE(), 1) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lweek':
          var getEntries = await query('SELECT pair_id, result, profits, fees FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cmonth':
          var getEntries = await query('SELECT pair_id, result, profits, fees FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND MONTH(entry_dt) = MONTH(CURDATE()) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lmonth':
          var getEntries = await query('SELECT pair_id, result, profits, fees FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(entry_dt) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cquarter':
          var getEntries = await query('SELECT pair_id, result, profits, fees FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND QUARTER(entry_dt) = QUARTER(CURDATE()) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lquarter':
          var getEntries = await query('SELECT pair_id, result, profits, fees FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 QUARTER) AND QUARTER(entry_dt) = QUARTER(CURDATE() - INTERVAL 1 QUARTER) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'all':
          var getEntries = await query('SELECT pair_id, result, profits, fees FROM entries WHERE status = 1 AND user_id = ?;', req.user.id);
          break;
      }
      getEntries.forEach((entry) => {
        assetStats.quantity[Number(entry.pair_id) - 1]++;
        var entryPercent = Math.round((((entry.profits - entry.fees) / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
        switch (entry.result) {
          case 'win':
            assetStats.win[Number(entry.pair_id) - 1]++;
            break;
          case 'loss':
            assetStats.loss[Number(entry.pair_id) - 1]++;
            break;
          case 'be':
            assetStats.be[Number(entry.pair_id) - 1]++;
            break;
        }
        assetStats.amount[Number(entry.pair_id) - 1]+=   (entry.profits - entry.fees);
        assetStats.percent[Number(entry.pair_id) - 1]+=  entryPercent;
      })
      assetStats.showcase = getMax7(assetStats.quantity);
    } catch (e) {
      throw e;
    } finally {
      res.json({
        assetStats: assetStats
      })
    }
  })()
})

// ACCOUNT TIMEFRAMES
router.get("/timeframes/:period", middleware.isLoggedIn, (req, res) => {
  // creates an object to store the timeframe stats
  var timeframeStats = {
    quantity: Array(timeframes.length).fill(0),
    win:      Array(timeframes.length).fill(0),
    loss:     Array(timeframes.length).fill(0),
    be:       Array(timeframes.length).fill(0),
    amount:   Array(timeframes.length).fill(0),
    percent:  Array(timeframes.length).fill(0)
  };
  (async () => {
    try {
      switch (req.params.period) {
        case 'today':
          var getEntries = await query('SELECT timeframe_id, result, profits, fees FROM entries WHERE entry_dt > CURDATE() AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cweek':
          var getEntries = await query('SELECT timeframe_id, result, profits, fees FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE(), 1) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lweek':
          var getEntries = await query('SELECT timeframe_id, result, profits, fees FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cmonth':
          var getEntries = await query('SELECT timeframe_id, result, profits, fees FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND MONTH(entry_dt) = MONTH(CURDATE()) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lmonth':
          var getEntries = await query('SELECT timeframe_id, result, profits, fees FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(entry_dt) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cquarter':
          var getEntries = await query('SELECT timeframe_id, result, profits, fees FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND QUARTER(entry_dt) = QUARTER(CURDATE()) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lquarter':
          var getEntries = await query('SELECT timeframe_id, result, profits, fees FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 QUARTER) AND QUARTER(entry_dt) = QUARTER(CURDATE() - INTERVAL 1 QUARTER) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'all':
          var getEntries = await query('SELECT timeframe_id, result, profits, fees FROM entries WHERE status = 1 AND user_id = ?;', req.user.id);
          break;
      }
      getEntries.forEach((entry) => {
        timeframeStats.quantity[Number(entry.timeframe_id) - 1]++;
        var entryPercent = Math.round((((entry.profits - entry.fees) / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
        switch (entry.result) {
          case 'win':
            timeframeStats.win[Number(entry.timeframe_id) - 1]++;
            break;
          case 'loss':
            timeframeStats.loss[Number(entry.timeframe_id) - 1]++;
            break;
          case 'be':
            timeframeStats.be[Number(entry.timeframe_id) - 1]++;
            break;
        }
        timeframeStats.amount[Number(entry.timeframe_id) - 1]+=   (entry.profits - entry.fees);
        timeframeStats.percent[Number(entry.timeframe_id) - 1]+=  entryPercent;
      })
      timeframeStats.showcase = getMax7(timeframeStats.quantity);
    } catch (e) {
      throw e;
    } finally {
      res.json({
        timeframeStats: timeframeStats
      })
    }
  })()
})

// ACCOUNT WEEKDAYS
router.get("/days/:period", middleware.isLoggedIn, (req, res) => {
  // creates an object to store the day of the week stats
  var dayWeekStats = {
    Monday:     { name:'Monday',    quantity:0, win:0, loss:0, be:0, percent:0 },
    Tuesday:    { name:'Tuesday',   quantity:0, win:0, loss:0, be:0, percent:0 },
    Wednesday:  { name:'Wednesday', quantity:0, win:0, loss:0, be:0, percent:0 },
    Thursday:   { name:'Thursday',  quantity:0, win:0, loss:0, be:0, percent:0 },
    Friday:     { name:'Friday',    quantity:0, win:0, loss:0, be:0, percent:0 },
    Saturday:   { name:'Saturday',  quantity:0, win:0, loss:0, be:0, percent:0 },
    Sunday:     { name:'Sunday',    quantity:0, win:0, loss:0, be:0, percent:0 }
  };
  (async () => {
    try {
      switch (req.params.period) {
        case 'today':
          var getEntries = await query('SELECT result, profits, fees, DATE_FORMAT(entry_dt, "%W") AS date FROM entries WHERE entry_dt > CURDATE() AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cweek':
          var getEntries = await query('SELECT result, profits, fees, DATE_FORMAT(entry_dt, "%W") AS date FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE(), 1) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lweek':
          var getEntries = await query('SELECT result, profits, fees, DATE_FORMAT(entry_dt, "%W") AS date FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cmonth':
          var getEntries = await query('SELECT result, profits, fees, DATE_FORMAT(entry_dt, "%W") AS date FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND MONTH(entry_dt) = MONTH(CURDATE()) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lmonth':
          var getEntries = await query('SELECT result, profits, fees, DATE_FORMAT(entry_dt, "%W") AS date FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(entry_dt) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cquarter':
          var getEntries = await query('SELECT result, profits, fees, DATE_FORMAT(entry_dt, "%W") AS date FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND QUARTER(entry_dt) = QUARTER(CURDATE()) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lquarter':
          var getEntries = await query('SELECT result, profits, fees, DATE_FORMAT(entry_dt, "%W") AS date FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 QUARTER) AND QUARTER(entry_dt) = QUARTER(CURDATE() - INTERVAL 1 QUARTER) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'all':
          var getEntries = await query('SELECT result, profits, fees, DATE_FORMAT(entry_dt, "%W") AS date FROM entries WHERE status = 1 AND user_id = ?;', req.user.id);
          break;
      }
      getEntries.forEach((entry) => {
        dayWeekStats[entry.date].quantity++;
        var entryPercent = Math.round((((entry.profits - entry.fees) / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
        dayWeekStats[entry.date].percent += entryPercent;
        switch (entry.result) {
          case 'win':
            dayWeekStats[entry.date].win++;
            break;
          case 'loss':
            dayWeekStats[entry.date].loss++;
            break;
          case 'be':
            dayWeekStats[entry.date].be++;
            break;
        }
      })
    } catch (e) {
      throw e;
    } finally {
      res.json({
        dayWeekStats: dayWeekStats
      })
    }
  })()
})

// ACCOUNT DIRECTION BREAKOUT
router.get("/direction/breakout/:period", middleware.isLoggedIn, (req, res) => {
  var long = 0;
  var short = 0;
  (async () => {
    try {
      switch (req.params.period) {
        case 'today':
          var getEntries = await query('SELECT direction FROM entries WHERE entry_dt > CURDATE() AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cweek':
          var getEntries = await query('SELECT direction FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE(), 1) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lweek':
          var getEntries = await query('SELECT direction FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cmonth':
          var getEntries = await query('SELECT direction FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND MONTH(entry_dt) = MONTH(CURDATE()) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lmonth':
          var getEntries = await query('SELECT direction FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(entry_dt) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cquarter':
          var getEntries = await query('SELECT direction FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND QUARTER(entry_dt) = QUARTER(CURDATE()) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lquarter':
          var getEntries = await query('SELECT direction FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 QUARTER) AND QUARTER(entry_dt) = QUARTER(CURDATE() - INTERVAL 1 QUARTER) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'all':
          var getEntries = await query('SELECT direction FROM entries WHERE status = 1 AND user_id = ?;', req.user.id);
          break;
      }
      getEntries.forEach((entry) => {
        switch (entry.direction) {
          case 'long':
            long += 1;
            break;
          case 'short':
            short += 1;
            break;
        }
      })
    } catch (e) {
      throw e;
    } finally {
      res.json({
        long: long,
        short: short
      })
    }
  })()
})

// ACCOUNT CUSTOM DIRECTION BREAKOUT
router.get("/direction/breakout/custom/:from/:to", middleware.isLoggedIn, (req, res) => {
  var long = 0;
  var short = 0;
  (async () => {
    try {
      var getEntries = await query('SELECT direction FROM entries WHERE status = 1 AND user_id = ? AND entry_dt > ? AND entry_dt < ?;', [req.user.id, req.params.from, req.params.to]);
      getEntries.forEach((entry) => {
        switch (entry.direction) {
          case 'long':
            long += 1;
            break;
          case 'short':
            short += 1;
            break;
        }
      })
    } catch (e) {
      throw e;
    } finally {
      res.json({
        long: long,
        short: short
      })
    }
  })()
})

// ACCOUNT DIRECTION PERCENT
router.get("/direction/percent/:period", middleware.isLoggedIn, (req, res) => {
  // creates array objects of length 12 (months in year) for each direction
  var long = Array(12).fill(0);
  var short = Array(12).fill(0);
  (async () => {
    try {
      switch (req.params.period) {
        case 'today':
          var getEntries = await query('SELECT profits, fees, direction, MONTH(entry_dt) as month FROM entries WHERE entry_dt > CURDATE() AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cweek':
          var getEntries = await query('SELECT profits, fees, direction, MONTH(entry_dt) as month FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE(), 1) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lweek':
          var getEntries = await query('SELECT profits, fees, direction, MONTH(entry_dt) as month FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cmonth':
          var getEntries = await query('SELECT profits, fees, direction, MONTH(entry_dt) as month FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND MONTH(entry_dt) = MONTH(CURDATE()) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lmonth':
          var getEntries = await query('SELECT profits, fees, direction, MONTH(entry_dt) as month FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(entry_dt) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cquarter':
          var getEntries = await query('SELECT profits, fees, direction, MONTH(entry_dt) as month FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND QUARTER(entry_dt) = QUARTER(CURDATE()) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lquarter':
          var getEntries = await query('SELECT profits, fees, direction, MONTH(entry_dt) as month FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 QUARTER) AND QUARTER(entry_dt) = QUARTER(CURDATE() - INTERVAL 1 QUARTER) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'all':
          var getEntries = await query('SELECT profits, fees, direction, MONTH(entry_dt) as month FROM entries WHERE status = 1 AND user_id = ?;', req.user.id);
          break;
      }
      getEntries.forEach((entry) => {
        var entryPercent = Math.round((((entry.profits - entry.fees) / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
        switch (entry.direction) {
          case 'long':
            long[entry.month - 1]+= entryPercent
            break;
          case 'short':
            short[entry.month - 1]+= entryPercent
            break;
        }
      })
    } catch (e) {
      throw e;
    } finally {
      res.json({
        long: long,
        short: short
      })
    }
  })()
})

// ACCOUNT CUSTOM DIRECTION PERCENT
router.get("/direction/percent/custom/:from/:to", middleware.isLoggedIn, (req, res) => {
  // creates array objects of length 12 (months in year) for each direction
  var long = Array(12).fill(0);
  var short = Array(12).fill(0);
  (async () => {
    try {
      var getEntries = await query('SELECT profits, fees, direction, MONTH(entry_dt) AS month FROM entries WHERE status = 1 AND user_id = ? AND entry_dt > ? AND entry_dt < ?;', [req.user.id, req.params.from, req.params.to]);
      getEntries.forEach((entry) => {
        var entryPercent = Math.round((((entry.profits - entry.fees) / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
        switch (entry.direction) {
          case 'long':
            long[entry.month - 1]+= entryPercent
            break;
          case 'short':
            short[entry.month - 1]+= entryPercent
            break;
        }
      })
    } catch (e) {
      throw e;
    } finally {
      res.json({
        long: long,
        short: short
      })
    }
  })()
})

module.exports = router;
