// dropdown to select a time period for statistics
$('.dropdown-menu li').on('click', function() {
  var allDD = $('.dropdown-menu');
  var current = allDD.index($(this).parent())
  var getValue = $(this).text();
  if ($('.dropdown-select')[current]) {
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

const ctx = document.getElementById('resultsChart');
if (ctx != null) {
  ctx.getContext('2d');
}

//Creamos una nueva variable y le pasamos el canvas que hemos seleccionado antes. También le pasaremos diversas funciones.
var resultsChart = new Chart(ctx,{
  type: 'bar',
  data:{
    labels:['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
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
      borderColor: "rgb(181,229,255)",
      pointBackgroundColor: "rgb(181,229,255)",
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
        gridLines: false,
        ticks:{
          display: false
        }
      }, {
        id: 'N',
        type: 'linear',
        position: 'right',
        ticks: {
          display: false,
          max: Math.max(...outcomeMonthTotal) + 1
        }
      }]
    },
    responsive: true,
    maintainAspectRatio: false,
    legend:{
      display: false,
    }
  }
});

// removes notification
function removeNotification() {
  $('.notification').hide();
  $.get('/' + currentUser.username + '/dashboard/remove-notification', (result) => {
  })
}

// open's the user emial client to send a suggestion email
$('#send-suggestion').click(() => {
  window.open('mailto:info@neilit.com?subject=Neilit Suggestion&body=Hi Neilit team\nI would like to suggest ... functionality ...');
})
