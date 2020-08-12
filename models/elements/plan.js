// Trading Plan Element: STRATEGY

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
var newStrategyPlan = `
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
  `;
// -- CREATE NEW POSITION
var newPositionPlan = `
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
  `;

module.exports = {
  comStratBeg: componentStrategyBeg,
  comStratEnd: componentStrategyEnd,
  newStrat: newStrategyPlan,
  newPos: newPositionPlan
};
