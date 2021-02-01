// charts declaration
const daysOpenResults = document.getElementById('resultsDayOpen').getContext('2d');
const daysCloseResults = document.getElementById('resultsDayClose').getContext('2d');

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

var resultsDayOpen = new Chart(daysOpenResults, {
  type: 'bar',
  data: {
    labels: weekDays,
    datasets: [{
      data: daysOutcomeEntry.outcome,
      label: 'Outcome',
      backgroundColor: [
        '#F94144',
        '#F8961E',
        '#F9844A',
        '#F9C747',
        '#90BE6D',
        '#43AA8B',
        '#4D908E',
        '#277DA1'
      ],
      borderWidth: 1,
      barThickness: 50,
    }]
  },
  options: {
    scales: {
      yAxes: [{
        gridLines: {
          color: axesColor,
          zeroLineColor: '#a6a6a6'
        }
      }],
      xAxes: [{
        gridLines: {
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

var resultsDayClose = new Chart(daysCloseResults, {
  type: 'bar',
  data: {
    labels: weekDays,
    datasets: [{
      data: daysOutcomeExit.outcome,
      label: 'Outcome',
      backgroundColor: [
        '#F94144',
        '#F8961E',
        '#F9844A',
        '#F9C747',
        '#90BE6D',
        '#43AA8B',
        '#4D908E',
        '#277DA1'
      ],
      borderWidth: 1,
      barThickness: 50,
    }]
  },
  options: {
    scales: {
      yAxes: [{
        gridLines: {
          color: axesColor,
          zeroLineColor: axesColor
        }
      }],
      xAxes: [{
        gridLines: {
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

// dropdown to select a time period for statistics
$('.dropdown-menu li').on('click', function() {
  var allDD = $('.dropdown-menu');
  var current = allDD.index($(this).parent())
  var getValue = $(this).text();
  $('.dropdown-select')[current].innerHTML = getValue;
});

// change the days data in statistics table
function changeStats(dayID) {
  $.get('/' + username + '/statistics/days/load-stats/' + dayID)
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
