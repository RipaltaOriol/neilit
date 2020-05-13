let navbar = document.getElementById("neilit-menu");
let closeMenu = document.getElementById("toggle-c-menu");
let openMenu = document.getElementById("toggle-o-menu");
let menuElementFix = document.getElementsByClassName("element-menu");
let navigationContent = document.getElementById("content-menu");

let searchHeader = document.getElementById("header-top");

// JS in use ends here !!!!! -------///------


let userInfoDiv = document.getElementById("user-info");
let userName = document.getElementById("user-profile-name");
let userImage = document.getElementById("user-profile-image");
let navigationText = document.getElementsByClassName("hide-onSmall");
let navigationIcons = document.getElementsByClassName("navigation-icon");
let navigationIconsImgs = document.getElementsByClassName("shrink-navigation-icon");
let entryDirection = document.getElementById("direction");
let sectionHeader = document.getElementsByClassName("section-header");
let sectionContent = document.getElementsByClassName("section-content");
let submitImage = document.getElementsByClassName("submit-img");
let inputImage = document.getElementsByClassName("form-control")
let entryImage = document.getElementsByClassName("SS");

// NOTE: create margin for the iframe due to the fucked up shit whatever



if (entryDirection != null) {
  entryDirection.onchange = function() {
    var index = this.selectedIndex;
    if (index == 0) {
      entryDirection.style.color = "#a9a9a9";
    } else if (index == 1) {
      entryDirection.style.color = "red";
    } else if (index == 2) {
      entryDirection.style.color = "green";
    }
  }
}


// NOTE: Improve this function!
Object.keys(sectionHeader).forEach(function(index) {
  var newIndex = index;
  sectionHeader[index].addEventListener("click", function() {
    if (this.textContent == "Preparación") {
      sectionContent[0].classList.toggle("d-none");
    } else if (this.textContent == "Operación") {
      sectionContent[1].classList.toggle("d-none");
    } else if (this.textContent == "Post-Operación") {
      sectionContent[2].classList.toggle("d-none");
    }
  })
});

// Check whether the user pair is valid or not
// NOTE: add this for every class that contans entry-pair
// FIXME: I don't think we need this anymore
// -> we do not have a default option on the select (we use datalist)
// -> maybe we still use this for the strategies
let pair = document.getElementsByClassName("entry-pair")[0];
if (pair != null) {
  pair.addEventListener("change", function() {
    if(pair.value != "default") {
      pair.classList.remove("entry-pair-invalid")
      pair.classList.add("entry-pair-valid")
    } else {
      pair.classList.remove("entry=pair-valid")
      pair.classList.add("entry-pair-invalid")
    }
  });
}


// NOTE: Improve this function!
Object.keys(submitImage).forEach(function(index) {
  var newIndex = index;
  submitImage[index].addEventListener("click", function() {
    if (this.id == "preparation") {
      entryImage[0].src = inputImage[0].value;
    } else if (this.id == "operation") {
      entryImage[1].src = inputImage[1].value;
    } else if (this.id == "post-operation") {
      entryImage[2].src = inputImage[2].value;
    }
  })
})

function createEntryPair(pair) {
  window.localStorage.setItem('pair', pair.value);
}

function createEntryDirection(direction) {
  window.localStorage.setItem('direction', direction);
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

// FUNCTION TO KNOW IF THE SELECTED PAIR IS VALID OR NOT
// THIS FUNCTION ALSO EXISTS IN JOURANL PROCESS
