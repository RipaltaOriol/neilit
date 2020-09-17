// Trading Plan Element: STRATEGY
let pairs = require("../pairs");
let timeframes = require("../timeframes");

// -- CREATE ADD BEGINNING
var componentStrategyBeg = `
  <span class="strategy-id d-block bg-hover px-2 mb-1">
    <span class="my-auto">
  `;
// -- CREATE ADD END
var componentStrategyEnd = `
    </span>
    <button type="button" class="strategy-del bg-none my-auto" onclick="deleteStrategy(this)">
      <img class="my-auto" src="/imgs/icons/delete.svg">
    </button>
  </span>
  `;
// -- CREATE NEW STRATEGY
function strategyHtml() {
  // loads all pairs
  var listPairs = ``
  pairs.forEach((pair) => {
    listPairs += `<li onclick="changePair('` + pair + `', this)">` + pair + `</li>`
  });
  // loads all timeframes
  var listTFs = ``
  timeframes.forEach((timeframe) => {
    listTFs += `<li onclick="changeTF('` + timeframe + `', this)">` + timeframe + `</li>`
  });
  return `
    <div>
      <p class="strategy-title d-inline-block mb-2"></p>
      <input type="text" name="strategies" class="strategy-input d-none">
      <div class="about">
        <span>About</span>
        <div class="client-about diveditable bg-hover w-75 p-1" placeholder="What is this strategy about?" contenteditable="true"></div>
      </div>
      <textarea name="about" class="d-none server-about"></textarea>
      <div class="howto">
        <span>How to Use</span>
        <div class="client-howto diveditable bg-hover w-75 p-1" placeholder="How do you use this strategy?" contenteditable="true"></div>
      </div>
      <textarea name="howto" class="d-none server-howto"></textarea>
      <div class="strategyNote">
        <span>Key Notes</span>
        <div class="client-keynotes diveditable bg-hover w-75 p-1" placeholder="Any additional description?" contenteditable="true"></div>
      </div>
      <textarea name="keyNotes" class="d-none server-keynotes"></textarea>
      <div class="timeframe">
        <span>Timeframes</span>
        <div class="dropdown">
          <button id="dTF" class="dd-tfs dropdown-select bg-hover" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          `
            + timeframes[0] +
          `
          </button>
          <input type="text" name="timeframes" class="input-tfs d-none">
          <ul class="list-tfs dropdown-menu" aria-labelledby="dTF">
          `
            + listTFs +
          `
          </ul>
        </div>
      </div>
      <div class="assets">
        <span>Assets</span>
        <div class="dropdown">
          <button id="dPairs" class="dd-pairs dropdown-select bg-hover" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          `
            + pairs[0] +
          `
          </button>
          <input type="text" name="pairs" class="input-pairs d-none">
          <ul class="list-pairs dropdown-menu" aria-labelledby="dPairs">
          `
            + listPairs +
          `
          </ul>
        </div>
      </div>
      <div class="risk">
        <span>Risk Tolerance [%]:</span>
        <input type="number" class="bg-hover w-75 p-1 ml-1" name="risk" placeholder="what is you risk per operation in %?" min="0" max="100" step="0.01">
      </div>
      <div class="backtest">
        <button class="btn-neilit" type="button" data-toggle="modal" data-target=".modal-backtest">Connect to Backtest item</button>
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
              <a class="dropdown-item" href="#!" onclick="addRule('tp-f', this.parentElement)">Absolute TP (Full Profits)</a>
              <a class="dropdown-item" href="#!" onclick="addRule('tp-p', this.parentElement)">Partial TP (Scalling Out Profits)</a>
              <a class="dropdown-item" href="#!" onclick="addRule('sl-f', this.parentElement)">Absolute SL (Full Loss)</a>
              <a class="dropdown-item" href="#!" onclick="addRule('sl-p', this.parentElement)">Partial SL (Scalling Out Loss)</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <hr class="mt-2 mb-4">
    `;
};
// -- CREATE NEW POSITION
var newPositionPlan = `
  <hr class="mt-2 positioning">
  <div class="position-title mb-1">
    <input class="font-20 bg-hover w-75 p-1" type="text" name="positionTitle" placeholder="Title for the positioning rule">
  </div>
  <input class="position-strategy d-none" name="positionStrategy">
  <input class="position-type d-none" name="positionType">
  <div class="position-amount">
    <span>Scalling amount [%]:</span>
    <input class="input-amount bg-hover w-75 p-1 ml-1" type="number" name="amount" placeholder="what is the amount for your partial order (%)?">
  </div>
  <div class="order-type">
    <span>Order Type</span>
    <div class="dropdown">
      <button id="dOrderType" class="dd-order-type dropdown-select bg-hover" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        Market order
      </button>
      <input class="input-order d-none" name="orderType">
      <ul id="dd-order-type" class="list-orders dropdown-menu" aria-labelledby="dOrderType">
        <li onclick="changeOrder('market', this)">Market order</li>
        <li onclick="changeOrder('limit', this)">Limit order</li>
      </ul>
    </div>
  </div>
  <div class="description">
    <span>Description</span>
    <div class="client-description diveditable bg-hover w-75 p-1" placeholder="Any additional notes for this rule?" contenteditable="true"></div>
  </div>
  <textarea name="description" class="d-none server-description"></textarea>
  `;

module.exports = {
  comStratBeg: componentStrategyBeg,
  comStratEnd: componentStrategyEnd,
  newStrat: strategyHtml,
  newPos: newPositionPlan
};
