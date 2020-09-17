// dropdown to select a time period for statistics
$('.dropdown-menu li').on('click', function() {
  var allDD = $('.dropdown-menu');
  var current = allDD.index($(this).parent())
  var getValue = $(this).text();
  $('.dropdown-select')[current].innerHTML = getValue;
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
  //Determinamos que tipo de gráfico va a ser. En este caso, un gráfico de barras.
  type: 'bar',
  data:{
    //Los labels son los nombres que aparecen en los ejes X e Y.
    labels:['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    //Vamos a establecer los datos que se visualizarán en el gráfico.
    datasets:[{
      //Este sería el título de la gráfica, pero lo hemos ocultado con legend>display>false.Es lo que se ve al hacer hover.
      label:'Amount',
      //La "columna1" tiene un valor de 20, la "columna2" de 90,...
      data: outcomeMonthAmount,
      //Se dibujará debajo el gráfico que tenga menor orden. Si es el más pequeño, será el del fondo.
      order:2,
      //Seleccionamos el color de cada barra en rgb.
      backgroundColor:[
        'rgb(255,136,24)',
        'rgb(255,136,24)',
        'rgb(255,136,24)',
        'rgb(255,136,24)',
        'rgb(255,136,24)',
        'rgb(255,136,24)',
        'rgb(255,136,24)',
        'rgb(255,136,24)',
        'rgb(255,136,24)',
        'rgb(255,136,24)',
        'rgb(255,136,24)',
        'rgb(255,136,24)',
      ],

    }, {

      //Tipo de gráfico que utilizaremos
      type: 'line',

      //Texto que se muestra previamente al data al hacer hover en el gráfico
      label:'# of entries',

      //Hacemos que el gráfico de linea no tenga relleno. Solo una linea que une los valores de data.
      fill: false,

      //Data que se mostrará en el gráfico de linea
      data:outcomeMonthTotal,

      //Valores para lineTension [1 --> Linea recta], [0,5 --> Curva perfecta]
      lineTension: "0.5",

      //"Z-Index" | A mayor order, más arriba se coloca el gráfico.
      order: 1,

      //A lo que estamos dando color es a la linea que junta los puntos de data. [Linea que uno los puntos]
      borderColor: "rgb(217, 217, 217)",

      //Lo que estamos coloreando en el gráfico de linea son los puntos concretos de data. [Literalmente, los puntos.]
      backgroundColor:[
        'rgb(217, 217, 217)',
        'rgb(217, 217, 217)',
        'rgb(217, 217, 217)',
        'rgb(217, 217, 217)',
        'rgb(217, 217, 217)',
        'rgb(217, 217, 217)',
        'rgb(217, 217, 217)',
        'rgb(217, 217, 217)',
        'rgb(217, 217, 217)',
        'rgb(217, 217, 217)',
        'rgb(217, 217, 217)',
        'rgb(217, 217, 217)',
      ],
      //Está comentado, pero de esta manera podemos definir el color del border de un punto de data
      //pointBorderColor: "grey",

      //Está comentado, pero de esta manera podemos definir el color del background de un punto de data
      //pointBackgroundColor: "red",

      //Definimos el tamaño del punto de data. Por defecto está en 3
      pointRadius: 3,

      //Definimos el tamaño del punto de data al hacer hover
      pointHoverRadius: 5,
    }]
  },

  options:{
    scales: {
      yAxes:[{
        ticks:{

          //Hacemos que el gráfico empiece en 0 y no en el valor más pequeño de data
          beginAtZero: true,

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
