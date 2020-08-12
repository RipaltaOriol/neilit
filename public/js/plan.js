// stores the strategies to include in the trading plan
var strategyArray = []

// add a strategy to be included in the trading plan
function addStrategy(index) {
  $('#plan-strategies').append(elements.strategyBeg + strategies[index] + elements.strategyEnd);
  strategyArray.push(strategies[index])
}

// deltes a strategy to be included in the trading plan
function deleteStrategy(element) {
  var strategyList = $('.strategy-del');
  var current = strategyList.index(element)
  var strategyDiv = document.getElementById('plan-strategies');
  var strategySpan = strategyDiv.getElementsByClassName('strategy-id')
  strategySpan[current].remove();
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
    type: $('#type').is(':checked') ? 'block' : 'none',
    amount: $('#amount').is(':checked') ? 'block' : 'none',
    orderType: $('#order-type').is(':checked') ? 'block' : 'none',
    description: $('#description').is(':checked') ? 'block' : 'none',
    psychologyNotes: $('#psychology-note').is(':checked') ? 'block' : 'none',
    tips: $('#tips').is(':checked') ? 'block' : 'none',
    journaling: $('#journaling').is(':checked') ? 'block' : 'none',
    checklist: $('#checklist').is(':checked') ? 'block' : 'none',
    account: $('#account').is(':checked') ? 'block' : 'none',
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
    $("#listJournalItems").append('<li class="bg-hover mt-1 px-2">' + newItem + '</li>')
    // prevents the form from submitting
    event.preventDefault();
    return false;
  }
})

// resets list in the plan's journal section
function resetChecklist() {
  var checklist = document.getElementById('listJournalItems');
  var itemsChecklist = checklist.getElementsByTagName('li');
  for (var i = 0; i < itemsChecklist.length; i++) {
    itemsChecklist[i].remove();
  }
}

// adds a goal to the trading plan accord to its type
function addGoal(type) {
  var accountCount = document.getElementById('objectiveAccount').childElementCount;
  if (type == 'objectiveAccount' && accountCount < 5) {
    $('#objectiveAccount').append('<li class="bh-hover mt-1 px-2">' + $('#objective').val() + '</li>')
  }
  if (type != 'objectiveAccount') {
    $('#' + type).append('<li class="bh-hover mt-1 px-2">' + $('#objective').val() + '</li>')
  }
  $('#objective').val('')
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
      document.getElementById('about').style.display = preferences.about;
      document.getElementById('howto').style.display = preferences.howto;
      document.getElementById('strategyNote').style.display = preferences.strategyNote;
      document.getElementById('timeframe').style.display = preferences.timeframe;
      document.getElementById('assets').style.display = preferences.assets;
      document.getElementById('risk').style.display = preferences.risk;
      document.getElementById('backtest').style.display = preferences.backtest;
      document.getElementById('rules').style.display = preferences.rules;
    });
  } else {
    $('#strategy').hide()
  }
  // psychology section
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
    [preferences.account, preferences.nonFinancial, preferences.financial]) >= 0) {
    document.getElementById('accountGoals').style.display = preferences.account;
    document.getElementById('accountBtn').style.display = preferences.account;
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
  var begDirectionTemplate = `
    <input type="text" name="direction" value="
  `
  var endDirectionTemplate  = `
    " class="d-none">
  `
  $('.rules').eq(current).append(elements.newPosition + begDirectionTemplate
    + type + endDirectionTemplate)
}

// deletes the local storage when submitting plan
$('#submit-plan').click(() => {
  window.localStorage.removeItem('components');
})
