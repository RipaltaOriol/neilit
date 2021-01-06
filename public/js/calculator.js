$(document).ready(function() {
  // redirects to notification page
  if (screen.width < 768) {
    window.location.replace("/mobile")
  }
})

// risk calculator function
async function calcRisk(base) {
  $('#spinner-modal').modal('show');
  var data = {
    amount: $('#account-size').val(),
    risk: $('#ops-risk').val(),
    amount_risk: $('#trade-size').val(),
    stop_loss: $('#sl-pip').val(),
    pair: $('#dropdown-label').text().trim(),
    base: $('#dropdown-label').text().trim().split('/')[0],
    quote: $('#dropdown-label').text().trim().split('/')[1],
    account: $('#base').val()
  }
  $.post(document.URL + '/convert', data)
  .done((data) => {
    $('#spinner-modal').modal('hide');
    switch (data.status) {
      case 'error':
        $('#ajax-error').removeClass('d-none')
        $('#ajax-error').html(data.message)
        break;
    case 'success':
      $('#units-size').html(data.units)
      $('#lots-size').html(data.lots)
      break;
    }
  })
  .fail(() => {
  })
}

// dropdown to select a time period for statistics
$('.dropdown-menu li').on('click', function() {
  var allDD = $('.dropdown-menu');
  var current = allDD.index($(this).parent())
  var getValue = $(this).text();
  if ($('.dropdown-select')[current]) {
    $('.dropdown-select')[current].innerHTML = getValue;
  }
});

// quick access to dropdown elements
function changePair(pair) {
  $('.dropdown-select')[0].innerHTML = pair;
}

// search bar for the dropdown
function searchDropdown() {
  var input, search, dropdownItems, val;
  input = document.querySelector('#dropdown-search');
  search = input.value.toUpperCase();
  dropdownItems = document.getElementById('dropdown-items').getElementsByTagName('li');
  for (var i = 0; i < dropdownItems.length; i++) {
    val = dropdownItems[i].textContent || dropdownItems[i].innerText;
    if (val.toUpperCase().indexOf(search) > -1) {
      dropdownItems[i].style.display = "";
    } else {
      dropdownItems[i].style.display = "none";
    }
  }
}
