// charts declaration
const resultsStrategies     = document.getElementById('resultsStrategiesMonth').getContext('2d');
const strategiesRadar       = document.getElementById('resultsStrategiesRadar').getContext('2d');
const chartOutcomeFees      = document.getElementById('combOutcomeFees').getContext('2d');
const chartProfitDurability = document.getElementById('profitDurability').getContext('2d');
const chartProfitsAmount    = document.getElementById('profitNumberOfTrades').getContext('2d');

// sets colors on graph axes
var axesColor = 'rgba(0,0,0,0.1)'
var zeroLineColor = 'rgba(0, 0, 0, 0.5)'
if (darkMode) {
  axesColor = 'rgba(255,255,255,0.1)'
  zeroLineColor = 'rgba(255, 255, 255, 0.5)'
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

var comboOutcomeFees = new Chart(chartOutcomeFees, {
  type: 'horizontalBar',
    data: {
      labels: strategyFeesOutcome.strategies,
      datasets: [
        {
          label: "Revenue",
          data: strategyFeesOutcome.outcome,
          backgroundColor:'#FF8818',
        },
        {
          label: "Fees",
          data: strategyFeesOutcome.fees,
          backgroundColor: "#FFBA08"
        }
      ]
    },
    options: {
      scales: {
        xAxes: [{
          gridLines: {
            color: axesColor,
            zeroLineColor: zeroLineColor
          }
        }],
        yAxes: [{
          stacked: true,
          gridLines: {
            color: axesColor,
            zeroLineColor: axesColor
          },
          ticks: {
            beginAtZero: true
          }
        }]
      },
      legend: { display: false },
      responsive: true
    }
})

var profitDurability = new Chart(chartProfitDurability, {
  type: 'line',
  data: {
    labels: strategyOutcomeTime.durability,
    datasets: [{
      data: strategyOutcomeTime.outcome,
      borderColor: '#FF8818',
      backgroundColor: '#FF8818',
      fill: false
    }]
  },
  options: {
    scales: {
			xAxes: [{
				display: true,
				scaleLabel: {
					display: true,
					labelString: 'Duration'
				},
        gridLines: {
          color: axesColor,
          zeroLineColor: axesColor
        }
			}],
			yAxes: [{
				display: true,
				scaleLabel: {
					display: true,
					labelString: 'Profit'
				},
        ticks: {
          beginAtZero: true
        },
        gridLines: {
          color: axesColor,
          zeroLineColor: axesColor
        }
			}]
		},
    legend: { display: false },
    responsive: true
  }
})

var profitNumberOfTrades = new Chart(chartProfitsAmount, {
  type: 'bar',
  data: {
    labels: strategyAmountOutcome.strategy,
    datasets: [{
      type: 'line',
      label: 'Profits',
      borderColor: '#FFBA08',
      pointBackgroundColor: '#FFBA08',
      borderWidth: 2,
      fill: false,
      data: strategyAmountOutcome.outcome
    }, {
      type: 'bar',
      label: '# of Trades',
      backgroundColor: 'red',
      data: strategyAmountOutcome.amount,
      borderColor: '#F48C06',
      backgroundColor: '#F48C06',
      hoverBackgroundColor: '#F48C06',
      barThickness: 80
    }
  ]
  },
  options: {
    scales: {
      xAxes: [{
        gridLines: {
          color: axesColor,
          zeroLineColor: axesColor
        }
      }],
      yAxes: [{
        gridLines: {
          color: axesColor,
          zeroLineColor: axesColor
        }
      }],
    },
    responsive: true,
    legend: { display: false },
    tooltips: {
      mode: 'index',
      intersect: true
    }
  }
})

$(document).ready(() => {
  var labels = []
  var outcomeData = []
  for (const strategy in strategyGraph) {
    var color = randomColors[getRandomInt(randomColors.length)]
    resultsStrategiesMonth.data.datasets.push({
      backgroundColor: color,
      borderColor: color,
      pointBackgroundColor: color,
      fill: false,
      label: strategy,
      data: strategyGraph[strategy],
    })
    labels.push(strategy)
    outcomeData.push(strategyRadar[strategy])
  }
  resultsStrategiesMonth.update();
  resultsStrategiesRadar.data.labels = labels;
  var color = randomColors[getRandomInt(randomColors.length)];
  resultsStrategiesRadar.data.datasets.push({
    borderColor: color,
    pointBackgroundColor: color,
    data: outcomeData,
    fill: false
  })
  resultsStrategiesRadar.update();
})

// dropdown to select a time period for statistics
$('.dropdown-menu li').on('click', function() {
  var allDD = $('.dropdown-menu');
  var current = allDD.index($(this).parent())
  var getValue = $(this).text();
  $('.dropdown-select')[current].innerHTML = getValue;
});

// change the strategy data in statistics table
function changeStats(strategyID) {
  $.get('/' + username + '/statistics/strategies/load-stats/' + strategyID)
  .done((data) => {
    $('#revenue').text(data.strategyStats.revenue.toFixed(2))
    $('#fees').text(data.strategyStats.fees.toFixed(2))
    $('#profit').text(data.strategyStats.profit.toFixed(2))
    $('#return').text(data.strategyStats.str_return.toFixed(2))
    $('#max-win').text(data.strategyStats.max.toFixed(2))
    $('#max-loss').text(data.strategyStats.min.toFixed(2))
    $('#avg-win').text(data.strategyStats.avg_win.toFixed(2))
    $('#avg-loss').text(data.strategyStats.avg_loss.toFixed(2))
    $('#avg').text(data.strategyStats.avg.toFixed(2))
    $('#avg-hold').text(data.strategyStats.avg_holding.toFixed(2))
    $('#gross-loss').text(data.strategyStats.gross_loss.toFixed(2))
    $('#profit-factor').text(data.strategyStats.profit_factor.toFixed(2))
    $('#playoff-ratio').text(data.strategyStats.playoff.toFixed(2))
    $('#max-drawdown').text(data.strategyDrawdown.max_drawdown.toFixed(2))
    if (data.strategyCountWin != undefined) {
      $('#consec-win').text(data.strategyCountWin.numcount.toFixed(2))
    } else {
      $('#consec-win').text('N/A')
    }
    if (data.strategyCountLoss != undefined) {
      $('#consec-loss').text(data.strategyCountLoss.numcount.toFixed(2))
    } else {
      $('#consec-loss').text('N/A')
    }
  })
  .fail(() => {
    // fail
  })
}

function changeAvgs(strategyID) {
  $.get('/' + username + '/statistics/strategies/load-avgs/' + strategyID)
  .done((data) => {
    $('#avg-day').text(data.strategyAvgs.avg_daily.toFixed(2))
    $('#avg-week').text(data.strategyAvgs.avg_week.toFixed(2))
    $('#avg-month').text(data.strategyAvgs.avg_month.toFixed(2))
    $('#avg-win-day').text(data.strategyAvgs.avg_win_daily.toFixed(2))
    $('#avg-win-week').text(data.strategyAvgs.avg_win_week.toFixed(2))
    $('#avg-win-month').text(data.strategyAvgs.avg_win_month.toFixed(2))
    $('#avg-loss-day').text(data.strategyAvgs.avg_loss_daily.toFixed(2))
    $('#avg-loss-week').text(data.strategyAvgs.avg_win_week.toFixed(2))
    $('#avg-loss-month').text(data.strategyAvgs.avg_win_month.toFixed(2))
  })
  .fail(() => {
    // fail
  })
}

function changeGraphDurability(strategyID) {
  $.get('/' + username + '/statistics/strategies/load-graph/' + strategyID)
  .done((data) => {
    if (data.strategyOutcomeTime.outcome.length > 0) {
      $('#profitDurability').show()
      $('#no-data-durability').addClass('d-none')
      profitDurability.data.labels = data.strategyOutcomeTime.durability
      profitDurability.data.datasets[0].data = data.strategyOutcomeTime.outcome
      profitDurability.update();
    } else {
      $('#profitDurability').hide()
      $('#no-data-durability').removeClass('d-none')
    }
  })
  .fail(() => {
    // fail
  })
}
