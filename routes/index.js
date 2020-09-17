let express       = require('express');
let router        = express.Router();
let passport      = require('passport');
let async         = require('async');
let nodemailer    = require('nodemailer');
let crypto        = require('crypto');
let bcrypt       = require('bcrypt');
const saltRounds  = 10;


// Global Program Variables
let strategies = require('../models/strategies');
let connection = require('../models/connectDB');

// HOME ROUTE
router.get("/", (req, res) => {
  res.render("home");
});

// LOGIN ROUTE
router.get("/login", (req, res) => {
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
router.post("/login", passport.authenticate('local-login', {
  failureRedirect: '/login'
}), (req, res) => {
  strategies(req.user.id);
  res.redirect("/" + req.user.username)
})

// SIGNUP ROUTE
router.get("/signup", (req, res) => {
  res.render("signup");
});

// SIGNUP LOGIC
router.post("/signup", passport.authenticate('local-signup', {
  failureRedirect: '/signup'
}), (req, res) => {
  res.redirect("/" + req.user.username);
})

// LOGOUT ROUTE
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Successfully logged out!")
  res.redirect("/")
})

// FORGOT PASSWORD ROUTE
router.get("/forgot-password", (req, res) => {
  res.render("forgot-password");
})

// FORGOT PASSWORD LOGIC
router.post("/forgot-password", (req, res, next) => {
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
      connection.query('SELECT id, email FROM users WHERE email = ?', req.body.email, (err, getId) => {
        if (err) throw err;
        // if email does not exists then send error
        if (getId.length < 1) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot-password')
        }
        var user = getId[0];
        var expireDate = new Date();
        expireDate.setHours(expireDate.getHours() + 1); // 1 hour
        var setTokenInfo = 'UPDATE users SET resetPasswordToken = ?, resetPasswordExpire = ? WHERE id = ?'
        // stores the reset password token in the DB
        connection.query(setTokenInfo, [token, expireDate, user.id], (err) => {
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
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], (err) => {
    if (err) return next(err);
    res.redirect('/forgot-password');
  });
});

// RESET PASSWORD ROUTE
router.get('/reset/:token', (req, res) => {
  selectTokenExpire = 'SELECT resetPasswordExpire FROM users WHERE resetPasswordToken = ?;'
  connection.query(selectTokenExpire, req.params.token, (err, getExpire) => {
    if (err) throw err;
    if (getExpire.length < 1 || getExpire[0].resetPasswordExpire < new Date()) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot-password')
    }
    res.render('reset-password', {token: req.params.token});
  });
});

// RESET PASSWORD LOGIC
router.post('/reset/:token', (req, res, next) => {
  async.waterfall([
    (done) => {
      selectTokenExpire = 'SELECT email, resetPasswordExpire FROM users WHERE resetPasswordToken = ?;'
      connection.query(selectTokenExpire, req.params.token, (err, getExpire) => {
        if (err) throw err;
        if (getExpire.length < 1 || getExpire[0].resetPasswordExpire < new Date()) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back')
        }
        var user = getExpire[0];
        if (req.body.password == req.body.confirmPassword) {
          // COMBAK: move the password hashing to module exports
          bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
            var resetPassword = 'UPDATE users SET password = ?, resetPasswordToken = ?, resetPasswordExpire =? WHERE resetPasswordToken = ?;'
            connection.query(resetPassword, [hash, null, null, req.params.token], (err) => {
              if (err) throw err;
              done(err, user)
            })
          })
        } else {
          req.flash('error', 'Passwords do not match.');
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
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], (err) => {
    if (err) return next(err);
    res.redirect('/login');
  });
});

// HOW TO USE ROUTE
router.get("/howto", (req, res) => {

})

// PAYMENT PLANS
router.get("/plans", (req, res) => {

})

// WIKI ROUTE
router.get("/wiki", (req, res) => {
  res.send("You have reached the wiki route");
})

module.exports = router;
