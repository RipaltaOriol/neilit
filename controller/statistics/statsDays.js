// dependencies
const util = require('util');

// global variables
let db = require('../../models/dbConfig');

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
      });
    } catch (e) {
      console.log(e);
    } finally {
      res.render('user/statistics/details-days',
        {
          daysTable: getDays,
          daysOutcomeEntry: dataOutcomeEntryDate,
          daysOutcomeExit: dataOutcomeExitDate,
          weekDays: [res.__('Sunday'), res.__('Monday'), res.__('Tuesday'), res.__('Wednesday'), res.__('Thursday'), res.__('Friday'), res.__('Saturday')]
        }
      )
    }
  })()
}
