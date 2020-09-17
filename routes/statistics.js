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

// BEST ASSET
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
        entryPercent = Math.round((((entry.profits - entry.fees) / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
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

router.get("/details-balance", (res, req) => {
res.render("user/statistics/balance")
});

module.exports = router;
