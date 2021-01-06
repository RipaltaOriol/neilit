let express     = require('express');
let router      = express.Router({mergeParams: true});
let calculator  = require('../controller/calculator');
let middleware  = require('../middleware');

router.post('/convert', middleware.isLoggedIn, calculator.convert)

module.exports = router;
