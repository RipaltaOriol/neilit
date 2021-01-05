$(document).ready(function() {
  // redirects to notification page
  if (screen.width < 768) {
    window.location.replace("/mobile")
  }
})

function isLoading(bool) {
  if (bool) {
    $('#loading-modal').modal('show')
  } else {
    $('#loading-modal').modal('hide')
  }
}

// dropdown for exit type
$('.exit-type li').on('click', function() {
  var allDD = $('.exit-type');
  var current = allDD.index($(this).parent())
  var getValue = $(this).text();
  if ($('.type-select')[current]) {
    $('.type-select')[current].innerHTML = getValue;
  }
  saveToDB({
    type: 'exits',
    method: 'type',
    id: $('.exit-id')[current].value,
    content: getValue
  })
})

// dropdown for exit order type
$('.exit-order li').on('click', function() {
  var allDD = $('.exit-order');
  var current = allDD.index($(this).parent())
  var getValue = $(this).text();
  if ($('.order-select')[current]) {
    $('.order-select')[current].innerHTML = getValue;
  }
  saveToDB({
    type: 'exits',
    method: 'order',
    id: $('.exit-id')[current].value,
    content: getValue
  })
})

// search bar for strategies
function searchStrategies(obj) {
  $('#index-strategies').html('')
  for (var i = 0; i < strategies.length; i++) {
    if (strategies[i].indexOf(obj.value) > -1) {
      console.log(strategies);
      console.log(strategiesID);
      if (strategies[i] != 'None') {
        $('#index-strategies').append(`
          <div class="strategy d-flex mx-3 p-2 mb-3">
            <div class="d-flex align-items-center flex-grow-1">
              <a href="strategies/` + strategiesID[i] + `">
                <h3 class="mb-0 strategy-name">` + strategies[i] + `</h3>
              </a>
            </div>
            <div class="justify-self-end strategy-actions">
              <a href="strategies/` + strategiesID[i] + `/edit" class="btn-neilit mr-2">
                <img src="/imgs/icons/edit.svg" alt="edit strategy">
              </a>
              <a href="statistics" class="btn-neilit mr-2">
                <img src="/imgs/icons/goto-stats.svg" alt="go to statistics">
              </a>
              <button type="submit" class="btn-neilit strategy-delete" onclick="openDeleteStrategy(this)">
                <img src="/imgs/icons/delete-white.svg" alt="delete">
              </button>
            </div>
          </div>
          `)
      }
    }
  }
}

// adds a new strategy
function addStrategy(obj) {
  obj.disabled = true;
  // gets the user's input
  var newStrategy = $('#strategy-value').val();
  $('#strategy-value').val('');
  // adds the new strategy to the server
  var data = {strategy: newStrategy}
  isLoading(true);
  $.post('/' + username + '/settings/newStrategy', data)
    .done((data) => {
      isLoading(false);
      switch (data.response) {
        case 'success':
          // adds the new strategy to the client
          $('#index-strategies').append(`
            <div class="strategy d-flex mx-3 p-2 mb-3">
              <div class="d-flex align-items-center flex-grow-1">
                <a href="strategies/` + data.id + `">
                  <h3 class="mb-0 strategy-name">` + newStrategy + `</h3>
                </a>
              </div>
              <div class="justify-self-end strategy-actions">
                <a href="strategies/` + data.id + `/edit" class="btn-neilit mr-2">
                  <img src="/imgs/icons/edit.svg" alt="edit strategy">
                </a>
                <a href="statistics" class="btn-neilit mr-2">
                  <img src="/imgs/icons/goto-stats.svg" alt="go to statistics">
                </a>
                <button type="submit" class="btn-neilit strategy-delete" onclick="openDeleteStrategy(this)">
                  <img src="/imgs/icons/delete-white.svg" alt="delete">
                </button>
              </div>
            </div>
            `)
          strategies.push(newStrategy)
          strategiesID.push(data.id)
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
  obj.disabled = false;
}

// opens modal for delete strategy
function openDeleteStrategy(id) {
  var deleteList = $('.strategy-delete');
  var current = deleteList.index(id);
  var currentStrategy = $('.strategy-name')[current].textContent
  $('#strategy-name').html(currentStrategy)
  $("#confirm-delete").off("click");
  $('#confirm-delete').click((e) => {
    deleteStrategy(id)
  })
  $('#delete-modal').modal('show')

}

// deletes a strategy
function deleteStrategy(id) {
  $('#delete-modal').modal('hide')
  var deleteList = $('.strategy-delete');
  var current = deleteList.index(id);
  var deleteStrategy = $('.strategy')[current]
  var currentStrategy = $('.strategy-name')[current].textContent
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
          strategies.splice(strategies.indexOf(currentStrategy), 1);
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

// allows row table toggling
$(function() {
  var textColor = (isDarkMode) ? "#dedad6" : "#212529";
  $("td[colspan=3]").find("div").hide();
  $("table").click(function(event) {
    event.stopPropagation();
    var $target = $(event.target);
    if ($target.closest("td").attr("colspan") < 3) {
      $target.slideUp();
    } else {
      if ($target.closest("tr").next().find("div").is(":hidden")) {
        $target.closest("tr").find('td').animate({
          color: "#ff8818"
        })
      } else {
        $target.closest("tr").find('td').animate({
          color: textColor
        })
      }
      $target.closest("tr").next().find("div").slideToggle();
    }
  });
});

// adds a new rule to a strategy
function addRule() {
  isSaving(true)
  saveToDB({
    type: 'rules',
    method: 'new',
    content: $('#rule-input').text()
  })
  $('#rules').append(`
    <li>
      <div class="d-flex justify-content-between">
        <span class="rule">` + $('#rule-input').text() + `</span>
        <span class="d-flex">
          <button type="button" class="p-1 delete" onclick="deleteRule(this)"><img src="/imgs/icons/delete.svg"></button>
        </span>
      </div>
    </li>
    `)
  $('#rule-input').html('')
}

// delete a strategy rule
function deleteRule(obj) {
  isSaving(true)
  saveToDB({
    type: 'rules',
    method: 'delete',
    content: $('.rule-id')[$('.delete').index(obj)].value
  })
  $('#rules li')[$('.delete').index(obj)].remove()
}

// allows rule sorting
$("#rules").sortable({
  axis: "y",
  cursor: "pointer",
  update: (event, ui) => {
    isSaving(true)
    var newRulesOrder = []
    var rules = $('.rule-id')
    for (var i = 0; i < rules.length; i++) {
      newRulesOrder.push(rules[i].value)
    }
    saveToDB({
      type: 'rules',
      method: 'order',
      content: newRulesOrder
    })
  }
})

// adds a new exit to the strategy
function addExit() {
  isSaving(true)
  saveToDB({
    type: 'exits',
    method: 'new',
  })

}

// adds the new observation to the frontend
function addExitFE(id) {
  $('#exits').append(`
    <div class="strategy-exit mb-3">
      <div class="row">
        <div class="col-12 col-lg-6 mb-2">
          <input type="text" class="d-none exit-id" value="` + id + `">
          <input class="exit-name w-100" type="text" value="" placeholder="Exit name">
        </div>
        <div class="col-6 col-lg-3 mb-2">
          <!-- dropdown -->
          <div class="dropdown">
            <button id="dropdown-label" class="dropdown-select p-1 px-2 w-100" type="button" data-toggle="dropdown">
              Loss
            </button>
            <ul id="dropdown-items" class="dropdown-menu" aria-labelledby="dropdown-label">
              <li>Loss</li>
              <li>Profit</li>
              <li>Add</li>
              <li>Reduce</li>
            </ul>
          </div>
        </div>
        <div class="col-6 col-lg-3 mb-2">
          <!-- dropdown -->
          <div class="dropdown">
            <button id="dropdown-label" class="dropdown-select p-1 px-2 w-100" type="button" data-toggle="dropdown">
              Market order
            </button>
            <ul id="dropdown-items" class="dropdown-menu" aria-labelledby="dropdown-label">
              <li>Market order</li>
              <li>Limit order</li>
              <li>Stop order</li>
              <li>Stop-Limit order</li>
              <li>Trailing order</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="d-flex justify-content-between">
        <div class="exit-description flex-grow-1 editcontent p-1 px-2" placeholder="Write a description for your strategy." contenteditable="true"></div>
        <span class="d-flex">
          <button type="button" class="delete-exit ml-2" onclick="deleteExit(this)"><img src="/imgs/icons/delete.svg"></button>
        </span>
      </div>
    </div>
    `
  )
  // allows changing exit title for new exits
  $('.exit-name').on('input propertychange change', (e) => {
    isSaving(true)
    // runs the saving animation
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        // Runs 1 second (1000 ms) after the last change
        saveToDB({
          type: 'exits',
          method: 'name',
          id: $('.exit-id')[$('.exit-name').index($(e.target))].value,
          content: $(e.target).val()
        })
    }, 1000);
  })
  // allows changing exit description for new exits
  $('.exit-description').on('input propertychange change', (e) => {
    isSaving(true)
    // runs the saving animation
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        // Runs 1 second (1000 ms) after the last change
        saveToDB({
          type: 'exits',
          method: 'description',
          id: $('.exit-id')[$('.exit-description').index($(e.target))].value,
          content: $('.exit-description')[$('.exit-description').index($(e.target))].innerText.replace(/\n/g, '<br>')
        })
    }, 1000);
  })
}

// loading animation
function isSaving(bool) {
  if (bool) {
    $('.save').removeClass('save').addClass('saving')
    .html(`
      ` + savingTxt + `
      <div class="spinner-border spinner-border-sm ml-1" role="status">
        <span class="visually-hidden"></span>
      </div>
      `)
  } else {
    $('.saving').removeClass('saving').addClass('save')
    .html(`
      ` + savedTxt + `
      <img class="ml-1" src="/imgs/icons/check-circle.svg">
      `)
  }
}

// saves content of description while typing
var timeoutId;
$('#description').on('input propertychange change', () => {
  isSaving(true)
  // runs the saving animation
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
      // Runs 1 second (1000 ms) after the last change
      saveToDB({
        type: 'description',
        content: document.getElementById('description').innerText.replace(/\n/g, '<br>')
      })
  }, 1000);
})

function saveToDB(data) {
  $.ajax({
    url: '/' + username + '/strategies/' + strategyID,
    type: 'PUT',
    data: data,
    success: function(result) {
      if (result.status == 'done') {
        isSaving(false)
        if (result.type == 'exit') {
          addExitFE(result.id)
        }
        if (result.type == 'observation') {
          addObservationFE(result.id)
        }
      }
    }
  })
}

// saves exit name while typing
$('.exit-name').on('input propertychange change', (e) => {
  isSaving(true)
  // runs the saving animation
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
      // Runs 1 second (1000 ms) after the last change
      saveToDB({
        type: 'exits',
        method: 'name',
        id: $('.exit-id')[$('.exit-name').index($(e.target))].value,
        content: $(e.target).val()
      })
  }, 1000);
})

// saves exit description while typing
$('.exit-description').on('input propertychange change', (e) => {
  isSaving(true)
  // runs the saving animation
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
      // Runs 1 second (1000 ms) after the last change
      saveToDB({
        type: 'exits',
        method: 'description',
        id: $('.exit-id')[$('.exit-description').index($(e.target))].value,
        content: $('.exit-description')[$('.exit-description').index($(e.target))].innerText.replace(/\n/g, '<br>')
      })
  }, 1000);
})

// delete a strategy exit
function deleteExit(obj) {
  isSaving(true)
  saveToDB({
    type: 'exits',
    method: 'delete',
    content: $('.exit-id')[$('.delete-exit').index(obj)].value
  })
  $('.strategy-exit')[$('.delete-exit').index(obj)].remove()
}

// adds a new observation to the strategy
function addObservation() {
  isSaving(true)
  saveToDB({
    type: 'observations',
    method: 'new',
  })
}

// adds the new observation to the frontend
function addObservationFE(id) {
  $('#observations').append(`
    <div class="observation d-flex justify-content-between py-3 mb-3">
      <input type="text" class="d-none observation-id" value="` + id + `">
      <div class="observation-description flex-grow-1 editcontent p-2" placeholder="Write any observations you have spotted." contenteditable="true"></div>
      <span class="d-flex">
        <button type="button" class="m-2 delete-obs" onclick="deleteObs(this)"><img src="/imgs/icons/delete.svg"></button>
      </span>
    </div>
    `
  )
  $('.observation-description').on('input propertychange change', (e) => {
    isSaving(true)
    // runs the saving animation
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        // Runs 1 second (1000 ms) after the last change
        console.log();
        saveToDB({
          type: 'observations',
          method: 'description',
          id: $('.observation-id')[$('.observation-description').index($(e.target))].value,
          content: $('.observation-description')[$('.observation-description').index($(e.target))].innerText.replace(/\n/g, '<br>')
        })
    }, 1000);
  })
}

// saves an observation while typing
$('.observation-description').on('input propertychange change', (e) => {
  isSaving(true)
  // runs the saving animation
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
      // Runs 1 second (1000 ms) after the last change
      console.log();
      saveToDB({
        type: 'observations',
        method: 'description',
        id: $('.observation-id')[$('.observation-description').index($(e.target))].value,
        content: $('.observation-description')[$('.observation-description').index($(e.target))].innerText.replace(/\n/g, '<br>')
      })
  }, 1000);
})

// delete a strategy observation
function deleteObs(obj) {
  isSaving(true)
  saveToDB({
    type: 'observations',
    method: 'delete',
    content: $('.observation-id')[$('.delete-obs').index(obj)].value
  })
  $('.observation')[$('.delete-obs').index(obj)].remove()
}
