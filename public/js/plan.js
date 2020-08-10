// template for strategies addition to plan
var begStrategy = `
  <span class="strategy-id d-block bg-hover px-2 mb-1">
    <span class="my-auto">`
var endStrategy = `
    </span>
    <button type="button" class="strategy-del bg-none my-auto" onclick="deleteStrategy(this)">
      <img class="my-auto" src="/imgs/icons/delete.svg">
    </button>
  </span>`
// template for strategies inside plan
var strategyTemplate = `
  <div>
    <p class="strategy-title d-inline-block mb-2"></p>
    <div class="about">
      <span>About</span>
      <div class="diveditable bg-hover w-75 p-1" placeholder="What is this strategy about?" contenteditable="true"></div>
    </div>
    <div class="howto">
      <span>How to Use</span>
      <div class="diveditable bg-hover w-75 p-1" placeholder="How do you use this strategy?" contenteditable="true"></div>
    </div>
    <div class="strategyNote">
      <span>Key Notes</span>
      <div class="diveditable bg-hover w-75 p-1" placeholder="Any additional description?" contenteditable="true"></div>
    </div>
    <div class="timeframe">
      <span>Timeframes</span>
      <span class="bg-hover p-1 ml-1">Dropdown</span>
    </div>
    <div class="assets">
      <span>Assets</span>
      <span class="bg-hover p-1 ml-1">Dropdown</span>
    </div>
    <div class="risk">
      <span>Risk Tolerance [%]:</span>
      <input type="number" class="bg-hover w-75 p-1 ml-1" name="risk" placeholder="what is you risk per operation in %?" min="0" max="100">
    </div>
    <div class="backtest">
      <button class="btn-neilit" type="button">Connect to Backtest item</button>
    </div>

    <div class="rules mt-3">
      <p class="mb-1">
        <strong>Positioning</strong>
      </p>
      <div id="">
        <div class="dropright mb-3">
          <a class="btn-neilit dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Add positioning item
          </a>
          <div class="dropdown-menu rulesBtns" aria-labelledby="dropdownMenuLink">
            <a class="dropdown-item" href="#!" onclick="addRule('tp', this.parentElement)">Take Profit (Profits)</a>
            <a class="dropdown-item" href="#!" onclick="addRule('sl', this.parentElement)">Stop Loss (Loss)</a>
          </div>
        </div>
      </div>
      <hr>
    </div>
  </div>
  <hr class="mt-1 mb-4">
`
// template for positioning rules in strategies
var positioningTemplate = `
  <div id="" class="mb-1">
    <input class="font-20 bg-hover w-75 p-1" type="text" name="position-title" placeholder="Title for the positioning rule">
  </div>
  <input id="sl-tp" class="d-none">
  <div id="" class="mb-1">
    <select class="form-control w-75" name="amount-type">
      <option value="">Scalling In/Out (Partial)</option>
      <option value="">Full Amount</option>
    </select>
  </div>
  <div id="">
    <span>Scalling In/Out amount:</span>
    <input class="bg-hover w-75 p-1 ml-1" type="number" name="amount" placeholder="what is the amount for your partial order (%)?">
  </div>
  <div id="">
    <span>Order Type</span>
    <span class="bg-hover p-1 ml-1">Dropdown</span>
  </div>
  <div id="">
    <span>Description</span>
    <div class="diveditable bg-hover w-75 p-1" placeholder="Any additional notes for this rule?" contenteditable="true"></div>
  </div>
`
// stores the strategies to include in the trading plan
var strategyArray = []

// add a strategy to be included in the trading plan
function addStrategy(index) {
  $('#plan-strategies').append(begStrategy + strategies[index] + endStrategy);
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
    broker: document.getElementById('broker').checked,
    charts: document.getElementById('charts').checked,
    capital: document.getElementById('capital').checked,
    routine: document.getElementById('routine').checked,
    strategies: strategyArray,
    about: document.getElementById('about').checked,
    howto: document.getElementById('howto').checked,
    strategyNote: document.getElementById('strategy-notes').checked,
    timeframe: document.getElementById('timeframe').checked,
    assets: document.getElementById('assets').checked,
    risk: document.getElementById('risk').checked,
    backtest: document.getElementById('backtest').checked,
    rules: document.getElementById('rules').checked,
    title: document.getElementById('title').checked,
    type: document.getElementById('type').checked,
    amount: document.getElementById('amount').checked,
    orderType: document.getElementById('order-type').checked,
    description: document.getElementById('description').checked,
    psychologyNotes: document.getElementById('psychology-notes').checked,
    tips: document.getElementById('tips').checked,
    journaling: document.getElementById('journaling').checked,
    checklist: document.getElementById('checklist').checked,
    account: document.getElementById('account').checked,
    nonFinancial: document.getElementById('non-financial').checked,
    financial: document.getElementById('financial').checked,
    journalRevision: document.getElementById('journal-revision').checked,
    strategyRevision: document.getElementById('strategy-revision').checked,
    planRevision: document.getElementById('plan-revision').checked,
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

// adds an account goal to the trading plan
function goalAccount() {
  var accountList = document.getElementById('objectiveAccount');
  var goalsList = accountList.getElementsByTagName('li').length;
  if (goalsList < 5) {
    $('#objectiveAccount').append('<li class="bh-hover mt-1 px-2">' + $('#objective').val() + '</li>')
  }
  $('#objective').val('')
}

// adds a non-financial goal to the trading plan
function goalNonfin() {
  $('#objectiveNonfin').append('<li class="bh-hover mt-1 px-2">' + $('#objective').val() + '</li>')
  $('#objective').val('')
}

// adds a financial goal to the trading plan
function goalFin() {
  $('#objectiveFin').append('<li class="bh-hover mt-1 px-2">' + $('#objective').val() + '</li>')
  $('#objective').val('')
}

// displays the corresponding plan sections according to components
if (window.localStorage.getItem('components') != null) {
  var preferences = JSON.parse(window.localStorage.getItem('components'))
  // general information section
  if (preferences.broker || preferences.charts || preferences.capital || preferences.routine) {
    // displays borker input
    if (!preferences.broker) {
      $('#broker').hide()
    }
    // displays charts input
    if (!preferences.charts) {
      $('#charts').hide()
    }
    // displays trading capital input
    if (!preferences.capital) {
      $('#capital').hide()
    }
    // displays business routine input
    if (!preferences.routine) {
      $('#routine').hide()
    }
  } else {
    $('#general').hide()
  }
  // strategy section
  if (Array.isArray(preferences.strategies) && preferences.strategies.length) {
    preferences.strategies.forEach((strategy, i) => {
      $('#strategy').append(strategyTemplate)
      $('.strategy-title')[i].innerHTML = strategy
      // displays strategy about input
      if (!preferences.about) {
        $('.about')[i].style.display = 'none';
      }
      // displays strategy how to use input
      if (!preferences.howto) {
        $('.howto')[i].style.display = 'none';
      }
      // displays strategy notes input
      if (!preferences.strategyNote) {
        $('.strategyNote')[i].style.display = 'none';
      }
      // displays strategy timeframe input
      if (!preferences.timeframe) {
        $('.timeframe')[i].style.display = 'none';
      }
      // displays strategy assets input
      if (!preferences.assets) {
        $('.assets')[i].style.display = 'none';
      }
      // displays strategy risk input
      if (!preferences.risk) {
        $('.risk')[i].style.display = 'none';
      }
      // displays strategy backtest input
      if (!preferences.backtest) {
        $('.backtest')[i].style.display = 'none';
      }
      // displays strategy positioning rules input
      if (!preferences.rules) {
        $('.rules')[i].style.display = 'none';
      }
    });
  } else {
    $('#strategy').hide()
  }
  // psychology section
  if (preferences.psychologyNotes) {
    // displays psychology notes input
    if (!preferences.psychologyNotes) {
      $('#psychology-notes').hide()
    }
  } else {
    $('#psychology').hide()
  }
  // journal section
  if (preferences.journaling || preferences.checklist) {
    // displays journaling process input
    if (!preferences.journaling) {
      $('#journaling').hide()
    }
    // displays journal checklist input
    if (!preferences.checklist) {
      $('#checklist').hide()
    }
  } else {
    $('#journal').hide()
  }
  // goals section
  if (preferences.account || preferences.nonFinancial || preferences.financial) {
    // displays account goals input
    if (!preferences.account) {
      $('#accountGoals').hide()
      $('#accountBtn').hide()
    }
    // displays non-financial goals input
    if (!preferences.nonFinancial) {
      $('#nonFinancialGoals').hide()
      $('#nonFinancialBtn').hide()
    }
    // displays financial goals input
    if (!preferences.financial) {
      $('#financialGoals').hide()
      $('#financialBtn').hide()
    }
  } else {
    $('#goals').hide()
  }
  // others section
  if (preferences.strategyRevision || preferences.journalRevision || preferences.planRevision) {
    // displays strategy revision input
    if (!preferences.broker) {
      $('#strategy-revision').hide()
    }
    // displays journal revision input
    if (!preferences.charts) {
      $('#journal-revision').hide()
    }
    // displays plan revision input
    if (!preferences.capital) {
      $('#plan-revision').hide()
    }
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
  $('.rules').eq(current).append(positioningTemplate + begDirectionTemplate
    + type + endDirectionTemplate)
}

// deletes the local storage when submitting plan
$('#submit-plan').click(() => {
  window.localStorage.removeItem('components');
})
