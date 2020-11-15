// Program Dependencies
let express         = require('express'),
    app             = express(),
    methodOverride  = require('method-override'),
    bodyParser      = require('body-parser'),
    flash           = require('connect-flash'),
    passport        = require('passport'),
    passportConfig  = require('./models/passportConfig'),
    db              = require('./models/dbConfig'),
    expressSession  = require('express-session');


// Routes Dependencies
let indexRoutes       = require('./routes/index'),
    menuRoutes        = require('./routes/menu'),
    dashboardRoutes   = require('./routes/dashboard'),
    settingsRoutes    = require('./routes/settings')
    commentRoutes     = require('./routes/comments'),
    entryRoutes       = require('./routes/entries'),
    taRoutes          = require('./routes/tas'),
    backtestRoutes    = require('./routes/backtest'),
    planRoutes        = require('./routes/plan'),
    statisticsRoutes  = require('./routes/statistics'),
    i18n              = require('./middleware/i18n.js');

// Configuration
app.set("view engine", "ejs");
app.use(express.urlencoded({limit: '50mb', extended: true}));
// app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + "/public"))
app.use(express.json({ limit: '50mb' }));
app.use(flash());
app.use(i18n);
// Configuration for AUTHENTICATION
app.use(expressSession({
  secret: 'neilit is the key to trading success',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
     secure: false,
     maxAge: 12 * 30 * 24 * 60 * 60 * 1000
 }
}))
app.use(passport.initialize());
app.use(passport.session());
passportConfig(passport);

// Global Program Variable
// FIXME: set the rest of the varibles. Some are defined after LOGIN as assynchronously
// FIXME: can modules be grouped?
// FIXME: categories should be maped to pairs, but it cannot be pased to front-end JS
let pairs = require("./models/pairs");
let categories = require("./models/categoriesPairs");
let strategies = require("./models/strategies");

// Store user strategies
// FIXME: merge these two lists into an object
global.userStrategies = [];
global.userIdStrategies = [];
global.notification = true;
global.language = 'en';
// #### MIDDLEWARES ####
// MIDDLEWARE to have USER INFORMATION on all routes
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error")
  res.locals.success = req.flash("success")
  next();
})

// COMBAK: set your secret key. Remember to switch to your live secret key in production!
const stripe = require('stripe')('sk_test_51HTTZyFaIcvTY5RCCdt6kRcZcNMwtjq13cAVcs6jWWvowXuRqXQKvFCK6pYG7Q8NRSy9NQ8uCjHADKAHd36Mfosx006ajk0pov');

// COMBAK: figure out what this part of the code does
app.post(
  '/stripe-webhook',
  bodyParser.raw({ type: 'application/json' }),
  async (req, res) => {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers['stripe-signature'],
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(err);
      console.log(`⚠️  Webhook signature verification failed.`);
      console.log(`⚠️  Check the env file and enter the correct webhook secret.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    const dataObject = event.data.object;

    // Handle the event
    // Review important events for Billing webhooks
    // https://stripe.com/docs/billing/webhooks
    // Remove comment to see the various objects sent for this sample
    switch (event.type) {
      case 'invoice.paid':
        // Used to provision services after the trial has ended.
        // The status of the invoice will show up as paid. Store the status in your
        // database to reference when a user accesses your service to avoid hitting rate limits.
        break;
      case 'invoice.payment_failed':
        // If the payment fails or the customer does not have a valid payment method,
        //  an invoice.payment_failed event is sent, the subscription becomes past_due.
        // Use this webhook to notify your user that their payment has
        // failed and to retrieve new card details.
        break;
      case 'customer.subscription.deleted':
        if (event.request != null) {
          // handle a subscription cancelled by your request
          // from above.
        } else {
          // handle subscription cancelled automatically based
          // upon your subscription settings.
        }
        break;
      default:
      // Unexpected event type
    }
    res.sendStatus(200);
  }
);

app.use("/", indexRoutes);
app.use("/:profile", menuRoutes);
app.use("/:profile/dashboard", dashboardRoutes);
app.use("/:profile/settings", settingsRoutes);
app.use("/:profile/journal/comment", commentRoutes);
app.use("/:profile/journal/entry", entryRoutes);
app.use("/:profile/journal/ta", taRoutes);
app.use("/:profile/journal/backtest", backtestRoutes);
app.use("/:profile/statistics", statisticsRoutes);
app.use("/:profile/plan", planRoutes);
// app.use("/:profile/details-entries", statisticsRoutes)

// PORT LISTENING
var port = process.env.PORT || 100;
app.listen(port, function() {
  console.log('Server has Started!');
})
