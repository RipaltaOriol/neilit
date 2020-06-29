var express = require('express');
var router = express.Router({mergeParams: true});
let pairs = require("../models/pairs");
let timeframes = require("../models/timeframes");

// Backtest Addon Options
var addonBacktest = require("../models/elements/backtest");

// INDEX BACKTEST ROUTE
router.get("/", isLoggedIn, (req, res) => {
  res.send('You have reached the INDEX ROUTE for BACKTEST');
})

// NEW BACKTEST ROUTE
router.get("/new", isLoggedIn, (req, res) => {
  // loads the backtest addons to an object
  var addons = {
    list: addonBacktest.htmlList,
    newOption: addonBacktest.optionList
  }
  res.render("user/journal/backtest/new",
    {
      currencies:pairs,
      strategies:userStrategies,
      timeframes:timeframes,
      addons:addons
    }
  );
})

// NEW BACKTEST LOGIC
router.post("/", isLoggedIn, (req, res) => {
  console.log(req.body);
  // redirect to edit route - to complete the backtest
  res.send('You have reached the NEW POST for BACKTEST');
})

// SHOW BACKTEST ROUTE
router.get("/:id", isLoggedIn, (req, res) => {
  res.render("user/journal/backtest/show");
})

// UPDATE BACKTEST ROUTE
router.get("/:id/edit", isLoggedIn, (req, res) => {
  res.render("user/journal/backtest/edit");
})

// UPDATE BACKTEST LOGIC
router.put("/:id", isLoggedIn, (req, res) => {
  res.send('You have reached the UPDATE POST for BACKTEST');
})

// DELETE BACKTEST ROUTE
router.delete("/:id", isLoggedIn, (req, res) => {
  res.send('You have reached the DELETE POST for BACKTEST');
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
