// This file contains/calls global variables.
// Calls: all PAIRS available
// Connect to DB
let db = require('./dbConfig');

// logger
let logger = require('./winstonConfig');

var pairsList = [];
async function getAssets(id) {
  // query to the DB
  await db.query("SELECT id, pair, category, has_rate FROM pairs WHERE user_id = ?", id, (err, results) => {
    if (err) {
      logger.error({
        message: 'PAIRS MODELS could not load pairs',
        endpoint: 'N/A',
        programMsg: err
      })
    }
    // creates the variable that will be returned
    results.forEach((result) => {
      pairsList.push([
        result.pair,
        result.id,
        result.category,
        result.has_rate
      ])
    })
    return pairsList
  })
}

module.exports = getAssets
