// Enables tooltips
$(document).ready(function() {
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
});

// Stores pre-information for technical analysis
// -- PAIR
// -> Default
window.localStorage.setItem('ta-pair', 0)
// -> Function
function taPair() {
  var taPair = document.getElementById('ta-pair');
  window.localStorage.setItem('ta-pair', taPair.value)
}

// Stores pre-information for entries
// -- PAIR
// -> Default
window.localStorage.setItem('entry-pair', 0)
// -> Function
function entryPair() {
  var entryPair = document.getElementById('entry-pair');
  window.localStorage.setItem('entry-pair', entryPair.value)
}
// -- DIRECTION
// -> Default
window.localStorage.setItem('entry-direction', 0)
// -> Function
function entryDirection(direction) {
  window.localStorage.setItem('entry-direction', direction);
}

// dropdown to select a time period for statistics
$('.dropdown-menu li').on('click', function() {
  var allDD = $('.dropdown-menu');
  var current = allDD.index($(this).parent())
  var getValue = $(this).text();
  if ($('.dropdown-select')[current]) {
    $('.dropdown-select')[current].innerHTML = getValue;
  }
});

// search bar for the dropdown
function searchDropdown(id) {
  var input, search, dropdownItems, val;
  var allDD = $('.dropdown-menu');
  var current = allDD.index(id.parentElement)
  input = document.getElementsByClassName('dropdown-search')[current];
  search = input.value.toUpperCase();
  dropdownItems = document.getElementsByClassName('dropdown-menu')[current].getElementsByTagName('li');
  for (var i = 0; i < dropdownItems.length; i++) {
    val = dropdownItems[i].textContent || dropdownItems[i].innerText;
    if (val.toUpperCase().indexOf(search) > -1) {
      dropdownItems[i].style.display = "";
    } else {
      dropdownItems[i].style.display = "none";
    }
  }
}
