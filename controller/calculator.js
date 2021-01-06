// dependencies
let fetch = require('node-fetch');

// global variables
let pairs = require('../models/pairs');
let db    = require('../models/dbConfig');

module.exports.convert = async (req, res) => {
  if ((req.body.amount == '' || req.body.risk == '') && req.body.amount_risk == '') {
    return res.json({
      status: 'error',
      message: res.__('calculatorErrorRisk')
    })
  }
  if (req.body.stop_loss == '') {
    return res.json({
      status: 'error',
      message: res.__('calculatorErrorSL')
    })
  }
  if (req.body.amount != '' && req.body.risk != '') {
    req.body.amount_risk = (req.body.risk / 100) * req.body.amount
  }

  let positionSize = req.body.amount_risk / req.body.stop_loss
  switch (pairs.get(req.body.pair).category) {
    case 'Forex':
      await fetch(`https://api.exchangeratesapi.io/latest?base=${req.body.account}`)
        .then(response => response.json())
        .then((data) => {
          var pipValue;
          if (req.body.account == req.body.quote) {
            pipValue = 0.1;
          } else if (req.body.quote == 'JPY') {
            pipValue = data.rates[req.body.quote] / 1000;
          } else {
            pipValue = data.rates[req.body.quote] / 10;
          }
          var lotSize = positionSize * pipValue
          if (isNaN(lotSize)) {
            // error
          }
          return res.json({
            status: 'success',
            units: (lotSize * 100000).toFixed(0),
            lots: lotSize.toFixed(3)
          })
        })
        .catch((err) => {
          // error
        })
      break;
    case 'Crypto':

      break;
  }
}
