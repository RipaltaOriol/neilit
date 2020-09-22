// Risk Calculator function
async function calcRisk(base) {
  // API connection
  var base = document.getElementById('base').value;
  const exchangeRatesAPI = `https://api.exchangeratesapi.io/latest?base=${base}`;
  const responseAPI = await fetch(exchangeRatesAPI);
  const dataAPI = await responseAPI.json();
  // console.log(dataAPI);
  var aSize = document.getElementById('account-size').value;
  var oRisk = document.getElementById('ops-risk').value;
  var slPip = document.getElementById('sl-pip').value;
  var pair = document.getElementById('dropdown-label');
  // three options for calculating the value of a pip:
  var namePair = pair.textContent.trim() || pair.innerText.trim();
  // OPTIMIZE: refactor this code
  if (aSize == '' || oRisk == '') {
    var aRisk = document.getElementById("trade-size").value;
    if (aRisk != '') {
      if (slPip != '') {
        var pSize = (aRisk / slPip);
        // the base currency is the against currency pair
        if (base == namePair.substring(4, 7)) {
          // determines the value per pip
          var vPip = 0.1;
          // calculates the lot size
          var lSize = pSize * vPip
          document.getElementById('units-size').innerHTML = (lSize * 100000).toFixed(0);
          document.getElementById('lots-size').innerHTML = (lSize).toFixed(3);
        // the base currency doesn't appear in the pair or is the first currency
        } else {
          // determines the against currency
          var against = namePair.substring(4, 7)
          // determines the value per pip
          if (against == 'JPY') {
            var vPip = dataAPI.rates[against] / 1000;
          } else {
            var vPip = dataAPI.rates[against] / 10;
          }
          // calculates the lot size
          var lSize = pSize * vPip
          document.getElementById('units-size').innerHTML = (lSize * 100000).toFixed(0);
          document.getElementById('lots-size').innerHTML = (lSize).toFixed(3);
        }
      } else {
        return false;
      }
    } else {
      return false
    }
  } else {
    var aRisk = aSize * (oRisk / 100);
    if (slPip != '') {
      var pSize = (aRisk / slPip);
      // the base currency is the against currency pair
      if (base == namePair.substring(4, 7)) {
        // determines the value per pip
        var vPip = 0.1;
        // calculates the lot size
        var lSize = pSize * vPip
        document.getElementById('units-size').innerHTML = (lSize * 100000).toFixed(0);
        document.getElementById('lots-size').innerHTML = (lSize).toFixed(3);
      // the base currency doesn't appear in the pair or is the first currency
      } else {
        // determines the against currency
        var against = namePair.substring(4, 7)
        // determines the value per pip
        if (against == 'JPY') {
          var vPip = dataAPI.rates[against] / 1000;
        } else {
          var vPip = dataAPI.rates[against] / 10;
        }
        // calculates the lot size
        var lSize = pSize * vPip
        document.getElementById('units-size').innerHTML = (lSize * 100000).toFixed(0);
        document.getElementById('lots-size').innerHTML = (lSize).toFixed(3);
      }
    } else {
      return false;
    }
  }
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

// quick access to dropdown elements
function changePair(pair) {
  $('.dropdown-select')[0].innerHTML = pair;
}

// search bar for the dropdown
function searchDropdown() {
  var input, search, dropdownItems, val;
  input = document.querySelector('#dropdown-search');
  search = input.value.toUpperCase();
  dropdownItems = document.getElementById('dropdown-items').getElementsByTagName('li');
  for (var i = 0; i < dropdownItems.length; i++) {
    val = dropdownItems[i].textContent || dropdownItems[i].innerText;
    if (val.toUpperCase().indexOf(search) > -1) {
      dropdownItems[i].style.display = "";
    } else {
      dropdownItems[i].style.display = "none";
    }
  }
}
