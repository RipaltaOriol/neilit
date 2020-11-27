// html to load more data using infinite scroll
var taIndex1 = '<div class="bg-grey mx-3 p-3 mb-3 rounded"><div class="d-flex justify-content-between mb-2"><span class="orange"><strong>'
var taIndex2 = '</strong></span><span>'
var taIndex3 = '</span></div><p class="mb-0">Last updated: '
var taIndex4 = '<div class="text-right"><a href="'
var taIndex5 = '" class="btn-inverted">'
var taIndex6 = '</a></div></div>'
var filterQuery;

$(document).ready(function() {
  if (typeof currencies !== 'undefined') {
    currencies = Object.fromEntries(currencies);
  }
  // redirects to notification page
  if (screen.width < 768) {
    window.location.replace("/mobile")
  }
  // sets datepicker
  $(function() {
    $.datepicker.setDefaults(
      $.extend(
        $.datepicker.regional[language]
      )
    )
    $('.datepicker').each(function(){
      $(this).datepicker({
        altField: "#" + $(this).data('target'),
        altFormat: "yy-mm-dd" // format for database processing
      });
    });
  });
  // prevents the classic datepicker from loading
  $("input[type=date]").on('click', function() {
    return false;
  });
})

var storeTa = document.getElementById("submit-ta");

// manages the spinner on loading processes
function loadingState(bool) {
  if (bool) {
    $('#spinner').removeClass('d-none')
  } else {
    $('#spinner').addClass('d-none')
  }
}

// Infinite scroll
let loadedCount = 25;
$('.journal-scroll').scroll(() => {
  var $el = $('.journal-scroll');
  var $eh = $('.journal-scroll')[0];
  if ($el.innerHeight() + $el.scrollTop() >= $eh.scrollHeight - 5 && loadedCount) {
    var data = {
      offset: loadedCount
    }
    if (filterQuery) { data.query = filterQuery }
    loadingState(true);
    $.post('ta/load-index', data)
      .done((data) => {
        loadedCount+= 25;
        // add new technical analysis to the index list
        data.dataList.forEach((analysis) => {
          var newTA = taIndex1 + analysis.pair + taIndex2
            + new Date(analysis.created_at).toLocaleDateString(language, data.options)
            + taIndex3 + new Date(analysis.last_update).toLocaleDateString(language, data.options)
            + taIndex4 + '/' + username + '/journal/ta/'
            + analysis.id + taIndex5 + data.buttonText + taIndex6;
          $('.journal-scroll')[0].innerHTML += newTA
        });
        loadingState(false);

        if (data.dataList.length < 25) {
          loadedCount = 0;
        }
    })
      .fail(() => {

    })
  }
})

// Filter results
$('#apply-filter').click(() => {
  $("#modal-loading").modal();
  var filterPairs = $('input[name=pair]:checked').map(function(){
    return 'pair LIKE "' + this.value + '"';
  }).get().join(' || ');
  var filterCategories = $('input[name=category]:checked').map(function(){
    return 'tanalysis.category LIKE "' + this.value + '"';
  }).get().join(' || ');
  var filterCreate, filterEdit, filterSort, filterOrder;
  if ($('#display-create').is(":checked")) {
    filterCreate = $('input[name=create]').map(function(){
      return '"' + this.value + '"';
    }).get().join(' && ');
  }
  if ($('#display-edit').is(":checked")) {
    filterEdit = $('input[name=edit]').map(function(){
      return '"' + this.value + '"';
    }).get().join(' && ');
  }
  filterSort = $('input[name=sort]:checked').val()
  filterOrder = $('input[name=order]:checked').val()
  var data = {
    pairs: filterPairs,
    categories: filterCategories,
    create: filterCreate,
    edit: filterEdit,
    sort: filterSort,
    order: filterOrder
  }
  $.post('ta/filter', data)
    .done((data) => {
      $('.journal-scroll')[0].innerHTML = ''
      // add new technical analysis to the index list
      data.dataList.forEach((analysis, i) => {
        var newTA = taIndex1 + analysis.pair + taIndex2
          + new Date(analysis.created_at).toLocaleDateString(language, data.options)
          + taIndex3 + new Date(analysis.last_update).toLocaleDateString(language, data.options)
          + taIndex4 + '/' + username + '/journal/ta/'
          + analysis.id + taIndex5 + data.buttonText + taIndex6;
        $('.journal-scroll')[0].innerHTML += newTA
      });
      filterQuery = data.query;
      loadedCount = 25;
      $("#modal-loading").modal('hide');
  })
    .fail(() => {

  })
})

// dropdown to select a time period for statistics
$('.dropdown-menu li').on('click', function() {
  var allDD = $('.dropdown-menu');
  var current = allDD.index($(this).parent())
  var getValue = $(this).text();
  if ($('.dropdown-server')[current]) {
    $('.dropdown-server')[current].value = this.className;
    $('#ta-category').val(currencies[($(this).text())].category)
  }
  if ($('.dropdown-select')[current]) {
    $('.dropdown-select')[current].innerHTML = getValue;
  }
});

$('.dropdown-menu.filter ol').on('click', function(e) {
  e.stopPropagation();
  if (e.target.tagName.toUpperCase() === "LABEL"
    || e.target.tagName.toUpperCase() === "SPAN"
    || e.target.tagName.toUpperCase() === "OL") {
    return;
  }
  var allDD = $('.dropdown-menu');
  var current = allDD.index($(this).parent())
  var getValue = $(this).text();
  var dropdownLabel = $('.dropdown-select')[current]
  if ($(this).children().children().is(':checked')) {
    dropdownLabel.innerHTML += getValue;
  } else {
    dropdownLabel.innerHTML = dropdownLabel.innerHTML.replace(getValue.trim(), '');
    if (dropdownLabel.innerHTML.trim() == '') {
      dropdownLabel.innerHTML += getValue;
      $(this).children().children().prop('checked', true)
    }
  }
})

// search bar for the dropdown
function searchDropdown(id) {
  var input, search, dropdownItems, val;
  var allDD = $('.dropdown-menu');
  var current = allDD.index(id.parentElement)
  input = document.getElementsByClassName('dropdown-search')[current];
  search = input.value.toUpperCase();
  dropdownItems = document.getElementsByClassName('dropdown-menu')[current].querySelectorAll('li, ol');
  for (var i = 0; i < dropdownItems.length; i++) {
    val = dropdownItems[i].textContent || dropdownItems[i].innerText;
    if (val.toUpperCase().indexOf(search) > -1) {
      dropdownItems[i].style.display = "";
    } else {
      dropdownItems[i].style.display = "none";
    }
  }
}

// manages filter functions
$('#display-create').click(() => {
  $('#filter-create').toggleClass('d-none')
})

$('#display-edit').click(() => {
  $('#filter-edit').toggleClass('d-none')
})

$('#display-advance').click(() => {
  $('#filter-advance').toggleClass('d-none')
})

// activates the upload file input
function uploadFile(id) {
  var uploadList = $('.upload');
  var current = uploadList.index(id);
  $('.file')[current].click();
  $('.file').change(() => {
    $('.load').click();
  });
}

// Elements available in TA
var taTitle = document.getElementById("title");
var taText = document.getElementById("text");
var taImage = document.getElementById("image");
var taStrategy = document.getElementById("strategy");

// Adds the corresponding elments to the TA
var taContent = document.getElementById("ta-content")
// -> Title
if (taTitle) {
  taTitle.addEventListener('click', () => {
    $('#ta-content').append(elements.title);
  });
}
// -> Text
if (taText) {
  taText.addEventListener('click', () => {
    $('#ta-content').append(elements.text);
    // Sets placeholder for text input
    jQuery(function($){
      $(".editcontent").focusout(function(){
        var element = $(this);
        if (!element.text().replace(" ", "").length) {
          element.empty();
        }
      });
    });
  });
}
// -> Image
if (taImage) {
  taImage.addEventListener('click', () => {
    $('#ta-content').append(elements.image);
  });
}
// -> Strategy
if (taStrategy) {
  taStrategy.addEventListener('click', () => {
    $('#ta-content').append(elements.strategy);
    // dropdown to select a time period for statistics
    $('.dropdown-menu li').on('click', function() {
      var allDD = $('.dropdown-menu');
      var current = allDD.index($(this).parent())
      var getValue = $(this).text();
      if ($('.dropdown-server')[current]) {
        $('.dropdown-server')[current].value = this.className;
      }
      if ($('.dropdown-select')[current]) {
        $('.dropdown-select')[current].innerHTML = getValue;
      }
    });

  })
}

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
    $('.server-comment')[i].value = allTexts[i].innerText.replace(/\n/g, "<br/>");
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
  var holderStrategies = $('.strategy-' + importance)
  var holderTimeframes = $('.timeframe-' + importance)
  // gets the corresponding select html element
  var currentStrategy = document.getElementsByClassName('strategy-select')[current].textContent.trim();
  var currentTimeframe = document.getElementsByClassName('timeframe-select')[current].textContent.trim();
  // adds the text inside the select html elment to the widget for the user
  holderStrategies[current].innerHTML = currentStrategy;
  holderTimeframes[current].innerHTML = currentTimeframe;
  // adds display none to strategy options
  $('.strategy-option')[current].classList.add('d-none')
  $('.strategy-option')[current].classList.remove('d-flex')
  // sends the importance type to the input
  var importanceList = document.getElementsByName('importance');
  importanceList[current].value = importance;
}

// Runs before making the POST request
if (storeTa != null) {
  storeTa.addEventListener('click', () => {
    // sends the text to the server
    storeTexts();
  })
}
