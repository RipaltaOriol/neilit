// dependencies
const util = require('util');

// global variables
let db      = require('../../models/dbConfig');
let logger  = require('../../models/winstonConfig');

// node native promisify
const query = util.promisify(db.query).bind(db);

module.exports.renderTimeframes = (req, res) => {
  (async () => {
    try {
      var getTimeframes = await query(`SELECT * FROM (
            (SELECT timeframe, COUNT(*)                                                     AS entries,
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
            FROM entries e
              LEFT JOIN timeframes t ON t.id = e.timeframe_id
            WHERE e.user_id = ? AND status = 1 GROUP BY timeframe_id
            ORDER BY entries DESC)
            UNION
            SELECT timeframe, 0, 0, 0, 0, 0, 0, 0 from timeframes t
            WHERE NOT EXISTS(SELECT * FROM entries e WHERE e.timeframe_id = t.id AND status = 1))
              AS strategyStatsTable ORDER BY -avg_return ASC;`, [req.user.id, req.user.id])
      var getTimeframeStats = await query(`SELECT IFNULL(SUM(profits), 0) AS revenue, IFNULL(SUM(fees), 0) AS fees, IFNULL(SUM(profits - fees), 0) AS profit,
         IFNULL(SUM(profits - fees)/(SELECT balance FROM users WHERE id = 1) * 100, 0) AS str_return,
         IFNULL(MAX(profits), 0) AS max, IFNULL(MIN(profits), 0) AS min,
         IFNULL(AVG(IF(result = 'win', profits, null)), 0) AS avg_win,
         IFNULL(AVG(IF(result = 'loss', profits, null)), 0) AS avg_loss,
         IFNULL(AVG(profits), 0) AS avg, IFNULL(AVG(DATEDIFF(exit_dt, entry_dt)), 0) AS avg_holding,
         IFNULL(SUM(IF(profits < 0, profits, null) - fees), 0) AS gross_loss,
         IFNULL(SUM(IF(profits > 0, profits, null)) / IFNULL(SUM(IF(profits < 0, profits, null) - fees), 1), 0) AS profit_factor,
         IFNULL(AVG(IF(result = 'win', profits, null))/ABS(IFNULL(AVG(IF(result = 'loss', profits, null)), 1)), 0) AS playoff
         FROM entries WHERE user_id = ? AND status = 1 AND timeframe_id = ?;`, [req.user.id, 1])
      var getTimeframeDrawdown = await query(`SELECT IFNULL(MIN(IF(profits < 0, @max_drawdown:=@max_drawdown + (profits), @max_drawdown:=0)), 0) AS max_drawdown
          FROM entries WHERE user_id = ? AND status = 1 AND timeframe_id = ? ORDER BY entry_dt;`, [req.user.id, 1])
      var getTimeframeRowWin = await query(`SELECT result, COUNT(*) AS numcount
          FROM (SELECT entries.*,
                       (ROW_NUMBER() OVER (ORDER BY id) -
                        ROW_NUMBER() OVER (PARTITION BY result ORDER BY id)
                       ) AS rs
                FROM entries WHERE user_id = ? AND status = 1 AND timeframe_id = ?
               ) t
          WHERE result = 'win'
          GROUP BY rs, result
          ORDER BY numcount DESC
          LIMIT 1;`, [req.user.id, 1])
      var getTimeframeRowLoss = await query(`SELECT result, COUNT(*) AS numcount
          FROM (SELECT entries.*,
                       (ROW_NUMBER() OVER (ORDER BY id) -
                        ROW_NUMBER() OVER (PARTITION BY result ORDER BY id)
                       ) AS rs
                FROM entries WHERE user_id = ? AND status = 1 AND timeframe_id = ?
               ) t
          WHERE result = 'loss'
          GROUP BY rs, result
          ORDER BY numcount DESC
          LIMIT 1;`, [req.user.id, 1])
      var getTimeframeAvg = await query(`SELECT IFNULL(COUNT(*) * 1.0 / COUNT(DISTINCT DATE(entry_dt)), 0) AS avg_daily,
                 IFNULL(SUM(IF(result = 'win', 1, 0)) * 1.0 / COUNT(DISTINCT DATE(entry_dt)), 0) AS avg_win_daily,
                 IFNULL(SUM(IF(result = 'loss', 1, 0)) * 1.0 / COUNT(DISTINCT DATE(entry_dt)), 0) AS avg_loss_daily,
                 IFNULL(COUNT(*) * 1.0 / COUNT(DISTINCT YEARWEEK(entry_dt)), 0) AS avg_week,
                 IFNULL(SUM(IF(result = 'win', 1, 0)) * 1.0 / COUNT(DISTINCT YEARWEEK(entry_dt)), 0) AS avg_win_week,
                 IFNULL(SUM(IF(result = 'loss', 1, 0)) * 1.0 / COUNT(DISTINCT YEARWEEK(entry_dt)), 0) AS avg_loss_week,
                 IFNULL(COUNT(*) * 1.0 / COUNT(DISTINCT DATE_FORMAT(entry_dt, '%m-%Y')), 0) AS avg_month,
                 IFNULL(SUM(IF(result = 'win', 1, 0)) * 1.0 / COUNT(DISTINCT DATE_FORMAT(entry_dt, '%m-%Y')), 0) AS avg_win_month,
                 IFNULL(SUM(IF(result = 'loss', 1, 0)) * 1.0 / COUNT(DISTINCT DATE_FORMAT(entry_dt, '%m-%Y')), 0) AS avg_loss_month
          FROM entries WHERE status = 1 AND user_id = ? AND timeframe_id = ?;`, [req.user.id, 1])
      var getTimeframesWinRate = await query(`SELECT timeframe, SUM(IF(result = 'win', 1, 0))/COUNT(*) AS win_rate
          FROM entries e
              LEFT JOIN timeframes t ON e.timeframe_id = t.id
          WHERE user_id = ? AND status = 1 GROUP BY timeframe_id ORDER BY timeframe_id;`, req.user.id)
      var getBestTimeframes = await query(`SELECT timeframe, ROUND(SUM(profits - IFNULL(fees, 0)), 2) AS outcome
          FROM entries e
              LEFT JOIN timeframes t ON e.timeframe_id = t.id
          WHERE user_id = ? AND status = 1 GROUP BY timeframe_id ORDER BY outcome DESC LIMIT 7;`, req.user.id)
      var dataBestTimeframes = {
        timeframes: [],
        outcome: []
      }
      getBestTimeframes.forEach((row) => {
        dataBestTimeframes.timeframes.push(row.timeframe)
        dataBestTimeframes.outcome.push(row.outcome)
      })
      var getUserCurrency = await query(`SELECT currency FROM currencies WHERE id = ?`, req.user.currency_id)
    } catch (err) {
      logger.error({
        message: 'STATISTICS TIMEFRAMES (render timeframes) something went wrong',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
    } finally {
      res.render('user/statistics/details-timeframes',
        {
          timeframesTable: getTimeframes,
          timeframeStats: getTimeframeStats[0],
          timeframeCountWin: getTimeframeRowWin[0],
          timeframeCountLoss: getTimeframeRowLoss[0],
          timeframeDrawdown: getTimeframeDrawdown[0],
          timeframeAvgs: getTimeframeAvg[0],
          timeframesWinRate: getTimeframesWinRate,
          userCurrency: getUserCurrency[0].currency,
          bestTimeframesGraph: dataBestTimeframes,
        }
      )
    }
  })()
}

module.exports.changeStatsTable = (req, res) => {
  (async () => {
    try {
      var getTimeframeStats = await query(`SELECT IFNULL(SUM(profits), 0) AS revenue, IFNULL(SUM(fees), 0) AS fees, IFNULL(SUM(profits - IFNULL(fees, 0)), 0) AS profit,
         IFNULL(SUM(profits - IFNULL(fees, 0))/(SELECT balance FROM users WHERE id = 1) * 100, 0) AS str_return,
         IFNULL(MAX(profits), 0) AS max, IFNULL(MIN(profits), 0) AS min,
         IFNULL(AVG(IF(result = 'win', profits, null)), 0) AS avg_win,
         IFNULL(AVG(IF(result = 'loss', profits, null)), 0) AS avg_loss,
         IFNULL(AVG(profits), 0) AS avg, IFNULL(AVG(DATEDIFF(exit_dt, entry_dt)), 0) AS avg_holding,
         IFNULL(SUM(IF(profits < 0, profits, null) - fees), 0) AS gross_loss,
         IFNULL(SUM(IF(profits > 0, profits, null)) / IFNULL(SUM(IF(profits < 0, profits, null) - fees), 1), 0) AS profit_factor,
         IFNULL(AVG(IF(result = 'win', profits, null))/ABS(IFNULL(AVG(IF(result = 'loss', profits, null)), 1)), 0) AS playoff
         FROM entries WHERE user_id = ? AND status = 1 AND timeframe_id = ?;`, [req.user.id, req.params.id])
      var getTimeframeDrawdown = await query(`SELECT IFNULL(MIN(IF(profits < 0, @max_drawdown:=@max_drawdown + (profits), @max_drawdown:=0)), 0) AS max_drawdown
          FROM entries WHERE user_id = ? AND status = 1 AND timeframe_id = ? ORDER BY entry_dt;`, [req.user.id, req.params.id])
      var getTimeframeRowWin = await query(`SELECT result, COUNT(*) AS numcount
          FROM (SELECT entries.*,
                       (ROW_NUMBER() OVER (ORDER BY id) -
                        ROW_NUMBER() OVER (PARTITION BY result ORDER BY id)
                       ) AS rs
                FROM entries WHERE user_id = ? AND status = 1 AND timeframe_id = ?
               ) t
          WHERE result = 'win'
          GROUP BY rs, result
          ORDER BY numcount DESC
          LIMIT 1;`, [req.user.id, req.params.id])
      var getTimeframeRowLoss = await query(`SELECT result, COUNT(*) AS numcount
          FROM (SELECT entries.*,
                       (ROW_NUMBER() OVER (ORDER BY id) -
                        ROW_NUMBER() OVER (PARTITION BY result ORDER BY id)
                       ) AS rs
                FROM entries WHERE user_id = ? AND status = 1 AND timeframe_id = ?
               ) t
          WHERE result = 'loss'
          GROUP BY rs, result
          ORDER BY numcount DESC
          LIMIT 1;`, [req.user.id, req.params.id])
    } catch (err) {
      logger.error({
        message: 'STATISTICS TIMEFRAMES (change stats table) something went wrong',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
    } finally {
      return res.json({
          timeframeStats: getTimeframeStats[0],
          timeframeCountWin: getTimeframeRowWin[0],
          timeframeCountLoss: getTimeframeRowLoss[0],
          timeframeDrawdown: getTimeframeDrawdown[0]
        })
    }
  })()
}

module.exports.changeStatsAvgs = (req, res) => {
  (async () => {
    try {
      var getTimeframeAvg = await query(`SELECT IFNULL(COUNT(*) * 1.0 / COUNT(DISTINCT DATE(entry_dt)), 0) AS avg_daily,
           IFNULL(SUM(IF(result = 'win', 1, 0)) * 1.0 / COUNT(DISTINCT DATE(entry_dt)), 0) AS avg_win_daily,
           IFNULL(SUM(IF(result = 'loss', 1, 0)) * 1.0 / COUNT(DISTINCT DATE(entry_dt)), 0) AS avg_loss_daily,
           IFNULL(COUNT(*) * 1.0 / COUNT(DISTINCT YEARWEEK(entry_dt)), 0) AS avg_week,
           IFNULL(SUM(IF(result = 'win', 1, 0)) * 1.0 / COUNT(DISTINCT YEARWEEK(entry_dt)), 0) AS avg_win_week,
           IFNULL(SUM(IF(result = 'loss', 1, 0)) * 1.0 / COUNT(DISTINCT YEARWEEK(entry_dt)), 0) AS avg_loss_week,
           IFNULL(COUNT(*) * 1.0 / COUNT(DISTINCT DATE_FORMAT(entry_dt, '%m-%Y')), 0) AS avg_month,
           IFNULL(SUM(IF(result = 'win', 1, 0)) * 1.0 / COUNT(DISTINCT DATE_FORMAT(entry_dt, '%m-%Y')), 0) AS avg_win_month,
           IFNULL(SUM(IF(result = 'loss', 1, 0)) * 1.0 / COUNT(DISTINCT DATE_FORMAT(entry_dt, '%m-%Y')), 0) AS avg_loss_month
        FROM entries WHERE status = 1 AND user_id = ? AND timeframe_id = ?;`, [req.user.id, req.params.id])
    } catch (err) {
      logger.error({
        message: 'STATISTICS TIMEFRAMES (change avgs table) something went wrong',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
    } finally {
      return res.json({
        timeframeAvgs: getTimeframeAvg[0],
        })
    }
  })()
}
