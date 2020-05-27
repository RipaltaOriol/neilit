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
    winrate.textContent = 100 * 0.80;
  });
  gbpusd.addEventListener("click", () => {
    winrate.textContent = 100 * 0.725
  });
  audjpy.addEventListener("click", () => {
    winrate.textContent = 100 * 0.74
  });
  nzdjpy.addEventListener("click", () => {
    winrate.textContent = 100 * 0.747
  });
  usdjpy.addEventListener("click", () => {
    winrate.textContent = 100 * 0.76
  });
  cadjpy.addEventListener("click", () => {
    winrate.textContent = 100 * 0.78
  });
  audusd.addEventListener("click", () => {
    winrate.textContent = 100 * 0.716
  });
  usdchf.addEventListener("click", () => {
    winrate.textContent = 100 * 0.76
  });

  // Direction:
  var buy = document.getElementById("buy")
  var short = document.getElementById("short")
  buy.addEventListener("click", () => {
    winrate.textContent = 100 * 0.8
  });
  short.addEventListener("click", () => {
    winrate.textContent = 100 * 0.789
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
    winrate.textContent = 100 * 0.75
  });
  zone.addEventListener("click", () => {
    winrate.textContent = 100 * 0.745
  });
  doubleBottom.addEventListener("click", () => {
    winrate.textContent = 100 * 0.71
  });
  doubleTop.addEventListener("click", () => {
    winrate.textContent = 100 * 0.78
  });
  triangle.addEventListener("click", () => {
    winrate.textContent = 100 * 0.733
  });
  hNs.addEventListener("click", () => {
    winrate.textContent = 100 * 0.754
  });
  fibonacci.addEventListener("click", () => {
    winrate.textContent = 100 * 0.77
  });
  butterfly.addEventListener("click", () => {
    winrate.textContent = 100 * 0.768
  });
}
