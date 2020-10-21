// Technical Analysis Element: STRATEGY

// -- CREATE
function strategyHtml(strategies){
  // loads all strategies
  var strategiesSelect = ``;
  strategies.forEach((strategy, i) => {
    strategiesSelect += `<option value="` + i + `">` + strategy + `</option>`
  });
  // loads all timeframes
  var timeframesSelect = ``;
  timeframes.forEach((timeframe, i) => {
    timeframesSelect += `<option value="` + i + `">` + timeframe + `</option>`
  });
  // returns the html put together
  return `
    <span class="d-flex py-2 mb-2 strategy ta-element">
      <input type="text" name="type" value="strategy" class="d-none">
      <div class="strategy-option w-50 d-flex flex-column px-2 mr-auto">
        <h5 class="mb-1">Strategy:</h5>
        <select class="custom-select py-1 mb-2" name="strategy">
          `
          + strategiesSelect +
          `
        </select>
        <select class="custom-select py-1 mb-2" name="timeframe">
          `
          + timeframesSelect +
          `
        </select>
        <div class="d-flex">
          <button type="button" class="general btn-neilit mr-2" onclick="isImportance(this, 'general')">General</button>
          <button type="button" class="trigger btn-neilit mr-2" onclick="isImportance(this, 'trigger')">Desencadenante</button>
        </div>
      </div>
      <div class="widget-trigger px-2 d-none w-100">
        <h5 class="mb-0">Strategy - Desencadenante</h5>
        <p class="mb-0">
          A
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
      <span class="d-flex">
        <img src="/imgs/icons/move.svg" alt="move" class="move">
        <img src="/imgs/icons/delete.svg" alt="delete" class="drop" onclick="whatIndex(this)">
      </span>
    </span>
    `;
};
// -- DISPLAY
function generateStrategy(strategies, st, imp, tf) {
  // loads the user view that corresponds to the straegy importance
  if (imp === 'general') {
    return `
      <span class="d-flex py-2 mb-2 strategy ta-element">
        <div class="widget-general px-2">
          <p class="mb-0">
            Strategy - General: a
            <span class="strategy-general px-1">` + strategies[Number(st - 1)] + `</span>
            on the
            <span class="timeframe-general px-1">` + timeframes[Number(tf - 1)] + `</span>
          </p>
        </div>
      </span>
      `;
  }
  if (imp === 'trigger') {
    return `
      <span class="d-flex py-2 mb-2 strategy ta-element">
        <div class="widget-trigger px-2">
          <h5 class="mb-0">Strategy - Desencadenante</h5>
          <p class="mb-0">
            A
            <span class="strategy-trigger px-1">` + strategies[Number(st - 1)] + `</span>
            on the
            <span class="timeframe-trigger px-1">` + timeframes[Number(tf - 1)] + `</span>
          </p>
        </div>
      </span>
      `;
  }
};
// -- EDIT
function editStrategy(strategies, st, tf) {
  // loads all strategies
  var strategiesSelect = ``;
  strategies.forEach((strategy, i) => {
    if (i === Number(st - 1)) {
      strategiesSelect += `<option value="` + i + `" selected>` + strategy + `</option>`
    } else {
      strategiesSelect += `<option value="` + i + `">` + strategy + `</option>`
    }
  });
  // loads all timeframes
  var timeframesSelect = ``;
  timeframes.forEach((timeframe, i) => {
    if (i === Number(tf - 1)) {
      timeframesSelect += `<option value="` + i + `" selected>` + timeframe + `</option>`
    } else {
      timeframesSelect += `<option value="` + i + `">` + timeframe + `</option>`
    }
  });
  // returns the html put together
  return `
    <span class="d-flex py-2 mb-2 strategy ta-element">
      <input type="text" name="type" value="strategy" class="d-none">
      <div class="strategy-option w-50 d-flex flex-column px-2 mr-auto">
        <h5 class="mb-1">Strategy:</h5>
        <select class="custom-select py-1 mb-2" name="strategy">
          `
          + strategiesSelect +
          `
        </select>
        <select class="custom-select py-1 mb-2" name="timeframe">
          `
          + timeframesSelect +
          `
        </select>
        <div class="d-flex">
          <button type="button" class="general btn-neilit mr-2" onclick="isImportance(this, 'general')">General</button>
          <button type="button" class="trigger btn-neilit mr-2" onclick="isImportance(this, 'trigger')">Desencadenante</button>
        </div>
      </div>
      <div class="widget-trigger px-2 d-none w-100">
        <h5 class="mb-0">Strategy - Desencadenante</h5>
        <p class="mb-0">
          A
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
      <span class="d-flex">
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
