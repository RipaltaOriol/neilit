// dependencies
let fetch = require('node-fetch');

// global variables
let pairs = require('../models/pairs');
let db    = require('../models/dbConfig');

module.exports.convert = async (req, res) => {
  if (!req.session.assets[req.body.pair].rate) {
    return res.json({
      status: 'error',
      message: res.__('calculatorNoRate')
    })
  }
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

  switch (req.session.assets[req.body.pair].category) {
    case 'Forex':
      let positionSize = req.body.amount_risk / req.body.stop_loss
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
      Promise.all([
        fetch(`https://api.exchangeratesapi.io/latest?base=${req.body.account}`).then(value => value.json()),
        fetch(`http://api.coinlayer.com/api/live?access_key=${process.env.COINLAYER_KEY}`).then(value => value.json())
      ]).then((data) => {
        // FIXME: this code only works for current cypto (all against USD)
        var positionSize = req.body.amount_risk * data[0].rates[req.body.quote] / (req.body.stop_loss / 100)
        return res.json({
          status: 'success',
          units: (positionSize / data[1].rates[req.body.base]).toFixed(8),
          lots: 'N/A'
        })
      })
      .catch((err) => {
        // error
      })
      break;
  }
}
