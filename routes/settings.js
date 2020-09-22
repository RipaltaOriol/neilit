let express = require('express');
const util  = require('util');
let router = express.Router({mergeParams: true});
let pairs = require('../models/pairs');
let currencies = require('../models/currencies');
let timeframes = require('../models/timeframes');
let categories = require('../models/categoriesPairs');
let middleware = require('../middleware');
let connection = require('../models/connectDB');

// Global Program Variables
let strategies = require('../models/strategies');
// node native promisify
const query = util.promisify(connection.query).bind(connection);
// COMBAK: Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')('sk_test_51HTTZyFaIcvTY5RCCdt6kRcZcNMwtjq13cAVcs6jWWvowXuRqXQKvFCK6pYG7Q8NRSy9NQ8uCjHADKAHd36Mfosx006ajk0pov');


// NEW STRATEGY ROUTE
router.post("/newStrategy", middleware.isLoggedIn, (req, res) => {
  // creates an object with the new strategy
  var newStrategy = {
    strategy: req.body.strategy,
    user_id: req.user.id
  }
  // saves the strategy to the DB
  connection.query('INSERT INTO strategies SET ?', newStrategy, (err, done) => {
    if (err) throw err;
    res.end();
  })
})

// DELETE STRATEGY ROUTE
router.post("/deleteStrategy", middleware.isLoggedIn, (req, res) => {
  var deleteStrategy = 'DELETE FROM strategies WHERE strategy = ?'
  // deletes the strategy from the DB
  connection.query(deleteStrategy, req.body.strategy, (err) => {
    if (err) throw err;
    res.end();
  })
})

// NEW GOAL ROUTE
router.post("/newGoal", middleware.isLoggedIn, (req, res) => {
  // creates an object with the new goal
  var newGoal = {
    goal: req.body.goal,
    user_id: req.user.id
  }
  // saves the goal to the DB
  connection.query('INSERT INTO goals SET ?', newGoal, (err, done) => {
    if (err) throw err;
    res.end();
  })
})

// DELETE GOAL ROUTE
router.post("/deleteGoal", middleware.isLoggedIn, (req, res) => {
  var deleteGoal = 'DELETE FROM goals WHERE goal = ?'
  // deletes the goal from the DB
  connection.query(deleteGoal, req.body.goal, (err) => {
    if (err) throw err;
    res.end();
  })
})

// UPDATE BASE CURRENCY
router.post("/changeCurrency", middleware.isLoggedIn, (req, res) => {
  var updateCurrency = 'UPDATE users SET currency_id = ? WHERE id = ?'
  var currency = currencies.indexOf(req.body.currency) + 1;
  // updates the base currency from the DB
  connection.query(updateCurrency, [currency, req.user.id], (err) => {
    if (err) throw err;
    res.end();
  })
})

// UPDATE MODE ROUTE
router.post("/changeShowProfits", middleware.isLoggedIn, (req, res) => {
  var updateShowProfits = 'UPDATE users SET showProfits = ? WHERE id = ?'
  // updates the show profits in entries config. from the DB
  connection.query(updateShowProfits, [req.body.showProfits, req.user.id], (err) => {
    if (err) throw err;
    res.end();
  })
})

// UPDATE MODE ROUTE
router.post("/changeMode", middleware.isLoggedIn, (req, res) => {
  var updateMode = 'UPDATE users SET darkMode = ? WHERE id = ?'
  // updates the mode from the DB
  connection.query(updateMode, [req.body.mode, req.user.id], (err) => {
    if (err) throw err;
    res.end();
  })
})

// CHANGE PLAN ROUTE
router.get("/change-plan", middleware.isLoggedIn, (req, res) => {
  res.render('user/change', {username: req.user.username})
})

router.post('/cancel-subscription', async (req, res) => {
  // Delete the subscription
  const deletedSubscription = await stripe.subscriptions.del(
    req.user.stripeSubscriptionId
  );
  var cancelSubscription = await query('UPDATE users SET expiration = NULL, role_id = 1, stripeSubscriptionId = NULL WHERE id = ?;', req.user.id);
  console.log('The post fetch was made');
  res.send(deletedSubscription);
});


module.exports = router;
