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
