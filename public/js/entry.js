$(document).ready(function() {
  // generates the datepicker
  $("input[type=date]").datepicker({
    dateFormat: 'yy-mm-dd'
  });
  // prevents the classic datepicker from loading
  $("input[type=date]").on('click', function() {
    return false;
  });
})

var storeEntry = document.getElementById('submit-entry')
var clientComment = document.getElementById("client-comment");
var serverComment = document.getElementById("server-comment");

// Sets placeholder for comment input
jQuery(function($){
  $("#client-comment").focusout(function(){
    var element = $(this);
    if (!element.text().replace(" ", "").length) {
      element.empty();
    }
  });
});

// Dispaly fields for entry close
function displayClose(close) {
  if (close == 0) {
    document.getElementById('entry-closure').classList.add("d-none");
    document.getElementById('entry-closure').classList.remove("d-flex");
  } else {
    document.getElementById('entry-closure').classList.remove("d-none");
    document.getElementById('entry-closure').classList.add("d-flex");
  }
}

// Sets the category that corresponds to the selected pair
function entryCategory() {
  var category = document.getElementById('entry-category')
  category.value = categories[document.getElementById('entry-pair').value]
}

// Connects a technical analysis to the entry
function connectTa(index) {
  var connectedId = tas.id[index]
  document.getElementById('ta').value = connectedId;
  $('#entry-ta').removeClass('d-none')
  var connectedTa = tas.title[index]
  $('#connect-ta').text(connectedTa);
}

// Hides the technical analysis associated to the entry
$('#noneTa').click(() => {
  $('#entry-ta').addClass('d-none')
})

// Toggles the display of the information box's input fields
function toggleDisplay(box) {
  var currentBox = $('.cursor-pointer').index(box);
  var allBoxes = document.getElementsByClassName('info-fields');
  allBoxes[currentBox].classList.toggle('d-none');
}

// Checks the format of entry time before the form submisison
function checkTime(form) {
  var entryTime = document.getElementById('entry-time').value;
  // blank entry time is valid
  if (entryTime == ''){
    form.submit();
    return true;
  // ensures that entry time has length five and contains only numbers
  } else if (entryTime.length == 5) {
    var logicOperator = true;
    for (var i = 0; i < entryTime.length; i++) {
      logicOperator = logicOperator && ((entryTime[i] >= '0' && entryTime[i] <= '9') || (entryTime[i] == ':'));
    }
    if (logicOperator) {
      form.submit();
      return true;
    }
  // otherwise the inputs gets rejected and the form submission is prevented
  } else {
    var localError = document.getElementById('local-alert');
    localError.classList.remove('d-none');
    window.scrollTo(0, 0);
    return false;
  }
}

// Runs before making the POST request
if (storeEntry != null) {
  storeEntry.addEventListener('click', () => {
    // deletes localStorage on submit
    window.localStorage.removeItem('entry-pair');
    window.localStorage.removeItem('entry-direction');
    // sends the comment to the server
    serverComment.value = clientComment.textContent || clientComment.innerText;
  })
}
