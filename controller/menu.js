// dependencies
const util = require('util');

// global variables
let pairs       = require('../models/pairs');
let currencies  = require('../models/currencies');
let db          = require('../models/dbConfig');

const query = util.promisify(db.query).bind(db);

// COMBAK: set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')('sk_test_51HTTZyFaIcvTY5RCCdt6kRcZcNMwtjq13cAVcs6jWWvowXuRqXQKvFCK6pYG7Q8NRSy9NQ8uCjHADKAHd36Mfosx006ajk0pov');

module.exports.renderDashboard = (req, res) => {
  var selectUserBase  = 'SELECT currency FROM currencies WHERE id = ?;'
  var selectEntries   = 'SELECT pair, profits, fees, result, MONTHNAME(exit_dt) AS month FROM entries e JOIN pairs p ON e.pair_id = p.id WHERE status = 1 AND user_id = ?;'
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
          dashboardData.biggestPair = entry.pair;
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
                months: [res.__('January'), res.__('February'), res.__('March'), res.__('April'), res.__('May'), res.__('June'), res.__('July'), res.__('August'), res.__('September'), res.__('October'), res.__('November'), res.__('December')],
                options: { year: 'numeric', month: 'long', day: 'numeric' }
              }
            );
          })
        })
      })
    })
  })
}

module.exports.renderSettings = async (req, res) => {
  var selectGoals = 'SELECT goal FROM goals WHERE user_id = ?';
  var selectRole = 'SELECT role FROM roles WHERE id = ?';
  var selectPaymentInfo = 'SELECT last4 from stripe_users WHERE user_id = ?';
  let invoice;
  if (req.user.stripeSubscriptionId) {
    invoice = await stripe.invoices.retrieveUpcoming({
      customer: req.user.stripeCustomerId,
      subscription: req.user.stripeSubscriptionId
    });
  } else {
    invoice = { total: 0, next_payment_attempt: 0 }
  }
  var goals = []
  db.query(selectGoals, req.user.id, (err, getGoals) => {
    getGoals.forEach((result) => {
      goals.push(result.goal)
    });
    db.query(selectRole, req.user.role_id, (err, getRole) => {
      if (err) {
        // COMBAK: log error
        req.flash('error', res.__('Something went wrong, please try again.'))
        return res.redirect('/' + req.user.username);
      };
      var role = getRole[0].role;
      db.query(selectPaymentInfo, req.user.id, (err, getPaymentInfo) => {
        if (err) {
          // COMBAK: log error
          req.flash('error', res.__('Something went wrong, please try again.'))
          return res.redirect('/' + req.user.username);
        }
        if (getPaymentInfo.length > 0) { var last4 = getPaymentInfo[0].last4 } else { var last4 = null }
        res.render("user/settings",
          {
            currencies: currencies,
            goals: goals,
            role: role,
            last: last4,
            amount: invoice.total,
            next: invoice.next_payment_attempt
          }
        );
      })
    })
  })
}

module.exports.renderStatistics = (req, res) => {
  (async () => {
    var getBase = await query('SELECT currency FROM currencies WHERE id = ?;', req.user.currency_id)
    var getStats = await query(`SELECT SUM(profits - fees)                AS outcome,
       SUM(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100 AS percent,
       SUM(IF(result = 'win', 1, 0))                                      AS win,
       SUM(IF(result = 'loss', 1, 0))                                     AS loss,
       SUM(IF(result = 'be', 1, 0))                                       AS be,
       SUM(IF(direction = 'long', 1 , 0))                                 AS d_long,
       SUM(IF(direction = 'short', 1 , 0))                                AS d_short
       FROM entries WHERE user_id = ? AND status = 1;`, [req.user.id, req.user.id])
    var getBestAsset = await query(`SELECT pair, SUM(profits - fees)                     AS outcome,
          SUM(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100   AS percent
      FROM entries e
          JOIN pairs p ON p.id = e.pair_id
      WHERE e.user_id = ? AND status = 1 GROUP BY pair_id ORDER BY outcome DESC LIMIT 1;`, [req.user.id, req.user.id])
    var getStrategies = await query(`SELECT strategy, COUNT(*)               AS entries,
          AVG(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100 AS avg_return,
          SUM(IF(result = 'win', 1, 0))                                      AS win,
          SUM(IF(result = 'loss', 1, 0))                                     AS loss,
          SUM(IF(result = 'be', 1, 0))                                       AS be
      FROM entries e
          JOIN strategies s ON s.id = e.strategy_id
      WHERE e.user_id = ? AND status = 1 GROUP BY strategy_id ORDER BY entries DESC LIMIT 7;`, [req.user.id, req.user.id])
    var getAssets = await query(`SELECT pair, COUNT(*)                         AS entries,
          AVG(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100   AS avg_return,
          SUM(IF(result = 'win', 1, 0))                                        AS win,
          SUM(IF(result = 'loss', 1, 0))                                       AS loss,
          SUM(IF(result = 'be', 1, 0))                                         AS be
      FROM entries e
          JOIN pairs p ON p.id = e.pair_id
      WHERE e.user_id = ? AND status = 1 GROUP BY pair_id ORDER BY entries DESC LIMIT 7;`, [req.user.id, req.user.id, req.user.id])
    var getTimeframes = await query(`SELECT timeframe, COUNT(*)                AS entries,
          AVG(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100   AS avg_return,
          SUM(IF(result = 'win', 1, 0))                                        AS win,
          SUM(IF(result = 'loss', 1, 0))                                       AS loss,
          SUM(IF(result = 'be', 1, 0))                                         AS be
      FROM entries e
          JOIN timeframes t ON t.id = e.timeframe_id
      WHERE e.user_id = ? AND status = 1 GROUP BY timeframe_id ORDER BY entries DESC LIMIT 7;`, [req.user.id, req.user.id])
      var getDays = await query(`SELECT DAYNAME(entry_dt) as day, COUNT(*)       AS entries,
            AVG(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100   AS avg_return,
            SUM(IF(result = 'win', 1, 0))                                        AS win,
            SUM(IF(result = 'loss', 1, 0))                                       AS loss,
            SUM(IF(result = 'be', 1, 0))                                         AS be
        FROM entries e
        WHERE e.user_id = ? AND status = 1 GROUP BY day ORDER BY entries DESC LIMIT 7;`, [req.user.id, req.user.id])
    var getDirectionGraph = await query(`SELECT MONTH(entry_dt) - 1 AS month,
            SUM(CASE WHEN direction = 'long' THEN profits - fees
              ELSE 0 END) AS outcome_long,
          SUM(CASE WHEN direction = 'short' THEN profits - fees
              ELSE 0 END) outcome_short
      FROM entries WHERE user_id = ? AND status = 1 GROUP BY month;`, [req.user.id, req.user.id, req.user.id])

    // COMBAK: improve this code
    var dataDirectionGraph = {
      outcomeLong: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      outcomeShort: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
    getDirectionGraph.forEach((month) => {
      dataDirectionGraph.outcomeLong[month.month] = month.outcome_long;
      dataDirectionGraph.outcomeShort[month.month] = month.outcome_short;
    });
    res.render("user/statistics",
      {
        userBase: getBase[0].currency,
        basicStats: getStats[0],
        bestAsset: getBestAsset[0],
        strategyStats: getStrategies,
        assetStats: getAssets,
        timeframeStats: getTimeframes,
        directionGraph: dataDirectionGraph,
        dayStats: getDays,
        months: [res.__('January'), res.__('February'), res.__('March'), res.__('April'), res.__('May'), res.__('June'), res.__('July'), res.__('August'), res.__('September'), res.__('October'), res.__('November'), res.__('December')]
      }
    );
  })()
}

module.exports.renderCalculator = (req, res) => {
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
}
