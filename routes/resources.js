let express     = require('express');
let router      = express.Router({mergeParams: true});
let resources       = require('../controller/resources');

router.get("/create-entry", resources.createEntry)

router.get("/create-backtest", resources.createBacktest)

router.get("/add-strategies", resources.addStrategies)

router.get("/link-technical-analysis-to-entry", resources.linkTechnicalAnalysisToEntry)

router.get("/create-technical-analysis", resources.createTechnicalAnalysis)

router.get("/manage-assets", resources.manageAssets)

router.get("/custom-statistics", resources.customStatistics)

module.exports = router;
