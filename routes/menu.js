let express       = require('express');
let router        = express.Router({mergeParams: true});
let pairs         = require('../models/pairs');
let currencies    = require('../models/currencies');
//let timeframes  = require('../models/timeframes');
let categories    = require('../models/categoriesPairs');
let menu          = require('../controller/menu')
let middleware    = require('../middleware');
let dbLocale      = require('../middleware/sqlTime')
let db            = require('../models/dbConfig');

// COMBAK: Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')('sk_test_51HTTZyFaIcvTY5RCCdt6kRcZcNMwtjq13cAVcs6jWWvowXuRqXQKvFCK6pYG7Q8NRSy9NQ8uCjHADKAHd36Mfosx006ajk0pov');

// SETTINGS ROUTE
router.get("/settings", middleware.isLoggedIn, menu.settings)

// DASHBOARD USER ROUTE
router.get("", middleware.isLoggedIn, dbLocale.reset, (req, res) => {
  let months = [res.__('January'), res.__('February'), res.__('March'), res.__('April'), res.__('May'), res.__('June'), res.__('July'), res.__('August'), res.__('September'), res.__('October'), res.__('November'), res.__('December')]
  var selectUserBase  = 'SELECT currency FROM currencies WHERE id = ?;'
  var selectEntries   = 'SELECT pair_id, profits, fees, result, MONTHNAME(exit_dt) AS month FROM entries WHERE status = 1 AND user_id = ?;'
  var selectOpen      = 'SELECT entries.id, pair, size, direction, entry_dt, entry_price FROM entries JOIN pairs ON entries.pair_id = pairs.id WHERE status = 0 AND user_id = ?;'
  var selectMonth     = 'SELECT SUM((profits - fees) / (SELECT balance FROM users WHERE id = ?) * 100) AS month, COUNT(*) as count FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND MONTH(entry_dt) = MONTH(CURDATE()) AND status = 1 AND user_id = ?;'
  var selectWeek      = 'SELECT SUM((profits - fees) / (SELECT balance FROM users WHERE id = ?) * 100) AS week FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE(), 1) AND status = 1 AND user_id = ?;'
  db.query(selectUserBase, req.user.currency_id, (err, getBase) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/login');
    }
    // object with dashboad data CURRENT BALANCE, BIGGEST TRADE & TOTAL ENTRIES
    var dashboardData = {
      base: getBase[0].currency,
      currentAmount: req.user.balance,
      currentPercent: 0,
      biggestPair: 'N/A',
      biggestPercent: 0,
      total: 0,
      rate: 0
    }
    // creates an object for monthly OUTCOME data
    var outcomeMonth = {
      January:    { outcome: 0, total: 0 },
      February:   { outcome: 0, total: 0 },
      March:      { outcome: 0, total: 0 },
      April:      { outcome: 0, total: 0 },
      May:        { outcome: 0, total: 0 },
      June:       { outcome: 0, total: 0 },
      July:       { outcome: 0, total: 0 },
      August:     { outcome: 0, total: 0 },
      September:  { outcome: 0, total: 0 },
      October:    { outcome: 0, total: 0 },
      November:   { outcome: 0, total: 0 },
      December:   { outcome: 0, total: 0 }
    }
    db.query(selectEntries, req.user.id, (err, getEntries) => {
      if (err) {
        // COMBAK: log error
        req.flash('error', res.__('Something went wrong, please try again.'))
        return res.redirect('/login');
      }
      getEntries.forEach((entry) => {
        // counts the entry to the corresponding metric
        dashboardData.total += 1;
        outcomeMonth[entry.month].total += 1;
        // counts the entry if result is WIN
        if (entry.result == 'win') { dashboardData.rate += 1 }
        // adds the entry ouctcome as amount and percent
        var entryPercent = ((entry.profits - entry.fees) / req.user.balance) * 100
        dashboardData.currentAmount += (entry.profits - entry.fees);
        // compares the entry percents to get the biggest trade
        if (entryPercent >= dashboardData.biggestPercent) {
          dashboardData.biggestPercent = entryPercent;
          dashboardData.biggestPair = pairs[entry.pair_id - 1];
        }
        outcomeMonth[entry.month].outcome += (entry.profits - entry.fees);
      });
      dashboardData.currentPercent = (dashboardData.currentAmount / req.user.balance - 1) * 100;
      dashboardData.rate = dashboardData.rate / dashboardData.total * 100;
      // divides the data in 'outcomeMonth' in two separate arrays
      var outcomeMonthAmount = [];
      var outcomeMonthTotal = [];
      for (const month in outcomeMonth) {
        outcomeMonthAmount.push(outcomeMonth[month].outcome)
        outcomeMonthTotal.push(outcomeMonth[month].total)
      }
      db.query(selectOpen, req.user.id, (err, getOpen) => {
        if (err) {
          console.log(err);
          // COMBAK: log error
          req.flash('error', res.__('Something went wrong, please try again.'))
          return res.redirect('/login');
        }
        db.query(selectMonth, [req.user.id, req.user.id], (err, getMonth) => {
          if (err) {
            // COMBAK: log error
            req.flash('error', res.__('Something went wrong, please try again.'))
            return res.redirect('/login');
          }
          db.query(selectWeek, [req.user.id, req.user.id], (err, getWeek) => {
            if (err) {
              // COMBAK: log error
              req.flash('error', res.__('Something went wrong, please try again.'))
              return res.redirect('/login');
            }
            res.render("user/user",
              {
                dashboardData: dashboardData,
                outcomeMonthAmount: outcomeMonthAmount,
                outcomeMonthTotal: outcomeMonthTotal,
                dashboardOpen: getOpen,
                monthCount: getMonth[0].count,
                monthPer: getMonth[0].month,
                weekPer: getWeek[0].week,
                months: months,
                options: { year: 'numeric', month: 'long', day: 'numeric' }
              }
            );
          })
        })
      })
    })
  })
})

// STATISTICS ROUTE
router.get("/statistics", middleware.isLoggedIn, dbLocale.reset, (req, res) => {
  let months = [res.__('January'), res.__('February'), res.__('March'), res.__('April'), res.__('May'), res.__('June'), res.__('July'), res.__('August'), res.__('September'), res.__('October'), res.__('November'), res.__('December')]
  var selectUserBase = 'SELECT currency FROM currencies WHERE id = ?;'
  var selectEntries = 'SELECT pair_id, strategy_id, timeframe_id, direction, result, profits, fees, MONTH(entry_dt) as month, DATE_FORMAT(entry_dt, \'%W\') AS date FROM entries WHERE status = 1 AND user_id = ?;';
  db.query(selectUserBase, req.user.currency_id, (err, getBase) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username);
    }
    var userBase = getBase[0].currency;
    // creates an object to store the asset stats
    var assetStats = {
      quantity: Array(pairs.length).fill(0),
      win:      Array(pairs.length).fill(0),
      loss:     Array(pairs.length).fill(0),
      be:       Array(pairs.length).fill(0),
      amount:   Array(pairs.length).fill(0),
      percent:  Array(pairs.length).fill(0)
    }
    // creates an object to store the timeframe stats
    var timeframeStats = {
      quantity: Array(timeframes.length).fill(0),
      win:      Array(timeframes.length).fill(0),
      loss:     Array(timeframes.length).fill(0),
      be:       Array(timeframes.length).fill(0),
      amount:   Array(timeframes.length).fill(0),
      percent:  Array(timeframes.length).fill(0)
    }
    db.query(selectEntries, req.user.id, (err, getEntries) => {
      if (err) {
        // COMBAK: log error
        req.flash('error', res.__('Something went wrong, please try again.'))
        return res.redirect('/' + req.user.username);
      }
      // object with the statiscits from PROFITS, ENTRIES and DIRECTION
      var statistics = {
        profits: {
          amount: 0,
          percent: 0
        },
        entries: {
          win: 0,
          loss: 0,
          be: 0
        },
        direction: {
          long: 0,
          short: 0
        },
        directionPer: {
          long: Array(12).fill(0),
          short: Array(12).fill(0)
        }
      }
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
      // creates an object to store the day of the week stats
      var dayWeekStats = {
        Monday:     { name:'Monday',    quantity:0, win:0, loss:0, be:0, percent:0 },
        Tuesday:    { name:'Tuesday',   quantity:0, win:0, loss:0, be:0, percent:0 },
        Wednesday:  { name:'Wednesday', quantity:0, win:0, loss:0, be:0, percent:0 },
        Thursday:   { name:'Thursday',  quantity:0, win:0, loss:0, be:0, percent:0 },
        Friday:     { name:'Friday',    quantity:0, win:0, loss:0, be:0, percent:0 },
        Saturday:   { name:'Saturday',  quantity:0, win:0, loss:0, be:0, percent:0 },
        Sunday:     { name:'Sunday',    quantity:0, win:0, loss:0, be:0, percent:0 }
      }
      getEntries.forEach((entry) => {
        var entryPercent = Math.round((((entry.profits - entry.fees) / req.user.balance) * 100 + Number.EPSILON) * 100) / 100;
        // counts the entry to the corresponding metric
        assetStats.quantity[Number(entry.pair_id) - 1]++;
        timeframeStats.quantity[Number(entry.timeframe_id) - 1]++;
        strategyStats[entry.strategy_id].quantity++;
        dayWeekStats[entry.date].quantity++;
        // counts the entry result to the corresponding metric
        if (entry.result == 'win') {
          statistics.entries.win++
          assetStats.win[Number(entry.pair_id) - 1]++;
          timeframeStats.win[Number(entry.timeframe_id) - 1]++;
          strategyStats[entry.strategy_id].win++;
          dayWeekStats[entry.date].win++;
        } else if (entry.result == 'loss') {
          statistics.entries.loss++
          assetStats.loss[Number(entry.pair_id) - 1]++;
          timeframeStats.loss[Number(entry.timeframe_id) - 1]++;
          strategyStats[entry.strategy_id].loss++;
          dayWeekStats[entry.date].loss++;
        } else {
          statistics.entries.be++
          assetStats.be[Number(entry.pair_id) - 1]++;
          timeframeStats.be[Number(entry.timeframe_id) - 1]++;
          strategyStats[entry.strategy_id].be++;
          dayWeekStats[entry.date].be++;
        }
        // counts entry direction & calculates the entry profit
        if (entry.direction == 'long') {
          statistics.direction.long++
          statistics.directionPer.long[entry.month - 1]+= entryPercent
        } else {
          statistics.direction.short++
          statistics.directionPer.short[entry.month - 1]+= entryPercent
        }
        statistics.profits.amount+=                               (entry.profits - entry.fees);
        // adds the entry ouctcome for its corresponding asset
        assetStats.amount[Number(entry.pair_id) - 1]+=            (entry.profits - entry.fees);
        assetStats.percent[Number(entry.pair_id) - 1]+=           entryPercent;
        // adds the entry ouctcome for its corresponding timeframe
        timeframeStats.amount[Number(entry.timeframe_id) - 1]+=   (entry.profits - entry.fees);
        timeframeStats.percent[Number(entry.timeframe_id) - 1]+=  entryPercent;
        // adds the entry ouctcome for its corresponding strategy
        strategyStats[entry.strategy_id].percent +=               entryPercent;
        // adds the entry outcome for tis corresponding weekday
        dayWeekStats[entry.date].percent +=                       entryPercent;
      });
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
      assetStats.showcase     = getMax7(assetStats.quantity);
      timeframeStats.showcase = getMax7(timeframeStats.quantity);
      // converts the profits from amount to %
      statistics.profits.percent = Math.round(((statistics.profits.amount / req.user.balance) * 100 + Number.EPSILON) * 100) / 100
      res.render("user/statistics",
        {
          pairs: pairs,
          timeframes: timeframes,
          userBase: userBase,
          statistics: statistics,
          assetStats: assetStats,
          timeframeStats: timeframeStats,
          strategyStats: strategyStats,
          dayWeekStats: dayWeekStats,
          months: months
        }
      );
    })
  })
});

// RISK CALCULATOR ROUTE
router.get("/calculator", middleware.isLoggedIn, (req, res) => {
  db.query('SELECT currency_id FROM users WHERE id = ?', req.user.id, (err, getCurrency) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username);
    }
    var currency = currencies[getCurrency[0].currency_id - 1]
    res.render("user/calculator",
      {
        currencies:pairs,
        currency:currency
      }
    );
  })
})

module.exports = router;
