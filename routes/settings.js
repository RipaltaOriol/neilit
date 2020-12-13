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

router.post("/changeLanguage", middleware.isLoggedIn, settings.changeLanguage)

router.get("/change-plan", middleware.isLoggedIn, settings.renderChangePlan)

router.post('/cancel-subscription', middleware.isLoggedIn, settings.cancelSubscription);

router.get('/update-payment', middleware.isLoggedIn, settings.renderUpdatePayment)

module.exports = router;
