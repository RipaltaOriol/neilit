// Technical Analysis Element: STRATEGY
let timeframes = require("../timeframes");

function strategyHtml(strategies){
  var strategiesSelect = ``;
  strategies.forEach((strategy, i) => {
    strategiesSelect += `<option value="` + i + `">` + strategy + `</option>`
  });

  var timeframesSelect = ``;
  timeframes.forEach((timeframe, i) => {
    timeframesSelect += `<option value="` + i + `">` + timeframe + `</option>`
  });


  return `
    <span class="d-flex py-2 mb-2 strategy ta-element">
      <input type="text" name="type" value="strategy" class="d-none">
      <div class="strategy-option w-50 d-flex flex-column px-2">
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
      <div class="widget-trigger px-2 d-none">
        <h5 class="mb-0">Strategy - Desencadenante</h5>
        <p class="mb-0">
          A
          <span class="strategy-trigger px-1"></span>
          on the
          <span class="timeframe-trigger px-1"></span>
        </p>
      </div>
      <div class="widget-general px-2 d-none">
        <p class="mb-0">
          Strategy - General: a
          <span class="strategy-general px-1"></span>
          on the
          <span class="timeframe-general px-1"></span>
        </p>
      </div>
      <input type="text" name="importance" class="d-none">
      <span class="d-flex ml-auto">
        <img src="/imgs/icons/move.svg" alt="move" class="move">
        <img src="/imgs/icons/delete.svg" alt="delete" class="drop" onclick="whatIndex(this)">
      </span>
    </span>
    `
};



module.exports = {
  html: strategyHtml
};
