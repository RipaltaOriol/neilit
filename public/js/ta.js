// Gets the pair information from the JOURNAL route
if (window.localStorage.getItem('ta-pair') != null) {
  document.getElementById('ta-pair').value = window.localStorage.getItem('ta-pair');
  taCategory();
}

// Sets the category that corresponds to the selected pair
function taCategory() {
  var category = document.getElementById('ta-category')
  category.value = categories[document.getElementById('ta-pair').value]
}

// Elements available in TA
var taTitle = document.getElementById("title");
var taText = document.getElementById("text");
var taImage = document.getElementById("image");
var taStrategy = document.getElementById("strategy");

// Adds the corresponding elments to the TA
var taContent = document.getElementById("ta-content")
// -> Title
taTitle.addEventListener('click', () => {
  $('#ta-content').append(elements.title);
});
// -> Text
taText.addEventListener('click', () => {
  $('#ta-content').append(elements.text);
});
// -> Image
taImage.addEventListener('click', () => {
  $('#ta-content').append(elements.image);
});
// -> Strategy
taStrategy.addEventListener('click', () => {
  $('#ta-content').append(elements.strategy);
})

// Loads the TA image into a widget
function loadImage(id) {
  var imagesList = $('.load');
  var current = imagesList.index(id);
  var allFile = $('.file');
  var currentLoad = allFile[current];
  if (currentLoad.files && currentLoad.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var allWidget = $('.image-src');
      var currentWidget = allWidget[current];
      currentWidget.setAttribute("src", e.target.result);
    }
    reader.readAsDataURL(currentLoad.files[0])
  } else {
    var allUrl = $('.url');
    var currentLoad = allUrl[current];
    var currentSrc = currentLoad.value;
    if (currentSrc != "") {
      var allWidget = $('.image-src');
      var currentWidget = allWidget[current];
      // sets the image source to the image
      currentWidget.setAttribute("src", currentSrc);
    }
  }
  var allImage = $('.client-image');
  var currentImage = allImage[current];
  currentImage.classList.add('d-none');
}

// Allows for sorting and draggind elements in the TA
$('.ta-content').on('mousedown', () => {
  $("#ta-content").sortable({
      axis: 'y',
      cursor: 'move',
      containment: "#ta-content"
  })
})

// Deletes the corresponding elmenet in the TA
function whatIndex(id) {
  var elementsList = $('.drop');
  var current = elementsList.index(id);
  var all = $('.ta-element');
  // checks if the target element exists in the TA
  if (all[current]) {
    var currentDrop = all[current];
    currentDrop.classList.add('d-none');
    // FIXME: possible bug ???
    currentDrop.parentNode.removeChild(currentDrop);
  }
}

// Send the comment from Client -> Server
// if (storeComment != null) {
//   storeComment.addEventListener("click", () => {
//     serverComment.value = clientComment.textContent || clientComment.innerText;
//   })
// }

// Sets placeholder for comment input
jQuery(function($){
  $("#client-comment").focusout(function(){
    var element = $(this);
    if (!element.text().replace(" ", "").length) {
      element.empty();
    }
  });
});

// Deletes localStorage on submit
document.getElementById('submit-ta').addEventListener('click', () => {
  window.localStorage.removeItem('ta-pair');
})
