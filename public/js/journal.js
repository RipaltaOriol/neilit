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
