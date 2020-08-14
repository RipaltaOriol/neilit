var express = require('express');
var router = express.Router({mergeParams: true});
let pairs = require("../models/pairs");
let timeframes = require("../models/timeframes");
let categories = require("../models/categoriesPairs");
let middleware = require('../middleware');

// Trading Plan Elements
var strategyPlan = require('../models/elements/plan');

// COMPONENTS PLAN ROUTE
router.get("/components", middleware.isLoggedIn, (req, res) => {
  // loads the trading plan elements to an object
  var elements = {
    strategyBeg: strategyPlan.comStratBeg,
    strategyEnd: strategyPlan.comStratEnd
  }
  res.render("user/plan/components",
    {
      strategies:userStrategies,
      elements:elements
    }
  );
});

// NEW PLAN ROUTE
router.get("/new", middleware.isLoggedIn, (req, res) => {
  // loads the trading plan elements to an object
  var elements = {
    newStrategy: strategyPlan.newStrat,
    newPosition: strategyPlan.newPos
  }
  res.render("user/plan/new",
    {
      elements:elements
    }
  );
});

// NEW PLAN LOGIC
router.post("/", middleware.isLoggedIn, (req, res) => {
  var planQuery = '...'
  // continue
  res.redirect('/' + req.user.username + '/plan');
})

// SHOW PLAN ROUTE
router.get("/id", middleware.isLoggedIn, (req, res) => {
  var getPlan ='...'
  // continue
  res.render('user/plan/show')
})

// UPDATE PLAN ROUTE

// DELETE PLAN ROUTE
router.delete("/:id", middleware.isLoggedIn, (req, res) => {
  var plan2Delete = req.params.id
  var deleteQuery = '...'
  // continue
  res.redirect('/' + req.user.username + '/plan');
})

module.exports = router;
