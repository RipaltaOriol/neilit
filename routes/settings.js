let express     = require('express');
let router      = express.Router({mergeParams: true});
let settings    = require('../controller/settings');
let middleware  = require('../middleware');

router.post("/newStrategy", middleware.isLoggedIn, settings.newStrategy)

router.post("/deleteStrategy", middleware.isLoggedIn, settings.deleteStrategy)

router.post("/newGoal", middleware.isLoggedIn, settings.newGoal)

router.post("/deleteGoal", middleware.isLoggedIn, settings.deleteGoal)

router.post("/changeCurrency", middleware.isLoggedIn, settings.changeCurrency)

router.post("/changeShowProfits", middleware.isLoggedIn, settings.changeShowProfits)

router.post("/changeMode", middleware.isLoggedIn, settings.changeMode)

router.post("/toggleAssets", middleware.isLoggedIn, settings.toggleAssets)

router.post("/addAsset", middleware.isLoggedIn, settings.addAsset)

router.post("/deleteAsset", middleware.isLoggedIn, settings.deleteAsset)

router.post("/addTimeframe", middleware.isLoggedIn, settings.addTimeframe)

router.post("/changeLanguage", middleware.isLoggedIn, settings.changeLanguage)

router.post("/uploadProfileImage", middleware.isLoggedIn, settings.multerHandle, settings.uploadProfileImage)

router.get("/change-plan", middleware.isLoggedIn, settings.renderChangePlan)

router.post('/cancel-subscription', middleware.isLoggedIn, settings.cancelSubscription);

router.get('/update-payment', middleware.isLoggedIn, settings.renderUpdatePayment)

module.exports = router;
