// This file contains/calls global variables.
// Calls: all CURRENCIES available
// Connect to DB
let db = require('./dbConfig');

// logger
let logger = require('./winstonConfig');

// Create the variable that will be returned
var currenciesList = [];
// Query to the DB
db.query("SELECT currency FROM currencies", (err, results) => {
  if (err) {
    logger.error({
      message: 'CURRENCIES MODELS could not load currencies',
      endpoint: 'N/A',
      programMsg: err
    })
  }
  results.forEach((result) => {
    currenciesList.push(result.currency);
  });
})

module.exports = currenciesList;
