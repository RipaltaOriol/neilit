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
  // loads the technical analysis elements to an object
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
  // checks that date is valid
  if (req.body.date == "") {
    req.flash("error", "Date cannot be blank.")
    res.redirect("/" + req.user.username + "/journal/ta/new")
  }
  // creates an object with the new technical analysis variables
  else {
    var newTa = {
      pair_id: Number(req.body.pair) + 1,
      category: req.body.category,
      created_at: req.body.date,
      user_id: req.user.id
    }

    // store the constant technical analysis variables into the DB
    connection.query('INSERT INTO tanalysis SET ?', newTa, (err, taId) => {
      if (err) throw err;
      var ta_id = taId.insertId;

      // gets all the element types from the DB and maps them in a hash
      connection.query('SELECT * FROM telements', (err, allElements) => {
        if (err) throw err;
        let aElements = new Map();
        for (var i = 0; i < allElements.length; i++) {
          aElements.set(allElements[i].type, allElements[i].id)
        }
        // stores the TA elements before sending them to the DB
        var data = []
        // case 1 -> multiple elments in a technical analysis
        if (Array.isArray(req.body.type)) {

          var elementsList = req.body.type
          // counters for each element type
          // NOTE: all the counters are HARDCODED
          var counterTitle = 0;
          var counterImage = 0;
          var counterText = 0;
          var counterStrategy = 0;
          var elementPosition = 1;
          // NOTE: all 'if' statements are HARDCODED
          for (var i = 0; i < elementsList.length; i++) {
            // title elements
            if (elementsList[i] == "title") {
              // checks if there are multiple title elements
              if (Array.isArray(req.body.title)) {
                var currentElement = req.body.title[counterTitle];
                counterTitle += 1;
              } else {
                var currentElement = req.body.title;
              }
            }
            // text elements
            if (elementsList[i] == "text") {
              // checks if there are multiple text elements
              if (Array.isArray(req.body.text)) {
                var currentElement = req.body.text[counterText];
                counterText += 1;
              } else {
                var currentElement = req.body.text;
              }
            }
            // image elements
            if (elementsList[i] == "image") {
              // checks if there are multiple image elements
              if (Array.isArray(req.body.image)) {
                var currentElement = req.body.image[counterImage];
                counterImage += 1;
              } else {
                var currentElement = req.body.image
              }
            }
            // strategy elements
            if (elementsList[i] == "strategy") {
              // checks if there are multiple straegy elements
              if (Array.isArray(req.body.strategy)) {
                var indexStrategy = userIdStrategies[req.body.strategy[counterStrategy]];
                var indexTimeframe = Number(req.body.timeframe[counterStrategy]) + 1;
                var currentElement = indexStrategy + "$" + req.body.importance[counterStrategy] + "$" + indexTimeframe;
                counterStrategy += 1;
              } else {
                var indexStrategy = userIdStrategies[req.body.strategy];
                var indexTimeframe = Number(req.body.timeframe) + 1;
                var currentElement = indexStrategy + "$" + req.body.importance + "$" + indexTimeframe;
              }
            }
            // pushes each elments to the list of TA elements
            data.push([ta_id, elementPosition, aElements.get(elementsList[i]), currentElement])
            elementPosition++;
          }
        }
        // case 2 -> single element in a technical analysis
        else {
          var singleElement = req.body.type
          // slight adjustment for straegy element
          if (singleElement == "strategy") {
            var indexStrategy = userIdStrategies[req.body.straegy]
            var indexTimeframe = Number(req.body.timeframe[counterStrategy]) + 1;
            req.body.strategy = singleVals + "$" + req.body.importance + "$" + indexTimeframe;
          }
          data.push([ta_id, 1, aElements.get(singleElement), req.body[singleElement]]);
        }
        console.log('It gets here w/ problem');
        // stores the TA elements into the DB
        connection.query('INSERT INTO telementanalysis (ta_id, order_at, element_id, content) VALUES ?', [data], (err, complete) => {
          if (err) throw err;
          res.redirect("/" + req.user.username + "/journal");
        })
      })
    })
  }
})


// SHOW COMMENT ROUTE
router.get("/:id", isLoggedIn, (req, res) => {
  // insert queries to a varialbe - too long
  var getTa = 'SELECT pair_id, category, tanalysis.category, DATE_FORMAT(created_at, "%d/%m/%Y") AS created_short, DATE_FORMAT(created_at, "%d de %M %Y") AS created_long FROM tanalysis WHERE id = ?';
  // OPTIMIZE: could another type of JOIN improve the query?
  var getElementsTa = 'SELECT * FROM telementanalysis JOIN telements ON telementanalysis.element_id = telements.id WHERE telementanalysis.ta_id = ? ORDER BY order_at';
  // object where the technical analysis information will be stored
  var taInfo = {}
  connection.query(getTa, req.params.id, (err, results) => {
    if (err) throw err;
    taInfo.title = pairs[Number(results[0].pair_id) - 1].created_long + ', ' + results[0].created_long;
    taInfo.pair = results[0].pair_id) - 1;
    taInfo.category = results[0].category;
    taInfo.date = results[0].created_short;
    // creates variable to concatenate the HTML of the technical analysis elements
    var elementsHtml = ``;
    // loads the technical analysis elements
    connection.query(getElementsTa, req.params.id, (err, elementsTa) => {
      if (err) throw err;
      elementsTa.forEach((element) => {
        var appendHtml;
        // title element
        if (element.type = 'title') {
          appendHtml = titleTA.generate(element.content);
          elementsHtml += appendHtml;
        }
        // text element
        if (element.type = 'text') {
          appendHtml = textTA.generate(element.content);
          elementsHtml += appendHtml;
        }
        // image element
        if (element.type = 'image') {
          appendHtml = imageTA.generate(element.content);
          elementsHtml += appendHtml;
        }
        // strategy element
        if (element.type = 'strategy') {
          // FIXME: this function should have more than one parameter
          appendHtml = strategyTA.generate(element.content);
          elementsHtml += appendHtml;
        }
      })
      taInfo.content = elementsHtml;

      console.log('Status: ');
      console.log(taInfo);
      res.send('provisional page')
    })
  })
})

//   var askTATitle = 'SELECT pair, DATE_FORMAT(created_at, "%d de %M %Y") AS created_at FROM tanalysis JOIN pairs ON tanalysis.pair_id = pairs.id WHERE tanalysis.id = ?';
//
//   // FIXME: You can order by the order the elements appear in the page
//   // Get the ID from the TA to dipslay:
//   // not necessary
//   // var ta2Display = req.params.id
//
//
//   // object wher the technical analysis information will be stored
//   var taInfo = {
//     pair: '',
//     category: '',
//     date: '',
//     html: ' ', // display the HTML here
//     // from here it should be able to generated w/ the models
//     type: [],
//     imageVal: [],
//     titleVal: [],
//     textVal: [],
//     strategyVal: [],
//     strategyImp: [],
//     strategyTime: [],
//   }
//

//

//       connection.query(askTATitle, ta2Display, (err, getTATitle) => {
//         if (err) throw err;
//         var taTitle = getTATitle[0].pair + ", " + getTATitle[0].created_at;
//         // FIXME: construct an object to pass the variables all in one go!
//         res.render("user/entries/showTaTemplate", {user:userUsername, currencies:userPairs, strategies:userStrategies, timeframes:userTimeframes, taTitle:taTitle, taInfo:taObjectCur, thisTaID:ta2Display})
//       })
//     })
//   })
// })

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
