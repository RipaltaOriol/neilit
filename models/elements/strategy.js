// Technical Analysis Element: STRATEGY
let timeframes = require("../timeframes");

function strategyHtml(strategies){
  var strategiesSelect = ``;
  strategies.forEach((strategy) => {
    strategiesSelect += `<option>` + strategy + `</option>`
  });

  var timeframesSelect = ``;
  timeframes.forEach((timeframe) => {
    timeframesSelect += `<option>` + timeframe + `</option>`
  });


  return `
  <span class="d-flex py-2 mb-2 strategy ta-element">
      <input type="text" name="type" value="strategy" class="d-none">
      <div class="w-50 d-flex flex-column px-2">
        <h5 class="mb-1">Strategy:</h5>
        <select class="custom-select py-1 mb-2">
          `
          + strategiesSelect +
          `
        </select>
        <select class="custom-select py-1 mb-2">
          `
          + timeframesSelect +
          `
        </select>
        <div class="d-flex">
          <button type="button" class="btn-neilit mr-2">General</button>
          <button type="button" class="btn-neilit mr-2">Desencadenante</button>
        </div>
      </div>
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
