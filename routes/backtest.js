let express     = require('express');
let router      = express.Router({mergeParams: true});
let backtest    = require('../controller/backtest');
let middleware  = require('../middleware')

router.route('/')
  .get(middleware.isLoggedIn, backtest.index)
  .post(middleware.isLoggedIn, backtest.createBacktest)

router.post("/load-index", middleware.isLoggedIn, backtest.indexInfinite)

router.post("/filter", middleware.isLoggedIn, backtest.filter)

router.get("/new", middleware.isLoggedIn, backtest.renderNewForm)

router.route('/:id')
  .get(middleware.isLoggedIn, backtest.showBacktest)
  .put(middleware.isLoggedIn, backtest.updateBacktest)
  .delete(middleware.isLoggedIn, backtest.deleteBacktest)

router.get("/:id/edit", middleware.isLoggedIn, backtest.renderEditForm)

module.exports = router;
