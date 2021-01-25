module.exports.createEntry = (req, res) => {
  res.render("resources/create-entry");
}

module.exports.createBacktest = (req, res) => {
  res.render("resources/create-backtest")
}

module.exports.addStrategies = (req, res) => {
  res.render("resources/add-strategies")
}

module.exports.linkTechnicalAnalysisToEntry = (req, res) => {
  res.render("resources/link-ta-entry")
}

module.exports.createTechnicalAnalysis = (req, res) => {
  res.render("resources/create-ta")
}

module.exports.manageAssets = (req, res) => {
  res.render("resources/manage-assets")
}

module.exports.customStatistics = (req, res) => {
  res.render("resources/custom-statistics")
}
