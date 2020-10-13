// This file contains/calls global variables.
// Calls: all CURRENCIES available
// Connect to DB
let db = require('./dbConfig');


// Create the variable that will be returned
var currenciesList = [];
// Query to the DB
db.query("SELECT currency FROM currencies", (err, results) => {
  if (err) throw err;
  results.forEach((result) => {
    currenciesList.push(result.currency);
  });
})

module.exports = currenciesList;
