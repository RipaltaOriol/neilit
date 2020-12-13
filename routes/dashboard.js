let express     = require('express');
let router      = express.Router({mergeParams: true});
let dashboard   = require('../controller/dashboard');
let middleware  = require('../middleware');

router.get("/biggest/:period", middleware.isLoggedIn, dashboard.biggestTrade)

router.get("/biggest/custom/:from/:to", middleware.isLoggedIn, dashboard.customBiggestTrade)

router.get("/total/:period", middleware.isLoggedIn, dashboard.totalEntries)

router.get("/total/custom/:from/:to", middleware.isLoggedIn, dashboard.customTotalEntries)

router.get("/outcome/:period", middleware.isLoggedIn, dashboard.monthlyOutcome)

router.get("/outcome/custom/:from/:to", middleware.isLoggedIn, dashboard.customMonthlyOutcome)

router.get('/remove-notification', dashboard.removeNotification)

module.exports = router;
