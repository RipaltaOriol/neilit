// This file contains/calls global variables.
// Calls: all distinct CATEGORIES available
// Connect to DB
let db = require('./dbConfig');

// logger
let logger = require('./winstonConfig');

// Create the variable that will be returned
var categoriesList = [];
// Query to the DB
db.query("SELECT DISTINCT category FROM pairs;", (err, results) => {
  if (err) {
    logger.error({
      message: 'CATEGORIES MODELS could not load categories',
      endpoint: 'N/A',
      programMsg: err
    })
    throw err;
  }
  results.forEach((result) => {
    categoriesList.push(result.category);
  });
})

module.exports = categoriesList;
