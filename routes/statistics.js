const express         = require('express');
const router          = express.Router({mergeParams: true});
const statistics      = require('../controller/statistics');
const statsStrategies = require('../controller/statistics/statsStrategies');
const statsAssets     = require('../controller/statistics/statsAssets');
const statsTimeframes = require('../controller/statistics/statsTimeframes');
const statsDays       = require('../controller/statistics/statsDays');
const statsDirection  = require('../controller/statistics/statsDirection')
const middleware      = require('../middleware');

router.get("/load-equity", middleware.isLoggedIn, statistics.loadEquityChart)

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

router.get("/strategies", middleware.isLoggedIn, statsStrategies.renderStrategies)

router.get("/strategies/load-stats/:id", middleware.isLoggedIn, statsStrategies.changeStatsTable)

router.get("/strategies/load-avgs/:id", middleware.isLoggedIn, statsStrategies.changeStatsAvgs)

router.get("/strategies/load-graph/:id", middleware.isLoggedIn, statsStrategies.changeGraphDurability)

router.get("/strategies/:period", middleware.isLoggedIn, statistics.strategies)

router.get("/assets", middleware.isLoggedIn, statsAssets.renderAsset)

router.post("/assets/load-assets", middleware.isLoggedIn, statsAssets.indexInfinite)

router.get("/assets/load-stats/:id", middleware.isLoggedIn, statsAssets.changeStatsTable)

router.get("/assets/load-avgs/:id", middleware.isLoggedIn, statsAssets.changeStatsAvgs)

router.get("/assets/:period", middleware.isLoggedIn, statistics.asset)

router.get("/timeframes", middleware.isLoggedIn, statsTimeframes.renderTimeframes)

router.get("/timeframes/load-stats/:id", middleware.isLoggedIn, statsTimeframes.changeStatsTable)

router.get("/timeframes/load-avgs/:id", middleware.isLoggedIn, statsTimeframes.changeStatsAvgs)

router.get("/timeframes/:period", middleware.isLoggedIn, statistics.timeframes)

router.get("/days", middleware.isLoggedIn, statsDays.renderDays)

router.get("/days/load-stats/:id", middleware.isLoggedIn, statsDays.changeStatsTable)

router.get("/days/:period", middleware.isLoggedIn, statistics.days)

router.get("/direction", middleware.isLoggedIn, statsDirection.renderDirection)

router.get("/direction/load-stats/:direction", middleware.isLoggedIn, statsDirection.changeStatsTable)

router.get("/direction/load-avgs/:direction", middleware.isLoggedIn, statsDirection.changeStatsAvgs)

router.get("/:table/custom/:from/:to", middleware.isLoggedIn, statistics.custom)

module.exports = router;
