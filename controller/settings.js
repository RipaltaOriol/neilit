// dependencies
const util = require('util');

// global variables
let pairs             = require('../models/pairs');
let currencies        = require('../models/currencies');
let localeTimeframes  = require('../models/timeframes');
let db                = require('../models/dbConfig');

// node native promisify
const query = util.promisify(db.query).bind(db);

// COMBAK: Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')('sk_test_51HTTZyFaIcvTY5RCCdt6kRcZcNMwtjq13cAVcs6jWWvowXuRqXQKvFCK6pYG7Q8NRSy9NQ8uCjHADKAHd36Mfosx006ajk0pov');

module.exports.newStrategy = (req, res) => {
  // creates an object with the new strategy
  var newStrategy = {
    strategy: req.body.strategy,
    user_id: req.user.id
  }
  // saves the strategy to the DB
  db.query('INSERT INTO strategies SET ?', newStrategy, (err, done) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        // COMBAK: log error
        return res.json(
          {
            response: 'error',
            message: res.__('Strategy names cannot have duplicate names.')
          }
        )
      } else {
        // COMBAK: log error
        return res.json(
          {
            response: 'error',
            message: res.__('Something went wrong, please try again.')
          }
        )
      }
    }
    req.session.strategyNames.push(req.body.strategy);
    req.session.strategyIds.push(done.insertId)
    return res.json({response: 'success'})
  })
}

module.exports.deleteStrategy = (req, res) => {
  var deleteStrategy = 'DELETE FROM strategies WHERE strategy = ? && user_id = ?'
  if (req.body.strategy == 'None') {
    return res.json(
      {
        response: 'error',
        message: res.__('The \'None\' strategy cannot be deleted.')
      }
    )
  }
  (async () => {
    var replace = req.session.strategyIds[0]
    var oldIndex = req.session.strategyNames.findIndex(strategy => strategy == req.body.strategy)
    var old = req.session.strategyIds[oldIndex]
    var data = [replace, old, req.user.id]
    // update entries
    var deleteEntries = await query('UPDATE entries SET strategy_id = ? WHERE strategy_id = ? && user_id = ?', data);
    // update technical analysis
    var deleteTAs = await query('UPDATE tanalysis r JOIN telementanalysis t ON (r.id = t.ta_id) SET t.strategy_id = ? WHERE t.strategy_id = ? && r.user_id = ?', data);
    // update backtest single strategy
    var deleteBTsingle = await query('UPDATE backtest SET strategy_id = ? WHERE strategy_id = ? && user_id = ?', data);
    // update backtest multiple strategies
    var deleteBTmultiple = await query('UPDATE backtest b JOIN backtest_data d ON (b.id = d.backtest_id) SET d.strategy_id = ? WHERE d.strategy_id = ? && b.user_id = ?', data);
    // update plan positions
    var deletePlanPositions = await query('UPDATE plans p JOIN pln_positions o ON p.id = o.plan_id SET o.strategy_id = ? WHERE o.strategy_id = ? && p.user_id = ?', data);
    // update plan strategies
    var deletePlanStrategies = await query('UPDATE plans p JOIN pln_strategies s ON p.id = s.plan_id SET s.strategy_id = ? WHERE s.strategy_id = ? && p.user_id = ?', data);
    // deletes the strategy from the DB
    await db.query(deleteStrategy, [req.body.strategy, req.user.id], (err, done) => {
      if (err) {
        console.log(err);
        // COMBAK: log error
        return res.json(
          {
            response: 'error',
            message: res.__('Something went wrong, please try again.')
          }
        )
      }
      req.session.strategyNames.splice(oldIndex, 1);
      req.session.strategyIds.splice(oldIndex, 1);
      return res.json({response: 'success'})
    })
  })()
}

module.exports.newGoal = (req, res) => {
  // creates an object with the new goal
  var newGoal = {
    goal: req.body.goal,
    user_id: req.user.id
  }
  // saves the goal to the DB
  db.query('INSERT INTO goals SET ?', newGoal, (err, done) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username);
    }
    res.end();
  })
}

module.exports.deleteGoal = (req, res) => {
  var deleteGoal = 'DELETE FROM goals WHERE goal = ?'
  // deletes the goal from the DB
  db.query(deleteGoal, req.body.goal, (err) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username);
    }
    res.end();
  })
}

module.exports.changeCurrency = (req, res) => {
  var updateCurrency = 'UPDATE users SET currency_id = ? WHERE id = ?'
  var currency = currencies.indexOf(req.body.currency) + 1;
  // updates the base currency from the DB
  db.query(updateCurrency, [currency, req.user.id], (err) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username);
    }
    res.end();
  })
}

module.exports.changeShowProfits = (req, res) => {
  var updateShowProfits = 'UPDATE users SET showProfits = ? WHERE id = ?'
  // updates the show profits in entries config. from the DB
  db.query(updateShowProfits, [req.body.showProfits, req.user.id], (err) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username);
    }
    res.end();
  })
}

module.exports.changeMode = (req, res) => {
  var updateMode = 'UPDATE users SET darkMode = ? WHERE id = ?'
  // updates the mode from the DB
  db.query(updateMode, [req.body.mode, req.user.id], (err) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username);
    }
    res.end();
  })
}

module.exports.changeLanguage = (req, res) => {
  var updateLanguage = 'UPDATE users SET language = ? WHERE id = ?'
  // updates the user's language in the DB
  db.query(updateLanguage, [req.body.lang, req.user.id], (err) => {
    if (err) {
      // COMBAK: log error
      req.flash('error', res.__('Something went wrong. Please, try again later.'))
      return res.redirect('/' + req.user.username);
    }
    res.cookie('lang', req.body.lang)
    timeframes = localeTimeframes();
    res.end();
  })
}

module.exports.renderChangePlan = (req, res) => {
  res.render('user/change', {username: req.user.username})
}

module.exports.cancelSubscription = async (req, res) => {
  // delete the subscription
  const deletedSubscription = await stripe.subscriptions.del(
    req.user.stripeSubscriptionId
  );
  var cancelSubscription = await query('UPDATE users SET expiration = NULL, role_id = 1, stripeSubscriptionId = NULL WHERE id = ?;', req.user.id);
  res.send(deletedSubscription);
}

module.exports.renderUpdatePayment = (req, res) => {
  res.render('checkout',
    {
      customerId: req.user.stripeCustomerId,
      priceId: 'price_1HTUBMFaIcvTY5RCKZixDYVk'
    }
  )
}
