$(document).ready(function() {
  // sets datepicker
  $(function() {
    $('.datepicker').each(function(){
      $(this).datepicker({
        altField: "#" + $(this).data('target'),
        altFormat: "yy-mm-dd" // format for database processing
      });
      $(this).datepicker($.datepicker.regional[language]);
    });
  });
  // prevents the classic datepicker from loading
  $("input[type=date]").on('click', function() {
    return false;
  });
})

var storeEntry = document.getElementById('submit-entry')
var clientComment = document.getElementById("client-comment");
var serverComment = document.getElementById("server-comment");

// Sets placeholder for comment input
jQuery(function($){
  $("#client-comment").focusout(function(){
    var element = $(this);
    if (!element.text().replace(" ", "").length) {
      element.empty();
    }
  });
});

// dropdown to select a time period for statistics
$('.dropdown-menu li').on('click', function() {
  var allDD = $('.dropdown-menu');
  var current = allDD.index($(this).parent())
  var getValue = $(this).text();
  if ($('.dropdown-server')[current]) {
    $('.dropdown-server')[current].value = this.className;
  }
  if ($('.dropdown-select')[current]) {
    $('.dropdown-select')[current].innerHTML = getValue;
  }
});

// search bar for the dropdown
function searchDropdown(id) {
  var input, search, dropdownItems, val;
  var allDD = $('.dropdown-menu');
  var current = allDD.index(id.parentElement)
  input = document.getElementsByClassName('dropdown-search')[current];
  search = input.value.toUpperCase();
  dropdownItems = document.getElementsByClassName('dropdown-menu')[current].getElementsByTagName('li');
  for (var i = 0; i < dropdownItems.length; i++) {
    val = dropdownItems[i].textContent || dropdownItems[i].innerText;
    if (val.toUpperCase().indexOf(search) > -1) {
      dropdownItems[i].style.display = "";
    } else {
      dropdownItems[i].style.display = "none";
    }
  }
}

// manages the spinner on loading processes
function loadingState(bool) {
  if (bool) {
    $('#spinner').removeClass('d-none')
  } else {
    $('#spinner').addClass('d-none')
  }
}

// Infinite scroll
let loadedCount = 25;
$('.table-scroll').scroll(() => {
  var $el = $('.table-scroll');
  var $eh = $('.table-scroll')[0];
  if ($el.innerHeight() + $el.scrollTop() >= $eh.scrollHeight - 5 && loadedCount) {
    loadingState(true);
    $.post('entry/load-index', {offset: loadedCount})
      .done((data) => {
        loadedCount+= 25;
        loadingState(false);
        // add new data to index table
        var table = $('tbody')[0];
        data.dataList.forEach((entry) => {
          var newRow = table.insertRow();
          var createHandler = function() { return function() { window.location.href = 'entry/' + entry.id; } }
          var pair      = newRow.insertCell(0);
          var date      = newRow.insertCell(1);
          var status    = newRow.insertCell(2);
          var strategy  = newRow.insertCell(3);
          var timeframe = newRow.insertCell(4);
          newRow.onclick = createHandler();
          // adds acutal data
          pair.innerHTML = entry.pair;
          pair.className = 'orange';
          date.innerHTML = entry.date;
          date.className = 'orange';
          if (entry.status) {
            if (entry.result = 'win') {
              status.innerHTML = '<span class="pill pill-green d-block">' + entry.result.toUpperCase() + '</span>'
            } else if (entry.result = 'loss') {
              status.innerHTML = '<span class="pill pill-red d-block">' + entry.result.toUpperCase() + '</span>'
            } else {
              status.innerHTML = '<span class="pill pill-yellow d-block">' + entry.result.toUpperCase() + '</span>'
            }
          } else {
            var icon = document.createElement('img');
            icon.src = '/imgs/icons/open-ops.svg';
            icon.classList = 'simple-img'
            status.appendChild(icon);
          }
          strategy.innerHTML = entry.strategy;
          timeframe.innerHTML = entry.timeframe;
        });

        if (data.dataList.length < 25) {
          loadedCount = 0;
        }
    })
      .fail(() => {

    })
  }
})

// Dispaly fields for entry close
function displayClose(close) {
  if (close == 0) {
    document.getElementById('entry-closure').classList.add("d-none");
    document.getElementById('entry-closure').classList.remove("d-flex");
  } else {
    document.getElementById('entry-closure').classList.remove("d-none");
    document.getElementById('entry-closure').classList.add("d-flex");
  }
}

// Connects a technical analysis to the entry
function connectTa(index) {
  var connectedId = tas.id[index]
  document.getElementById('ta').value = connectedId;
  $('#entry-ta').removeClass('d-none')
  var connectedTa = tas.title[index]
  $('#connect-ta').text(connectedTa);
}

// Hides the technical analysis associated to the entry
$('#noneTa').click(() => {
  $('#entry-ta').addClass('d-none')
})

// Checks the format of entry time before the form submisison
function checkTime(form) {
  var entryTime = document.getElementById('entry-time').value;
  // blank entry time is valid
  if (entryTime == ''){
    form.submit();
    return true;
  // ensures that entry time has length five and contains only numbers
  } else if (entryTime.length == 5) {
    var logicOperator = true;
    for (var i = 0; i < entryTime.length; i++) {
      logicOperator = logicOperator && ((entryTime[i] >= '0' && entryTime[i] <= '9') || (entryTime[i] == ':'));
    }
    if (logicOperator) {
      form.submit();
      return true;
    }
  // otherwise the inputs gets rejected and the form submission is prevented
  } else {
    var localError = document.getElementById('local-alert');
    localError.classList.remove('d-none');
    window.scrollTo(0, 0);
    return false;
  }
}

// Runs before making the POST request
if (storeEntry != null) {
  storeEntry.addEventListener('click', () => {
    // sends the comment to the server
    serverComment.value = clientComment.textContent || clientComment.innerText;
  })
}
