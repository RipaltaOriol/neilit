
// Technical Analysis Element: IMAGE
var imageHtml = `
  <span class="d-flex mb-2 image ta-element">
    <input type="text" name="type" value="image" class="d-none">
    <div class="px-2">
      <span class="client-image">
        <label class="mb-0">Subir una image</label>
        <input type="file" class="file" accept="image/*">
        <span class=" mx-1"><strong>o</strong></span>
        <label class="mb-0">Insertar URL</label>
        <input type="text" name="image" placeholder="www.image.com" class="url px-2">
        <button type="button" class="load btn-neilit" onclick="loadImage(this)">Aceptar</button>
      </span>
      <img class="image-src my-2">
    </div>
    <span class="d-flex ml-auto">
      <img src="/imgs/icons/move.svg" alt="move" class="move">
      <img src="/imgs/icons/delete.svg" alt="delete" class="drop" onclick="whatIndex(this)">
    </span>
  </span>
  `;

module.exports = {
  html: imageHtml
};
