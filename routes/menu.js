let express = require('express');
let router = express.Router({mergeParams: true});
let pairs = require('../models/pairs');
let timeframes = require('../models/timeframes');
let categories = require('../models/categoriesPairs');
let middleware = require('../middleware');
let connection = require('../models/connectDB');

// SETTINGS ROUTE
router.get("/settings", middleware.isLoggedIn, (req, res) => {
  res.render("user/settings",
    {
      strategies:userStrategies
    }
  );
})

// DASHBOARD USER ROUTE
router.get("", middleware.isLoggedIn, (req, res) => {
  // FIXME: make this await function + only perform is userStrategies is null
  res.render("user/user");
})

// STATISTICS ROUTE
router.get("/statistics", middleware.isLoggedIn, (req, res) => {
  // FIXME: only filter the ones for the current user
  // NOTE: maybe you want ot have this queries defiened in the route
  var countWin = 'SELECT COUNT(*) FROM entries WHERE result = "win" AND user_id = ?';
  var countLoss = 'SELECT COUNT(*) FROM entries WHERE result = "loss" AND user_id = ?';
  var countBe = 'SELECT COUNT(*) FROM entries WHERE result = "be" AND user_id = ?';
  var countStrategy = 'SELECT COUNT(*) FROM entries WHERE strategy_id = ? AND user_id = ?;';
  var countStrategyWin = 'SELECT COUNT(*) FROM entries WHERE result = "win" AND strategy_id = ? AND user_id = ?;';
  var countStrategyLoss = 'SELECT COUNT(*) FROM entries WHERE result = "loss" AND strategy_id = ? AND user_id = ?;';
  var countStrategyBe = 'SELECT COUNT(*) FROM entries WHERE result = "be" AND strategy_id = ? AND user_id = ?;';
  var countAsset = 'SELECT COUNT(*) FROM entries WHERE pair_id = ? AND user_id = ?;';
  var countAssetWin = 'SELECT COUNT(*) FROM entries WHERE result = "win" AND pair_id = ? AND user_id = ?;';
  var countAssetLoss = 'SELECT COUNT(*) FROM entries WHERE result = "loss" AND pair_id = ? AND user_id = ?;';
  var countAssetBe = 'SELECT COUNT(*) FROM entries WHERE result = "be" AND pair_id = ? AND user_id = ?;';
  var countTimeframe = 'SELECT COUNT(*) FROM entries WHERE timeframe_id = ? AND user_id = ?;';
  var countTimeframeWin = 'SELECT COUNT(*) FROM entries WHERE result = "win" AND timeframe_id = ? AND user_id = ?;';
  var countTimeframeLoss = 'SELECT COUNT(*) FROM entries WHERE result = "loss" AND timeframe_id = ? AND user_id = ?;';
  var countTimeframeBe = 'SELECT COUNT(*) FROM entries WHERE result = "be" AND timeframe_id = ? AND user_id = ?;';
  var countLong = 'SELECT COUNT(*) FROM entries WHERE direction = "long" AND user_id = ?';
  var countShort = 'SELECT COUNT(*) FROM entries WHERE direction = "short" AND user_id = ?';
  res.render("user/statistics");
});

// TRADING PLAN ROUTE
router.get("/plan", middleware.isLoggedIn, (req, res) => {
  res.render("user/plan");
})

// RISK CALCULATOR ROUTE
router.get("/calculator", middleware.isLoggedIn, (req, res) => {
  res.render("user/calculator", {currencies:pairs});
})

// JOURNAL ROUTE
// BUG: problem with so many connections - create a pool - run by JORDI
router.get("/journal", middleware.isLoggedIn, (req,res) => {
  // FIXME: table not optimized - JOIN pairs is unecessary
  var selectTAs = 'SELECT tanalysis.id AS identifier, pair, DATE_FORMAT(tanalysis.created_at, "%d de %M %Y") AS created_at FROM tanalysis JOIN pairs ON tanalysis.pair_id = pairs.id WHERE user_id = ? ORDER BY tanalysis.created_at DESC LIMIT 7';
  // FIXME: table not optimized - JOIN pairs is unecessary
  var selectEntrys = 'SELECT entries.id AS identifier, DATE_FORMAT(entry_dt, "%d de %M %Y") AS entry_dt, pair FROM entries JOIN pairs ON entries.pair_id = pairs.id WHERE user_id = ? ORDER BY entry_dt DESC LIMIT 7';
  var selectComments = 'SELECT id, DATE_FORMAT(created_at, "%d/%m/%y") AS title, comment FROM comments WHERE user_id = ? ORDER BY created_at DESC LIMIT 7';
  var selectBacktest = 'SELECT id, DATE_FORMAT(created_at, "%d de %M %Y") AS title, result FROM backtest WHERE user_id = ? ORDER BY created_at DESC LIMIT 7;'
  // Defines the max. # of characters allowed when displaying comments
  var commentsLength = 45
  connection.query(selectTAs, req.user.id, (err, getTas) => {
    if (err) throw err;
    // Object to store the TAs
    var tasLimited = {
      title: [],
      id: []
    }
    getTas.forEach((result) => {
      tasLimited.title.push(result.pair + ", " + result.created_at);
      tasLimited.id.push(result.identifier);
    });
    connection.query(selectEntrys, req.user.id, (err, getEntries) => {
      if (err) throw err;
      // Object to store the ENTRIES
      var entriesLimited = {
        title: [],
        id: []
      }
      getEntries.forEach((result) => {
        entriesLimited.title.push(result.pair + ", " + result.entry_dt);
        entriesLimited.id.push(result.identifier);
      })
      connection.query(selectComments, req.user.id, (err, getComments) => {
        if (err) throw err;
        // Object to store the COMMENTS
        var commentsLimited = {
          id: [],
          date: [],
          content: []
        }
        getComments.forEach((result) => {
          commentsLimited.id.push(result.id)
          commentsLimited.date.push(result.title)
          // FIXME: this function doesn't work
          if (result.comment.length > commentsLength) {
            var trimmedComment = result.comment.substring(0, (commentsLength - 4)) + " ...";
            commentsLimited.content.push(trimmedComment)

          } else {
            commentsLimited.content.push(result.comment)
          }
        })
        connection.query(selectBacktest, req.user.id, (err, getBacktest) => {
          if (err) throw err;
          // Object to store the BACKTESTS
          var backtestLimited = {
            title: [],
            id: []
          }
          getBacktest.forEach((result) => {
            backtestLimited.title.push(result.title + " [" + result.result + "]")
            backtestLimited.id.push(result.id)
          });
          res.render("user/journal",
            {
              entries:entriesLimited,
              tas:tasLimited,
              comments:commentsLimited,
              backtest:backtestLimited,
              pairs:pairs
            }
          );
        })
      })
    })
  })
})

module.exports = router;
