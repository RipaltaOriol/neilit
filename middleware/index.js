// dependencies
const util        = require('util');

// global variables
let db                = require('../models/dbConfig');
let logger            = require('../models/winstonConfig')

// node native promisify
const query = util.promisify(db.query).bind(db);

// MIDDLEWARE METHODS
var middlewareObj = { };

// AUTHENTICATION MIDDLEWARE
middlewareObj.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.username === req.params.profile) {
      return next();
    } else {
      // FIXME: so it doesn't freeze and return to previous ROUTE
      return false;
    }
  } else {
    req.flash("error", "Please, login first!")
    return res.redirect("/login");
  }
}

module.exports = middlewareObj
