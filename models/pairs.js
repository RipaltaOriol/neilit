// This file contains/calls global variables.
// Calls: all PAIRS available
// Connect to DB
let db = require('./dbConfig');

// Create the variable that will be returned
var pairsList = new Map();
// Query to the DB
db.query("SELECT pair, category FROM pairs", (err, results) => {
  if (err) throw err;
  results.forEach((result) => {
    pairsList.set(result.pair, result.category);
  });
})

module.exports = pairsList;
