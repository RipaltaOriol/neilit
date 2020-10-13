// sets colours on graph axes
var axesColor = 'rgba(0,0,0,0.1)'
if (currentUser.darkMode) {
  axesColor = 'rgba(255,255,255,0.1)'
}

// stores a palette of colours
var randomColors = [
  '#63D471',
  '#63A46C',
  '#69FFF1',
  '#628395',
  '#78586F',
  '#D55672',
  '#00FFC5',
  '#ADF5FF',
  '#0075A2',
  '#2F4B7C',
  '#665191',
  '#A05191',
  '#D45087',
  '#F95D6A',
  '#FF7C43',
  '#FFA600'
]

// gnerates a random color between 0 and the [max - 1]
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// generates strategies x month outcome chart
const resultsStrategies = document.getElementById('resultsStrategiesMonth');
if (resultsStrategies != null) {
  resultsStrategies.getContext('2d');
  var resultsStrategiesMonth = new Chart(resultsStrategies, {
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
}

// generates strategies outcome radar chart
const strategiesRadar = document.getElementById('resultsStrategiesRadar');
if (strategiesRadar != null) {
  strategiesRadar.getContext('2d');
  var resultsStrategiesRadar = new Chart(strategiesRadar, {
    type: 'radar',
    options: {
      scale: {
        angleLines: {
          display: false
        },
        gridLines: {
          color: axesColor
        }
      },
      legend: {
        display: false
      }
    }
  })
}

// generates open day's outcome bar chart
const daysOpenResults = document.getElementById('resultsDayOpen');
if (daysOpenResults != null) {
  daysOpenResults.getContext('2d');
  var resultsDayOpen = new Chart(daysOpenResults, {
    type: 'bar',
    data: {
      labels: weekDays,
      datasets: [{
        label: 'Outcome',
        backgroundColor: [
          'rgba(99, 212, 113, 0.2)',
          'rgba(105, 255, 241, 0.2)',
          'rgba(98, 131, 149, 0.2)',
          'rgba(213, 86, 114, 0.2)',
          'rgba(173, 245, 255, 0.2)',
          'rgba(255, 124, 67, 0.2)',
          'rgba(255, 166, 0, 0.2)'
        ],
        borderColor: [
          'rgba(99, 212, 113, 1)',
          'rgba(105, 255, 241, 1)',
          'rgba(98, 131, 149, 1)',
          'rgba(213, 86, 114, 1)',
          'rgba(173, 245, 255, 1)',
          'rgba(255, 124, 67, 1)',
          'rgba(255, 166, 0, 1)'
        ],
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
}

// generates close day's outcome bar chart
const daysCloseResults = document.getElementById('resultsDayClose');
if (daysCloseResults != null) {
  daysCloseResults.getContext('2d');
  var resultsDayClose = new Chart(daysCloseResults, {
    type: 'bar',
    data: {
      labels: weekDays,
      datasets: [{
        label: 'Outcome',
        backgroundColor: [
          'rgba(99, 212, 113, 0.2)',
          'rgba(105, 255, 241, 0.2)',
          'rgba(98, 131, 149, 0.2)',
          'rgba(213, 86, 114, 0.2)',
          'rgba(173, 245, 255, 0.2)',
          'rgba(255, 124, 67, 0.2)',
          'rgba(255, 166, 0, 0.2)'
        ],
        borderColor: [
          'rgba(99, 212, 113, 1)',
          'rgba(105, 255, 241, 1)',
          'rgba(98, 131, 149, 1)',
          'rgba(213, 86, 114, 1)',
          'rgba(173, 245, 255, 1)',
          'rgba(255, 124, 67, 1)',
          'rgba(255, 166, 0, 1)'
        ],
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
}

// generates most traded timeframes win ratio bar chart
const timeframeRatioResults = document.getElementById('resultsRatioTimeframeCount');
if (timeframeRatioResults != null) {
  timeframeRatioResults.getContext('2d');
  var resultsRatioTimeframeCount = new Chart(timeframeRatioResults, {
    type: 'bar',
    data: {
      datasets: [{
        label: 'Win Rate',
        backgroundColor: [
          'rgba(99, 212, 113, 0.2)',
          'rgba(105, 255, 241, 0.2)',
          'rgba(98, 131, 149, 0.2)',
          'rgba(213, 86, 114, 0.2)',
          'rgba(173, 245, 255, 0.2)',
          'rgba(255, 124, 67, 0.2)',
          'rgba(255, 166, 0, 0.2)'
        ],
        borderColor: [
          'rgba(99, 212, 113, 1)',
          'rgba(105, 255, 241, 1)',
          'rgba(98, 131, 149, 1)',
          'rgba(213, 86, 114, 1)',
          'rgba(173, 245, 255, 1)',
          'rgba(255, 124, 67, 1)',
          'rgba(255, 166, 0, 1)'
        ],
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
}

// generates best performing timeframes pie charts
const timeframePerformanceResults = document.getElementById('resultsPerformanceTimeframes');
if (timeframePerformanceResults != null) {
  timeframePerformanceResults.getContext('2d');
  var resultsPerformanceTimeframes = new Chart(timeframePerformanceResults, {
    type: 'pie',
    data: {
      datasets: [{
        backgroundColor: [
          'rgba(99, 212, 113, 0.2)',
          'rgba(105, 255, 241, 0.2)',
          'rgba(98, 131, 149, 0.2)',
          'rgba(213, 86, 114, 0.2)',
          'rgba(173, 245, 255, 0.2)',
          'rgba(255, 124, 67, 0.2)',
          'rgba(255, 166, 0, 0.2)'
        ],
        hoverBorderColor: [
          'rgba(99, 212, 113, 1)',
          'rgba(105, 255, 241, 1)',
          'rgba(98, 131, 149, 1)',
          'rgba(213, 86, 114, 1)',
          'rgba(173, 245, 255, 1)',
          'rgba(255, 124, 67, 1)',
          'rgba(255, 166, 0, 1)'
        ],
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
}

// generates strategies x month outcome chart
const resultsAssets = document.getElementById('resultsAssetsMonth');
if (resultsAssets != null) {
  resultsAssets.getContext('2d');
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
}

// generates best performing assets pie charts
const assetPerformanceResults = document.getElementById('resultsPerformanceAssets');
if (assetPerformanceResults != null) {
  assetPerformanceResults.getContext('2d');
  var resultsPerformanceAssets = new Chart(assetPerformanceResults, {
    type: 'pie',
    data: {
      datasets: [{
        backgroundColor: [
          'rgba(99, 212, 113, 0.2)',
          'rgba(105, 255, 241, 0.2)',
          'rgba(98, 131, 149, 0.2)',
          'rgba(213, 86, 114, 0.2)',
          'rgba(173, 245, 255, 0.2)',
          'rgba(255, 124, 67, 0.2)',
          'rgba(255, 166, 0, 0.2)'
        ],
        hoverBorderColor: [
          'rgba(99, 212, 113, 1)',
          'rgba(105, 255, 241, 1)',
          'rgba(98, 131, 149, 1)',
          'rgba(213, 86, 114, 1)',
          'rgba(173, 245, 255, 1)',
          'rgba(255, 124, 67, 1)',
          'rgba(255, 166, 0, 1)'
        ],
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
}

// generates worse performing assets pie charts
const assetWorseResults = document.getElementById('resultsWorseAssets');
if (assetWorseResults != null) {
  assetWorseResults.getContext('2d');
  var resultsWorseAssets = new Chart(assetWorseResults, {
    type: 'pie',
    data: {
      datasets: [{
        backgroundColor: [
          'rgba(99, 212, 113, 0.2)',
          'rgba(105, 255, 241, 0.2)',
          'rgba(98, 131, 149, 0.2)',
          'rgba(213, 86, 114, 0.2)',
          'rgba(173, 245, 255, 0.2)',
          'rgba(255, 124, 67, 0.2)',
          'rgba(255, 166, 0, 0.2)'
        ],
        hoverBorderColor: [
          'rgba(99, 212, 113, 1)',
          'rgba(105, 255, 241, 1)',
          'rgba(98, 131, 149, 1)',
          'rgba(213, 86, 114, 1)',
          'rgba(173, 245, 255, 1)',
          'rgba(255, 124, 67, 1)',
          'rgba(255, 166, 0, 1)'
        ],
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
}

$(document).ready(() => {
  // injects strategies monthly outcome to graph
  if (typeof strategyStats !== 'undefined') {
    var labels = []
    var outcomeData = []
    for (const strategy in strategyStats) {
      var color = randomColors[getRandomInt(randomColors.length)]
      resultsStrategiesMonth.data.datasets.push({
        backgroundColor: color,
        borderColor: color,
        pointBackgroundColor: color,
        fill: false,
        label: strategyStats[strategy].name,
        data: strategyStats[strategy].month,
      });
      labels.push(strategyStats[strategy].name)
      outcomeData.push(strategyStats[strategy].outcome)
    }
    resultsStrategiesMonth.update();
    resultsStrategiesRadar.data.labels = labels;
    var color = randomColors[getRandomInt(randomColors.length)];
    resultsStrategiesRadar.data.datasets.push({
      borderColor: color,
      pointBackgroundColor: color,
      data: outcomeData
    })
    resultsStrategiesRadar.update();
  }
  // injects open days outcome graph
  if (typeof daysOpenStats !== 'undefined') {
    let data = []
    daysOpenStats.forEach((day) => {
      data.push(day.outcome)
    })
    resultsDayOpen.data.datasets[0].data = data
    resultsDayOpen.update();
  }
  // injects close days outcome graph
  if (typeof daysCloseStats !== 'undefined') {
    resultsDayClose.data.datasets[0].data = daysCloseStats
    resultsDayClose.update();
  }
  // injects win rate of most traded timeframes graph
  if (typeof tfByCount !== 'undefined') {
    var labels = []
    var rates = []
    tfByCount.forEach((tf, i) => {
      labels.push(timeframes[tf[1]])
      if (timeframeStats.quantity[i] > 0) {
        rates.push(Math.round(timeframeStats.win[tf[1]] / tf[0] * 100) / 100)
      } else {
        rates.push(0)
      }
    });

    resultsRatioTimeframeCount.data.labels = labels;
    resultsRatioTimeframeCount.data.datasets[0].data = rates
    resultsRatioTimeframeCount.update();
  }
  // injects win rate of most traded timeframes graph
  if (typeof tfByOutcome !== 'undefined') {
    var labels = []
    var outcome = []
    tfByOutcome.forEach((tf, i) => {
      labels.push(timeframes[tf[1]])
      outcome.push(timeframeStats.amount[tf[1]]);
    });
    resultsPerformanceTimeframes.data.labels = labels;
    resultsPerformanceTimeframes.data.datasets[0].data = outcome;
    resultsPerformanceTimeframes.update();
  }
  // injects assets monthly outcome to graph
  if (typeof assetsByCount !== 'undefined') {
    var labels = []
    var outcomeData = []
    assetsByCount.forEach((id) => {
      var color = randomColors[getRandomInt(randomColors.length)]
      resultsAssetsMonth.data.datasets.push({
        backgroundColor: color,
        borderColor: color,
        pointBackgroundColor: color,
        fill: false,
        label: pairs[id - 1],
        data: assetStats.month[id - 1],
      });
    });
    resultsAssetsMonth.update();
  }
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
  // injects worse assets pie graph
  if (typeof assetsByOutcomeWorse !== 'undefined') {
    var labels = []
    var outcome = []
    assetsByOutcomeWorse.forEach((id) => {
      labels.push(pairs[id - 1])
      outcome.push(assetStats.amount[id - 1]);
    });
    console.log(labels);
    console.log(outcome);
    resultsWorseAssets.data.labels = labels;
    resultsWorseAssets.data.datasets[0].data = outcome;
    resultsWorseAssets.update();
  }
})
