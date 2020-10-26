
// Backtest Addon: List Option
// -- CREATE
var addonHtml = `
  <div>
    <span class="input-group mb-2">
      <label class="my-auto">Nombre de la variable:</label>
      <input type="text" class="form-control backtest-input px-2" name="varName" placeholder="E.g. 'RSI on overbough or oversold?'">
    </span>
    <label class="checkbox-orange my-auto">
      Permitir solo números
      <input type="checkbox" class="int-list" onclick="intOption(this);">
      <input type="number" name="intList" value="0" class="d-none int-input">
      <span class="checkmark"></span>
    </label>
    <span class="input-group my-2">

      <label class="mr-2">Campos de respuesta:</label>

      <div class="d-flex flex-column option">
        <input type="number" name="arrOption" class="d-none option-array">
        <input type="text" name="varOption" class="option-list px-2 mb-2" placeholder="E.g. Yes" onkeypress="return newOption(this);">
        <input type="text" name="varOption" class="option-list px-2 mb-2" placeholder="E.g. No" onkeypress="return newOption(this);">
      </div>
      <span class="d-flex flex-column justify-content-between ml-2">
        <img class="info" src="/imgs/icons/info.svg" data-toggle="tooltip" data-placement="right" title="To add more fields press enter inside the last available field. Up to a 6 at maximum.">
        <button type="button" class="icon-btn" onclick="addOption(this)">
          <img src="/imgs/icons/add.svg">
        </button>
      </span>
    </span>
  </div>
  `;

var addonOptionHtml = `
  <input type="text" class="option-list px-2 mb-2" name="varOption" placeholder="E.g. New option" onkeypress="return newOption(this);">
  `;

module.exports = {
  htmlList: addonHtml,
  optionList: addonOptionHtml
}
