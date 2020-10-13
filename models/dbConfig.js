// Requires MySQL
let mysql = require('mysql');

// Connect to DB
var connection = mysql.createConnection({
  host    : 'private-db-production-neilit-1015-do-user-8160676-0.b.db.ondigitalocean.com',
  user    : 'doadmin',
  password: 'nkuvuinnuvg3zvij',
  port    : 25060,
  database: 'defaultdb',
  multipleStatements: true,
  queryTimeout: 6000,
  connectTimeout: 60000,
});

connection.connect((err) => {
  console.log('Connection failed!');
  console.log('Error connecting: ' + err.stack);
  if (err) throw err;
})

module.exports = connection;
