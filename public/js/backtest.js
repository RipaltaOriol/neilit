var storeBacktest = document.getElementById("submit-backtest");
var updateBacktest = document.getElementById("update-backtest");
const serverData = { backtest: backtest }

// toggles the pair selection when the multiples checkbox is clicked
function letPair(bool) {
  if (bool) {
    document.getElementById('backtest-pair').disabled = false;
  } else {
    document.getElementById('backtest-pair').disabled = true;
  }
}

// toggles the timeframe selection when the multiples checkbox is clicked
function letTimeframe(bool) {
  if (bool) {
    document.getElementById('backtest-timeframe').disabled = false;
  } else {
    document.getElementById('backtest-timeframe').disabled = true;
  }
}

// toggles the strategy selection when the multiples checkbox is clicked
function letStrategy(bool) {
  if (bool) {
    document.getElementById('backtest-strategy').disabled = false;
  } else {
    document.getElementById('backtest-strategy').disabled = true;
  }
}

// adds a new list parameter to the backtest
function addList() {
  $('#addons').append(addons.list);
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

// counts the options for each addon
function countOptions() {
  var allOptions = $('.option');
  for (var i = 0; i < allOptions.length; i++) {
    var currentInt = $('.int-input')[i];
    $('.option-array')[i].value = allOptions[i].getElementsByClassName('option-list').length;
    // FIXME: delete this piece of code if backtest works correctly
    // if (currentInt.value == 1) {
    //   // if the addon is integer count as zero
    //   $('.option-array')[i].value = 0;
    // } else {
    //   // else count the number of options
    //   $('.option-array')[i].value = allOptions[i].getElementsByClassName('option-list').length;
    // }
  }
}

// counts & updates the rows count of the backtest table
function countTableRows() {
  var backtestRowCount = document.getElementById('backtest-table').rows.length;
  var backtestCountLabel = document.getElementById('table-count');
  if (backtestCountLabel != null) {
    backtestCountLabel.innerHTML = backtestRowCount;
  }
}

if (storeBacktest != null) {
  storeBacktest.addEventListener('click', () => {
    countOptions();
  })
}

// sets the fields to add a new row to the backtest
function newRow(logic) {
  var updateRow = document.getElementById('update-row');
  var newRow = document.getElementById('new-row');
  var createRow = document.getElementById('create-row');
  if (logic) {
    updateRow.classList.remove('d-inline');
    newRow.classList.remove('d-inline');
    createRow.classList.remove('d-none');
    updateRow.classList.add('d-none');
    newRow.classList.add('d-none');
    createRow.classList.add('d-inline');
    document.getElementById('row-index').innerHTML = document.getElementsByTagName('tr').length;
    document.getElementById('row-direction').selectedIndex = 0;
    document.getElementById('row-pair').selectedIndex = 0;
    document.getElementById('row-result').value = '';
    document.getElementById('row-strategy').selectedIndex = 0;
    document.getElementById('row-timeframe').selectedIndex = 0;
    var addonsList = document.getElementsByClassName('addon-edit');
    for (var i = 0; i < addonsList.length; i++) {
      if (backtest.addonsType[i] == 1) {
        addonsList[i].value = '';
      } else {
        addonsList[i].selectedIndex = 0;
      }
    }
  } else {
    updateRow.classList.remove('d-none');
    newRow.classList.remove('d-none');
    createRow.classList.remove('d-inline');
    updateRow.classList.add('d-inline');
    newRow.classList.add('d-inline');
    createRow.classList.add('d-none');
  }
}

// selects the given row to be modified
function editRow(id) {
  newRow(0);
  var rowDirection = document.getElementById('row-direction');
  var rowPair = document.getElementById('row-pair');
  var rowResult = document.getElementById('row-result');
  var rowStrategy = document.getElementById('row-strategy');
  var rowTimeframe = document.getElementById('row-timeframe');
  var editList = $('.edit-row')
  var current = editList.index(id)
  document.getElementById('row-index').innerHTML = current + 1;
  var row = document.getElementsByTagName('tr')[current + 1];
  var editDirection = row.getElementsByTagName('td')[1].innerText;
  if (editDirection == 'long') {
    rowDirection.selectedIndex = 0;
  } else {
    rowDirection.selectedIndex = 1;
  }
  var editResult = row.getElementsByTagName('td')[2];
  rowResult.value = editResult.innerHTML;
  if ('pair' in backtest) {
    rowPair.selectedIndex = Number(backtest.pair) - 1;
  } else {
    rowPair.selectedIndex = Number(data[2][current]) - 1;
  }
  if ('timeframe' in backtest) {
    rowTimeframe.selectedIndex = Number(backtest.timeframe) - 1;
  } else {
    rowTimeframe.selectedIndex = Number(data[4][current]) - 1;
  }
  if ('strategy' in backtest) {
    var editStrategy = backtest.strategy
  } else {
    var editStrategy = data[3][current]
  }
  for (var i = 0; i < rowStrategy.options.length; i++) {
    if (editStrategy == rowStrategy.options[i].value) {
      rowStrategy.selectedIndex = i;
    }
  }
  // adds the addons fields if required
  if (row.getElementsByTagName('td').length > 7) {
    var addonCount = 0;
    for (var i = 6; i < row.getElementsByTagName('td').length - 1; i++) {
      var addonList = document.getElementsByClassName('addon-edit');
      var rowAddon = addonList[addonCount];
      if (backtest.addonsType[addonCount] == 1) {
        var editAddon = row.getElementsByTagName('td')[i];
        rowAddon.value = editAddon.innerText;
      } else {
        var editAddon = row.getElementsByTagName('td')[i];
        rowAddon.selectedIndex = Number(editAddon.innerText) - 1;
      }
      addonCount += 1;
    }
  }
}

// updates an existing row with a new set of values
function updateRow() {
  var currentIndex = document.getElementById('row-index');
  var currentDirection = document.getElementById('row-direction');
  var currentResult = document.getElementById('row-result');
  var currentPair = document.getElementById('row-pair');
  var currentStrategy = document.getElementById('row-strategy');
  var currentTimeframe = document.getElementById('row-timeframe');
  var row = document.getElementsByTagName('tr')[currentIndex.innerText].getElementsByTagName('td');
  row[1].innerHTML = currentDirection.value;
  row[2].innerHTML = currentResult.value;
  row[3].innerHTML = currencies[currentPair.selectedIndex];
  row[4].innerHTML = strategies[currentStrategy.selectedIndex];
  row[5].innerHTML = timeframes[currentTimeframe.selectedIndex];
  // updates the data in the addon fields
  var addonList = document.getElementsByClassName('addon-edit');
  for (var i = 0; i < addonList.length; i++) {
    if (backtest.addonsType[i] == 1) {
      row[6 + i].innerHTML = addonList[i].value;
    } else {
      row[6 + i].innerHTML = addonList[i].selectedIndex + 1;
    }
  }
  newRow(1);
}

// create a new row with the give value
function createRow() {
  var table = document.getElementById("backtest-table");
  var currentRow = document.getElementsByTagName('tr').length;
  var currentDirection = document.getElementById('row-direction');
  var currentResult = document.getElementById('row-result');
  var currentPair = document.getElementById('row-pair');
  var currentStrategy = document.getElementById('row-strategy');
  var currentTimeframe = document.getElementById('row-timeframe');
  var row = table.insertRow(currentRow);
  var indexCell = row.insertCell().innerHTML = currentRow;
  var directionCell = row.insertCell().innerHTML = currentDirection.value;
  var resultCell = row.insertCell();
  resultCell.innerHTML = currentResult.value;
  resultCell.className = 'text-right';
  var pairCell = row.insertCell().innerHTML = currencies[currentDirection.selectedIndex];
  var strategyCell = row.insertCell();
  strategyCell.innerHTML = strategies[currentStrategy.selectedIndex];
  strategyCell.className = 'non-wrap';
  var timeframeCell = row.insertCell().innerHTML = timeframes[currentTimeframe.selectedIndex];
  document.getElementById('row-index').innerHTML = '';
  currentDirection.selectedIndex = 0;
  currentResult.value = '';
  currentPair.selectedIndex = 0;
  currentStrategy.selectedIndex = 0;
  currentTimeframe.selectedIndex = 0;
  // adds the data on the addons fields
  var addonList = document.getElementsByClassName('addon-edit');
  if ('addons' in backtest) {
    for (var i = 0; i < backtest.addons.length; i++) {
      var currentAddon = addonList[i];
      var addonCell = row.insertCell();
      if (backtest.addonsType[i] == 1) {
        addonCell.innerHTML = currentAddon.value;
      } else {
        addonCell.innerHTML = currentAddon.selectedIndex + 1;
      }
      addonCell.className = 'text-right';
    }
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
  editBtn.setAttribute('onclick', 'editRow(this)');
  editBtn.appendChild(editImg);
  buttonsCell.appendChild(deleteBtn)
  buttonsCell.appendChild(editBtn)
  buttonsCell.className = 'text-center';
  newRow(1);
}

// deletes the row in the given index
function deleteRow(id) {
  var deleteList = $('.delete-row')
  var current = deleteList.index(id);
  var row = document.getElementsByTagName('tr')[current + 1];
  row.remove();
}

// retrieves the data from the backtest table
function retrieveData() {
  serverData.data = [[], [], [], [], []]
  for (var a = 0; a < backtest.addons.length; a++) {
    serverData.data.push([])
  }
  var tableBody = document.getElementsByTagName('tbody');
  var rowsList = tableBody[0].getElementsByTagName('tr');
  for (var i = 0; i < rowsList.length; i++) {
    serverData.data[0].push(rowsList[i].getElementsByTagName('td')[1].innerText);
    serverData.data[1].push(rowsList[i].getElementsByTagName('td')[2].innerText);
    rowPair = rowsList[i].getElementsByTagName('td')[3].innerText
    serverData.data[2].push(currencies.findIndex(currency => currency == rowPair));
    serverData.data[3].push(rowsList[i].getElementsByTagName('td')[4].innerText);
    serverData.data[4].push(rowsList[i].getElementsByTagName('td')[5].innerText);
    if ('addons' in backtest) {
      for (var y = 0; y < backtest.addons.length; y++) {
        serverData.data[5 + y].push(rowsList[i].getElementsByTagName('td')[6 + y].innerText)
      }
    }
  }
}

// sends the data from the updated backtest to the server side
if (updateBacktest != null) {
  updateBacktest.addEventListener('click', () => {
    retrieveData();
    $('#obj').val(JSON.stringify(serverData))
  })
}

countTableRows();
