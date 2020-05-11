let express         = require('express'),
    app             = express(),
    methodOverride  = require('method-override'),
    bodyParser      = require('body-parser'),
    flash           = require('connect-flash'),
    passport        = require('passport'),
    passportConfig  = require('./models/passportConfig')
    expressSession  = require('express-session'),
    mysql           = require('mysql');



// Configuration
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
// app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + "/public"))
app.use(flash());
// Configuration for AUTHENTICATION
app.use(expressSession({
  secret: 'neilit is the key to trading success',
  resave: false,
  saveUninitialized: false,
  cookie: {
     secure: false,
     maxAge: 3600000 //1 hour
 }
}))
app.use(passport.initialize());
app.use(passport.session());
passportConfig(passport);

// Connect to DB
var connection = mysql.createConnection({
  host    : 'localhost',
  user    : 'root',
  password: 'ripaltus',
  database: 'neilit_db',
  multipleStatements: true
});

// Set DB language to Spanish
// FIXME: how can you change DB on region/language
var sqlToES = 'SET lc_time_names = "es_ES"';
connection.query(sqlToES, function(err) {
  if (err) throw err;
})

// Global Program Variable
// FIXME: set the rest of the varibles. Some are defined after LOGIN as assynchronously
// FIXME: can modules be grouped?
// FIXME: categories should be maped to pairs, but it cannot be pased to front-end JS
var pairs = require("./models/pairs.js");
var timeframes = require("./models/timeframes.js");
let categories = require("./models/categoriesPairs.js")
// FIXME: this function shoul load assynchronously. Takes a user ID.
var userStrategies = null


function getUserStrategies(id) {
  connection.query("SELECT strategy FROM strategies WHERE user_id = ?", id, (err, results) => {
    if (err) throw err;
    getStrategies = []
    results.forEach((strategy) => {
      getStrategies.push(strategy.strategy)
    });
    userStrategies = getStrategies;
  });
}
// #### MIDDLEWARES ####
// MIDDLEWARE to have USER INFORMATION on all routes
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
})

// #### ROUTES ####
// HOME ROUTE
app.get("/", (req, res) => {
  res.render("home");
});

// LOGIN ROUTE
app.get("/login", (req, res) => {
  // checks whether user data exists for direct login
  if (!req.user) {
    res.render("login");
  } else {
    if (req.isAuthenticated()) {
      res.redirect("/" + req.user.username)
    }
  }
});

// LOGIN LOGIC
app.post("/login", passport.authenticate('local-login'), (req, res) => {
  // FIXME: doesn't handle error login (default error)
  res.redirect("/" + req.user.username)
  console.log(req.user);
})

// SIGNUP ROUTE
app.get("/signup", (req, res) => {
  console.log(timeframes);
  res.render("signup");
});

// SIGNUP LOGIC
app.post("/signup", passport.authenticate('local-signup'), (req, res) => {
  res.redirect("/" + req.user);
})

// LOGOUT ROUTE
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/")
})

// NEILIT USER ROUTE
app.get("/:profile", isLoggedIn, (req, res) => {
  // FIXME: make this await function + only perform is userStrategies is null
  getUserStrategies(req.user.id);
  res.render("user/user");
})

// RISK CALCULATOR ROUTE
app.get("/:profile/calculator", isLoggedIn, (req, res) => {
  res.render("user/calculator");
})

// JOURNAL ROUTE
app.get("/:profile/journal", isLoggedIn, (req,res) => {
  var selectTAs = 'SELECT tanalysis.id AS identifier, pair, DATE_FORMAT(tanalysis.created_at, "%d de %M %Y") AS created_at FROM tanalysis JOIN pairs ON tanalysis.pair_id = pairs.id WHERE user_id = ? ORDER BY tanalysis.created_at DESC LIMIT 7';
  var selectEntrys = 'SELECT entries.id AS identifier, DATE_FORMAT(entry_dt, "%d de %M %Y") AS entry_dt, pair FROM entries JOIN pairs ON entries.pair_id = pairs.id WHERE user_id = ? ORDER BY entry_dt DESC LIMIT 7';
  var selectComments = 'SELECT id, DATE_FORMAT(created_at, "%d de %M %Y") AS title, comment FROM comments WHERE user_id = ? ORDER BY created_at DESC LIMIT 7';
  // Defines the max. # of characters allowed when displaying comments
  var commentsLength = 75
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
          // trim the comment is its too large
          if (result.comment.length > commentsLength) {
            var trimmedComment = result.comment.substring(0, (commentsLength - 4)) + "...";
            // console.log('This is the trimmed comment');
            // console.log(trimmedComment);
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

// LIST ALL COMMENTS
// FIXME: How to optmize when loading a large sample (LOAD AS YOU GO)
app.get("/:profile/journal/comment", isLoggedIn, (req, res) => {
  var getAllComments = 'SELECT DATE_FORMAT(created_at, "%d/%m/%y %H:%i") AS created_at, comment FROM comments WHERE user_id = ?';
  var getAllEntries = 'SELECT DATE_FORMAT(entry_dt, "%d/%m/%y %H:%i") AS entry_dt, pair FROM entries JOIN pairs ON entries.pair_id = pairs.id WHERE user_id = ?';
  var listComments = {
    date: [],
    content: []
  }
  listEntries = {
    date: [],
    content: []
  }
  connection.query(getAllComments, req.user.id, (err, results) => {
    if (err) throw err;
    results.forEach((result) => {
      listComments.date.push(result.created_at);
      listComments.content.push(result.comment);
    });
    connection.query(getAllEntries, req.user.id, (err, results) => {
      if (err) throw err;
      results.forEach((result) => {
        listEntries.date.push(result.entry_dt);
        listEntries.content.push(result.pair);
      });
      res.render("user/journal/comment/index", {historyComment: listComments, historyEntry: listEntries})
    })
  })
})

// NEW COMMNET ROUTE
app.get("/:profile/journal/comment/new", isLoggedIn, (req, res) => {
  res.render("user/journal/comment/new")
})

// POST NEW COMMENT ROUTE
app.post("/:profile/journal/comment", isLoggedIn, (req, res) => {
  var commentQuery = 'INSERT INTO comments SET ?';
  // create object w/ comment info
  var newcomment = {
    user_id: req.user.id,
    comment: req.body.comment
  }
  //console.log(req.body);
  // save comment to the DB
  connection.query(commentQuery, newcomment, (err, results) => {
    if (err) throw err;
    //console.log(results.insertId);
    res.redirect('/' + req.user.username + '/journal');

  });
})

// SHOW COMMENT ROUTE
app.get("/:user/journal/comment/:id",isLoggedIn, (req, res) => {
  // NOTE: does the SELECT comment has to watch the user_id from session too? (probably for security)
  var getComment = 'SELECT id, DATE_FORMAT(created_at, "%d de %M %Y") AS created_at, comment FROM comments WHERE id = ?';
  connection.query(getComment, req.params.id, (err, results) => {
    if (err) throw err;
    var commentInfo = {
      id: results[0].id,
      date: results[0].created_at,
      comment: results[0].comment
    }
    res.render("user/journal/comment/show", {comment:commentInfo});
  })
})

// EDIT COMMENT ROUTE
app.get("/username/journal/comment/:id/edit", (req, res) => {
  // NOTE: does the SELECT comment has to watch the user_id from session too? (probably for security)
  var getComment = 'SELECT id, DATE_FORMAT(created_at, "%d de %M %Y") AS created_at, comment FROM comments WHERE id = ?';
  connection.query(getComment, req.params.id, (err, results) => {
    if (err) throw err;
    var commentInfo = {
      id: results[0].id,
      date: results[0].created_at,
      comment: results[0].comment
    }
    res.render("user/journal/comment/edit", {comment:commentInfo});
  })
})

// UPDATE COMMENT ROUTE
app.put("/username/journal/comment/:id", (req, res) => {
  var commentbody = {
    created_at: new Date(),
    comment: req.body.comment
  }
  connection.query('UPDATE comments SET ? WHERE id = ?', [commentbody, req.params.id], (err, updated) => {
    if (err) throw err;
    console.log('changed ' + updated.changedRows + ' rows');
    res.redirect("/username/journal");
  })
})

// DELETE COMMENT ROUTE
app.delete("/username/journal/comment/:id", (req, res) => {
  var comment2Delete = req.params.id
  var deleteQuery = 'DELETE FROM comments WHERE id = ?'
  // Query to delte the entry
  connection.query(deleteQuery, comment2Delete, (err) => {
    if (err) throw err;
    res.redirect("/username/journal");
  })
})

// ALL ENTRIES ROUTE
app.get("/username/journal/entry", (req, res) => {
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
app.get("/username/journal/entry/new", function(req, res) {
  var getTasQuery = 'select tanalysis.id, pair, DATE_FORMAT(created_at, "%d de %M %Y") as date from tanalysis JOIN pairs on tanalysis.pair_id = pairs.id;'
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
    console.log(storeTas);
    res.render("user/entries/entry-new", {user:userUsername, categories:userCategories, currencies:userPairs, strategies:userStrategies, tanalysis:storeTas});
  })
})

// POST NEW ENTRY ROUTE
app.post("/username/journal/entry", function(req, res) {
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
app.get("/username/journal/entry/:id", (req, res) => {
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

// EDIT ENTRY ROUTE
// FIXME: Incomplete Route
app.get("/username/journal/entry/:id/edit", function(req, res) {
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

// UPDATE ENTRY ROUTE (edit - put)
app.put("/username/journal/entry/:id", (req, res) => {
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
app.delete("/username/journal/ta/:id", (req, res) => {
  var entry2Delete = req.params.id
  var deleteQuery = 'DELETE FROM entries WHERE id = ?'
  // Query to delte the entry
  connection.query(deleteQuery, entry2Delete, (err) => {
    if (err) throw err;
    res.redirect("/username/journal");
  })
})

// NEW TA ROUTE
app.get("/username/journal/ta/new", function(req, res) {
  res.render("user/entries/ta-new", {user:userUsername, currencies:userPairs, categories:userCategories, strategies:userStrategies, timeframes:userTimeframes});
})

// POST NEW TA ROUTE
app.post("/username/journal/ta", function(req, res) {
  console.log('This is the pair: ' + req.body.pair);
  console.log('And this is the date: ' + req.body.date);
  // check that the inputs provided are valid/correct
  if (req.body.pair == "" || req.body.date == "") {
    req.flash("error", "Pair or Date are missing.")
    req.redirect("/username/journal/ta")
  } else {
    // FIXME: Get this variables from the user's session
    var technicala = {
      category: req.body.category,
      pair_id: req.body.pair,
      created_at: req.body.date,
      user_id: 1
    }
    // MAP T-ELEMENT-ANALYSIS
    // Initiate element counters
    var counterTitle = 0;
    var counterImg = 0;
    var counterText = 0;
    var counterStrategy = 0
    // Variables for Technical Elements Analysis
    var ta_id;

    var qNewPair = 'SELECT id FROM pairs WHERE pair = ?'
    connection.query(qNewPair, technicala.pair_id, (err, results) => {
      if (err) throw err;
      technicala.pair_id = results[0].id;
      // IMPORTANT - POINT BREAKER
      // FIXME: If there are not elements in the TA we can Exit
      console.log(technicala);
      // Query insert Technical Analysis
      connection.query('INSERT INTO tanalysis SET ?', technicala, (err, checkFirst) => {
        if (err) throw err;
        var ta_id = checkFirst.insertId;
        console.log(ta_id);
        connection.query('SELECT * FROM telements', (err, printElements) => {
          if (err) throw err;
          console.log(printElements);
          let etypes = new Map();
          for (var i = 0; i < printElements.length; i++) {
            etypes.set(printElements[i].type, printElements[i].id)
          }
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
            // Counter for the Importance and Timeframe of the Strategy
            var stretegyTypesCount = 1;

            for (var els = 0; els < multipleVals.length; els++) {
              elsPosition = els + 1;
              var contentVal;
              // FIXME: It is possible to improve code
              if (multipleVals[els] == "title") {
                contentVal = req.body.title[titleCount];
                titleCount += 1;
              }
              if (multipleVals[els] == "image") {
                contentVal = req.body.image[imageCount];
                imageCount += 1;
              }
              if (multipleVals[els] == "text") {
                contentVal = req.body.text[textCount];
                textCount += 1;
              }
              if (multipleVals[els] == "strategy") {
                var importance = "strategy_I_" + stretegyTypesCount;
                var timeframe = "strategy_timeframes_" + stretegyTypesCount;
                contentVal = req.body.strategy[strategyCount] + "$" + req.body[importance] + "$" + req.body[timeframe];
                strategyCount += 1;
                stretegyTypesCount += 1;
              }
              data.push([ta_id, elsPosition, etypes.get(multipleVals[els]), contentVal])
            }

          // Case 2: Single Element TA
          } else {
            var singleVals = req.body.type
            if (singleVals == "strategy") {
              req.body.strategy = singleVals + "$" + req.body.strategy_I_1 + "$" + req.body.strategy_timeframes_1
            }
            data.push([ta_id, 1, etypes.get(singleVals), req.body[singleVals]]);
          }
          console.log(data);
          connection.query('INSERT INTO telementanalysis (ta_id, order_at, element_id, content) VALUES ?', [data], (err, finalized) => {
            if (err) throw err;
            console.log(technicala);
            console.log(req.body.strategy);
            res.redirect("/username/journal");
          })
        })
      })
    })
  }
})


// SHOW TA ROUTE
app.get("/username/journal/ta/:id", (req, res) => {
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

// EDIT TA ROUTE
app.get("/username/journal/ta/:id/edit", (req, res) => {
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

// EDIT PUT TA ROUTE
app.put("/username/journal/ta/:id", (req, res) => {
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

// DELETE TA ROUTE
app.delete("/username/journal/ta/:id", (req, res) => {
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

// SETTINGS ROUTE
app.get("/username/settings", function(req, res){
  res.render("user/settings", {user:userUsername});
})


function isLoggedIn(req, res, next) {
  if(req.isAuthenticated() ) {
    if (req.user.username === req.params.profile) {
      return next();
    } else {
      // FIXME: so it doesn't freeze and return to previous ROUTE
      return false;
    }
  }
    res.redirect("/login");
}

// PORT LISTENING
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Server Has Started!');
})
