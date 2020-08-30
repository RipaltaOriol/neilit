var express = require('express');
var router = express.Router({mergeParams: true});
let pairs = require("../models/pairs");
let timeframes = require("../models/timeframes");
let categories = require("../models/categoriesPairs");
let middleware = require('../middleware');
let connection = require('../models/connectDB');

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

// NEW PLAN ROUTE
router.get("/new", middleware.isLoggedIn, (req, res) => {
  var selectBacktests = 'SELECT id, pair_id, DATE_FORMAT(created_at, "%d de %M %Y") AS date FROM backtest WHERE user_id = ?;'
  var allBacktests = {
    id: [],
    title: []
  }
  connection.query(selectBacktests, req.user.id, (err, results) => {
    if (err) throw err;
    // stores each backtest to an object array
    results.forEach((backtest) => {
      allBacktests.id.push(backtest.id);
      allBacktests.title.push(pairs[Number(backtest.pair_id - 1)] + ', ' + backtest.date)
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
  console.log(req.body);
  // creates an object with the new plan variables
  var newPlan = {
    user_id: req.user.id,
    title: req.body.title,
    broker: req.body.broker,
    charts: req.body.charts,
    routine: req.body.routine,
    psy_notes: req.body.psychology,
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
  connection.query('INSERT INTO plans SET ?', newPlan, (err, planId) => {
    if (err) throw err;
    var plan_id = planId.insertId;
    // creates an array with the new checklist variables
    var newChecklist = []
    // stores the plan's journal checklist into the DB if any
    if (req.body.checklist != undefined) {
      if (Array.isArray(req.body.checklist)) {
        req.body.checklist.forEach((item) => {
          newChecklist.push([plan_id, item])
        });
      } else {
        newChecklist.push([plan_id, req.body.checklist])
      }
      var addChecklists = 'INSERT INTO checklists (plan_id, checklist) VALUES ?'
      connection.query(addChecklists, [newChecklist], (err) => {
        if (err) throw err;
        // creates and array with the new goals values
        var newObjectives = []
        // stores the plan's objectives into the DB
        if (req.body.objectiveFin != undefined) {
          if (Array.isArray(req.body.objectiveFin)) {
            req.body.objectiveFin.forEach((objective) => {
              newObjectives.push([plan_id, 'fin', objective])
            });
          } else {
            newObjectives.push([plan_id, 'fin', req.body.objectiveFin])
          }
        }
        if (req.body.objectiveNonfin != undefined) {
          if (Array.isArray(req.body.objectiveNonfin)) {
            req.body.objectiveNonfin.forEach((objective) => {
              newObjectives.push([plan_id, 'nonfin', objective])
            });
          } else {
            newObjectives.push([plan_id, 'nonfin', req.body.objectiveNonfin])
          }
        }
        var addObjectives = 'INSERT INTO objectives (plan_id, type, objective) VALUES ?'
        connection.query(addObjectives, [newObjectives], (err) => {
          if (err) throw err;

        })
        // COMBAK: continue to execute the objectives query + do the account objective query
        // then the account objectives
        // you can print the plans and goals to the EJS
        // and the the strategies + positioning
        // COMBAK: then, do the strategy and positioning
        res.redirect('/' + req.user.username + '/plan');
      })
    } else {
      // develop the code here

      res.redirect('/' + req.user.username + '/plan');
    }
  })
})

// SHOW PLAN ROUTE
router.get("/1", middleware.isLoggedIn, (req, res) => {
  // var getPlan ='...'
  // continue
  res.render('user/plan/show')
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
  connection.query(deletePositionsPlan, req.params.id, (err) => {
    if (err) throw err;
    // deletes the strategies on the plan from the DB
    connection.query(deleteStrategiesPlan, req.params.id, (err) => {
      if (err) throw err;
      // deletes the objectives from the the DB
      connection.query(deleteObjectivesPlan, req.params.id, (err) => {
        if (err) throw err;
        // deletes the checklist from the DB
        connection.query(deleteChecklistPlan, req.params.id, (err) => {
          if (err) throw err;
          // deletes the plan from the DB
          connection.query(deletePlan, req.params.id, (err) => {
            if (err) throw err;
            res.redirect('/' + req.user.username + '/plan');
          })
        })
      })
    })
  })
})

module.exports = router;
