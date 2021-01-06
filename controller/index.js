// dependencies
const util        = require('util');
const async       = require('async');
const nodemailer  = require('nodemailer');
const crypto      = require('crypto');
const bcrypt      = require('bcrypt');
const saltRounds  = 10;

// global variables
let plans             = require('../models/plans');
let localeTimeframes  = require("../models/timeframes");
let db                = require('../models/dbConfig');
// let logger            = require('../models/loggerConfig');

let winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.File({ filename: './error.log', level: 'error' }),
    new winston.transports.File({ filename: './combined.log' }),
    new winston.transports.Console(),
  ],
});

// COMBAK: set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')('sk_test_51HTTZyFaIcvTY5RCCdt6kRcZcNMwtjq13cAVcs6jWWvowXuRqXQKvFCK6pYG7Q8NRSy9NQ8uCjHADKAHd36Mfosx006ajk0pov');

// node native promisify
const query = util.promisify(db.query).bind(db);

module.exports.renderHome = (req, res) => {
  logger.error('Testing that logger works')
  res.render("home");
}

module.exports.renderLogo = (req, res) => {
  res.render('sample-copy.jpg')
}

module.exports.renderFeatures = (req, res) => {
  res.render("features");
}

module.exports.renderPricing = (req, res) => {
  res.render("pricing");
}

module.exports.renderResources = (req, res) => {
  res.render("resources");
}

module.exports.renderMobile = (req, res) => {
  res.render("mobile");
}

module.exports.changeLanguage = (req, res) => {
  console.log(req.params.lang);
  res.cookie('lang', req.params.lang)
  res.redirect('/')
}

module.exports.renderLogin = (req, res) => {
  // checks whether user data exists for direct login
  if (!req.user) {
    logger.error('Should not trigger this, but it\' line 55 of index.js (controller)')
    res.render("login");
  } else {
    if (req.isAuthenticated()) {
      res.redirect("/" + req.user.username)
    }
  }
}

module.exports.logicLogin = async (req, res) => {
  logger.error('It passes the middleware, but it fails here')
  let getUserStrategies = await query('SELECT id, strategy FROM strategies WHERE user_id = ?', req.user.id);
  req.session.strategyNames = []
  req.session.strategyIds = []
  for (var i = 0; i < getUserStrategies.length; i++) {
    req.session.strategyNames.push(getUserStrategies[i].strategy);
    req.session.strategyIds.push(getUserStrategies[i].id);
  }
  req.session.timeframes = await localeTimeframes();
  req.session.notification = true;
  res.cookie('lang', req.user.language)
  res.redirect("/" + req.user.username)
}

module.exports.logout = (req, res) => {
  req.logout();
  req.session.notification = null;
  req.session.strategyNames = null;
  req.session.strategyIds = null;
  req.flash("success", res.__("Successfully logged out!"))
  res.redirect("/")
}

module.exports.renderForgotPassword = (req, res) => {
  res.render("forgot-password");
}

module.exports.logicForgotPassword = (req, res, next) => {
  // method that concatenates all the parts from the the reset password process
  async.waterfall([
    // generates the reset token
    (done) => {
      crypto.randomBytes(20, (err, buf) => {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    // search for the given email in the DB and get the user id and email
    (token, done) => {
      db.query('SELECT id, email FROM users WHERE email = ?', req.body.email, (err, getId) => {
        if (err) throw err;
        // if email does not exists then send error
        if (getId.length < 1) {
          req.flash('error', res.__('No account with that email address exists.'));
          return res.redirect('/forgot-password')
        }
        var user = getId[0];
        var expireDate = new Date();
        expireDate.setHours(expireDate.getHours() + 1); // 1 hour
        var setTokenInfo = 'UPDATE users SET resetPasswordToken = ?, resetPasswordExpire = ? WHERE id = ?'
        // stores the reset password token in the DB
        db.query(setTokenInfo, [token, expireDate, user.id], (err) => {
          if (err) throw err;
          done(err, token, user);
        });
      });
    },
    // email transport config.
    (token, user, done) => {
      var smtpTransport = nodemailer.createTransport({
        host: 'smtp.dondominio.com',
        port: 587,
        secure: false,
        auth: {
          user: 'notify@neilit.com',
          pass: 'neilit!PR1510'
        }
      });
      // email properties
      var mailOptions = {
        to: user.email,
        from: 'notify@neilit.com',
        subject: 'Reset your password',
        text: 'Hello ' + user.email + ',\n\n' +
          'You have submitted a password reset request.\n' +
          'Please visit http://' + req.headers.host + '/reset/' + token + ' to reset your password.\n\n' +
          'If you did not make this request, please contact support immediately.\n\n' +
          'Thank you for choosing Neilit.'
      };
      // send email
      smtpTransport.sendMail(mailOptions, (err) => {
        req.flash('success', res.__('An e-mail has been sent to ') + user.email + res.__(' with further instructions.'));
        done(err, 'done');
      });
    }
  ], (err) => {
    if (err) return next(err);
    res.redirect('/forgot-password');
  });
}

module.exports.renderResetPassword = (req, res) => {
  selectTokenExpire = 'SELECT resetPasswordExpire FROM users WHERE resetPasswordToken = ?;'
  db.query(selectTokenExpire, req.params.token, (err, getExpire) => {
    if (err) throw err;
    if (getExpire.length < 1 || getExpire[0].resetPasswordExpire < new Date()) {
      req.flash('error', res.__('Password reset token is invalid or has expired.'));
      return res.redirect('/forgot-password')
    }
    res.render('reset-password', {token: req.params.token});
  });
}

module.exports.logicResetPassword = (req, res, next) => {
  async.waterfall([
    (done) => {
      selectTokenExpire = 'SELECT email, resetPasswordExpire FROM users WHERE resetPasswordToken = ?;'
      db.query(selectTokenExpire, req.params.token, (err, getExpire) => {
        if (err) throw err;
        if (getExpire.length < 1 || getExpire[0].resetPasswordExpire < new Date()) {
          req.flash('error', res.__('Password reset token is invalid or has expired.'));
          return res.redirect('back')
        }
        var user = getExpire[0];
        if (req.body.password == req.body.confirmPassword) {
          // COMBAK: move the password hashing to module exports
          bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
            var resetPassword = 'UPDATE users SET password = ?, resetPasswordToken = ?, resetPasswordExpire =? WHERE resetPasswordToken = ?;'
            db.query(resetPassword, [hash, null, null, req.params.token], (err) => {
              if (err) throw err;
              done(err, user)
            })
          })
        } else {
          req.flash('error', res.__('Passwords do not match.'));
          return res.redirect('back');
        }
      })
    },
    (user, done) => {
      var smtpTransport = nodemailer.createTransport({
        host: 'smtp.dondominio.com',
        port: 587,
        secure: false,
        auth: {
          user: 'notify@neilit.com',
          pass: 'neilit!PR1510'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'notify@neilit.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for you accout, ' + user.email +
          'has just been changed.\n\n' +
          'Thank you for choosing Neilit.'
      };
      smtpTransport.sendMail(mailOptions, (err) => {
        if (err) throw err;
        req.flash('success', res.__('Success! Your password has been changed.'));
        done(err);
      });
    }
  ], (err) => {
    if (err) return next(err);
    res.redirect('/login');
  });
}

module.exports.renderSignup = (req, res) => {
  res.render("signup");
}

module.exports.logicSignup = async (req, res) => {
  // try {
  //   // Create a new customer object
  //   const customer = await stripe.customers.create({
  //     email: req.user.email,
  //   });
  //   var saveStripeCustomerId = await query('UPDATE users SET stripeCustomerId = ? WHERE email = ?', [customer.id, req.user.email])
  //   res.redirect("/signup/select-plan");
  // } catch (e) {
  //   req.flash('error', res.__('There was an issue with the registration process. Please, try again later.'))
  //   res.redirect('/signup');
  // }
  let getUserStrategies = await query('SELECT id, strategy FROM strategies WHERE user_id = ?', req.user.id);
  req.session.strategyNames = []
  req.session.strategyIds = []
  for (var i = 0; i < getUserStrategies.length; i++) {
    req.session.strategyNames.push(getUserStrategies[i].strategy);
    req.session.strategyIds.push(getUserStrategies[i].id);
  }
  req.session.timeframes = await localeTimeframes();
  req.session.notification = true;
  res.cookie('lang', 'en')
  res.redirect("/" + req.user.username)
}

module.exports.renderSelectPlan = (req, res) => {
  res.render("select", { priceList: plans.price_id })
}

module.exports.logicSelectPlan = (req, res) => {
  if (req.body.priceId != '') {
    selectPlan = req.body.priceId
    res.redirect('/signup/select-plan/checkout')
  } else {
    res.redirect("/" + req.user.username)
  }
}

module.exports.renderCheckout = (req, res) => {
  res.render('checkout',
    { customerId: req.user.stripeCustomerId, priceId: selectPlan }
  );
}

module.exports.createStripeUser = async (req, res) => {
  // checks if the current user has a payment method
  let getStripeUser = await query('SELECT stripeCustomerPaymentMethodId FROM stripe_users WHERE user_id = ?', req.user.id);
  if (getStripeUser.length > 0) {
    // IF is has a payment method, THEN it updates it
    let updateStripeUser = await query('UPDATE stripe_users SET stripeCustomerPaymentMethodId = ? WHERE user_id = ?;', [req.body.paymentMethodId, req.user.id])
  } else {
    // IF it doesn't have a payment method, THEN it creates one
    var newStripeUser = {user_id: req.user.id, stripeCustomerPaymentMethodId: req.body.paymentMethodId}
    let createStripeUser = await query('INSERT INTO stripe_users SET ?', newStripeUser);
  }
  res.end();
}

module.exports.retryInvoice = async (req, res) => {
  // set the default payment method on the customer
  try {
    await stripe.paymentMethods.attach(req.body.paymentMethodId, {
      customer: req.body.customerId,
    });
    await stripe.customers.update(req.body.customerId, {
      invoice_settings: {
        default_payment_method: req.body.paymentMethodId,
      },
    });
    console.log('it workssss...');
  } catch (error) {
    // in case card_decline error
    console.log('card got declined');
    return res
      .status('402')
      .send({ result: { error: { message: error.message } } });
  }

  const invoice = await stripe.invoices.retrieve(req.body.invoiceId, {
    expand: ['payment_intent'],
  });
  res.send(invoice);
}

module.exports.createSubscription = async (req, res) => {
  // create a new customer object if user doesn't have one
  if (req.user.stripeCustomerId == null) {
    const customer = await stripe.customers.create({
      email: req.user.email,
    });
    var saveStripeCustomerId = await query('UPDATE users SET stripeCustomerId = ? WHERE email = ?', [customer.id, req.user.email])
  }
  // attach the payment method to the customer
  try {
    await stripe.paymentMethods.attach(req.body.paymentMethodId, {
      customer: req.user.stripeCustomerId,
    });
  } catch (error) {
    // COMBAK: display error message where card is declined
    return res.status('402').send({ error: { message: error.message } });
  }
  // change the default invoice settings on the customer to the new payment method
  await stripe.customers.update(
    req.body.customerId,
    {
      invoice_settings: {
        default_payment_method: req.body.paymentMethodId,
      },
    }
  );
  // create the subscription
  const subscription = await stripe.subscriptions.create({
    customer: req.body.customerId,
    items: [{ price: 'price_1HTUBMFaIcvTY5RCKZixDYVk' }],
    expand: ['latest_invoice.payment_intent'],
  });
  // retrieves the payment method
  const paymentMethod = await stripe.paymentMethods.retrieve(
    req.body.paymentMethodId
  );
  var saveUserPlan = await query('UPDATE users SET stripeSubscriptionId = ?, stripeProductId = ?, role_id = 2 WHERE id = ?;', [subscription.id, subscription.plan.product, req.user.id]);
  var saverPaymentDigits = await query('UPDATE stripe_users SET last4 = ? WHERE user_id = ?;', [paymentMethod.card.last4, req.user.id]);
  res.send(subscription);
}
