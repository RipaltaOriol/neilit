// Technical Analysis Element: STRATEGY

// -- CREATE
function strategyHtml(strategies, strategiesID, timeframes){
  // loads all strategies
  var strategiesSelect = ``;
  strategies.forEach((strategy, i) => {
    strategiesSelect += `<li class="` + strategiesID[i] + `">` + strategy + `</li>`
  });
  // loads all timeframes
  var timeframesSelect = ``;
  for (const tf in timeframes) {
    timeframesSelect += `<li class="` + timeframes[tf].id + `">` + tf + `</li>`
  }
  // returns the html put together
  return `
    <span class="d-flex py-2 mb-2 strategy ta-element">
      <input type="text" name="type" value="strategy" class="d-none">
      <div class="strategy-option w-100 d-flex flex-column p-2 mr-auto">
        <h5 class="mb-1">Strategy:</h5>
        <!-- dropdown -->
        <div class="dropdown d-inline mb-2">
          <button id="dropdown-label" class="strategy-select dropdown-select w-100 px-2" type="button" data-toggle="dropdown">
            `
            + strategies[0] +
            `
          </button>
          <input type="text" name="strategy" class="dropdown-server d-none" value="` + strategiesID[0] + `">
          <ul id="dropdown-items" class="dropdown-menu" aria-labelledby="dropdown-label">
            <input class="dropdown-search p-2 w-100" type="text" placeholder="Search..." onkeyup="searchDropdown(this)">
              `
              + strategiesSelect +
              `
          </ul>
        </div>
        <!-- dropdown -->
        <div class="dropdown d-inline mb-2">
          <button id="dropdown-label" class="timeframe-select dropdown-select w-100 px-2" type="button" data-toggle="dropdown">
            `
            + Object.keys(timeframes)[0] +
            `
          </button>
          <input type="text" name="timeframe" class="dropdown-server d-none" value="` + timeframes[Object.keys(timeframes)[0]].id + `">
          <ul id="dropdown-items" class="dropdown-menu" aria-labelledby="dropdown-label">
            <input class="dropdown-search p-2 w-100" type="text" placeholder="Search..." onkeyup="searchDropdown(this)">
              `
              + timeframesSelect +
              `
          </ul>
        </div>
        <div class="d-flex">
          <button type="button" class="general btn-neilit mr-2" onclick="isImportance(this, 'general')">General</button>
          <button type="button" class="trigger btn-neilit mr-2" onclick="isImportance(this, 'trigger')">Triggering</button>
        </div>
      </div>
      <div class="widget-trigger p-2 d-none w-100">
        <p class="mb-0">
          <label class="font-weight-bold mb-0">Strategy - Triggering</label>: a
          <span class="strategy-trigger px-1"></span>
          on the
          <span class="timeframe-trigger px-1"></span>
        </p>
      </div>
      <div class="widget-general px-2 d-none w-100">
        <p class="mb-0">
          Strategy - General: a
          <span class="strategy-general px-1"></span>
          on the
          <span class="timeframe-general px-1"></span>
        </p>
      </div>
      <input type="text" name="importance" class="d-none">
      <span class="d-flex ml-2">
        <img src="/imgs/icons/move.svg" alt="move" class="move">
        <img src="/imgs/icons/delete.svg" alt="delete" class="drop" onclick="whatIndex(this)">
      </span>
    </span>
    `;
};
// -- DISPLAY
function generateStrategy(imp, strategy, timeframe) {
  // loads the user view that corresponds to the straegy importance
  if (imp === 'general') {
    return `
      <div class="ta-element strategy mr-2 mb-2">
        <div class="widget-general px-2 w-100">
          <p class="mb-0">
            Strategy - General: a
            <span class="strategy-general px-1">` + strategy + `</span>
            on the
            <span class="timeframe-general px-1">` + timeframe + `</span>
          </p>
        </div>
      </div>
      `;
  }
  if (imp === 'trigger') {
    return `
      <div class="ta-element strategy mr-2 mb-2">
        <div class="widget-trigger px-2 w-100">
          <p class="mb-0">
            <label class="font-weight-bold mb-0">Strategy - Triggering</label>: a
            <span class="strategy-trigger px-1">` + strategy + `</span>
            on the
            <span class="timeframe-trigger px-1">` + timeframe + `</span>
          </p>
        </div>
      </div>
      `;
  }
};
// -- EDIT
function editStrategy(strategies, strategiesID, timeframes, imp, strategy, timeframe, strategyID, timeframeID) {
  // loads all strategies
  var strategiesSelect = ``;
  strategies.forEach((strategy, i) => {
    strategiesSelect += `<li class="` + strategiesID[i] + `">` + strategy + `</li>`
  });
  // loads all timeframes
  var timeframesSelect = ``;
  for (const tf in timeframes) {
    timeframesSelect += `<li class="` + timeframes[tf].id + `">` + tf + `</li>`
  }
  // loads the user view that corresponds to the straegy importance
  var general = 'd-none';
  var trigger = 'd-none';
  var importance;
  if (imp === 'general') {
    general = '';
  }
  if (imp === 'trigger') {
    trigger = '';
  }
  // returns the html put together
  return `
    <span class="ta-element strategy d-flex py-2 mb-2">
      <input type="text" name="type" value="strategy" class="d-none">
      <div class="strategy-option d-none">
        <h5 class="mb-1">Strategy:</h5>
        <!-- dropdown -->
        <div class="dropdown d-inline mb-2">
          <button id="dropdown-label" class="strategy-select dropdown-select w-100 px-2" type="button" data-toggle="dropdown">
            `
            + strategy +
            `
          </button>
          <input type="text" name="strategy" class="dropdown-server d-none" value=" ` + strategyID + ` ">
          <ul id="dropdown-items" class="dropdown-menu" aria-labelledby="dropdown-label">
            <input class="dropdown-search p-2 w-100" type="text" placeholder="Search..." onkeyup="searchDropdown(this)">
              `
              + strategiesSelect +
              `
          </ul>
        </div>
        <!-- dropdown -->
        <div class="dropdown d-inline mb-2">
          <button id="dropdown-label" class="timeframe-select dropdown-select w-100 px-2" type="button" data-toggle="dropdown">
            `
            + timeframe +
            `
          </button>
          <input type="text" name="timeframe" class="dropdown-server d-none" value="` + timeframeID + `">
          <ul id="dropdown-items" class="dropdown-menu" aria-labelledby="dropdown-label">
            <input class="dropdown-search p-2 w-100" type="text" placeholder="Search..." onkeyup="searchDropdown(this)">
              `
              + timeframesSelect +
              `
          </ul>
        </div>
        <div class="d-flex">
          <button type="button" class="general btn-neilit mr-2" onclick="isImportance(this, 'general')">General</button>
          <button type="button" class="trigger btn-neilit mr-2" onclick="isImportance(this, 'trigger')">Desencadenante</button>
        </div>
      </div>
      <div class="widget-trigger ` + trigger + ` px-2 w-100">
        <p class="mb-0">
          <label class="font-weight-bold mb-0">Strategy - Triggering</label>: a
          <span class="strategy-trigger px-1"> ` + strategy + ` </span>
          on the
          <span class="timeframe-trigger px-1"> ` + timeframe + ` </span>
        </p>
      </div>
      <div class="widget-general ` + general + ` px-2 w-100">
        <p class="mb-0">
          Strategy - General: a
          <span class="strategy-general px-1"> ` + strategy + ` </span>
          on the
          <span class="timeframe-general px-1"> ` + timeframe + ` </span>
        </p>
      </div>
      <input type="text" name="importance" class="d-none" value="` + imp + `">
      <span class="d-flex ml-2">
        <img src="/imgs/icons/move.svg" alt="move" class="move">
        <img src="/imgs/icons/delete.svg" alt="delete" class="drop" onclick="whatIndex(this)">
      </span>
    </span>
    `;
}

module.exports = {
  html: strategyHtml,
  generate: generateStrategy,
  edit: editStrategy
};
