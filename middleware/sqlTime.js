// MIDDLEWARE DEPENDENCIES
const util = require('util');
let db = require('../models/dbConfig');
// node native promisify
const query = util.promisify(db.query).bind(db);

// MIDDLEWARE METHODS
var middlewareObj = { };

// MYSQL LOCALE TIME NAME LANGUAGE MIDDLEWARE
middlewareObj.sqlLanguage = async (req, res, next) => {
  switch (language) {
    case 'en':
      var selectEN = await query('SET lc_time_names = en_US;');
      break;
    case 'es':
      var selectES = await query('SET lc_time_names = es_ES;');
      break;
    default:
      var selectEN = await query('SET lc_time_names = en_US;');
  }
  return next();
}

middlewareObj.reset = async (req, res, next) => {
  var selectEN = await query('SET lc_time_names = en_US;');
  return next();
}

module.exports = middlewareObj
