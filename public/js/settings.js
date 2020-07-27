//Tooltips
$(document).ready(function() {
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
});


//Goals
$("#addGoal").keypress(function(event){
  if(event.which === 13){

    //Cogemos el input del usuario
    var newGoal = $(this).val();
    $(this).val("");
    //Creamos un nuevo objetivo
    $("#listGoals").append('<li class="mt-2 font-16">' + newGoal + '</li>')

  }
});

//Estrategias
$("#addStrategy").keypress(function(event){
  if(event.which === 13){

    //Cogemos el input del usuario
    var newStrategy = $(this).val();
    $(this).val("");
    //Creamos un nuevo activo
    $("#listStrategy").append('<li class="mt-2 font-16">' + newStrategy + '</li>')

  }
});

//Para seleccionar la moneda base de la cuenta
$('.dropdown-menu li').on('click', function() {
  var getValue = $(this).text();
  $('.dropdown-select').text(getValue);
});
