let pairNew = document.getElementById("entry-pair");
let direction = document.getElementsByClassName("entry-direction")[0];
let strategy = document.getElementsByClassName("entry-strategy")[0];
let ta_content = document.getElementById("ta-user-content");
let closeEntry = document.getElementById("close-entry");
let viewModeTA = document.getElementsByClassName("view-ta")[0];

var entryPair = document.getElementById("pair-entry");
var timeInput = document.getElementById("time-input");
var entryComment = document.getElementById("entry-comment")
var entryCreate = document.getElementById("create-entry");
var entryClose = document.getElementById("close-entry");
var closeFields = document.getElementsByClassName("close-fields")[0];
var editView = document.getElementsByClassName("edit-view")[0];



// JS for the COMMENT section of the JOURNAL
// Pass the text inside the comment to an input to send to backend






if (!(editView == null)) {
  entryPair.value = entry.entryPair
  document.getElementsByClassName('entry-strategy')[0].value = entry.entryStrategy;
}

// // Checks the direction on the entry [edit entry page]
// if (!(entry == null)) {
//   window.localStorage.removeItem('direction');
//   if (entry.entryDirection == 'long') {
//     document.getElementById("entry-buy").checked = true;
//   } else {
//       document.getElementById("entry-sell").checked = true;
//   }
// }

// if (entry != null || !(typeof entry == 'undefined')) {
//   // Checks the TA on the entry [edit entry page]
//   if (entry.entryTA == null) {
//     document.getElementById('noneTA').checked = true;
//   }
//   // Checks the result(open/close) on the entry [edit entry page]
//   if (entry.entryResult == null) {
//     document.getElementById('open-entry').checked = true;
//   } else {
//     document.getElementById('close-entry').checked = true;
//     closeFields.classList.remove("d-none");
//     document.getElementById('exit-date').value = entry.exitDate
//     document.getElementById('exit-price').value = entry.exitPrice
//     document.getElementById('entry-result').value = entry.entryResult
//   }
// }

// Create a Time Input for macOS support
function checkTime(input) {
  // check if the key pressed is a number
  var currentKey = event.key;
  if (!isNaN(currentKey)) {
    // prevents the frontmost number to be greater than 2
    if (timeInput.value.length < 1 && currentKey > 2) {
      input.preventDefault();
    }
    // handles the ":" separator from hours to minutes
    if (timeInput.value.length == 2) {
      timeInput.value = timeInput.value + ":";
    }
    // prevent adding more than 4 numbers (time value)
    if (timeInput.value.length >= 5) {
      input.preventDefault();
    }
  } else {
    // allow backspace and tab
    if (currentKey == 'Backspace' || currentKey == 'Tab') {

    } else {
      input.preventDefault();
    }
  }
}

// Reset the text on the entry comment field when clicked
entryComment.addEventListener("click", () => {
  if (entryComment.innerHTML == "Utilice este espacio para escribir algún comentario adicional") {
    entryComment.innerHTML = "";
  }
});

// Find the index of the currency that is selected
function matchIndex(currency) {
  return currency == entryPair.value
}

// // Pass the text in the entry comment to a input to send to backend
// entryCreate.addEventListener("click", () => {
//   var passComment = $("#comment-input");
//   passComment.val(entryComment.innerHTML);
//   entryPair.value = currencies.findIndex(matchIndex) + 1;
// })

var createTA = document.getElementById("create-ta");
if (createTA != null) {
  createTA.addEventListener("click", () => {
    var textInput = $(".block-text-input");
    var textContent = $(".block-text");
    for (var i = 0; i < textContent.length; i++) {
      var commentVal = textContent[i].innerHTML;
      textInput[i].value = commentVal;
    }
  })
}

// Function SHOW & HIDES the TA linked to an Entry
var showEntryTA = document.getElementById('show-entry-ta');
var hideEntryTA = document.getElementById('hide-entry-ta');
// Elements where DISPLAY has to be adjusted
var dateEntryTA = document.getElementById('date-entry-ta');
var allEntryTA = document.getElementById('load-entry-ta');
showEntryTA.addEventListener('click', () => {
  hideEntryTA.classList.remove('d-none');
  showEntryTA.classList.add('d-none');
  dateEntryTA.classList.remove('d-none');
  allEntryTA.classList.remove('d-none');
})
hideEntryTA.addEventListener('click', () => {
  hideEntryTA.classList.add('d-none');
  showEntryTA.classList.remove('d-none');
  dateEntryTA.classList.add('d-none');
  allEntryTA.classList.add('d-none');
})


// Function to monitor clicks on TA part of the entry creatio process [new entry screen]
function addingTA(identifier) {
  var dropdownTA = document.getElementById('selectTa');
  if (identifier.value == 'none') {
    dropdownTA.classList.add('d-none');
  } else if (identifier.value == 'offline') {
    dropdownTA.classList.add('d-none');
  } else if (identifier.value == 'existing') {
    dropdownTA.classList.remove('d-none');
  }
}

// Function sends the TA ID to a button to send it to the server
function passTaId(identifier, title) {
  document.getElementById('infoTa').value = identifier
  document.getElementById('show-selectedTA').innerHTML = title;
}

// Elements for creating a new TA -----------------------------------
// ADDING A NEW INSTANCE OF ANY/EACH ELELMENT -----------------------
// Define trigger buttons
var ta_new_title = document.getElementById("ta_new_title");
var ta_new_image = document.getElementById("ta_new_image");
var ta_new_text = document.getElementById("ta_new_text");
var ta_new_strategy = document.getElementById("ta_new_strategy");
// Add TITLE
if (ta_new_title != null) {
  ta_new_title.addEventListener("click", function() {
    var ta_title_element = document.createElement("span");
    ta_title_element.className = "d-flex mb-2 image-element ta-element";
    var ta_title_type = document.createElement("input");
    ta_title_type.type = "text";
    ta_title_type.setAttribute("name", "type");
    ta_title_type.setAttribute("value", "title");
    ta_title_type.className = "d-none";
    var ta_title = document.createElement("input");
    ta_title.type = "text";
    ta_title.className = "block-title"; // set the CSS class
    ta_title.placeholder = "Título"
    ta_title.setAttribute("name", "title");
    var ta_title_dragdrop = document.createElement("span");
    ta_title_dragdrop.className = "d-flex ml-auto";
    var ta_title_drag = document.createElement("img");
    ta_title_drag.className = "inline-element move_element";
    ta_title_drag.setAttribute("src", "/imgs/icons/move_thin.svg");
    var ta_title_drop = document.createElement("img");
    ta_title_drop.className = "inline-element delete_element";
    ta_title_drop.setAttribute("src", "/imgs/icons/delete.svg");
    ta_title_drop.setAttribute("onclick", "tellIndex(this)")
    ta_title_dragdrop.appendChild(ta_title_drag);
    ta_title_dragdrop.appendChild(ta_title_drop);
    ta_title_element.appendChild(ta_title_type);
    ta_title_element.appendChild(ta_title);
    ta_title_element.appendChild(ta_title_dragdrop);
    ta_content.appendChild(ta_title_element);
  })
}

// Add IMAGE
if (ta_new_image != null) {
  ta_new_image.addEventListener("click", function() {
    var ta_image_element = document.createElement("span");
    ta_image_element.className = "d-flex justify-content-between mb-2 image-element ta-element";
    var ta_image_type = document.createElement("input");
    ta_image_type.type = "text";
    ta_image_type.setAttribute("name", "type");
    ta_image_type.setAttribute("value", "image");
    ta_image_type.className = "d-none";
    var ta_image = document.createElement("div");
    ta_image.className = "px-0 div-image";
    // Input image
    var ta_image_label_file = document.createElement("label");
    ta_image_label_file.className = "ml-2 mr-1 pb-1";
    var ta_image_label_file_text = document.createTextNode("Subir una imagen");
    ta_image_label_file.appendChild(ta_image_label_file_text);
    ta_image.appendChild(ta_image_label_file);
    var ta_image_input_file = document.createElement("input");
    ta_image_input_file.type = "file";
    ta_image_input_file.className = "p-1 upload-image-file";
    ta_image.appendChild(ta_image_input_file);
    // Span [or]
    var ta_image_or = document.createElement("span");
    var ta_image_or_text = document.createTextNode("o");
    ta_image_or.appendChild(ta_image_or_text);
    ta_image_or.className = "or-style mx-1";
    ta_image.appendChild(ta_image_or);
    // URl image
    var ta_image_label_url = document.createElement("label");
    ta_image_label_url.className = "mr-1 pb-1";
    var ta_image_label_url_text = document.createTextNode("Insertar URL");
    ta_image_label_url.appendChild(ta_image_label_url_text);
    ta_image.appendChild(ta_image_label_url);
    var ta_image_input_url = document.createElement("input");
    ta_image_input_url.type = "text";
    ta_image_input_url.setAttribute("name", "image");
    ta_image_input_url.className = "p-1 upload-image-url mr-1";
    ta_image_input_url.setAttribute("placeholder", "www.imagen.com");
    ta_image.appendChild(ta_image_input_url);
    // Submit
    var ta_image_submit = document.createElement("input");
    ta_image_submit.type = "button";
    ta_image_submit.className = "submit-image";
    ta_image_submit.setAttribute("value", "Aceptar");
    ta_image_submit.setAttribute("onclick", "placeImage(this)")
    ta_image.appendChild(ta_image_submit);
    // Image
    var ta_image_image = document.createElement("img");
    ta_image_image.className = "block-image my-2";
    ta_image.appendChild(ta_image_image);

    var ta_image_dragdrop = document.createElement("span");
    ta_image_dragdrop.className = "d-flex align-items-start ml-auto";
    var ta_image_drag = document.createElement("img");
    ta_image_drag.className = "inline-element move_element";
    ta_image_drag.setAttribute("src", "/imgs/icons/move_thin.svg");
    var ta_image_drop = document.createElement("img");
    ta_image_drop.className = "inline-element delete_element";
    ta_image_drop.setAttribute("src", "/imgs/icons/delete.svg");
    ta_image_drop.setAttribute("onclick", "tellIndex(this)")
    ta_image_dragdrop.appendChild(ta_image_drag);
    ta_image_dragdrop.appendChild(ta_image_drop);
    ta_image_element.appendChild(ta_image_type);
    ta_image_element.appendChild(ta_image);
    ta_image_element.appendChild(ta_image_dragdrop);
    ta_content.appendChild(ta_image_element);
  })
}

// places the image in the corresponding element
function placeImage(identifier) {
  // var getSameSrc = document.getElementsByClassName("upload-image-url")[identifier];
  // var currentSrc = getSameSrc.value;
  // var getSameImg = document.getElementsByClassName("block-image")[identifier];
  //--
  var listOfUploadImgBtn = $(".submit-image");
  var currentUploadImgBtn = listOfUploadImgBtn.index(identifier);
  var listOfUrlInput = $(".upload-image-url");
  var currentUrlInput = listOfUrlInput[currentUploadImgBtn];
  var currentSrc = currentUrlInput.value;
  var listOfBlockImg = $(".block-image");
  var currentBlockImg = listOfBlockImg[currentUploadImgBtn];
  //--
  currentBlockImg.setAttribute("src", currentSrc);
  var currentImageElement = $(".div-image")[currentUploadImgBtn];
  var divImageChilds = currentImageElement.childNodes;
  for (var childs = 0; childs < divImageChilds.length; childs++) {
    if (!divImageChilds[childs].classList.contains("block-image")) {
        divImageChilds[childs].classList.add("d-none");
      }
  }
  // getSameImg.setAttribute("src", currentSrc);
  // var getCurrentImageElement = document.getElementsByClassName("div-image")[identifier];
  // var divImageChilds = getCurrentImageElement.childNodes;
  // for (var childs = 0; childs < divImageChilds.length; childs++) {
  //   if (!divImageChilds[childs].classList.contains("block-image")) {
  //     divImageChilds[childs].classList.add("d-none");
  //   }
  // }
  // NOTE: ERRASE this LOG
  //console.log(divImageChilds.length);

}


// Add TEXT
if (ta_new_text != null) {
  ta_new_text.addEventListener("click", function() {
    var ta_text_element = document.createElement("span");
    ta_text_element.className = "d-flex mb-2 ta-element";
    var ta_text_type = document.createElement("input");
    ta_text_type.type = "text";
    ta_text_type.setAttribute("name", "type");
    ta_text_type.setAttribute("value", "text");
    ta_text_type.className = "d-none";
    var ta_text = document.createElement("div");
    var ta_text_pholder = document.createTextNode("Utilice este espacio para escribir algún comentario adicional");
    ta_text.appendChild(ta_text_pholder);
    var ta_text_form = document.createElement("textarea");
    ta_text_form.className = "block-text-input d-none"
    ta_text_form.setAttribute("name", "text");

    ta_text.className = "block-text mr-2 contenteditable";
    ta_text.setAttribute("contenteditable", true);

    var ta_text_dragdrop = document.createElement("span");
    ta_text_dragdrop.className = "d-flex ml-auto";
    var ta_text_drag = document.createElement("img");
    ta_text_drag.className = "inline-element move_element";
    ta_text_drag.setAttribute("src", "/imgs/icons/move_thin.svg");
    var ta_text_drop = document.createElement("img");
    ta_text_drop.className = "inline-element delete_element";
    ta_text_drop.setAttribute("src", "/imgs/icons/delete.svg");
    ta_text_drop.setAttribute("onclick", "tellIndex(this)")
    ta_text_dragdrop.appendChild(ta_text_drag);
    ta_text_dragdrop.appendChild(ta_text_drop);
    ta_text_element.appendChild(ta_text_type);
    ta_text_element.appendChild(ta_text_form);
    ta_text_element.appendChild(ta_text);
    ta_text_element.appendChild(ta_text_dragdrop);
    ta_content.appendChild(ta_text_element);
    addTextPlaceholders();
  })

  function addTextPlaceholders() {
    var allTextBlocks = document.getElementsByClassName("block-text");
    for (var det = 0; det < allTextBlocks.length; det ++) {
      allTextBlocks[det].addEventListener("click", function() {
        if (this.innerHTML == "Utilice este espacio para escribir algún comentario adicional") {
          this.innerHTML = "";
        }
        // MISSING: if [innerHTML] == "", then reset placeholder
      })
    }
  }
}


// Add STRATEGY
if (ta_new_strategy != null) {
  ta_new_strategy.addEventListener("click", function() {
    var ta_strategy_element = document.createElement("span");
    ta_strategy_element.className = "d-flex mb-2 strategy-element ta-element";
    var ta_strategy_type = document.createElement("input");
    ta_strategy_type.type = "text";
    ta_strategy_type.setAttribute("name", "type");
    ta_strategy_type.setAttribute("value", "strategy");
    ta_strategy_type.className = "d-none";
    var ta_strategy = document.createElement("div");
    ta_strategy.className = "d-flex flex-wrap py-2";
    var ta_strategy_div = document.createElement("div");
    ta_strategy_div.className = "form-check block-strategy mr-3";
    ta_strategy.appendChild(ta_strategy_div);
    // Strategies
    var countStrategyElements = document.getElementsByClassName("strategy-element");
    var currentIdentifier = countStrategyElements.length + 1;
    for (var strat = 0; strat < strategies.length; strat++) {
      var ta_strategy_adiv = document.createElement("div");
      var ta_strategy_input = document.createElement("input");
      ta_strategy_input.type = "checkbox";
      ta_strategy_input.className = "form-check-input"
      ta_strategy_input.setAttribute("name", "strategy");
      ta_strategy_input.setAttribute("value", strategies[strat]);
      // add local identifier to differentiate
      ta_strategy_input.setAttribute("id", "strategy-" + strat + "-" + currentIdentifier);
      ta_strategy_adiv.appendChild(ta_strategy_input);
      var ta_strategy_label = document.createElement("label");
      ta_strategy_label.className = "form-check-label";
      // add local identifier to differentiate
      ta_strategy_label.setAttribute("for", "strategy-" + strat + "-" + currentIdentifier);
      ta_strategy_label.innerHTML = strategies[strat];
      ta_strategy_adiv.appendChild(ta_strategy_label);
      ta_strategy_div.appendChild(ta_strategy_adiv);
    }
    // Strategy Importance
    var ta_strategy_imp = document.createElement("div");
    ta_strategy_imp.className = "mr-3";
    var ta_strategy_imp_head = document.createElement("h6");
    var ta_strategy_imp_text = document.createTextNode("Tipo de Patron")
    ta_strategy_imp_head.appendChild(ta_strategy_imp_text);
    ta_strategy_imp.appendChild(ta_strategy_imp_head)

    var strategy_imp_trigger_div = document.createElement("div")
    strategy_imp_trigger_div.className = "form-check";
    var strategy_imp_trigger_input = document.createElement("input");
    strategy_imp_trigger_input.className = "form-check-input";
    strategy_imp_trigger_input.setAttribute("type", "radio");
    strategy_imp_trigger_input.setAttribute("name", "strategy_I_" + currentIdentifier);
    strategy_imp_trigger_input.setAttribute("id", "strategy-trigger-" + currentIdentifier);
    strategy_imp_trigger_input.setAttribute("value", "trigger");
    var strategy_imp_trigger_Label = document.createElement("label");
    strategy_imp_trigger_Label.className = "form-check-label"
    strategy_imp_trigger_Label.setAttribute("for", "strategy-trigger-" + currentIdentifier)
    var strategy_imp_trigger_Labeltxt = document.createTextNode("Patrones desencadenantes");
    strategy_imp_trigger_Label.appendChild(strategy_imp_trigger_Labeltxt);
    strategy_imp_trigger_div.appendChild(strategy_imp_trigger_input);
    strategy_imp_trigger_div.appendChild(strategy_imp_trigger_Label);
    ta_strategy_imp.appendChild(strategy_imp_trigger_div);

    var strategy_imp_general_div = document.createElement("div")
    strategy_imp_general_div.className = "form-check";
    var strategy_imp_general_input = document.createElement("input");
    strategy_imp_general_input.className = "form-check-input";
    strategy_imp_general_input.setAttribute("type", "radio");
    strategy_imp_general_input.setAttribute("name", "strategy_I_" + currentIdentifier);
    strategy_imp_general_input.setAttribute("id", "strategy-general-" + currentIdentifier);
    strategy_imp_general_input.setAttribute("value", "general");
    var strategy_imp_general_Label = document.createElement("label");
    strategy_imp_general_Label.className = "form-check-label"
    strategy_imp_general_Label.setAttribute("for", "strategy-general-" + currentIdentifier)
    var strategy_imp_general_Labeltxt = document.createTextNode("Patrones generales");
    strategy_imp_general_Label.appendChild(strategy_imp_general_Labeltxt);
    strategy_imp_general_div.appendChild(strategy_imp_general_input);
    strategy_imp_general_div.appendChild(strategy_imp_general_Label);
    ta_strategy_imp.appendChild(strategy_imp_general_div);

    ta_strategy.appendChild(ta_strategy_imp);

    // Strategy Timeframe
    var ta_strategy_timeframe = document.createElement("div");
    ta_strategy_timeframe.className = "timeframe-strategy mr-3";
    var ta_strategy_timeframe_head = document.createElement("h6");
    var ta_strategy_timeframe_text = document.createTextNode("Strategy Timeframe")
    ta_strategy_timeframe_head.appendChild(ta_strategy_timeframe_text);
    ta_strategy_timeframe.appendChild(ta_strategy_timeframe_head)
    var ta_strategy_timeframe_div = document.createElement("div");
    ta_strategy_timeframe_div.className = "form-check";


    // This TWO below are counters, they can be reused and eliminated
    var countStrategyElements = document.getElementsByClassName("strategy-element");
    var currentIdentifier = countStrategyElements.length + 1;
    for (var tmfrm = 0; tmfrm < timeframes.length; tmfrm++) {
      var ta_timeframe_adiv = document.createElement("div");
      var ta_timeframe_input = document.createElement("input");
      ta_timeframe_input.type = "radio";
      ta_timeframe_input.className = "form-check-input"
      ta_timeframe_input.setAttribute("name", "strategy_timeframes_" + currentIdentifier);
      ta_timeframe_input.setAttribute("value", timeframes[tmfrm]);
      // add local identifier to differentiate
      ta_timeframe_input.setAttribute("id", "strategy-timeframe-" + tmfrm + "-" + currentIdentifier);
      ta_timeframe_adiv.appendChild(ta_timeframe_input);
      var ta_timeframe_label = document.createElement("label");
      ta_timeframe_label.className = "form-check-label";
      // add local identifier to differentiate
      ta_timeframe_label.setAttribute("for", "strategy-timeframe-" + tmfrm + "-" + currentIdentifier);
      ta_timeframe_label.innerHTML = timeframes[tmfrm];
      ta_timeframe_adiv.appendChild(ta_timeframe_label);
      ta_strategy_timeframe_div.appendChild(ta_timeframe_adiv);
    }
    ta_strategy_timeframe.appendChild(ta_strategy_timeframe_div);
    ta_strategy.appendChild(ta_strategy_timeframe);

    var ta_strategy_dragdrop = document.createElement("span");
    ta_strategy_dragdrop.className = "d-flex align-items-start ml-auto";
    var ta_strategy_drag = document.createElement("img");
    ta_strategy_drag.className = "inline-element move_element";
    ta_strategy_drag.setAttribute("src", "/imgs/icons/move_thin.svg");
    var ta_strategy_drop = document.createElement("img");
    ta_strategy_drop.className = "inline-element delete_element";
    ta_strategy_drop.setAttribute("src", "/imgs/icons/delete.svg");
    ta_strategy_drop.setAttribute("onclick", "tellIndex(this)")
    ta_strategy_dragdrop.appendChild(ta_strategy_drag);
    ta_strategy_dragdrop.appendChild(ta_strategy_drop);
    ta_strategy_element.appendChild(ta_strategy_type);
    ta_strategy_element.appendChild(ta_strategy);
    ta_strategy_element.appendChild(ta_strategy_dragdrop);
    ta_content.appendChild(ta_strategy_element);
  })
}

// Delete FUNCTION
// NOTE: deleting adds 'permanent' class 'display:none'. If the elements
// were truly deleted this would affect the identifiers because they are
// dynamic
function whatIndex(idElement) {
  var listOfAddedElements = $(".delete_element");
  var currentDeleteElement = listOfAddedElements.index(idElement);
  var currentAddedElement = $(".ta-element");
  if (currentAddedElement[currentDeleteElement]) {
    var deleteThisElement = currentAddedElement[currentDeleteElement];
    deleteThisElement.classList.remove("d-flex");
    deleteThisElement.classList.add("d-none");
    // NOTE: remember to only save the element that do not have d-none
    // FIXME: according to my past self this line below should trigger errors
    deleteThisElement.parentNode.removeChild(deleteThisElement);
  }
}

// first we check that ta-user-content exists.
// purpose: we ensure that we are in the correct route
var taUserContent = document.getElementById("ta-user-content");
if (taUserContent != null) {
  $("#ta-user-content").sortable({
    axis: 'y',
    containment: "#ta-user-content",
    cancel: ':input,button,.contenteditable'
  });
}

var createTA = document.getElementById("create-ta");
if (createTA != null) {
  createTA.addEventListener("click", () => {
    var textInput = $(".block-text-input");
    var textContent = $(".block-text");
    for (var i = 0; i < textContent.length; i++) {
      var commentVal = textContent[i].innerHTML;
      textInput[i].value = commentVal;
    }
  })
}

// ------------------------------------------------------------------

// closeEntry.addEventListener("click", function() {
//   console.log("Closing entry!");
// });



// ------------------------------------------------------------------


function createEntryPair(pair) {
  window.localStorage.setItem('pair', pair.value);
}

function createEntryDirection(direction) {
  window.localStorage.setItem('direction', direction);
}

// Establish Entry Pair
if (pairNew != null) {
  if(window.localStorage.getItem('pair') != null) {
    pairNew.value = (window.localStorage.getItem('pair'));
    if(pairNew.value != "default") {
      pairNew.classList.remove("entry-pair-invalid")
      pairNew.classList.add("entry-pair-valid")
    } else {
      pairNew.classList.remove("entry=pair-valid")
      pairNew.classList.add("entry-pair-invalid")
    }
  }
}

// Establish Entry Direction
if (direction != null) {
  var long = document.getElementById("create-entry-buy");
  var short = document.getElementById("create-entry-sell");

  if (window.localStorage.getItem('direction') != null) {
    if (window.localStorage.getItem('direction') == 1) {
      long.checked = true;
    }
    else if (window.localStorage.getItem('direction') == 2) {
      short.checked = true;
    }
  }
}

// Check whether the user strategy is valid or not
if (strategy != null) {
  strategy.addEventListener("change", function() {
    if(strategy.value != "default") {
      strategy.classList.remove("entry-strategy-invalid")
      strategy.classList.add("entry-strategy-valid")
    } else {
      strategy.classList.remove("entry=strategy-valid")
      strategy.classList.add("entry-strategy-invalid")
    }
  });
}

// Use datepicker on the date inputs
$("input[type=date]").datepicker({
  dateFormat: 'yy-mm-dd',
  onSelect: function(dateText, inst) {
    $(inst).val(dateText); // Write the value in the input
  }
});

// Code below to avoid the classic date-picker
$("input[type=date]").on('click', function() {
  return false;
});

// NOTE: this code (from here and below is only for SHOWING & EDITING existing TA)
// NOTE: -> it could be moved to its separate JS file
var taObject;
if (taObject != null) {
  // get PAIR
  var taPair = document.getElementById("ta-pair")
  taPair.value = taObject.pair;
  taPair.classList.add("entry-pair-valid")
  // get DATE
  var taDate = document.getElementById("ta-date");
  taDate.value = taObject.date;
  // create the TA
  // Magic Starts Here (just kidding)
  var countTitle = 0;
  var countImage = 0;
  var countText = 0;
  var countStrategy = 0;
  for (var type = 0; type < taObject.type.length; type++) {
    if (taObject.type[type] == 'title') {
      putTitleElement(taObject.titleVal[countTitle]);
      countTitle += 1;

    }
    if (taObject.type[type] == 'image') {
      putImageElement(taObject.imageVal[countImage]);
      countImage += 1;
    }
    if (taObject.type[type] == 'text') {
      putTextElement(taObject.textVal[countText]);
      countText += 1;
    }
    if (taObject.type[type] == 'strategy') {
      putStrategyElement(taObject.strategyVal[countStrategy], taObject.strategyImp[countStrategy], taObject.strategyTime[countStrategy]);
      countStrategy += 1;
    }
  }
}

function putTitleElement(title) {
  var ta_title_element = document.createElement("span");
  ta_title_element.className = "d-flex mb-2 image-element ta-element";
  var ta_title_type = document.createElement("input");
  ta_title_type.type = "text";
  ta_title_type.setAttribute("name", "type");
  ta_title_type.setAttribute("value", "title");
  ta_title_type.className = "d-none";
  var ta_title = document.createElement("input");
  ta_title.type = "text";
  ta_title.className = "block-title"; // set the CSS class
  ta_title.setAttribute("name", "title");
  ta_title.setAttribute("value", title);
  var ta_title_dragdrop = document.createElement("span");
  ta_title_dragdrop.className = "d-flex ml-auto";
  var ta_title_drag = document.createElement("img");
  ta_title_drag.className = "inline-element move_element";
  ta_title_drag.setAttribute("src", "/imgs/icons/move_thin.svg");
  var ta_title_drop = document.createElement("img");
  ta_title_drop.className = "inline-element delete_element";
  ta_title_drop.setAttribute("src", "/imgs/icons/delete.svg");
  ta_title_drop.setAttribute("onclick", "tellIndex(this)")
  ta_title_dragdrop.appendChild(ta_title_drag);
  ta_title_dragdrop.appendChild(ta_title_drop);
  ta_title_element.appendChild(ta_title_type);
  ta_title_element.appendChild(ta_title);
  ta_title_element.appendChild(ta_title_dragdrop);
  ta_content.appendChild(ta_title_element);
}

function putImageElement(image) {
  var ta_image_element = document.createElement("span");
  ta_image_element.className = "d-flex justify-content-between mb-2 image-element ta-element";
  var ta_image_type = document.createElement("input");
  ta_image_type.type = "text";
  ta_image_type.setAttribute("name", "type");
  ta_image_type.setAttribute("value", "image");
  ta_image_type.className = "d-none";
  var ta_image = document.createElement("div");
  ta_image.className = "px-0 div-image";
  // Input image
  var ta_image_label_file = document.createElement("label");
  ta_image_label_file.className = "ml-2 mr-1 pb-1 d-none";
  var ta_image_label_file_text = document.createTextNode("Subir una imagen");
  ta_image_label_file.appendChild(ta_image_label_file_text);
  ta_image.appendChild(ta_image_label_file);
  var ta_image_input_file = document.createElement("input");
  ta_image_input_file.type = "file";
  ta_image_input_file.className = "p-1 upload-image-file d-none";
  ta_image.appendChild(ta_image_input_file);
  // Span [or]
  var ta_image_or = document.createElement("span");
  var ta_image_or_text = document.createTextNode("o");
  ta_image_or.appendChild(ta_image_or_text);
  ta_image_or.className = "or-style mx-1 d-none";
  ta_image.appendChild(ta_image_or);
  // URl image
  var ta_image_label_url = document.createElement("label");
  ta_image_label_url.className = "mr-1 pb-1 d-none";
  var ta_image_label_url_text = document.createTextNode("Insertar URL");
  ta_image_label_url.appendChild(ta_image_label_url_text);
  ta_image.appendChild(ta_image_label_url);
  var ta_image_input_url = document.createElement("input");
  ta_image_input_url.type = "text";
  ta_image_input_url.setAttribute("name", "image");
  ta_image_input_url.className = "p-1 upload-image-url mr-1 d-none";
  ta_image_input_url.setAttribute("placeholder", "www.imagen.com");
  ta_image.appendChild(ta_image_input_url);
  // Submit
  var ta_image_submit = document.createElement("input");
  ta_image_submit.type = "button";
  ta_image_submit.className = "submit-image d-none";
  ta_image_submit.setAttribute("value", "Aceptar");
  ta_image_submit.setAttribute("onclick", "placeImage(this)")
  ta_image.appendChild(ta_image_submit);
  // Image
  var ta_image_image = document.createElement("img");
  ta_image_image.className = "block-image my-2";
  ta_image_image.setAttribute("src", image);
  ta_image.appendChild(ta_image_image);

  var ta_image_dragdrop = document.createElement("span");
  ta_image_dragdrop.className = "d-flex align-items-start ml-auto";
  var ta_image_drag = document.createElement("img");
  ta_image_drag.className = "inline-element move_element";
  ta_image_drag.setAttribute("src", "/imgs/icons/move_thin.svg");
  var ta_image_drop = document.createElement("img");
  ta_image_drop.className = "inline-element delete_element";
  ta_image_drop.setAttribute("src", "/imgs/icons/delete.svg");
  ta_image_drop.setAttribute("onclick", "tellIndex(this)")
  ta_image_dragdrop.appendChild(ta_image_drag);
  ta_image_dragdrop.appendChild(ta_image_drop);
  ta_image_element.appendChild(ta_image_type);
  ta_image_element.appendChild(ta_image);
  ta_image_element.appendChild(ta_image_dragdrop);
  ta_content.appendChild(ta_image_element);
}

function putTextElement(text) {
  var ta_text_element = document.createElement("span");
  ta_text_element.className = "d-flex mb-2 ta-element";
  var ta_text_type = document.createElement("input");
  ta_text_type.type = "text";
  ta_text_type.setAttribute("name", "type");
  ta_text_type.setAttribute("value", "text");
  ta_text_type.className = "d-none";
  var ta_text = document.createElement("div");
  var ta_text_pholder = document.createTextNode("Utilice este espacio para escribir algún comentario adicional");
  ta_text.appendChild(ta_text_pholder);
  var ta_text_form = document.createElement("textarea");
  ta_text_form.className = "block-text-input d-none"
  ta_text_form.setAttribute("name", "text");

  ta_text.className = "block-text mr-2 contenteditable";
  ta_text.innerHTML = text;
  ta_text.setAttribute("contenteditable", true);

  var ta_text_dragdrop = document.createElement("span");
  ta_text_dragdrop.className = "d-flex ml-auto";
  var ta_text_drag = document.createElement("img");
  ta_text_drag.className = "inline-element move_element";
  ta_text_drag.setAttribute("src", "/imgs/icons/move_thin.svg");
  var ta_text_drop = document.createElement("img");
  ta_text_drop.className = "inline-element delete_element";
  ta_text_drop.setAttribute("src", "/imgs/icons/delete.svg");
  ta_text_drop.setAttribute("onclick", "tellIndex(this)")
  ta_text_dragdrop.appendChild(ta_text_drag);
  ta_text_dragdrop.appendChild(ta_text_drop);
  ta_text_element.appendChild(ta_text_type);
  ta_text_element.appendChild(ta_text_form);
  ta_text_element.appendChild(ta_text);
  ta_text_element.appendChild(ta_text_dragdrop);
  ta_content.appendChild(ta_text_element);
}

function putStrategyElement(strategy, importance, timeframe) {
  var ta_strategy_element = document.createElement("span");
  ta_strategy_element.className = "d-flex mb-2 strategy-element ta-element";
  var ta_strategy_type = document.createElement("input");
  ta_strategy_type.type = "text";
  ta_strategy_type.setAttribute("name", "type");
  ta_strategy_type.setAttribute("value", "strategy");
  ta_strategy_type.className = "d-none";
  var ta_strategy = document.createElement("div");
  ta_strategy.className = "d-flex flex-wrap py-2";
  var ta_strategy_div = document.createElement("div");
  ta_strategy_div.className = "form-check block-strategy mr-3";
  ta_strategy.appendChild(ta_strategy_div);
  // Strategies
  var countStrategyElements = document.getElementsByClassName("strategy-element");
  var currentIdentifier = countStrategyElements.length + 1;
  for (var strat = 0; strat < strategies.length; strat++) {
    var ta_strategy_adiv = document.createElement("div");
    var ta_strategy_input = document.createElement("input");
    ta_strategy_input.type = "checkbox";
    ta_strategy_input.className = "form-check-input"
    ta_strategy_input.setAttribute("name", "strategy");
    ta_strategy_input.setAttribute("value", strategies[strat]);
    if (ta_strategy_input.value == strategy) {
      ta_strategy_input.setAttribute("checked", true);
    }
    // add local identifier to differentiate
    ta_strategy_input.setAttribute("id", "strategy-" + strat + "-" + currentIdentifier);
    ta_strategy_adiv.appendChild(ta_strategy_input);
    var ta_strategy_label = document.createElement("label");
    ta_strategy_label.className = "form-check-label";
    // add local identifier to differentiate
    ta_strategy_label.setAttribute("for", "strategy-" + strat + "-" + currentIdentifier);
    ta_strategy_label.innerHTML = strategies[strat];
    ta_strategy_adiv.appendChild(ta_strategy_label);
    ta_strategy_div.appendChild(ta_strategy_adiv);
  }
  // Strategy Importance
  var ta_strategy_imp = document.createElement("div");
  ta_strategy_imp.className = "mr-3";
  var ta_strategy_imp_head = document.createElement("h6");
  var ta_strategy_imp_text = document.createTextNode("Tipo de Patron")
  ta_strategy_imp_head.appendChild(ta_strategy_imp_text);
  ta_strategy_imp.appendChild(ta_strategy_imp_head)

  var strategy_imp_trigger_div = document.createElement("div")
  strategy_imp_trigger_div.className = "form-check";
  var strategy_imp_trigger_input = document.createElement("input");
  strategy_imp_trigger_input.className = "form-check-input";
  strategy_imp_trigger_input.setAttribute("type", "radio");
  strategy_imp_trigger_input.setAttribute("name", "strategy_I_" + currentIdentifier);
  strategy_imp_trigger_input.setAttribute("id", "strategy-trigger-" + currentIdentifier);
  strategy_imp_trigger_input.setAttribute("value", "trigger");
  if (strategy_imp_trigger_input.value == importance) {
    strategy_imp_trigger_input.setAttribute("checked", true);
  }
  var strategy_imp_trigger_Label = document.createElement("label");
  strategy_imp_trigger_Label.className = "form-check-label"
  strategy_imp_trigger_Label.setAttribute("for", "strategy-trigger-" + currentIdentifier)
  var strategy_imp_trigger_Labeltxt = document.createTextNode("Patrones desencadenantes");
  strategy_imp_trigger_Label.appendChild(strategy_imp_trigger_Labeltxt);
  strategy_imp_trigger_div.appendChild(strategy_imp_trigger_input);
  strategy_imp_trigger_div.appendChild(strategy_imp_trigger_Label);
  ta_strategy_imp.appendChild(strategy_imp_trigger_div);

  var strategy_imp_general_div = document.createElement("div")
  strategy_imp_general_div.className = "form-check";
  var strategy_imp_general_input = document.createElement("input");
  strategy_imp_general_input.className = "form-check-input";
  strategy_imp_general_input.setAttribute("type", "radio");
  strategy_imp_general_input.setAttribute("name", "strategy_I_" + currentIdentifier);
  strategy_imp_general_input.setAttribute("id", "strategy-general-" + currentIdentifier);
  strategy_imp_general_input.setAttribute("value", "general");
  if (strategy_imp_general_input.value == importance) {
    strategy_imp_general_input.setAttribute("checked", true);
  }
  var strategy_imp_general_Label = document.createElement("label");
  strategy_imp_general_Label.className = "form-check-label"
  strategy_imp_general_Label.setAttribute("for", "strategy-general-" + currentIdentifier)
  var strategy_imp_general_Labeltxt = document.createTextNode("Patrones generales");
  strategy_imp_general_Label.appendChild(strategy_imp_general_Labeltxt);
  strategy_imp_general_div.appendChild(strategy_imp_general_input);
  strategy_imp_general_div.appendChild(strategy_imp_general_Label);
  ta_strategy_imp.appendChild(strategy_imp_general_div);

  ta_strategy.appendChild(ta_strategy_imp);

  // Strategy Timeframe
  var ta_strategy_timeframe = document.createElement("div");
  ta_strategy_timeframe.className = "timeframe-strategy mr-3";
  var ta_strategy_timeframe_head = document.createElement("h6");
  var ta_strategy_timeframe_text = document.createTextNode("Strategy Timeframe")
  ta_strategy_timeframe_head.appendChild(ta_strategy_timeframe_text);
  ta_strategy_timeframe.appendChild(ta_strategy_timeframe_head)
  var ta_strategy_timeframe_div = document.createElement("div");
  ta_strategy_timeframe_div.className = "form-check";


  // This TWO below are counters, they can be reused and eliminated
  var countStrategyElements = document.getElementsByClassName("strategy-element");
  var currentIdentifier = countStrategyElements.length + 1;
  for (var tmfrm = 0; tmfrm < timeframes.length; tmfrm++) {
    var ta_timeframe_adiv = document.createElement("div");
    var ta_timeframe_input = document.createElement("input");
    ta_timeframe_input.type = "radio";
    ta_timeframe_input.className = "form-check-input"
    ta_timeframe_input.setAttribute("name", "strategy_timeframes_" + currentIdentifier);
    ta_timeframe_input.setAttribute("value", timeframes[tmfrm]);
    if (ta_timeframe_input.value == timeframe) {
      ta_timeframe_input.setAttribute("checked", true);
    }
    // add local identifier to differentiate
    ta_timeframe_input.setAttribute("id", "strategy-timeframe-" + tmfrm + "-" + currentIdentifier);
    ta_timeframe_adiv.appendChild(ta_timeframe_input);
    var ta_timeframe_label = document.createElement("label");
    ta_timeframe_label.className = "form-check-label";
    // add local identifier to differentiate
    ta_timeframe_label.setAttribute("for", "strategy-timeframe-" + tmfrm + "-" + currentIdentifier);
    ta_timeframe_label.innerHTML = timeframes[tmfrm];
    ta_timeframe_adiv.appendChild(ta_timeframe_label);
    ta_strategy_timeframe_div.appendChild(ta_timeframe_adiv);
  }
  ta_strategy_timeframe.appendChild(ta_strategy_timeframe_div);
  ta_strategy.appendChild(ta_strategy_timeframe);

  var ta_strategy_dragdrop = document.createElement("span");
  ta_strategy_dragdrop.className = "d-flex align-items-start ml-auto";
  var ta_strategy_drag = document.createElement("img");
  ta_strategy_drag.className = "inline-element move_element";
  ta_strategy_drag.setAttribute("src", "/imgs/icons/move_thin.svg");
  var ta_strategy_drop = document.createElement("img");
  ta_strategy_drop.className = "inline-element delete_element";
  ta_strategy_drop.setAttribute("src", "/imgs/icons/delete.svg");
  ta_strategy_drop.setAttribute("onclick", "tellIndex(this)")
  ta_strategy_dragdrop.appendChild(ta_strategy_drag);
  ta_strategy_dragdrop.appendChild(ta_strategy_drop);
  ta_strategy_element.appendChild(ta_strategy_type);
  ta_strategy_element.appendChild(ta_strategy);
  ta_strategy_element.appendChild(ta_strategy_dragdrop);
  ta_content.appendChild(ta_strategy_element);
}

// JS used to finish adjusting the front-end of TA View
if (viewModeTA != null) {
  viewModeTA.value = taObject.pair;
}

// On SHOW TA route -> all inputs are disables = no editing allowed
// Removes ALL edits!
var taShow = $("#show-ta");
if (taShow.length > 0) {
  $("#ta-user-content :input").attr("disabled", true);
  $("#ta-user-content").sortable("disable");
  var deleteBtns = $(".delete_element")
  var moveBtns = $(".move_element")
  for (var i = 0; i < deleteBtns.length; i++) {
    deleteBtns[i].style.display = "none";
    console.log(1);
    moveBtns[i].style.visibility = "hidden";
  }
  var disTextElements = $(".contenteditable")
  for (var t = 0; t < disTextElements.length; t++) {
    disTextElements[t].setAttribute("contenteditable", false);
  }
}

var updateTA = document.getElementById("update-ta");
if (updateTA != null) {
  updateTA.addEventListener("click", () => {
    var textInput = $(".block-text-input");
    var textContent = $(".block-text");
    for (var i = 0; i < textContent.length; i++) {
      var commentVal = textContent[i].innerHTML;
      textInput[i].value = commentVal;
    }
  })
}

function getpgelements() {
  var pgelements = $(".ta-element");
  console.log("Elements: " + pgelements.length);
}


function setCategory() {
  var selectedPair = document.getElementById("pair-entry").value;
  var entryCategory = document.getElementById("entry-category");
  function checkPairIndex(indx) {
    return indx === selectedPair;
  }

  var pairIndex = currencies.findIndex(checkPairIndex);
  if (pairIndex >= 0) {
    entryCategory.value = categories[pairIndex];
  }
}
