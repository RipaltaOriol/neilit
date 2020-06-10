
// Technical Analysis Element: IMAGE
// -- CREATE
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
// -- DISPLAY
function generateImage(input) {
  // check if the image is a URL
  if (input.startsWith('https://')) {
    return `
      <span class="d-flex mb-2 image ta-element">
        <div class="px-2">
          <img class="image-src my-2" src="` + input + `">
        </div>
      </span>
      `;
  // otherwise the image is a file
  } else {
    return `
      <span class="d-flex mb-2 image ta-element">
        <div class="px-2">
          <img class="image-src my-2" src="data:image/jpeg;base64,` + input + `">
        </div>
      </span>
      `;
  }
}
// -- EDIT
function editImage(input) {
  var imageUrl = ``;
  var imageSource = ``;
  // check if the image is a URL
  if (input.startsWith('https://')) {
    imageUrl += `<input type="text" name="image" placeholder="www.image.com" class="url px-2" value="` + input + `">`
    imageSource += `<img class="image-src my-2" src="` + input + `">`
  // otherwise the image is a file
  } else {
    imageUrl += `<input type="text" name="image" placeholder="www.image.com" class="url px-2">`
    imageSource += `<img class="image-src my-2" src="data:image/jpeg;base64,` + input + `">`
  }
  return `
    <span class="d-flex mb-2 image ta-element">
      <input type="text" name="type" value="image" class="d-none">
      <div class="px-2">
        <span class="client-image">
          <label class="mb-0">Subir una image</label>
          <input type="file" class="file" accept="image/*">
          <span class=" mx-1"><strong>o</strong></span>
          <label class="mb-0">Insertar URL</label>
          `
          + imageUrl +
          `
          <button type="button" class="load btn-neilit" onclick="loadImage(this)">Aceptar</button>
        </span>
        `
        + imageSource +
        `
      </div>
      <span class="d-flex ml-auto">
        <img src="/imgs/icons/move.svg" alt="move" class="move">
        <img src="/imgs/icons/delete.svg" alt="delete" class="drop" onclick="whatIndex(this)">
      </span>
    </span>
    `;
}

module.exports = {
  html: imageHtml,
  generate: generateImage,
  edit: editImage
};
