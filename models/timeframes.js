// This file contians/calls global variables.
// Calls: all TIMEFRAMES available
// Connect to DB
var mysql = require('mysql');
var connection = mysql.createConnection({
  host    : 'localhost',
  user    : 'root',
  password: 'ripaltus',
  database: 'neilit_db',
  multipleStatements: true
});

// Create the variable that will be returned
var timeframesList = [];
// Query to the DB
connection.query("SELECT timeframe FROM strategies_timeframes", (err, results) => {
  if (err) throw err;
  results.forEach((result) => {
    timeframesList.push(result.timeframe)
  });
});

module.exports = timeframesList;
