$(document).ready(function() {
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
});

$("#addStrategy").keypress(function(event){
  if(event.which === 13){

    //Cogemos el input del usuario
    var newStrategy = $(this).val();
    $(this).val("");
    //Creamos un nuevo activo
    $("#listStrategy").append('<li class="mt-2">' + newStrategy + '</li>')

  }
});
