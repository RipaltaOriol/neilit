let express     = require('express');
let router      = express.Router({mergeParams: true});
let passport    = require('passport');
let index       = require('../controller/index');
let middleware  = require('../middleware/home');

router.get("/", index.renderHome);

router.get("/logo", index.renderLogo);

router.get("/features", index.renderFeatures)

router.get("/pricing", index.renderPricing)

router.get("/resources", index.renderResources)

router.get("/mobile", index.renderMobile)

router.post('/language/:lang', index.changeLanguage)

router.route('/login')
  .get(index.renderLogin)
  .post(passport.authenticate('local-login', { failureRedirect: '/login' }), index.logicLogin)

router.get("/logout", index.logout)

router.route('/forgot-password')
  .get(index.renderForgotPassword)
  .post(index.logicForgotPassword)

router.route('/reset/:token')
  .get(index.renderResetPassword)
  .post(index.logicResetPassword)

router.route('/signup')
  .get(index.renderSignup)
  .post(passport.authenticate('local-signup', { failureRedirect: '/signup' }), index.logicSignup)

router.route('/signup/select-plan')
  .get(middleware.isLoggedIn, index.renderSelectPlan)
  .post(middleware.isLoggedIn, index.logicSelectPlan)

router.get("/signup/select-plan/checkout", middleware.isLoggedIn, index.renderCheckout)

router.post('/create-stripeUser', middleware.isLoggedIn, index.createStripeUser)

router.post('/retry-invoice', index.retryInvoice);

router.post('/create-subscription', middleware.isLoggedIn, index.createSubscription);

module.exports = router;
