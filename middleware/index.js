// dependencies
const util        = require('util');

// global variables
let localeTimeframes  = require("../models/timeframes");
let db                = require('../models/dbConfig');

// node native promisify
const query = util.promisify(db.query).bind(db);

// MIDDLEWARE METHODS
var middlewareObj = { };

let winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.File({ filename: './error.log', level: 'error' }),
    new winston.transports.File({ filename: './combined.log' }),
    new winston.transports.Console(),
  ],
});

// AUTHENTICATION MIDDLEWARE
middlewareObj.isLoggedIn = function (req, res, next) {
  logger.error('Now is in the middleware')
  // logger.error('Equivalen to isAuthenticated() [req.session.passport.user != ] ' + req.session.passport.user)
  if (req.isAuthenticated()) {
    logger.error('It is authenticated')
    if (req.user.username === req.params.profile) {
      logger.error('It is authenticated and profile does match username')
      function reloadStrategies(){
            let getUserStrategies = query('SELECT id, strategy FROM strategies WHERE user_id = ?', req.user.id);
            getUserStrategies.then((result) => {
              req.session.strategyNames = []
              req.session.strategyIds = []
              result.forEach((straegy, i) => {
                req.session.strategyNames.push(straegy.strategy);
                req.session.strategyIds.push(straegy.id);
              });
            })
            setTimeout(reloadStrategies, 60 * 60 * 1000);
        }
        reloadStrategies();
      return next();
    } else {
      // FIXME: so it doesn't freeze and return to previous ROUTE
      logger.error('It is authenticated but profile does not match username')
      return false;
    }
  } else {
    logger.error('It is not authenticated')
    req.flash("error", "Please, login first!")
    res.redirect("/login");
  }
}

module.exports = middlewareObj
