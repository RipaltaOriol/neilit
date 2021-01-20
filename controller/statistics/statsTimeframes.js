// dependencies
const util = require('util');

// global variables
let db = require('../../models/dbConfig');

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
    } catch (e) {
      console.log(e);
    } finally {
      res.render('user/statistics/details-timeframes',
        {
          timeframesTable: getTimeframes,
          timeframesWinRate: getTimeframesWinRate,
          bestTimeframesGraph: dataBestTimeframes,
        }
      )
    }
  })()
}
