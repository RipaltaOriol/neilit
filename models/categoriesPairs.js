// This file contians/calls global variables.
// Calls: all CATEGORIES (PAIRS) available
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
var categoriesList = [];
// Query to the DB
connection.query('SELECT category FROM pairs', (err, results) => {
  if (err) throw err;
  results.forEach((result) => {
    categoriesList.push(result.category);
  })
});

module.exports = categoriesList;
