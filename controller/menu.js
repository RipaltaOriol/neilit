let pairs         = require('../models/pairs');
let currencies    = require('../models/currencies');
let categories    = require('../models/categoriesPairs');
let db            = require('../models/dbConfig');

// settings controller
module.exports.settings = async (req, res) => {
  var selectGoals = 'SELECT goal FROM goals WHERE user_id = ?';
  var selectRole = 'SELECT role FROM roles WHERE id = ?';
  var selectPaymentInfo = 'SELECT last4 from stripe_users WHERE user_id = ?';
  let invoice;
  if (req.user.stripeSubscriptionId) {
    invoice = await stripe.invoices.retrieveUpcoming({
      customer: req.user.stripeCustomerId,
      subscription: req.user.stripeSubscriptionId
    });
  } else {
    invoice = { total: 0, next_payment_attempt: 0 }
  }
  var goals = []
  db.query(selectGoals, req.user.id, (err, getGoals) => {
    getGoals.forEach((result) => {
      goals.push(result.goal)
    });
    db.query(selectRole, req.user.role_id, (err, getRole) => {
      if (err) {
        // COMBAK: log error
        req.flash('error', res.__('Something went wrong, please try again.'))
        return res.redirect('/' + req.user.username);
      };
      var role = getRole[0].role;
      db.query(selectPaymentInfo, req.user.id, (err, getPaymentInfo) => {
        if (err) {
          // COMBAK: log error
          req.flash('error', res.__('Something went wrong, please try again.'))
          return res.redirect('/' + req.user.username);
        }
        if (getPaymentInfo.length > 0) { var last4 = getPaymentInfo[0].last4 } else { var last4 = null }
        res.render("user/settings",
          {
            currencies: currencies,
            goals: goals,
            role: role,
            last: last4,
            amount: invoice.total,
            next: invoice.next_payment_attempt
          }
        );
      })
    })
  })
}
