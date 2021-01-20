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
  (async () => {
    try {
      var getBase  = await query('SELECT currency FROM currencies WHERE id = ?;', req.user.currency_id)
      var getGeneralInfo = await query(`SELECT IFNULL(SUM(profits) - SUM(fees), 0)
               + (SELECT balance FROM users WHERE id = ?) AS current_balance,
           COUNT(*) AS count,
           IFNULL(SUM(IF(result = 'win', 1, 0)) / COUNT(*) * 100, 'N/A') AS win_rate
        FROM entries
        WHERE user_id = ? AND status = 1;`, [req.user.id, req.user.id])
      var getAssetInfo = await query(`SELECT pair,
            (profits - IFNULL(fees, 0)) / (SELECT balance FROM users WHERE id = ?) * 100 as percent_change
        FROM entries e
            INNER JOIN pairs p on e.pair_id = p.id
        WHERE e.user_id = ? AND status = 1 ORDER BY profits DESC LIMIT 1;`, [req.user.id, req.user.id]);
      var getMonthGraph = await query(`SELECT MONTH(exit_dt) - 1 as month, SUM(profits) - SUM(fees) AS outcome,
            COUNT(*) as count
        FROM entries WHERE user_id = ? AND status = 1 GROUP BY month;`, [req.user.id])
      var getOpenTrades = await query(`SELECT entries.id, pair, pairs.category, has_rate, size, direction, entry_dt, entry_price
        FROM entries JOIN pairs ON entries.pair_id = pairs.id
        WHERE status = 0 AND entries.user_id = ?;`, [req.user.id, req.user.id])
      var getMonth = await query(`SELECT SUM((profits - fees) / (SELECT balance
        FROM users WHERE id = ?) * 100) AS month, COUNT(*) AS count FROM entries
        WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND MONTH(entry_dt) = MONTH(CURDATE()) AND status = 1 AND user_id = ?;`, [req.user.id, req.user.id])
      var getWeek = await query(`SELECT SUM((profits - fees) / (SELECT balance FROM users WHERE id = ?) * 100) AS week
        FROM entries
        WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE(), 1) AND status = 1 AND user_id = ?;`, [req.user.id, req.user.id])
      // COMBAK: improve this code
      var dataMonthGraph = {
        outcomeMonth: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        countMonth: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      }
      getMonthGraph.forEach((month) => {
        dataMonthGraph.outcomeMonth[month.month] = month.outcome;
        dataMonthGraph.countMonth[month.month] = month.count;
      });
    } catch (e) {
      console.log(e);
      // COMBAK: log error
      // Do not send flash message nor redirect, get another way of doing it
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/login');
    } finally {
      return res.render("user/user",
        {
          base: getBase[0].currency,
          key: process.env.COINLAYER_KEY,
          general: getGeneralInfo[0],
          asset: getAssetInfo[0],
          monthGraph: dataMonthGraph,
          dashboardOpen: getOpenTrades,
          // monthCount: getMonth[0].count,
          // monthPer: getMonth[0].month,
          monthCount: 4, // placeholder data
          monthPer: 4, // placeholder data
          // weekPer: getWeek[0].week,
          weekPer: 1, // placeholder data
          months: [res.__('January'), res.__('February'), res.__('March'), res.__('April'), res.__('May'), res.__('June'), res.__('July'), res.__('August'), res.__('September'), res.__('October'), res.__('November'), res.__('December')],
          options: { year: 'numeric', month: 'long', day: 'numeric' }
        }
      )
    }
  })()
}

module.exports.renderSettings = async (req, res) => {
  var selectGoals = 'SELECT goal FROM goals WHERE user_id = ?';
  var selectRole = 'SELECT role FROM roles WHERE id = ?';
  var selectPaymentInfo = 'SELECT last4 from stripe_users WHERE user_id = ?';
  var selectCustomAssets = 'SELECT id, pair FROM pairs WHERE user_id = ? AND is_custom = 1'
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
      db.query(selectCustomAssets, req.user.id, (err, getCustomAssets) => {
        if (err) {
          // COMBAK: log error
          req.flash('error', res.__('Something went wrong, please try again.'))
          return res.redirect('/' + req.user.username);
        }
        db.query(selectPaymentInfo, req.user.id, (err, getPaymentInfo) => {
          if (err) {
            // COMBAK: log error
            req.flash('error', res.__('Something went wrong, please try again.'))
            return res.redirect('/' + req.user.username);
          }
          if (getPaymentInfo.length > 0) { var last4 = getPaymentInfo[0].last4 } else { var last4 = null }
          return res.render("user/settings",
            {
              currencies: currencies,
              customAssets: getCustomAssets,
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
  })
}

module.exports.renderStatistics = (req, res) => {
  (async () => {
    var getBase = await query('SELECT currency FROM currencies WHERE id = ?;', req.user.currency_id)
    var getStats = await query(`SELECT IFNULL(SUM(profits - fees), 0)                AS outcome,
       IFNULL(SUM(profits - fees)/(SELECT balance FROM users WHERE id = ?), 0) * 100 AS percent,
       IFNULL(SUM(IF(result = 'win', 1, 0)), 0)                                      AS win,
       IFNULL(SUM(IF(result = 'loss', 1, 0)), 0)                                     AS loss,
       IFNULL(SUM(IF(result = 'be', 1, 0)), 0)                                       AS be,
       IFNULL(SUM(IF(direction = 'long', 1 , 0)), 0)                                 AS d_long,
       IFNULL(SUM(IF(direction = 'short', 1 , 0)), 0)                                AS d_short
       FROM entries WHERE user_id = ? AND status = 1`, [req.user.id, req.user.id])
    var getBestAsset = await query(`SELECT pair, SUM(profits - fees)                     AS outcome,
          SUM(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100   AS percent
      FROM entries e
          JOIN pairs p ON p.id = e.pair_id
      WHERE e.user_id = ? AND status = 1 GROUP BY pair_id ORDER BY outcome DESC LIMIT 1;`, [req.user.id, req.user.id])
    var getStrategies = await query(`SELECT strategy, COUNT(*)                          AS entries,
          AVG(profits - IFNULL(fees, 0))/(SELECT balance FROM users WHERE id = ?) * 100 AS avg_return,
          SUM(IF(result = 'win', 1, 0))                                                 AS win,
          SUM(IF(result = 'loss', 1, 0))                                                AS loss,
          SUM(IF(result = 'be', 1, 0))                                                  AS be
      FROM entries e
          JOIN strategies s ON s.id = e.strategy_id
      WHERE e.user_id = ? AND status = 1 GROUP BY strategy_id ORDER BY entries DESC LIMIT 7;`, [req.user.id, req.user.id])
    var getAssets = await query(`SELECT pair, COUNT(*)                                    AS entries,
          AVG(profits - IFNULL(fees, 0))/(SELECT balance FROM users WHERE id = ?) * 100   AS avg_return,
          SUM(IF(result = 'win', 1, 0))                                                   AS win,
          SUM(IF(result = 'loss', 1, 0))                                                  AS loss,
          SUM(IF(result = 'be', 1, 0))                                                    AS be
      FROM entries e
          JOIN pairs p ON p.id = e.pair_id
      WHERE e.user_id = ? AND status = 1 GROUP BY pair_id ORDER BY entries DESC LIMIT 7;`, [req.user.id, req.user.id, req.user.id])
    var getTimeframes = await query(`SELECT timeframe, COUNT(*)                           AS entries,
          AVG(profits - IFNULL(fees, 0))/(SELECT balance FROM users WHERE id = ?) * 100   AS avg_return,
          SUM(IF(result = 'win', 1, 0))                                                   AS win,
          SUM(IF(result = 'loss', 1, 0))                                                  AS loss,
          SUM(IF(result = 'be', 1, 0))                                                    AS be
      FROM entries e
          JOIN timeframes t ON t.id = e.timeframe_id
      WHERE e.user_id = ? AND status = 1 GROUP BY timeframe_id ORDER BY entries DESC LIMIT 7;`, [req.user.id, req.user.id])
      var getDays = await query(`SELECT DAYNAME(entry_dt) as day, COUNT(*)                  AS entries,
            AVG(profits - IFNULL(fees, 0))/(SELECT balance FROM users WHERE id = ?) * 100   AS avg_return,
            SUM(IF(result = 'win', 1, 0))                                                   AS win,
            SUM(IF(result = 'loss', 1, 0))                                                  AS loss,
            SUM(IF(result = 'be', 1, 0))                                                    AS be
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
    return res.render("user/statistics",
      {
        userBase: getBase[0].currency,
        basicStats: getStats[0],
        bestAsset: getBestAsset,
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

module.exports.renderPsychology = (req, res) => {
  res.render("user/psychology")
}

module.exports.renderCalculator = (req, res) => {
  (async () => {
    try {
      var getCurrency = await query(`SELECT currency_id FROM users WHERE id = ?`, req.user.id)
    } catch (e) {
      console.log(e);
    } finally {
      res.render("user/calculator",
        {
          currencies: req.session.assets,
          currency:currencies[getCurrency[0].currency_id - 1]
        }
      )
    }
  })()
}
