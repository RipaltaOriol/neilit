var storeTa = document.getElementById("submit-ta");

// Gets the pair information from the JOURNAL route
if (window.localStorage.getItem('ta-pair') != null) {
  // prevents the pair from chading on the edit route
  if (!($('.edit').length > 0)) {
    document.getElementById('ta-pair').value = window.localStorage.getItem('ta-pair');
    taCategory();
  }
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
  // image from a machine upload
  if (currentLoad.files && currentLoad.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var allWidget = $('.image-src');
      var currentWidget = allWidget[current];
      currentWidget.setAttribute("src", e.target.result);
    }
    var allUrl = $('.url');
    var currentUrl = allUrl[current];
    reader.onloadend = () => {
      // sets the base64 image econding into the text input
      currentUrl.value = reader.result.split(',')[1];
    }
    reader.readAsDataURL(currentLoad.files[0]);
  }
  // image from a web url
  else {
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
$('#ta-content').on('mouseup', () => {
  $("#ta-content").sortable({
      axis: 'y',
      cursor: 'move',
      containment: "#ta-content",
      cancel: 'input, select, [contenteditable]'
  })
})

// Generates the datepicker for the TA
$("input[type=date]").datepicker({
  dateFormat: 'yy-mm-dd'
});
// prevents the classic datepicker from loading
$("input[type=date]").on('click', function() {
  return false;
});

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

// Creates strategy user widget for TRIGGER or GENERAL strategies
function isImportance(id, importance) {
  var triggerslist = $('.' + importance);
  var current = triggerslist.index(id);
  var all = $('.widget-' + importance + '');
  // adds visibility to display after selecting the element
  all[current].classList.remove('d-none');
  var selectStrategies = document.getElementsByName('strategy');
  var selectTimeframes = document.getElementsByName('timeframe');
  var holderStrategies = $('.strategy-' + importance)
  var holderTimeframes = $('.timeframe-' + importance)
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
  // sends the importance type to the input
  var importanceList = document.getElementsByName('importance');
  importanceList[current].value = importance;
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
