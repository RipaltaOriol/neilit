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

// dropdown to select a time period for statistics
$('.dropdown-menu li').on('click', function() {
  var allDD = $('.dropdown-menu');
  var current = allDD.index($(this).parent())
  var getValue = $(this).text();
  $('.dropdown-select')[current].innerHTML = getValue;
});

// change the timeframe data in statistics table
function changeStats(timeframeID) {
  $.get('/' + username + '/statistics/timeframes/load-stats/' + timeframeID)
  .done((data) => {
    $('#revenue').text(data.timeframeStats.revenue.toFixed(2))
    $('#fees').text(data.timeframeStats.fees.toFixed(2))
    $('#profit').text(data.timeframeStats.profit.toFixed(2))
    $('#return').text(data.timeframeStats.str_return.toFixed(2))
    $('#max-win').text(data.timeframeStats.max.toFixed(2))
    $('#max-loss').text(data.timeframeStats.min.toFixed(2))
    $('#avg-win').text(data.timeframeStats.avg_win.toFixed(2))
    $('#avg-loss').text(data.timeframeStats.avg_loss.toFixed(2))
    $('#avg').text(data.timeframeStats.avg.toFixed(2))
    $('#avg-hold').text(data.timeframeStats.avg_holding.toFixed(2))
    $('#gross-loss').text(data.timeframeStats.gross_loss.toFixed(2))
    $('#profit-factor').text(data.timeframeStats.profit_factor.toFixed(2))
    $('#playoff-ratio').text(data.timeframeStats.playoff.toFixed(2))
    $('#max-drawdown').text(data.timeframeDrawdown.max_drawdown.toFixed(2))
    if (data.timeframeCountWin != undefined) {
      $('#consec-win').text(data.timeframeCountWin.numcount.toFixed(2))
    } else {
      $('#consec-win').text('N/A')
    }
    if (data.timeframeCountLoss != undefined) {
      $('#consec-loss').text(data.timeframeCountLoss.numcount.toFixed(2))
    } else {
      $('#consec-loss').text('N/A')
    }
  })
  .fail(() => {
    // fail
  })
}

function changeAvgs(timeframeID) {
  $.get('/' + username + '/statistics/timeframes/load-avgs/' + timeframeID)
  .done((data) => {
    $('#avg-day').text(data.timeframeAvgs.avg_daily.toFixed(2))
    $('#avg-week').text(data.timeframeAvgs.avg_week.toFixed(2))
    $('#avg-month').text(data.timeframeAvgs.avg_month.toFixed(2))
    $('#avg-win-day').text(data.timeframeAvgs.avg_win_daily.toFixed(2))
    $('#avg-win-week').text(data.timeframeAvgs.avg_win_week.toFixed(2))
    $('#avg-win-month').text(data.timeframeAvgs.avg_win_month.toFixed(2))
    $('#avg-loss-day').text(data.timeframeAvgs.avg_loss_daily.toFixed(2))
    $('#avg-loss-week').text(data.timeframeAvgs.avg_win_week.toFixed(2))
    $('#avg-loss-month').text(data.timeframeAvgs.avg_win_month.toFixed(2))
  })
  .fail(() => {
    // fail
  })
}


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
