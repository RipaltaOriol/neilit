let express = require('express');
let fs = require('fs');
let util = require('util');
let router = express.Router({mergeParams: true});
let pairs = require('../models/pairs');
let categories = require('../models/categoriesPairs');
let categoriesDistinct = require('../models/categories')
let taElements = require('../models/ta_elements.js');
let middleware = require('../middleware');
let db = require('../models/dbConfig');

// Technical Analysis Elements
var titleTA = require('../models/elements/title');
var textTA = require('../models/elements/text');
var imageTA = require('../models/elements/image');
var strategyTA = require('../models/elements/strategy');

// INDEX TECHNICAL ANALYSIS ROUTE
router.get("/", middleware.isLoggedIn, (req, res) => {
  var getTAs = 'SELECT tanalysis.id, created_at, pair, last_update FROM tanalysis JOIN pairs ON tanalysis.pair_id = pairs.id WHERE user_id = ? ORDER BY created_at DESC LIMIT 25;';
  var options = { year: 'numeric', month: 'long', day: 'numeric' };
  var dataList = []
  db.query(getTAs, req.user.id, (err, results) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username);
    }
    results.forEach((result) => {
      dataList.push({
        id: result.id,
        date: result.created_at.toLocaleDateString(req.user.language, options),
        update: result.last_update.toLocaleDateString(req.user.language, options),
        pair: result.pair
      })
    });
    res.render("user/journal/ta/index",
      {
        dataList: dataList,
        currencies: pairs,
        categories: categoriesDistinct
      }
    )
  })
})

// INDEX TECHNICAL ANALYSIS INFINITE SCROLL LOGIC
router.post("/load-index", middleware.isLoggedIn, (req, res) => {
  var getTAs = 'SELECT tanalysis.id, created_at, pair, last_update FROM tanalysis JOIN pairs ON tanalysis.pair_id = pairs.id WHERE user_id = ? ORDER BY created_at DESC LIMIT 25 OFFSET ?;';
  if (req.body.query) { getTAs = req.body.query + ' OFFSET ?;'}
  var options = { year: 'numeric', month: 'long', day: 'numeric' };
  var dataList = []
  db.query(getTAs, [req.user.id, Number(req.body.offset)], (err, results) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username);
    }
    results.forEach((result) => {
      dataList.push({
        id: result.id,
        date: result.created_at.toLocaleDateString(req.user.language, options),
        update: result.last_update.toLocaleDateString(req.user.language, options),
        pair: result.pair
      })
    });
    return res.json({
      dataList: dataList,
      buttonText: res.__('Go to TA')
    });
  })
})

// FILTER LOGIC
router.post("/filter", middleware.isLoggedIn, (req, res) => {
  var createFilter = ''
  var editFilter = ''
  if (req.body.create) { createFilter = '&& created_at >= ' + req.body.create + ' >= created_at' }
  if (req.body.edit) { editFilter = '&& last_update >= ' + req.body.edit + ' >= last_update' }
  var getTAs = `SELECT tanalysis.id, created_at, pair, last_update FROM tanalysis JOIN pairs ON tanalysis.pair_id = pairs.id
    WHERE user_id = ? && (${req.body.pairs}) && (${req.body.categories}) ${editFilter} ${createFilter} ORDER BY ${req.body.sort} ${req.body.order} LIMIT 25`;
  var options = { year: 'numeric', month: 'long', day: 'numeric' };
  var dataList = []
  db.query(getTAs, req.user.id, (err, results) => {
    if (err) {
      console.log(err);
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/ta');
    }
    results.forEach((result) => {
      dataList.push({
        id: result.id,
        date: result.created_at.toLocaleDateString(req.user.language, options),
        update: result.last_update.toLocaleDateString(req.user.language, options),
        pair: result.pair
      })
    });
    return res.json({
      dataList: dataList,
      buttonText: res.__('Go to TA'),
      query: getTAs
    });
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
  var addElements = 'INSERT INTO telementanalysis (ta_id, order_at, element_id, content, file, strategy_id, timeframe_id) VALUES ?'
  // checks if date is valid
  if (req.body.date == "") {
    req.flash("error", res.__("Date cannot be blank."))
    res.redirect("/" + req.user.username + "/journal/ta/new")
  }
  // creates an object with the new technical analysis variables
  else {
    var newTa = {
      pair_id: Number(req.body.pair),
      category: req.body.category,
      created_at: req.body.date,
      user_id: req.user.id
    }
    // stores the constants of the technical analysis variables into the DB
    db.query('INSERT INTO tanalysis SET ?', newTa, (err, taId) => {
      if (err) {
        console.log(err);
        // COMBAK: log error
        req.flash('error', res.__('Something went wrong, please try again.'))
        return res.redirect('/' + req.user.username + '/journal/ta');
      }
      var ta_id = taId.insertId;
      // stores the TA elements before sending them to the DB
      var data = []
      // MULTIPLE ELEMENTS
      if (Array.isArray(req.body.type)) {
        var elementsList = req.body.type
        // counters for each element type
        // NOTE: all the counters are HARDCODED
        var counterTitle = 0;
        var counterImage = 0;
        var counterText = 0;
        var counterStrategy = 0;
        var position = 1;
        // NOTE: all 'if' statements are HARDCODED
        for (var i = 0; i < elementsList.length; i++) {
          // array to store one element of the technical analysis
          var elementInfo = []
          elementInfo.push(ta_id)
          elementInfo.push(position)
          elementInfo.push(taElements.get(elementsList[i]))
          switch (elementsList[i]) {
            case 'title':
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
              break;
            case 'text':
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
              break;
            case 'image':
            elementInfo.push(null);
              // checks if there are multiple image elements
              if (Array.isArray(req.body.image)) {
                if (req.body.image[counterImage] == '') {
                  req.flash('error', res.__('Image URL cannot be left blank.'))
                  return res.redirect('/' + req.user.username + '/journal/ta/new');
                }
                elementInfo.push(req.body.image[counterImage]);
                counterImage += 1;
              } else {
                if (req.body.image == '') {
                  req.flash('error', res.__('Image URL cannot be left blank.'))
                  return res.redirect('/' + req.user.username + '/journal/ta/new');
                }
                elementInfo.push(req.body.image);
              }
              elementInfo.push(null);
              elementInfo.push(null);
              break;
            case 'strategy':
              // checks if there are multiple strategy elements
              if (Array.isArray(req.body.strategy)) {
                if (req.body.importance[counterStrategy] == '') {
                  req.flash('error', res.__('Strategies need a type.'))
                  return res.redirect('/' + req.user.username + '/journal/ta/new');
                }
                elementInfo.push(req.body.importance[counterStrategy]);
                elementInfo.push(null);
                elementInfo.push(userIdStrategies[req.body.strategy[counterStrategy]]);
                elementInfo.push(Number(req.body.timeframe[counterStrategy]));
                counterStrategy += 1;
              } else {
                if (req.body.importance == '') {
                  req.flash('error', res.__('Strategies need a type.'))
                  return res.redirect('/' + req.user.username + '/journal/ta/new');
                }
                elementInfo.push(req.body.importance);
                elementInfo.push(null);
                elementInfo.push(userIdStrategies[req.body.strategy]);
                elementInfo.push(Number(req.body.timeframe));
              }
              break;
          }
          // pushes each elments to the list of TA elements
          data.push(elementInfo)
          position++;
        }
      }
      // SINGLE ELEMENT
      else {
        // array to store one element of the technical analysis
        var elementInfo = []
        elementInfo.push(ta_id);
        elementInfo.push(1);
        elementInfo.push(taElements.get(req.body.type))
        switch (req.body.type) {
          case 'title':
            elementInfo.push(req.body[req.body.type]);
            elementInfo.push(null);
            elementInfo.push(null);
            elementInfo.push(null);
            break;
          case 'text':
            elementInfo.push(req.body[req.body.type]);
            elementInfo.push(null);
            elementInfo.push(null);
            elementInfo.push(null);
            break;
          case 'image':
            elementInfo.push(null);
            if (req.body.image == '') {
              req.flash('error', res.__('Image URL cannot be left blank.'))
              return res.redirect('/' + req.user.username + '/journal/ta/new');
            }
            elementInfo.push(req.body.image);
            elementInfo.push(null);
            elementInfo.push(null);
            break;
          case 'strategy':
            if (req.body.importance == '') {
              req.flash('error', res.__('Strategies need a type.'))
              return res.redirect('/' + req.user.username + '/journal/ta/new');
            }
            elementInfo.push(req.body.importance);
            elementInfo.push(null);
            console.log(req.body);
            elementInfo.push(userIdStrategies[Number(req.body.strategy)]);
            elementInfo.push(Number(req.body.timeframe));
            break;
        }
        data.push(elementInfo);
      }
      // stores the TA elements into the DB
      db.query(addElements, [data], (err, complete) => {
        if (err) {
          var logFile = fs.createWriteStream('log.txt', { flags: 'w' });
          var logStdout = process.stdout;
          console.log = function () {
            logFile.write(util.format.apply(null, arguments) + '\n');
            logStdout.write(util.format.apply(null, arguments) + '\n');
          }
          console.error = console.log(err);
          req.flash('error', res.__('Something went wrong, please try again.'))
          return res.redirect('/' + req.user.username + '/journal/ta');
        }
        res.redirect("/" + req.user.username + "/journal/ta");
      })
    })
  }
})


// SHOW TECHNICAL ANALYSIS ROUTE
router.get("/:id", middleware.isLoggedIn, (req, res) => {
  var getTa = 'SELECT * FROM tanalysis WHERE id = ?';
  var getElementsTa = 'SELECT * FROM telementanalysis JOIN telements ON telementanalysis.element_id = telements.id WHERE telementanalysis.ta_id = ? ORDER BY order_at';
  var options = { year: 'numeric', month: 'long', day: 'numeric' };
  // object where the technical analysis information will be stored
  var taInfo = { }
  db.query(getTa, req.params.id, (err, results) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/ta');
    }
    taInfo.id       = results[0].id;
    taInfo.title    = pairs[results[0].pair_id - 1] + ' - Updated: ' + results[0].last_update.toLocaleDateString(req.user.language, options);
    taInfo.pair     = pairs[results[0].pair_id - 1];
    taInfo.category = results[0].category;
    taInfo.date     = results[0].created_at.toLocaleDateString(req.user.language, options);
    // creates variable to concatenate the HTML of the technical analysis elements
    var elementsHtml = ``;
    // loads the technical analysis elements
    db.query(getElementsTa, req.params.id, (err, elementsTa) => {
      if (err) {
        console.log(err);
        // COMBAK: log error
        req.flash('error', res.__('Something went wrong, please try again.'))
        return res.redirect('/' + req.user.username + '/journal/ta');
      }
      elementsTa.forEach((element) => {
        var appendHtml;
        switch (element.type) {
          case 'title':
            appendHtml = titleTA.generate(element.content);
            break;
          case 'text':
            appendHtml = textTA.generate(element.content);
            break;
          case 'image':
            // converts the blob object in the DB to an utf-8 string
            var decodeBlob = Buffer.from(element.file, 'binary').toString('utf-8')
            appendHtml = imageTA.generate(decodeBlob);
            break;
          case 'strategy':
            var currentIndex = userIdStrategies.findIndex(strategy => strategy == element.strategy_id);
            appendHtml = strategyTA.generate(userStrategies, currentIndex, element.content, element.timeframe_id);
            break;
        }
        elementsHtml += appendHtml;
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
  var getTa = 'SELECT id, pair_id, category, created_at, last_update FROM tanalysis WHERE id = ?';
  // OPTIMIZE: could another type of JOIN improve the query?
  var getElementsTa = 'SELECT * FROM telementanalysis JOIN telements ON telementanalysis.element_id = telements.id WHERE telementanalysis.ta_id = ? ORDER BY order_at';
  var options = { year: 'numeric', month: 'long', day: 'numeric' };
  // loads the technical analysis elements to an object
  var elements = {
    title: titleTA.html,
    text: textTA.html,
    image: imageTA.html,
    strategy: strategyTA.html(userStrategies)
  }
  // object where the technical analysis information will be stored
  var taInfo = { }
  db.query(getTa, req.params.id, (err, results) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/ta');
    }
    taInfo.id = results[0].id;
    taInfo.title = pairs[results[0].pair_id - 1] + ' - Updated: ' + results[0].last_update.toLocaleDateString(req.user.language, options);
    taInfo.pair = results[0].pair_id;
    taInfo.category = results[0].category;
    taInfo.date = results[0].created_at.toLocaleDateString(req.user.language, options);
    // fixes offset between timezones
    var date = new Date(results[0].created_at);
    var offset = date.getTimezoneOffset()
    date = new Date(date.getTime() - (offset * 60 * 1000))
    taInfo.altDate = date.toISOString().split('T')[0];
    // creates variable to concatenate the HTML of the technical analysis elements
    var elementsHtml = ``;
    // loads the technical analysis elements
    db.query(getElementsTa, req.params.id, (err, elementsTa) => {
      if (err) {
        // COMBAK: log error
        req.flash('error', res.__('Something went wrong, please try again.'))
        return res.redirect('/' + req.user.username + '/journal/ta');
      }
      elementsTa.forEach((element) => {
        var appendHtml;
        switch (element.type) {
          case 'title':
            appendHtml = titleTA.edit(element.content);
            break;
          case 'text':
            appendHtml = textTA.edit(element.content);
            break;
          case 'image':
            // converts the blob object in the DB to an utf-8 string
            var decodeBlob = Buffer.from(element.file, 'binary').toString('utf-8')
            appendHtml = imageTA.edit(decodeBlob);
            break;
          case 'strategy':
            // gets the index of the strategy
            var currentIndex = userIdStrategies.findIndex(strategy => strategy == element.strategy_id);
            appendHtml = strategyTA.edit(userStrategies, currentIndex, element.content, element.timeframe_id);
            break;
        }
        elementsHtml += appendHtml;
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
  var addElements = 'INSERT INTO telementanalysis (ta_id, order_at, element_id, content, file, strategy_id, timeframe_id) VALUES ?'
  // checks if date is valid
  if (req.body.date == "") {
    req.flash("error", res.__("Date cannot be blank."))
    res.redirect("/" + req.user.username + "/journal/ta/" + req.params.id)
  }
  // creates an object with the updated technical analysis variables
  else {
    var replaceChars={ "/":"-" , ",":"" };
    var editTa = {
      pair_id: Number(req.body.pair),
      category: req.body.category,
      created_at: req.body.date,
      last_update: new Date().toISOString().slice(0, 10) + " " + new Date().toLocaleTimeString('en-GB'),
      user_id: req.user.id
    }
    // stores the constants of the technical analysis into the DB
    db.query('UPDATE tanalysis SET ? WHERE id = ?', [editTa, req.params.id], (err, taId) => {
      if (err) {
        console.log(err);
        // COMBAK: log error
        req.flash('error', res.__('Something went wrong, please try again.'))
        return res.redirect('/' + req.user.username + '/journal/ta');
      }
      var ta_id = req.params.id;
      // deletes the old technical analysis before storing the updated elements
      db.query('DELETE FROM telementanalysis WHERE ta_id = ?', ta_id, (err) => {
        if (err) {
          // COMBAK: log error
          req.flash('error', res.__('Something went wrong, please try again.'))
          return res.redirect('/' + req.user.username + '/journal/ta');
        }
        // stores the TA elements before sending them to the DB
        var data = []
        // MULTIPLE ELEMENTS
        if (Array.isArray(req.body.type)) {
          var elementsList = req.body.type
          // counters for each element type
          // NOTE: all the counters are HARDCODED
          var counterTitle = 0;
          var counterImage = 0;
          var counterText = 0;
          var counterStrategy = 0;
          var position = 1;
          // NOTE: all 'if' statements are HARDCODED
          for (var i = 0; i < elementsList.length; i++) {
            // array to store one element of the technical analysis
            var elementInfo = []
            elementInfo.push(ta_id)
            elementInfo.push(position)
            elementInfo.push(taElements.get(elementsList[i]))
            switch (elementsList[i]) {
              case 'title':
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
                break;
              case 'text':
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
                break;
              case 'image':
                elementInfo.push(null);
                // checks if there are multiple image elements
                if (Array.isArray(req.body.image)) {
                  if (req.body.image[counterImage] == '') {
                    req.flash('error', res.__('Image URL cannot be left blank.'))
                    return res.redirect('/' + req.user.username + '/journal/ta/' + req.params.id + '/edit');
                  }
                  elementInfo.push(req.body.image[counterImage]);
                  counterImage += 1;
                } else {
                  if (req.body.image == '') {
                    req.flash('error', res.__('Image URL cannot be left blank.'))
                    return res.redirect('/' + req.user.username + '/journal/ta/' + req.params.id + '/edit');
                  }
                  elementInfo.push(req.body.image);
                }
                elementInfo.push(null);
                elementInfo.push(null);
                break;
              case 'strategy':
                // checks if there are multiple strategy elements
                if (Array.isArray(req.body.strategy)) {
                  if (req.body.importance[counterStrategy] == '') {
                    req.flash('error', res.__('Strategies need a type.'))
                    return res.redirect('/' + req.user.username + '/journal/ta/' + req.params.id + '/edit');
                  }
                  elementInfo.push(req.body.importance[counterStrategy]);
                  elementInfo.push(null);
                  elementInfo.push(userIdStrategies[req.body.strategy[counterStrategy]]);
                  elementInfo.push(Number(req.body.timeframe[counterStrategy]));
                  counterStrategy += 1;
                } else {
                  if (req.body.importance == '') {
                    req.flash('error', res.__('Strategies need a type.'))
                    return res.redirect('/' + req.user.username + '/journal/ta/' + req.params.id + '/edit');
                  }
                  elementInfo.push(req.body.importance);
                  elementInfo.push(null);
                  elementInfo.push(userIdStrategies[req.body.strategy]);
                  elementInfo.push(Number(req.body.timeframe));
                }
                break;
            }
            // pushes each elments to the list of TA elements
            data.push(elementInfo)
            position++;
          }
        }
        // SINGLE ELEMENT
        else {
          // array to store one element of the technical analysis
          var elementInfo = []
          elementInfo.push(ta_id);
          elementInfo.push(1);
          elementInfo.push(taElements.get(req.body.type))
          switch (req.body.type) {
            case 'title':
              elementInfo.push(req.body[req.body.type]);
              elementInfo.push(null);
              elementInfo.push(null);
              elementInfo.push(null);
              break;
            case 'text':
              elementInfo.push(req.body[req.body.type]);
              elementInfo.push(null);
              elementInfo.push(null);
              elementInfo.push(null);
              break;
            case 'image':
              elementInfo.push(null);
              if (req.body.image == '') {
                req.flash('error', res.__('Image URL cannot be left blank.'))
                return res.redirect('/' + req.user.username + '/journal/ta/' + req.params.id + '/edit');
              }
              elementInfo.push(req.body.image);
              elementInfo.push(null);
              elementInfo.push(null);
              break;
            case 'strategy':
            if (req.body.importance == '') {
              req.flash('error', res.__('Strategies need a type.'))
              return res.redirect('/' + req.user.username + '/journal/ta/' + req.params.id + '/edit');
            }
              elementInfo.push(req.body.importance);
              elementInfo.push(null);
              elementInfo.push(userIdStrategies[Number(req.body.strategy)]);
              elementInfo.push(Number(req.body.timeframe));
              break;
          }
          data.push(elementInfo);
        }
        // stores the TA elements into the DB
        db.query(addElements, [data], (err, complete) => {
          if (err) {
            // COMBAK: log error
            req.flash('error', res.__('Something went wrong, please try again.'))
            return res.redirect('/' + req.user.username + '/journal/ta');
          }
          res.redirect("/" + req.user.username + "/journal/ta");
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
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/ta');
    }
    // deletes the technical analysis from the DB
    db.query(deleteTa, req.params.id, (err) => {
      if (err) {
        // COMBAK: log error
        req.flash('error', res.__('Something went wrong, please try again.'))
        return res.redirect('/' + req.user.username + '/journal/ta');
      }
      res.redirect("/" + req.user.username + "/journal/ta");
    })
  })
})

module.exports = router;
