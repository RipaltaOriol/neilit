// Tooltips
$(document).ready(function() {
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
});

// stores the goals's HTML to a variable
var begGoal = `<li class="mt-2 py-0 font-16 goal-li">
    <input type="text" value="`;
var endGoal = `" class="goal" readonly>
    <button type="button" class="float-right goal-delete" onclick="deleteGoal(this)">
      <img class="icon-20" src="/imgs/icons/delete.svg">
    </button>
  </li>
  `;

// deletes a goal
function deleteGoal(id) {
  var deleteList = $('.goal-delete');
  var current = deleteList.index(id);
  var deleteGoal = $('.goal-li')[current]
  var currentGoal = $('.goal')[current].value
  // deletes the goal from the server
  var data = {goal: currentGoal}
  $.post('/' + currentUser.username + '/settings/deleteGoal', data)
    .done((data) => {
    // deletes the goal from the client
    deleteGoal.remove();
  })
    .fail(() => {
    // error
  })
};


// adds a goal
$("#addGoal").keypress(function(event) {
  if(event.which === 13) {
    // get the user's input
    var newGoal = $(this).val();
    $(this).val("");
    // creates a new goal if there are less than five objectives
    if ($('#listGoals li').length < 5) {
      // adds goal to the server
      var data = {goal: newGoal}
      $.post('/' + currentUser.username + '/settings/newGoal', data)
        .done((data) => {
        // adds the goal to the client
        $("#listGoals").append(begGoal + newGoal + endGoal)
      })
        .fail(() => {
        // error
      })
    }
  }
});

// stores the strategy's HTML to a variable
var begStrategy = `<li class="mt-2 py-0 strategy-li">
    <input type="text" value="
  `;
var endStrategy = `" class="strategy" readonly>
    <button type="button" class="float-right strategy-delete" onclick="deleteStrategy(this)">
      <img class="icon-20" src="/imgs/icons/delete.svg">
    </button>
  </li>
  `;

// deletes a strategy
function deleteStrategy(id) {
  var deleteList = $('.strategy-delete');
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
    // gets the user's input
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

// changes the account's base currency
$('#currency.dropdown-menu li').on('click', function() {
  var changeCurrency = $(this).text();
  // adds currency changes to the server
  var data = {currency: changeCurrency}
  $.post('/' + currentUser.username + '/settings/changeCurrency', data)
    .done((data) => {
    // adds currency changes to the client
    $('.currency').text(changeCurrency);
  })
    .fail(() => {
    // error
  })
});

// changes show profits in entries preference
$('#show-profits').change(() => {
  var changeShowProfits = $('#show-profits').is(':checked') ? '1' : '0'
  // adds mode changes to the server
  var data = {showProfits: changeShowProfits}
  $.post('/' + currentUser.username + '/settings/changeShowProfits', data)
    .done((data) => {
    // success
  })
    .fail(() => {
    // error
  })
});

// changes dark mode preference
$('#dark').change(() => {
  var changeMode = $('#dark').is(':checked') ? '1' : '0'
  // adds mode changes to the server
  var data = {mode: changeMode}
  $.post('/' + currentUser.username + '/settings/changeMode', data)
    .done((data) => {
    window.localStorage.setItem('mode', '1');
    location.reload();
  })
    .fail(() => {
    // error
  })
});

// changes the account's language
function changeLanguage(lang) {
  var data = {lang: lang}
  $.post('/' + currentUser.username + '/settings/changeLanguage', data)
    .done((data) => {
    location.reload();
  })
    .fail(() => {
    // error
  })
}

// cancel subscription
function cancelSubscription() {
  return fetch('/' + username + '/settings/cancel-subscription', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    }
  })
    .then(response => {
      console.log('This response');
      return response.json();
    })
    .then(cancelSubscriptionResponse => {
      console.log('Almost there');
      window.location.href = "/" + username + "/settings";
    });
}

// cancels the susbscription
var form = document.getElementById('cancel-form');
if (form) {
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    cancelSubscription();
  })
}

// refresh page on setting's settings after mode change
if (window.localStorage.getItem('mode')) {
  $('#profile').removeClass('active')
  $('#settings').addClass('active')
  $('.nav-link')[0].classList.remove('active')
  $('.nav-link')[2].classList.add('active')
  window.localStorage.removeItem('mode');
}
