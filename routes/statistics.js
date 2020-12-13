const express     = require('express');
const router      = express.Router({mergeParams: true});
const statistics  = require('../controller/statistics');
const middleware  = require('../middleware');

router.get("/profits/:period", middleware.isLoggedIn, statistics.profits)

router.get("/profits/custom/:from/:to", middleware.isLoggedIn, statistics.customProfits)

router.get("/entries/:period", middleware.isLoggedIn, statistics.accountEntries)

router.get("/entries/custom/:from/:to", middleware.isLoggedIn, statistics.customAccountEntries)

router.get("/best-asset/:period", middleware.isLoggedIn, statistics.bestAsset)

router.get("/best-asset/custom/:from/:to", middleware.isLoggedIn, statistics.customBestAsset)

router.get("/directionDist/:period", middleware.isLoggedIn, statistics.directionDistribution)

router.get("/directionDist/custom/:from/:to", middleware.isLoggedIn, statistics.customDirectionDistribution)

router.get("/directionGraph/:period", middleware.isLoggedIn, statistics.directionGraph)

router.get("/directionGraph/custom/:from/:to", middleware.isLoggedIn, statistics.customDirectionGraph)

router.get("/strategies", middleware.isLoggedIn, statistics.renderStrategies)

router.get("/strategies/:period", middleware.isLoggedIn, statistics.strategies)

router.get("/assets", middleware.isLoggedIn, statistics.renderAsset)

router.get("/assets/:period", middleware.isLoggedIn, statistics.asset)

router.get("/timeframes", middleware.isLoggedIn, statistics.renderTimeframes)

router.get("/timeframes/:period", middleware.isLoggedIn, statistics.timeframes)

router.get("/days", middleware.isLoggedIn, statistics.renderDays)

router.get("/days/:period", middleware.isLoggedIn, statistics.days)

router.get("/:table/custom/:from/:to", middleware.isLoggedIn, statistics.custom)

module.exports = router;
