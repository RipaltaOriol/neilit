let express = require('express');
const util = require('util');
let router = express.Router({mergeParams: true});
let pairs = require('../models/pairs');
let currencies = require('../models/currencies');
let categories = require('../models/categoriesPairs');
let middleware = require('../middleware');
let db = require('../models/dbConfig');
// node native promisify
const query = util.promisify(db.query).bind(db);

// BIGGEST TRADE
router.get("/biggest/:period", middleware.isLoggedIn, (req, res) => {
  var percent = 0;
  var pair = 'N/A';
  (async () => {
    try {
      switch (req.params.period) {
        case 'today':
          var getEntries = await query('SELECT pair_id, profits, fees FROM entries WHERE entry_dt > CURDATE() AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cweek':
          var getEntries = await query('SELECT pair_id, profits, fees FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE(), 1) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lweek':
          var getEntries = await query('SELECT pair_id, profits, fees FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1) AND status = 1  AND user_id = ?;', req.user.id);
          break;
        case 'cmonth':
          var getEntries = await query('SELECT pair_id, profits, fees FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND MONTH(entry_dt) = MONTH(CURDATE()) AND status = 1  AND user_id = ?;', req.user.id);
          break;
        case 'lmonth':
          var getEntries = await query('SELECT pair_id, profits, fees FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(entry_dt) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND status = 1  AND user_id = ?;', req.user.id);
          break;
        case 'cquarter':
          var getEntries = await query('SELECT pair_id, profits, fees FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND QUARTER(entry_dt) = QUARTER(CURDATE()) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lquarter':
          var getEntries = await query('SELECT pair_id, profits, fees FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 QUARTER) AND QUARTER(entry_dt) = QUARTER(CURDATE() - INTERVAL 1 QUARTER) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'all':
          var getEntries = await query('SELECT pair_id, profits, fees FROM entries WHERE status = 1 AND user_id = ?;', req.user.id);
          break;
      }
      getEntries.forEach((entry) => {
        var entryPercent = Math.round((((entry.profits - entry.fees) / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
        if (entryPercent > percent) {
          percent = entryPercent;
          pair = pairs[entry.pair_id - 1];
        }
      });
    } catch (e) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username);
    } finally {
      res.json({
        percent: percent,
        pair: pair
      })
    }
  })()
})

// CUSTOM BIGGEST TRADE
router.get("/biggest/custom/:from/:to", middleware.isLoggedIn, (req, res) => {
  var biggestPercent = 0;
  var biggestPair = 'N/A';
  (async () => {
    try {
      var getEntries = await query('SELECT pair_id, profits, fees FROM entries WHERE status = 1 AND user_id = ? AND entry_dt > ? AND entry_dt < ?;', [req.user.id, req.params.from, req.params.to]);
      getEntries.forEach((entry) => {
        var entryPercent = Math.round((((entry.profits - entry.fees) / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
        if (entryPercent >= biggestPercent) {
          biggestPercent = entryPercent;
          biggestPair = pairs[entry.pair_id - 1];
        }
      })
    } catch (e) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username);
    } finally {
      res.json({
        biggestPercent: biggestPercent,
        biggestPair: biggestPair
      })
    }
  })()
})

// TOTAL ENTRIES - PLUS WIN RATE
router.get("/total/:period", middleware.isLoggedIn, (req, res) => {
  var total = 0;
  var wins = 0;
  var rate;
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
          var getEntries = await query('SELECT result FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1) AND status = 1  AND user_id = ?;', req.user.id);
          break;
        case 'cmonth':
          var getEntries = await query('SELECT result FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND MONTH(entry_dt) = MONTH(CURDATE()) AND status = 1  AND user_id = ?;', req.user.id);
          break;
        case 'lmonth':
          var getEntries = await query('SELECT result FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(entry_dt) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND status = 1  AND user_id = ?;', req.user.id);
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
        total++;
        if (entry.result == 'win') {
          wins++;
        }
      });
      if (total == 0) {
        rate = 0;
      } else {
        rate = wins/total * 100;
      }
    } catch (e) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username);
    } finally {
      res.json({
        total: total,
        rate: rate
      })
    }
  })()
})

// CUSTOM TOTAL ENTRIES - PLUS WIN RATE
router.get("/total/custom/:from/:to", middleware.isLoggedIn, (req, res) => {
  var total = 0;
  var wins = 0;
  var rate;
  (async () => {
    try {
      var getEntries = await query('SELECT result FROM entries WHERE status = 1 AND user_id = ? AND entry_dt > ? AND entry_dt < ?;', [req.user.id, req.params.from, req.params.to]);
      getEntries.forEach((entry) => {
        total++;
        if (entry.result == 'win') {
          wins++;
        }
      })
      if (total == 0) {
        rate = 0;
      } else {
        rate = wins/total * 100
      }
    } catch (e) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username);
    } finally {
      res.json({
        total: total,
        rate: rate
      })
    }
  })()
})

// OUTCOME X MONTH
router.get("/outcome/:period", middleware.isLoggedIn, (req, res) => {
  // creates object arrays for outcome x month data
  var outcomeMonthAmount = Array(12).fill(0);
  var outcomeMonthTotal  = Array(12).fill(0);
  (async () => {
    try {
      switch (req.params.period) {
        case 'today':
          var getEntries = await query('SELECT profits, fees, MONTH(exit_dt) AS month FROM entries WHERE entry_dt > CURDATE() AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'cweek':
          var getEntries = await query('SELECT profits, fees, MONTH(exit_dt) AS month FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE(), 1) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lweek':
          var getEntries = await query('SELECT profits, fees, MONTH(exit_dt) AS month FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1) AND status = 1  AND user_id = ?;', req.user.id);
          break;
        case 'cmonth':
          var getEntries = await query('SELECT profits, fees, MONTH(exit_dt) AS month FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND MONTH(entry_dt) = MONTH(CURDATE()) AND status = 1  AND user_id = ?;', req.user.id);
          break;
        case 'lmonth':
          var getEntries = await query('SELECT profits, fees, MONTH(exit_dt) AS month FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(entry_dt) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND status = 1  AND user_id = ?;', req.user.id);
          break;
        case 'cquarter':
          var getEntries = await query('SELECT profits, fees, MONTH(exit_dt) AS month FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND QUARTER(entry_dt) = QUARTER(CURDATE()) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'lquarter':
          var getEntries = await query('SELECT profits, fees, MONTH(exit_dt) AS month FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 QUARTER) AND QUARTER(entry_dt) = QUARTER(CURDATE() - INTERVAL 1 QUARTER) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'all':
          var getEntries = await query('SELECT profits, fees, MONTH(exit_dt) AS month FROM entries WHERE status = 1 AND user_id = ?;', req.user.id);
          break;
      }
      getEntries.forEach((entry) => {
        outcomeMonthAmount[entry.month - 1] += (entry.profits - entry.fees);
        outcomeMonthTotal[entry.month - 1] += 1;
      });
    } catch (e) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username);
    } finally {
      res.json({
        outcomeMonthAmount: outcomeMonthAmount,
        outcomeMonthTotal: outcomeMonthTotal
      })
    }
  })()
})

// CUSTOM OUTCOME X MONTH
router.get("/outcome/custom/:from/:to", middleware.isLoggedIn, (req, res) => {
  // creates object arrays for outcome x month data
  var outcomeMonthAmount = Array(12).fill(0);
  var outcomeMonthTotal  = Array(12).fill(0);
  (async () => {
    try {
      var getEntries = await query('SELECT profits, fees, MONTH(exit_dt) AS month FROM entries WHERE status = 1 AND user_id = ? AND entry_dt > ? AND entry_dt < ?;', [req.user.id, req.params.from, req.params.to]);
      getEntries.forEach((entry) => {
        outcomeMonthAmount[entry.month - 1] += (entry.profits - entry.fees);
        outcomeMonthTotal[entry.month - 1] += 1;
      })
    } catch (e) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username);
    } finally {
      res.json({
        outcomeMonthAmount: outcomeMonthAmount,
        outcomeMonthTotal: outcomeMonthTotal
      })
    }
  })()
})

router.get('/remove-notification', (req, res) => {
  notification = false;
  res.send({})
})

module.exports = router;
