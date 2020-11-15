
// Technical Analysis Element: IMAGE
// -- CREATE

// NOTE: upload image button has been set to display none
var imageHtml = `
  <span class="ta-element image d-flex mb-2">
    <input type="text" name="type" value="image" class="d-none">
    <div class="w-100 p-2">
      <span class="client-image">
        <label class="mb-0 d-none">Upload an image</label>
        <button type="button" class="upload btn-inverted d-none" onclick="uploadFile(this)">Upload</button>
        <input type="file" class="file d-none" accept="image/*">
        <span class="mx-1 d-none"><strong>or</strong></span>
        <label class="mb-0">Insert a URL</label>
        <input type="text" name="image" placeholder="www.image.com" class="url px-2">
        <button type="button" class="load btn-neilit" onclick="loadImage(this)">Aceptar</button>
      </span>
      <img class="image-src my-2">
    </div>
    <span class="d-flex mt-2 mb-auto ml-2">
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
      <div class="ta-element image d-flex mr-2 mb-2">
        <div class="px-2 w-100">
          <img class="image-src my-2" src="` + input + `">
        </div>
      </div>
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
    imageSource += `<img class="image-src mt-2" src="` + input + `">`
  // otherwise the image is a file
  } else {
    imageUrl += `<input type="text" name="image" placeholder="www.image.com" class="url px-2">`
    imageSource += `<img class="image-src mt-2" src="data:image/jpeg;base64,` + input + `">`
  }
  return `
    <span class="ta-element image d-flex mb-2">
      <input type="text" name="type" value="image" class="d-none">
      <div class="w-100 p-2">
        <span class="client-image">
          <label class="mb-0 d-none">Upload an image</label>
          <button type="button" class="upload btn-inverted d-none" onclick="uploadFile(this)">Upload</button>
          <input type="file" class="file d-none" accept="image/*">
          <span class="mx-1 d-none"><strong>or</strong></span>
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
      <span class="d-flex mt-2 mb-auto ml-2">
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
