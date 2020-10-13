// This file contians/calls global variables.
// Calls: all user's STRATEGIES
// Connect to DB
let db = require('./dbConfig');

function getStrategies(id) {
  var strategies = []
  var idStrategies = []
  db.query("SELECT id, strategy FROM strategies WHERE user_id = ?", id, (err, results) => {
    if (err) throw err;
    results.forEach((strategy, i) => {
      strategies.push(strategy.strategy)
      idStrategies.push(results[i].id)
    });
    userStrategies = strategies;
    userIdStrategies = idStrategies;
  });
}

module.exports = getStrategies;
