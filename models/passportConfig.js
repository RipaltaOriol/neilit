// Load necessary requirements and connenctions
var LocalStrategy  = require('passport-local').Strategy;
var mysql           = require('mysql');

// Connect to DB
var connection = mysql.createConnection({
  host    : 'localhost',
  user    : 'root',
  password: 'ripaltus',
  database: 'neilit_db',
  multipleStatements: true
});


// Start AUTHENTICATION
// Expose this function to APP.JS
module.exports = function(passport) {

  // Passport Session Setup
  // Serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // Deserialize the user for the session
  passport.deserializeUser(function(id, done) {
    connection.query('SELECT * FROM users WHERE id = ?', id, (err, rows) => {
      if (err) throw err;
      done(err, rows[0]);
    });
  });

  // Local SIGNUP
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done) {
    console.log(req.body.username);
    console.log(req.body.password);
    connection.query('SELECT * FROM users WHERE email = ?', email, function(err, rows) {
      console.log(rows);
      console.log('above row object');
      if (err) return done(err);
      if (rows.length) {
        return done(null, false) // after false you can pass your flash message
      } else {
        // Create user if no user with that email exists
        var newUserMysql = new Object();
        newUserMysql.username = req.body.username;
        newUserMysql.email = email;
        newUserMysql.name = req.body.name;
        newUserMysql.surname = req.body.surname;
        // FIXME: the current user model contains no generateHash function
        newUserMysql.password = password // use the generateHash function in our user model
        var insertQuery = "INSERT INTO users SET ?";
        // FIXME: newUserInsert has to be created: it doesn't exists
        connection.query(insertQuery, newUserMysql, (err, rows) => {
          if (err) throw err;
          newUserMysql.id = rows.insertId;
          // FIXME: do NOT retrun the password inside this Object
          // FIXME: build a new Object with required info only (i.e. id, username, mail, etc)
          return done(null, newUserMysql)
        });
      }
    });
  }));
  // Local LOGIN
  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done) {
    connection.query("SELECT * FROM users WHERE email = ?", email, (err, rows) => {
      if (err) return done(err);
      if (!rows.length) {
      // User not found
        return done (null,false); // after false you can pass your flash message
      }
      // User found but wrong password
      if (!(rows[0].password == password)) {
        return done(null, false) // after false you can pass your flash message [WRONG]
      } else {
      // Successful login
        return done(null, rows[0]);
      }
    });
  }));
};
