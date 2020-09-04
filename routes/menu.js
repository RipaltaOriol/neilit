let express = require('express');
let router = express.Router({mergeParams: true});
let pairs = require('../models/pairs');
let currencies = require('../models/currencies');
let timeframes = require('../models/timeframes');
let categories = require('../models/categoriesPairs');
let middleware = require('../middleware');
let connection = require('../models/connectDB');

// SETTINGS ROUTE
router.get("/settings", middleware.isLoggedIn, (req, res) => {
  var selectGoals = 'SELECT goal FROM goals WHERE user_id = ?';
  var goals = []
  connection.query(selectGoals, req.user.id, (err, getGoals) => {
    getGoals.forEach((result) => {
      goals.push(result.goal)
    });
    res.render("user/settings",
      {
        strategies:userStrategies,
        currencies: currencies,
        goals: goals
      }
    );
  })
})

// DASHBOARD USER ROUTE
router.get("", middleware.isLoggedIn, (req, res) => {
  var selectUserBase = 'SELECT currency FROM currencies WHERE id = ?;'
  var selectEntries = 'SELECT pair_id, size, direction, entry_price, exit_price, result FROM entries WHERE status = 1 AND user_id = ?;'
  connection.query(selectUserBase, req.user.currency_id, (err, getBase) => {
    if (err) throw err;
    // creates an object to store the data to display in the dashboard
    var dashboardData = {
      base: getBase[0].currency,
      currentAmount: req.user.balance,
      currentPercent: 0,
      biggestPair: 'N/A',
      biggestPercent: 0,
      total: 0,
      rate: 0
    }
    // creates an object to store the monthly outcome data
    var dayWeekStats = {
      January: { outcome: 0, total: 0 },
      February: { outcome: 0, total: 0 },
      March: { outcome: 0, total: 0 },
      April: { outcome: 0, total: 0 },
      May: { outcome: 0, total: 0 },
      June: { outcome: 0, total: 0 },
      July: { outcome: 0, total: 0 },
      August: { outcome: 0, total: 0 },
      September: { outcome: 0, total: 0 },
      October: { outcome: 0, total: 0 },
      November: { outcome: 0, total: 0 },
      December: { outcome: 0, total: 0 }
    }
    connection.query(selectEntries, req.user.id, (err, getEntries) => {
      if (err) throw err;
      getEntries.forEach((entry) => {
        dashboardData.total += 1;
        if (entry.result == 'win') { dashboardData.rate += 1 }
        var entryAmount;
        var entryPercent;
        if (entry.direction == 'long') {
          entryAmount = Math.round(((entry.exit_price - entry.entry_price) * entry.size * 100000 + Number.EPSILON) * 100) / 100;
          entryPercent = Math.round(((entryAmount / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
        } else {
          entryAmount = Math.round(((entry.entry_price - entry.exit_price) * entry.size * 100000 + Number.EPSILON) * 100) / 100;
          entryPercent = Math.round(((entryAmount / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
        }
        dashboardData.currentAmount += entryAmount;
        if (entryPercent >= dashboardData.biggestPercent) {
          dashboardData.biggestPercent = entryPercent;
          dashboardData.biggestPair = pairs[entry.pair_id - 1];
        }
      });
      dashboardData.currentPercent = (dashboardData.currentAmount / req.user.balance - 1) * 100
      dashboardData.currentAmount = dashboardData.currentAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      dashboardData.rate = (dashboardData.rate/dashboardData.total * 100).toFixed(2);
      res.render("user/user",
        {
          dashboardData:dashboardData
        }
      );
    })
  })
})

// STATISTICS ROUTE
router.get("/statistics", middleware.isLoggedIn, (req, res) => {
  var selectUserBase = 'SELECT currency FROM currencies WHERE id = ?;'
  var selectEntries = 'SELECT pair_id, size, strategy_id, timeframe_id, direction, entry_price, exit_price, result, DATE_FORMAT(entry_dt, "%W") AS date FROM entries WHERE status = 1 AND user_id = ?;';
  connection.query(selectUserBase, req.user.currency_id, (err, getBase) => {
    if (err) throw err;
    var userBase = getBase[0].currency;
    // creates an object to store the asset stats
    var assetStats = {
      quantity:Array(pairs.length).fill(0),
      wins:    Array(pairs.length).fill(0),
      losses:  Array(pairs.length).fill(0),
      bevens:  Array(pairs.length).fill(0),
      amount:  Array(pairs.length).fill(0),
      percent: Array(pairs.length).fill(0)
    }
    // creates an object to store the timeframe stats
    var timeframeStats = {
      quantity:Array(timeframes.length).fill(0),
      wins:    Array(timeframes.length).fill(0),
      losses:  Array(timeframes.length).fill(0),
      bevens:  Array(timeframes.length).fill(0),
      amount:  Array(timeframes.length).fill(0),
      percent: Array(timeframes.length).fill(0)
    }
    connection.query(selectEntries, req.user.id, (err, getEntries) => {
      if (err) throw err;
      // creates an object to count the metrics for the statistics page
      var counter = {
        counterWin: 0,
        counterLoss: 0,
        counterBE: 0,
        counterLong: 0,
        counterShort: 0,
        profitsAmt: 0,
        profitsPer: 0
      }
      // creates an object to store the strategy stats
      var strategyStats = { }
      userIdStrategies.forEach((id, i) => {
        strategyStats[Number(id, i)] = {
          name: userStrategies[i],
          quantity: 0,
          wins: 0,
          losses: 0,
          be: 0,
          percentage: 0
        }
      });
      // creates an object to store the day of the week stats
      var dayWeekStats = {
        Monday: { name:'Monday', quantity:0, wins:0, losses:0, be:0, percentage:0 },
        Tuesday: { name:'Tuesday', quantity:0, wins:0, losses:0, be:0, percentage:0 },
        Wednesday: { name:'Wednesday', quantity:0, wins:0, losses:0, be:0, percentage:0 },
        Thursday: { name:'Thursday', quantity:0, wins:0, losses:0, be:0, percentage:0 },
        Friday: { name:'Friday', quantity:0, wins:0, losses:0, be:0, percentage:0 },
        Saturday: { name:'Saturday', quantity:0, wins:0, losses:0, be:0, percentage:0 },
        Sunday: { name:'Sunday', quantity:0, wins:0, losses:0, be:0, percentage:0 }
      }
      getEntries.forEach((entry) => {
        assetStats.quantity[Number(entry.pair_id) - 1]++;
        timeframeStats.quantity[Number(entry.timeframe_id) - 1]++;
        strategyStats[entry.strategy_id].quantity++;
        dayWeekStats[entry.date].quantity++;
        // counts entry result
        if (entry.result == 'win') {
          counter.counterWin++
          assetStats.wins[Number(entry.pair_id) - 1]++;
          timeframeStats.wins[Number(entry.timeframe_id) - 1]++;
          strategyStats[entry.strategy_id].wins++;
          dayWeekStats[entry.date].wins++;
        } else if (entry.result == 'loss') {
          counter.counterLoss++
          assetStats.losses[Number(entry.pair_id) - 1]++;
          timeframeStats.losses[Number(entry.timeframe_id) - 1]++;
          strategyStats[entry.strategy_id].losses++;
          dayWeekStats[entry.date].losses++;
        } else {
          counter.counterBE++
          assetStats.bevens[Number(entry.pair_id) - 1]++;
          timeframeStats.bevens[Number(entry.timeframe_id) - 1]++;
          strategyStats[entry.strategy_id].be++;
          dayWeekStats[entry.date].be++;
        }
        // variables to get the profits per amount and per percentage on entry
        var entryOutcome;
        var entryOutcomePer;
        // counts entry direction & calculates the entry profit
        if (entry.direction == 'long') {
          counter.counterLong++
          // COMBAK: convert the outcome from the entry currency to the account base currency
          var entryOutcome = (entry.exit_price - entry.entry_price) * entry.size * 100000;
          var entryOutcomePer = Math.round(((entryOutcome / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
        } else {
          counter.counterShort++
          // COMBAK: convert the outcome from the entry currency to the account base currency
          var entryOutcome = (entry.entry_price - entry.exit_price) * entry.size * 100000;
          var entryOutcomePer = Math.round(((entryOutcome / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
        }
        counter.profitsAmt += entryOutcome;
        assetStats.amount[Number(entry.pair_id) - 1]+= entryOutcome;
        assetStats.percent[Number(entry.pair_id) - 1]+= entryOutcomePer;
        timeframeStats.amount[Number(entry.timeframe_id) - 1]+= entryOutcome;
        timeframeStats.percent[Number(entry.timeframe_id) - 1]+= entryOutcomePer;
        strategyStats[entry.strategy_id].percentage += entryOutcomePer;
        dayWeekStats[entry.date].percentage += entryOutcomePer;
      });
      // sorts the stats entris count to summarise the stats showcase
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
      assetStats.showcase = getMax7(assetStats.quantity);
      timeframeStats.showcase = getMax7(timeframeStats.quantity);
      // converts the profits from currency amount to %
      counter.profitsPer = Math.round(((counter.profitsAmt / req.user.balance) * 100 + Number.EPSILON) * 100) / 100
      res.render("user/statistics",
        {
          pairs:pairs,
          timeframes:timeframes,
          userBase:userBase,
          counter:counter,
          assetStats:assetStats,
          timeframeStats:timeframeStats,
          strategyStats:strategyStats,
          dayWeekStats:dayWeekStats
        }
      );
    })
  })
});

// TRADING PLAN ROUTE
router.get("/plan", middleware.isLoggedIn, (req, res) => {
  // COMBAK: ensure that order is descending in terms of created_at
  var selectPlans = 'SELECT id, title, DATE_FORMAT(created_at, "%d/%m/%Y") AS date FROM plans WHERE user_id = ?';
  connection.query(selectPlans, req.user.id, (err, getPlans) => {
    if (err) throw err;
    // Object to store the Plans
    var plans = {
      id: [],
      title: [],
      date: []
    }
    getPlans.forEach((result) => {
      plans.id.push(result.id);
      plans.title.push(result.title);
      plans.date.push(result.date);
    });
    res.render("user/plan", {plans:plans});
  })
})

// RISK CALCULATOR ROUTE
router.get("/calculator", middleware.isLoggedIn, (req, res) => {
  connection.query('SELECT currency_id FROM users WHERE id = ?', req.user.id, (err, getCurrency) => {
    if (err) throw err;
    var currency = currencies[getCurrency[0].currency_id - 1]
    res.render("user/calculator",
      {
        currencies:pairs,
        currency:currency
      }
    );
  })
})

// JOURNAL ROUTE
// BUG: problem with so many connections - create a pool - run by JORDI
router.get("/journal", middleware.isLoggedIn, (req,res) => {
  // FIXME: table not optimized - JOIN pairs is unecessary
  var selectTAs = 'SELECT tanalysis.id AS identifier, pair, DATE_FORMAT(tanalysis.created_at, "%d de %M %Y") AS created_at FROM tanalysis JOIN pairs ON tanalysis.pair_id = pairs.id WHERE user_id = ? ORDER BY tanalysis.created_at DESC LIMIT 7';
  // FIXME: table not optimized - JOIN pairs is unecessary
  var selectEntrys = 'SELECT entries.id AS identifier, DATE_FORMAT(entry_dt, "%d de %M %Y") AS entry_dt, pair FROM entries JOIN pairs ON entries.pair_id = pairs.id WHERE user_id = ? ORDER BY entry_dt DESC LIMIT 7';
  var selectComments = 'SELECT id, DATE_FORMAT(created_at, "%d/%m/%y") AS title, comment FROM comments WHERE user_id = ? ORDER BY created_at DESC LIMIT 7';
  var selectBacktest = 'SELECT id, DATE_FORMAT(created_at, "%d de %M %Y") AS title, result FROM backtest WHERE user_id = ? ORDER BY created_at DESC LIMIT 7;'
  // Defines the max. # of characters allowed when displaying comments
  var commentsLength = 45
  connection.query(selectTAs, req.user.id, (err, getTas) => {
    if (err) throw err;
    // Object to store the TAs
    var tasLimited = {
      title: [],
      id: []
    }
    getTas.forEach((result) => {
      tasLimited.title.push(result.pair + ", " + result.created_at);
      tasLimited.id.push(result.identifier);
    });
    connection.query(selectEntrys, req.user.id, (err, getEntries) => {
      if (err) throw err;
      // Object to store the ENTRIES
      var entriesLimited = {
        title: [],
        id: []
      }
      getEntries.forEach((result) => {
        entriesLimited.title.push(result.pair + ", " + result.entry_dt);
        entriesLimited.id.push(result.identifier);
      })
      connection.query(selectComments, req.user.id, (err, getComments) => {
        if (err) throw err;
        // Object to store the COMMENTS
        var commentsLimited = {
          id: [],
          date: [],
          content: []
        }
        getComments.forEach((result) => {
          commentsLimited.id.push(result.id)
          commentsLimited.date.push(result.title)
          // FIXME: this function doesn't work
          if (result.comment.length > commentsLength) {
            var trimmedComment = result.comment.substring(0, (commentsLength - 4)) + " ...";
            commentsLimited.content.push(trimmedComment)

          } else {
            commentsLimited.content.push(result.comment)
          }
        })
        connection.query(selectBacktest, req.user.id, (err, getBacktest) => {
          if (err) throw err;
          // Object to store the BACKTESTS
          var backtestLimited = {
            title: [],
            id: []
          }
          getBacktest.forEach((result) => {
            backtestLimited.title.push(result.title + " [" + result.result + "]")
            backtestLimited.id.push(result.id)
          });
          res.render("user/journal",
            {
              entries:entriesLimited,
              tas:tasLimited,
              comments:commentsLimited,
              backtest:backtestLimited,
              pairs:pairs
            }
          );
        })
      })
    })
  })
})

module.exports = router;
