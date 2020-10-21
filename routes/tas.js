let express = require('express');
let router = express.Router({mergeParams: true});
let pairs = require('../models/pairs');
let categories = require('../models/categoriesPairs');
let middleware = require('../middleware');
let db = require('../models/dbConfig');

// Technical Analysis Elements
var titleTA = require('../models/elements/title');
var textTA = require('../models/elements/text');
var imageTA = require('../models/elements/image');
var strategyTA = require('../models/elements/strategy');

// INDEX TECHNICAL ANALYSIS ROUTE
router.get("/", middleware.isLoggedIn, (req, res) => {
  getAllTas = 'SELECT tanalysis.id, DATE_FORMAT(created_at, \'%d/%m/%y\') AS date, pair FROM tanalysis JOIN pairs ON tanalysis.pair_id = pairs.id WHERE user_id = ? ORDER BY created_at;'
  var dataList = []
  db.query(getAllTas, req.user.id, (err, results) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username);
    }
    results.forEach((result) => {
      dataList.push({
        id: result.id,
        date: result.date,
        pair: result.pair
      })
    });
    res.render("user/journal/ta/index", {dataList: dataList})
  })
})

// NEW TECHNICAL ANALYSIS ROUTE
router.get("/new", middleware.isLoggedIn, (req, res) => {
  // loads the technical analysis elements to an object
  var elements = {
    title: titleTA.html,
    text: textTA.html,
    image: imageTA.html,
    strategy: strategyTA.html(userStrategies)
  }
  res.render("user/journal/ta/new",
    {
      currencies: pairs,
      categories: categories,
      strategies: userStrategies,
      timeframes: timeframes,
      elements: elements
    }
  );
});

// NEW TECHNICAL ANALYSIS LOGIC
router.post("/", middleware.isLoggedIn, (req, res) => {
  // checks if date is valid
  if (req.body.date == "") {
    req.flash("error", res.__("Date cannot be blank."))
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
    // stores the constants of the technical analysis variables into the DB
    db.query('INSERT INTO tanalysis SET ?', newTa, (err, taId) => {
      if (err) throw err;
      var ta_id = taId.insertId;
      // extracts all the element types from the DB and maps them in a hash
      db.query('SELECT * FROM telements', (err, allElements) => {
        if (err) throw err;
        let aElements = new Map();
        for (var i = 0; i < allElements.length; i++) {
          aElements.set(allElements[i].type, allElements[i].id)
        }
        // stores the TA elements before sending them to the DB
        var data = []
        // case 1 -> multiple elements in a technical analysis
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
            // array to store one element of the technical analysis
            var elementInfo = []
            elementInfo.push(ta_id)
            elementInfo.push(elementPosition)
            elementInfo.push(aElements.get(elementsList[i]))
            // title elements
            if (elementsList[i] == "title") {
              // checks if there are multiple title elements
              if (Array.isArray(req.body.title)) {
                elementInfo.push(req.body.title[counterTitle]);
                counterTitle += 1;
              } else {
                elementInfo.push(req.body.title);
              }
              elementInfo.push(null);
              elementInfo.push(null);
              elementInfo.push(null);
            }
            // text elements
            if (elementsList[i] == "text") {
              // checks if there are multiple text elements
              if (Array.isArray(req.body.text)) {
                elementInfo.push(req.body.text[counterText]);
                counterText += 1;
              } else {
                elementInfo.push(req.body.text);
              }
              elementInfo.push(null);
              elementInfo.push(null);
              elementInfo.push(null);
            }
            // image elements
            if (elementsList[i] == "image") {
              elementInfo.push(null);
              // checks if there are multiple image elements
              if (Array.isArray(req.body.image)) {
                elementInfo.push(req.body.image[counterImage]);
                counterImage += 1;
              } else {
                elementInfo.push(req.body.image);
              }
              elementInfo.push(null);
              elementInfo.push(null);
            }
            // strategy elements
            if (elementsList[i] == "strategy") {
              // checks if there are multiple strategy elements
              if (Array.isArray(req.body.strategy)) {
                elementInfo.push(req.body.importance[counterStrategy]);
                elementInfo.push(null);
                // FIXME: it doesn't store the index of the user strategy, but the index within all strategies
                // NOTE: use 'userIdStrategies' to solve this problem across all routes
                elementInfo.push(userIdStrategies[req.body.strategy[counterStrategy]]);
                elementInfo.push(Number(req.body.timeframe[counterStrategy]) + 1);
                counterStrategy += 1;
              } else {
                elementInfo.push(req.body.importance);
                elementInfo.push(null);
                elementInfo.push(userIdStrategies[req.body.strategy]);
                elementInfo.push(Number(req.body.timeframe) + 1);
              }
            }
            // pushes each elments to the list of TA elements
            data.push(elementInfo)
            elementPosition++;
          }
        }
        // case 2 -> single element in a technical analysis
        else {
          // array to store one element of the technical analysis
          var elementInfo = []
          elementInfo.push(ta_id);
          elementInfo.push(1);
          elementInfo.push(aElements.get(req.body.type))
          // title & text element
          if ((req.body.type == "title") || (req.body.type == "text")) {
            elementInfo.push(req.body[req.body.type]);
            elementInfo.push(null);
            elementInfo.push(null);
            elementInfo.push(null);
          }
          // image element
          if (req.body.type == "image") {
            elementInfo.push(null);
            elementInfo.push(req.body.image);
            elementInfo.push(null);
            elementInfo.push(null);
          }
          // strategy element
          if (req.body.type == "strategy") {
            elementInfo.push(req.body.importance);
            elementInfo.push(null);
            elementInfo.push(userIdStrategies[req.body.strategy]);
            elementInfo.push(Number(req.body.timeframe) + 1);
          }
          data.push(elementInfo);
        }
        var addElements = 'INSERT INTO telementanalysis (ta_id, order_at, element_id, content, file, strategy_id, timeframe_id) VALUES ?'
        // stores the TA elements into the DB
        db.query(addElements, [data], (err, complete) => {
          if (err) throw err;
          res.redirect("/" + req.user.username + "/journal");
        })
      })
    })
  }
})


// SHOW TECHNICAL ANALYSIS ROUTE
router.get("/:id", middleware.isLoggedIn, (req, res) => {
  // inserts DB queries to a varialbe - too long
  var getTa = 'SELECT id, pair_id, category, tanalysis.category, DATE_FORMAT(created_at, \'%Y-%m-%d\') AS created_short, DATE_FORMAT(created_at, \'%d de %M %Y\') AS created_long FROM tanalysis WHERE id = ?';
  // OPTIMIZE: could another type of JOIN improve the query?
  var getElementsTa = 'SELECT * FROM telementanalysis JOIN telements ON telementanalysis.element_id = telements.id WHERE telementanalysis.ta_id = ? ORDER BY order_at';
  // object where the technical analysis information will be stored
  var taInfo = { }
  db.query(getTa, req.params.id, (err, results) => {
    if (err) throw err;
    taInfo.id = results[0].id;
    taInfo.title = pairs[Number(results[0].pair_id) - 1] + ', ' + results[0].created_long;
    taInfo.pair = Number(results[0].pair_id) - 1;
    taInfo.category = results[0].category;
    taInfo.date = results[0].created_short;
    // creates variable to concatenate the HTML of the technical analysis elements
    var elementsHtml = ``;
    // loads the technical analysis elements
    db.query(getElementsTa, req.params.id, (err, elementsTa) => {
      if (err) throw err;
      elementsTa.forEach((element) => {
        var appendHtml;
        // title element
        if (element.type === 'title') {
          appendHtml = titleTA.generate(element.content);
          elementsHtml += appendHtml;
        }
        // text element
        if (element.type === 'text') {
          appendHtml = textTA.generate(element.content);
          elementsHtml += appendHtml;
        }
        // image element
        if (element.type === 'image') {
          // converts the blob object in the DB to an utf-8 string
          var decodeBlob = Buffer.from(element.file, 'binary').toString('utf-8')
          appendHtml = imageTA.generate(decodeBlob);
          elementsHtml += appendHtml;
        }
        // strategy element
        if (element.type === 'strategy') {
          // gets the index of the strategy
          var currentIndex = userIdStrategies.findIndex(strategy => strategy == element.strategy_id);
          appendHtml = strategyTA.generate(userStrategies, currentIndex, element.content, element.timeframe_id);
          elementsHtml += appendHtml;
        }
      })
      taInfo.content = elementsHtml;
      res.render("user/journal/ta/show",
        {
          currencies:pairs,
          categories:categories,
          strategies:userStrategies,
          timeframes:timeframes,
          ta: taInfo
        }
      );
    })
  })
})

// UPDATE TECHNICAL ANALYSIS ROUTE
router.get("/:id/edit", middleware.isLoggedIn, (req, res) => {
  // loads the technical analysis elements to an object
  var elements = {
    title: titleTA.html,
    text: textTA.html,
    image: imageTA.html,
    strategy: strategyTA.html(userStrategies)
  }
  // inserts DB queries to a varialbe - too long
  var getTa = 'SELECT id, pair_id, category, tanalysis.category, DATE_FORMAT(created_at, \'%Y-%m-%d\') AS created_short, DATE_FORMAT(created_at, \'%d de %M %Y\') AS created_long FROM tanalysis WHERE id = ?';
  // OPTIMIZE: could another type of JOIN improve the query?
  var getElementsTa = 'SELECT * FROM telementanalysis JOIN telements ON telementanalysis.element_id = telements.id WHERE telementanalysis.ta_id = ? ORDER BY order_at';
  // object where the technical analysis information will be stored
  var taInfo = { }
  db.query(getTa, req.params.id, (err, results) => {
    if (err) throw err;
    taInfo.id = results[0].id;
    taInfo.title = pairs[Number(results[0].pair_id) - 1] + ', ' + results[0].created_long;
    taInfo.pair = Number(results[0].pair_id) - 1;
    taInfo.category = results[0].category;
    taInfo.date = results[0].created_short;
    // creates variable to concatenate the HTML of the technical analysis elements
    var elementsHtml = ``;
    // loads the technical analysis elements
    db.query(getElementsTa, req.params.id, (err, elementsTa) => {
      if (err) throw err;
      elementsTa.forEach((element) => {
        var appendHtml;
        // title element
        if (element.type === 'title') {
          appendHtml = titleTA.edit(element.content);
          elementsHtml += appendHtml;
        }
        // text element
        if (element.type === 'text') {
          appendHtml = textTA.edit(element.content);
          elementsHtml += appendHtml;
        }
        // image element
        if (element.type === 'image') {
          // converts the blob object in the DB to an utf-8 string
          var decodeBlob = Buffer.from(element.file, 'binary').toString('utf-8')
          appendHtml = imageTA.edit(decodeBlob);
          elementsHtml += appendHtml;
        }
        // strategy element
        if (element.type === 'strategy') {
          // gets the index of the strategy
          var currentIndex = userIdStrategies.findIndex(strategy => strategy == element.strategy_id);
          appendHtml = strategyTA.generate(userStrategies, currentIndex, element.content, element.timeframe_id);
          elementsHtml += appendHtml;
        }
      })
      taInfo.content = elementsHtml;
      res.render("user/journal/ta/edit",
        {
          currencies:pairs,
          categories:categories,
          strategies:userStrategies,
          timeframes:timeframes,
          elements:elements,
          ta: taInfo
        }
      );
    })
  })
})

// UPDATE TECHNICAL ANALYSIS LOGIC
router.put("/:id", middleware.isLoggedIn, (req, res) => {
  // checks if date is valid
  if (req.body.date == "") {
    req.flash("error", res.__("Date cannot be blank."))
    res.redirect("/" + req.user.username + "/journal/ta/" + req.params.id)
  }
  // creates an object with the updated technical analysis variables
  else {
    var editTa = {
      pair_id: Number(req.body.pair) + 1,
      category: req.body.category,
      created_at: req.body.date,
      user_id: req.user.id
    }
    // stores the constants of the technical analysis into the DB
    db.query('UPDATE tanalysis SET ? WHERE id = ?', [editTa, req.params.id], (err, taId) => {
      if (err) throw err;
      var ta_id = taId.insertId;
      // checks if the route technical analysis id match the id from the update query
      if (ta_id != req.params.id) {
        throw new Error("The updated TA doesn't match with the current TA")
      }
      // extracts all the element types from the DB and maps them in a hash
      db.query('SELECT * FROM telements', (err, allElements) => {
        if (err) throw err;
        let aElements = new Map();
        for (var i = 0; i < allElements.length; i++) {
          aElements.set(allElements[i].type, allElements[i].id)
        }
        // deletes the old technical analysis before storing the updated elements
        db.query('DELETE FROM telementanalysis WHERE ta_id = ?', ta_id, (err) => {
          if (err) throw err;
          // stores the TA elements before sending them to the DB
          var data = []
          // case 1 -> multiple elements in a technical analysis
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
              // array to store one element of the technical analysis
              var elementInfo = []
              elementInfo.push(ta_id)
              elementInfo.push(elementPosition)
              elementInfo.push(aElements.get(elementsList[i]))
              // title elements
              if (elementsList[i] == "title") {
                // checks if there are multiple title elements
                if (Array.isArray(req.body.title)) {
                  elementInfo.push(req.body.title[counterTitle]);
                  counterTitle += 1;
                } else {
                  elementInfo.push(req.body.title);
                }
                elementInfo.push(null);
                elementInfo.push(null);
                elementInfo.push(null);
              }
              // text elements
              if (elementsList[i] == "text") {
                // checks if there are multiple text elements
                if (Array.isArray(req.body.text)) {
                  elementInfo.push(req.body.text[counterText]);
                  counterText += 1;
                } else {
                  elementInfo.push(req.body.text);
                }
                elementInfo.push(null);
                elementInfo.push(null);
                elementInfo.push(null);
              }
              // image elements
              if (elementsList[i] == "image") {
                elementInfo.push(null);
                // checks if there are multiple image elements
                if (Array.isArray(req.body.image)) {
                  elementInfo.push(req.body.image[counterImage]);
                  counterImage += 1;
                } else {
                  elementInfo.push(req.body.image);
                }
                elementInfo.push(null);
                elementInfo.push(null);
              }
              // strategy elements
              if (elementsList[i] == "strategy") {
                // checks if there are multiple strategy elements
                if (Array.isArray(req.body.strategy)) {
                  elementInfo.push(req.body.importance[counterStrategy]);
                  elementInfo.push(null);
                  elementInfo.push(userIdStrategies[req.body.strategy[counterStrategy]]);
                  elementInfo.push(Number(req.body.timeframe[counterStrategy]) + 1);
                  counterStrategy += 1;
                } else {
                  elementInfo.push(req.body.importance);
                  elementInfo.push(null);
                  elementInfo.push(userIdStrategies[req.body.strategy]);
                  elementInfo.push(Number(req.body.timeframe) + 1);
                }
              }
              // pushes each elments to the list of TA elements
              data.push(elementInfo)
              elementPosition++;
            }
          }
          // case 2 -> single element in a technical analysis
          else {
            // array to store one element of the technical analysis
            var elementInfo = []
            elementInfo.push(ta_id);
            elementInfo.push(1);
            elementInfo.push(aElements.get(req.body.type))
            // title & text element
            if ((req.body.type == "title") || (req.body.type == "text")) {
              elementInfo.push(req.body[req.body.type]);
              elementInfo.push(null);
              elementInfo.push(null);
              elementInfo.push(null);
            }
            // image element
            if (req.body.type == "image") {
              elementInfo.push(null);
              elementInfo.push(req.body.image);
              elementInfo.push(null);
              elementInfo.push(null);
            }
            // strategy element
            if (req.body.type == "strategy") {
              elementInfo.push(req.body.importance);
              elementInfo.push(null);
              elementInfo.push(userIdStrategies[req.body.strategy]);
              elementInfo.push(Number(req.body.timeframe) + 1);
            }
            data.push(elementInfo);
          }
          var addElements = 'INSERT INTO telementanalysis (ta_id, order_at, element_id, content, file, strategy_id, timeframe_id) VALUES ?'
          // stores the TA elements into the DB
          db.query(addElements, [data], (err, complete) => {
            if (err) throw err;
            res.redirect("/" + req.user.username + "/journal");
          })
        })
      })
    })
  }
})

// DELETE TECHNICAL ANALYSIS ROUTE
router.delete("/:id", middleware.isLoggedIn, (req, res) => {
  var deleteElementsTa = 'DELETE FROM telementanalysis WHERE ta_id = ?'
  var deleteTa = 'DELETE FROM tanalysis WHERE id = ?'
  // deletes the technical analysis elements from the DB
  db.query(deleteElementsTa, req.params.id, (err) => {
    if (err) throw err;
    // deletes the technical analysis from the DB
    db.query(deleteTa, req.params.id, (err) => {
      if (err) throw err;
      res.redirect("/" + req.user.username + "/journal");
    })
  })
})

module.exports = router;
