// This file contains/calls global variables.
// Calls: all TECHNICAL ANALYSIS ELEMENTS available
// Connect to DB
let db = require('./dbConfig');

// logger
let logger = require('./winstonConfig')

// Create the variable that will be returned
var taElements = new Map();
// Query to the DB
db.query("SELECT * FROM telements", (err, results) => {
  if (err) {
    logger.error({
      message: 'ELEMENTS MODELS could not load technical analysis elements',
      endpoint: 'N/A',
      programMsg: err
    })
  };
  for (var i = 0; i < results.length; i++) {
    taElements.set(results[i].type, results[i].id)
  }
})

module.exports = taElements;
