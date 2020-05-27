
// Technical Analysis Element: TEXT
var textHtml = `
  <span class="d-flex mb-2 ta-element">
    <input type="text" name="type" value="text" class="d-none">
    <div id="client-comment" class="text px-2 mr-2" placeholder="Utilice este espacio para escribir un comentario..." contenteditable="true"></div>
    <textarea id="server-comment" name="text" class="d-none"></textarea>
    <span class="d-flex ml-auto">
      <img src="/imgs/icons/move.svg" alt="move" class="move">
      <img src="/imgs/icons/delete.svg" alt="delete" class="drop" onclick="whatIndex(this)">
    </span>
  </span>
  `;

module.exports = {
  html: textHtml
};
