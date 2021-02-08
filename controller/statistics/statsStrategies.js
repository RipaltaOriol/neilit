// dependencies
const util = require('util');

// global variables
let db      = require('../../models/dbConfig');
let logger  = require('../../models/winstonConfig');

// node native promisify
const query = util.promisify(db.query).bind(db);


module.exports.renderStrategies = (req, res) => {
  (async () => {
    try {
      var getStrategiesGraph = await query(`SELECT strategy, MONTH(entry_dt) - 1  AS month,
              SUM(profits - IFNULL(fees, 0))                                                 AS outcome
          FROM entries e
              JOIN strategies s ON e.strategy_id = s.id WHERE e.user_id = ? AND status = 1
          GROUP BY strategy, month;`, req.user.id)
      var getStraregyStats = await query(`SELECT IFNULL(SUM(profits), 0) AS revenue, IFNULL(SUM(fees), 0) AS fees, IFNULL(SUM(profits - fees), 0) AS profit,
         IFNULL(SUM(profits - fees)/(SELECT balance FROM users WHERE id = 1) * 100, 0) AS str_return,
         IFNULL(MAX(profits), 0) AS max, IFNULL(MIN(profits), 0) AS min,
         IFNULL(AVG(IF(result = 'win', profits, null)), 0) AS avg_win,
         IFNULL(AVG(IF(result = 'loss', profits, null)), 0) AS avg_loss,
         IFNULL(AVG(profits), 0) AS avg, IFNULL(AVG(DATEDIFF(exit_dt, entry_dt)), 0) AS avg_holding,
         IFNULL(SUM(IF(profits < 0, profits, null) - fees), 0) AS gross_loss,
         IFNULL(SUM(IF(profits > 0, profits, null)) / IFNULL(SUM(IF(profits < 0, profits, null) - fees), 1), 0) AS profit_factor,
         IFNULL(AVG(IF(result = 'win', profits, null))/ABS(IFNULL(AVG(IF(result = 'loss', profits, null)), 1)), 0) AS playoff
         FROM entries WHERE user_id = ? AND status = 1 AND strategy_id = ?;`, [req.user.id, req.session.strategyIds[0]])
      var getStrategyDrawdown = await query(`SELECT IFNULL(MIN(IF(profits < 0, @max_drawdown:=@max_drawdown + (profits), @max_drawdown:=0)), 0) AS max_drawdown
          FROM entries WHERE user_id = ? AND status = 1 AND strategy_id = ? ORDER BY entry_dt;`, [req.user.id, req.session.strategyIds[0]])
      var getStrategyRowWin = await query(`SELECT result, COUNT(*) AS numcount
          FROM (SELECT entries.*,
                       (ROW_NUMBER() OVER (ORDER BY id) -
                        ROW_NUMBER() OVER (PARTITION BY result ORDER BY id)
                       ) AS rs
                FROM entries WHERE user_id = ? AND status = 1 AND strategy_id = ?
               ) t
          WHERE result = 'win'
          GROUP BY rs, result
          ORDER BY numcount DESC
          LIMIT 1;`, [req.user.id, req.session.strategyIds[0]])
      var getStrategyRowLoss = await query(`SELECT result, COUNT(*) AS numcount
          FROM (SELECT entries.*,
                       (ROW_NUMBER() OVER (ORDER BY id) -
                        ROW_NUMBER() OVER (PARTITION BY result ORDER BY id)
                       ) AS rs
                FROM entries WHERE user_id = ? AND status = 1 AND strategy_id = ?
               ) t
          WHERE result = 'loss'
          GROUP BY rs, result
          ORDER BY numcount DESC
          LIMIT 1;`, [req.user.id, req.session.strategyIds[0]])
      var getStrategiesRadar = await query(`SELECT * FROM (
              (SELECT strategy, SUM(profits - IFNULL(fees, 0)) AS outcome
                FROM entries e
                    JOIN strategies s ON e.strategy_id = s.id WHERE e.user_id = ? AND status = 1
                GROUP BY strategy_id ORDER BY e.strategy_id)
          UNION
              SELECT strategy, 0 FROM strategies s
              WHERE NOT EXISTS(
                  SELECT * FROM entries e WHERE e.strategy_id = s.id AND status = 1
                ) AND s.user_id = ?
              ) AS strategiesRadar;;`, [req.user.id, req.user.id])
      var getStrategyAvg = await query(`SELECT IFNULL(COUNT(*) * 1.0 / COUNT(DISTINCT DATE(entry_dt)), 0) AS avg_daily,
                 IFNULL(SUM(IF(result = 'win', 1, 0)) * 1.0 / COUNT(DISTINCT DATE(entry_dt)), 0) AS avg_win_daily,
                 IFNULL(SUM(IF(result = 'loss', 1, 0)) * 1.0 / COUNT(DISTINCT DATE(entry_dt)), 0) AS avg_loss_daily,
                 IFNULL(COUNT(*) * 1.0 / COUNT(DISTINCT YEARWEEK(entry_dt)), 0) AS avg_week,
                 IFNULL(SUM(IF(result = 'win', 1, 0)) * 1.0 / COUNT(DISTINCT YEARWEEK(entry_dt)), 0) AS avg_win_week,
                 IFNULL(SUM(IF(result = 'loss', 1, 0)) * 1.0 / COUNT(DISTINCT YEARWEEK(entry_dt)), 0) AS avg_loss_week,
                 IFNULL(COUNT(*) * 1.0 / COUNT(DISTINCT DATE_FORMAT(entry_dt, '%m-%Y')), 0) AS avg_month,
                 IFNULL(SUM(IF(result = 'win', 1, 0)) * 1.0 / COUNT(DISTINCT DATE_FORMAT(entry_dt, '%m-%Y')), 0) AS avg_win_month,
                 IFNULL(SUM(IF(result = 'loss', 1, 0)) * 1.0 / COUNT(DISTINCT DATE_FORMAT(entry_dt, '%m-%Y')), 0) AS avg_loss_month
          FROM entries WHERE status = 1 AND user_id = ? AND strategy_id = ?;`, [req.user.id, req.session.strategyIds[0]])
      var getFeesOutcome = await query(`SELECT * FROM (
              (SELECT strategy, SUM(profits) AS profits, SUM(fees) AS fees FROM entries
                  JOIN strategies s2 on entries.strategy_id = s2.id
              WHERE entries.user_id = ? AND status = 1 GROUP BY strategy_id)
          UNION
              SELECT strategy, NULL, NULL FROM strategies s
              WHERE NOT EXISTS(
                  SELECT * FROM entries e WHERE e.strategy_id = s.id AND status = 1
                ) AND s.user_id = ?
              ) AS feesVsOutcome;`, [req.user.id, req.user.id])
      var getOutcomeDurability = await query(`SELECT SUM(profits - IFNULL(fees, 0)) AS outcome, DATEDIFF(exit_dt, entry_dt) AS time
        FROM entries WHERE user_id = ? AND status = 1 AND strategy_id = ? GROUP BY DATEDIFF(exit_dt, entry_dt) ORDER BY time;`, [req.user.id, req.session.strategyIds[0]])
      var getAmountOutcome = await query(`SELECT * FROM (
            (SELECT strategy, COUNT(*) AS amount, SUM(profits - IFNULL(fees, 0)) AS outcome FROM entries e
            JOIN strategies ON e.strategy_id = strategies.id WHERE e.user_id = ? AND status = 1 GROUP BY strategy_id)
        UNION
            SELECT strategy, 0, 0 FROM strategies s
            WHERE NOT EXISTS(
                SELECT * FROM entries e WHERE e.strategy_id = s.id AND status = 1
                ) AND s.user_id = ?
            ) AS amountVsOutcome;`, [req.user.id, req.user.id])
      var getStrategies = await query(`SELECT * FROM (
        (SELECT strategy, COUNT(*)                                                      AS entries,
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
          LEFT JOIN strategies s ON s.id = e.strategy_id
        WHERE e.user_id = ? AND status = 1 GROUP BY strategy_id ORDER BY entries DESC)
        UNION
        SELECT strategy, 0, 0, 0, 0, 0, 0, 0 FROM strategies s
        WHERE NOT EXISTS(SELECT * FROM entries e WHERE e.strategy_id = s.id AND status = 1) AND s.user_id = ?)
          AS strategyStatsTable ORDER BY -avg_return ASC`, [req.user.id, req.user.id, req.user.id])
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
      var dataFeesOutcome = {
        strategies: [],
        fees: [],
        outcome: []
      }
      getFeesOutcome.forEach((row) => {
        dataFeesOutcome.strategies.push(row.strategy)
        dataFeesOutcome.fees.push(-row.fees)
        dataFeesOutcome.outcome.push(row.profits)
      });
      var dataOutcomeDurability = {
        outcome: [],
        durability: []
      }
      getOutcomeDurability.forEach((row) => {
        dataOutcomeDurability.outcome.push(row.outcome)
        dataOutcomeDurability.durability.push(row.time + ' days')
      });
      var dataAmountOutcome = {
        strategy: [],
        outcome: [],
        amount: []
      }
      getAmountOutcome.forEach((row) => {
        dataAmountOutcome.strategy.push(row.strategy)
        dataAmountOutcome.outcome.push(row.outcome)
        dataAmountOutcome.amount.push(row.amount)
      })
      var getUserCurrency = await query(`SELECT currency FROM currencies WHERE id = ?`, req.user.currency_id)
    } catch (err) {
      logger.error({
        message: 'STATISTICS STRATEGIES (render strategies) something went wrong',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
    } finally {
      res.render('user/statistics/details-strategies',
        {
          strategyTable: getStrategies,
          strategyStats: getStraregyStats[0],
          strategyCountWin: getStrategyRowWin[0],
          strategyCountLoss: getStrategyRowLoss[0],
          strategyDrawdown: getStrategyDrawdown[0],
          strategyGraph: dataStrategyGraph,
          strategyAvgs: getStrategyAvg[0],
          strategyFeesOutcome: dataFeesOutcome,
          strategyOutcomeTime: dataOutcomeDurability,
          strategyAmountOutcome: dataAmountOutcome,
          strategyRadar: dataStrategyRadar,
          userCurrency: getUserCurrency[0].currency,
          months: [res.__('January'), res.__('February'), res.__('March'), res.__('April'), res.__('May'), res.__('June'), res.__('July'), res.__('August'), res.__('September'), res.__('October'), res.__('November'), res.__('December')]
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
         FROM entries WHERE user_id = ? AND status = 1 AND strategy_id = ?;`, [req.user.id, req.params.id])
      var getStrategyDrawdown = await query(`SELECT IFNULL(MIN(IF(profits < 0, @max_drawdown:=@max_drawdown + (profits), @max_drawdown:=0)), 0) AS max_drawdown
          FROM entries WHERE user_id = ? AND status = 1 AND strategy_id = ? ORDER BY entry_dt;`, [req.user.id, req.params.id])
      var getStrategyRowWin = await query(`SELECT result, COUNT(*) AS numcount
          FROM (SELECT entries.*,
                       (ROW_NUMBER() OVER (ORDER BY id) -
                        ROW_NUMBER() OVER (PARTITION BY result ORDER BY id)
                       ) AS rs
                FROM entries WHERE user_id = ? AND status = 1 AND strategy_id = ?
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
                FROM entries WHERE user_id = ? AND status = 1 AND strategy_id = ?
               ) t
          WHERE result = 'loss'
          GROUP BY rs, result
          ORDER BY numcount DESC
          LIMIT 1;`, [req.user.id, req.params.id])
    } catch (e) {
      console.log(err);
      logger.error({
        message: 'STATISTICS STRATEGIES (change stats table) something went wrong',
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
        FROM entries WHERE status = 1 AND user_id = ? AND strategy_id = ?;`, [req.user.id, req.params.id])
    } catch (err) {
      logger.error({
        message: 'STATISTICS STRATEGIES (change avgs table) something went wrong',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
    } finally {
      return res.json({
        strategyAvgs: getStrategyAvg[0],
        })
    }
  })()
}

module.exports.changeGraphDurability = (req, res) => {
  (async () => {
    try {
      var getOutcomeDurability = await query(`SELECT SUM(profits - IFNULL(fees, 0)) AS outcome, DATEDIFF(exit_dt, entry_dt) AS time
        FROM entries WHERE user_id = ? AND status = 1 AND strategy_id = ? GROUP BY DATEDIFF(exit_dt, entry_dt) ORDER BY time;`, [req.user.id, req.params.id])
      var dataOutcomeDurability = {
        outcome: [],
        durability: []
      }
      getOutcomeDurability.forEach((row) => {
        dataOutcomeDurability.outcome.push(row.outcome)
        dataOutcomeDurability.durability.push(row.time + ' days')
      })
    } catch (err) {
      logger.error({
        message: 'STATISTICS STRATEGIES (change graph durability) something went wrong',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
    } finally {
      return res.json({
        strategyOutcomeTime: dataOutcomeDurability,
      })
    }
  })()
}
