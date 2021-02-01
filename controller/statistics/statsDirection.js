// dependencies
const util = require('util');

// global variables
let db = require('../../models/dbConfig');

// node native promisify
const query = util.promisify(db.query).bind(db);

module.exports.renderDirection = (req, res) => {
  (async () => {
    try {
      var getDirectionStats = await query(`SELECT IFNULL(SUM(profits), 0) AS revenue, IFNULL(SUM(fees), 0) AS fees, IFNULL(SUM(profits - fees), 0) AS profit,
         IFNULL(SUM(profits - fees)/(SELECT balance FROM users WHERE id = 1) * 100, 0) AS str_return,
         IFNULL(MAX(profits), 0) AS max, IFNULL(MIN(profits), 0) AS min,
         IFNULL(AVG(IF(result = 'win', profits, null)), 0) AS avg_win,
         IFNULL(AVG(IF(result = 'loss', profits, null)), 0) AS avg_loss,
         IFNULL(AVG(profits), 0) AS avg, IFNULL(AVG(DATEDIFF(exit_dt, entry_dt)), 0) AS avg_holding,
         IFNULL(SUM(IF(profits < 0, profits, null) - fees), 0) AS gross_loss,
         IFNULL(SUM(IF(profits > 0, profits, null)) / IFNULL(SUM(IF(profits < 0, profits, null) - fees), 1), 0) AS profit_factor,
         IFNULL(AVG(IF(result = 'win', profits, null))/ABS(IFNULL(AVG(IF(result = 'loss', profits, null)), 1)), 0) AS playoff
         FROM entries WHERE user_id = ? AND status = 1 AND direction = 'long';`, req.user.id)
      var getDirectionDrawdown = await query(`SELECT IFNULL(MIN(IF(profits < 0, @max_drawdown:=@max_drawdown + (profits), @max_drawdown:=0)), 0) AS max_drawdown
          FROM entries WHERE user_id = ? AND status = 1 AND direction = 'long' ORDER BY entry_dt;`, req.user.id)
      var getDirectionRowWin = await query(`SELECT result, COUNT(*) AS numcount
          FROM (SELECT entries.*,
                       (ROW_NUMBER() OVER (ORDER BY id) -
                        ROW_NUMBER() OVER (PARTITION BY result ORDER BY id)
                       ) AS rs
                FROM entries WHERE user_id = ? AND status = 1 AND direction = 'long'
               ) t
          WHERE result = 'win'
          GROUP BY rs, result
          ORDER BY numcount DESC
          LIMIT 1;`, req.user.id)
      var getDirectionRowLoss = await query(`SELECT result, COUNT(*) AS numcount
          FROM (SELECT entries.*,
                       (ROW_NUMBER() OVER (ORDER BY id) -
                        ROW_NUMBER() OVER (PARTITION BY result ORDER BY id)
                       ) AS rs
                FROM entries WHERE user_id = ? AND status = 1 AND direction = 'long'
               ) t
          WHERE result = 'loss'
          GROUP BY rs, result
          ORDER BY numcount DESC
          LIMIT 1;`, req.user.id)
      var getDirectionAvg = await query(`SELECT IFNULL(COUNT(*) * 1.0 / COUNT(DISTINCT DATE(entry_dt)), 0) AS avg_daily,
                 IFNULL(SUM(IF(result = 'win', 1, 0)) * 1.0 / COUNT(DISTINCT DATE(entry_dt)), 0) AS avg_win_daily,
                 IFNULL(SUM(IF(result = 'loss', 1, 0)) * 1.0 / COUNT(DISTINCT DATE(entry_dt)), 0) AS avg_loss_daily,
                 IFNULL(COUNT(*) * 1.0 / COUNT(DISTINCT YEARWEEK(entry_dt)), 0) AS avg_week,
                 IFNULL(SUM(IF(result = 'win', 1, 0)) * 1.0 / COUNT(DISTINCT YEARWEEK(entry_dt)), 0) AS avg_win_week,
                 IFNULL(SUM(IF(result = 'loss', 1, 0)) * 1.0 / COUNT(DISTINCT YEARWEEK(entry_dt)), 0) AS avg_loss_week,
                 IFNULL(COUNT(*) * 1.0 / COUNT(DISTINCT DATE_FORMAT(entry_dt, '%m-%Y')), 0) AS avg_month,
                 IFNULL(SUM(IF(result = 'win', 1, 0)) * 1.0 / COUNT(DISTINCT DATE_FORMAT(entry_dt, '%m-%Y')), 0) AS avg_win_month,
                 IFNULL(SUM(IF(result = 'loss', 1, 0)) * 1.0 / COUNT(DISTINCT DATE_FORMAT(entry_dt, '%m-%Y')), 0) AS avg_loss_month
          FROM entries WHERE status = 1 AND user_id = ? AND direction = 'long';`, req.user.id)
      var getUserCurrency = await query(`SELECT currency FROM currencies WHERE id = ?`, req.user.currency_id)
    } catch (e) {
      console.log(e);
    } finally {
      res.render('user/statistics/details-direction',
        {
          directionStats: getDirectionStats[0],
          directionCountWin: getDirectionRowWin[0],
          directionCountLoss: getDirectionRowLoss[0],
          directionDrawdown: getDirectionDrawdown[0],
          directionAvgs: getDirectionAvg[0],
          userCurrency: getUserCurrency[0].currency
        }
      )
    }
  })()
}

module.exports.changeStatsTable = (req, res) => {
  (async () => {
    try {
      var getDirectionStats = await query(`SELECT IFNULL(SUM(profits), 0) AS revenue, IFNULL(SUM(fees), 0) AS fees, IFNULL(SUM(profits - IFNULL(fees, 0)), 0) AS profit,
         IFNULL(SUM(profits - IFNULL(fees, 0))/(SELECT balance FROM users WHERE id = 1) * 100, 0) AS str_return,
         IFNULL(MAX(profits), 0) AS max, IFNULL(MIN(profits), 0) AS min,
         IFNULL(AVG(IF(result = 'win', profits, null)), 0) AS avg_win,
         IFNULL(AVG(IF(result = 'loss', profits, null)), 0) AS avg_loss,
         IFNULL(AVG(profits), 0) AS avg, IFNULL(AVG(DATEDIFF(exit_dt, entry_dt)), 0) AS avg_holding,
         IFNULL(SUM(IF(profits < 0, profits, null) - fees), 0) AS gross_loss,
         IFNULL(SUM(IF(profits > 0, profits, null)) / IFNULL(SUM(IF(profits < 0, profits, null) - fees), 1), 0) AS profit_factor,
         IFNULL(AVG(IF(result = 'win', profits, null))/ABS(IFNULL(AVG(IF(result = 'loss', profits, null)), 1)), 0) AS playoff
         FROM entries WHERE user_id = ? AND status = 1 AND direction = ?;`, [req.user.id, req.params.direction])
      var getDirectionDrawdown = await query(`SELECT IFNULL(MIN(IF(profits < 0, @max_drawdown:=@max_drawdown + (profits), @max_drawdown:=0)), 0) AS max_drawdown
          FROM entries WHERE user_id = ? AND status = 1 AND direction = ? ORDER BY entry_dt;`, [req.user.id, req.params.direction])
      var getDirectionRowWin = await query(`SELECT result, COUNT(*) AS numcount
          FROM (SELECT entries.*,
                       (ROW_NUMBER() OVER (ORDER BY id) -
                        ROW_NUMBER() OVER (PARTITION BY result ORDER BY id)
                       ) AS rs
                FROM entries WHERE user_id = ? AND status = 1 AND direction = ?
               ) t
          WHERE result = 'win'
          GROUP BY rs, result
          ORDER BY numcount DESC
          LIMIT 1;`, [req.user.id, req.params.direction])
      var getDirectionRowLoss = await query(`SELECT result, COUNT(*) AS numcount
          FROM (SELECT entries.*,
                       (ROW_NUMBER() OVER (ORDER BY id) -
                        ROW_NUMBER() OVER (PARTITION BY result ORDER BY id)
                       ) AS rs
                FROM entries WHERE user_id = ? AND status = 1 AND direction = ?
               ) t
          WHERE result = 'loss'
          GROUP BY rs, result
          ORDER BY numcount DESC
          LIMIT 1;`, [req.user.id, req.params.direction])
    } catch (e) {
      console.log(e);
    } finally {
      return res.json({
          directionStats: getDirectionStats[0],
          directionCountWin: getDirectionRowWin[0],
          directionCountLoss: getDirectionRowLoss[0],
          directionDrawdown: getDirectionDrawdown[0]
        }
      )
    }
  })()
}

module.exports.changeStatsAvgs = (req, res) => {
  (async () => {
    try {
      var getStrategyAvg = await query(`SELECT IFNULL(COUNT(*) * 1.0 / COUNT(DISTINCT DATE(entry_dt)), 0) AS avg_daily,
           IFNULL(SUM(IF(result = 'win', 1, 0)) * 1.0 / COUNT(DISTINCT DATE(entry_dt)), 0) AS avg_win_daily,
           IFNULL(SUM(IF(result = 'loss', 1, 0)) * 1.0 / COUNT(DISTINCT DATE(entry_dt)), 0) AS avg_loss_daily,
           IFNULL(COUNT(*) * 1.0 / COUNT(DISTINCT YEARWEEK(entry_dt)), 0) AS avg_week,
           IFNULL(SUM(IF(result = 'win', 1, 0)) * 1.0 / COUNT(DISTINCT YEARWEEK(entry_dt)), 0) AS avg_win_week,
           IFNULL(SUM(IF(result = 'loss', 1, 0)) * 1.0 / COUNT(DISTINCT YEARWEEK(entry_dt)), 0) AS avg_loss_week,
           IFNULL(COUNT(*) * 1.0 / COUNT(DISTINCT DATE_FORMAT(entry_dt, '%m-%Y')), 0) AS avg_month,
           IFNULL(SUM(IF(result = 'win', 1, 0)) * 1.0 / COUNT(DISTINCT DATE_FORMAT(entry_dt, '%m-%Y')), 0) AS avg_win_month,
           IFNULL(SUM(IF(result = 'loss', 1, 0)) * 1.0 / COUNT(DISTINCT DATE_FORMAT(entry_dt, '%m-%Y')), 0) AS avg_loss_month
        FROM entries WHERE status = 1 AND user_id = ? AND direction = ?;`, [req.user.id, req.params.direction])
    } catch (e) {
      console.log(e);
    } finally {
      return res.json({
        directionAvgs: getDirectionAvg[0],
        })
    }
  })()
}
