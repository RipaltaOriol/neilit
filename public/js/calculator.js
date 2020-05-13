// Risk Calculator function
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
