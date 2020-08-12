// Tooltips
$(document).ready(function() {
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
});

// Goals
$("#addGoal").keypress(function(event) {
  if(event.which === 13) {
    // get the user's input
    var newGoal = $(this).val();
    $(this).val("");
    var listGoals = document.getElementById('listGoals');
    var countGoals = listGoals.getElementsByTagName('li').length;
    // creates a new goad if there are less than five objectives
    if (countGoals < 5) {
      $("#listGoals").append('<li class="mt-2 font-16">' + newGoal + '</li>')
    }
    // adds the goal to the DB
    // COMBAK:
  }
});

// stores the strategy's HTML to a variable
var begStrategy = `<li class="mt-2 py-0 strategy-li">
    <input type="text" class="strategy" value="
  `;
var endStrategy = `" class="strategy">
    <button type="button" class="float-right delete" onclick="deleteStrategy(this)">
      <img class="icon-20" src="/imgs/icons/delete.svg">
    </button>
  </li>
  `;

// deletes a strategy
function deleteStrategy(id) {
  var deleteList = $('.delete');
  var current = deleteList.index(id);
  var deleteStrategy = $('.strategy-li')[current]
  var currentStrategy = $('.strategy')[current].value
  // deletes the strategy from the server
  var data = {strategy: currentStrategy}
  $.post('/' + currentUser.username + '/settings/deleteStrategy', data)
    .done((data) => {
    // deletes the strategy from the client
    deleteStrategy.remove();
  })
    .fail(() => {
    // error
  })
};

// adds a strategy
$("#addStrategy").keypress(function(event){
  if(event.which === 13){
    // gets the user input
    var newStrategy = $(this).val();
    $(this).val("");
    // adds the new strategy to the server
    var data = {strategy: newStrategy}
    $.post('/' + currentUser.username + '/settings/newStrategy', data)
      .done((data) => {
      // adds the new strategy to the client
      $("#listStrategy").append(begStrategy + newStrategy + endStrategy);
    })
      .fail(() => {
      // error
    })
  }
});

// Para seleccionar la moneda base de la cuenta
$('.dropdown-menu li').on('click', function() {
  var getValue = $(this).text();
  $('.dropdown-select').text(getValue);
});
