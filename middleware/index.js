// dependencies
const util        = require('util');

// global variables
let localeTimeframes  = require("../models/timeframes");
let db                = require('../models/dbConfig');

// node native promisify
const query = util.promisify(db.query).bind(db);

// MIDDLEWARE METHODS
var middlewareObj = { };

// AUTHENTICATION MIDDLEWARE
middlewareObj.isLoggedIn = function (req, res, next) {
  if(req.isAuthenticated()) {
    if (req.user.username === req.params.profile) {
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
      return false;
    }
  } else {
    req.flash("error", "Please, login first!")
    res.redirect("/login");
  }
}

module.exports = middlewareObj
