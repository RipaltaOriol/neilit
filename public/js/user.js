// sets colours on graph axes
var axesColor = 'rgba(0,0,0,0.1)'
if (isDarkMode) {
  axesColor = 'rgb(255,255,255,0.1)'
}

$(document).ready(function() {
  // redirects to notification page
  if (screen.width < 768) {
    window.location.replace("/mobile")
  }
  // sets datepicker
  $(function() {
    $.datepicker.setDefaults(
      $.extend(
        $.datepicker.regional[language]
      )
    )
    $('.datepicker').each(function(){
      $(this).datepicker({
        altField: "#" + $(this).data('target'),
        altFormat: "yy-mm-dd" // format for database processing
      });
    });
  });
  // prevents the classic datepicker from loading
  $("input[type=date]").on('click', function() {
    return false;
  });
  // loads the currency data for open operations
  loadExchangeRates();
});

// checks if the given dates are valid
function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

// sorts the table of open positions by asset
function sortBy(column, obj) {
  $('th').removeClass('sorted')
  obj.className = 'sorted'
  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("open-positions");
  switching = true;
  // make a loop that will continue until no switching has been done:
  while (switching) {
    // start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    // loop through all table rows (except the first, which contains table headers):
    for (i = 1; i < (rows.length - 1); i++) {
      // start by saying there should be no switching:
      shouldSwitch = false;
      // get the two elements you want to compare, one from current row and one from the next:
      switch (column) {
        case 'assets':
          x = rows[i].getElementsByTagName("TD")[0].innerHTML;
          y = rows[i + 1].getElementsByTagName("TD")[0].innerHTML;
          break;
        case 'lots':
          x = rows[i].getElementsByTagName("TD")[1].innerHTML;
          y = rows[i + 1].getElementsByTagName("TD")[1].innerHTML;
          break;
        case 'direction':
          x = rows[i].getElementsByTagName("TD")[2].children[0].children[0].innerText;
          y = rows[i + 1].getElementsByTagName("TD")[2].children[0].children[0].innerText;
          break;
        case 'pnl':
          x = rows[i].getElementsByTagName('TD')[6].children[0].children[0].innerText.slice(0,-3);
          y = rows[i + 1].getElementsByTagName('TD')[6].children[0].children[0].innerText.slice(0,-3);
          break;
        case 'date':
          x = rows[i].getElementsByTagName('TD')[3].className
          y = rows[i + 1].getElementsByTagName('TD')[3].className
          break;
        default:
          x = rows[i].getElementsByTagName("TD")[0];
          y = rows[i + 1].getElementsByTagName("TD")[0];
      }
      // check if the two rows should switch place:
      if (x.toLowerCase() > y.toLowerCase()) {
        // If so, mark as a switch and break the loop:
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      // if a switch has been marked, make the switch and mark that a switch has been done:
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}

// dropdown to select a time period for statistics
$('.dropdown-menu li').on('click', function() {
  var allDD = $('.dropdown-menu');
  var current = allDD.index($(this).parent())
  var getValue = $(this).text();
  // prevents the dropdown from the objectives widgets to change
  if ($('.dropdown-select')[current] && current < 3) {
    $('.dropdown-select')[current].innerHTML = getValue;
  }
});

// defines and sets the statistic of the custom period
let custom;
function setCustom(stats) {
  custom = stats;
}

// retrieves the statistics from the selected time period
function getData(stats, period) {
  // makes an AJAX call with the corresponding data period
  $.get('/' + username + '/dashboard/' + stats + '/' + period)
    .done((data) => {
      switch (stats) {
        case 'biggest':
          setBiggest(data);
          break;
        case 'total':
          setTotal(data)
          break;
        case 'outcome':
          setOutcome(data)
          break;
      }
  })
    .fail(() => {
      //error
  })
}

// retrieves the statistics from a custom time period
function getCustom() {
  var customFrom = $('#custom-from').val()
  var customTo = $('#custom-to').val()
  // makes an AJAX call with the custom data period
  $.get('/' + username + '/dashboard/' + custom + '/custom/' + customFrom + '/' + customTo)
    .done((data) => {
      switch (custom) {
        case 'biggest':
          setBiggest(data);
          break;
        case 'total':
          setTotal(data)
          break;
        case 'outcome':
          setOutcome(data)
          break;
      }
  })
    .fail(() => {
      // error
  })
}

// sets biggest pair
function setBiggest(data) {
  $('#biggest-pair').html(data.pair);
  $('#biggest-percent').html(data.percent.toFixed(2) + '%');
}

// sets total entries and win rate
function setTotal(data) {
  $('#total-entries').html(data.total);
  $('#win-rate').html(data.rate.toFixed(2) + '% wins');
}

function setOutcome(data) {
  resultsChart.data.datasets[0].data = data.outcomeMonthAmount;
  resultsChart.data.datasets[1].data = data.outcomeMonthTotal;
  resultsChart.update();
}

// sets default progress bar values
var currentBar;

// calculates the progress bar for balance
function progressBalance(input) {
  var toCount = balance / input * 100;
  if (toCount > 100) { toCount = 100 }
  $('#balance').html(Math.round(toCount * 100) / 100 + '%')
  $('#balance').css('width', toCount + '%')
}

// calculates the progress bar for monthly count
function progressMonthCount(input) {
  var toCount = monthCount / input * 100;
  if (toCount > 100) { toCount = 100 }
  else if (toCount < 0) { toCount = 0; }
  $('#monthCount').html(Math.round(toCount * 100) / 100 + '%')
  $('#monthCount').css('width', toCount + '%')
}

// calculates the progress bar for weekly percentage
function progressWeekPer(input) {
  var toCount = weekPer / input * 100;
  if (toCount > 100) { toCount = 100 }
  else if (toCount < 0) { toCount = 0; }
  $('#weekPer').html(Math.round(toCount * 100) / 100 + '%')
  $('#weekPer').css('width', toCount + '%')
}

// calculates the progress bar for monthly percentage
function progressMonthPer(input) {
  var toCount = monthPer / input * 100;
  if (toCount > 100) { toCount = 100 }
  else if (toCount < 0) { toCount = 0; }
  $('#monthPer').html(Math.round(toCount * 100) / 100 + '%')
  $('#monthPer').css('width', toCount + '%')
}

// sets the progress bar that is being modified
function setProgressType(type) {
  currentBar = type;
}

// modifies the accont a progress bar
function updateProgress() {
  var input = $('#progress-target').val();
  if (!isNaN(input)) {
    switch (currentBar) {
      case 'balance':
        progressBalance(input);
        break;
      case 'count':
        progressMonthCount(input);
        break;
      case 'week':
        progressWeekPer(input);
        break;
      case 'month':
        progressMonthPer(input);
        break;
    }
    $('#d-' + currentBar).text(input);
    $('#progress-target').val('');
  }
}

// loads progress bars with default values
progressBalance(50000);
progressMonthCount(50);
progressWeekPer(5);
progressMonthPer(20);

// makes API call to get exchange rate
function getExchangeRate(base, target) {
  return new Promise((resolve, reject) => {
    fetch(`https://api.exchangeratesapi.io/latest?base=${base}`)
      .then((resp) => resp.json())
      .then((data) => {
        resolve(data.rates[target])
      })
  })
}

// gets the current rate and open P/L of the ongoing operations
function loadExchangeRates() {
  let rates = [];
  for (const ops in openOps) {
    var base = openOps[ops].pair.substring(0, 3)
    var target = openOps[ops].pair.substring(4,7)
    rates.push(getExchangeRate(base, target))
  }
  Promise.all(rates).then((allRatesData) => {
    renderRatesData(allRatesData);
  })
}

// renders the exchange rates and open P/L to the user
function renderRatesData(rates) {
  var holdersList = $('.current-rate')
  var holdersProfitList = $('.current-profit')
  for (var i = 0; i < holdersList.length; i++) {
    holdersList[i].innerHTML = rates[i]
    var openProfit;
    if (openOps[i].direction == 'long') {
      openProfit = (rates[i] - openOps[i].entry_price) * openOps[i].size * 100000
    } else {
      openProfit = (openOps[i].entry_price - rates[i]) * openOps[i].size * 100000
    }
    openProfit = Math.round(openProfit * 100) / 100
    var ticker = openOps[i].pair.split('/').pop()
    if (openProfit < 0) {
      holdersProfitList[i].innerHTML = '<span class="pill pill-red">' + openProfit + ' ' + ticker + '</span>'
    } else {
      holdersProfitList[i].innerHTML = '<span class="pill pill-green">' + openProfit + ' ' + ticker + '</span>'
    }
  }
}

const ctx = document.getElementById('resultsChart');
if (ctx != null) {
  ctx.getContext('2d');
}

//Creamos una nueva variable y le pasamos el canvas que hemos seleccionado antes. También le pasaremos diversas funciones.
var resultsChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: months,
    datasets:[{
      label:'Amount',
      yAxisID: 'A',
      data: dataMonthGraph.outcomeMonth,
      order:2,
      backgroundColor:'rgb(255,136,24)',
    }, {
      type: 'line',
      label:'# of entries',
      yAxisID: 'N',
      fill: false,
      data:dataMonthGraph.countMonth,
      lineTension: "0.5",
      order: 1,
      borderColor: "rgb(247,189,30)",
      pointBackgroundColor: "rgb(247,189,30)",
      pointRadius: 3,
      pointHoverRadius: 5,
    }]
  },
  options:{
    scales: {
      yAxes:[{
        id: 'A',
        type: 'linear',
        position: 'left',
        gridLines: {
          display: true,
          color: axesColor,
          zeroLineColor: axesColor
        },
        ticks:{
          display: true,
          min: 0
        }
      }, {
        id: 'N',
        type: 'linear',
        position: 'right',
        gridLines: {
          display: false
        },
        ticks: {
          display: false,
          max: Math.max(...dataMonthGraph.countMonth) + 1
        }
      }],
      xAxes:[{
        gridLines: {
          display: true,
          color: axesColor,
          zeroLineColor: axesColor
        }
      }]
    },
    responsive: true,
    maintainAspectRatio: false,
    legend:{
      display: false,
    },
  }
});


// removes notification
function removeNotification() {
  $('.notification').hide();
  $.get('/' + username + '/dashboard/remove-notification', (result) => {
  })
}

// open's the user emial client to send a suggestion email
$('#send-suggestion').click(() => {
  window.open('mailto:info@neilit.com?subject=Neilit Suggestion&body=Hi Neilit team,%0D%0A%0D%0AI would like to suggest ... functionality ...');
})
