var filterQuery;

$(document).ready(function() {
  // redirects to notification page
  if (screen.width < 768) {
    window.location.replace("/mobile")
  }
  // sets datepicker
  $(function() {
    $.datepicker.setDefaults(
      $.extend(
        $.datepicker.regional[language]
      )
    )
    $('.datepicker').each(function(){
      $(this).datepicker({
        altField: "#" + $(this).data('target'),
        altFormat: "yy-mm-dd" // format for database processing
      });
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

// dropdown for filter feature
$('.dropdown-menu.filter ol').on('click', function(e) {
  e.stopPropagation();
  if (e.target.tagName.toUpperCase() === "LABEL"
    || e.target.tagName.toUpperCase() === "SPAN"
    || e.target.tagName.toUpperCase() === "OL") {
    return;
  }
  var allDD = $('.dropdown-menu');
  var current = allDD.index($(this).parent())
  var getValue = $(this).text();
  var dropdownLabel = $('.dropdown-select')[current]
  if ($(this).children().children().is(':checked')) {
    dropdownLabel.innerHTML += getValue;
  } else {
    console.log(dropdownLabel.innerHTML);
    console.log(getValue);
    console.log(getValue.trim());
    dropdownLabel.innerHTML = dropdownLabel.textContent.replace(getValue.trim(), '');
    if (dropdownLabel.innerHTML.trim() == '') {
      dropdownLabel.innerHTML += getValue;
      $(this).children().children().prop('checked', true)
    }
  }
})

// search bar for the dropdown
function searchDropdown(id) {
  var input, search, dropdownItems, val;
  var allDD = $('.dropdown-menu');
  var current = allDD.index(id.parentElement)
  input = document.getElementsByClassName('dropdown-search')[current];
  search = input.value.toUpperCase();
  dropdownItems = document.getElementsByClassName('dropdown-menu')[current].querySelectorAll('li, ol');
  console.log(dropdownItems);
  console.log(search);
  for (var i = 0; i < dropdownItems.length; i++) {
    val = dropdownItems[i].textContent || dropdownItems[i].innerText;
    if (val.toUpperCase().indexOf(search) > -1) {
      dropdownItems[i].style.display = "";
    } else {
      dropdownItems[i].style.display = "none";
    }
  }
}

// manages filter functions
$('#display-create').click(() => {
  $('#filter-create').toggleClass('d-none')
})

$('#display-exit').click(() => {
  $('#filter-exit').toggleClass('d-none')
})

$('#display-advance').click(() => {
  $('#filter-advance').toggleClass('d-none')
})

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
    var data = {
      offset: loadedCount
    }
    if (filterQuery) { data.query = filterQuery }
    loadingState(true);
    $.post('entry/load-index', data)
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
          date.innerHTML = new Date(entry.entry_dt).toLocaleDateString(language, data.options);
          date.className = 'orange text-center';
          if (entry.status) {
            if (entry.result === 'win') {
              status.innerHTML = '<span class="pill pill-green d-block">' + entry.result.toUpperCase() + '</span>'
            } else if (entry.result === 'loss') {
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
          status.className = 'text-center';
          strategy.innerHTML = entry.strategy;
          timeframe.innerHTML = entry.timeframe;
        });

        if (data.dataList.length < 25) {
          loadedCount = 0;
        }
    })
      .fail(() => {
        // error
    })
  }
})

// Filter results
$('#apply-filter').click(() => {
  $("#modal-loading").modal();
  var filterPairs = $('input[name=pair]:checked').map(function(){
    return 'pair LIKE "' + this.value + '"';
  }).get().join(' || ');
  var filterCategories = $('input[name=category]:checked').map(function(){
    return 'entries.category LIKE "' + this.value + '"';
  }).get().join(' || ');
  var filterCreate, filterExit, filterSort, filterOrder;
  if ($('#display-create').is(":checked")) {
    filterCreate = $('input[name=create]').map(function(){
      return '"' + this.value + '"';
    }).get().join(' && ');
  }
  if ($('#display-exit').is(":checked")) {
    filterExit = $('input[name=exit]').map(function(){
      return '"' + this.value + '"';
    }).get().join(' && ');
  }
  var filterStrategies = $('input[name=strategy]:checked').map(function(){
    return 'strategy_id LIKE "' + this.value + '"';
  }).get().join(' || ');
  var filterTimeframes = $('input[name=timeframe]:checked').map(function(){
    return 'timeframe_id LIKE "' + this.value + '"';
  }).get().join(' || ');
  var filterResults = $('input[name=result]:checked').map(function(){
    return 'IFNULL(result, "open") LIKE "' + this.value + '"';
  }).get().join(' || ');
  filterSort = $('input[name=sort]:checked').val()
  filterOrder = $('input[name=order]:checked').val()
  var data = {
    pairs: filterPairs,
    categories: filterCategories,
    create: filterCreate,
    exit: filterExit,
    strategy: filterStrategies,
    timeframe: filterTimeframes,
    result: filterResults,
    sort: filterSort,
    order: filterOrder
  }
  $.post('entry/filter', data)
    .done((data) => {
      $('#index-table tbody').html('')
      // add new entries to the index list
      data.dataList.forEach((entry, i) => {
        var newRow = $('tbody')[0].insertRow();
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
        date.innerHTML = new Date(entry.entry_dt).toLocaleDateString(language, data.options);
        date.className = 'orange text-center';
        if (entry.status) {
          if (entry.result === 'win') {
            status.innerHTML = '<span class="pill pill-green d-block">' + entry.result.toUpperCase() + '</span>'
          } else if (entry.result === 'loss') {
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
        status.className = 'text-center';
        strategy.innerHTML = entry.strategy;
        timeframe.innerHTML = entry.timeframe;
      });
      filterQuery = data.query;
      loadedCount = 25;
      $("#modal-loading").modal('hide');
  })
    .fail(() => {

  })
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
    serverComment.value = clientComment.innerText.replace(/\n/g, "<br>");
  })
}
