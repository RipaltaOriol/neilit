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

// search bar for the dropdown
function searchDropdown(id) {
  var input, search, dropdownItems, val;
  var allDD = $('.dropdown-menu');
  var current = allDD.index(id.parentElement)
  input = document.getElementsByClassName('dropdown-search')[current];
  search = input.value.toUpperCase();
  dropdownItems = document.getElementsByClassName('dropdown-menu')[current].querySelectorAll('li, ol');
  for (var i = 0; i < dropdownItems.length; i++) {
    val = dropdownItems[i].textContent || dropdownItems[i].innerText;
    if (val.toUpperCase().indexOf(search) > -1) {
      dropdownItems[i].style.display = "";
    } else {
      dropdownItems[i].style.display = "none";
    }
  }
}

// dropdown to select a time period for statistics
$('.dropdown-menu li').on('click', function() {
  var allDD = $('.dropdown-menu');
  var current = allDD.index($(this).parent())
  var getValue = $(this).text();
  $('.dropdown-select')[current].innerHTML = getValue;
});

// change the strategy data in statistics table
function changeStats(assetID) {
  $.get('/' + username + '/statistics/assets/load-stats/' + assetID)
  .done((data) => {
    $('#revenue').text(data.strategyStats.revenue.toFixed(2) + ' ' + userCurrency)
    $('#fees').text(data.strategyStats.fees.toFixed(2) + ' ' + userCurrency)
    $('#profit').text(data.strategyStats.profit.toFixed(2) + ' ' + userCurrency)
    $('#return').text(data.strategyStats.str_return.toFixed(2) + ' %')
    $('#max-win').text(data.strategyStats.max.toFixed(2) + ' ' + userCurrency)
    $('#max-loss').text(data.strategyStats.min.toFixed(2) + ' ' + userCurrency)
    $('#avg-win').text(data.strategyStats.avg_win.toFixed(2) + ' ' + userCurrency)
    $('#avg-loss').text(data.strategyStats.avg_loss.toFixed(2) + ' ' + userCurrency)
    $('#avg').text(data.strategyStats.avg.toFixed(2) + ' ' + userCurrency)
    $('#avg-hold').text(data.strategyStats.avg_holding.toFixed(2) + ' days')
    $('#gross-loss').text(data.strategyStats.gross_loss.toFixed(2) + ' ' + userCurrency)
    $('#profit-factor').text(data.strategyStats.profit_factor.toFixed(2))
    $('#playoff-ratio').text(data.strategyStats.playoff.toFixed(2))
    $('#max-drawdown').text(data.strategyDrawdown.max_drawdown.toFixed(2) + ' ' + userCurrency)
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

function changeAvgs(assetID) {
  $.get('/' + username + '/statistics/assets/load-avgs/' + assetID)
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

// manages the spinner on loading processes
function loadingState(bool) {
  if (bool) {
    $('#spinner').removeClass('d-none')
  } else {
    $('#spinner').addClass('d-none')
  }
}

// Infinite scroll
let loadedCount = 25;
$('.table-scroll').scroll(() => {
  var $el = $('.table-scroll');
  var $eh = $('.table-scroll')[0];
  if ($el.innerHeight() + $el.scrollTop() >= $eh.scrollHeight - 5 && loadedCount) {
    var data = {
      offset: loadedCount
    }
    loadingState(true);
    $.post('/' + username + '/statistics/assets/load-assets/', data)
      .done((data) => {
        loadedCount+= 25;
        loadingState(false);
        // add new data to index table
        var table = $('tbody')[0];
        data.dataList.forEach((asset) => {
          var newRow = table.insertRow();
          var pair    = newRow.insertCell(0);
          var entries = newRow.insertCell(1);
          var avg     = newRow.insertCell(2);
          var win     = newRow.insertCell(3);
          var be      = newRow.insertCell(4);
          var loss    = newRow.insertCell(5);
          var winRate = newRow.insertCell(6);
          var expect  = newRow.insertCell(7);
          // adds acutal data
          pair.innerHTML = '<a href="!#" class="grey">' + asset.pair + '</a>';
          entries.innerHTML = asset.entries
          if (asset.avg_return > 0) {
            avg.innerHTML = '<span class="mb-0 pill pill-green">' + asset.avg_return.toFixed(2) + '</span>'
          } else {
            avg.innerHTML = '<span class="mb-0 pill pill-red">' + asset.avg_return.toFixed(2) + '</span>'
          }
          win.innerHTML = asset.win;
          be.innerHTML = asset.be;
          loss.innerHTML = asset.loss;
          winRate.innerHTML = asset.win_rate.toFixed(2);
          expect.innerHTML = asset.expected_result.toFixed(2);
        });

        if (data.dataList.length < 25) {
          loadedCount = 0;
        }
    })
      .fail(() => {
        // error
    })
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
