let express       = require('express');
let router        = express.Router({mergeParams: true});
let strategiesDoc = require('../controller/strategiesDoc');
let middleware    = require('../middleware');

router.get('/', middleware.isLoggedIn, strategiesDoc.index)

router.route('/:id')
  .get(middleware.isLoggedIn, strategiesDoc.showStrategy)
  .put(middleware.isLoggedIn, strategiesDoc.updateStrategy)

router.get("/:id/edit", middleware.isLoggedIn, strategiesDoc.renderEditForm)

module.exports = router;
