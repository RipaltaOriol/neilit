var storeBacktest = document.getElementById("submit-backtest");
var updateBacktest = document.getElementById("update-backtest");
var indexPill1 = '<span class="pill pill-yellow">'
var indexPill2 = '</span>'
var filterQuery;
var serverData = { }

$(document).ready(function() {
  // redirects to notification page
  if (screen.width < 768) {
    window.location.replace("/mobile")
  }
});

// manages the spinner on loading processes
function loadingState(bool) {
  if (bool) {
    $('#spinner').removeClass('d-none')
  } else {
    $('#spinner').addClass('d-none')
  }
}

// toggles the pair selection when the multiples checkbox is clicked
function letPair(bool) {
  if (bool) {
    $('#dropdown-pairs').removeClass('d-none');
    $('#dropdown-pairs').addClass('d-inline');
  } else {
    $('#dropdown-pairs').removeClass('d-inline');
    $('#dropdown-pairs').addClass('d-none');
  }
}

// toggles the timeframe selection when the multiples checkbox is clicked
function letTimeframe(bool) {
  if (bool) {
    $('#dropdown-timeframes').removeClass('d-none');
    $('#dropdown-timeframes').addClass('d-inline');
  } else {
    $('#dropdown-timeframes').removeClass('d-inline');
    $('#dropdown-timeframes').addClass('d-none');
  }
}

// toggles the strategy selection when the multiples checkbox is clicked
function letStrategy(bool) {
  if (bool) {
    $('#dropdown-strategies').removeClass('d-none');
    $('#dropdown-strategies').addClass('d-inline');
  } else {
    $('#dropdown-strategies').removeClass('d-inline');
    $('#dropdown-strategies').addClass('d-none');
  }
}

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
    dropdownLabel.innerHTML = dropdownLabel.textContent.replace(getValue.trim(), '');
    if (dropdownLabel.innerHTML.trim() == '') {
      dropdownLabel.innerHTML += getValue;
      $(this).children().children().prop('checked', true)
    }
  }
})

// manages filter functions
$('#display-create').click(() => {
  $('#filter-create').toggleClass('d-none')
})

$('#display-advance').click(() => {
  $('#filter-advance').toggleClass('d-none')
})

// search bar for the dropdown
function searchDropdown(id) {
  var input, search, dropdownItems, val;
  var allDD = $('.dropdown-menu');
  var current = allDD.index(id.parentElement)
  input = document.getElementsByClassName('dropdown-search')[current];
  search = input.value.toUpperCase();
  dropdownItems = document.getElementsByClassName('dropdown-menu')[current].querySelectorAll('li, ol');
  for (var i = 0; i < dropdownItems.length; i++) {
    val = dropdownItems[i].textContent || dropdownItems[i].innerText;
    if (val.toUpperCase().indexOf(search) > -1) {
      dropdownItems[i].style.display = "";
    } else {
      dropdownItems[i].style.display = "none";
    }
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
    $.post('backtest/load-index', data)
      .done((data) => {
        loadedCount+= 25;
        loadingState(false);
        // add new data to index table
        var table = $('tbody')[0];
        data.dataList.forEach((backtest) => {
          var newRow = table.insertRow();
          var createHandler = function() { return function() { window.location.href = 'backtest/' + backtest.id; } }
          var date          = newRow.insertCell(0);
          var result        = newRow.insertCell(1);
          var pair          = newRow.insertCell(2);
          var strategy      = newRow.insertCell(3);
          var timeframe     = newRow.insertCell(4);
          newRow.onclick = createHandler();
          // adds acutal data
          date.innerHTML = new Date(backtest.created_at).toLocaleDateString(language, data.options);
          date.className = 'text-left';
          result.innerHTML = backtest.result;
          if (backtest.pair != null) {
            pair.innerHTML = indexPill1 + backtest.pair + indexPill2
          } else {
            pair.innerHTML = data.multipleText;

          }
          if (backtest.strategy != null) {
            strategy.innerHTML = indexPill1 + backtest.strategy + indexPill2
          } else {
            strategy.innerHTML = data.multipleText
          }
          if (backtest.timeframe != null) {
            timeframe.innerHTML = indexPill1 + backtest.timeframe + indexPill2
          }  else {
            timeframe.innerHTML = data.multipleText;
          }
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

// filter results
$('#apply-filter').click(() => {
  $("#modal-loading").modal();
  var filterPairs = $('input[name=pair]:checked').map(function(){
    return 'pair LIKE "' + this.value + '"';
  }).get().join(' || ');
  var filterStrategies = $('input[name=strategy]:checked').map(function(){
    return 'strategy_id LIKE "' + this.value + '"';
  }).get().join(' || ');
  var filterTimeframes = $('input[name=timeframe]:checked').map(function(){
    return 'timeframe_id LIKE "' + this.value + '"';
  }).get().join(' || ');
  var filterResults = $('input[name=result]:checked').map(function(){
    return 'result LIKE "' + this.value + '"';
  }).get().join(' || ');
  var filterCreate, filterSort, filterOrder;
  if ($('#display-create').is(":checked")) {
    filterCreate = $('input[name=create]').map(function(){
      return '"' + this.value + '"';
    }).get().join(' && ');
  }
  filterSort = $('input[name=sort]:checked').val()
  filterOrder = $('input[name=order]:checked').val()
  var data = {
    create: filterCreate,
    pairs: filterPairs,
    strategy: filterStrategies,
    timeframe: filterTimeframes,
    result: filterResults,
    sort: filterSort,
    order: filterOrder
  }
  $.post('backtest/filter', data)
    .done((data) => {
      $('#index-table tbody').html('')
      data.dataList.forEach((backtest) => {
        var newRow = $('tbody')[0].insertRow();
        var createHandler = function() { return function() { window.location.href = 'backtest/' + backtest.id; } }
        var date          = newRow.insertCell(0);
        var result        = newRow.insertCell(1);
        var pair          = newRow.insertCell(2);
        var strategy      = newRow.insertCell(3);
        var timeframe     = newRow.insertCell(4);
        newRow.onclick = createHandler();
        // adds acutal data
        date.innerHTML = new Date(backtest.created_at).toLocaleDateString(language, data.options);
        date.className = 'text-left';
        result.innerHTML = backtest.result;
        if (backtest.pair != null) {
          pair.innerHTML = indexPill1 + backtest.pair + indexPill2
        } else {
          pair.innerHTML = data.multipleText;

        }
        if (backtest.strategy != null) {
          strategy.innerHTML = indexPill1 + backtest.strategy + indexPill2
        } else {
          strategy.innerHTML = data.multipleText
        }
        if (backtest.timeframe != null) {
          timeframe.innerHTML = indexPill1 + backtest.timeframe + indexPill2
        }  else {
          timeframe.innerHTML = data.multipleText;
        }
      });
      filterQuery = data.query;
      loadedCount = 25;
      $("#modal-loading").modal('hide');
  })
    .fail(() => {

  })
})

// adds a new list parameter to the backtest
function addList() {
  if ($('#addons').children().length < 6) {
    $('#addons').append(addons.list);
    $('.info').tooltip('enable');
  }
}

// changes the addon parameter to integer based list
function intOption(element) {
  var allInts = $('.int-list');
  var currentAddon = document.getElementsByClassName('option')[allInts.index(element)];
  var allOptions = currentAddon.getElementsByClassName('option-list');
  // toggles the 'read only' property in the text option fields
  for (var i = 0; i < allOptions.length; i++) {
    allOptions[i].toggleAttribute('readonly');
  }
  var currentInt = $('.int-input')[allInts.index(element)];
  if (currentInt.value == 0) {
    currentInt.value = 1;
  } else {
    currentInt.value = 0;
  }
}

// prevents form submission when pressing enter on a text input
function newOption(element) {
  var parent = element.parentElement;
  var allOptions = parent.getElementsByClassName('option-list');
  if (window.event.keyCode == 13) {
    var current;
    for (var i = 0; i < allOptions.length; i++) {
      if (allOptions[i] == element) {
        current = i;
      }
    }
    // prevents adding more options if there are six existing options
    if (allOptions.length < 6) {
      if (allOptions.length - 1 == current) {
        parent.insertAdjacentHTML('beforeend', addons.newOption);
      }
    }
  }
  // prevents the form from submiting
  return !(window.event && window.event.keyCode == 13);
}

// adds a new option for an addon
function addOption(id) {
  var count = id.parentElement.previousElementSibling.childElementCount;
  if (count < 7) {
    id.parentElement.previousElementSibling.insertAdjacentHTML('beforeend', addons.newOption);
    if (count == 6) {
      id.disabled = true;
    }
  }
}

// counts the options for each addon
function countOptions() {
  var allOptions = $('.option');
  for (var i = 0; i < allOptions.length; i++) {
    var currentInt = $('.int-input')[i];
    $('.option-array')[i].value = allOptions[i].getElementsByClassName('option-list').length;
  }
}

// counts & updates the rows count of the backtest table
function countTableRows() {
  if (document.getElementById('backtest-table')) {
    var backtestRowCount = document.getElementById('backtest-table').rows.length;
  }
  var backtestCountLabel = document.getElementById('table-count');
  if (backtestCountLabel != null) {
    backtestCountLabel.innerHTML = backtestRowCount - 1;
  }
}

if (storeBacktest != null) {
  storeBacktest.addEventListener('click', () => {
    countOptions();
  })
}

function reIndexRows() {
  for (var i = 0; i < $('.identifier').length; i++) {
    $('.identifier')[i].innerHTML = 1 + i;
  }
}

// sets the fields of the modal to 0 or origin
function cleanModal() {
  $('#row-index').html($('.identifier').length + 1)
  if (backtest.pair != null) {
    $('.pair').text(backtest.pair)
  } else {
    $('.pair').text(currencies[0][0])
  }
  $('#row-result').val('')
  if (backtest.strategy != null) {
    $('.strategy').text(backtest.strategy)
  } else {
    $('.strategy').text(strategies[0])
  }
  if (backtest.timeframe != null) {
    $('.timeframe').text(backtest.timeframe)
  } else {
    $('.timeframe').text(timeframes[0])
  }
  $('#update-row').hide();
  $('#create-row').show();
}

// selects the given row to be modified
function editRow(id) {
  $('#create-row').hide();
  $('#update-row').show();
  var rowDirection = $('.direction')[0];
  var rowPair = $('.pair');
  var rowResult = document.getElementById('row-result');
  var rowStrategy = $('.strategy');
  var rowTimeframe = $('.timeframe');
  var editList = $('.edit-row')
  var current = editList.index(id)
  document.getElementById('row-index').innerHTML = current + 1;
  var row = document.getElementsByTagName('tr')[current + 1];
  var editDirection = row.getElementsByTagName('td')[1].innerText;
  rowDirection.innerHTML = editDirection;
  var editResult = row.getElementsByTagName('td')[2];
  rowResult.value = editResult.innerHTML.split(' ', 1);
  rowPair.innerHTML = row.getElementsByTagName('td')[3].innerText;
  rowStrategy.innerHTML = row.getElementsByTagName('td')[4].innerText;
  rowTimeframe.innerHTML = row.getElementsByTagName('td')[5].innerText;
  // adds the addons fields if required
  if (row.getElementsByTagName('td').length > 7) {
    var addonCount = 0;
    for (var i = 6; i < row.getElementsByTagName('td').length - 1; i++) {
      var addonList = document.getElementsByClassName('addon');
      var rowAddon = addonList[addonCount];
      if (addons[addonCount].is_integers) {
        var editAddon = row.getElementsByTagName('td')[i];
        rowAddon.value = editAddon.innerText;
      } else {
        var editAddon = row.getElementsByTagName('td')[i];
        rowAddon.innerHTML = editAddon.innerText;
      }
      addonCount += 1;
    }
  }
}

// updates an existing row with a new set of values
function updateRow() {
  var currentIndex = document.getElementById('row-index');
  var currentDirection = $('.direction')[0];
  var currentResult = document.getElementById('row-result');
  var currentPair = $('.pair')[0];
  var currentStrategy = $('.strategy')[0];
  var currentTimeframe = $('.timeframe')[0];
  var row = document.getElementsByTagName('tr')[currentIndex.innerText].getElementsByTagName('td');
  row[1].innerHTML = currentDirection.textContent || currentDirection.innerText;
  if (currentDirection.innerText == 'Long' || currentDirection.innerText == 'Compra') {
    row[1].classList = 'long'
  } else {
    row[1].classList = 'short'
  }
  row[2].innerHTML = currentResult.value + ' ' + backtest.result;
  row[3].innerHTML = currentPair.textContent || currentPair.innerText;
  row[4].innerHTML = currentStrategy.textContent || currentStrategy.innerText;
  row[4].classList = strategiesID[strategies.indexOf(currentStrategy.innerText)];
  row[5].innerHTML = currentTimeframe.textContent || currentTimeframe.innerText;
  row[5].classList = timeframes.indexOf(currentTimeframe.innerText) + 1;
  // updates the data in the addon fields
  var addonList = document.getElementsByClassName('addon');
  for (var i = 0; i < addonList.length; i++) {
    if (addons[i].is_integers) {
      row[6 + i].innerHTML = addonList[i].value;
      row[6 + i].classList = addonList[i].value;
    } else {
      for (var y = 1; y < 7; y++) {
        if (addons[i]['option' + y] == addonList[i].innerText) {
          row[6 + i].classList = y;
          row[6 + i].innerHTML = addonList[i].textContent || addonList[i].innerText;
        }
      }
    }
  }
}

// create a new row with the give value
function createRow() {
  var table = document.getElementById("backtest-table").getElementsByTagName('tbody')[0];
  var currentRow = document.getElementsByTagName('tr').length - 1;
  var currentDirection = $('.direction')[0].textContent || $('.direction')[0].innerText;
  var currentResult = document.getElementById('row-result').value;
  // early exit if result is no defined
  if (currentResult == '') { return; }
  var currentPair = $('.pair')[0].textContent || $('.pair')[0].innerText;
  var currentStrategy = $('.strategy')[0].textContent || $('.strategy')[0].innerText;
  var currentTimeframe = $('.timeframe')[0].textContent || $('.timeframe')[0].innerText;
  var row = table.insertRow(currentRow);
  var indexCell = row.insertCell();
  indexCell.innerHTML = currentRow + 1
  indexCell.className = 'identifier';
  var directionCell = row.insertCell();
  directionCell.innerHTML = currentDirection;
  if (currentDirection == 'Long' || currentDirection == 'Compra') {
    directionCell.classList = 'long'
  } else {
    directionCell.classList = 'short'
  }
  var resultCell = row.insertCell();
  resultCell.innerHTML = parseFloat(currentResult).toFixed(2) + ' ' + backtest.result;
  resultCell.className = 'text-right';
  var pairCell = row.insertCell().innerHTML = currentPair;
  var strategyCell = row.insertCell();
  strategyCell.innerHTML = currentStrategy;
  strategyCell.className = strategiesID[strategies.indexOf(currentStrategy)];
  var timeframeCell = row.insertCell();
  timeframeCell.innerHTML = currentTimeframe;
  timeframeCell.classList = timeframes.indexOf(currentTimeframe) + 1;
  currentResult.value = '';
  // adds the data on the addons fields
  var addonList = document.getElementsByClassName('addon');
  if (addons.length > 0) {
    addons.forEach((addon, i) => {
      var currentAddon = addonList[i];
      var addonCell = row.insertCell();
      if (addon.is_integers) {
        addonCell.innerHTML = currentAddon.value;
        addonCell.classList = currentAddon.value;
      } else {
        for (var y = 1; y < 7; y++) {
          if (addons[i]['option' + y] == currentAddon.innerText) {
            addonCell.classList = y;
            addonCell.innerHTML = currentAddon.textContent || currentAddon.innerText;
          }
        }
      }
    });
    countTableRows();
  }
  // add the edit and delete values to the new row
  var buttonsCell = row.insertCell();
  // delete button
  var deleteImg = document.createElement('img');
  deleteImg.setAttribute('src', '/imgs/icons/delete.svg');
  deleteImg.setAttribute('alt', 'delete row');
  var deleteBtn = document.createElement('button');
  deleteBtn.setAttribute('type', 'button');
  deleteBtn.className = 'table-action delete-row';
  deleteBtn.setAttribute('onclick', 'deleteRow(this)');
  deleteBtn.appendChild(deleteImg);
  // edit button
  var editImg = document.createElement('img');
  editImg.setAttribute('src', '/imgs/icons/edit.svg');
  editImg.setAttribute('alt', 'edit row');
  var editBtn = document.createElement('button');
  editBtn.setAttribute('type', 'button');
  editBtn.className = 'table-action edit-row';
  editBtn.setAttribute('data-toggle', 'modal');
  editBtn.setAttribute('data-target', '.modal-row');
  editBtn.setAttribute('onclick', 'editRow(this)');
  editBtn.appendChild(editImg);
  buttonsCell.appendChild(deleteBtn)
  buttonsCell.appendChild(editBtn)
  buttonsCell.className = 'text-center';
}

// deletes the row in the given index
function deleteRow(id) {
  var deleteList = $('.delete-row')
  var current = deleteList.index(id);
  var row = document.getElementsByTagName('tr')[current + 1];
  row.remove();
  reIndexRows();
  countTableRows();
}

// retrieves the data from the backtest table
function retrieveData() {
  serverData.data = []
  serverData.addons = []
  var rows = $('tbody tr')
  for (var i = 0; i < rows.length; i++) {
    serverData.data.push([])
    serverData.data[i].push(parseInt($('.identifier')[i].textContent))
    serverData.data[i].push(backtest.id)
    serverData.data[i].push(rows[i].getElementsByTagName('td')[1].classList[0]);
    serverData.data[i].push(parseFloat(rows[i].getElementsByTagName('td')[2].innerText.split(' ')[0]));
    serverData.data[i].push(rows[i].getElementsByTagName('td')[3].innerText);
    serverData.data[i].push(parseInt(rows[i].getElementsByTagName('td')[4].classList[0]));
    serverData.data[i].push(parseInt(rows[i].getElementsByTagName('td')[5].classList[0]));
    for (var y = 0; y < addons.length; y++) {
      serverData.addons.push([y + 1, parseInt(rows[i].getElementsByTagName('td')[6 + y].classList[0]), backtest.id])
    }
  }
}

// sends the data from the updated backtest to the server side
if (updateBacktest != null) {
  updateBacktest.addEventListener('click', (e) => {
    $('#modal-loading').modal('show')
    retrieveData();
    $('#obj').val(JSON.stringify(serverData))
  })
}

countTableRows();
