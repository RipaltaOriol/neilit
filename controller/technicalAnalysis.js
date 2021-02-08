// dependencies
let fs    = require('fs');
let util  = require('util');

// global variables
let pairs       = require('../models/pairs');
let categories  = require('../models/categories')
let taElements  = require('../models/ta_elements.js');
let db          = require('../models/dbConfig');
let logger      = require('../models/winstonConfig');

// imported elements
var titleTA     = require('../models/elements/title');
var textTA      = require('../models/elements/text');
var imageTA     = require('../models/elements/image');
var strategyTA  = require('../models/elements/strategy');

module.exports.index = (req, res) => {
  var getTAs = 'SELECT ta.id, created_at, pair, last_update FROM tanalysis ta JOIN pairs p ON ta.pair_id = p.id WHERE ta.user_id = ? ORDER BY created_at DESC LIMIT 25;';
  db.query(getTAs, req.user.id, (err, results) => {
    if (err) {
      logger.error({
        message: 'TECHNICAL ANALYSIS (index) could not getTAs',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username);
    }
    res.render("user/journal/ta/index",
      {
        dataList: results,
        options: { year: 'numeric', month: 'long', day: 'numeric' },
        currencies: req.session.assets,
        categories: categories
      }
    )
  })
}

module.exports.indexInfinite = (req, res) => {
  var getTAs = 'SELECT tanalysis.id, created_at, pair, last_update FROM tanalysis JOIN pairs ON tanalysis.pair_id = pairs.id WHERE user_id = ? ORDER BY created_at DESC LIMIT 25 OFFSET ?;';
  if (req.body.query) { getTAs = req.body.query + ' OFFSET ?;'}
  db.query(getTAs, [req.user.id, Number(req.body.offset)], (err, results) => {
    if (err) {
      logger.error({
        message: 'TECHNICAL ANALYSIS (index) INFINITE SCROLL could not getTAs',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username);
    }
    return res.json({
      dataList: results,
      options: { year: 'numeric', month: 'long', day: 'numeric' },
      buttonText: res.__('Go to TA')
    });
  })
}

module.exports.filter = (req, res) => {
  var createFilter = ''
  var editFilter = ''
  if (req.body.create) { createFilter = '&& created_at >= ' + req.body.create + ' >= created_at' }
  if (req.body.edit) { editFilter = '&& last_update >= ' + req.body.edit + ' >= last_update' }
  var getTAs = `SELECT tanalysis.id, created_at, pair, last_update FROM tanalysis JOIN pairs ON tanalysis.pair_id = pairs.id
    WHERE tanalysis.user_id = ? && (${req.body.pairs}) && (${req.body.categories}) ${editFilter} ${createFilter} ORDER BY ${req.body.sort} ${req.body.order} LIMIT 25`;
  db.query(getTAs, req.user.id, (err, results) => {
    if (err) {
      logger.error({
        message: 'TECHNICAL ANALYSIS (index) FILTER could not getTAs',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/ta');
    }
    return res.json({
      dataList: results,
      options: { year: 'numeric', month: 'long', day: 'numeric' },
      buttonText: res.__('Go to TA'),
      query: getTAs
    });
  })
}

module.exports.renderNewForm = (req, res) => {
  if (Object.keys(req.session.assets).length === 0) {
    req.flash('error', res.__('You are not able to access here without any assets. Go to settings to add an asset.'))
    return res.redirect('/' + req.user.username + '/journal/ta');
  }
  // loads the technical analysis elements to an object
  var elements = {
    title: titleTA.html,
    text: textTA.html,
    image: imageTA.html,
    strategy: strategyTA.html(req.session.strategyNames, req.session.strategyIds,
      req.session.timeframes)
  }
  res.render("user/journal/ta/new",
    {
      currencies: req.session.assets,
      elements: elements
    }
  );
}

module.exports.createTechnicalAnalysis = (req, res) => {
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
        logger.error({
          message: 'TECHNICAL ANALYSIS (new) could create newTa',
          endpoint: req.method + ': ' + req.originalUrl,
          programMsg: err
        })
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
                elementInfo.push(Number(req.body.strategy[counterStrategy]));
                elementInfo.push(Number(req.body.timeframe[counterStrategy]));
                counterStrategy += 1;
              } else {
                if (req.body.importance == '') {
                  req.flash('error', res.__('Strategies need a type.'))
                  return res.redirect('/' + req.user.username + '/journal/ta/new');
                }
                elementInfo.push(req.body.importance);
                elementInfo.push(null);
                elementInfo.push(Number(req.body.strategy));
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
            elementInfo.push(Number(req.body.strategy));
            elementInfo.push(Number(req.body.timeframe));
            break;
        }
        data.push(elementInfo);
      }
      if (typeof req.body.type !== 'undefined') {
        // stores the TA elements into the DB
        db.query(addElements, [data], (err, complete) => {
          if (err) {
            logger.error({
              message: 'TECHNICAL ANALYSIS (new) could not addElements',
              endpoint: req.method + ': ' + req.originalUrl,
              programMsg: err
            })
            req.flash('error', res.__('Something went wrong, please try again.'))
            return res.redirect('/' + req.user.username + '/journal/ta');
          }
          return res.redirect("/" + req.user.username + "/journal/ta");
        })
      } else {
        return res.redirect("/" + req.user.username + "/journal/ta");
      }
    })
  }
}

module.exports.showTechnicalAnalysis = (req, res) => {
  var getTa = `SELECT *, ta.id AS id FROM tanalysis ta
    JOIN pairs p on ta.pair_id = p.id WHERE ta.id = ?;`;
  var getElementsTa = `SELECT * FROM telementanalysis ta
    JOIN telements ON ta.element_id = telements.id
    LEFT JOIN strategies s on ta.strategy_id = s.id
    LEFT JOIN timeframes t on ta.timeframe_id = t.id
    WHERE ta.ta_id = ? ORDER BY order_at`;
  db.query(getTa, req.params.id, (err, results) => {
    if (err) {
      logger.error({
        message: 'TECHNICAL ANALYSIS (show) could not getTa',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/ta');
    }
    // creates variable to concatenate the HTML of the technical analysis elements
    var elementsHtml = ``;
    // loads the technical analysis elements
    db.query(getElementsTa, req.params.id, (err, elementsTa) => {
      if (err) {
        logger.error({
          message: 'TECHNICAL ANALYSIS (show) could not getElementsTa',
          endpoint: req.method + ': ' + req.originalUrl,
          programMsg: err
        })
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
            // var currentIndex = userIdStrategies.findIndex(strategy => strategy == element.strategy_id);
            var currentIndex = 0;
            appendHtml = strategyTA.generate(element.content, element.strategy, element.timeframe);
            break;
        }
        elementsHtml += appendHtml;
      })
      res.render("user/journal/ta/show",
        {
          currencies: pairs,
          options: { year: 'numeric', month: 'long', day: 'numeric' },
          taInfo: results[0],
          taContent: elementsHtml
        }
      );
    })
  })
}

module.exports.renderEditForm = (req, res) => {
  var getTa = `SELECT ta.id AS id, pair_id, pair, ta.category, created_at, last_update, DATE_FORMAT(created_at, '%Y-%m-%d') AS format_date FROM tanalysis ta
    JOIN pairs p on ta.pair_id = p.id
    WHERE ta.id = ?;`;
  var getElementsTa = `SELECT * FROM telementanalysis ta
    JOIN telements ON ta.element_id = telements.id
    LEFT JOIN strategies s on ta.strategy_id = s.id
    LEFT JOIN timeframes t on ta.timeframe_id = t.id
    WHERE ta.ta_id = ? ORDER BY order_at`;
  // loads the technical analysis elements to an object
  var elements = {
    title: titleTA.html,
    text: textTA.html,
    image: imageTA.html,
    strategy: strategyTA.html(req.session.strategyNames, req.session.strategyIds,
      req.session.timeframes)
  }
  // object where the technical analysis information will be stored
  var taInfo = { }
  db.query(getTa, req.params.id, (err, results) => {
    if (err) {
      logger.error({
        message: 'TECHNICAL ANALYSIS (edit) could not getTa',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/ta');
    }
    // creates variable to concatenate the HTML of the technical analysis elements
    var elementsHtml = ``;
    // loads the technical analysis elements
    db.query(getElementsTa, req.params.id, (err, elementsTa) => {
      if (err) {
        logger.error({
          message: 'TECHNICAL ANALYSIS (edit) could not getElementsTa',
          endpoint: req.method + ': ' + req.originalUrl,
          programMsg: err
        })
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
            appendHtml = strategyTA.edit(req.session.strategyNames, req.session.strategyIds,
              req.session.timeframes, element.content, element.strategy, element.timeframe,
              element.strategy_id, element.timeframe_id);
            break;
        }
        elementsHtml += appendHtml;
      })
      res.render("user/journal/ta/edit",
        {
          currencies: req.session.assets,
          elements: elements,
          taInfo: results[0],
          taContent: elementsHtml,
          options: { year: 'numeric', month: 'long', day: 'numeric' }
        }
      );
    })
  })
}

module.exports.updateTechnicalAnalysis = (req, res) => {
  var addElements = 'INSERT INTO telementanalysis (ta_id, order_at, element_id, content, file, strategy_id, timeframe_id) VALUES ?'
  // checks if date is valid
  if (req.body.date == "") {
    req.flash("error", res.__("Date cannot be blank."))
    res.redirect("/" + req.user.username + "/journal/ta/" + req.params.id)
  }
  // creates an object with the updated technical analysis variables
  else {
    var replaceChars = { "/":"-" , ",":"" };
    var editTa = {
      pair_id: Number(req.body.pair),
      category: req.body.category,
      created_at: req.body.date,
      last_update: new Date().toISOString().slice(0, 19).replace('T', ' '),
      user_id: req.user.id
    }
    // stores the constants of the technical analysis into the DB
    db.query('UPDATE tanalysis SET ? WHERE id = ?', [editTa, req.params.id], (err, taId) => {
      if (err) {
        logger.error({
          message: 'TECHNICAL ANALYSIS (edit logic) something went wrong',
          endpoint: req.method + ': ' + req.originalUrl,
          programMsg: err
        })
        req.flash('error', res.__('Something went wrong, please try again.'))
        return res.redirect('/' + req.user.username + '/journal/ta');
      }
      var ta_id = req.params.id;
      // deletes the old technical analysis before storing the updated elements
      db.query('DELETE FROM telementanalysis WHERE ta_id = ?', ta_id, (err) => {
        if (err) {
          logger.error({
            message: 'TECHNICAL ANALYSIS (edit) could not delete technical analysis elements',
            endpoint: req.method + ': ' + req.originalUrl,
            programMsg: err
          })
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
                  elementInfo.push(Number(req.body.strategy[counterStrategy]));
                  elementInfo.push(Number(req.body.timeframe[counterStrategy]));
                  counterStrategy += 1;
                } else {
                  if (req.body.importance == '') {
                    req.flash('error', res.__('Strategies need a type.'))
                    return res.redirect('/' + req.user.username + '/journal/ta/' + req.params.id + '/edit');
                  }
                  elementInfo.push(req.body.importance);
                  elementInfo.push(null);
                  elementInfo.push(Number(req.body.strategy));
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
              elementInfo.push(Number(req.body.strategy));
              elementInfo.push(Number(req.body.timeframe));
              break;
          }
          data.push(elementInfo);
        }
        if (typeof req.body.type !== 'undefined') {
          // stores the TA elements into the DB
          db.query(addElements, [data], (err, complete) => {
            if (err) {
              logger.error({
                message: 'TECHNICAL ANALYSIS (edit) could not addElements',
                endpoint: req.method + ': ' + req.originalUrl,
                programMsg: err
              })
              req.flash('error', res.__('Something went wrong, please try again.'))
              return res.redirect('/' + req.user.username + '/journal/ta');
            }
            return res.redirect("/" + req.user.username + "/journal/ta");
          })
        } else {
          return res.redirect("/" + req.user.username + "/journal/ta");
        }
      })
    })
  }
}

module.exports.deleteTechnicalAnalysis = (req, res) => {
  var deleteElementsTa = 'DELETE FROM telementanalysis WHERE ta_id = ?'
  var deleteTa = 'DELETE FROM tanalysis WHERE id = ?'
  // deletes the technical analysis elements from the DB
  db.query(deleteElementsTa, req.params.id, (err) => {
    if (err) {
      logger.error({
        message: 'TECHNICAL ANALYSIS (delete) could not deleteElementsTa',
        endpoint: req.method + ': ' + req.originalUrl,
        programMsg: err
      })
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/journal/ta');
    }
    // deletes the technical analysis from the DB
    db.query(deleteTa, req.params.id, (err) => {
      if (err) {
        logger.error({
          message: 'TECHNICAL ANALYSIS (delete) could not deleteTa',
          endpoint: req.method + ': ' + req.originalUrl,
          programMsg: err
        })
        req.flash('error', res.__('Something went wrong, please try again.'))
        return res.redirect('/' + req.user.username + '/journal/ta');
      }
      res.redirect("/" + req.user.username + "/journal/ta");
    })
  })
}
