// Program Dependencies
let express         = require('express'),
    app             = express(),
    methodOverride  = require('method-override'),
    bodyParser      = require('body-parser'),
    flash           = require('connect-flash'),
    passport        = require('passport'),
    passportConfig  = require('./models/passportConfig')
    expressSession  = require('express-session'),
    mysql           = require('mysql');

// Routes Dependencies
let indexRoutes     = require('./routes/index'),
    menuRoutes      = require('./routes/menu'),
    settingsRoutes  = require('./routes/settings')
    commentRoutes   = require('./routes/comments'),
    entryRoutes     = require('./routes/entries'),
    taRoutes        = require('./routes/tas'),
    backtestRoutes  = require('./routes/backtest');
    statisticsRoutes  = require('./routes/statistics');

// Configuration
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
// app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + "/public"))
app.use(express.json({ limit: '1mb' }));
app.use(flash());
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

// Connect to DB
var connection = mysql.createConnection({
  host    : 'localhost',
  user    : 'root',
  password: 'ripaltus',
  database: 'neilit_db',
  multipleStatements: true
});

// Set DB language to Spanish
// FIXME: how can you change DB on region/language
// FIXME: change DB language when changing Neilit language
var sqlToES = 'SET lc_time_names = "es_ES"';
connection.query(sqlToES, function(err) {
  if (err) throw err;
})

// Global Program Variable
// FIXME: set the rest of the varibles. Some are defined after LOGIN as assynchronously
// FIXME: can modules be grouped?
// FIXME: categories should be maped to pairs, but it cannot be pased to front-end JS
let pairs = require("./models/pairs");
let timeframes = require("./models/timeframes");
let categories = require("./models/categoriesPairs");
let strategies = require("./models/strategies")
// Store user strategies
// FIXME: merge these two lists into an object
global.userStrategies = [];
global.userIdStrategies = [];


// #### MIDDLEWARES ####
// MIDDLEWARE to have USER INFORMATION on all routes
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error")
  res.locals.success = req.flash("success")
  next();
})

app.use("/", indexRoutes);
app.use("/:profile", menuRoutes);
app.use("/:profile/settings", settingsRoutes);
app.use("/:profile/journal/comment", commentRoutes);
app.use("/:profile/journal/entry", entryRoutes);
app.use("/:profile/journal/ta", taRoutes);
app.use("/:profile/journal/backtest", backtestRoutes);
app.use("/:profile/statistics", statisticsRoutes)
// app.use("/:profile/details-entries", statisticsRoutes)

// PORT LISTENING
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Server has Started!');
})
