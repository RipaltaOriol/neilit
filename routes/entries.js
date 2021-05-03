let express     = require('express');
let router      = express.Router({mergeParams: true});
let entries     = require('../controller/entries');
let middleware  = require('../middleware')

router.route('/')
  .get(middleware.isLoggedIn, entries.index)
  .post(middleware.isLoggedIn, entries.multerHandle, entries.createEntry)

router.post("/load-index", middleware.isLoggedIn, entries.indexInfinite)

router.post("/filter", middleware.isLoggedIn, entries.filter)

router.route('/:id')
  .get(middleware.isLoggedIn, entries.showEntry)
  .delete(middleware.isLoggedIn, entries.deleteEntry)

router.get("/:id/edit", middleware.isLoggedIn, entries.renderEditForm)

router.post("/:id/edit/flag", middleware.isLoggedIn, entries.editFlag)

router.post("/:id/edit/pair", middleware.isLoggedIn, entries.editPair)

router.post("/:id/edit/strategy", middleware.isLoggedIn, entries.editStrategy)

router.post("/:id/edit/timeframe", middleware.isLoggedIn, entries.editTimeframe)

router.post("/:id/edit/size", middleware.isLoggedIn, entries.editSize)

router.post("/:id/edit/entry-price", middleware.isLoggedIn, entries.editEntryPrice)

router.post("/:id/edit/stop-loss", middleware.isLoggedIn, entries.editStopLoss)

router.post("/:id/edit/take-profit", middleware.isLoggedIn, entries.editTakeProfit)

router.post("/:id/edit/entry-date", middleware.isLoggedIn, entries.editEntryDate)

router.post("/:id/edit/direction", middleware.isLoggedIn, entries.editDirection)

router.post("/:id/edit/ta", middleware.isLoggedIn, entries.editTa)

router.post("/:id/edit/comment", middleware.isLoggedIn, entries.editComment)

router.post("/:id/edit/imageURL", middleware.isLoggedIn, entries.editImageURL)

router.post("/:id/edit/imageFile", middleware.isLoggedIn, entries.multerHandle, entries.editImageFile)

router.post("/:id/edit/status", middleware.isLoggedIn, entries.editStatus)

router.post("/:id/edit/exit-date", middleware.isLoggedIn, entries.editExitDate)

router.post("/:id/edit/exit-price", middleware.isLoggedIn, entries.editExitPrice)

router.post("/:id/edit/profits", middleware.isLoggedIn, entries.editProfit)

router.post("/:id/edit/fees", middleware.isLoggedIn, entries.editFees)

router.post("/:id/edit/result", middleware.isLoggedIn, entries.editResult)

module.exports = router;
