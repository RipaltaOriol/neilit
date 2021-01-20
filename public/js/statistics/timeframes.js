// charts declaration
const timeframeRatioResults = document.getElementById('resultsRatioTimeframeCount').getContext('2d');
const timeframePerformanceResults = document.getElementById('resultsPerformanceTimeframes').getContext('2d');

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

var resultsRatioTimeframeCount = new Chart(timeframeRatioResults, {
  type: 'bar',
  data: {
    datasets: [{
      label: 'Win Rate',
      borderWidth: 1,
      barThickness: 50,
    }]
  },
  options: {
    scales: {
      yAxes: [{
        gridLines: {
          display: true,
          color: axesColor,
          zeroLineColor: axesColor
        },
        ticks: {
          min: 0,
          max: 1
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
    legend: {
      display: false
    },
    responsive: true,
    maintainAspectRatio: false
  }
})

var resultsPerformanceTimeframes = new Chart(timeframePerformanceResults, {
  type: 'pie',
  data: {
    labels: bestTimeframesGraph.timeframes,
    datasets: [{
      data: bestTimeframesGraph.outcome,
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


$(document).ready(() => {
  var labels = []
  var rates = []
  var chartColors = []
  timeframesWinRate.forEach((timeframe) => {
    labels.push(timeframe.timeframe)
    rates.push(timeframe.win_rate)
    chartColors.push(randomColors[getRandomInt(randomColors.length)])
  })
  resultsRatioTimeframeCount.data.labels = labels;
  resultsRatioTimeframeCount.data.datasets[0].data = rates
  resultsRatioTimeframeCount.data.datasets[0].backgroundColor = chartColors
  resultsRatioTimeframeCount.update();
})
