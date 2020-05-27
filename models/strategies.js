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
  connection.query("SELECT strategy FROM strategies WHERE user_id = ?", id, (err, results) => {
    if (err) throw err;
    results.forEach((strategy) => {
      strategies.push(strategy.strategy)
    });
    userStrategies = strategies
  });
}

module.exports = getStrategies;
