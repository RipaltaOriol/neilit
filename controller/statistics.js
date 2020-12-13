// dependencies
const util = require('util');

// global variables
let pairs = require("../models/pairs");
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

module.exports.profits = (req, res) => {
  (async () => {
    try {
      switch (req.params.period) {
        case 'today':
          var getEntries = await query(`SELECT IFNULL(SUM(profits - fees), 0)                    AS outcome,
                  IFNULL(SUM(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100, 0)  AS percent
              FROM entries WHERE entry_dt > CURDATE() AND status = 1 AND user_id = ?;`, [req.user.id, req.user.id]);
          break;
        case 'cweek':
          var getEntries = await query(`SELECT IFNULL(SUM(profits - fees), 0)                    AS outcome,
                  IFNULL(SUM(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100, 0)  AS percent
              FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE(), 1) AND status = 1 AND user_id = ?;`, [req.user.id, req.user.id]);
          break;
        case 'lweek':
          var getEntries = await query(`SELECT IFNULL(SUM(profits - fees), 0)                    AS outcome,
                  IFNULL(SUM(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100, 0)  AS percent
              FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1) AND status = 1 AND user_id = ?;`, [req.user.id, req.user.id]);
          break;
        case 'cmonth':
          var getEntries = await query(`SELECT IFNULL(SUM(profits - fees), 0)                    AS outcome,
                  IFNULL(SUM(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100, 0)  AS percent
              FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND MONTH(entry_dt) = MONTH(CURDATE()) AND status = 1 AND user_id = ?;`, [req.user.id, req.user.id]);
          break;
        case 'lmonth':
          var getEntries = await query(`SELECT IFNULL(SUM(profits - fees), 0)                    AS outcome,
                  IFNULL(SUM(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100, 0)  AS percent
              FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(entry_dt) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND status = 1 AND user_id = ?;`, [req.user.id, req.user.id]);
          break;
        case 'cquarter':
          var getEntries = await query(`SELECT IFNULL(SUM(profits - fees), 0)                    AS outcome,
                  IFNULL(SUM(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100, 0)  AS percent
              FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND QUARTER(entry_dt) = QUARTER(CURDATE()) AND status = 1 AND user_id = ?;`, [req.user.id, req.user.id]);
          break;
        case 'lquarter':
          var getEntries = await query(`SELECT IFNULL(SUM(profits - fees), 0)                    AS outcome,
                  IFNULL(SUM(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100, 0)  AS percent
              FROM entries
              WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 QUARTER) AND QUARTER(entry_dt) = QUARTER(CURDATE() - INTERVAL 1 QUARTER) AND status = 1 AND user_id = ?;`, [req.user.id, req.user.id]);
          break;
        case 'all':
          var getEntries = await query(`SELECT IFNULL(SUM(profits - fees), 0)                    AS outcome,
                  IFNULL(SUM(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100, 0)  AS percent
              FROM entries WHERE status = 1 AND user_id = ?;`, [req.user.id, req.user.id]);
          break;
      }
    } catch (e) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    } finally {
      res.json({
        amount: getEntries[0].outcome,
        percent: getEntries[0].percent
      })
    }
  })()
}

module.exports.customProfits = (req, res) => {
  (async () => {
    try {
      var getEntries = await query(`SELECT IFNULL(SUM(profits - fees), 0)                    AS outcome,
              IFNULL(SUM(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100, 0)  AS percent
          FROM entries WHERE status = 1 AND user_id = ? AND entry_dt > ? AND entry_dt < ?;`, [req.user.id, req.user.id, req.params.from, req.params.to]);
    } catch (e) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    } finally {
      res.json({
        amount: getEntries[0].outcome,
        percent: getEntries[0].percent
      })
    }
  })()
}

module.exports.accountEntries = (req, res) => {
  (async () => {
    try {
      switch (req.params.period) {
        case 'today':
          var getEntries = await query(`SELECT SUM(IF(result = 'win', 1, 0))       AS win,
                SUM(IF(result = 'loss', 1, 0))                                     AS loss,
                SUM(IF(result = 'be', 1, 0))                                       AS be
            FROM entries WHERE entry_dt > CURDATE() AND status = 1 AND user_id = ?;`, req.user.id);
          break;
        case 'cweek':
          var getEntries = await query(`SELECT SUM(IF(result = 'win', 1, 0))       AS win,
                SUM(IF(result = 'loss', 1, 0))                                     AS loss,
                SUM(IF(result = 'be', 1, 0))                                       AS be
            FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE(), 1) AND status = 1 AND user_id = ?;`, req.user.id);
          break;
        case 'lweek':
          var getEntries = await query(`SELECT SUM(IF(result = 'win', 1, 0))       AS win,
                SUM(IF(result = 'loss', 1, 0))                                     AS loss,
                SUM(IF(result = 'be', 1, 0))                                       AS be
            FROM entries WHERE YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1) AND status = 1 AND user_id = ?;`, req.user.id);
          break;
        case 'cmonth':
          var getEntries = await query(`SELECT SUM(IF(result = 'win', 1, 0))       AS win,
                SUM(IF(result = 'loss', 1, 0))                                     AS loss,
                SUM(IF(result = 'be', 1, 0))                                       AS be
            FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND MONTH(entry_dt) = MONTH(CURDATE()) AND status = 1 AND user_id = ?;`, req.user.id);
          break;
        case 'lmonth':
          var getEntries = await query(`SELECT SUM(IF(result = 'win', 1, 0))       AS win,
                SUM(IF(result = 'loss', 1, 0))                                     AS loss,
                SUM(IF(result = 'be', 1, 0))                                       AS be
            FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(entry_dt) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND status = 1 AND user_id = ?;`, req.user.id);
          break;
        case 'cquarter':
          var getEntries = await query(`SELECT SUM(IF(result = 'win', 1, 0))       AS win,
                SUM(IF(result = 'loss', 1, 0))                                     AS loss,
                SUM(IF(result = 'be', 1, 0))                                       AS be
            FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE()) AND QUARTER(entry_dt) = QUARTER(CURDATE()) AND status = 1 AND user_id = ?;`, req.user.id);
          break;
        case 'lquarter':
          var getEntries = await query('SELECT result FROM entries WHERE YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 QUARTER) AND QUARTER(entry_dt) = QUARTER(CURDATE() - INTERVAL 1 QUARTER) AND status = 1 AND user_id = ?;', req.user.id);
          break;
        case 'all':
          var getEntries = await query(`SELECT SUM(IF(result = 'win', 1, 0))       AS win,
                SUM(IF(result = 'loss', 1, 0))                                     AS loss,
                SUM(IF(result = 'be', 1, 0))                                       AS be
            FROM entries WHERE status = 1 AND user_id = ?;`, req.user.id);
          break;
      }
    } catch (e) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    } finally {
      res.json({
        win: getEntries[0].win,
        loss: getEntries[0].loss,
        be: getEntries[0].be
      })
    }
  })()
}

module.exports.customAccountEntries = (req, res) => {
  (async () => {
    try {
      var getEntries = await query(`SELECT SUM(IF(result = 'win', 1, 0))  AS win,
              SUM(IF(result = 'loss', 1, 0))                                     AS loss,
              SUM(IF(result = 'be', 1, 0))                                       AS be
          FROM entries WHERE status = 1 AND user_id = ? AND entry_dt > ? AND entry_dt < ?;`, [req.user.id, req.params.from, req.params.to]);
    } catch (e) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    } finally {
      res.json({
        win: getEntries[0].win,
        loss: getEntries[0].loss,
        be: getEntries[0].be
      })
    }
  })()
}

module.exports.bestAsset = (req, res) => {
  (async () => {
    try {
      switch (req.params.period) {
        case 'today':
          var queryPeriod = 'AND entry_dt > CURDATE()'
          break;
        case 'cweek':
          var queryPeriod = 'AND YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE(), 1)'
          break;
        case 'lweek':
          var queryPeriod = 'AND YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1)'
          break;
        case 'cmonth':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE()) AND MONTH(entry_dt) = MONTH(CURDATE())'
          break;
        case 'lmonth':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(entry_dt) = MONTH(CURDATE() - INTERVAL 1 MONTH)'
          break;
        case 'cquarter':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE()) AND QUARTER(entry_dt) = QUARTER(CURDATE())'
          break;
        case 'lquarter':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 QUARTER) AND QUARTER(entry_dt) = QUARTER(CURDATE() - INTERVAL 1 QUARTER)'
          break;
        case 'all':
          var queryPeriod = ''
          break;
      }
      var queryBestAsset = `SELECT pair, SUM(profits - fees)                     AS outcome,
            SUM(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100   AS percent
        FROM entries e
            JOIN pairs p ON p.id = e.pair_id
        WHERE e.user_id = ? AND status = 1 ${queryPeriod} GROUP BY pair_id ORDER BY outcome DESC LIMIT 1;`
      var getBestAsset = await query(queryBestAsset, [req.user.id, req.user.id])
    } catch (e) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    } finally {
      res.json({
        amount: (getBestAsset.length > 0) ? getBestAsset[0].outcome : 0,
        percent: (getBestAsset.length > 0) ? getBestAsset[0].percent : 0,
        pair: (getBestAsset.length > 0) ? getBestAsset[0].pair : 'N/A'
      })
    }
  })()
}

module.exports.customBestAsset = (req, res) => {
  var amount = 0;
  var percent = 0;
  var pair = 'N/A';
  (async () => {
    try {
      var getBestAsset = await query(`SELECT pair, SUM(profits - fees)           AS outcome,
              SUM(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100   AS percent
          FROM entries e
              JOIN pairs p ON p.id = e.pair_id
          WHERE e.user_id = ? AND status = 1 AND entry_dt > ? AND entry_dt < ? GROUP BY pair_id ORDER BY outcome DESC LIMIT 1;`, [req.user.id, req.user.id, req.params.from, req.params.to]);
    } catch (e) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    } finally {
      res.json({
        amount: (getBestAsset.length > 0) ? getBestAsset[0].outcome : 0,
        percent: (getBestAsset.length > 0) ? getBestAsset[0].percent : 0,
        pair: (getBestAsset.length > 0) ? getBestAsset[0].pair : 'N/A'
      })
    }
  })()
}

module.exports.directionDistribution = (req, res) => {
  (async () => {
    try {
      switch (req.params.period) {
        case 'today':
          var queryPeriod = 'AND entry_dt > CURDATE()'
          break;
        case 'cweek':
          var queryPeriod = 'AND YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE(), 1)'
          break;
        case 'lweek':
          var queryPeriod = 'AND YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1)'
          break;
        case 'cmonth':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE()) AND MONTH(entry_dt) = MONTH(CURDATE())'
          break;
        case 'lmonth':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(entry_dt) = MONTH(CURDATE() - INTERVAL 1 MONTH)'
          break;
        case 'cquarter':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE()) AND QUARTER(entry_dt) = QUARTER(CURDATE())'
          break;
        case 'lquarter':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 QUARTER) AND QUARTER(entry_dt) = QUARTER(CURDATE() - INTERVAL 1 QUARTER)'
          break;
        case 'all':
          var queryPeriod = ''
          break;
      }
      var getDirection = await query(`SELECT SUM(IF(direction = 'long', 1 , 0)) AS d_long,
       SUM(IF(direction = 'short', 1 , 0))                                      AS d_short
       FROM entries WHERE user_id = ? AND status = 1 ${queryPeriod};`, req.user.id)
    } catch (e) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    } finally {
      res.json({
        long: getDirection[0].d_long,
        short: getDirection[0].d_short
      })
    }
  })()
}

module.exports.customDirectionDistribution = (req, res) => {
  (async () => {
    try {
      var getEntries = await query(`SELECT SUM(IF(direction = 'long', 1 , 0)) AS d_long,
       SUM(IF(direction = 'short', 1 , 0))                                    AS d_short
       FROM entries WHERE user_id = ? AND status = 1
          AND user_id = ? AND entry_dt > ? AND entry_dt < ?;`, [req.user.id, req.params.from, req.params.to]);
    } catch (e) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    } finally {
      res.json({
        long: getDirection[0].d_long,
        short: getDirection[0].d_short
      })
    }
  })()
}

module.exports.directionGraph = (req, res) => {
  (async () => {
    try {
      switch (req.params.period) {
        case 'today':
          var queryPeriod = 'AND entry_dt > CURDATE()'
          break;
        case 'cweek':
          var queryPeriod = 'AND YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE(), 1)'
          break;
        case 'lweek':
          var queryPeriod = 'AND YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1)'
          break;
        case 'cmonth':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE()) AND MONTH(entry_dt) = MONTH(CURDATE())'
          break;
        case 'lmonth':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(entry_dt) = MONTH(CURDATE() - INTERVAL 1 MONTH)'
          break;
        case 'cquarter':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE()) AND QUARTER(entry_dt) = QUARTER(CURDATE())'
          break;
        case 'lquarter':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 QUARTER) AND QUARTER(entry_dt) = QUARTER(CURDATE() - INTERVAL 1 QUARTER)'
          break;
        case 'all':
          var queryPeriod = ''
          break;
      }
      var getDirectionGraph = await query(`SELECT MONTH(entry_dt) - 1 AS month,
              SUM(CASE WHEN direction = 'long' THEN profits - fees
                ELSE 0 END) AS outcome_long,
            SUM(CASE WHEN direction = 'short' THEN profits - fees
                ELSE 0 END) outcome_short
        FROM entries WHERE user_id = ? AND status = 1 ${queryPeriod} GROUP BY month;`, [req.user.id, req.user.id, req.user.id])
        // COMBAK: improve this code
        var dataDirectionGraph = {
          outcomeLong: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          outcomeShort: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
        getDirectionGraph.forEach((month) => {
          dataDirectionGraph.outcomeLong[month.month] = month.outcome_long;
          dataDirectionGraph.outcomeShort[month.month] = month.outcome_short;
        });
    } catch (e) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    } finally {
      res.json({
        long: dataDirectionGraph.outcomeLong,
        short: dataDirectionGraph.outcomeShort
      })
    }
  })()
}

module.exports.customDirectionGraph = (req, res) => {
  (async () => {
    try {
      var getDirectionGraph = await query(`SELECT MONTH(entry_dt) - 1 AS month,
            SUM(CASE WHEN direction = 'long' THEN profits - fees
                ELSE 0 END) AS outcome_long,
            SUM(CASE WHEN direction = 'short' THEN profits - fees
                ELSE 0 END) outcome_short
        FROM entries WHERE user_id = ? AND status = 1
            AND entry_dt > ? AND entry_dt < ? GROUP BY month;`, [req.user.id, req.user.id, req.user.id, req.params.from, req.params.to])
      // COMBAK: improve this code
      var dataDirectionGraph = {
        outcomeLong: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        outcomeShort: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      }
      getDirectionGraph.forEach((month) => {
        dataDirectionGraph.outcomeLong[month.month] = month.outcome_long;
        dataDirectionGraph.outcomeShort[month.month] = month.outcome_short;
      });
    } catch (e) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    } finally {
      res.json({
        long: dataDirectionGraph.outcomeLong,
        short: dataDirectionGraph.outcomeShort
      })
    }
  })()
}

module.exports.renderStrategies = (req, res) => {
  (async () => {
    var getStrategiesGraph = await query(`SELECT strategy, MONTH(entry_dt) - 1 AS month,
            SUM(profits - fees)                                            AS outcome
        FROM entries e
            JOIN strategies s ON e.strategy_id = s.id WHERE e.user_id = ? AND status = 1
        GROUP BY strategy, month;`, req.user.id)
    var getStrategiesRadar = await query(`SELECT strategy, SUM(profits - fees)           AS outcome
        FROM entries e
            JOIN strategies s ON e.strategy_id = s.id WHERE e.user_id = ? AND status = 1
        GROUP BY strategy_id ORDER BY e.strategy_id;`, req.user.id)
    var getStrategies = await query(`SELECT strategy, COUNT(*)               AS entries,
          AVG(profits - fees)/(SELECT balance FROM users WHERE id = 1) * 100 AS avg_return,
          SUM(IF(result = 'win', 1, 0))                                      AS win,
          SUM(IF(result = 'loss', 1, 0))                                     AS loss,
          SUM(IF(result = 'be', 1, 0))                                       AS be,
          SUM(IF(result = 'win', 1, 0))/COUNT(*) * 100                       AS win_rate,
          (SUM(IF(result = 'win', profits, 0))
            / SUM(IF(result = 'win', 1, 0))) *
            (SUM(IF(result = 'win', 1, 0))/COUNT(*))
          + (SUM(IF(result = 'loss', profits, 0))
            / SUM(IF(result = 'loss', 1, 0))) *
            (SUM(IF(result = 'win', 1, 0))/COUNT(*) - 1) AS expected_result
      FROM entries e
          LEFT JOIN strategies s ON s.id = e.strategy_id
      WHERE e.user_id = 1 AND status = 1 GROUP BY strategy_id ORDER BY entries DESC;`, req.user.id)
    // COMBAK: improve this code
    var dataStrategyGraph = { }
    var dataStrategyRadar = { }
    req.session.strategyNames.forEach((strategy) => {
      dataStrategyGraph[strategy] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      dataStrategyRadar[strategy] = 0;
    });
    getStrategiesGraph.forEach((strategy) => {
      dataStrategyGraph[strategy.strategy][strategy.month] = strategy.outcome
    });
    getStrategiesRadar.forEach((strategy) => {
      dataStrategyRadar[strategy.strategy] = strategy.outcome
    });
    res.render('user/statistics/details-strategies',
      {
        strategyStats: getStrategies,
        strategyGraph: dataStrategyGraph,
        strategyRadar: dataStrategyRadar,
        months: [res.__('January'), res.__('February'), res.__('March'), res.__('April'), res.__('May'), res.__('June'), res.__('July'), res.__('August'), res.__('September'), res.__('October'), res.__('November'), res.__('December')]
      }
    )
  })()
}

module.exports.strategies = (req, res) => {
  (async () => {
    try {
      switch (req.params.period) {
        case 'today':
          var queryPeriod = 'AND entry_dt > CURDATE()'
          break;
        case 'cweek':
          var queryPeriod = 'AND YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE(), 1)'
          break;
        case 'lweek':
          var queryPeriod = 'AND YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1)'
          break;
        case 'cmonth':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE()) AND MONTH(entry_dt) = MONTH(CURDATE())'
          break;
        case 'lmonth':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(entry_dt) = MONTH(CURDATE() - INTERVAL 1 MONTH)'
          break;
        case 'cquarter':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE()) AND QUARTER(entry_dt) = QUARTER(CURDATE())'
          break;
        case 'lquarter':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 QUARTER) AND QUARTER(entry_dt) = QUARTER(CURDATE() - INTERVAL 1 QUARTER)'
          break;
        case 'all':
          var queryPeriod = ''
          break;
      }
      var getStrategies = await query(`SELECT strategy, COUNT(*)               AS entries,
            AVG(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100 AS avg_return,
            SUM(IF(result = 'win', 1, 0))                                      AS win,
            SUM(IF(result = 'loss', 1, 0))                                     AS loss,
            SUM(IF(result = 'be', 1, 0))                                       AS be
        FROM entries e
            JOIN strategies s ON s.id = e.strategy_id
        WHERE e.user_id = ? AND status = 1 ${queryPeriod} GROUP BY strategy_id ORDER BY entries DESC LIMIT 7;`, [req.user.id, req.user.id])
    } catch (e) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    } finally {
      res.json({
        strategyStats: getStrategies
      })
    }
  })()
}

module.exports.renderAsset = (req, res) => {
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
      //assetStats.month[entry.pair_id - 1][entry.month - 1] += (entry.profits - entry.fees);
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
}

module.exports.asset = (req, res) => {
  (async () => {
    try {
      switch (req.params.period) {
        case 'today':
          var queryPeriod = 'AND entry_dt > CURDATE()'
          break;
        case 'cweek':
          var queryPeriod = 'AND YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE(), 1)'
          break;
        case 'lweek':
          var queryPeriod = 'AND YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1)'
          break;
        case 'cmonth':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE()) AND MONTH(entry_dt) = MONTH(CURDATE())'
          break;
        case 'lmonth':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(entry_dt) = MONTH(CURDATE() - INTERVAL 1 MONTH)'
          break;
        case 'cquarter':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE()) AND QUARTER(entry_dt) = QUARTER(CURDATE())'
          break;
        case 'lquarter':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 QUARTER) AND QUARTER(entry_dt) = QUARTER(CURDATE() - INTERVAL 1 QUARTER)'
          break;
        case 'all':
          var queryPeriod = ''
          break;
      }
      var getAssets = await query(`SELECT pair, COUNT(*)                         AS entries,
            AVG(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100   AS avg_return,
            SUM(IF(result = 'win', 1, 0))                                        AS win,
            SUM(IF(result = 'loss', 1, 0))                                       AS loss,
            SUM(IF(result = 'be', 1, 0))                                         AS be
        FROM entries e
            JOIN pairs p ON p.id = e.pair_id
        WHERE e.user_id = ? AND status = 1 ${queryPeriod} GROUP BY pair_id ORDER BY entries DESC LIMIT 7;`, [req.user.id, req.user.id])
    } catch (e) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    } finally {
      res.json({
        assetStats: getAssets
      })
    }
  })()
}

module.exports.renderTimeframes = (req, res) => {
  var getEntries = 'SELECT timeframe_id, result, profits, fees FROM entries WHERE status = 1 AND user_id = ?;'
  // creates an object to store the timeframe stats
  var timeframeStats = {
    quantity:         Array(req.session.timeframes.length).fill(0),
    win:              Array(req.session.timeframes.length).fill(0),
    loss:             Array(req.session.timeframes.length).fill(0),
    be:               Array(req.session.timeframes.length).fill(0),
    amount:           Array(req.session.timeframes.length).fill(0),
    percent:          Array(req.session.timeframes.length).fill(0),
    totalWinPercent:  Array(req.session.timeframes.length).fill(0),
    totalLossPercent: Array(req.session.timeframes.length).fill(0),
    expected:         Array(req.session.timeframes.length).fill(0)
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
        timeframes: req.session.timeframes,
        timeframeStats: timeframeStats,
        tfByCount: tfByCount,
        tfByOutcome: tfByOutcome
      }
    )
  })
}

module.exports.timeframes = (req, res) => {
  (async () => {
    try {
      switch (req.params.period) {
        case 'today':
          var queryPeriod = 'AND entry_dt > CURDATE()'
          break;
        case 'cweek':
          var queryPeriod = 'AND YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE(), 1)'
          break;
        case 'lweek':
          var queryPeriod = 'AND YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1)'
          break;
        case 'cmonth':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE()) AND MONTH(entry_dt) = MONTH(CURDATE())'
          break;
        case 'lmonth':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(entry_dt) = MONTH(CURDATE() - INTERVAL 1 MONTH)'
          break;
        case 'cquarter':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE()) AND QUARTER(entry_dt) = QUARTER(CURDATE())'
          break;
        case 'lquarter':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 QUARTER) AND QUARTER(entry_dt) = QUARTER(CURDATE() - INTERVAL 1 QUARTER)'
          break;
        case 'all':
          var queryPeriod = ''
          break;
      }
      var getTimeframes = await query(`SELECT timeframe, COUNT(*)                AS entries,
            AVG(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100   AS avg_return,
            SUM(IF(result = 'win', 1, 0))                                        AS win,
            SUM(IF(result = 'loss', 1, 0))                                       AS loss,
            SUM(IF(result = 'be', 1, 0))                                         AS be
        FROM entries e
            JOIN timeframes t ON t.id = e.timeframe_id
        WHERE e.user_id = ? AND status = 1 ${queryPeriod} GROUP BY timeframe_id ORDER BY entries DESC LIMIT 7;`, [req.user.id, req.user.id])
    } catch (e) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    } finally {
      res.json({
        timeframeStats: getTimeframes
      })
    }
  })()
}

module.exports.renderDays = (req, res) => {
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
}

module.exports.days = (req, res) => {
  (async () => {
    try {
      switch (req.params.period) {
        case 'today':
          var queryPeriod = 'AND entry_dt > CURDATE()'
          break;
        case 'cweek':
          var queryPeriod = 'AND YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE(), 1)'
          break;
        case 'lweek':
          var queryPeriod = 'AND YEARWEEK(DATE(entry_dt), 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1)'
          break;
        case 'cmonth':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE()) AND MONTH(entry_dt) = MONTH(CURDATE())'
          break;
        case 'lmonth':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(entry_dt) = MONTH(CURDATE() - INTERVAL 1 MONTH)'
          break;
        case 'cquarter':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE()) AND QUARTER(entry_dt) = QUARTER(CURDATE())'
          break;
        case 'lquarter':
          var queryPeriod = 'AND YEAR(entry_dt) = YEAR(CURDATE() - INTERVAL 1 QUARTER) AND QUARTER(entry_dt) = QUARTER(CURDATE() - INTERVAL 1 QUARTER)'
          break;
        case 'all':
          var queryPeriod = ''
          break;
      }
      var getDays = await query(`SELECT DAYNAME(entry_dt) as day, COUNT(*)       AS entries,
            AVG(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100   AS avg_return,
            SUM(IF(result = 'win', 1, 0))                                        AS win,
            SUM(IF(result = 'loss', 1, 0))                                       AS loss,
            SUM(IF(result = 'be', 1, 0))                                         AS be
        FROM entries e
        WHERE e.user_id = ? AND status = 1 ${queryPeriod} GROUP BY day ORDER BY entries DESC LIMIT 7;`, [req.user.id, req.user.id])
    } catch (e) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    } finally {
      res.json({
        dayStats: getDays
      })
    }
  })()
}

module.exports.custom = (req, res) => {
  (async () => {
    try {
      switch (req.params.table) {
        case 'strategies':
          var getCustomData = await query(`SELECT strategy, COUNT(*)               AS entries,
                AVG(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100 AS avg_return,
                SUM(IF(result = 'win', 1, 0))                                      AS win,
                SUM(IF(result = 'loss', 1, 0))                                     AS loss,
                SUM(IF(result = 'be', 1, 0))                                       AS be
            FROM entries e
                JOIN strategies s ON s.id = e.strategy_id
            WHERE e.user_id = ? AND status = 1
                AND entry_dt > ? AND entry_dt < ? GROUP BY strategy_id ORDER BY entries DESC LIMIT 7;`, [req.user.id, req.user.id, req.params.from, req.params.to])
          break;
        case 'assets':
        var getCustomData = await query(`SELECT pair, COUNT(*)                         AS entries,
              AVG(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100   AS avg_return,
              SUM(IF(result = 'win', 1, 0))                                        AS win,
              SUM(IF(result = 'loss', 1, 0))                                       AS loss,
              SUM(IF(result = 'be', 1, 0))                                         AS be
          FROM entries e
              JOIN pairs p ON p.id = e.pair_id
          WHERE e.user_id = ? AND status = 1
              AND entry_dt > ? AND entry_dt < ? GROUP BY pair_id ORDER BY entries DESC LIMIT 7;`, [req.user.id, req.user.id, req.params.from, req.params.to])
          break;
        case 'timeframes':
        var getCustomData = await query(`SELECT timeframe, COUNT(*)                AS entries,
              AVG(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100   AS avg_return,
              SUM(IF(result = 'win', 1, 0))                                        AS win,
              SUM(IF(result = 'loss', 1, 0))                                       AS loss,
              SUM(IF(result = 'be', 1, 0))                                         AS be
          FROM entries e
              JOIN timeframes t ON t.id = e.timeframe_id
          WHERE e.user_id = ? AND status = 1
          AND entry_dt > ? AND entry_dt < ? GROUP BY timeframe_id ORDER BY entries DESC LIMIT 7;`, [req.user.id, req.user.id, req.params.from, req.params.to])
          break;

        case 'days':
        var getCustomData = await query(`SELECT DAYNAME(entry_dt) as day, COUNT(*)       AS entries,
              AVG(profits - fees)/(SELECT balance FROM users WHERE id = ?) * 100   AS avg_return,
              SUM(IF(result = 'win', 1, 0))                                        AS win,
              SUM(IF(result = 'loss', 1, 0))                                       AS loss,
              SUM(IF(result = 'be', 1, 0))                                         AS be
          FROM entries e
          WHERE e.user_id = ? AND status = 1
          AND entry_dt > ? AND entry_dt < ? GROUP BY day ORDER BY entries DESC LIMIT 7;`, [req.user.id, req.user.id, req.params.from, req.params.to])
          break;
      }
    } catch (e) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username + '/statistics');
    } finally {
      res.json({
        customData: getCustomData
      })
    }
  })()
}
