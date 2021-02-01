// dependencies
const util = require('util');

// global variables
let db = require('../../models/dbConfig');

// node native promisify
const query = util.promisify(db.query).bind(db);

module.exports.renderAsset = (req, res) => {
  (async () => {
    try {
      var getAssetStats = await query(`SELECT IFNULL(SUM(profits), 0) AS revenue, IFNULL(SUM(fees), 0) AS fees, IFNULL(SUM(profits - IFNULL(fees, 0)), 0) AS profit,
         IFNULL(SUM(profits - IFNULL(fees, 0))/(SELECT balance FROM users WHERE id = 1) * 100, 0) AS str_return,
         IFNULL(MAX(profits), 0) AS max, IFNULL(MIN(profits), 0) AS min,
         IFNULL(AVG(IF(result = 'win', profits, null)), 0) AS avg_win,
         IFNULL(AVG(IF(result = 'loss', profits, null)), 0) AS avg_loss,
         IFNULL(AVG(profits), 0) AS avg, IFNULL(AVG(DATEDIFF(exit_dt, entry_dt)), 0) AS avg_holding,
         IFNULL(SUM(IF(profits < 0, profits, null) - fees), 0) AS gross_loss,
         IFNULL(SUM(IF(profits > 0, profits, null)) / IFNULL(SUM(IF(profits < 0, profits, null) - fees), 1), 0) AS profit_factor,
         IFNULL(AVG(IF(result = 'win', profits, null))/ABS(IFNULL(AVG(IF(result = 'loss', profits, null)), 1)), 0) AS playoff
         FROM entries WHERE user_id = ? AND status = 1 AND pair_id = ?;`, [req.user.id, req.session.assets[Object.keys(req.session.assets)[0]].id])
      var getAssetDrawdown = await query(`SELECT IFNULL(MIN(IF(profits < 0, @max_drawdown:=@max_drawdown + (profits), @max_drawdown:=0)), 0) AS max_drawdown
          FROM entries WHERE user_id = ? AND status = 1 AND pair_id = ? ORDER BY entry_dt;`, [req.user.id, req.session.assets[Object.keys(req.session.assets)[0]].id])
      var getAssetRowWin = await query(`SELECT result, COUNT(*) AS numcount
          FROM (SELECT entries.*,
                       (ROW_NUMBER() OVER (ORDER BY id) -
                        ROW_NUMBER() OVER (PARTITION BY result ORDER BY id)
                       ) AS rs
                FROM entries WHERE user_id = ? AND status = 1 AND pair_id = ?
               ) t
          WHERE result = 'win'
          GROUP BY rs, result
          ORDER BY numcount DESC
          LIMIT 1;`, [req.user.id, req.session.assets[Object.keys(req.session.assets)[0]].id])
      var getAssetRowLoss = await query(`SELECT result, COUNT(*) AS numcount
          FROM (SELECT entries.*,
                       (ROW_NUMBER() OVER (ORDER BY id) -
                        ROW_NUMBER() OVER (PARTITION BY result ORDER BY id)
                       ) AS rs
                FROM entries WHERE user_id = ? AND status = 1 AND pair_id = ?
               ) t
          WHERE result = 'loss'
          GROUP BY rs, result
          ORDER BY numcount DESC
          LIMIT 1;`, [req.user.id, req.session.assets[Object.keys(req.session.assets)[0]].id])
      var getAssetsGraph = await query(`SELECT pair, MONTH(entry_dt) - 1  AS month,
              SUM(profits - IFNULL(fees, 0))                              AS outcome
          FROM entries e
              JOIN pairs p ON e.pair_id = p.id WHERE e.user_id = ? AND status = 1
          GROUP BY pair, month;`, req.user.id)
      var getAssetAvg = await query(`SELECT IFNULL(COUNT(*) * 1.0 / COUNT(DISTINCT DATE(entry_dt)), 0) AS avg_daily,
                 IFNULL(SUM(IF(result = 'win', 1, 0)) * 1.0 / COUNT(DISTINCT DATE(entry_dt)), 0) AS avg_win_daily,
                 IFNULL(SUM(IF(result = 'loss', 1, 0)) * 1.0 / COUNT(DISTINCT DATE(entry_dt)), 0) AS avg_loss_daily,
                 IFNULL(COUNT(*) * 1.0 / COUNT(DISTINCT YEARWEEK(entry_dt)), 0) AS avg_week,
                 IFNULL(SUM(IF(result = 'win', 1, 0)) * 1.0 / COUNT(DISTINCT YEARWEEK(entry_dt)), 0) AS avg_win_week,
                 IFNULL(SUM(IF(result = 'loss', 1, 0)) * 1.0 / COUNT(DISTINCT YEARWEEK(entry_dt)), 0) AS avg_loss_week,
                 IFNULL(COUNT(*) * 1.0 / COUNT(DISTINCT DATE_FORMAT(entry_dt, '%m-%Y')), 0) AS avg_month,
                 IFNULL(SUM(IF(result = 'win', 1, 0)) * 1.0 / COUNT(DISTINCT DATE_FORMAT(entry_dt, '%m-%Y')), 0) AS avg_win_month,
                 IFNULL(SUM(IF(result = 'loss', 1, 0)) * 1.0 / COUNT(DISTINCT DATE_FORMAT(entry_dt, '%m-%Y')), 0) AS avg_loss_month
          FROM entries WHERE status = 1 AND user_id = ? AND pair_id = ?;`, [req.user.id, req.session.assets[Object.keys(req.session.assets)[0]].id])
      var getBestAssets = await query(`SELECT pair, ROUND(AVG(profits - IFNULL(fees, 0)), 2) AS outcome
        FROM entries e JOIN pairs p on e.pair_id = p.id
        WHERE status = 1 && e.user_id = ? GROUP BY pair_id ORDER BY outcome DESC LIMIT 7;`, req.user.id)
      var getWorseAssets = await query(`SELECT pair, AVG(profits - IFNULL(fees, 0)) AS outcome
        FROM entries e JOIN pairs p on e.pair_id = p.id
        WHERE status = 1 && e.user_id = ? GROUP BY pair_id ORDER BY outcome ASC LIMIT 7;`, req.user.id)
      var getAssets = await query(`SELECT * FROM (
        (SELECT pair, COUNT(*)                                                      AS entries,
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
          LEFT JOIN pairs p ON p.id = e.pair_id
        WHERE e.user_id = ? AND status = 1 GROUP BY pair_id ORDER BY entries DESC)
        UNION
        SELECT pair, 0, 0, 0, 0, 0, 0, 0 from pairs p
        WHERE NOT EXISTS(SELECT * FROM entries e WHERE e.pair_id = p.id AND status = 1) AND p.user_id = ?)
          AS strategyStatsTable ORDER BY -avg_return ASC LIMIT 25`, [req.user.id, req.user.id, req.user.id])
      // COMBAK: improve this code
      var dataAssetsGraph = { }
      getAssetsGraph.forEach((asset) => {
        dataAssetsGraph[asset.pair] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      })
      getAssetsGraph.forEach((asset) => {
        dataAssetsGraph[asset.pair][asset.month] = asset.outcome
      })
      var dataBestAssets = {
        assets: [],
        outcome: []
      }
      getBestAssets.forEach((row) => {
        dataBestAssets.assets.push(row.pair)
        dataBestAssets.outcome.push(row.outcome)
      });
      var dataWorseAssets = {
        assets: [],
        outcome: []
      }
      getWorseAssets.forEach((row) => {
        dataWorseAssets.assets.push(row.pair)
        dataWorseAssets.outcome.push(row.outcome)
      })
      var getUserCurrency = await query(`SELECT currency FROM currencies WHERE id = ?`, req.user.currency_id)
    } catch (e) {
      console.log(e);
    } finally {
      return res.render('user/statistics/details-assets',
        {
          assetsTable: getAssets,
          assetStats: getAssetStats[0],
          assetCountWin: getAssetRowWin[0],
          assetCountLoss: getAssetRowLoss[0],
          assetDrawdown: getAssetDrawdown[0],
          assetsGraph: dataAssetsGraph,
          assetAvgs: getAssetAvg[0],
          bestAssetsGraph: dataBestAssets,
          worseAssetsGraph: dataWorseAssets,
          userCurrency: getUserCurrency[0].currency,
          months: [res.__('January'), res.__('February'), res.__('March'), res.__('April'), res.__('May'), res.__('June'), res.__('July'), res.__('August'), res.__('September'), res.__('October'), res.__('November'), res.__('December')]
        }
      )
    }
  })()
}

module.exports.indexInfinite = (req, res) => {
  var getAssets = `SELECT * FROM (
    (SELECT pair, COUNT(*)                                                      AS entries,
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
      LEFT JOIN pairs p ON p.id = e.pair_id
    WHERE e.user_id = ? AND status = 1 GROUP BY pair_id ORDER BY entries DESC)
    UNION
    SELECT pair, 0, 0, 0, 0, 0, 0, 0 from pairs p
    WHERE NOT EXISTS(SELECT * FROM entries e WHERE e.pair_id = p.id AND status = 1) AND p.user_id = ?)
      AS strategyStatsTable ORDER BY -avg_return ASC LIMIT 25 OFFSET ?;`;
  db.query(getAssets, [req.user.id, req.user.id, req.user.id, Number(req.body.offset)], (err, results) => {
    if (err) {
      // COMBAK: log error
    }
    return res.json({
      dataList: results,
    });
  })
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
         FROM entries WHERE user_id = ? AND status = 1 AND pair_id = ?;`, [req.user.id, req.params.id])
      var getStrategyDrawdown = await query(`SELECT IFNULL(MIN(IF(profits < 0, @max_drawdown:=@max_drawdown + (profits), @max_drawdown:=0)), 0) AS max_drawdown
          FROM entries WHERE user_id = ? AND status = 1 AND pair_id = ? ORDER BY entry_dt;`, [req.user.id, req.params.id])
      var getStrategyRowWin = await query(`SELECT result, COUNT(*) AS numcount
          FROM (SELECT entries.*,
                       (ROW_NUMBER() OVER (ORDER BY id) -
                        ROW_NUMBER() OVER (PARTITION BY result ORDER BY id)
                       ) AS rs
                FROM entries WHERE user_id = ? AND status = 1 AND pair_id = ?
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
                FROM entries WHERE user_id = ? AND status = 1 AND pair_id = ?
               ) t
          WHERE result = 'loss'
          GROUP BY rs, result
          ORDER BY numcount DESC
          LIMIT 1;`, [req.user.id, req.params.id])
    } catch (e) {
      console.log(e);
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
        FROM entries WHERE status = 1 AND user_id = ? AND pair_id = ?;`, [req.user.id, req.params.id])
    } catch (e) {
      console.log(e);
    } finally {
      return res.json({
        strategyAvgs: getStrategyAvg[0],
        })
    }
  })()
}
