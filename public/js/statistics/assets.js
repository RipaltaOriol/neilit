// charts declaration
const resultsAssets = document.getElementById('resultsAssetsMonth').getContext('2d');
const assetPerformanceResults = document.getElementById('resultsPerformanceAssets').getContext('2d');
const assetWorseResults = document.getElementById('resultsWorseAssets').getContext('2d');

// sets colors on graph axes
var axesColor = 'rgba(0,0,0,0.1)'
if (darkMode) {
  axesColor = 'rgba(255,255,255,0.1)'
}

// stores a palette of colours
var randomColors = [
  '#F94144',
  '#F8961E',
  '#F9844A',
  '#F9C747',
  '#90BE6D',
  '#43AA8B',
  '#4D908E',
  '#277DA1'
]

// gnerates a random color between 0 and the [max - 1]
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

var resultsAssetsMonth = new Chart(resultsAssets, {
  type: 'line',
  data: {
    labels: months
  },
  options: {
    scales: {
      yAxes: [{
        gridLines: {
          display: true,
          color: axesColor,
          zeroLineColor: axesColor
        }
      }],
      xAxes: [{
        gridLines: {
          display: true,
          color: axesColor,
          zeroLineColor: axesColor
        }
      }]
    },
    responsive: true,
    maintainAspectRatio: false
  }
})


// injects best assets pie graph
if (typeof assetsByOutcomeBest !== 'undefined') {
  var labels = []
  var outcome = []
  assetsByOutcomeBest.forEach((id) => {
    labels.push(pairs[id - 1])
    outcome.push(assetStats.amount[id - 1]);
  });
  resultsPerformanceAssets.data.labels = labels;
  resultsPerformanceAssets.data.datasets[0].data = outcome;
  resultsPerformanceAssets.update();
}

var resultsPerformanceAssets = new Chart(assetPerformanceResults, {
  type: 'pie',
  data: {
    labels: bestAssetsGraph.assets,
    datasets: [{
      data: bestAssetsGraph.outcome,
      backgroundColor: [
        '#D8F3DC',
        '#B7E4C7',
        '#95D5B2',
        '#74C69D',
        '#52B788',
        '#40916C',
        '#2D6A4F'
      ],
      hoverBorderColor: undefined,
    }]
  },
  options: {
    legend: {
      display: false
    },
    responsive: true,
    maintainAspectRatio: false
  }
})

var resultsWorseAssets = new Chart(assetWorseResults, {
  type: 'pie',
  data: {
    labels: worseAssetsGraph.assets,
    datasets: [{
      data: worseAssetsGraph.outcome,
      backgroundColor: [
        '#DCACE8',
        '#D099E3',
        '#C586DD',
        '#B973D8',
        '#AE60D3',
        '#A24CCD',
        '#9739C8'
      ],
      hoverBorderColor: undefined,
    }]
  },
  options: {
    legend: {
      display: false
    },
    responsive: true,
    maintainAspectRatio: false
  }
})

$(document).ready(() => {
  var labels = []
  var outcomeData = []
  for (const asset in assetsGraph) {
    var color = randomColors[getRandomInt(randomColors.length)]
    resultsAssetsMonth.data.datasets.push({
      backgroundColor: color,
      borderColor: color,
      pointBackgroundColor: color,
      fill: false,
      label: asset,
      data: assetsGraph[asset],
    })
    labels.push(asset)
  }
  resultsAssetsMonth.update();
})
