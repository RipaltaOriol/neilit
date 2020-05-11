let navbar = document.getElementById("sideNav");
let content = document.getElementById("content");
let openMenu = document.getElementById("open-menu");
let closeMenu = document.getElementById("close-menu");
let menuElementFix = document.getElementsByClassName("menu-element-fix");
let userInfoDiv = document.getElementById("user-info");
let userName = document.getElementById("user-profile-name");
let userImage = document.getElementById("user-profile-image");
let navigationContent = document.getElementById("navigation-content");
let navigationText = document.getElementsByClassName("hide-onSmall");
let navigationIcons = document.getElementsByClassName("navigation-icon");
let navigationIconsImgs = document.getElementsByClassName("shrink-navigation-icon");
let entryDirection = document.getElementById("direction");
let searchHeader = document.getElementById("search-header");
let sectionHeader = document.getElementsByClassName("section-header");
let sectionContent = document.getElementsByClassName("section-content");
let submitImage = document.getElementsByClassName("submit-img");
let inputImage = document.getElementsByClassName("form-control")
let entryImage = document.getElementsByClassName("SS");

// NOTE: create margin for the iframe due to the fucked up shit whatever

function openProfile() {
  navbar.classList.add("dark_cover");
  content.classList.add("dark_cover");
  var settingsDiv = document.createElement("div");
  settingsDiv.className = "settingsDiv d-flex align-items-start"
  settingsDiv.setAttribute("id", "settingsFr")
  var settingsPg = document.createElement("iframe")
  settingsPg.setAttribute("src", "/username/settings")
  settingsDiv.appendChild(settingsPg);
  // add close button
  var settingsClick = document.createElement("a");
  settingsClick.className = "settingsClose";
  settingsClick.setAttribute("id", "settingsClose");
  settingsClick.setAttribute("role", "button");
  settingsClick.setAttribute("onclick", "closeProfile()");
  var settingsIcon = document.createElement("img");
  settingsIcon.setAttribute("src", "/imgs/icons/cancel.svg")
  settingsIcon.className = "closeImage";
  settingsClick.appendChild(settingsIcon);
  settingsDiv.appendChild(settingsClick);
  document.body.appendChild(settingsDiv);
}

function closeProfile() {
  $("#settingsFr").remove();
  navbar.classList.remove("dark_cover");
  content.classList.remove("dark_cover");
}

for(var m = 0; m > menuElementFix.length; m++) {
  menuElementFix[m].addEventListener("mouseover", function() {

  })
}

openMenu.addEventListener("click", function() {
  navbar.style.width = "250px";
  content.style.marginLeft = "250px";
  bigUserProfileInfo();
  bigNavigationContent();
  uncorrectNavigationIconMargin();
}, false);

closeMenu.addEventListener("click", function() {
  navbar.style.width = "0px";
  content.style.marginLeft = "0px";
  smallUserProfileInfo();
  smallNavigationContent();
  correctNavigationIconMargin();
}, false);

function bigUserProfileInfo(){
  //userName.classList.remove("disappear");
  //userInfoDiv.classList.add("mx-3");
  //userInfoDiv.classList.remove("mx-2");
  //userImage.classList.add("mr-3");
  //userImage.classList.remove("auto-center-element");
  searchHeader.classList.add("mx-5");
  searchHeader.classList.remove("ml-3");
  searchHeader.classList.remove("mr-5");
  openMenu.classList.add("d-none");
}

function smallUserProfileInfo(){
  //userName.classList.add("disappear");
  //userInfoDiv.classList.remove("mx-3");
  //userInfoDiv.classList.add("mx-2");
  //userImage.classList.remove("mr-3");
  //userImage.classList.add("auto-center-element");
  searchHeader.classList.remove("mx-5");
  searchHeader.classList.add("ml-3");
  searchHeader.classList.add("mr-5");
  openMenu.classList.remove("d-none");
}

function bigNavigationContent() {
  navigationContent.classList.remove("mx-2");
  navigationContent.classList.add("mx-3");
  for (var i = 0; i < navigationIconsImgs.length; i++) {
    navigationIconsImgs[i].classList.add("aDisappear");
  }
  for (var y = 0; y < navigationText.length; y++) {
    navigationText[y].classList.remove("aDisappear");
  }
}

function smallNavigationContent() {
  navigationContent.classList.remove("mx-3");
  navigationContent.classList.add("mx-2");
  for (var i = 0; i < navigationIconsImgs.length; i++) {
    navigationIconsImgs[i].classList.remove("aDisappear");
  }
  for (var y = 0; y < navigationText.length; y++) {
    navigationText[y].classList.add("aDisappear");
  }
}

function correctNavigationIconMargin() {
  for (var i = 0; i < navigationIcons.length; i++) {
    navigationIcons[i].classList.add("text-center");
  }
}

function uncorrectNavigationIconMargin() {
  for (var i = 0; i < navigationIcons.length; i++) {
    navigationIcons[i].classList.remove("text-center");
  }
}

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

function calcRisk() {
  var aSize = document.getElementById('account-size').value;
  var oRisk = document.getElementById('ops-risk').value;
  if (aSize == '' || oRisk == '') {
    var aRisk = document.getElementById("trade-size").value;
    if (aRisk.value != '') {
      var slPer = document.getElementById('sl-per').value;
      if (slPer != '') {
        var pSize = (aRisk / slPer) / 1000;
        document.getElementById('ops-size').innerHTML = pSize;
      } else {
        return false;
      }
    } else {
      return false
    }
  } else {
    var aRisk = aSize * (oRisk / 100);
    var slPer = document.getElementById('sl-per').value;
    if (slPer != '') {
      var pSize = (aRisk / slPer) / 1000;
      document.getElementById('ops-size').innerHTML = pSize;
    } else {
      return false;
    }
  }
}
