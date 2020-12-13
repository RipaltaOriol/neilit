let express     = require('express');
let router      = express.Router({mergeParams: true});
let plan        = require('../controller/plan');
let middleware  = require('../middleware');

router.route('/')
  .get(middleware.isLoggedIn, plan.index)
  .post(middleware.isLoggedIn, plan.createPlan)

router.post("/load-index", middleware.isLoggedIn, plan.indexInfinite)

router.get("/components", middleware.isLoggedIn, plan.renderComponentsForm)

router.get("/new", middleware.isLoggedIn, plan.renderNewForm)

router.route('/:id')
  .get(middleware.isLoggedIn, plan.showPlan)
  .delete(middleware.isLoggedIn, plan.deletePlan)

module.exports = router;
