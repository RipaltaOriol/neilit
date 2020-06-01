// Enables tooltips
$(document).ready(function() {
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
});

// Stores pre-information for technical analysis
// -> Default
window.localStorage.setItem('ta-pair', 0)
// -> Function
function taPair() {
  var taPair = document.getElementById('ta-pair');
  window.localStorage.setItem('ta-pair', taPair.value)
}

// Stores pre-information for entries
