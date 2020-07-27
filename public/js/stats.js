//Para seleccionar la temporalidad que se muestra en los widgets de estadísticas
// FIXME: hacer cada dropdown independiente
$('.dropdown-menu li').on('click', function() {
  var getValue = $(this).text();
  $('.dropdown-select').text(getValue);
});

//Tooltips
$(document).ready(function() {
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
});


//Gráficos
//GRÁFICO DE ENTRADAS
var donutChartWidgetTradesWinBELoss = document.getElementById('donutChartWidgetTradesWinBELoss').getContext('2d');
var popularAssetsChart = new Chart(donutChartWidgetTradesWinBELoss,{

  //Determinamos que tipo de gráfico va a ser. En este caso, un gráfico de barras.
  type: 'doughnut',
  data:{
    //Los labels son los nombres que aparecen en los ejes X e Y.
    labels:['Win', 'Break Even', 'Loss'],
    //Vamos a establecer los datos que se visualizarán en el gráfico.
    datasets:[{
      //Este sería el título de la gráfica, pero lo hemos ocultado con legend>display>false.Es lo que se ve al hacer hover.
      label:'LABEL',
      //Número de operaciones que se han realizado. Siguiente orden: [WIN, BE, LOSS]
      data:[6, 3, 1],
      //Se dibujará debajo el gráfico que tenga menor orden. Si es el más pequeño, será el del fondo.
      order:2,
      //Seleccionamos el color de cada barra en rgb.
      backgroundColor:[
        "rgba(69,214,158,1)",
        "rgba(255,183,51,1)",
        "rgba(253,94,116,1)",
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
      data:[30, 54],
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
    //Los labels son los nombres que aparecen en los ejes X e Y.
    labels:['Long', 'Short'],
    //Vamos a establecer los datos que se visualizarán en el gráfico.
    datasets:[{
      //Este sería el título de la gráfica, pero lo hemos ocultado con legend>display>false.Es lo que se ve al hacer hover.
      label:'LABEL',
      //Número de operaciones que se han realizado. Siguiente orden: [WIN, BE, LOSS]
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
