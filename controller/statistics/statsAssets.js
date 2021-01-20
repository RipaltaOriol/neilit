// dependencies
const util = require('util');

// global variables
let db = require('../../models/dbConfig');

// node native promisify
const query = util.promisify(db.query).bind(db);

module.exports.renderAsset = (req, res) => {
  (async () => {
    try {
      var getAssetsGraph = await query(`SELECT pair, MONTH(entry_dt) - 1  AS month,
              SUM(profits - IFNULL(fees, 0))                              AS outcome
          FROM entries e
              JOIN pairs p ON e.pair_id = p.id WHERE e.user_id = ? AND status = 1
          GROUP BY pair, month;`, req.user.id)
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
          AS strategyStatsTable ORDER BY -avg_return ASC`, [req.user.id, req.user.id, req.user.id])
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
      });

    } catch (e) {
      console.log(e);
    } finally {
      return res.render('user/statistics/details-assets',
        {
          assetsTable: getAssets,
          assetsGraph: dataAssetsGraph,
          bestAssetsGraph: dataBestAssets,
          worseAssetsGraph: dataWorseAssets,
          months: [res.__('January'), res.__('February'), res.__('March'), res.__('April'), res.__('May'), res.__('June'), res.__('July'), res.__('August'), res.__('September'), res.__('October'), res.__('November'), res.__('December')]
        }
      )
    }
  })()
}
