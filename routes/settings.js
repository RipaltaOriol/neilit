let express = require('express');
let router = express.Router({mergeParams: true});
let pairs = require('../models/pairs');
let timeframes = require('../models/timeframes');
let categories = require('../models/categoriesPairs');
let middleware = require('../middleware');
let connection = require('../models/connectDB');

// Global Program Variables
let strategies = require('../models/strategies');



// NEW STRATEGY ROUTE
router.post("/newStrategy", middleware.isLoggedIn, (req, res) => {
  // creates an object with the new strategy
  var newStrategy = {
    strategy: req.body.strategy,
    user_id: req.user.id
  }
  // saves the strategy to the DB
  connection.query('INSERT INTO strategies SET ?', newStrategy, (err, done) => {
    if (err) throw err;
    res.end();
  })
})

// DELETE STRATEGY ROUTE
router.post("/deleteStrategy", middleware.isLoggedIn, (req, res) => {
  var deleteStrategy = 'DELETE FROM strategies WHERE strategy = ?'
  // deletes the strategy from the DB
  connection.query(deleteStrategy, req.body.strategy, (err) => {
    if (err) throw err;
    res.end();
  })
})

module.exports = router;
