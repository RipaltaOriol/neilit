// sets colours on graph axes
var axesColor = 'rgba(0,0,0,0.1)'
var doughnutBorderColor = 'rgb(255,255,255)'

// set dark mode
if (darkMode) {
  axesColor = 'rgba(255,255,255,0.1)'
  doughnutBorderColor = 'rgb(39,39,39,39)'
}

// dropdown to select a time period for statistics
$('.dropdown-menu li').on('click', function() {
  var allDD = $('.dropdown-menu');
  var current = allDD.index($(this).parent())
  var getValue = $(this).text();
  $('.dropdown-select')[current].innerHTML = getValue;
});

// defines and sets the statistic of the custom period
let custom;
function setCustom(stats) {
  custom = stats;
}

// retrieves the statistics from the selected time period
function getData(stats, period) {
  // makes an AJAX call with the corresponding data period
  $.get('/' + username + '/statistics/' + stats + '/' + period)
    .done((data) => {
      switch (stats) {
        case 'profits':
          setProfits(data);
          break;
        case 'entries':
          setEntries(data)
          break;
        case 'best-asset':
          setBestAsset(data)
          break;
        case 'strategies':
          setStrategies(data.strategyStats)
          break;
        case 'assets':
          setAssets(data.assetStats)
          break;
        case 'timeframes':
          setTimeframes(data.timeframeStats)
          break;
        case 'days':
          setDays(data.dayStats)
          break;
        case 'directionDist':
          setDirectionDist(data)
          break;
        case 'directionGraph':
          setDirectionGraph(data)
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
  $.get('/' + username + '/statistics/' + custom + '/custom/' + customFrom + '/' + customTo)
    .done((data) => {
      switch (custom) {
        case 'profits':
          setProfits(data);
          break;
        case 'entries':
          setEntries(data)
          break;
        case 'best-asset':
          setBestAsset(data)
          break;
        case 'strategies':
          setStrategies(data.customData)
          break;
        case 'assets':
          setAssets(data.customData)
          break;
        case 'timeframes':
          setTimeframes(data.customData)
          break;
        case 'days':
          setDays(data.customData)
          break;
        case 'directionDist':
          setDirectionDist(data)
          break;
        case 'directionGraph':
          setDirectionGraph(data)
          break;
      }
  })
    .fail(() => {
      // error
  })
}

// sets profits
function setProfits(data) {
  $('#profits-percent').html(data.percent.toFixed(2) + '%')
  if (data.amount >= 0) {
    $('#profits-amount').html('<p class="d-inline pill pill-green"><img src="/imgs/icons/trending-up-green.svg" class="image-widget-grande mr-2">'
      + data.amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ' + userBase + '</p>')
  } else {
    $('#profits-amount').html('<p class="d-inline pill pill-green"><img src="/imgs/icons/trending-down-red.svg" class="image-widget-grande mr-2"'
      + data.amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ' + userBase + '</p>')
  }
}

// sets entries graph
function setEntries(data) {
  if (data.win + data.be + data.loss > 0) {
    entriesGraph.style.display = "block";
    popularAssetsChart.data.datasets[0].data = [data.win, data.be, data.loss];
    popularAssetsChart.update();
    document.getElementById('no-data-entries-graph').classList.add('d-none')
  } else {
    entriesGraph.style.display = "none";
    document.getElementById('no-data-entries-graph').classList.remove('d-none');
  }
}

// sets best asset
function setBestAsset(data) {
  $('#best-asset-percent').html(data.percent.toFixed(2) + '%')
  if (data.amount >= 0) {
    $('#best-asset-amount').html('<p class="pr-2">' + data.pair + '</p>'
      + '<p class="d-inline pill pill-green font-16 mx-1"><img src="/imgs/icons/trending-up-green.svg" class="image-widget-grande mr-2">'
      + data.amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ' + userBase + '</p>')
  } else {
    $('#best-asset-amount').html('<p class="pr-2">' + data.pair + '</p>'
      + '<p class="d-inline pill pill-red font-16 mx-1"><img src="/imgs/icons/trending-down-red.svg" class="image-widget-grande mr-2"'
      + data.amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ' + userBase + '</p>')
  }
}

// sets strategies
function setStrategies(data) {
  $('#table-strategies').html('')
  var table = document.getElementById('table-strategies')
  data.forEach((strategy) => {
    var row = table.insertRow();
    var name = row.insertCell();
    name.innerHTML = '<td><a href="#!" class="grey">' + strategy.strategy + '</a></td>'
    var entries = row.insertCell();
    entries.innerHTML = '<td>' + strategy.entries + '</td>'
    var avgReturn = row.insertCell();
    if (strategy.avg_return >= 0) {
      avgReturn.innerHTML = '<td><p class="mb-0 pill pill-green">' + strategy.avg_return.toFixed(2)
        + '%</p></td>'
    } else {
      avgReturn.innerHTML = '<td><p class="mb-0 pill pill-red">' + strategy.avg_return.toFixed(2)
        + '%</p></td>'
    }
    var win = row.insertCell();
    win.innerHTML = '<td>' + strategy.win + '</td>'
    var be = row.insertCell();
    be.innerHTML = '<td>' + strategy.be + '</td>'
    var loss = row.insertCell();
    loss.innerHTML = '<td>' + strategy.loss + '</td>'
  });
}

// sets assets
function setAssets(data) {
  $('#table-assets').html('')
  var table = document.getElementById('table-assets')
  data.forEach((asset) => {
    var row = table.insertRow();
    var name = row.insertCell();
    name.innerHTML = '<td><a href="#!" class="grey">' + asset.pair + '</a></td>'
    var entries = row.insertCell();
    entries.innerHTML = '<td>' + asset.entries + '</td>'
    var avgReturn = row.insertCell();
    if (asset.avg_return >= 0) {
      avgReturn.innerHTML = '<td><p class="mb-0 pill pill-green">' + asset.avg_return.toFixed(2)
        + '%</p></td>'
    } else {
      avgReturn.innerHTML = '<td><p class="mb-0 pill pill-red">' + asset.avg_return.toFixed(2)
        + '%</p></td>'
    }
    var win = row.insertCell();
    win.innerHTML = '<td>' + asset.win + '</td>'
    var be = row.insertCell();
    be.innerHTML = '<td>' + asset.be + '</td>'
    var loss = row.insertCell();
    loss.innerHTML = '<td>' + asset.loss + '</td>'
  });
}

// sets timeframes
function setTimeframes(data) {
  $('#table-timeframes').html('')
  var table = document.getElementById('table-timeframes')
  data.forEach((timeframe) => {
    var row = table.insertRow();
    var name = row.insertCell();
    name.innerHTML = '<td><a href="#!" class="grey">' + timeframe.timeframe + '</a></td>'
    var entries = row.insertCell();
    entries.innerHTML = '<td>' + timeframe.entries + '</td>'
    var avgReturn = row.insertCell();
    if (timeframe.avg_return >= 0) {
      avgReturn.innerHTML = '<td><p class="mb-0 pill pill-green">' + timeframe.avg_return.toFixed(2)
        + '%</p></td>'
    } else {
      avgReturn.innerHTML = '<td><p class="mb-0 pill pill-red">' + timeframe.avg_return.toFixed(2)
        + '%</p></td>'
    }
    var win = row.insertCell();
    win.innerHTML = '<td>' + timeframe.win + '</td>'
    var be = row.insertCell();
    be.innerHTML = '<td>' + timeframe.be + '</td>'
    var loss = row.insertCell();
    loss.innerHTML = '<td>' + timeframe.loss + '</td>'
  });
}

// sets days
function setDays(data) {
  console.log(data);
  $('#table-days').html('')
  var table = document.getElementById('table-days')
  data.forEach((day) => {
    var row = table.insertRow();
    var name = row.insertCell();
    name.innerHTML = '<td><a href="#!" class="grey">' + day.day + '</a></td>'
    var entries = row.insertCell();
    entries.innerHTML = '<td>' + day.entries + '</td>'
    var avgReturn = row.insertCell();
    if (day.avg_return >= 0) {
      avgReturn.innerHTML = '<td><p class="mb-0 pill pill-green">' + day.avg_return.toFixed(2)
        + '%</p></td>'
    } else {
      avgReturn.innerHTML = '<td><p class="mb-0 pill pill-red">' + day.avg_return.toFixed(2)
        + '%</p></td>'
    }
    var win = row.insertCell();
    win.innerHTML = '<td>' + day.win + '</td>'
    var be = row.insertCell();
    be.innerHTML = '<td>' + day.be + '</td>'
    var loss = row.insertCell();
    loss.innerHTML = '<td>' + day.loss + '</td>'
  });
}

// sets direction distribution
function setDirectionDist(data) {
  if (data.long + data.short > 0) {
    directionGraph.style.display = "block";
    orderDirection.data.datasets[0].data = [data.long, data.short];
    orderDirection.update();
    document.getElementById('no-data-direction-graph').classList.add('d-none')
  } else {
    directionGraph.style.display = "none";
    document.getElementById('no-data-direction-graph').classList.remove('d-none');
  }
}

// sets direction graph
function setDirectionGraph(data) {
  orderDirectionResults.data.datasets[0].data = data.long;
  orderDirectionResults.data.datasets[1].data = data.short;
  orderDirectionResults.update();
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
      data:[basicStats.win, basicStats.be, basicStats.loss],
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
      data:[basicStats.d_long, basicStats.d_short],
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

// graph for direction and results metrics
var orderDirectionResults = document.getElementById('orderDirectionResults').getContext('2d');
var orderDirectionResults = new Chart(orderDirectionResults, {
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
      data: dataDirectionGraph.outcomeLong,
      order: 1,
    }, {
      // dataset for short entries
      backgroundColor: 'rgba(0,0,0,0)',
      borderColor: 'rgb(144,224,239)',
      pointBackgroundColor: 'rgb(144,224,239)',
      pointBorderColor: 'rgb(144,224,239)',
      label: 'Short',
      data: dataDirectionGraph.outcomeShort,
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
    legend: {
      display: false,
    }
  }
});

// graph for fees for the last 12 months
var feesChart = document.getElementById('feesChart').getContext('2d');
var feesChart = new Chart(feesChart, {
  type: 'line',
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
    maintainAspectRatio: false,
    legend: {
      display: false
    }
  }
})

// graph for entries w/ TA vs. No TA
var chartTaVsNoTa = document.getElementById('taVsNoTa').getContext('2d');
var taVsNoTa = new Chart(chartTaVsNoTa, {
  type: 'bar',
  data: {
    labels: ['Win Rate - Technical Analysis', 'Win Rate - No Technical Analysis'],
    datasets: [{
        data: [taVsNoTa.ta, taVsNoTa.no_ta],
        backgroundColor: '#FF8818',
        barThickness: 200
    }]
  },
  options: {
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
          max: 1
        },
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
    legend: { display: false }
  }
})

function generateEquityChart(data) {
  var chartEquityCurve = document.getElementById('equityCurve').getContext('2d');
  var equityCurve = new Chart(chartEquityCurve, {
    type: 'line',
    data: {
      labels: data,
      datasets:[{
        backgroundColor: 'rgba(0,0,0,0)',
        borderColor: '#FF8818',
        pointBackgroundColor: '#FF8818',
        pointBorderColor: '#FF8818',
        label: 'Equity Curve',
        data: data
      }]
    },
    options: {
      elements: {
        point:{
          radius: 0
        }
      },
      scales: {
        scaleLabel: {
          display: false
        },
        yAxes: [{
          gridLines: {
            display: true,
            color: axesColor,
            zeroLineColor: axesColor
          }
        }],
        xAxes: [{
          gridLines: {
            display: false,
            color: axesColor,
            zeroLineColor: axesColor
          },
          ticks:{
            display: false,
          }
        }]
      },
      responsive: true,
      legend: { display: false }
    }
  })
}

function loadEquityChart() {
  $.get('/' + username + '/statistics/load-equity')
    .done((data) => {
      generateEquityChart(data.data)
    })
    .fail(() => {
      // error
    })
}

$(document).ready(function() {
  // redirects to notification page
  if (screen.width < 768) {
    window.location.replace("/mobile")
  }
  // sets datepicker
  $(function() {
    loadEquityChart();
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
  feesChart.data.labels = feesByMonthLabel
  feesChart.data.datasets.push({
    data: feesByMonthData,
    borderColor: '#FF8818',
    pointBackgroundColor: '#FF8818' ,
    fill: false
  })
  feesChart.update();
});
