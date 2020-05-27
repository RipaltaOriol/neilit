
// Technical Analysis Element: TITLE
var titleHtml = `
  <span class="d-flex mb-2 ta-element">
    <input type="text" name="type" value="title" class="d-none">
    <input type="text" name="title" class="title px-2 mr-2" placeholder="Título">
    <span class="d-flex ml-auto">
      <img src="/imgs/icons/move.svg" alt="move" class="move">
      <img src="/imgs/icons/delete.svg" alt="delete" class="drop" onclick="whatIndex(this)">
    </span>
  </span>
  `;

module.exports = {
  html: titleHtml
};
