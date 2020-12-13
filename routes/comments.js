let express     = require('express');
let router      = express.Router({mergeParams: true});
let comments    = require('../controller/comments');
let middleware  = require('../middleware');

router.route('/')
  .get(middleware.isLoggedIn, comments.index)
  .post(middleware.isLoggedIn, comments.createComment)

router.post('/load-index', middleware.isLoggedIn, comments.indexInfinite)

router.post('/filter', middleware.isLoggedIn, comments.filter)

router.get("/new", middleware.isLoggedIn, comments.renderNewForm)

router.route('/:id')
  .get(middleware.isLoggedIn, comments.showComment)
  .put(middleware.isLoggedIn, comments.updateComment)
  .delete(middleware.isLoggedIn, comments.deleteComment)

router.get("/:id/edit", middleware.isLoggedIn, comments.renderEditForm)


module.exports = router;
