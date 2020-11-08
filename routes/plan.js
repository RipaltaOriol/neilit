var express = require('express');
const util = require('util');
var router = express.Router({mergeParams: true});
let pairs = require("../models/pairs");
let categories = require("../models/categoriesPairs");
let middleware = require('../middleware');
let db = require('../models/dbConfig');
// node native promisify
const query = util.promisify(db.query).bind(db);

// Trading Plan Elements
var strategyPlan = require('../models/elements/plan');

// COMPONENTS PLAN ROUTE
router.get("/components", middleware.isLoggedIn, (req, res) => {
  // loads the trading plan elements to an object
  var elements = {
    strategyBeg: strategyPlan.comStratBeg,
    strategyEnd: strategyPlan.comStratEnd
  }
  res.render("user/plan/components",
    {
      strategies:userStrategies,
      elements:elements
    }
  );
});

// INDEX TRADING PLAN ROUTE
router.get("/", middleware.isLoggedIn, (req, res) => {
  // COMBAK: ensure that order is descending in terms of created_at
  var selectPlans = 'SELECT id, title, created_at FROM plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 25;';
  var options = { year: 'numeric', month: 'long', day: 'numeric' };
  db.query(selectPlans, req.user.id, (err, getPlans) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username);
    }
    // Object to store the Plans
    var plans = {
      id: [],
      title: [],
      date: []
    }
    getPlans.forEach((result) => {
      plans.id.push(result.id);
      plans.title.push(result.title);
      plans.date.push(result.created_at.toLocaleDateString(req.user.language, options));
    });
    res.render("user/plan", {plans: plans});
  })
})

// INDEX TRADING PLAN INFINITE SCROLL LOGIC
router.post("/load-index", middleware.isLoggedIn, (req, res) => {
  var selectPlans = 'SELECT id, title, created_at FROM plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 25 OFFSET ?;'
  var options = { year: 'numeric', month: 'long', day: 'numeric' };
  db.query(selectPlans, [req.user.id, Number(req.body.offset)], (err, results) => {
    if (err) {
      // COMBAK: log error
    }
    // Object to store the Plans
    var plans = {
      id: [],
      title: [],
      date: []
    }
    results.forEach((result) => {
      plans.id.push(result.id);
      plans.title.push(result.title);
      plans.date.push(result.created_at.toLocaleDateString(req.user.language, options));
    });
    return res.json({
      plans: plans
    });
  })
})

// NEW PLAN ROUTE
router.get("/new", middleware.isLoggedIn, (req, res) => {
  var selectBacktests = 'SELECT id, DATE_FORMAT(created_at, \'%d ' + res.__('of') + ' %M %Y\') AS date, result FROM backtest WHERE user_id = ?;'
  var allBacktests = {
    id: [],
    title: []
  }
  db.query(selectBacktests, req.user.id, (err, results) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/plan');
    }
    // stores each backtest to an object array
    results.forEach((backtest) => {
      allBacktests.id.push(backtest.id);
      allBacktests.title.push(backtest.date + ' in ' + backtest.result)
    });
    // loads the trading plan elements to an object
    var elements = {
      newStrategy: strategyPlan.newStrat(),
      newPosition: strategyPlan.newPos
    }
    res.render("user/plan/new",
      {
        elements:elements,
        backtests:allBacktests
      }
    );
  })
});

// NEW PLAN LOGIC
router.post("/new", middleware.isLoggedIn, (req, res) => {
  // creates an object with the new plan variables
  var newPlan = {
    user_id: req.user.id,
    title: req.body.title,
    broker: req.body.broker,
    charts: req.body.charts,
    capital: req.body.capital,
    routine: req.body.routine,
    psy_notes: req.body.psychology,
    psy_tips: req.body.tips,
    jrn_process: req.body.journaling,
    str_revision: req.body.revisionStrategy,
    jrn_revision: req.body.revisionJournal,
    pln_revision: req.body.revisionPlan,
  }
  // sets the title to undefined if left blank
  if (req.body.title == "") {
    newPlan.title = "Undefined"
  }
  // stores the plan's parameters into the DB
  db.query('INSERT INTO plans SET ?', newPlan, (err, planId) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/plan');
    }
    var plan_id = planId.insertId;
    (async () => {
      try {
        // stores the plan's journal checklist into the DB if any
        if (req.body.checklist != undefined) {
          // creates array with the new checklist variables
          var newChecklist = []
          if (Array.isArray(req.body.checklist)) {
            req.body.checklist.forEach((item) => {
              newChecklist.push([plan_id, item])
            });
          } else {
            newChecklist.push([plan_id, req.body.checklist])
          }
          const addChecklists = await query('INSERT INTO checklists (plan_id, checklist) VALUES ?', [newChecklist]);
        }
        if (req.body.objectiveFin != null || req.body.objectiveNonfin != null) {
          // creates array with the new goals values
          var newObjectives = []
          // stores the plan's objectives into the DB
          if (req.body.objectiveFin != null) {
            if (Array.isArray(req.body.objectiveFin)) {
              req.body.objectiveFin.forEach((objective) => {
                newObjectives.push([plan_id, 'fin', objective])
              });
            } else {
              newObjectives.push([plan_id, 'fin', req.body.objectiveFin])
            }
          }
          if (req.body.objectiveNonfin != null) {
            if (Array.isArray(req.body.objectiveNonfin)) {
              req.body.objectiveNonfin.forEach((objective) => {
                newObjectives.push([plan_id, 'nonfin', objective])
              });
            } else {
              newObjectives.push([plan_id, 'nonfin', req.body.objectiveNonfin])
            }
          }
          var addObjectives = await query('INSERT INTO objectives (plan_id, type, objective) VALUES ?', [newObjectives]);
        }
        // saves plan's strategies to the DB
        if (req.body.strategies != undefined) {
          // creates array with the strategies values
          var newStrategies = []
          // more than one strategy
          if (Array.isArray(req.body.strategies)) {
            req.body.strategies.forEach((iStrategy, i) => {
              var strategyId = userIdStrategies[userStrategies.findIndex(strategy => strategy == iStrategy)]
              var timeframeId = null;
              var pairId = null;
              var risk = null;
              var backtest_id = null;
              if (req.body.timeframes[i] != '') {
                timeframeId = timeframes.findIndex(timeframe => timeframe === req.body.timeframes[i]) + 1;
              }
              if (req.body.pairs[i] != '') {
                pairId = pairs.findIndex(pair => pair === req.body.pairs[i]) + 1;
              }
              if (req.body.risk[i] != '') {
                risk = req.body.risk[i];
              }
              if (req.body.planBacktest[i] != '') {
                backtest_id = req.body.planBacktest[i];
              }
              newStrategies.push([plan_id, strategyId, req.body.about[i], req.body.howto[i], req.body.keyNotes[i], timeframeId, pairId, risk, backtest_id])
            });
          }
          // one strategy
          else {
            var strategyId = userIdStrategies[userStrategies.findIndex(strategy => strategy == req.body.strategies)]
            var timeframeId = null;
            var pairId = null;
            var risk = null;
            var backtest_id = null;
            if (req.body.timeframes != '') {
              timeframeId = timeframes.findIndex(timeframe => timeframe === req.body.timeframes) + 1;
            }
            if (req.body.pairs != '') {
              pairId = pairs.findIndex(pair => pair === req.body.pairs) + 1;
            }
            if (req.body.risk != '') {
              risk = req.body.risk;
            }
            if (req.body.planBacktest != '') {
              backtest_id = req.body.planBacktest;
            }
            newStrategies.push([plan_id, strategyId, req.body.about, req.body.howto, req.body.keyNotes, timeframeId, pairId, risk, backtest_id])
          }
          var addStrategies = await query('INSERT INTO pln_strategies (plan_id, strategy_id, about, howto, keynotes, timeframe_id, pair_id, risk, backtest_id) VALUES ?', [newStrategies]);
        }
        // saves plan's positioning rules to the DB
        if (req.body.positionTitle != undefined) {
          // creates array with the strategies values
          var newPositions = []
          // more than one positioning rule
          if (Array.isArray(req.body.positionTitle)) {
            req.body.positionTitle.forEach((position, i) => {
              var strategyId = userIdStrategies[userStrategies.findIndex(strategy => strategy == req.body.positionStrategy[i])]
              var amount = null
              if (req.body.amount[i] != '') {
                amount = Number(req.body.amount[i]);
              }
              var order = null;
              if (req.body.orderType[i] != '') {
                order = req.body.orderType[i];
              }
              newPositions.push([plan_id, strategyId, position, req.body.positionType[i], amount, order, req.body.description[i]])
            });
          }
          // one positioning rule
          else {
            var strategyId = userIdStrategies[userStrategies.findIndex(strategy => strategy == req.body.positionStrategy)]
            var amount = null
            if (req.body.amount != '') {
              amount = Number(req.body.amount);
            }
            var order = null;
            if (req.body.orderType != '') {
              order = req.body.orderType;
            }
            newPositions.push([plan_id, strategyId, req.body.positionTitle, req.body.positionType, amount, order, req.body.description])
          }
          var addPositions = await query('INSERT INTO pln_positions (plan_id, strategy_id, title, rule_type, amount, order_type, description) VALUES ?', [newPositions]);
        }
      } catch (err) {
        // COMBAK: log error
        req.flash('error', res.__('Something went wrong, please try again.'))
        return res.redirect('/' + req.user.username + '/plan');
      } finally {
        req.flash('success', res.__('The plan was saved successfully.'))
        res.redirect('/' + req.user.username + '/plan');
      }
    })()
  })
})

// SHOW PLAN ROUTE
router.get("/:id", middleware.isLoggedIn, (req, res) => {
  // inserts DB queries to variables
  var selectPlan = 'SELECT * FROM plans WHERE id = ? AND user_id = ?;'
  var selectChecklist = 'SELECT checklist FROM checklists WHERE plan_id = ?;'
  var selectGoals = 'SELECT type, objective FROM objectives WHERE plan_id = ?;'
  var selectStrategy = 'SELECT * FROM pln_strategies WHERE plan_id = ?;'
  var selectPositioning = 'SELECT * FROM pln_positions WHERE plan_id = ?;'
  var checklist = []
  var finObjectives = []
  var nonfinObjectives = []
  var strategies = { }
  db.query(selectPlan, [req.params.id, req.user.id], (err, getPlan) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/plan');
    }
    var planInfo = getPlan[0];
    db.query(selectChecklist, req.params.id, (err, getChecklist) => {
      if (err) {
        // COMBAK: log error
        req.flash('error', res.__('Something went wrong, please try again.'))
        return res.redirect('/' + req.user.username + '/plan');
      }
      getChecklist.forEach((result) => {
        checklist.push(result.checklist)
      });
      db.query(selectGoals, req.params.id, (err, getGoals) => {
        if (err) {
          // COMBAK: log error
          req.flash('error', res.__('Something went wrong, please try again.'))
          return res.redirect('/' + req.user.username + '/plan');
        }
        getGoals.forEach((result) => {
          if (result.type == 'fin') {
            finObjectives.push(result.objective);
          } else {
            nonfinObjectives.push(result.objective);
          }
        });
        db.query(selectStrategy, req.params.id, (err, getStrategy) => {
          if (err) {
            // COMBAK: log error
            req.flash('error', res.__('Something went wrong, please try again.'))
            return res.redirect('/' + req.user.username + '/plan');
          }
          getStrategy.forEach((strategy) => {
            strategies[strategy.strategy_id] = {name: userStrategies[userIdStrategies.findIndex(strategyId => strategyId === strategy.strategy_id)] ,main: strategy, rules: []}
          });
          db.query(selectPositioning, req.params.id, (err, getPositioning) => {
            if (err) {
              // COMBAK: log error
              req.flash('error', res.__('Something went wrong, please try again.'))
              return res.redirect('/' + req.user.username + '/plan');
            }
            getPositioning.forEach((position) => {
              strategies[position.strategy_id].rules.push(position)
            });
            res.render('user/plan/show',
              {
                pairs:pairs,
                timeframes:timeframes,
                plan:planInfo,
                checklist:checklist,
                finObjectives:finObjectives,
                nonfinObjectives:nonfinObjectives,
                strategies:strategies
              }
            );
          })
        })
      })
    })
  })
})

// UPDATE PLAN ROUTE

// DELETE PLAN ROUTE
router.delete("/:id", middleware.isLoggedIn, (req, res) => {
  var deletePlan = 'DELETE FROM plans WHERE id = ?;'
  var deleteChecklistPlan = 'DELETE FROM checklists WHERE plan_id = ?;'
  var deleteObjectivesPlan = 'DELETE FROM objectives WHERE plan_id = ?;'
  var deleteStrategiesPlan = 'DELETE FROM pln_strategies WHERE plan_id = ?;'
  var deletePositionsPlan = 'DELETE FROM pln_positions WHERE plan_id = ?;'
  // deletes the positioning rules from the DB
  db.query(deletePositionsPlan, req.params.id, (err) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong, please try again.'))
      return res.redirect('/' + req.user.username + '/plan');
    }
    // deletes the strategies on the plan from the DB
    db.query(deleteStrategiesPlan, req.params.id, (err) => {
      if (err) {
        // COMBAK: log error
        req.flash('error', res.__('Something went wrong, please try again.'))
        return res.redirect('/' + req.user.username + '/plan');
      }
      // deletes the objectives from the the DB
      db.query(deleteObjectivesPlan, req.params.id, (err) => {
        if (err) {
          // COMBAK: log error
          req.flash('error', res.__('Something went wrong, please try again.'))
          return res.redirect('/' + req.user.username + '/plan');
        }
        // deletes the checklist from the DB
        db.query(deleteChecklistPlan, req.params.id, (err) => {
          if (err) {
            // COMBAK: log error
            req.flash('error', res.__('Something went wrong, please try again.'))
            return res.redirect('/' + req.user.username + '/plan');
          }
          // deletes the plan from the DB
          db.query(deletePlan, req.params.id, (err) => {
            if (err) {
              // COMBAK: log error
              req.flash('error', res.__('Something went wrong, please try again.'))
              return res.redirect('/' + req.user.username + '/plan');
            }
            res.redirect('/' + req.user.username + '/plan');
          })
        })
      })
    })
  })
})

module.exports = router;
