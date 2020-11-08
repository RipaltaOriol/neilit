
// Technical Analysis Element: TEXT
// -- CREATE
var textHtml = `
  <span class="d-flex mb-2 ta-element">
    <input type="text" name="type" value="text" class="d-none">
    <div id="client-comment" class="editcontent client-comment text px-2 mr-2" placeholder="Use this space to write something." contenteditable="true"></div>
    <textarea id="server-comment" name="text" class="server-comment d-none"></textarea>
    <span class="d-flex align-items-top ml-auto">
      <img src="/imgs/icons/move.svg" alt="move" class="move">
      <img src="/imgs/icons/delete.svg" alt="delete" class="drop" onclick="whatIndex(this)">
    </span>
  </span>
  `;
// -- DISPLAY
function generateText(input) {
  return `
    <span class="d-flex mb-2 ta-element">
      <div class="edit-content client-comment text px-2 mr-2" placeholder="Use this space to write something." contenteditable>
        `
        + input +
        `
      </div>
    </span>
    `;
}
// -- EDIT
function editText(input) {
  return `
    <span class="d-flex mb-2 ta-element">
      <input type="text" name="type" value="text" class="d-none">
      <div id="client-comment" class="client-comment text px-2 mr-2" placeholder="Utilice este espacio para escribir un comentario..." contenteditable="true">
      `
      + input +
      `
      </div>
      <textarea id="server-comment" name="text" class="server-comment d-none" value="` + input + `"></textarea>
      <span class="d-flex ml-auto">
        <img src="/imgs/icons/move.svg" alt="move" class="move">
        <img src="/imgs/icons/delete.svg" alt="delete" class="drop" onclick="whatIndex(this)">
      </span>
    </span>
    `;
}

module.exports = {
  html: textHtml,
  generate: generateText,
  edit: editText
};
