// Tooltips
$(document).ready(function() {
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
});

// Goals
$("#addGoal").keypress(function(event){
  if(event.which === 13){

    //Cogemos el input del usuario
    var newGoal = $(this).val();
    $(this).val("");
    //Creamos un nuevo objetivo
    $("#listGoals").append('<li class="mt-2 font-16">' + newGoal + '</li>')

  }
});

// stores the strategy's HTML to a variable
var frontStrategy = `<li class="mt-2 py-0">
    <input type="text" name="strategy" value="`;
var midStrategy = `" class="strategy">
    <button type="button" class="float-right" onclick="deleteStrategy(`;

var backStrategy = `)">
        <img class="icon-20" src="/imgs/icons/delete.svg">
      </button>
    </li>`;

// deletes a strategy
function deleteStrategy(index) {
  var strategyList = document.getElementById('listStrategy');
  var currentStrategy = strategyList.getElementsByTagName('li')[index];
  var currentName = currentStrategy.getElementsByClassName('strategy')[0];
  var currentBtn = currentStrategy.getElementsByTagName('button')[0];
  currentName.remove();
  currentBtn.remove();
  // maps if existing strategies have been errased
  if (index < strategies.length) {
    currentStrategy.getElementsByClassName('map')[0].value = 1;
  }
};

// Estrategias
$("#addStrategy").keypress(function(event){
  if(event.which === 13){
    // gets the user input
    var newStrategy = $(this).val();
    $(this).val("");
    // gets the number of strategies and sets the new index
    var strategiesList = document.getElementById('listStrategy');
    var countStrategies = strategiesList.getElementsByTagName('li').length;
    // adds a new strategy
    $("#listStrategy").append(frontStrategy + newStrategy +
      midStrategy +  countStrategies + backStrategy);
    // prevents the form from submitting
    event.preventDefault();
    return false;
  }
});

//Para seleccionar la moneda base de la cuenta
$('.dropdown-menu li').on('click', function() {
  var getValue = $(this).text();
  $('.dropdown-select').text(getValue);
});
