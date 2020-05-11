// This file contians/calls global variables.
// Calls: all PAIRS available
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
var pairsList = [];
// Query to the DB
connection.query("SELECT pair FROM pairs", (err, results) => {
  if (err) throw err;
  results.forEach((result) => {
    pairsList.push(result.pair);
  });
})

module.exports = pairsList;
