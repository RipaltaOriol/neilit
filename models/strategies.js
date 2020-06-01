var mysql = require('mysql');
// Connect to DB
var connection = mysql.createConnection({
  host    : 'localhost',
  user    : 'root',
  password: 'ripaltus',
  database: 'neilit_db',
  multipleStatements: true
});

function getStrategies(id) {
  var strategies = []
  var idStrategies = []
  connection.query("SELECT id, strategy FROM strategies WHERE user_id = ?", id, (err, results) => {
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
