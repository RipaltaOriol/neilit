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

// INDEX ENTRIES ROUTE
router.get("/", isLoggedIn, (req, res) => {
  // FIXME: missing strategy
  var entriesInfo = {
    titleEntry: [],
    idEntry: [],
    resultEntry: [],
    strategyEntry: []
  }
  // FIXME: the entries are not displayed in chronoligac descending order
  var entriesQuery = 'SELECT entries.id AS identifier, result, DATE_FORMAT(entry_dt, "%d de %M %Y") AS entry_dt, pair, strategy FROM entries JOIN pairs ON entries.pair_id = pairs.id JOIN strategies ON entries.strategy_id = strategies.id;'
  connection.query(entriesQuery, (err, getEntries) => {
    if (err) throw err;
    getEntries.forEach((result) => {
      entriesInfo.titleEntry.push(result.pair + ", " + result.entry_dt);
      entriesInfo.idEntry.push(result.identifier);
      entriesInfo.resultEntry.push(result.result);
      entriesInfo.strategyEntry.push(result.strategy);
    })
    res.render("user/entries/entry", {user:userUsername, entries:entriesInfo});
  })
})

// NEW ENTRY ROUTE
router.get("/new", isLoggedIn, (req, res) => {
  var getTasQuery = 'SELECT tanalysis.id, pair, DATE_FORMAT(created_at, "%d de %M %Y") AS date FROM tanalysis JOIN pairs ON tanalysis.pair_id = pairs.id;'
  var storeTas = {
    ta_id: [],
    ta_title: [],
  }
  connection.query(getTasQuery, (err, results) => {
    if (err) throw err;
    results.forEach((result) => {
      storeTas.ta_id.push(result.id);
      storeTas.ta_title.push(result.pair + ', ' + result.date)
    })
    res.render("user/journal/entry/new", {user:userUsername, categories:userCategories, currencies:userPairs, strategies:userStrategies, tanalysis:storeTas});
  })
})

// NEW ENTRY LOGIC
router.post("/", isLoggedIn, (req, res) => {
  console.log(req.body);
  // get the strategy id
  // FIXME: find a more efficient way so that queries are not required
  connection.query('SELECT id FROM strategies WHERE strategy = ?', req.body.strategy, (err, results) => {
    if (err) throw err;
    // create entry elements
    var entrybody = {
      pair_id: req.body.pair,
      category: req.body.category,
      size: req.body.size,
      strategy_id: results[0].id,
      entry_dt: req.body.entryDate + " " + req.body.time,
      direction: req.body.entryDirection,
      entry_price: req.body.entryPrice,
      stop_loss: req.body.stopLoss,
      take_profit: req.body.takeProfit,
      comment: req.body.comment
    }
    // checks whether the entry is open or closed
    if (req.body.status == '0') {
      // entry is open
    } else if (req.body.status == '1') {
      // entry is close
      entrybody.exit_dt = req.body.exitDate + " 00:00:00"
      entrybody.exit_price = req.body.closePrice;
      entrybody.status = 1;
      entrybody.result = req.body.result;
    }
    // checks whether the entry has a TA
    if (req.body.entryTA == 'existing') {
      entrybody.ta_id = req.body.taId;
    }
    console.log(entrybody);

    // saves the entry to the DB
    connection.query('INSERT INTO entries SET ?', entrybody, (err, response) => {
      if (err) throw err;
      console.log(response.insertId);
      res.redirect("/username/journal");
    })
  })
})

// SHOW ENTRY ROUTE
router.get("/:id", isLoggedIn, (req, res) => {
  // gets the ID of the entry to display
  var entry2Dispaly = req.params.id
  // makes the query that will return all the info we need from the DB
  // FIXME: this query is extremely large (better to have consequent small queries or one very large?).
  var entryQuery = 'SELECT *, DATE_FORMAT(entry_dt, "%d de %M %Y") AS title FROM entries JOIN pairs ON entries.pair_id = pairs.id JOIN strategies ON entries.strategy_id = strategies.id  WHERE entries.id = ?'
  connection.query(entryQuery, entry2Dispaly, (err, getEntry) => {
    if (err) throw err;
    // builds and object will all the info from the entry we need to display
    var actualEntry = {
      entryId: req.params.id,
      entryTitle: getEntry[0].title,
      entryPair: getEntry[0].pair,
      entryCategory: getEntry[0].category,
      entrySize: getEntry[0].size,
      entryStrategy: getEntry[0].strategy,
      entryDate: getEntry[0].entry_dt,
      exitDate: getEntry[0].exit_dt,
      entryDirection: getEntry[0].direction,
      entryPrice: getEntry[0].entry_price,
      stopLoss: getEntry[0].stop_loss,
      takeProfit: getEntry[0].take_profit,
      exitPrice: getEntry[0].exit_price,
      entryComment: getEntry[0].comment,
      entryResult: getEntry[0].result,
      taId: getEntry[0].ta_id
    }
    console.log(getEntry[0]);
    // Checks whether the entry has a TA that needs to be loaded
    if (actualEntry.taId != null) {
      // FIXME: this part of the code should be outsourced into another function
      var taQuery = 'SELECT DATE_FORMAT(created_at, "%d de %M %Y") AS created_at FROM tanalysis WHERE id = ?;'
      var elementsTaQuery = 'SELECT * FROM telementanalysis JOIN telements ON telementanalysis.element_id = telements.id WHERE telementanalysis.ta_id = 2 ORDER BY order_at DESC;'
      connection.query(taQuery, actualEntry.taId, (err, getTa) => {
        if (err) throw err;
        connection.query(elementsTaQuery, actualEntry.taId, (err, getElements) => {
          if (err) throw err;
          var hehe = ' hello '
          var actualEntryTa = {
            taDate: getTa[0].created_at,
            taTest: `<h4>Hello` + hehe + `World</h4>`,
            taElements: []
          }
          // Renders the elements of the TA according to their type
          getElements.forEach((result) => {
            //console.log(result.type);
            // Create a title element
            if (result.type == 'title') {
              actualEntryTa.taElements.push(`<input type="text" class="block-title" value="` + result.content + `" disabled="disabled">`);
            // Create a image element
            } else if (result.type == 'image') {
              actualEntryTa.taElements.push(`<img src="` + result.content + `" class="block-image my-2">`)
            // Create a description element
            } else if (result.type == 'text') {
              actualEntryTa.taElements.push(`<div class="block-text mr-2 contenteditable" contenteditable="false">` + result.content + `<span style="font-size: 1rem;">&nbsp;</span></div>`);
            // Create a strategy element
            } else if (result.type == 'strategy') {
              // Breakdown the content
              var strategyVanilla = result.content;
              // FIXME: This function is repeated in the code. Attempt to extract it into a function
              var extractStrategy;
              var extractImportance;
              var extractTimeframe;
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
                extractStrategy = strategyVanilla.substring(0, pointer1);
                extractImportance = strategyVanilla.substring(pointer1 + 1, pointer2);
                extractTimeframe = strategyVanilla.substring(pointer2 + 1, strategyVanilla.length);
              }
              truncateStrategy(strategyVanilla);

              // PROBLEM
              // Doesn't Account for the number of Strategy
              // FIXME: PUT A COUNTER TO THE NUMBER OF STRATEGY ELEMENTS
              // This problem is only for SHOW ROUTES

              // Generate the Checkbox for Strategy
              var htmlStrategy = ``;
              // Starting block
              htmlStrategy += `<div class="form-check block-strategy mr-3">`
              userStrategies.forEach((strategy, i) => {
                //console.log(result.content);
                //console.log(strategy);
                if (strategy == extractStrategy) {
                  htmlStrategy += `
                  <div>
                    <input type="checkbox" class="form-check-input" name="strategy" value="` + strategy + `" id="strategy-` + i + `-1" disabled="disabled" checked>
                    <label class="form-check-label" for="strategy-0-1">` + strategy + `</label>
                  </div>`
                } else {
                  htmlStrategy += `
                  <div>
                    <input type="checkbox" class="form-check-input" name="strategy" value="` + strategy + `" id="strategy-` + i + `-1" disabled="disabled">
                    <label class="form-check-label" for="strategy-0-1">` + strategy + `</label>
                  </div>`
                }
              });
              htmlStrategy += `</div>`
              //console.log(htmlStrategy);

              // Generates the Checkbox for Importance
              var htmlImportance = ``;
              if (extractImportance == 'trigger') {
                htmlImportance += `
                  <div class="mr-3">
                    <h6>Tipo de Patron</h6>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="strategy_I_1" id="strategy-trigger-1" value="trigger" disabled="disabled" checked="checked">
                      <label class="form-check-label" for="strategy-trigger-1">Patrones desencadenantes</label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="strategy_I_1" id="strategy-general-1" value="general" disabled="disabled">
                      <label class="form-check-label" for="strategy-general-1">Patrones generales</label>
                    </div>
                  </div>`
                } else {
                  htmlImportance += `
                    <div class="mr-3">
                      <h6>Tipo de Patron</h6>
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="strategy_I_1" id="strategy-trigger-1" value="trigger" disabled="disabled">
                        <label class="form-check-label" for="strategy-trigger-1">Patrones desencadenantes</label>
                      </div>
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="strategy_I_1" id="strategy-general-1" value="general" disabled="disabled" checked="checked">
                        <label class="form-check-label" for="strategy-general-1">Patrones generales</label>
                      </div>
                    </div>`
                }

                // Generates the Checkbox for Importance
                // NOTE: not accounting for index (THE SHOW ROUTE doens't have to be available for editing)
                var htmlTimeframe = ``;
                // Starting block
                htmlTimeframe += `
                  <div class="timeframe-strategy mr-3">
                    <h6>Strategy Timeframe</h6>`

                userTimeframes.forEach((timeframe) => {
                  //console.log(timeframe);
                  if (timeframe == extractTimeframe) {
                    htmlTimeframe += `
                    <div>
                      <input type="radio" class="form-check-input" name="strategy_timeframes_1" value="` + timeframe + `" id="strategy-timeframe-10-1" disabled="disabled" checked="checked">
                      <label class="form-check-label" for="strategy-timeframe-10-1">` + timeframe + `</label>
                    </div>`
                  } else {
                    htmlTimeframe += `
                    <div>
                      <input type="radio" class="form-check-input" name="strategy_timeframes_1" value="` + timeframe + `" id="strategy-timeframe-10-1" disabled="disabled">
                      <label class="form-check-label" for="strategy-timeframe-10-1">` + timeframe + `</label>
                    </div>`
                  }
                });
                htmlTimeframe += `</div>`

                //console.log(extractTimeframe);
                //console.log(`<div class="d-flex flex-wrap py-2">` + htmlStrategy + htmlImportance + htmlTimeframe + `</div>`);


              actualEntryTa.taElements.push(
                `<div class="d-flex flex-wrap py-2">` + htmlStrategy + htmlImportance + htmlTimeframe + `</div>`
              );
            }
          })
          res.render("user/entries/showEntryTemplate", {user:userUsername, entry:actualEntry, ta:actualEntryTa});
          });
        })
    // The entry has not TA to be loaded
    } else {
      res.render("user/entries/showEntryTemplate", {user:userUsername, entry:actualEntry});
    }
  })
})

// UPDATE ENTRY ROUTE
// FIXME: Incomplete Route
router.get("/:id/edit", isLoggedIn, (req, res) => {
  // gets the ID of the entry to display
  var entry2Dispaly = req.params.id
  // makes the query that will return all the info we need from the DB
  // FIXME: this query is extremely large (better to have consequent small queries or one very large?).
  var entryQuery = 'SELECT *, DATE_FORMAT(entry_dt, "%d de %M %Y") AS title, DATE_FORMAT(entry_dt, "%Y-%m-%d") AS date, DATE_FORMAT(entry_dt, "%H:%i") AS hour, DATE_FORMAT(exit_dt, "%Y-%m-%d") AS close FROM entries JOIN pairs ON entries.pair_id = pairs.id JOIN strategies ON entries.strategy_id = strategies.id  WHERE entries.id = ?'
  connection.query(entryQuery, entry2Dispaly, (err, getEntry) => {
    if (err) throw err;
    // builds and object will all the info from the entry we need to display
    var actualEntry = {
      entryId: req.params.id,
      // FIXME: serious error here
      entryTitle: getEntry[0].title,
      entryPair: getEntry[0].pair,
      entryCategory: getEntry[0].category,
      entrySize: getEntry[0].size,
      entryStrategy: getEntry[0].strategy,
      entryDate: getEntry[0].date,
      entryHour: getEntry[0].hour,
      exitDate: getEntry[0].close,
      entryDirection: getEntry[0].direction,
      entryPrice: getEntry[0].entry_price,
      stopLoss: getEntry[0].stop_loss,
      takeProfit: getEntry[0].take_profit,
      exitPrice: getEntry[0].exit_price,
      entryTa: getEntry[0].ta_id,
      entryComment: getEntry[0].comment,
      entryResult: getEntry[0].result,
    }
    res.render("user/entries/editEntryTemplate", {user:userUsername, categories:userCategories, currencies:userPairs, strategies:userStrategies, entry:actualEntry});
  })
})

// UPDATE ENTRY LOGIC
router.put("/:id", isLoggedIn, (req, res) => {
  console.log(req.body);
  // get the strategy id
  // FIXME: find a more efficient way so that queries are not required
  connection.query('SELECT id FROM strategies WHERE strategy = ?', req.body.strategy, (err, results) => {
    if (err) throw err;
    // create entry elements
    var entrybody = {
      pair_id: req.body.pair,
      category: req.body.category,
      size: req.body.size,
      strategy_id: results[0].id,
      entry_dt: req.body.entryDate + " " + req.body.time,
      direction: req.body.entryDirection,
      entry_price: req.body.entryPrice,
      stop_loss: req.body.stopLoss,
      take_profit: req.body.takeProfit,
      comment: req.body.comment
    }
    // check whether is open or closed
    if (req.body.status == '0') {
      // entry is open
    } else if (req.body.status == '1') {
      // entry is close
      entrybody.exit_dt = req.body.exitDate + " 00:00:00"
      entrybody.exit_price = req.body.closePrice;
      entrybody.status = 1;
      entrybody.result = req.body.result;
    }
    console.log(entrybody);
    // saves the entry to the DB
    connection.query('UPDATE entries SET ? WHERE id = ?', [entrybody, req.params.id], (err, updated) => {
      if (err) throw err;
      console.log('changed ' + updated.changedRows + ' rows');
      res.redirect("/username/journal");
    })
  })
})

// DELETE ENTRY ROUTE
router.delete("/:id", isLoggedIn, (req, res) => {
  var entry2Delete = req.params.id
  var deleteQuery = 'DELETE FROM entries WHERE id = ?'
  // Query to delte the entry
  connection.query(deleteQuery, entry2Delete, (err) => {
    if (err) throw err;
    res.redirect("/username/journal");
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
