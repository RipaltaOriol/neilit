// This file contains/calls global variables.
// Calls: all PAIRS available
// Connect to DB
let db = require('./dbConfig');

// Create the variable that will be returned
var pairsList = [];
// Query to the DB
db.query("SELECT pair FROM pairs", (err, results) => {
  if (err) throw err;
  results.forEach((result) => {
    pairsList.push(result.pair);
  });
})

module.exports = pairsList;
