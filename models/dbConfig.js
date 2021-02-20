// dependencies
let mysql   = require('mysql');
let logger  = require('./winstonConfig')

// Connect to DB
// var connection = mysql.createConnection({
//   host    : 'db-production-neilit-1015-do-user-8160676-0.b.db.ondigitalocean.com',
//   user    : 'doadmin',
//   password: process.env.DB_PASS,
//   port    : 25060,
//   database: 'defaultdb',
//   multipleStatements: true
// });

var connection = mysql.createConnection({
  host    : process.env.DB_HOST,
  user    : process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'neilit_db',
  multipleStatements: true
});

connection.connect((err) => {
  if (err) {
    logger.error({
      message: 'DB CONFIG could not connect to the DB',
      endpoint: 'N/A',
      programMsg: err.stack
    })
  }
})

module.exports = connection;
