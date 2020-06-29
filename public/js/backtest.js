var storeBacktest = document.getElementById("submit-backtest");

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
    if (currentInt.value == 1) {
      // if the addon is integer count as zero
      $('.option-array')[i].value = 0;
    } else {
      // else count the number of options
      $('.option-array')[i].value = allOptions[i].getElementsByClassName('option-list').length;
    }
  }
}

if (storeBacktest != null) {
  storeBacktest.addEventListener('click', () => {
    countOptions();
  })
}
