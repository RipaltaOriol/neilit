
// Technical Analysis Element: TITLE
// -- CREATE
var titleHtml = `
  <span class="ta-element d-flex mb-2 py-1">
    <input type="text" name="type" value="title" class="d-none">
    <input type="text" name="title" class="title px-2 mr-2" placeholder="Title">
    <span class="d-flex ml-auto">
      <img src="/imgs/icons/move.svg" alt="move" class="move">
      <img src="/imgs/icons/delete.svg" alt="delete" class="drop" onclick="whatIndex(this)">
    </span>
  </span>
  `;
// -- DISPLAY
function generateTitle(input) {
  return `
    <div class="ta-element d-flex mb-2 py-1">
      <input type="text" class="title px-2 mr-2" placeholder="Undefined" value="` + input + `" readonly>
    </div>
    `;
}
// -- EDIT
function editTitle(input) {
  return `
    <span class="ta-element d-flex mb-2 py-1">
      <input type="text" name="type" value="title" class="d-none">
      <input type="text" name="title" class="title px-2 mr-2" placeholder="Title" value="` + input + `">
      <span class="d-flex ml-auto">
        <img src="/imgs/icons/move.svg" alt="move" class="move">
        <img src="/imgs/icons/delete.svg" alt="delete" class="drop" onclick="whatIndex(this)">
      </span>
    </span>
    `;
}

module.exports = {
  html: titleHtml,
  generate: generateTitle,
  edit: editTitle
};
