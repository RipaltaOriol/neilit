// This file contains/calls global variables.
// Calls: all PLANS available
// Connect to DB
let db = require('./dbConfig')

// Create the variable that will be returned
var plansIdList = {
  id: [],
  price_id: []
};
// Query to the DB
db.query("SELECT id, price_id FROM roles", (err, results) => {
  if (err) throw err;
  results.forEach((result) => {
    plansIdList.id.push(result.id);
    plansIdList.price_id.push(result.price_id);
  });
})

module.exports = plansIdList;
