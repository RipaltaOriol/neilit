let express     = require('express');
let router      = express.Router({mergeParams: true});
let menu        = require('../controller/menu')
let middleware  = require('../middleware');

router.get("", middleware.isLoggedIn, menu.renderDashboard)

router.get("/settings", middleware.isLoggedIn, menu.renderSettings)

router.get("/statistics", middleware.isLoggedIn, menu.renderStatistics)

router.get("/psychology", middleware.isLoggedIn, menu.renderPsychology)

router.get("/calculator", middleware.isLoggedIn, menu.renderCalculator)

module.exports = router;
