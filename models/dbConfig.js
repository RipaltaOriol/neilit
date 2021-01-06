// Requires MySQL
let mysql = require('mysql');

// Connect to DB
// var connection = mysql.createConnection({
//   host    : 'db-production-neilit-1015-do-user-8160676-0.b.db.ondigitalocean.com',
//   user    : 'doadmin',
//   password: 'nkuvuinnuvg3zvij',
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
    console.log('Connection failed!');
    console.log('Error connecting: ' + err.stack);
    throw err;
  };
})

module.exports = connection;
