// sets colours on graph axes
var axesColor = 'rgba(0,0,0,0.1)'
if (currentUser.darkMode) {
  axesColor = 'rgb(255,255,255,0.1)'
}

$(document).ready(function() {
    // generates the datepicker
    $("input[type=date]").datepicker({
      dateFormat: 'yy/mm/dd'
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

// sets default progress bar values
var vBalance = 50000;
var vMonthCount = 50;
var vWeekPer = 5;
var vMonthPer = 20;

// calculates the progress bar for balance
function progressBalance() {
  var toCount = parseInt(balance.replace(/,/g, '')) / vBalance * 100;
  if (toCount > 100) { toCount = 100 }
  $('#balance').html(Math.round(toCount * 100) / 100 + '%')
  $('#balance').css('width', toCount + '%')
}

// calculates the progress bar for monthly count
function progressMonthCount() {
  var toCount = monthCount / vMonthCount * 100;
  if (toCount > 100) { toCount = 100 }
  else if (toCount < 0) { toCount = 0; }
  $('#monthCount').html(Math.round(toCount * 100) / 100 + '%')
  $('#monthCount').css('width', toCount + '%')
}

// calculates the progress bar for weekly percentage
function progressWeekPer() {
  var toCount = weekPer / vWeekPer * 100;
  if (toCount > 100) { toCount = 100 }
  else if (toCount < 0) { toCount = 0; }
  $('#weekPer').html(Math.round(toCount * 100) / 100 + '%')
  $('#weekPer').css('width', toCount + '%')
}

// calculates the progress bar for monthly percentage
function progressMonthPer() {
  var toCount = monthPer / vMonthPer * 100;
  if (toCount > 100) { toCount = 100 }
  else if (toCount < 0) { toCount = 0; }
  $('#monthPer').html(Math.round(toCount * 100) / 100 + '%')
  $('#monthPer').css('width', toCount + '%')
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

// retrieves the biggest trade from the selected time period
function getBiggest(period) {
  var biggestPair = document.getElementById('biggest-pair');
  var biggestPercent = document.getElementById('biggest-percent')
  // makes an AJAX call with the corresponding data period
  $.get('/' + currentUser.username + '/dashboard/biggest/' + period)
    .done((data) => {
      biggestPair.innerHTML = data.pair;
      biggestPercent.innerHTML = data.percent.toFixed(2) + '%';
  })
    .fail(() => {
      //error
  })
}

// retrieves biggest trade from a custom time period
function getCustomBiggest(from, to) {
  var dFrom = new Date(from.value);
  var dTo = new Date(to.value);
  if (isValidDate(dFrom) && isValidDate(dTo)) {
    dFrom = from.value.replace(/\//g, '-');
    dTo = to.value.replace(/\//g, '-');
    // makes an AJAX call with the custom data period
    $.get('/' + currentUser.username + '/dashboard/biggest/custom/' + dFrom + '/' + dTo)
      .done((data) => {
        $('#biggest-pair').text(data.biggestPair);
        var biggestPercent = data.biggestPercent.toFixed(2);
        $('#biggest-percent').text(biggestPercent + '%');
    })
      .fail(() => {
        // error
    })
  }
}

// retrieves the total entries from the selected time period
function getTotal(period) {
  var totalEntries = document.getElementById('total-entries');
  var winRate = document.getElementById('win-rate');
  // makes an AJAX call with the corresponding data period
  $.get('/' + currentUser.username + '/dashboard/total/' + period)
    .done((data) => {
      totalEntries.innerHTML = data.total;
      winRate.innerHTML = data.rate.toFixed(2) + '% wins';
  })
    .fail(() => {
      // error
  })
}

// retrieves total entries from a custom time period
function getCustomTotal(from, to) {
  var dFrom = new Date(from.value);
  var dTo = new Date(to.value);
  if (isValidDate(dFrom) && isValidDate(dTo)) {
    dFrom = from.value.replace(/\//g, '-');
    dTo = to.value.replace(/\//g, '-');
    // makes an AJAX call with the custom data period
    $.get('/' + currentUser.username + '/dashboard/total/custom/' + dFrom + '/' + dTo)
      .done((data) => {
        $('#total-entries').text(data.total);
        if (isNaN(parseFloat(data.rate))) {
          $('#win-rate').text('N/A% wins');
        } else {
          $('#win-rate').text(data.rate + '% wins');
        }
    })
      .fail(() => {
        // error
    })
  }
}

// retrieves the outcome x month from the selected time period
function getOutcome(period) {
  // makes an AJAX call with the corresponding data period
  $.get('/' + currentUser.username + '/dashboard/outcome/' + period)
    .done((data) => {
      resultsChart.data.datasets[0].data = data.outcomeMonthAmount;
      resultsChart.data.datasets[1].data = data.outcomeMonthTotal;
      resultsChart.update();
  })
    .fail(() => {
      // error
  })
}

// retrieves outcome x month from a custom time period
function getCustomOutcome(from, to) {
  var dFrom = new Date(from.value);
  var dTo = new Date(to.value);
  if (isValidDate(dFrom) && isValidDate(dTo)) {
    dFrom = from.value.replace(/\//g, '-');
    dTo = to.value.replace(/\//g, '-');
    // makes an AJAX call with the custom data period
    $.get('/' + currentUser.username + '/dashboard/outcome/custom/' + dFrom + '/' + dTo)
      .done((data) => {
        resultsChart.data.datasets[0].data = data.outcomeMonthAmount;
        resultsChart.data.datasets[1].data = data.outcomeMonthTotal;
        resultsChart.update();
    })
      .fail(() => {
        // error
    })
  }
}

// modifies the accont balance progress bar
function getBalanceProgress(newValue) {
  if (!isNaN(newValue.value)) {
    vBalance = newValue.value;
    $('#d-balance').text(vBalance);
    progressBalance();
  }
}

// modifies the monthly count progress bar
function getMonthCountProgress(newValue) {
  if (!isNaN(newValue.value)) {
    vMonthCount = newValue.value;
    $('#d-month-count').text(vMonthCount);
    progressMonthCount();
  }
}

// modifies the weekly percent progress bar
function getWeekPerProgress(newValue) {
  if (!isNaN(newValue.value)) {
    vWeekPer = newValue.value;
    $('#d-week-per').text(vWeekPer);
    progressWeekPer();
  }
}

// modifies the monthly percent progress bar
function getMonthPerProgress(newValue) {
  if (!isNaN(newValue.value)) {
    vMonthPer = newValue.value;
    $('#d-month-per').text(vMonthPer);
    progressMonthPer();
  }
}

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
      openProfit = (rates[i] - openOps[i].entry) * openOps[i].lot * 100000
    } else {
      openProfit = (openOps[i].entry - rates[i]) * openOps[i].lot * 100000
    }
    openProfit = Math.round(openProfit * 100) / 100
    if (openProfit < 0) {
      holdersProfitList[i].innerHTML = '<span class="pill pill-red">' + openProfit + '</span>'
    } else {
      holdersProfitList[i].innerHTML = '<span class="pill pill-green">' + openProfit + '</span>'
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
      data: outcomeMonthAmount,
      order:2,
      backgroundColor:'rgb(255,136,24)',
    }, {
      type: 'line',
      label:'# of entries',
      yAxisID: 'N',
      fill: false,
      data:outcomeMonthTotal,
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
          max: Math.max(...outcomeMonthTotal) + 1
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

// loads progress bars with default values
progressBalance();
progressMonthCount();
progressWeekPer();
progressMonthPer();

// removes notification
function removeNotification() {
  $('.notification').hide();
  $.get('/' + currentUser.username + '/dashboard/remove-notification', (result) => {
  })
}

// open's the user emial client to send a suggestion email
$('#send-suggestion').click(() => {
  window.open('mailto:info@neilit.com?subject=Neilit Suggestion&body=Hi Neilit team,%0D%0A%0D%0AI would like to suggest ... functionality ...');
})
