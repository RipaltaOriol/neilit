let express           = require('express');
let router            = express.Router({mergeParams: true});
let technicalAnalysis = require('../controller/technicalAnalysis');
let middleware        = require('../middleware');

router.route('/')
  .get(middleware.isLoggedIn, technicalAnalysis.index)
  .post(middleware.isLoggedIn, technicalAnalysis.createTechnicalAnalysis)

router.post("/load-index", middleware.isLoggedIn, technicalAnalysis.indexInfinite)

router.post("/filter", middleware.isLoggedIn, technicalAnalysis.filter)

router.get("/new", middleware.isLoggedIn, technicalAnalysis.renderNewForm);

router.route('/:id')
  .get(middleware.isLoggedIn, technicalAnalysis.showTechnicalAnalysis)
  .put(middleware.isLoggedIn, technicalAnalysis.updateTechnicalAnalysis)
  .delete(middleware.isLoggedIn, technicalAnalysis.deleteTechnicalAnalysis)

router.get("/:id/edit", middleware.isLoggedIn, technicalAnalysis.renderEditForm)

module.exports = router;
