var express = require('express');
var router = express.Router({mergeParams: true});
let pairs = require("../models/pairs");
let timeframes = require("../models/timeframes");
let categories = require("../models/categoriesPairs");
let middleware = require('../middleware');

// NEW PLAN ROUTE
router.get("/new", middleware.isLoggedIn, (req, res) => {
  // FIXME: change the file organisation
  res.render("user/plan/new");
});

module.exports = router;
