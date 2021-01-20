$(document).ready(function() {
  // redirects to notification page
  if (screen.width < 768) {
    window.location.replace("/mobile")
  }
  if (document.referrer != window.location.href)
  window.localStorage.setItem('prev', document.referrer);
});

function isLoading(bool) {
  if (bool) {
    $('#loading-modal').modal('show')
  } else {
    $('#loading-modal').modal('hide')
  }
}

// stores the goals's HTML to a variable
var begGoal = `<li class="mt-2 py-0 font-16 goal-li">
    <span class="goal">`;
var endGoal = `</span>
    <button type="button" class="float-right goal-delete" onclick="deleteGoal(this)">
      <img class="icon-20" src="/imgs/icons/delete.svg">
    </button>
  </li>
  `;

// stores the asset's HTML to a variable
var begAsset = `<li class="mt-2 py-0 font-16 asset-li">
    <span class="asset-name">`;
var endAsset = `</span>
    <button type="button" class="float-right asset-delete" onclick="deleteAsset(this)">
      <img class="icon-20" src="/imgs/icons/delete.svg">
    </button>
  </li>
  `;

// back button
$('#back').click(() => {
  var prev = window.localStorage.getItem('prev')
  window.localStorage.removeItem('prev');
  window.location.href = prev
})

// deletes a goal
function deleteGoal(id) {
  var deleteList = $('.goal-delete');
  var current = deleteList.index(id);
  var deleteGoal = $('.goal-li')[current]
  var currentGoal = $('.goal')[current].innerText
  // deletes the goal from the server
  var data = {goal: currentGoal}
  $.post('/' + username + '/settings/deleteGoal', data)
    .done((data) => {
    // deletes the goal from the client
    deleteGoal.remove();
  })
    .fail(() => {
    // error
  })
}


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
      $.post('/' + username + '/settings/newGoal', data)
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
    <span class="strategy">`;
var endStrategy = `</span>
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
  var currentStrategy = $('.strategy')[current].innerText
  // deletes the strategy from the server
  var data = {strategy: currentStrategy}
  isLoading(true);
  $.post('/' + username + '/settings/deleteStrategy', data)
    .done((data) => {
      isLoading(false);
      switch (data.response) {
        case 'success':
          // deletes the strategy from the client
          deleteStrategy.remove();
          break;
        case 'error':
          $('#error-alert').removeClass('d-none')
          $('#error-text span').text(data.message)
          window.scrollTo(0, 0);
          break;
      }
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
    isLoading(true);
    $.post('/' + username + '/settings/newStrategy', data)
      .done((data) => {
        isLoading(false);
        switch (data.response) {
          case 'success':
            // adds the new strategy to the client
            $("#listStrategy").append(begStrategy + newStrategy + endStrategy);
            break;
          case 'error':
            $('#error-alert').removeClass('d-none')
            $('#error-text span').text(data.message)
            window.scrollTo(0, 0);
            break;
        }
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
  $.post('/' + username + '/settings/changeCurrency', data)
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
  $.post('/' + username + '/settings/changeShowProfits', data)
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
  $.post('/' + username + '/settings/changeMode', data)
    .done((data) => {
      window.localStorage.setItem('mode', '1');
      location.reload();
  })
    .fail(() => {
    // error
  })
});

// changes forex assets inclusion
$('#forex').change(() => {
  var changeMode = $('#forex').is(':checked') ? '1' : '0'
  // adds mode changes to the server
  var data = {type: 'Forex', mode: changeMode}
  $.post('/' + username + '/settings/toggleAssets', data)
    .done((data) => {
  })
    .fail(() => {
    // error
  })
});

// changes cyrpto assets inclusion
$('#crypto').change(() => {
  var changeMode = $('#crypto').is(':checked') ? '1' : '0'
  console.log(changeMode);
  // adds mode changes to the server
  var data = {type: 'Crypto', mode: changeMode}
  $.post('/' + username + '/settings/toggleAssets', data)
    .done((data) => {
      // sucess
  })
    .fail(() => {
    // error
  })
});

// changes the account's language
function changeLanguage(lang) {
  var data = {lang: lang}
  $.post('/' + username + '/settings/changeLanguage', data)
    .done((data) => {
      window.localStorage.setItem('mode', '1');
      location.reload();
  })
    .fail(() => {
    // error
  })
}

// changes the asset category dropdown
$('.dropdown-menu.cateogry li').on('click', function() {
  var allDD = $('.dropdown-menu');
  var current = allDD.index($(this).parent())
  var getValue = $(this).text();
  if ($('.dropdown-select')[current]) {
    $('.dropdown-select')[current].innerHTML = getValue;
  }
});

// creates a new asset
$('#create-asset').click(() => {
  if ($('#asset-name').val() != '') {
    var newAsset = $('#asset-name').val();
    var data = {
      category: $('.asset')[0].innerText,
      pair: $('#asset-name').val()
    }
    isLoading(true);
    $('#asset-name').val('')
    $.post('/' + username + '/settings/addAsset', data)
      .done((data) => {
        isLoading(false);
        console.log(data);
        switch (data.response) {
          case 'success':
            // adds the new asset to the client
            $("#listAsets").append(begAsset + newAsset + endAsset);
            break;
          case 'error':
            $('#error-alert').removeClass('d-none')
            $('#error-text span').text(data.message)
            window.scrollTo(0, 0);
            break;
        }
    })
      .fail(() => {
      // error
    })
  }
})

// deletes an asset
function deleteAsset(id) {
  var deleteList = $('.asset-delete');
  var current = deleteList.index(id);
  var deleteAsset = $('.asset-li')[current]
  var currentAsset = $('.asset-name')[current].innerText
  // deletes the asset from the server
  var data = {asset: currentAsset}
  $.post('/' + username + '/settings/deleteAsset', data)
    .done((data) => {
    // deletes the asset from the client
    deleteAsset.remove();
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
  $('#settings').tab('show')
  $('.nav-link')[2].classList.add('active')
  window.localStorage.removeItem('mode');
} else {
  $('#profile').tab('show')
  $('.nav-link')[0].classList.add('active')
}
