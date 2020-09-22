// This file contains/calls global variables.
// Calls: all PLANS available
// Connect to DB
var mysql = require('mysql');
var connection = mysql.createConnection({
  host    : 'localhost',
  user    : 'root',
  password: 'ripaltus',
  database: 'neilit_db',
  multipleStatements: true
});

// Create the variable that will be returned
var plansIdList = {
  id: [],
  price_id: []
};
// Query to the DB
connection.query("SELECT id, price_id FROM roles", (err, results) => {
  if (err) throw err;
  results.forEach((result) => {
    plansIdList.id.push(result.id);
    plansIdList.price_id.push(result.price_id);
  });
})

module.exports = plansIdList;
