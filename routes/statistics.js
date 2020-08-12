var express = require('express');
var router = express.Router({mergeParams: true});
let pairs = require("../models/pairs");
let timeframes = require("../models/timeframes");
let categories = require("../models/categoriesPairs");
let middleware = require('../middleware');

router.get("/whatev", middleware.isLoggedIn, (req, res) => {
  res.render("user/statistics/details-assets")
})

module.exports = router;
