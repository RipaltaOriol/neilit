var cryptoList = [
  'REP/USD', 'BAT/USD', 'BTC/USD', 'BCH/USD', 'ADA/USD', 'LINK/USD', 'DASH/USD', 'EOS/USD', 'ETH/USD', 'ETC/USD',
  'GNO/USD', 'ICX/USD', 'KNC/USD', 'LSK/USD', 'LTC/USD', 'XMR/USD', 'OMG/USD', 'XRP/USD', 'SC/USD', 'XLM/USD', 'STORJ/USD',
  'USDT/USD', 'XTZ/USD', 'TRX/USD', 'WAVES/USD', 'ZED/USD'
]

module.exports.getCryptoPairs = function(id) {
  var inserCryptoDB = []
  for (var i = 0; i < cryptoList.length; i++) {
    inserCryptoDB.push([cryptoList[i], 'Crypto', 1, id, 0])
  }
  return inserCryptoDB;
}
