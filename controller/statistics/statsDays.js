// dependencies
const util = require('util');

// global variables
let db      = require('../../models/dbConfig');
let logger  = require('../../models/winstonConfig');

// node native promisify
const query = util.promisify(db.query).bind(db);

module.exports.renderDays = (req, res) => {
  (async () => {
    try {
      var getDays = await query(`SELECT * FROM (
          (SELECT DAYOFWEEK(entry_dt) AS day, COUNT(*)                                           AS entries,
            AVG(profits - IFNULL(fees, 0))/(SELECT balance FROM users WHERE id = ?) * 100 AS avg_return,
            SUM(IF(result = 'win', 1, 0))                                                 AS win,
            SUM(IF(result = 'loss', 1, 0))                                                AS loss,
            SUM(IF(result = 'be', 1, 0))                                                  AS be,
            SUM(IF(result = 'win', 1, 0))/COUNT(*) * 100                                  AS win_rate,
            IFNULL((SUM(IF(result = 'win', profits, 0))
              / SUM(IF(result = 'win', 1, 0))), 0) *
              (SUM(IF(result = 'win', 1, 0))/COUNT(*))
            + IFNULL((SUM(IF(result = 'loss', profits, 0))
              / SUM(IF(result = 'loss', 1, 0))) *
              (SUM(IF(result = 'win', 1, 0))/COUNT(*) - 1), 0) AS expected_result
          FROM entries e WHERE e.user_id = ? AND status = 1 GROUP BY DAYOFWEEK(entry_dt) ORDER BY entries DESC)
      UNION
          SELECT DAYOFWEEK(entry_dt) AS day, 0, 0, 0, 0, 0, 0, 0 FROM entries e
          WHERE NOT EXISTS(SELECT * FROM entries en WHERE DAYOFWEEK(en.entry_dt) = DAYOFWEEK(e.entry_dt) AND status = 1) AND e.user_id = ?)
            AS daysStatsTable ORDER BY day;`, [req.user.id, req.user.id, req.user.id])
      var getDayStats = await query(`SELECT IFNULL(SUM(profits), 0) AS revenue, IFNULL(SUM(fees), 0) AS fees, IFNULL(SUM(profits - fees), 0) AS profit,
         IFNULL(SUM(profits - fees)/(SELECT balance FROM users WHERE id = 1) * 100, 0) AS str_return,
         IFNULL(MAX(profits), 0) AS max, IFNULL(MIN(profits), 0) AS min,
         IFNULL(AVG(IF(result = 'win', profits, null)), 0) AS avg_win,
         IFNULL(AVG(IF(result = 'loss', profits, null)), 0) AS avg_loss,
         IFNULL(AVG(profits), 0) AS avg, IFNULL(AVG(DATEDIFF(exit_dt, entry_dt)), 0) AS avg_holding,
         IFNULL(SUM(IF(profits < 0, profits, null) - fees), 0) AS gross_loss,
         IFNULL(SUM(IF(profits > 0, profits, null)) / IFNULL(SUM(IF(profits < 0, profits, null) - fees), 1), 0) AS profit_factor,
         IFNULL(AVG(IF(result = 'win', profits, null))/ABS(IFNULL(AVG(IF(result = 'loss', profits, null)), 1)), 0) AS playoff
         FROM entries WHERE user_id = ? AND status = 1 AND DAYOFWEEK(entry_dt) = ?;`, [req.user.id, 1])
      var getDayDrawdown = await query(`SELECT IFNULL(MIN(IF(profits < 0, @max_drawdown:=@max_drawdown + (profits), @max_drawdown:=0)), 0) AS max_drawdown
          FROM entries WHERE user_id = ? AND status = 1 AND DAYOFWEEK(entry_dt) = ? ORDER BY entry_dt;`, [req.user.id, 1])
      var getDayRowWin = await query(`SELECT result, COUNT(*) AS numcount
          FROM (SELECT entries.*,
                       (ROW_NUMBER() OVER (ORDER BY id) -
                        ROW_NUMBER() OVER (PARTITION BY result ORDER BY id)
                       ) AS rs
                FROM entries WHERE user_id = ? AND status = 1 AND DAYOFWEEK(entry_dt) = ?
               ) t
          WHERE result = 'win'
          GROUP BY rs, result
          ORDER BY numcount DESC
          LIMIT 1;`, [req.user.id, 1])
      var getDayRowLoss = await query(`SELECT result, COUNT(*) AS numcount
          FROM (SELECT entries.*,
                       (ROW_NUMBER() OVER (ORDER BY id) -
                        ROW_NUMBER() OVER (PARTITION BY result ORDER BY id)
                       ) AS rs
                FROM entries WHERE user_id = ? AND status = 1 AND DAYOFWEEK(entry_dt) = ?
               ) t
          WHERE result = 'loss'
          GROUP BY rs, result
          ORDER BY numcount DESC
          LIMIT 1;`, [req.user.id, 1])
      var getOutcomeEntryDate = await query(`WITH RECURSIVE Date_Ranges AS (
        SELECT (DATE_ADD(DATE_ADD(LAST_DAY(MIN(entry_dt)), INTERVAL 1 DAY), INTERVAL -1 MONTH)) Date FROM entries
        UNION ALL
        SELECT Date + INTERVAL 1 DAY
        FROM Date_Ranges
        WHERE Date < (SELECT last_day(max(entry_dt)) FROM entries))
        SELECT dayofweek(Date) AS day,
          SUM(IF(user_id = ? AND status = 1, profits - IFNULL(fees, 0), 0)) AS outcome
        FROM Date_Ranges
          LEFT OUTER JOIN entries e ON date(entry_dt) = Date
        GROUP BY day ORDER BY day ASC;`, req.user.id)
      var getOutcomeExitDate = await query(`WITH RECURSIVE Date_Ranges AS (
        SELECT (DATE_ADD(DATE_ADD(LAST_DAY(MIN(exit_dt)), INTERVAL 1 DAY), INTERVAL -1 MONTH)) Date FROM entries
        UNION ALL
        SELECT Date + INTERVAL 1 DAY
        FROM Date_Ranges
        WHERE Date < (SELECT last_day(max(exit_dt)) FROM entries))
        SELECT dayofweek(Date) AS day,
          SUM(IF(user_id = ? AND status = 1, profits - IFNULL(fees, 0), 0)) AS outcome
        FROM Date_Ranges
          LEFT OUTER JOIN entries e ON date(exit_dt) = Date
        GROUP BY day ORDER BY day ASC;`, req.user.id)
      var dataOutcomeEntryDate = {
        outcome: []
      }
      getOutcomeEntryDate.forEach((row) => {
        dataOutcomeEntryDate.outcome.push(row.outcome)
      });
      var dataOutcomeExitDate = {
        outcome: []
      }
      getOutcomeExitDate.forEach((row) => {
        dataOutcomeExitDate.outcome.push(row.outcome)
      })
      var getUserCurrency = await query(`SELECT currency FROM currencies WHERE id = ?`, req.user.currency_id)
    } catch (err) {
      logger.error({
        message: 'STATISTICS DAYS (render days) something went wrong',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
    } finally {
      res.render('user/statistics/details-days',
        {
          daysTable: getDays,
          dayStats: getDayStats[0],
          dayCountWin: getDayRowWin[0],
          dayCountLoss: getDayRowLoss[0],
          dayDrawdown: getDayDrawdown[0],
          daysOutcomeEntry: dataOutcomeEntryDate,
          daysOutcomeExit: dataOutcomeExitDate,
          userCurrency: getUserCurrency[0].currency,
          weekDays: [res.__('Sunday'), res.__('Monday'), res.__('Tuesday'), res.__('Wednesday'), res.__('Thursday'), res.__('Friday'), res.__('Saturday')]
        }
      )
    }
  })()
}

module.exports.changeStatsTable = (req, res) => {
  (async () => {
    try {
      var getStraregyStats = await query(`SELECT IFNULL(SUM(profits), 0) AS revenue, IFNULL(SUM(fees), 0) AS fees, IFNULL(SUM(profits - IFNULL(fees, 0)), 0) AS profit,
         IFNULL(SUM(profits - IFNULL(fees, 0))/(SELECT balance FROM users WHERE id = 1) * 100, 0) AS str_return,
         IFNULL(MAX(profits), 0) AS max, IFNULL(MIN(profits), 0) AS min,
         IFNULL(AVG(IF(result = 'win', profits, null)), 0) AS avg_win,
         IFNULL(AVG(IF(result = 'loss', profits, null)), 0) AS avg_loss,
         IFNULL(AVG(profits), 0) AS avg, IFNULL(AVG(DATEDIFF(exit_dt, entry_dt)), 0) AS avg_holding,
         IFNULL(SUM(IF(profits < 0, profits, null) - fees), 0) AS gross_loss,
         IFNULL(SUM(IF(profits > 0, profits, null)) / IFNULL(SUM(IF(profits < 0, profits, null) - fees), 1), 0) AS profit_factor,
         IFNULL(AVG(IF(result = 'win', profits, null))/ABS(IFNULL(AVG(IF(result = 'loss', profits, null)), 1)), 0) AS playoff
         FROM entries WHERE user_id = ? AND status = 1 AND DAYOFWEEK(entry_dt) = ?;`, [req.user.id, req.params.id])
      var getStrategyDrawdown = await query(`SELECT IFNULL(MIN(IF(profits < 0, @max_drawdown:=@max_drawdown + (profits), @max_drawdown:=0)), 0) AS max_drawdown
          FROM entries WHERE user_id = ? AND status = 1 AND DAYOFWEEK(entry_dt) = ? ORDER BY entry_dt;`, [req.user.id, req.params.id])
      var getStrategyRowWin = await query(`SELECT result, COUNT(*) AS numcount
          FROM (SELECT entries.*,
                       (ROW_NUMBER() OVER (ORDER BY id) -
                        ROW_NUMBER() OVER (PARTITION BY result ORDER BY id)
                       ) AS rs
                FROM entries WHERE user_id = ? AND status = 1 AND DAYOFWEEK(entry_dt) = ?
               ) t
          WHERE result = 'win'
          GROUP BY rs, result
          ORDER BY numcount DESC
          LIMIT 1;`, [req.user.id, req.params.id])
      var getStrategyRowLoss = await query(`SELECT result, COUNT(*) AS numcount
          FROM (SELECT entries.*,
                       (ROW_NUMBER() OVER (ORDER BY id) -
                        ROW_NUMBER() OVER (PARTITION BY result ORDER BY id)
                       ) AS rs
                FROM entries WHERE user_id = ? AND status = 1 AND DAYOFWEEK(entry_dt) = ?
               ) t
          WHERE result = 'loss'
          GROUP BY rs, result
          ORDER BY numcount DESC
          LIMIT 1;`, [req.user.id, req.params.id])
    } catch (err) {
      logger.error({
        message: 'STATISTICS DAYS (change stats table) something went wrong',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
    } finally {
      return res.json({
          strategyStats: getStraregyStats[0],
          strategyCountWin: getStrategyRowWin[0],
          strategyCountLoss: getStrategyRowLoss[0],
          strategyDrawdown: getStrategyDrawdown[0]
        })
    }
  })()
}
