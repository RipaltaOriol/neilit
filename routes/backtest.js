let express = require('express');
const util = require('util');
let router = express.Router({mergeParams: true});
let pairs = require('../models/pairs');
let timeframes = require('../models/timeframes');
let middleware = require('../middleware')
let connection = require('../models/connectDB');
// node native promisify
const query = util.promisify(connection.query).bind(connection);

// Backtest Addon Options
var addonBacktest = require('../models/elements/backtest');

// INDEX BACKTEST ROUTE
router.get("/", middleware.isLoggedIn, (req, res) => {
  var getAllBacktest = 'SELECT *, DATE_FORMAT(created_at, "%d/%m/%y") AS date FROM backtest WHERE user_id = ? ORDER BY created_at;';
  var dataList = []
  // retrieves all backtest
  connection.query(getAllBacktest, req.user.id, (err, results) => {
    if (err) {
      req.flash('error', 'Something went wrong, please try again.')
      return res.redirect('/' + req.user.username);
    }
    results.forEach(async (result) => {
      dataList.push({
        id: result.id,
        date: result.date,
        result: result.result,
        aPair: pairs[result.pair_id - 1],
        aStrategy: userStrategies[userIdStrategies.findIndex(strategy => strategy == result.strategy_id)],
        aTimeframe: timeframes[result.timeframe_id - 1]
      })
    });
    res.render("user/journal/backtest/index", {dataList: dataList});
  })
})

// NEW BACKTEST ROUTE
router.get("/new", middleware.isLoggedIn, (req, res) => {
  // loads the backtest addons to an object
  var addons = {
    list: addonBacktest.htmlList,
    newOption: addonBacktest.optionList
  }
  res.render("user/journal/backtest/new",
    {
      currencies:pairs,
      strategies:userStrategies,
      timeframes:timeframes,
      addons:addons
    }
  );
})

// NEW BACKTEST LOGIC
router.post("/", middleware.isLoggedIn, (req, res) => {
  if (!(req.body.outcome)) {
    req.flash('error', 'The results\' type has to be defined.')
    res.redirect('/' + req.user.username + '/journal/backtest/new');
  } else {
    // creates an object with the new backtest main variables
    var newBacktest = {
      user_id: req.user.id,
      result: req.body.outcome
    }
    // sets the backtest pair (if constant)
    if (req.body.pairs == 0) {
      newBacktest.pair_id = null;
    } else {
      newBacktest.pair_id = req.body.selectPair
    }
    // sets the backtest direction (if constant)
    if (req.body.direction == 0) {
      newBacktest.direction = null;
    } else if (req.body.direction == 1) {
      newBacktest.direction = 'long';
    } else {
      newBacktest.direction = 'short';
    }
    // sets the backtest strategy (if constant)
    if (req.body.strategy == 0) {
      newBacktest.strategy_id = null;
    } else {
      newBacktest.strategy_id = userIdStrategies[Number(req.body.selectStrategy) - 1]
    }
    // sets the backtest timeframe (if constant)
    if (req.body.timeframe == 0) {
      newBacktest.timeframe_id = null;
    } else {
      newBacktest.timeframe_id = req.body.selectTimeframe
    }
    // stores the principal backtest parametes into the DB
    connection.query('INSERT INTO backtest SET ?', newBacktest, (err, backtestId) => {
      if (err) {
        // COMBAK: log error
        req.flash('error', 'Something went wrong, please try again.')
        return res.redirect('/' + req.user.username + '/journal/backtest/new');
      }
      var backtest_id = backtestId.insertId;
      if ('varName' in req.body) {
        var addAddons = 'INSERT INTO backtest_addons (backtest_id, description, is_integers, option1, option2, option3, option4, option5, option6) VALUES ?'
        // creates an object with the new backtest addons variables
        var newAddons = []
        var counterAddon = 0;
        // multiple addons
        if (Array.isArray(req.body.varName)) {
          for (var i = 0; i < req.body.varName.length; i++) {
            if (req.body.varName[i] == '') {
              req.flash('error', 'The addons\' title cannot be blank.')
              return res.redirect('/' + req.user.username + '/journal/backtest/new');
            }
            var addon = [backtest_id, req.body.varName[i], req.body.intList[i]]
            // configures an integers value addon
            if (req.body.intList[i] == 1) {
              addon.push(null, null, null, null, null, null)
            }
            // configures an options value addons
            else {
              if (req.body.varOption[counterAddon] == '') {
                req.flash('error', 'The addons\' options are required.')
                return res.redirect('/' + req.user.username + '/journal/backtest/new');
              }
              for (var y = counterAddon; y < Number(counterAddon) + Number(req.body.arrOption[i]); y++) {
                addon.push(req.body.varOption[y])
              }
              if (req.body.arrOption[i] < 6) {
                for (var r = 0; r < 6 - req.body.arrOption[i]; r++) {
                  addon.push(null)
                }
              }
            }
            counterAddon += Number(req.body.arrOption[i])
            newAddons.push(addon);
          }
        }
        // single addon
        else {
          if (req.body.varName == '') {
            req.flash('error', 'The addon\'s title cannot be blank.')
            return res.redirect('/' + req.user.username + '/journal/backtest/new');
          }
          var addon = [backtest_id, req.body.varName, req.body.intList]
          // configures an integers value addon
          if (req.body.intList == 1) {
            addon.push(null, null, null, null, null, null)
          }
          // configures an options value addons
          else {
            if (req.body.varOption[0] == '') {
              req.flash('error', 'The addon\'s options are required.')
              return res.redirect('/' + req.user.username + '/journal/backtest/new');
            }
            for (var y = 0; y < req.body.arrOption; y++) {
              if (!req.body.varOption[y] == '') {
                addon.push(req.body.varOption[y])
              } else {
                addon.push(null)
              }
            }
            if (req.body.arrOption < 6) {
              for (var r = 0; r < 6 - req.body.arrOption; r++) {
                addon.push(null)
              }
            }
          }
          newAddons.push(addon);
        }
        // stores the backtest addons into the DB
        connection.query(addAddons, [newAddons], (err, complete) => {
          if (err) {
            // COMBAK: log error
            req.flash('error', 'Something went wrong, please try again.')
            return res.redirect('/' + req.user.username + '/journal/backtest');
          }
          res.redirect("/" + req.user.username + "/journal/backtest/" + backtest_id + "/edit");
        })
      } else {
        res.redirect("/" + req.user.username + "/journal/backtest/" + backtest_id + "/edit");
      }
    })
  }
})

// SHOW BACKTEST ROUTE
router.get("/:id", middleware.isLoggedIn, (req, res) => {
  // inserts DB queries to a variable
  var getBacktest = 'SELECT *, DATE_FORMAT(created_at, "%d ' + res.__('of') + ' %M %Y") AS created_at FROM backtest WHERE id = ? AND user_id = ?;'
  var getAddons = 'SELECT description FROM backtest_addons WHERE backtest_id = ? ORDER BY id;'
  var getData = 'SELECT direction, result, pair_id, strategy_id, timeframe_id FROM backtest_data WHERE backtest_id = ?;'
  var getAddonsData = 'SELECT * FROM backtest_addons_data WHERE backtest_id = ? ORDER BY backtest_data_id;'
  // object where the backtest information will be stored
  var backtestInfo = { }
  // object-list where the backtest data will be stored
  // the array accounts for: direction, result, pair, strategy and timeframe
  var backtestData = [[], [], [], [], []]
  connection.query(getBacktest, [req.params.id, req.user.id], (err, results) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', 'Something went wrong, please try again.')
      return res.redirect('/' + req.user.username + '/journal/backtest');
    }
    backtestInfo.id = results[0].id;
    backtestInfo.title = results[0].created_at + " [" + results[0].result + "]";
    if (results[0].pair_id != null) {
      backtestInfo.pair = pairs[Number(results[0].pair_id) - 1];
    }
    if (results[0].direction != null) {
      backtestInfo.direction = results[0].direction;
    }
    if (results[0].strategy_id != null) {
      backtestInfo.strategy = userStrategies[userIdStrategies.findIndex(strategy => strategy == results[0].strategy_id)];
    }
    if (results[0].timeframe_id != null) {
      backtestInfo.timeframe = timeframes[Number(results[0].timeframe_id) - 1];
    }
    // attemps to get backtest addons if they exits
    connection.query(getAddons, backtestInfo.id, (err, results) => {
      if (err) {
        // COMBAK: log error
        req.flash('error', 'Something went wrong, please try again.')
        return res.redirect('/' + req.user.username + '/journal/backtest');
      }
      if (results.length > 0) {
        backtestInfo.addons = [];
        results.forEach((addon) => {
          backtestInfo.addons.push(addon.description)
          // add a new array to backtestData for each backtest addon
          backtestData.push([])
        });
      }
      connection.query(getData, backtestInfo.id, (err, results) => {
        if (err) {
          // COMBAK: log error
          req.flash('error', 'Something went wrong, please try again.')
          return res.redirect('/' + req.user.username + '/journal/backtest');
        }
        results.forEach((entryData) => {
          // FIXME: check whether the value is NULL, and if it isn't then index the array-value
          backtestData[0].push(entryData.direction)
          backtestData[1].push(entryData.result)
          backtestData[2].push(pairs[Number(entryData.pair_id) - 1])
          backtestData[3].push(userStrategies[userIdStrategies.findIndex(strategy => strategy == entryData.strategy_id)])
          backtestData[4].push(timeframes[Number(entryData.timeframe_id) - 1])
        });
        if ('addons' in backtestInfo) {
          connection.query(getAddonsData, backtestInfo.id, (err, results) => {
            results.forEach((addonsData) => {
              // adds the addon value to the corresponding array in backtestData
              backtestData[Number(4 + addonsData.backtest_addons_id)].push(addonsData.addon_value);
            });
            res.render("user/journal/backtest/show",
              {
                backtest:backtestInfo,
                data:backtestData
              }
            );
          })
        } else {
          res.render("user/journal/backtest/show",
            {
              backtest:backtestInfo,
              data:backtestData
            }
          );
        }
      })

    })
  })
})

// UPDATE BACKTEST ROUTE
router.get("/:id/edit", middleware.isLoggedIn, (req, res) => {
  // inserts DB queries to a variable
  var getBacktest = 'SELECT *, DATE_FORMAT(created_at, "%d de %M %Y") AS created_at FROM backtest WHERE id = ?;'
  var getAddons = 'SELECT description, is_integers, option1, option2, option3, option4, option5, option6 FROM backtest_addons WHERE backtest_id = ? ORDER BY id;'
  var getData = 'SELECT direction, result, pair_id, strategy_id, timeframe_id FROM backtest_data WHERE backtest_id = ?;'
  var getAddonsData = 'SELECT * FROM backtest_addons_data WHERE backtest_id = ? ORDER BY backtest_data_id;'
  // object where the backtest information will be stored
  var backtestInfo = { }
  // object-list where the backtest data will be stored
  // the array accounts for: direction, result, pair, strategy and timeframe
  var backtestData = [[], [], [], [], []]
  connection.query(getBacktest, req.params.id, (err, results) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', 'Something went wrong, please try again.')
      return res.redirect('/' + req.user.username + '/journal/backtest');
    }
    backtestInfo.id = results[0].id;
    backtestInfo.title = results[0].created_at + " [" + results[0].result + "]";
    if (results[0].pair_id != null) {
      backtestInfo.pair = results[0].pair_id;
    }
    if (results[0].direction != null) {
      backtestInfo.direction = results[0].direction;
    }
    if (results[0].strategy_id != null) {
      backtestInfo.strategy = userStrategies[userIdStrategies.findIndex(strategy => strategy == results[0].strategy_id)];
    }
    if (results[0].timeframe_id != null) {
      backtestInfo.timeframe = results[0].timeframe_id;
    }
    // attemps to get backtest addons if they exits
    connection.query(getAddons, backtestInfo.id, (err, results) => {
      if (err) {
        // COMBAK: log error
        req.flash('error', 'Something went wrong, please try again.')
        return res.redirect('/' + req.user.username + '/journal/backtest');
      }
      if (results.length > 0) {
        backtestInfo.addons = [];
        backtestInfo.addonsType = [];
        backtestInfo.addonsOptions = [];
        results.forEach((addon) => {
          backtestInfo.addons.push(addon.description)
          backtestInfo.addonsType.push(addon.is_integers)
          var currentOptions = []
          currentOptions.push(addon.option1)
          currentOptions.push(addon.option2)
          currentOptions.push(addon.option3)
          currentOptions.push(addon.option4)
          currentOptions.push(addon.option5)
          currentOptions.push(addon.option6)
          backtestInfo.addonsOptions.push(currentOptions);
          // add a new array to backtestData for each backtest addon
          backtestData.push([])
        });
      }
      connection.query(getData, backtestInfo.id, (err, results) => {
        if (err) {
          // COMBAK: log error
          req.flash('error', 'Something went wrong, please try again.')
          return res.redirect('/' + req.user.username + '/journal/backtest');
        }
        results.forEach((entryData) => {
          // FIXME: check whether the value is NULL, and if it isn't then index the array-value
          backtestData[0].push(entryData.direction)
          backtestData[1].push(entryData.result)
          backtestData[2].push(entryData.pair_id)
          backtestData[3].push(userStrategies[userIdStrategies.findIndex(strategy => strategy == entryData.strategy_id)])
          backtestData[4].push(entryData.timeframe_id)
        });
        if ('addons' in backtestInfo) {
          connection.query(getAddonsData, backtestInfo.id, (err, results) => {
            results.forEach((addonsData) => {
              // adds the addon value to the corresponding array in backtestData
              backtestData[Number(4 + addonsData.backtest_addons_id)].push(addonsData.addon_value);
            });
            res.render("user/journal/backtest/edit",
              {
                currencies:pairs,
                strategies:userStrategies,
                timeframes:timeframes,
                backtest:backtestInfo,
                data:backtestData
              }
            );
          })
        } else {
          res.render("user/journal/backtest/edit",
            {
              currencies:pairs,
              strategies:userStrategies,
              timeframes:timeframes,
              backtest:backtestInfo,
              data:backtestData
            }
          );
        }
      })
    })
  })
})

// UPDATE BACKTEST LOGIC
router.put("/:id", middleware.isLoggedIn, (req, res) => {
  var addData = 'INSERT INTO backtest_data (identifier, backtest_id, direction, result, pair_id, strategy_id, timeframe_id) VALUES ?'
  // FIXME: the data from the 'req.body' could already be ready for storage, instead of refactoring
  // FIXME: the backtest id can be extracted thruogh 'req.params.id' (easier way)
  var parseData = JSON.parse(req.body.serverData);
  var backtest_id = parseData.backtest.id;
  var editBacktest = []
  var editAddons = []
  var counterRow = 1;
  // stores all the backtest rows in to the 'editBacktest' array
  // stores all the addons rows in to the 'editAddons' array
  for (var i = 0; i < parseData.data[0].length; i++) {
    editBacktest.push([])
    editBacktest[i].push(counterRow)
    editBacktest[i].push(backtest_id)
    //outcome parameter
    if (parseData.data[1][i] == '') {
      req.flash('error', 'The outcome field cannot be blank.')
      return res.redirect('/' + req.user.username + '/journal/backtest/' + backtest_id);
    }
    // direction parameter
    if ('direction' in parseData.backtest) {
      editBacktest[i].push(null)
    } else {
      if (parseData.data[0][i] == 'short' || parseData.data[0][i] == 'venta') {
        editBacktest[i].push('short')
      } else {
        editBacktest[i].push('long')
      }
    }
    // result parameter
    editBacktest[i].push(parseData.data[1][i])
    // pair parameter
    if ('pair' in parseData.backtest) {
      editBacktest[i].push(null)
    } else {
      editBacktest[i].push(Number(parseData.data[2][i]) + 1)
    }
    // strategy parameter
    if ('strategy' in parseData.backtest) {
      editBacktest[i].push(null)
    } else {
      editBacktest[i].push(userIdStrategies[userStrategies.findIndex(strategy => strategy == parseData.data[3][i])])
    }
    // timeframe parameter
    if ('timeframe' in parseData.backtest) {
      editBacktest[i].push(null)
    } else {
      editBacktest[i].push(timeframes.findIndex(timeframe => timeframe == parseData.data[4][i]) + 1)
    }
    // checks whether the backtest has any addons
    if (parseData.data.length > 5) {
      for (var y = 0; y < parseData.backtest.addons.length; y++) {
        if (parseData.data[5 + y][i] == '') {
          req.flash('error', 'Backtest fields cannot be blank.')
          return res.redirect('/' + req.user.username + '/journal/backtest/' + backtest_id);
        }
        editAddons.push([backtest_id, counterRow, y + 1, Number(parseData.data[5 + y][i])])
      }
    }
    counterRow += 1;
  }
  // deletes the Addons data before sending the new updated data to the DB
  connection.query('DELETE FROM backtest_addons_data WHERE backtest_id = ?', backtest_id, (err, done) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', 'Something went wrong, please try again.')
      return res.redirect('/' + req.user.username + '/journal/backtest');
    }
    // deletes the Backtest data before sending the new updated data to the DB
    connection.query('DELETE FROM backtest_data WHERE backtest_id = ?', backtest_id, (err, done) => {
      if (err) {
        // COMBAK: log error
        req.flash('error', 'Something went wrong, please try again.')
        return res.redirect('/' + req.user.username + '/journal/backtest');
      }
      // stores the backtest DATA into the DB
      if (editBacktest.length > 0) {
        connection.query(addData, [editBacktest], async (err, complete) => {
          if (err) {
            // COMBAK: log error
            req.flash('error', 'Something went wrong, please try again.')
            return res.redirect('/' + req.user.username + '/journal/backtest');
          }
          if (editAddons.length > 0) {
            try {
              // stores the backtest ADDONS into the DB
              var addAddons = await query('INSERT INTO backtest_addons_data (backtest_id, backtest_data_id, backtest_addons_id, addon_value) VALUES ?', [editAddons])
            } catch (err) {
              // COMBAK: log error
              req.flash('error', 'Something went wrong, please try again.')
              return res.redirect('/' + req.user.username + '/journal/backtest');
            }
          }
          req.flash('success', 'The backtest was saved successfully.')
          res.redirect("/" + req.user.username + "/journal/backtest");
        })
      } else {
        req.flash('success', 'The backtest was saved successfully.')
        res.redirect("/" + req.user.username + "/journal/backtest");
      }
    })
  })
})

// DELETE BACKTEST ROUTE
router.delete("/:id", middleware.isLoggedIn, (req, res) => {
  var deleteAddonsData = 'DELETE FROM backtest_addons_data WHERE backtest_id = ?'
  var deleteBacktestData = 'DELETE FROM backtest_data WHERE backtest_id = ?'
  var deleteAddons = 'DELETE FROM backtest_addons WHERE backtest_id = ?'
  var deleteBacktest = 'DELETE FROM backtest WHERE id = ?'
  // deletes the addons data from the DB
  connection.query(deleteAddonsData, req.params.id, (err) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', 'Something went wrong, please try again.')
      return res.redirect('/' + req.user.username + '/journal/backtest');
    }
    // deletes the backtest data from the DB
    connection.query(deleteBacktestData, req.params.id, (err) => {
      if (err) {
        // COMBAK: log error
        req.flash('error', 'Something went wrong, please try again.')
        return res.redirect('/' + req.user.username + '/journal/backtest');
      }
      // deletes the addons from the DB
      connection.query(deleteAddons, req.params.id, (err) => {
        if (err) {
          // COMBAK: log error
          req.flash('error', 'Something went wrong, please try again.')
          return res.redirect('/' + req.user.username + '/journal/backtest');
        }
        // deletes the backtest from the DB
        connection.query(deleteBacktest, req.params.id, (err) => {
          if (err) {
            // COMBAK: log error
            req.flash('error', 'Something went wrong, please try again.')
            return res.redirect('/' + req.user.username + '/journal/backtest');
          }
          req.flash('success', 'Backtest was deleted successfully.')
          res.redirect("/" + req.user.username + "/journal/backtest");
        })
      })
    })
  })
})

module.exports = router;
