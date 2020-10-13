// This file contians/calls global variables.
// Calls: all CATEGORIES (PAIRS) available
// Connect to DB
let db = require('./dbConfig');

// Create the variable that will be returned
var categoriesList = [];
// Query to the DB
db.query('SELECT category FROM pairs', (err, results) => {
  if (err) throw err;
  results.forEach((result) => {
    categoriesList.push(result.category);
  })
});

module.exports = categoriesList;
