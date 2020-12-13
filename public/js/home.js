// Demo Statistics widget
// Winrate:
var winrate = document.getElementById("winrate")
// Assets:
var eurusd = document.getElementById("eurusd")
var gbpusd = document.getElementById("gbpusd")
var audjpy = document.getElementById("audjpy")
var nzdjpy = document.getElementById("nzdjpy")
var usdjpy = document.getElementById("usdjpy")
var cadjpy = document.getElementById("cadjpy")
var audusd = document.getElementById("audusd")
var usdchf = document.getElementById("usdchf")

if (winrate != null) {
  eurusd.addEventListener("click", () => {
    winrate.textContent = (100 * 0.80).toFixed(2)
  });
  gbpusd.addEventListener("click", () => {
    winrate.textContent = (100 * 0.725).toFixed(2)
  });
  audjpy.addEventListener("click", () => {
    winrate.textContent = (100 * 0.74).toFixed(2)
  });
  nzdjpy.addEventListener("click", () => {
    winrate.textContent = (100 * 0.747).toFixed(2)
  });
  usdjpy.addEventListener("click", () => {
    winrate.textContent = (100 * 0.76).toFixed(2)
  });
  cadjpy.addEventListener("click", () => {
    winrate.textContent = (100 * 0.78).toFixed(2)
  });
  audusd.addEventListener("click", () => {
    winrate.textContent = (100 * 0.716).toFixed(2)
  });
  usdchf.addEventListener("click", () => {
    winrate.textContent = (100 * 0.76).toFixed(2)
  });

  // Direction:
  var buy = document.getElementById("buy")
  var short = document.getElementById("short")
  buy.addEventListener("click", () => {
    winrate.textContent = (100 * 0.854).toFixed(2)
  });
  short.addEventListener("click", () => {
    winrate.textContent = (100 * 0.789).toFixed(2)
  });

  // Strategies:
  var trendline = document.getElementById("trendline")
  var zone = document.getElementById("zone")
  var doubleBottom = document.getElementById("double-bottom")
  var doubleTop = document.getElementById("double-top")
  var triangle = document.getElementById("triangle")
  var hNs = document.getElementById("h&s")
  var fibonacci = document.getElementById("fibonacci")
  var butterfly = document.getElementById("butterfly")
  trendline.addEventListener("click", () => {
    winrate.textContent = (100 * 0.75).toFixed(2)
  });
  zone.addEventListener("click", () => {
    winrate.textContent = (100 * 0.745).toFixed(2)
  });
  doubleBottom.addEventListener("click", () => {
    winrate.textContent = (100 * 0.71).toFixed(2)
  });
  doubleTop.addEventListener("click", () => {
    winrate.textContent = (100 * 0.78).toFixed(2)
  });
  triangle.addEventListener("click", () => {
    winrate.textContent = (100 * 0.733).toFixed(2)
  });
  hNs.addEventListener("click", () => {
    winrate.textContent = (100 * 0.754).toFixed(2)
  });
  fibonacci.addEventListener("click", () => {
    winrate.textContent = (100 * 0.77).toFixed(2)
  });
  butterfly.addEventListener("click", () => {
    winrate.textContent = (100 * 0.768).toFixed(2)
  });
}

// changes the account's base currency
$('.dropdown-menu li').on('click', function() {
  var currency = $(this).text();
  $('#dd').val(currency);
});

// loading log in
$('#login').submit(function() {
  $('#login-spinner').removeClass('d-none')
  $('#login-text').hide();
  $('#login-btn').prop('disabled', true)
});

// loading log in
$('#signup').submit(function() {
  $('#signup-spinner').removeClass('d-none')
  $('#signup-text').hide();
  $('#signup-btn').prop('disabled', true)
});
