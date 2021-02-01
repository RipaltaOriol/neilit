// dependencies
const util = require('util');

// global variables
let pairs = require("../models/pairs");
let db = require('../models/dbConfig');

// node native promisify
const query = util.promisify(db.query).bind(db);

module.exports.loadEquityChart = (req, res) => {
  (async () => {
    try {
      var getEntriesLastYear = await query(`SELECT
          profits - IFNULL(fees, 0) AS net,
          DATE_FORMAT(exit_dt, '%X-%v') AS date
      FROM entries WHERE status = 1 AND user_id = ? AND exit_dt > CURDATE() - INTERVAL 1 YEAR ORDER BY exit_dt;`, req.user.id)
      var getBalance = await query(`SELECT balance, DATE_FORMAT(CURDATE() - INTERVAL 1 YEAR, '%X-%v') AS start FROM users WHERE id = ?;`, req.user.id)
      var pointerDate = getBalance[0].start
      var pointer = 0
      var equityData = []
      var lP = 0
      for (var w = 0; w < 53; w++) {
        equityData.push(getBalance[0].balance)
        for (lP; lP < getEntriesLastYear.length; lP++) {
          if (pointerDate == getEntriesLastYear[lP].date) {
            equityData[pointer] += getEntriesLastYear[lP].net
          } else {
            break;
          }
        }
        pointer++
        if (parseInt(pointerDate.split('-')[1]) !== 53) {
          var updateDatePointer = parseInt(pointerDate.split('-')[1]) + 1
          updateDatePointer = ("0" + updateDatePointer).slice(-2)
          pointerDate = pointerDate.split('-')[0] + '-' + updateDatePointer
        } else {
          var updateDatePointer = parseInt(pointerDate.split('-')[0]) + 1
          pointerDate = updateDatePointer + '-01'
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      res.json({
        data: equityData
      })
    }
  })()
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
