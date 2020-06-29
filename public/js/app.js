var menu = document.getElementById("neilit-menu");
var content = document.getElementById("content");
var toggleClose = document.getElementById("toggle-c-menu");
var toggleOpen = document.getElementById("toggle-o-menu");

// Toggle Close Menu
toggleClose.addEventListener("click", () => {
  menu.style.width = "0px";
  content.style.marginLeft = "0px";
  toggleOpen.classList.remove("d-none");
}, false);

// Toggle Open Menu
toggleOpen.addEventListener("click", () => {
  menu.style.width = "250px";
  content.style.marginLeft = "250px";
  toggleOpen.classList.add("d-none");
}, false);

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})
