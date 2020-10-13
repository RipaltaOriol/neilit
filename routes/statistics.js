var express = require('express');
const util = require('util');
var router = express.Router({mergeParams: true});
let pairs = require("../models/pairs");
let categories = require("../models/categoriesPairs");
let middleware = require('../middleware');
let db = require('../models/dbConfig');
// node native promisify
const query = util.promisify(db.query).bind(db);

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
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
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
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
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
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
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
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
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
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
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
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    } finally {
      res.json({
        amount: amount,
        percent: percent,
        pair: pair
      })
    }
  })()
})

// DETAIL ACCOUNT STRATEGIES
router.get("/strategies", middleware.isLoggedIn, (req, res) => {
  let months = [res.__('January'), res.__('February'), res.__('March'), res.__('April'), res.__('May'), res.__('June'), res.__('July'), res.__('August'), res.__('September'), res.__('October'), res.__('November'), res.__('December')]
  var getEntries = 'SELECT strategy_id, result, profits, fees, MONTH(entry_dt) AS month FROM entries WHERE status = 1 AND user_id = ?;'
  // creates an object to store the strategy stats
  var strategyStats = { }
  userIdStrategies.forEach((id, i) => {
    strategyStats[Number(id, i)] = {
      name: userStrategies[i],
      quantity: 0,
      win: 0,
      loss: 0,
      be: 0,
      percent: 0,
      month: Array(12).fill(0),
      outcome: 0,
      totalWinPercent: 0,
      totalLossPercent: 0
    }
  });
  db.query(getEntries, req.user.id, (err, results) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    }
    results.forEach((entry) => {
      strategyStats[entry.strategy_id].quantity++;
      strategyStats[entry.strategy_id].month[entry.month - 1] += (entry.profits - entry.fees);
      strategyStats[entry.strategy_id].outcome += (entry.profits - entry.fees);
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
      if (entryPercent > 0) {
        strategyStats[entry.strategy_id].totalWinPercent += entryPercent;
      } else {
        strategyStats[entry.strategy_id].totalLossPercent += entryPercent;
      }
      strategyStats[entry.strategy_id].percent += entryPercent;
    })
    for (const strategy in strategyStats) {
      strategyStats[strategy].expected = ((strategyStats[strategy].totalWinPercent / strategyStats[strategy].win) * (strategyStats[strategy].win / strategyStats[strategy].quantity)) + ((strategyStats[strategy].totalLossPercent / strategyStats[strategy].loss) * (1 - (strategyStats[strategy].win / strategyStats[strategy].quantity)))
    }
    res.render('user/statistics/details-strategies',
      {
        strategyStats: strategyStats,
        months: months
      }
    );
  })
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
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    } finally {
      res.json({
        strategyStats: strategyStats
      })
    }
  })()
})

// DETAIL ACCOUNT ASSETS
router.get("/assets", middleware.isLoggedIn, (req, res) => {
  let months = [res.__('January'), res.__('February'), res.__('March'), res.__('April'), res.__('May'), res.__('June'), res.__('July'), res.__('August'), res.__('September'), res.__('October'), res.__('November'), res.__('December')]
  var getEntries = 'SELECT pair_id, result, profits, fees, MONTH(entry_dt) AS month FROM entries WHERE status = 1 AND user_id = ?;'
  var getCountEntries = 'SELECT pair_id FROM entries WHERE status = 1 && user_id = ? GROUP BY pair_id ORDER BY COUNT(*) DESC LIMIT 7;'
  var getOutcomeEntriesBest = 'SELECT pair_id, AVG(profits - fees) AS outcome FROM entries WHERE status = ? && user_id = 1 GROUP BY pair_id ORDER BY outcome desc LIMIT 7;'
  var getOutcomeEntriesWorse = 'SELECT pair_id, AVG(profits - fees) AS outcome FROM entries WHERE status = ? && user_id = 1 GROUP BY pair_id ORDER BY outcome LIMIT 7;'
  // creates an object to store the pairs stats
  var assetStats = {
    quantity:         Array(pairs.length).fill(0),
    win:              Array(pairs.length).fill(0),
    loss:             Array(pairs.length).fill(0),
    be:               Array(pairs.length).fill(0),
    amount:           Array(pairs.length).fill(0),
    month:            Array(pairs.length).fill(0),
    percent:          Array(pairs.length).fill(0),
    totalWinPercent:  Array(pairs.length).fill(0),
    totalLossPercent: Array(pairs.length).fill(0),
    expected:         Array(pairs.length).fill(0)
  }
  assetStats.month.forEach((none, i) => {
    assetStats.month[i] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  });
  var assetsByCount = []
  var assetsByOutcomeBest = []
  var assetsByOutcomeWorse = []
  db.query(getEntries, req.user.id, (err, results) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    }
    results.forEach((entry) => {
      assetStats.quantity[entry.pair_id - 1]++;
      assetStats.amount[entry.pair_id - 1] += (entry.profits - entry.fees);
      assetStats.month[entry.pair_id - 1][entry.month - 1] += (entry.profits - entry.fees);
      var entryPercent = Math.round((((entry.profits - entry.fees) / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
      switch (entry.result) {
        case 'win':
          assetStats.win[entry.pair_id - 1]++;
          break;
        case 'loss':
          assetStats.loss[entry.pair_id - 1]++;
          break;
        case 'be':
          assetStats.be[entry.pair_id - 1]++;
          break;
      }
      if (entryPercent > 0) {
        assetStats.totalWinPercent[entry.pair_id - 1] += entryPercent;
      } else {
        assetStats.totalLossPercent[entry.pair_id - 1] += entryPercent;
      }
      assetStats.percent[entry.pair_id - 1] += entryPercent;
    })
    assetStats.quantity.forEach((pair, i) => {
      assetStats.expected[i] = ((assetStats.totalWinPercent[i] / assetStats.win[i]) * (assetStats.win[i] / assetStats.quantity[i])) + ((assetStats.totalLossPercent[i] / assetStats.loss[i]) * (1 - (assetStats.win[i] / assetStats.quantity[i])))
    });
    db.query(getCountEntries, req.user.id, (err, results) => {
      if (err) {
        // COMBAK: log error
        req.flash('error', res.__('Something went wrong. Please, try again later.'))
        return res.redirect('/' + req.user.username + '/statistics');
      }
      results.forEach((pair) => {
        assetsByCount.push(pair.pair_id);
      });
      db.query(getOutcomeEntriesBest, req.user.id, (err, results) => {
        if (err) {
          // COMBAK: log error
          req.flash('error', res.__('Something went wrong. Please, try again later.'))
          return res.redirect('/' + req.user.username + '/statistics');
        }
        results.forEach((pair) => {
          assetsByOutcomeBest.push(pair.pair_id);
        });
        db.query(getOutcomeEntriesWorse, req.user.id, (err, results) => {
          if (err) {
            // COMBAK: log error
            req.flash('error', res.__('Something went wrong. Please, try again later.'))
            return res.redirect('/' + req.user.username + '/statistics');
          }
          results.forEach((pair) => {
            assetsByOutcomeWorse.push(pair.pair_id);
          });
          res.render('user/statistics/details-assets',
            {
              pairs: pairs,
              assetStats: assetStats,
              assetsByCount: assetsByCount,
              assetsByOutcomeBest: assetsByOutcomeBest,
              assetsByOutcomeWorse: assetsByOutcomeWorse,
              months: months
            }
          );
        })
      })
    })
  })
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
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    } finally {
      res.json({
        assetStats: assetStats
      })
    }
  })()
})

// DETAIL ACCOUNT TIMEFRAMES
router.get("/timeframes", middleware.isLoggedIn, (req, res) => {
  var getEntries = 'SELECT timeframe_id, result, profits, fees FROM entries WHERE status = 1 AND user_id = ?;'
  // creates an object to store the timeframe stats
  var timeframeStats = {
    quantity:         Array(timeframes.length).fill(0),
    win:              Array(timeframes.length).fill(0),
    loss:             Array(timeframes.length).fill(0),
    be:               Array(timeframes.length).fill(0),
    amount:           Array(timeframes.length).fill(0),
    percent:          Array(timeframes.length).fill(0),
    totalWinPercent:  Array(timeframes.length).fill(0),
    totalLossPercent: Array(timeframes.length).fill(0),
    expected:         Array(timeframes.length).fill(0)
  }
  var tfByCount = []
  var tfByOutcome = []
  db.query(getEntries, req.user.id, (err, results) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    }
    results.forEach((entry) => {
      timeframeStats.quantity[entry.timeframe_id - 1]++;
      timeframeStats.amount[entry.timeframe_id - 1] += (entry.profits - entry.fees);
      var entryPercent = Math.round((((entry.profits - entry.fees) / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
      switch (entry.result) {
        case 'win':
          timeframeStats.win[entry.timeframe_id - 1]++;
          break;
        case 'loss':
          timeframeStats.loss[entry.timeframe_id - 1]++;
          break;
        case 'be':
          timeframeStats.be[entry.timeframe_id - 1]++;
          break;
      }
      if (entryPercent > 0) {
        timeframeStats.totalWinPercent[entry.timeframe_id - 1] += entryPercent;
      } else {
        timeframeStats.totalLossPercent[entry.timeframe_id - 1] += entryPercent;
      }
      timeframeStats.percent[entry.timeframe_id - 1] += entryPercent;
    })
    timeframeStats.quantity.forEach((tf, i) => {
      timeframeStats.expected[i] = ((timeframeStats.totalWinPercent[i] / timeframeStats.win[i]) * (timeframeStats.win[i] / timeframeStats.quantity[i])) + ((timeframeStats.totalLossPercent[i] / timeframeStats.loss[i]) * (1 - (timeframeStats.win[i] / timeframeStats.quantity[i])))
    });
    tfByCount = getMax7(timeframeStats.quantity);
    tfByOutcome = getMax7(timeframeStats.amount);
    res.render('user/statistics/details-timeframes',
      {
        timeframes: timeframes,
        timeframeStats: timeframeStats,
        tfByCount: tfByCount,
        tfByOutcome: tfByOutcome
      });
  })
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
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    } finally {
      res.json({
        timeframeStats: timeframeStats
      })
    }
  })()
})

// DETAIL ACCOUNT WEEKDAYS
router.get("/days", middleware.isLoggedIn, (req, res) => {
  var weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var getEntries = 'SELECT result, profits, fees, DAYOFWEEK(entry_dt) AS open, DAYOFWEEK(exit_dt) AS close FROM entries WHERE status = 1 AND user_id = ?;'
  // creates an object to store the days stats
  var daysOpenStats = []
  weekDays.forEach(() => {
    daysOpenStats.push({
      quantity:0,
      win:0,
      loss:0,
      be:0,
      percent:0,
      outcome: 0,
      totalWinPercent: 0,
      totalLossPercent: 0
    })
  });
  var daysCloseStats = Array(7).fill(0)
  db.query(getEntries, req.user.id, (err, results) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    }
    results.forEach((entry) => {
      daysOpenStats[entry.open - 1].quantity++;
      daysOpenStats[entry.open - 1].outcome += (entry.profits - entry.fees);
      daysCloseStats[entry.close - 1] += (entry.profits - entry.fees);
      var entryPercent = Math.round((((entry.profits - entry.fees) / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
      switch (entry.result) {
        case 'win':
          daysOpenStats[entry.open - 1].win++;
          break;
        case 'loss':
          daysOpenStats[entry.open - 1].loss++;
          break;
        case 'be':
          daysOpenStats[entry.open - 1].be++;
          break;
      }
      if (entryPercent > 0) {
        daysOpenStats[entry.open - 1].totalWinPercent += entryPercent;
      } else {
        daysOpenStats[entry.open - 1].totalLossPercent += entryPercent;
      }
      daysOpenStats[entry.open - 1].percent += entryPercent;
    })
    daysOpenStats.forEach((day) => {
      day.expected = ((day.totalWinPercent / day.win) * (day.win / day.quantity)) + ((day.totalLossPercent / day.loss) * (1 - (day.win / day.quantity)))
    });
    weekDays = [res.__('Sunday'), res.__('Monday'), res.__('Tuesday'), res.__('Wednesday'), res.__('Thursday'), res.__('Friday'), res.__('Saturday')];
    res.render('user/statistics/details-days',
      {
        daysOpenStats: daysOpenStats,
        daysCloseStats: daysCloseStats,
        weekDays: weekDays
      });
  })
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
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    } finally {
      res.json({
        dayWeekStats: dayWeekStats
      })
    }
  })()
})

// ACCOUNT CUSTOM TABLE DATA
router.get("/:table/custom/:from/:to", middleware.isLoggedIn, (req, res) => {
  (async () => {
    try {
      switch (req.params.table) {
        case 'strategies':
          var getEntries = await query('SELECT strategy_id, result, profits, fees FROM entries WHERE status = 1 AND user_id = ? AND entry_dt > ? AND entry_dt < ?;', [req.user.id, req.params.from, req.params.to]);
          // creates an object to store the strategy stats
          var data = { }
          userIdStrategies.forEach((id, i) => {
            data[Number(id, i)] = {
              name: userStrategies[i],
              quantity: 0,
              win: 0,
              loss: 0,
              be: 0,
              percent: 0
            }
          })
          getEntries.forEach((entry) => {
            data[entry.strategy_id].quantity++;
            var entryPercent = Math.round((((entry.profits - entry.fees) / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
            switch (entry.result) {
              case 'win':
                data[entry.strategy_id].win++;
                break;
              case 'loss':
                data[entry.strategy_id].loss++;
                break;
              case 'be':
                data[entry.strategy_id].be++;
                break;
            }
            data[entry.strategy_id].percent += entryPercent;
          })
          break;

        case 'assets':
          var getEntries = await query('SELECT pair_id, result, profits, fees FROM entries WHERE status = 1 AND user_id = ? AND entry_dt > ? AND entry_dt < ?;', [req.user.id, req.params.from, req.params.to]);
          // creates an object to store the asset stats
          var data = {
            quantity: Array(pairs.length).fill(0),
            win:      Array(pairs.length).fill(0),
            loss:     Array(pairs.length).fill(0),
            be:       Array(pairs.length).fill(0),
            amount:   Array(pairs.length).fill(0),
            percent:  Array(pairs.length).fill(0)
          };
          getEntries.forEach((entry) => {
            data.quantity[Number(entry.pair_id) - 1]++;
            var entryPercent = Math.round((((entry.profits - entry.fees) / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
            switch (entry.result) {
              case 'win':
                data.win[Number(entry.pair_id) - 1]++;
                break;
              case 'loss':
                data.loss[Number(entry.pair_id) - 1]++;
                break;
              case 'be':
                data.be[Number(entry.pair_id) - 1]++;
                break;
            }
            data.amount[Number(entry.pair_id) - 1]+=   (entry.profits - entry.fees);
            data.percent[Number(entry.pair_id) - 1]+=  entryPercent;
          })
          data.showcase = getMax7(data.quantity);
          break;

        case 'timeframes':
          var getEntries = await query('SELECT timeframe_id, result, profits, fees FROM entries WHERE status = 1 AND user_id = ? AND entry_dt > ? AND entry_dt < ?;', [req.user.id, req.params.from, req.params.to]);
          // creates an object to store the timeframe stats
          var data = {
            quantity: Array(timeframes.length).fill(0),
            win:      Array(timeframes.length).fill(0),
            loss:     Array(timeframes.length).fill(0),
            be:       Array(timeframes.length).fill(0),
            amount:   Array(timeframes.length).fill(0),
            percent:  Array(timeframes.length).fill(0)
          };
          getEntries.forEach((entry) => {
            data.quantity[Number(entry.timeframe_id) - 1]++;
            var entryPercent = Math.round((((entry.profits - entry.fees) / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
            switch (entry.result) {
              case 'win':
                data.win[Number(entry.timeframe_id) - 1]++;
                break;
              case 'loss':
                data.loss[Number(entry.timeframe_id) - 1]++;
                break;
              case 'be':
                data.be[Number(entry.timeframe_id) - 1]++;
                break;
            }
            data.amount[Number(entry.timeframe_id) - 1]+=   (entry.profits - entry.fees);
            data.percent[Number(entry.timeframe_id) - 1]+=  entryPercent;
          })
          data.showcase = getMax7(data.quantity);
          break;

        case 'days':
          var getEntries = await query('SELECT result, profits, fees, DATE_FORMAT(entry_dt, "%W") AS date FROM entries WHERE status = 1 AND user_id = ? AND entry_dt > ? AND entry_dt < ?;', [req.user.id, req.params.from, req.params.to]);
          // creates an object to store the day of the week stats
          var data = {
            Monday:     { name:'Monday',    quantity:0, win:0, loss:0, be:0, percent:0 },
            Tuesday:    { name:'Tuesday',   quantity:0, win:0, loss:0, be:0, percent:0 },
            Wednesday:  { name:'Wednesday', quantity:0, win:0, loss:0, be:0, percent:0 },
            Thursday:   { name:'Thursday',  quantity:0, win:0, loss:0, be:0, percent:0 },
            Friday:     { name:'Friday',    quantity:0, win:0, loss:0, be:0, percent:0 },
            Saturday:   { name:'Saturday',  quantity:0, win:0, loss:0, be:0, percent:0 },
            Sunday:     { name:'Sunday',    quantity:0, win:0, loss:0, be:0, percent:0 }
          };
          getEntries.forEach((entry) => {
            data[entry.date].quantity++;
            var entryPercent = Math.round((((entry.profits - entry.fees) / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
            data[entry.date].percent += entryPercent;
            switch (entry.result) {
              case 'win':
                data[entry.date].win++;
                break;
              case 'loss':
                data[entry.date].loss++;
                break;
              case 'be':
                data[entry.date].be++;
                break;
            }
          })
          break;
      }
    } catch (e) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    } finally {
      if (typeof data !== 'undefined') {
        console.log(data);
        res.json({
          data: data
        })
      } else {
        // COMBAK: log error
        req.flash('error', res.__('Something went wrong. Please, try again later.'))
        return res.redirect('/' + req.user.username + '/statistics');
      }
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
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
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
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
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
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
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
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    } finally {
      res.json({
        long: long,
        short: short
      })
    }
  })()
})

module.exports = router;
