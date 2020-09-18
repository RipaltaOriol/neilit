// graph canvas & containers
var entriesGraph = document.getElementById('donutChartWidgetTradesWinBELoss')
// data display points
var profitsPercent = document.getElementById('profits-percent');
var profitsAmount = document.getElementById('profits-amount');

// dropdown to select a time period for statistics
$('.dropdown-menu li').on('click', function() {
  var allDD = $('.dropdown-menu');
  var current = allDD.index($(this).parent())
  var getValue = $(this).text();
  $('.dropdown-select')[current].innerHTML = getValue;
});

// Generates the datepicker
$("input[type=date]").datepicker({
  dateFormat: 'yy/mm/dd'
});

// prevents the classic datepicker from loading
$("input[type=date]").on('click', function() {
  return false;
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
  // checks if the given dates are valid
  function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
  }
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
  } else {
    // date error
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
  // checks if the given dates are valid
  function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
  }
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
  } else {
    // date error
  }
}

// retrieves the best asset from the selected time period
function getBestAsset(period) {
  var bestAssetPercent = document.getElementById('best-asset-percent');
  var bestAssetAmount = document.getElementById('best-asset-amount');
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
  // checks if the given dates are valid
  function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
  }
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
  } else {
    // date error
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
      ]
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
      //Este sería el título de la gráfica, pero lo hemos ocultado con legend>display>false.Es lo que se ve al hacer hover.
      label:'LABEL',
      //Número de operaciones que se han realizado. Siguiente orden: [WIN, BE, LOSS]
      data:[statistics.direction.long, statistics.direction.short],
      //Se dibujará debajo el gráfico que tenga menor orden. Si es el más pequeño, será el del fondo.
      order:2,
      //Seleccionamos el color de cada barra en rgb.
      backgroundColor:[
        "rgba(2,62,138,1)",
        "rgba(144,224,239,1)"
      ]
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

//GRÁFICO RESULTADOS Y DIRECCION DE LAS ENTRADAS.
var orderDirectionResults = document.getElementById('orderDirectionResults').getContext('2d');
var orderDirectionResults = new Chart(orderDirectionResults,{

  //Determinamos que tipo de gráfico va a ser. En este caso, un gráfico de barras.
  type: 'line',
  data:{
    labels:['Long', 'Short'],
    datasets:[{
      label:'LABEL',
      data:[30, 54],
      //Se dibujará debajo el gráfico que tenga menor orden. Si es el más pequeño, será el del fondo.
      order:1,
    }, {
      label: 'Nose',
      data: [20, 48],
      order: 2,
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

//Tooltips
$(document).ready(function() {
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
});
