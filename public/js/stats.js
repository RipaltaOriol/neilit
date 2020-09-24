var axesColor = 'rgba(0,0,0,0.1)'
var doughnutBorderColor = 'rgb(255,255,255)'
if (currentUser.darkMode) {
  axesColor = 'rgba(255,255,255,0.1)'
  doughnutBorderColor = 'rgb(39,39,39,39)'
}

$(document).ready(function() {
    // tooltips
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
    // generates the datepicker
    $("input[type=date]").datepicker({
      dateFormat: 'yy/mm/dd'
    });
    // prevents the classic datepicker from loading
    $("input[type=date]").on('click', function() {
      return false;
    });
});

// graph canvas & containers
var entriesGraph = document.getElementById('donutChartWidgetTradesWinBELoss');
var directionGraph = document.getElementById('orderDirection');
// data display points
var profitsPercent = document.getElementById('profits-percent');
var profitsAmount = document.getElementById('profits-amount');
var bestAssetPercent = document.getElementById('best-asset-percent');
var bestAssetAmount = document.getElementById('best-asset-amount');
var timeframesBody = document.getElementById('timeframes-body');
var assetsBody = document.getElementById('assets-body');

// checks if the given dates are valid
function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

// dropdown to select a time period for statistics
$('.dropdown-menu li').on('click', function() {
  var allDD = $('.dropdown-menu');
  var current = allDD.index($(this).parent())
  var getValue = $(this).text();
  $('.dropdown-select')[current].innerHTML = getValue;
});

// retrieves profits from the selected time period
function getProfits(period) {
  // makes an AJAX call with the corresponding data period
  $.get('/' + currentUser.username + '/statistics/profits/' + period)
    .done((data) => {
      profitsPercent.innerHTML = data.percent + '%'
      if (data.amount >= 0) {
        profitsAmount.innerHTML = '<p class="pill pill-verde font-16"><img src="/imgs/icons/trending-up-green.svg" class="imagen-widget-grande mr-2">'
          + data.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ' + userBase + '</p>'
      } else {
        profitsAmount.innerHTML = '<p class="pill pill-roja font-16"><img src="/imgs/icons/trending-down-red.svg" class="imagen-widget-grande mr-2"'
          + data.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ' + userBase + '</p>'
      }
  })
    .fail(() => {
      // error
    })
};

// retrieves profits from a custom time period
function getCustomProfits(from, to) {
  var dFrom = new Date(from.value);
  var dTo = new Date(to.value);
  if (isValidDate(dFrom) && isValidDate(dTo)) {
    dFrom = from.value.replace(/\//g, '-');
    dTo = to.value.replace(/\//g, '-');
    // makes an AJAX call with the custom data period
    $.get('/' + currentUser.username + '/statistics/profits/custom/' + dFrom + '/' + dTo)
      .done((data) => {
        profitsPercent.innerHTML = data.percent + '%'
        if (data.amount >= 0) {
          profitsAmount.innerHTML = '<p class="pill pill-verde font-16"><img src="/imgs/icons/trending-up-green.svg" class="imagen-widget-grande mr-2">'
            + data.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ' + userBase + '</p>'
        } else {
          profitsAmount.innerHTML = '<p class="pill pill-roja font-16"><img src="/imgs/icons/trending-down-red.svg" class="imagen-widget-grande mr-2"'
            + data.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ' + userBase + '</p>'
        }
    })
      .fail(() => {
        // error
    })
  }
}

// retrieves entry results from the selected time period
function getEntries(period) {
  // makes an AJAX call with the corresponding data period
  $.get('/' + currentUser.username + '/statistics/entries/' + period)
    .done((data) => {
      if (data.win + data.be + data.loss > 0) {
        entriesGraph.style.display = "block";
        popularAssetsChart.data.datasets[0].data = [data.win, data.be, data.loss];
        popularAssetsChart.update();
        document.getElementById('no-data-entries-graph').classList.add('d-none')
      } else {
        entriesGraph.style.display = "none";
        document.getElementById('no-data-entries-graph').classList.remove('d-none');
      }
  })
    .fail(() => {
      // error
  })
}

// retrieves entry results from a custom time period
function getCustomEntries(from, to) {
  var dFrom = new Date(from.value);
  var dTo = new Date(to.value);
  if (isValidDate(dFrom) && isValidDate(dTo)) {
    dFrom = from.value.replace(/\//g, '-');
    dTo = to.value.replace(/\//g, '-');
    // makes an AJAX call with the custom data period
    $.get('/' + currentUser.username + '/statistics/entries/custom/' + dFrom + '/' + dTo)
      .done((data) => {
        if (data.win + data.be + data.loss > 0) {
          entriesGraph.style.display = "block";
          popularAssetsChart.data.datasets[0].data = [data.win, data.be, data.loss];
          popularAssetsChart.update();
          document.getElementById('no-data-entries-graph').classList.add('d-none')
        } else {
          entriesGraph.style.display = "none";
          document.getElementById('no-data-entries-graph').classList.remove('d-none');
        }
    })
      .fail(() => {
        // error
    })
  }
}

// retrieves the best asset from the selected time period
function getBestAsset(period) {
  // makes an AJAX call with the corresponding data period
  $.get('/' + currentUser.username + '/statistics/best-asset/' + period)
    .done((data) => {
      bestAssetPercent.innerHTML = data.percent + '%'
      if (data.amount >= 0) {
        bestAssetAmount.innerHTML = '<a href="#"><p class="pill mx-1 font-16 grey">' + data.pair + '</p></a>'
          + '<p class="pill pill-verde font-16 mx-1"><img src="/imgs/icons/trending-up-green.svg" class="imagen-widget-grande mr-2">'
          + data.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ' + userBase + '</p>'
      } else {
        bestAssetAmount.innerHTML = '<a href="#"><p class="pill mx-1 font-16 grey">' + data.pair + '</p></a>'
          + '<p class="pill pill-roja font-16 mx-1"><img src="/imgs/icons/trending-down-red.svg" class="imagen-widget-grande mr-2"'
          + data.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ' + userBase + '</p>'
      }
  })
    .fail(() => {
      // error
  })
}

// retrieves the best asset from a custom time period
function getCustomBestAsset(from, to) {
  var dFrom = new Date(from.value);
  var dTo = new Date(to.value);
  if (isValidDate(dFrom) && isValidDate(dTo)) {
    dFrom = from.value.replace(/\//g, '-');
    dTo = to.value.replace(/\//g, '-');
    // makes an AJAX call with the custom data period
    $.get('/' + currentUser.username + '/statistics/best-asset/custom/' + dFrom + '/' + dTo)
      .done((data) => {
        bestAssetPercent.innerHTML = data.percent + '%'
        if (data.amount >= 0) {
          bestAssetAmount.innerHTML = '<a href="#"><p class="pill mx-1 font-16 grey">' + data.pair + '</p></a>'
            + '<p class="pill pill-verde font-16 mx-1"><img src="/imgs/icons/trending-up-green.svg" class="imagen-widget-grande mr-2">'
            + data.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ' + userBase + '</p>'
        } else {
          bestAssetAmount.innerHTML = '<a href="#"><p class="pill mx-1 font-16 grey">' + data.pair + '</p></a>'
            + '<p class="pill pill-roja font-16 mx-1"><img src="/imgs/icons/trending-down-red.svg" class="imagen-widget-grande mr-2"'
            + data.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ' + userBase + '</p>'
        }
    })
      .fail(() => {
        // error
    })
  }
}

// retrieves data based on strategies from selected period
function getStrategies(period) {
  // makes AJAX call with the corresponding data period
  $.get('/' + currentUser.username + '/statistics/strategies/' + period)
    .done((data) => {
      for (const property in data.strategyStats) {
        var sData = data.strategyStats;
        document.getElementById(property + '-quantity').innerHTML = sData[property].quantity;
        if (sData[property].quantity == 0) {
          document.getElementById(property + '-average').innerHTML = "0"
        } else {
          if (sData[property].percent/sData[property].quantity >= 0) {
            document.getElementById(property + '-average').innerHTML = '<p class="mb-0 pill pill-verde">'
              + sData[property].percent/sData[property].quantity + '%</p>'
          } else {
            document.getElementById(property + '-average').innerHTML = '<p class="mb-0 pill pill-roja">'
              + sData[property].percent/sData[property].quantity + '%</p>'
          }
        }
        document.getElementById(property + '-win').innerHTML = sData[property].win;
        document.getElementById(property + '-be').innerHTML = sData[property].be;
        document.getElementById(property + '-loss').innerHTML = sData[property].loss;
      }
  })
    .fail(() => {
      // error
  })
}

// retrieves data based on assets from selected period
function getAssets(period) {
  // makes AJAX call with the corresponding data period
  $.get('/' + currentUser.username + '/statistics/assets/' + period)
    .done((data) => {
      assetsBody.innerHTML = '';
      for (var i = 6; i > -1; i--) {
        var average = ''
        if (data.assetStats.showcase[i][0] == 0) {
          average = '0';
        } else {
          if (data.assetStats.percent[data.assetStats.showcase[i][1]]/data.assetStats.showcase[i][0] >= 0) {
            average = '<p class="mb-0 pill pill-verde">' + data.assetStats.percent[data.assetStats.showcase[i][1]]/data.assetStats.showcase[i][0]
            + '%</p>';
          } else {
            average = '<p class="mb-0 pill pill-roja">' + data.assetStats.percent[data.assetStats.showcase[i][1]]/data.assetStats.showcase[i][0]
            + '%</p>';
          }
        }
        assetsBody.innerHTML += '<tr><th scope="row" class="align-middle"><a href="#" class="grey">'
          + pairs[data.assetStats.showcase[i][1]] + '</a></th><td>' + data.assetStats.showcase[i][0]
          + '</td><td>' + average + '</td><td>' + data.assetStats.win[data.assetStats.showcase[i][1]]
          + '</td><td>' + data.assetStats.be[data.assetStats.showcase[i][1]]
          + '</td><td>' + data.assetStats.loss[data.assetStats.showcase[i][1]] + '</td></tr>';
      }
  })
    .fail(() => {
      // error
  })
}

// retrieves data based on timeframes from selected period
function getTimeframes(period) {
  // makes AJAX call with the corresponding data period
  $.get('/' + currentUser.username + '/statistics/timeframes/' + period)
    .done((data) => {
      timeframesBody.innerHTML = '';
      for (var i = 6; i > -1; i--) {
        var average = ''
        if (data.timeframeStats.showcase[i][0] == 0) {
          average = '0';
        } else {
          if (data.timeframeStats.percent[data.timeframeStats.showcase[i][1]]/data.timeframeStats.showcase[i][0] >= 0) {
            average = '<p class="mb-0 pill pill-verde">' + data.timeframeStats.percent[data.timeframeStats.showcase[i][1]]/data.timeframeStats.showcase[i][0]
            + '%</p>';
          } else {
            average = '<p class="mb-0 pill pill-roja">' + data.timeframeStats.percent[data.timeframeStats.showcase[i][1]]/data.timeframeStats.showcase[i][0]
            + '%</p>';
          }
        }
        timeframesBody.innerHTML += '<tr><th scope="row" class="align-middle"><a href="#" class="grey">'
          + timeframes[data.timeframeStats.showcase[i][1]] + '</a></th><td>' + data.timeframeStats.showcase[i][0]
          + '</td><td>' + average + '</td><td>' + data.timeframeStats.win[data.timeframeStats.showcase[i][1]]
          + '</td><td>' + data.timeframeStats.be[data.timeframeStats.showcase[i][1]]
          + '</td><td>' + data.timeframeStats.loss[data.timeframeStats.showcase[i][1]] + '</td></tr>';
      }
  })
    .fail(() => {
      // error
  })
}

// retrieves data based on weekdays from the selected period
function getDays(period) {
  // makes AJAX call with the corresponding data period
  $.get('/' + currentUser.username + '/statistics/days/' + period)
    .done((data) => {
      for (const property in data.dayWeekStats) {
        document.getElementById(property + '-quantity').innerHTML = data.dayWeekStats[property].quantity;
        if (data.dayWeekStats[property].quantity == 0) {
          document.getElementById(property + '-average').innerHTML = "0"
        } else {
          if (data.dayWeekStats[property].percent/data.dayWeekStats[property].quantity >= 0) {
            document.getElementById(property + '-average').innerHTML = '<p class="mb-0 pill pill-verde">'
              + data.dayWeekStats[property].percent/data.dayWeekStats[property].quantity + '%</p>'
          } else {
            document.getElementById(property + '-average').innerHTML = '<p class="mb-0 pill pill-roja">'
              + data.dayWeekStats[property].percent/data.dayWeekStats[property].quantity + '%</p>'
          }
        }
        document.getElementById(property + '-win').innerHTML = data.dayWeekStats[property].win;
        document.getElementById(property + '-be').innerHTML = data.dayWeekStats[property].be;
        document.getElementById(property + '-loss').innerHTML = data.dayWeekStats[property].loss;
      }
  })
    .fail(() => {
      // error
  })
}

// retrieves entry directions from the selected time period
function getDirection(period) {
  // makes an AJAX call with the corresponding data period
  $.get('/' + currentUser.username + '/statistics/direction/breakout/' + period)
    .done((data) => {
      if (data.long + data.short > 0) {
        directionGraph.style.display = "block";
        orderDirection.data.datasets[0].data = [data.long, data.short];
        orderDirection.update();
        document.getElementById('no-data-direction-graph').classList.add('d-none')
      } else {
        directionGraph.style.display = "none";
        document.getElementById('no-data-direction-graph').classList.remove('d-none');
      }
  })
    .fail(() => {
      // error
  })
}

// retrieves the direction brekout from a custom time period
function getCustomDirection(from, to) {
  var dFrom = new Date(from.value);
  var dTo = new Date(to.value);
  if (isValidDate(dFrom) && isValidDate(dTo)) {
    dFrom = from.value.replace(/\//g, '-');
    dTo = to.value.replace(/\//g, '-');
    // makes an AJAX call with the custom data period
    $.get('/' + currentUser.username + '/statistics/direction/breakout/custom/' + dFrom + '/' + dTo)
      .done((data) => {
        if (data.long + data.short > 0) {
          directionGraph.style.display = "block";
          orderDirection.data.datasets[0].data = [data.long, data.short];
          orderDirection.update();
          document.getElementById('no-data-direction-graph').classList.add('d-none')
        } else {
          directionGraph.style.display = "none";
          document.getElementById('no-data-direction-graph').classList.remove('d-none');
        }
    })
      .fail(() => {
        // error
    })
  }
}

// retrieves entry percent based on month & direction from the selected time period
function getDirectionPer(period) {
  // makes an AJAX call with the corresponding data period
  $.get('/' + currentUser.username + '/statistics/direction/percent/' + period)
    .done((data) => {
      orderDirectionResults.data.datasets[0].data = data.long;
      orderDirectionResults.data.datasets[1].data = data.short;
      orderDirectionResults.update();
  })
    .fail(() => {
      // error
  })
}

// retrieves the direction percent based on month & direction from a custom time period
function getCustomDirectionPer(from, to) {
  var dFrom = new Date(from.value);
  var dTo = new Date(to.value);
  if (isValidDate(dFrom) && isValidDate(dTo)) {
    dFrom = from.value.replace(/\//g, '-');
    dTo = to.value.replace(/\//g, '-');
    // makes an AJAX call with the custom data period
    $.get('/' + currentUser.username + '/statistics/direction/percent/custom/' + dFrom + '/' + dTo)
      .done((data) => {
        console.log(data);
        orderDirectionResults.data.datasets[0].data = data.long;
        orderDirectionResults.data.datasets[1].data = data.short;
        orderDirectionResults.update();
    })
      .fail(() => {
        // error
    })
  }
}

//GRÁFICO DE ENTRADAS
var donutChartWidgetTradesWinBELoss = document.getElementById('donutChartWidgetTradesWinBELoss').getContext('2d');
var popularAssetsChart = new Chart(donutChartWidgetTradesWinBELoss, {

  //Determinamos que tipo de gráfico va a ser. En este caso, un gráfico de barras.
  type: 'doughnut',
  data:{
    labels:['Win', 'Break Even', 'Loss'],
    datasets:[{
      label:'LABEL',
      data:[statistics.entries.win, statistics.entries.be, statistics.entries.loss],
      //Se dibujará debajo el gráfico que tenga menor orden. Si es el más pequeño, será el del fondo.
      order:2,
      backgroundColor:[
        'rgba(69, 214, 158, 1)',
        'rgba(255, 183, 51, 1)',
        'rgba(253 ,94, 116, 1)',
      ],
      borderColor: doughnutBorderColor
    }]
  },
  options:{
    scales: {
      xAxes:[{
        gridLines:{
          display:false
        },
        ticks:{
          display: false,
        }
      }],
      yAxes:[{
        gridLines:{
          display:false
        },
        ticks:{
          display: false,
          beginAtZero:true,
          fontFamily: "Nunito",
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

//GRÁFICO DIRECCION DE LAS ENTRADAS.
var orderDirection = document.getElementById('orderDirection').getContext('2d');
var orderDirection = new Chart(orderDirection,{

  //Determinamos que tipo de gráfico va a ser. En este caso, un gráfico de barras.
  type: 'doughnut',
  data:{
    //Los labels son los nombres que aparecen en los ejes X e Y.
    labels:['Long', 'Short'],
    //Vamos a establecer los datos que se visualizarán en el gráfico.
    datasets:[{
      //Número de operaciones que se han realizado. Siguiente orden: [WIN, BE, LOSS]
      data:[statistics.direction.long, statistics.direction.short],
      //Seleccionamos el color de cada barra en rgb.
      backgroundColor:[
        "rgba(2,62,138,1)",
        "rgba(144,224,239,1)"
      ],
      borderColor: doughnutBorderColor
    }]
  },
  options:{
    scales: {
      xAxes:[{
        gridLines:{
          display:false
        },
        ticks:{
          display: false,
        }
      }],
      yAxes:[{
        gridLines:{
          display:false
        },
        ticks:{
          display: false,
          //Hacemos que el gráfico empiece en 0 y no en el valor más pequeño de data
          beginAtZero:true,
          //Declaramos la familia de los ticks [ticks --> texto en los ejes]
          fontFamily: "Nunito",
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

// graph for direction and results metric
var orderDirectionResults = document.getElementById('orderDirectionResults').getContext('2d');
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'Auguts', 'September', 'October', 'November', 'December']
var orderDirectionResults = new Chart(orderDirectionResults,{

  //Determinamos que tipo de gráfico va a ser. En este caso, un gráfico de barras.
  type: 'line',
  data:{
    labels: months,
    datasets:[{
      // dataset for long entries
      backgroundColor: 'rgba(0,0,0,0)',
      borderColor: 'rgb(2,62,138)',
      pointBackgroundColor: 'rgb(2,62,138)',
      pointBorderColor: 'rgb(2,62,138)',
      label: 'Long',
      data: statistics.directionPer.long,
      order: 1,
    }, {
      // dataset for short entries
      backgroundColor: 'rgba(0,0,0,0)',
      borderColor: 'rgb(144,224,239)',
      pointBackgroundColor: 'rgb(144,224,239)',
      pointBorderColor: 'rgb(144,224,239)',
      label: 'Short',
      data: statistics.directionPer.short,
      order: 2,
    }]
  },
  options:{
    scales: {
      xAxes:[{
        gridLines:{
          display:true,
          color: axesColor,
          zeroLineColor: axesColor
        },
        ticks:{
          display: false,
        }
      }],
      yAxes:[{
        gridLines:{
          display:true,
          color: axesColor,
          zeroLineColor: axesColor
        },
        ticks:{
          display: true,
          beginAtZero:true
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
