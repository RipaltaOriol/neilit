// This file contains/calls global variables.
// Calls: all CURRENCIES available
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
var currenciesList = [];
// Query to the DB
connection.query("SELECT currency FROM currencies", (err, results) => {
  if (err) throw err;
  results.forEach((result) => {
    currenciesList.push(result.currency);
  });
})

module.exports = currenciesList;
