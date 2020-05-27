var storeTa = document.getElementById("submit-ta");

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
$('#ta-content').on('mousedown', () => {
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

// Gives the text in the contenteditable to a texarea
function storeTexts() {
  allTexts = $('.client-comment');
  for (var i = 0; i < allTexts.length; i++) {
    $('.server-comment')[i].value = allTexts[i].textContent || allTexts[i].innerText;
  }
}

// Sets placeholder for text elements
jQuery(function($){
  $("#client-comment").focusout(function(){
    var element = $(this);
    if (!element.text().replace(" ", "").length) {
      element.empty();
    }
  });
});

// FIXME: too much repeated code between the 'isTrigger' & 'isGeneral' function - merge them into one!
// Creates strategy user widget for TRIGGER strategies
function isTrigger(id) {
  var triggerslist = $('.trigger');
  var current = triggerslist.index(id);
  var all = $('.widget-trigger');
  // adds visibility to display after selecting the element
  all[current].classList.remove('d-none');
  var selectStrategies = document.getElementsByName('strategy');
  var selectTimeframes = document.getElementsByName('timeframe');
  var holderStrategies = $('.strategy-trigger')
  var holderTimeframes = $('.timeframe-trigger')
  // gets the corresponding select html element
  var currentStrategy = selectStrategies[current];
  var currentTimeframe = selectTimeframes[current];
  // adds the text inside the select html elment to the widget for the user
  holderStrategies[current].innerHTML = currentStrategy.options[currentStrategy.selectedIndex].text;
  holderTimeframes[current].innerHTML = currentTimeframe.options[currentTimeframe.selectedIndex].text;
  // adds display none to strategy options
  $('.strategy-option')[current].classList.add('d-none')
  $('.strategy-option')[current].classList.remove('d-flex')
  $('.strategy-option')[current].classList.remove('flex-column')
}

// Creates strategy user widget for GENERAL strategies
function isGeneral(id) {
  var triggerslist = $('.general');
  var current = triggerslist.index(id);
  var all = $('.widget-general');
  // adds visibility to display after selecting the element
  all[current].classList.remove('d-none');
  var selectStrategies = document.getElementsByName('strategy');
  var selectTimeframes = document.getElementsByName('timeframe');
  var holderStrategies = $('.strategy-general')
  var holderTimeframes = $('.timeframe-general')
  // gets the corresponding select html element
  var currentStrategy = selectStrategies[current];
  var currentTimeframe = selectTimeframes[current];
  // adds the text inside the select html elment to the widget for the user
  holderStrategies[current].innerHTML = currentStrategy.options[currentStrategy.selectedIndex].text;
  holderTimeframes[current].innerHTML = currentTimeframe.options[currentTimeframe.selectedIndex].text;
  // adds display none to strategy options
  $('.strategy-option')[current].classList.add('d-none')
  $('.strategy-option')[current].classList.remove('d-flex')
  $('.strategy-option')[current].classList.remove('flex-column')
}

// Runs before making the POST request
if (storeTa != null) {
  storeTa.addEventListener('click', () => {
    // deletes localStorage on submit
    window.localStorage.removeItem('ta-pair');
    // sends the text to the server
    storeTexts();
  })
}
