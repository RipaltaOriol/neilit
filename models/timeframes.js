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
var mysql = require('mysql');
var connection = mysql.createConnection({
  host    : 'localhost',
  user    : 'root',
  password: 'ripaltus',
  database: 'neilit_db',
  multipleStatements: true
});

// Create the variable that will be returned
var timeframesList = [];
// Query to the DB
connection.query("SELECT timeframe FROM timeframes", (err, results) => {
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
