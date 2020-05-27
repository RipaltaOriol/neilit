var express = require('express');
var router = express.Router({mergeParams: true});
let pairs = require("../models/pairs");
let timeframes = require("../models/timeframes");
let categories = require("../models/categoriesPairs");

// Connect to DB
var connection = mysql.createConnection({
  host    : 'localhost',
  user    : 'root',
  password: 'ripaltus',
  database: 'neilit_db',
  multipleStatements: true
});

// DASHBOARD USER ROUTE
router.get("", isLoggedIn, (req, res) => {
  // FIXME: make this await function + only perform is userStrategies is null
  res.render("user/user");
})

// SETTINGS ROUTE
router.get("/settings", isLoggedIn, (req, res) => {
  res.render("user/settings");
})

// RISK CALCULATOR ROUTE
router.get("/calculator", isLoggedIn, (req, res) => {
  res.render("user/calculator");
})

// JOURNAL ROUTE
router.get("/journal", isLoggedIn, (req,res) => {
  var selectTAs = 'SELECT tanalysis.id AS identifier, pair, DATE_FORMAT(tanalysis.created_at, "%d de %M %Y") AS created_at FROM tanalysis JOIN pairs ON tanalysis.pair_id = pairs.id WHERE user_id = ? ORDER BY tanalysis.created_at DESC LIMIT 7';
  var selectEntrys = 'SELECT entries.id AS identifier, DATE_FORMAT(entry_dt, "%d de %M %Y") AS entry_dt, pair FROM entries JOIN pairs ON entries.pair_id = pairs.id WHERE user_id = ? ORDER BY entry_dt DESC LIMIT 7';
  var selectComments = 'SELECT id, DATE_FORMAT(created_at, "%d/%m/%y") AS title, comment FROM comments WHERE user_id = ? ORDER BY created_at DESC LIMIT 7';
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
        });
        res.render("user/journal", {entries:entriesLimited, tas:tasLimited, comments:commentsLimited, pairs:pairs});
      })
    })
  })
})

// AUTHENTICATION MIDDLEWARE
function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) {
    if (req.user.username === req.params.profile) {
      return next();
    } else {
      // FIXME: so it doesn't freeze and return to previous ROUTE
      return false;
    }
  } else {
    req.flash("error", "Please, login first!")
    res.redirect("/login");
  }
}

module.exports = router;
