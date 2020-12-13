let express     = require('express');
let router      = express.Router({mergeParams: true});
let entries     = require('../controller/entries');
let middleware  = require('../middleware')

router.route('/')
  .get(middleware.isLoggedIn, entries.index)
  .post(middleware.isLoggedIn, entries.createEntry)

router.post("/load-index", middleware.isLoggedIn, entries.indexInfinite)

router.post("/filter", middleware.isLoggedIn, entries.filter)

router.get("/new", middleware.isLoggedIn, entries.renderNewForm)

router.route('/:id')
  .get(middleware.isLoggedIn, entries.showEntry)
  .put(middleware.isLoggedIn, entries.updateEntry)
  .delete(middleware.isLoggedIn, entries.deleteEntry)

router.get("/:id/edit", middleware.isLoggedIn, entries.renderEditForm)

module.exports = router;
