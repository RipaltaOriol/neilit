// MIDDLEWARE METHODS
var middlewareObj = { };

// AUTHENTICATION MIDDLEWARE
middlewareObj.isLoggedIn = function (req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error", "You must create an account to perform this action!")
    res.redirect("/signup");
  }
}

module.exports = middlewareObj
