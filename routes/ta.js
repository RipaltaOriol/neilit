var express = require('express');
var router = express.Router({mergeParams: true});
let pairs = require("../models/pairs");
let timeframes = require("../models/timeframes");
let categories = require("../models/categoriesPairs");

// Technical Analysis Elements
var titleTA = require("../models/elements/title");
var textTA = require("../models/elements/text");
var imageTA = require("../models/elements/image");
var strategyTA = require("../models/elements/strategy");

// Connect to DB
var connection = mysql.createConnection({
  host    : 'localhost',
  user    : 'root',
  password: 'ripaltus',
  database: 'neilit_db',
  multipleStatements: true
});

// NEW TECHNICAL ANALYSIS ROUTE
router.get("/new", isLoggedIn, (req, res) => {
  var elements = {
    title: titleTA.html,
    text: textTA.html,
    image: imageTA.html,
    strategy: strategyTA.html(userStrategies)
  }

  res.render("user/journal/ta/new",
    {
      currencies:pairs,
      categories:categories,
      strategies:userStrategies,
      timeframes:timeframes,
      elements: elements
    }
  );
});

// NEW TECHNICAL ANALYSIS LOGIC
router.post("/", isLoggedIn, (req, res) => {
  console.log('This is the pair: ' + req.body.pair);
  console.log('And this is the date: ' + req.body.date);
  console.log('THIS IS THE BODY:');
  console.log(req.body);
  // check that the inputs provided are valid/correct
  // if (req.body.pair == "" || req.body.date == "") {
  //   req.flash("error", "Pair or Date are missing.")
  //   req.redirect("/username/journal/ta")
  // } else {
  //   // FIXME: Get this variables from the user's session
  //   var technicala = {
  //     category: req.body.category,
  //     pair_id: req.body.pair,
  //     created_at: req.body.date,
  //     user_id: 1
  //   }
  //   // MAP T-ELEMENT-ANALYSIS
  //   // Initiate element counters
  //   var counterTitle = 0;
  //   var counterImg = 0;
  //   var counterText = 0;
  //   var counterStrategy = 0
  //   // Variables for Technical Elements Analysis
  //   var ta_id;
  //
  //   var qNewPair = 'SELECT id FROM pairs WHERE pair = ?'
  //   connection.query(qNewPair, technicala.pair_id, (err, results) => {
  //     if (err) throw err;
  //     technicala.pair_id = results[0].id;
  //     // IMPORTANT - POINT BREAKER
  //     // FIXME: If there are not elements in the TA we can Exit
  //     console.log(technicala);
  //     // Query insert Technical Analysis
  //     connection.query('INSERT INTO tanalysis SET ?', technicala, (err, checkFirst) => {
  //       if (err) throw err;
  //       var ta_id = checkFirst.insertId;
  //       console.log(ta_id);
  //       connection.query('SELECT * FROM telements', (err, printElements) => {
  //         if (err) throw err;
  //         console.log(printElements);
  //         let etypes = new Map();
  //         for (var i = 0; i < printElements.length; i++) {
  //           etypes.set(printElements[i].type, printElements[i].id)
  //         }
  //         var data = []
  //         // Case 1: Multiple Ements in the TA
  //         if (Array.isArray(req.body.type)) {
  //           var multipleVals = req.body.type
  //           // FIXME: the Counts() for each element type are HARDCODED
  //           // FIXME: IF statements are also HARDCODED
  //           var titleCount = 0;
  //           var imageCount = 0;
  //           var textCount = 0;
  //           var strategyCount = 0;
  //           // Counter for the Importance and Timeframe of the Strategy
  //           var stretegyTypesCount = 1;
  //
  //           for (var els = 0; els < multipleVals.length; els++) {
  //             elsPosition = els + 1;
  //             var contentVal;
  //             // FIXME: It is possible to improve code
  //             if (multipleVals[els] == "title") {
  //               contentVal = req.body.title[titleCount];
  //               titleCount += 1;
  //             }
  //             if (multipleVals[els] == "image") {
  //               contentVal = req.body.image[imageCount];
  //               imageCount += 1;
  //             }
  //             if (multipleVals[els] == "text") {
  //               contentVal = req.body.text[textCount];
  //               textCount += 1;
  //             }
  //             if (multipleVals[els] == "strategy") {
  //               var importance = "strategy_I_" + stretegyTypesCount;
  //               var timeframe = "strategy_timeframes_" + stretegyTypesCount;
  //               contentVal = req.body.strategy[strategyCount] + "$" + req.body[importance] + "$" + req.body[timeframe];
  //               strategyCount += 1;
  //               stretegyTypesCount += 1;
  //             }
  //             data.push([ta_id, elsPosition, etypes.get(multipleVals[els]), contentVal])
  //           }
  //
  //         // Case 2: Single Element TA
  //         } else {
  //           var singleVals = req.body.type
  //           if (singleVals == "strategy") {
  //             req.body.strategy = singleVals + "$" + req.body.strategy_I_1 + "$" + req.body.strategy_timeframes_1
  //           }
  //           data.push([ta_id, 1, etypes.get(singleVals), req.body[singleVals]]);
  //         }
  //         console.log(data);
  //         connection.query('INSERT INTO telementanalysis (ta_id, order_at, element_id, content) VALUES ?', [data], (err, finalized) => {
  //           if (err) throw err;
  //           console.log(technicala);
  //           console.log(req.body.strategy);
  //           res.redirect("/username/journal");
  //         })
  //       })
  //     })
  //   })
  // }
})

// SHOW TECHNICAL ANALYSIS ROUTE
router.get("/:id", isLoggedIn, (req, res) => {
  // Get the ID from the TA to dipslay:
  var ta2Display = req.params.id
  // Define Queries
  // FIXME: two of this queries can be combined into one (currentTA and askTATitle)
  var currentTA = 'SELECT pair, tanalysis.category, DATE_FORMAT(created_at, "%d/%m/%Y") AS created_at FROM tanalysis JOIN pairs ON tanalysis.pair_id = pairs.id WHERE tanalysis.id = ?';
  // FIXME: You can order by the order the elements appear in the page
  var elementsTA = 'SELECT * FROM telementanalysis JOIN telements ON telementanalysis.element_id = telements.id WHERE telementanalysis.ta_id = ?';
  var askTATitle = 'SELECT pair, DATE_FORMAT(created_at, "%d de %M %Y") AS created_at FROM tanalysis JOIN pairs ON tanalysis.pair_id = pairs.id WHERE tanalysis.id = ?';

  var taObjectCur = {
    pair: '',
    category: '',
    date: '',
    type: [],
    imageVal: [],
    titleVal: [],
    textVal: [],
    strategyVal: [],
    strategyImp: [],
    strategyTime: [],
  }
  connection.query(currentTA, ta2Display, (err, getCurrentTA) => {
    if (err) throw err;
    taObjectCur.pair = getCurrentTA[0].pair
    taObjectCur.category = getCurrentTA[0].category
    taObjectCur.date = getCurrentTA[0].created_at
    connection.query(elementsTA, ta2Display, (err, getElemtsTA) => {
      if (err) throw err;
      getElemtsTA.forEach((result) => {
        taObjectCur.type.push(result.type);
        if (result.type == 'title') {
          taObjectCur.titleVal.push(result.content)
        }
        if (result.type == 'image') {
          taObjectCur.imageVal.push(result.content)
        }
        if (result.type == 'text') {
          // FIXME: Reformat the text string before insert it on the DB
          taObjectCur.textVal.push(result.content)
        }
        if (result.type == 'strategy') {
          var strategyVanilla = result.content;
          function truncateStrategy(compStragegy) {
            var pointer1;
            var pointer2;
            for (var i = 0; i < compStragegy.length; i++) {
              if (compStragegy.charAt(i) == "$") {
                if (pointer1 === undefined) {
                  pointer1 = i;
                } else {
                  pointer2 = i;
                }
              }
            }
            taObjectCur.strategyVal.push(strategyVanilla.substring(0, pointer1));
            taObjectCur.strategyImp.push(strategyVanilla.substring(pointer1 + 1, pointer2));
            taObjectCur.strategyTime.push(strategyVanilla.substring(pointer2 + 1, strategyVanilla.length));
          }
          truncateStrategy(strategyVanilla);
        }
      })
      connection.query(askTATitle, ta2Display, (err, getTATitle) => {
        if (err) throw err;
        var taTitle = getTATitle[0].pair + ", " + getTATitle[0].created_at;
        // FIXME: construct an object to pass the variables all in one go!
        res.render("user/entries/showTaTemplate", {user:userUsername, currencies:userPairs, strategies:userStrategies, timeframes:userTimeframes, taTitle:taTitle, taInfo:taObjectCur, thisTaID:ta2Display})
      })
    })
  })
})

// UPDATE TECHNICAL ANALYSIS ROUTE
router.get("/:id/edit", isLoggedIn, (req, res) => {
  // Get the ID from the TA to dipslay:
  var ta2Display = req.params.id
  // Define Queries
  var currentTA = 'SELECT pair, tanalysis.category, DATE_FORMAT(created_at, "%d/%m/%Y") AS created_at FROM tanalysis JOIN pairs ON tanalysis.pair_id = pairs.id WHERE tanalysis.id = ?';
  var elementsTA = 'SELECT * FROM telementanalysis JOIN telements ON telementanalysis.element_id = telements.id WHERE telementanalysis.ta_id = ?';
  var askTATitle = 'SELECT pair, DATE_FORMAT(created_at, "%d de %M %Y") AS created_at FROM tanalysis JOIN pairs ON tanalysis.pair_id = pairs.id WHERE tanalysis.id = ?';

  var taObjectCur = {
    pair: '',
    category: '',
    date: '',
    type: [],
    imageVal: [],
    titleVal: [],
    textVal: [],
    strategyVal: [],
    strategyImp: [],
    strategyTime: [],
  }
  connection.query(currentTA, ta2Display, (err, getCurrentTA) => {
    if (err) throw err;
    taObjectCur.pair = getCurrentTA[0].pair
    taObjectCur.category = getCurrentTA[0].category
    taObjectCur.date = getCurrentTA[0].created_at
    console.log(getCurrentTA);
    connection.query(elementsTA, ta2Display, (err, getElemtsTA) => {
      if (err) throw err;
      getElemtsTA.forEach((result) => {
        taObjectCur.type.push(result.type);
        if (result.type == 'title') {
          taObjectCur.titleVal.push(result.content)
        }
        if (result.type == 'image') {
          taObjectCur.imageVal.push(result.content)
        }
        if (result.type == 'text') {
          // FIXME: Reformat the text string before insert it on the DB
          taObjectCur.textVal.push(result.content)
        }
        if (result.type == 'strategy') {
          var strategyVanilla = result.content;
          function truncateStrategy(compStragegy) {
            var pointer1;
            var pointer2;
            for (var i = 0; i < compStragegy.length; i++) {
              if (compStragegy.charAt(i) == "$") {
                if (pointer1 === undefined) {
                  pointer1 = i;
                } else {
                  pointer2 = i;
                }
              }
            }
            taObjectCur.strategyVal.push(strategyVanilla.substring(0, pointer1));
            taObjectCur.strategyImp.push(strategyVanilla.substring(pointer1 + 1, pointer2));
            taObjectCur.strategyTime.push(strategyVanilla.substring(pointer2 + 1, strategyVanilla.length));
          }
          truncateStrategy(strategyVanilla);

        }
      })
      connection.query(askTATitle, ta2Display, (err, getTATitle) => {
        if (err) throw err;
        var taTitle = getTATitle[0].pair + ", " + getTATitle[0].created_at;
        // FIXME: construct an object to pass the variables all in one go!
        res.render("user/entries/editTaTemplate", {user:userUsername, currencies:userPairs, strategies:userStrategies, timeframes:userTimeframes, taTitle:taTitle, taInfo:taObjectCur, thisTaID:ta2Display})
      })
    })
  })
})

// UPDATE TECHNICAL ANALYSIS LOGIC
router.put("/:id", isLoggedIn, (req, res) => {
  // Get the Pair ID
  connection.query('SELECT id FROM pairs WHERE pair = ?', req.body.pair, (err, pairID) => {
    if (err) throw err;
    // Get the fields to eidt TA
    var technicala = [
      req.body.category,
      pairID[0].id,
      req.body.date,
      req.params.id
    ]
    // Query to update TA
    connection.query('UPDATE tanalysis SET category = ?, pair_id = ?, created_at = STR_TO_DATE(?, "%d/%m/%Y") WHERE id = ?', technicala, (err, updatedTA) => {
      if (err) throw err;
      console.log('Number of affected rows by UPDATE tanalysis: ' + updatedTA.affectedRows);
      // Delete elemens from the TA before repopulating the TA with the new values
      connection.query('DELETE FROM telementanalysis WHERE ta_id = ?', req.params.id, (err) => {
        if (err) throw err;
        // TA ID
        var ta_id = req.params.id;
        // Counters to track TA elements
        var counterTitle = 0;
        var counterImg = 0;
        var counterText = 0;
        var counterStrategy = 0

        connection.query('SELECT * FROM telements', (err, printElements) => {
          if (err) throw err;
          let etypes = new Map();
          for (var i = 0; i < printElements.length; i++) {
            etypes.set(printElements[i].type, printElements[i].id)
          }
          console.log("Data from the WEB: " + req.body.type);
          var data = []
          // Case 1: Multiple Ements in the TA
          if (Array.isArray(req.body.type)) {
            var multipleVals = req.body.type
            // FIXME: the Counts() for each element type are HARDCODED
            // FIXME: IF statements are also HARDCODED
            var titleCount = 0;
            var imageCount = 0;
            var textCount = 0;
            var strategyCount = 0;
            // Counters for Strategy Importance and Timeframe
            var stretegyTypesCount = 1;

            for (var els = 0; els < multipleVals.length; els++) {
              var elsPosition = els + 1;
              var contentVal;
              // FIXME: It is possible to imporve code
              if (multipleVals[els] == "title") {
                console.log('Title value dynamic: ' + req.body.title[titleCount]);
                console.log('First title value hardcoded: ' + req.body.title[0]);
                if (Array.isArray(req.body.title)) {
                  contentVal = req.body.title[titleCount];
                  titleCount += 1;
                } else {
                  contentVal = req.body.title;
                }
              }
              if (multipleVals[els] == "image") {
                if (Array.isArray(req.body.image)) {
                  contentVal = req.body.image[imageCount];
                  imageCount += 1;
                } else {
                  contentVal = req.body.image;
                }
              }
              if (multipleVals[els] == "text") {
                if (Array.isArray(req.body.text)) {
                  contentVal = req.body.text[textCount];
                  textCount += 1;
                } else {
                  contentVal = req.body.text;
                }
              }
              if (multipleVals[els] == "strategy") {
                if (Array.isArray(req.body.text)) {
                  var importance = "strategy_I_" + stretegyTypesCount;
                  var timeframe = "strategy_timeframes_" + stretegyTypesCount;
                  contentVal = req.body.strategy[strategyCount] + "$" + req.body[importance] + "$" + req.body[timeframe];
                  strategyCount += 1;
                  stretegyTypesCount += 1;
                } else {
                  req.body.strategy = singleVals + "$" + req.body.strategy_I_1 + "$" + req.body.strategy_timeframes_1
                  contentVal = req.body.strategy;
                }
              }
              console.log('Loop for element order: ' + elsPosition);
              data.push([ta_id, elsPosition, etypes.get(multipleVals[els]), contentVal])
            }

          // Case 2: Single Element TA
          } else {
            var singleVals = req.body.type;
            if (singleVals == "strategy") {
              req.body.strategy = singleVals + "$" + req.body.strategy_I_1 + "$" + req.body.strategy_timeframes_1
            }
            data.push([ta_id, 1, etypes.get(singleVals), req.body[singleVals]]);
          }
          console.log("Pointbreak. Log DATA: " + data);
          // Updating TA in the DB
          connection.query('INSERT INTO telementanalysis (ta_id, order_at, element_id, content) VALUES ?', [data], (err, finalized) => {
            if (err) throw err;
            console.log('Print ???: ' + req.body.strategy);
            res.redirect("/username/journal");
          })
        })
      })
    })
  })
})

// DELETE TECHNICAL ANALYSIS ROUTE
router.delete("/:id", isLoggedIn, (req, res) => {
  var ta2Delete = req.params.id
  var qDeleteElements = 'DELETE FROM telementanalysis WHERE ta_id = ?'
  var qDeleteAnalysis = 'DELETE FROM tanalysis WHERE id = ?'
  // Query to delete the elements on the TA -> telementanalysis table
  connection.query(qDeleteElements, ta2Delete, (err) => {
    if (err) throw err;

    // Query to delete the TA -> tanalysis table
    connection.query(qDeleteAnalysis, ta2Delete, (err) => {
      if (err) throw err;
      res.redirect("/username/journal");
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
