// component checkbox: positioning
var checkRules        = $('#rules');
var checkTitle        = $('#title');
var checkType         = $('#type');
var checkAmount       = $('#amount');
var checkOrderType    = $('#order-type');
var checkDescription  = $('#description');

var clientRoutine     = document.getElementById("client-routine");
var serverRoutine     = document.getElementById("server-routine");
var clientPsychology  = document.getElementById("client-psychology");
var serverPsychology  = document.getElementById("server-psychology");
var clientJournaling  = document.getElementById("client-journaling");
var serverJournaling  = document.getElementById("server-journaling");
var clientRStrategy   = document.getElementById("client-rstrategy");
var serverRStrategy   = document.getElementById("server-rstrategy");
var clientRJournal    = document.getElementById("client-rjournal");
var serverRJournal    = document.getElementById("server-rjournal");
var clientRPlan       = document.getElementById("client-rplan");
var serverRPlan       = document.getElementById("server-rplan");

var connectFocus;

// behavior for components on positioning
checkTitle.click(() => {
  if (checkTitle.prop('checked')) {
    checkRules.prop('checked', true);
  }
  uncheckPositioning()
})

checkType.click(() => {
  if (checkType.prop('checked')) {
    checkRules.prop('checked', true);
  }
  uncheckPositioning()
})

checkAmount.click(() => {
  if (checkAmount.prop('checked')) {
    checkRules.prop('checked', true);
  }
  uncheckPositioning()
})

checkOrderType.click(() => {
  if (checkOrderType.prop('checked')) {
    checkRules.prop('checked', true);
  }
  uncheckPositioning()
})

checkDescription.click(() => {
  if (checkDescription.prop('checked')) {
    checkRules.prop('checked', true);
  }
  uncheckPositioning()
})

function uncheckPositioning() {
  if (!(checkTitle.prop('checked') || checkType.prop('checked') || checkAmount.prop('checked')
  || checkOrderType.prop('checked') || checkDescription.prop('checked'))) {
    checkRules.prop('checked', false);
  }
}

// stores the strategies to include in the trading plan
var strategyArray = []

// add a strategy to be included in the trading plan
function addStrategy(index) {
  $('#plan-strategies').append(elements.strategyBeg + strategies[index] + elements.strategyEnd);
  strategyArray.push(strategies[index])
}

// ensures the behavior of the positioning components
var rules = document.getElementById('rules')
if (rules != null) {
  rules.addEventListener('change', () => {
    $('#title').prop('checked', rules.checked);
    $('#type').prop('checked', rules.checked);
    $('#amount').prop('checked', rules.checked);
    $('#order-type').prop('checked', rules.checked);
    $('#description').prop('checked', rules.checked);
  })
}

// deltes a strategy to be included in the trading plan
function deleteStrategy(element) {
  var strategyList = $('.strategy-del');
  var current = strategyList.index(element)
  var strategyDiv = document.getElementById('plan-strategies');
  var strategySpan = strategyDiv.getElementsByClassName('strategy-id')
  strategySpan[current].remove();
  strategyArray.splice(current, 1)
}

// stores the user preferences into local storage
function storeComponents() {
  let components = {
    broker: $('#broker').is(':checked') ? 'block' : 'none',
    charts: $('#charts').is(':checked') ? 'block' : 'none',
    capital: $('#capital').is(':checked') ? 'block' : 'none',
    routine: $('#routine').is(':checked') ? 'block' : 'none',
    strategies: strategyArray,
    about: $('#about').is(':checked') ? 'block' : 'none',
    howto: $('#howto').is(':checked') ? 'block' : 'none',
    strategyNote: $('#strategy-notes').is(':checked') ? 'block' : 'none',
    timeframe: $('#timeframe').is(':checked') ? 'block' : 'none',
    assets: $('#assets').is(':checked') ? 'block' : 'none',
    risk: $('#risk').is(':checked') ? 'block' : 'none',
    backtest: $('#backtest').is(':checked') ? 'block' : 'none',
    rules: $('#rules').is(':checked') ? 'block' : 'none',
    title: $('#title').is(':checked') ? 'block' : 'none',
    amount: $('#amount').is(':checked') ? 'block' : 'none',
    orderType: $('#order-type').is(':checked') ? 'block' : 'none',
    description: $('#description').is(':checked') ? 'block' : 'none',
    psychologyNotes: $('#psychology-notes').is(':checked') ? 'block' : 'none',
    tips: $('#tips').is(':checked') ? '1' : '0',
    journaling: $('#journaling').is(':checked') ? 'block' : 'none',
    checklist: $('#checklist').is(':checked') ? 'block' : 'none',
    nonFinancial: $('#non-financial').is(':checked') ? 'block' : 'none',
    financial: $('#financial').is(':checked') ? 'block' : 'none',
    journalRevision: $('#journal-revision').is(':checked') ? 'block' : 'none',
    strategyRevision: $('#strategy-revision').is(':checked') ? 'block' : 'none',
    planRevision: $('#plan-revision').is(':checked') ? 'block' : 'none'
  }
  window.localStorage.setItem('components', JSON.stringify(components));
}

// sets placeholder for div contenteditable input
jQuery(function($){
  $(".diveditable").focusout(function(){
    var element = $(this);
    if (!element.text().replace(" ", "").length) {
      element.empty();
    }
  });
});

// add items to include in the plan's journal section
$('#addTrack').keypress(function(event) {
  if (event.which == 13) {
    // gets the user's input
    var newItem = $(this).val();
    $(this).val("");
    $("#listJournalItems").append('<input type="text" name="checklist" class="d-block bg-hover mt-1 px-2" value="' + newItem + '">')
    // prevents the form from submitting
    event.preventDefault();
    return false;
  }
})

// resets list in the plan's journal section
function resetChecklist() {
  var checklist = document.getElementById('listJournalItems');
  var itemsChecklist = checklist.getElementsByTagName('input');
  var checklistLength = itemsChecklist.length;
  for (var i = checklistLength - 1; i >= 0; i--) {
    itemsChecklist[i].remove();
  }
}

// adds a goal to the trading plan according to its type
function addGoal(type) {
  $('#' + type).append('<input type="text" class="d-block bg-hover mt-1 px-2" name="' + type + '" value="' + $('#objective').val() + '" readonly>');
  $('#objective').val('');
}

// displays the corresponding plan sections according to components
if (window.localStorage.getItem('components') != null) {
  var preferences = JSON.parse(window.localStorage.getItem('components'))
  // general information section
  if ($.inArray('block',
    [preferences.broker, preferences.charts, preferences.capital, preferences.routine]) >= 0) {
    document.getElementById('broker').style.display = preferences.broker;
    document.getElementById('charts').style.display = preferences.charts;
    document.getElementById('capital').style.display = preferences.capital;
    document.getElementById('routine').style.display = preferences.routine;
  } else {
    $('#general').hide()
  }
  // strategy section
  if (Array.isArray(preferences.strategies) && preferences.strategies.length) {
    preferences.strategies.forEach((strategy, i) => {
      $('#strategy').append(elements.newStrategy)
      $('.strategy-title')[i].innerHTML = strategy
      $('.strategy-input')[i].value = strategy
      document.getElementsByClassName('about')[i].style.display = preferences.about;
      document.getElementsByClassName('howto')[i].style.display = preferences.howto;
      document.getElementsByClassName('strategyNote')[i].style.display = preferences.strategyNote;
      document.getElementsByClassName('timeframe')[i].style.display = preferences.timeframe;
      document.getElementsByClassName('assets')[i].style.display = preferences.assets;
      document.getElementsByClassName('risk')[i].style.display = preferences.risk;
      document.getElementsByClassName('backtest')[i].style.display = preferences.backtest;
      document.getElementsByClassName('strategy-backtest')[i].onclick = () => {
        connectFocus = i;
      }
      document.getElementsByClassName('rules')[i].style.display = preferences.rules;

      // sets default input value for timeframe and pair to send sever
      if (preferences.timeframe == 'none') {
        document.getElementsByClassName('input-tfs')[i].value = ''
      } else {
        document.getElementsByClassName('input-tfs')[i].value = document.getElementsByClassName('dd-tfs')[i].innerText
      }
      if (preferences.assets == 'none') {
        document.getElementsByClassName('input-pairs')[i].value = ''
      } else {
        document.getElementsByClassName('input-pairs')[i].value = document.getElementsByClassName('dd-pairs')[i].innerText
      }
    });
  } else {
    $('#strategy').hide()
  }
  // psychology section
  document.getElementById('tips').value = preferences.tips;
  if (preferences.psychologyNotes == 'block') {
    document.getElementById('psychology-notes').style.display = preferences.psychologyNotes;
  } else {
    $('#psychology').hide()
  }
  // journal section
  if ($.inArray('block',
    [preferences.journaling, preferences.checklist]) >= 0) {
      document.getElementById('journaling').style.display = preferences.journaling;
      document.getElementById('checklist').style.display = preferences.checklist;
  } else {
    $('#journal').hide()
  }
  // goals section
  if ($.inArray('block',
    [preferences.nonFinancial, preferences.financial]) >= 0) {
    document.getElementById('nonFinancialGoals').style.display = preferences.nonFinancial;
    document.getElementById('nonFinancialBtn').style.display = preferences.nonFinancial;
    document.getElementById('financialGoals').style.display = preferences.financial;
    document.getElementById('financialBtn').style.display = preferences.financial;
  } else {
    $('#goals').hide()
  }
  // others section
  if ($.inArray('block',
    [preferences.strategyRevision, preferences.journalRevision, preferences.planRevision]) >= 0) {
    document.getElementById('strategy-revision').style.display = preferences.strategyRevision;
    document.getElementById('journal-revision').style.display = preferences.journalRevision;
    document.getElementById('plan-revision').style.display = preferences.planRevision;
  } else {
    $('#others').hide()
  }
}

// adds positioning rules to the plan's strategies
function addRule(type, id) {
  var rulesBtnsList = $('.rulesBtns');
  var current = rulesBtnsList.index(id)
  var currentRule = $('.positioning').length;
  $('.rules').eq(current).append(elements.newPosition)
  document.getElementsByClassName('position-strategy')[currentRule].value = document.getElementsByClassName('strategy-input')[current].value;
  document.getElementsByClassName('position-type')[currentRule].value = type;
  document.getElementsByClassName('position-title')[currentRule].style.display = preferences.title;
  document.getElementsByClassName('position-amount')[currentRule].style.display = preferences.amount;
  if (type == 'tp-f' || type == 'sl-f') {
    document.getElementsByClassName('input-amount')[currentRule].value = '100';
    document.getElementsByClassName('input-amount')[currentRule].readOnly = 'true';
  }
  document.getElementsByClassName('order-type')[currentRule].style.display = preferences.orderType;
  if (preferences.orderType != 'none') {
    document.getElementsByClassName('input-order')[currentRule].value = 'market';
  }
  document.getElementsByClassName('description')[currentRule].style.display = preferences.description;
}

// connects a backtest to the plan's strategies
function connectBacktest(index) {
  var connectedId = backtests.id[index]
  $('.backtest-input')[connectFocus].value = connectedId;
  $('.plan-backtest')[connectFocus].classList.remove('d-none')
  $('.plan-backtest')[connectFocus].classList.add('d-block')
  $('.connect-backtest')[connectFocus].textContent = backtests.title[index];
}

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

// allows changes on the timeframes of a strategy
function changeTF(timeframe, id) {
  var tfsList = $('.list-tfs')
  var current = tfsList.index(id.parentNode)
  $('.dd-tfs')[current].innerHTML = timeframe;
  document.getElementsByClassName('input-tfs')[current].value = timeframe;
}

// allows changes on the pairs of a strategy
function changePair(pair, id) {
  var pairList = $('.list-pairs')
  var current = pairList.index(id.parentNode)
  $('.dd-pairs')[current].innerHTML = pair;
  document.getElementsByClassName('input-pairs')[current].value = pair;
}

// allows changes on the order type of a positioning rule
function changeOrder(order, id) {
  var orderList = $('.list-orders')
  var current = orderList.index(id.parentNode)
  $('.dd-order-type')[current].innerHTML = id.innerHTML;
  document.getElementsByClassName('input-order')[current].value = order;
}

// deletes the local storage when submitting plan
$('#submit-plan').click(() => {
  window.localStorage.removeItem('components');
  // sends the contenteditable's text to the server
  serverRoutine.value     = clientRoutine.textContent     || clientRoutine.innerText;
  serverPsychology.value  = clientPsychology.textContent  || clientPsychology.innerText;
  serverJournaling.value  = clientJournaling.textContent  || clientJournaling.innerText;
  serverRStrategy.value   = clientRStrategy.textContent   || clientRStrategy.innerText;
  serverRJournal.value    = clientRJournal.textContent    || clientRJournal.innerText;
  serverRPlan.value       = clientRPlan.textContent       || clientRPlan.innerText;
  // sends the Strategies' content to the server
  var clientAbout = document.getElementsByClassName("client-about");
  var serverAbout = document.getElementsByClassName("server-about");
  var clientHowto = document.getElementsByClassName("client-howto");
  var serverHowto = document.getElementsByClassName("server-howto");
  var clientKeyNotes = document.getElementsByClassName("client-keynotes");
  var serverKeyNotes = document.getElementsByClassName("server-keynotes");
  for (var i = 0; i < clientAbout.length; i++) {
    serverAbout[i].value    = clientAbout[i].textContent    || clientAbout[i].innerText;
    serverHowto[i].value    = clientHowto[i].textContent    || clientHowto[i].innerText;
    serverKeyNotes[i].value = clientKeyNotes[i].textContent || clientKeyNotes[i].innerText;
  };
  // send the Positions' content to the server
  var clientDescription = document.getElementsByClassName("client-description");
  var serverDescription = document.getElementsByClassName("server-description");
  for (var i = 0; i < clientDescription.length; i++) {
    serverDescription[i].value = clientDescription[i].textContent || clientDescription[i].innerText;
  };
})
