var express = require('express');
var router = express.Router({mergeParams: true});
let pairs = require("../models/pairs");
let timeframes = require("../models/timeframes");
let categories = require("../models/categoriesPairs");
// Global Program Variables
let strategies = require("../models/strategies");

// Connect to DB
var connection = mysql.createConnection({
  host    : 'localhost',
  user    : 'root',
  password: 'ripaltus',
  database: 'neilit_db',
  multipleStatements: true
});

// SETTINGS LOGIC - saves the strategies to the DB
router.post("/saveSettings", isLoggedIn, (req, res) => {
  // FIXME: allow errasing and renaming strategies (learn about pool queries)
  var strategiesList = req.body.strategy;
  var newStrategies = []
  // checks for any errased or renamed strategies
  for (var i = 0; i < userStrategies.length; i++) {
    // strategy has been errased
    if (req.body.map[i] != 0) {

    }
    // strategy has been renamed
    else if (userStrategies[i] != strategiesList[i]) {

    }
  }
  // stores the new strategies to the DB
  for (var y = userStrategies.length; y < strategiesList.length; y++) {
    newStrategies.push([strategiesList[y], req.user.id])
  }
  console.log(newStrategies);
  if (newStrategies.length > 0) {
    // inserts the user's strategies from the DB into the 'userStrategies'
    connection.query('INSERT INTO strategies (strategy, user_id) VALUES ?', [newStrategies], (err) => {
      if (err) throw err;
      // gets all the (new) user strategies to the local variable
      strategies(req.user.id);
      res.redirect('/' + req.user.username + '/settings');
    })
  } else {
    res.redirect('/' + req.user.username + '/settings');
  }
})

// AUTHENTICATION MIDDLEWARE
function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) {
    if (req.user.username === req.params.profile) {
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

module.exports = router;
