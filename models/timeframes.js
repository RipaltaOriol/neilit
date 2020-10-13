// This file contians/calls global variables.
// Calls: all TIMEFRAMES available

// I18N library to translate the timeframes
const path = require('path')
const i18n = require('i18n')
// I18N config
i18n.configure({
  locales: ['en', 'de'],
  directory: path.join('./middleware/locales')
})

// Connect to DB
let db = require('./dbConfig')

// Create the variable that will be returned
var timeframesList = [];
// Query to the DB
db.query("SELECT timeframe FROM timeframes", (err, results) => {
  if (err) throw err;
  results.forEach((result) => {
    timeframesList.push(result.timeframe)
  });
});
// translate the timeframes from the DB
function localeTF() {
  for (var i = 0; i < timeframesList.length; i++) {
    timeframesList[i] = i18n.__(timeframesList[i])
  }
  return timeframesList;
}

module.exports = localeTF;
