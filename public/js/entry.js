var filterQuery;
var timeoutId;

$(document).ready(function() {
  // redirects to notification page
  if (screen.width < 768) {
    window.location.replace("/mobile")
  }
  // sets datepicker
  $(function() {
    $.datepicker.setDefaults(
      $.extend(
        $.datepicker.regional[language]
      )
    )
    $('.datepicker').each(function(){
      $(this).datepicker({
        altField: "#" + $(this).data('target'),
        altFormat: "yy-mm-dd" // format for database processing
      });
    });
  });
  // prevents the classic datepicker from loading
  $("input[type=date]").on('click', function() {
    return false;
  })
})

// sets placeholder for comment input
jQuery(function($){
  $("#client-comment").focusout(function(){
    var element = $(this);
    if (!element.text().replace(" ", "").length) {
      element.empty();
    }
  });
});

// loading animation
function isSaving(bool) {
  if (bool) {
    $('.save').removeClass('save').addClass('saving')
    .html(`
      ` + savingTxt + `
      <div class="spinner-border spinner-border-sm ml-1" role="status">
        <span class="visually-hidden"></span>
      </div>
      `)
  } else {
    $('.saving').removeClass('saving').addClass('save')
    .html(`
      ` + savedTxt + `
      <img class="ml-1" src="/imgs/icons/check-circle.svg">
      `)
  }
}

// allows flagging entries
$('#flag-entry').on('click', function() {
  saveToDB({
    component: 'flag',
    value: this.className ^ 1
  })
  if (this.className == 0) {
    this.className = 1
    $(this).attr('src', '/imgs/icons/flag.svg')
  } else {
    this.className = 0
    $(this).attr('src', '/imgs/icons/flag-outline.svg')
  }
})

// enables inserting an element after another
function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

// adds custom timeframe
$('#btn-add-timeframe').click(() => {
  if ($('#add-timeframe').val())
  var data = {
    timeframe: $('#add-timeframe').val()
  }
  $.post('/' + username + '/settings/addTimeframe', data)
    .done((data) => {
      if (data.response == 'success') {
        // deletes the timeframe from the client
        $('#add-timeframe').val('')
        $('#val-timeframe').val(data.timeframeID)
        document.getElementsByClassName('dd-timeframe')[0].innerHTML = data.timeframe
        var prevLi = document.getElementById('add-timeframe').parentElement
        var liTimeframe = document.createElement('li')
        liTimeframe.innerHTML = data.timeframe
        liTimeframe.className = data.timeframeID
        insertAfter(prevLi, liTimeframe)
        saveToDB({
          component: 'timeframe',
          value: data.timeframeID
        })
      }
  })
    .fail(() => {
    // error
  })

})

// dropdown to selection
$('.dropdown-menu li').on('click', function() {
  var data = { }
  var allDD = $('.dropdown-menu');
  var current = allDD.index($(this).parent())
  var getValue = $(this).text();
  if ($('.dropdown-server')[current]) {
    $('.dropdown-server')[current].value = this.className;
  }
  if ($('.dropdown-select')[current]) {
    $('.dropdown-select')[current].innerHTML = getValue;
  }
  if ($('.dropdown-menu')[current].classList.contains('dropdown-asset')) {
    $('#category').val(currencies[getValue].category)
    data.category = currencies[getValue].category
  }
  data.component = $('.dropdown-server')[current].name
  data.value = $('.dropdown-server')[current].value
  saveToDB(data)
});

// dropdown for filter feature
$('.dropdown-menu.filter ol').on('click', function(e) {
  e.stopPropagation();
  if (e.target.tagName.toUpperCase() === "LABEL"
    || e.target.tagName.toUpperCase() === "SPAN"
    || e.target.tagName.toUpperCase() === "OL") {
    return;
  }
  var allDD = $('.dropdown-menu');
  var current = allDD.index($(this).parent())
  var getValue = $(this).text();
  var dropdownLabel = $('.dropdown-select')[current]
  if ($(this).children().children().is(':checked')) {
    dropdownLabel.innerHTML += getValue;
  } else {
    dropdownLabel.innerHTML = dropdownLabel.textContent.replace(getValue.trim(), '');
    if (dropdownLabel.innerHTML.trim() == '') {
      dropdownLabel.innerHTML += getValue;
      $(this).children().children().prop('checked', true)
    }
  }
})

// search bar for the dropdown
function searchDropdown(id) {
  var input, search, dropdownItems, val;
  var allDD = $('.dropdown-menu');
  var current = allDD.index(id.parentElement)
  input = document.getElementsByClassName('dropdown-search')[current];
  search = input.value.toUpperCase();
  dropdownItems = document.getElementsByClassName('dropdown-menu')[current].querySelectorAll('li, ol');
  for (var i = 0; i < dropdownItems.length; i++) {
    val = dropdownItems[i].textContent || dropdownItems[i].innerText;
    if (val.toUpperCase().indexOf(search) > -1) {
      dropdownItems[i].style.display = "";
    } else {
      dropdownItems[i].style.display = "none";
    }
  }
  // prevents form from submitting when pressing enter key
  $(window).keydown(function(event){
   if(event.keyCode == 13) {
     event.preventDefault();
     return false;
   }
 })
}

// manages filter functions
$('#display-create').click(() => {
  $('#filter-create').toggleClass('d-none')
})

$('#display-exit').click(() => {
  $('#filter-exit').toggleClass('d-none')
})

$('#display-advance').click(() => {
  $('#filter-advance').toggleClass('d-none')
})

// manages the spinner on loading processes
function loadingState(bool) {
  if (bool) {
    $('#spinner').removeClass('d-none')
  } else {
    $('#spinner').addClass('d-none')
  }
}

// Infinite scroll
let loadedCount = 25;
$('.table-scroll').scroll(() => {
  var $el = $('.table-scroll');
  var $eh = $('.table-scroll')[0];
  if ($el.innerHeight() + $el.scrollTop() >= $eh.scrollHeight - 5 && loadedCount) {
    var data = {
      offset: loadedCount
    }
    if (filterQuery) { data.query = filterQuery }
    loadingState(true);
    $.post('entry/load-index', data)
      .done((data) => {
        loadedCount+= 25;
        loadingState(false);
        // add new data to index table
        var table = $('tbody')[0];
        data.dataList.forEach((entry) => {
          var newRow = table.insertRow();
          var createHandler = function() { return function() { window.location.href = 'entry/' + entry.id; } }
          var pair      = newRow.insertCell(0);
          var date      = newRow.insertCell(1);
          var status    = newRow.insertCell(2);
          var strategy  = newRow.insertCell(3);
          var timeframe = newRow.insertCell(4);
          newRow.onclick = createHandler();
          // adds acutal data
          pair.innerHTML = entry.pair;
          pair.className = 'orange';
          date.innerHTML = new Date(entry.entry_dt).toLocaleDateString(language, data.options);
          date.className = 'orange text-center';
          if (entry.status) {
            if (entry.result === 'win') {
              status.innerHTML = '<span class="pill pill-green d-block">' + entry.result.toUpperCase() + '</span>'
            } else if (entry.result === 'loss') {
              status.innerHTML = '<span class="pill pill-red d-block">' + entry.result.toUpperCase() + '</span>'
            } else {
              status.innerHTML = '<span class="pill pill-yellow d-block">' + entry.result.toUpperCase() + '</span>'
            }
          } else {
            var icon = document.createElement('img');
            icon.src = '/imgs/icons/open-ops.svg';
            icon.classList = 'simple-img'
            status.appendChild(icon);
          }
          status.className = 'text-center';
          strategy.innerHTML = entry.strategy;
          timeframe.innerHTML = entry.timeframe;
        });

        if (data.dataList.length < 25) {
          loadedCount = 0;
        }
    })
      .fail(() => {
        // error
    })
  }
})

// Filter results
$('#apply-filter').click(() => {
  $("#modal-loading").modal();
  var filterPairs = $('input[name=pair]:checked').map(function(){
    return "pair LIKE '" + this.value + "'";
  }).get().join(' || ');
  var filterCategories = $('input[name=category]:checked').map(function(){
    return "entries.category LIKE '" + this.value + "'";
  }).get().join(' || ');
  var filterCreate, filterExit, filterSort, filterOrder;
  if ($('#display-create').is(":checked")) {
    filterCreate = $('input[name=create]').map(function(){
      return "'" + this.value + "'";
    }).get().join(' && ');
  }
  if ($('#display-exit').is(":checked")) {
    filterExit = $('input[name=exit]').map(function(){
      return "'" + this.value + "'";
    }).get().join(' && ');
  }
  var filterStrategies = $('input[name=strategy]:checked').map(function(){
    return "strategy_id LIKE '" + this.value + "'";
  }).get().join(' OR ');
  var filterTimeframes = $('input[name=timeframe]:checked').map(function(){
    return "timeframe_id LIKE '" + this.value + "'";
  }).get().join(' OR ');
  var filterResults = $('input[name=result]:checked').map(function(){
    return "IFNULL(result, 'open') LIKE '" + this.value + "'";
  }).get().join(' OR ');
  filterSort = $('input[name=sort]:checked').val()
  filterOrder = $('input[name=order]:checked').val()
  var data = {
    pairs: filterPairs,
    categories: filterCategories,
    create: filterCreate,
    exit: filterExit,
    strategy: filterStrategies,
    timeframe: filterTimeframes,
    result: filterResults,
    sort: filterSort,
    order: filterOrder
  }
  $.post('entry/filter', data)
    .done((data) => {
      $('#index-table tbody').html('')
      // add new entries to the index list
      data.dataList.forEach((entry, i) => {
        var newRow = $('tbody')[0].insertRow();
        var createHandler = function() { return function() { window.location.href = 'entry/' + entry.id; } }
        var pair      = newRow.insertCell(0);
        var date      = newRow.insertCell(1);
        var status    = newRow.insertCell(2);
        var strategy  = newRow.insertCell(3);
        var timeframe = newRow.insertCell(4);
        newRow.onclick = createHandler();
        // adds acutal data
        pair.innerHTML = entry.pair;
        pair.className = 'orange';
        date.innerHTML = new Date(entry.entry_dt).toLocaleDateString(language, data.options);
        date.className = 'orange text-center';
        if (entry.status) {
          if (entry.result === 'win') {
            status.innerHTML = '<span class="pill pill-green d-block">' + entry.result.toUpperCase() + '</span>'
          } else if (entry.result === 'loss') {
            status.innerHTML = '<span class="pill pill-red d-block">' + entry.result.toUpperCase() + '</span>'
          } else {
            status.innerHTML = '<span class="pill pill-yellow d-block">' + entry.result.toUpperCase() + '</span>'
          }
        } else {
          var icon = document.createElement('img');
          icon.src = '/imgs/icons/open-ops.svg';
          icon.classList = 'simple-img'
          status.appendChild(icon);
        }
        status.className = 'text-center';
        strategy.innerHTML = entry.strategy;
        timeframe.innerHTML = entry.timeframe;
      });
      filterQuery = data.query;
      loadedCount = 25;
      $("#modal-loading").modal('hide');
  })
    .fail(() => {

  })
})

// display fields for entry close
function displayClose(close) {
  saveToDB({
    component: 'status',
    value: close
  })
  if (close == 0) {
    document.getElementById('entry-closure').classList.add("d-none");
    document.getElementById('entry-closure').classList.remove("d-flex");
  } else {
    document.getElementById('entry-closure').classList.remove("d-none");
    document.getElementById('entry-closure').classList.add("d-flex");
  }
}

// connects a technical analysis to the entry
function connectTa(index) {
  var connectedId = technicalAnalysis[index].id
  saveToDB({
    component: 'ta',
    value: connectedId
  })
  $('#entry-ta').removeClass('d-none')
  var connectedTa = technicalAnalysis[index].pair + ' - '
    + new Date(technicalAnalysis[index].created_at).toLocaleDateString(language, options)
  $('#connect-ta').text(connectedTa);
}

// hides the technical analysis associated to the entry
$('#noneTa').click(() => {
  isSaving(true)
  saveToDB({
    component: 'ta',
    value: null
  })
  $('#entry-ta').addClass('d-none')
})

// saves size while typing
$('#size').on('input propertychange change', () => {
  // runs the saving animation
  isSaving(true)
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    // Runs 1 second (1000 ms) after the last change
    saveToDB({
      component: 'size',
      value: $('#size').val()
    })
  }, 1000);
})

// saves entry-price while typing
$('#entry-price').on('input propertychange change', () => {
  // runs the saving animation
  isSaving(true)
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    // Runs 1 second (1000 ms) after the last change
    saveToDB({
      component: 'entry-price',
      value: $('#entry-price').val()
    })
  }, 1000);
})

// saves stop-loss while typing
$('#stop-loss').on('input propertychange change', () => {
  // runs the saving animation
  isSaving(true)
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    // Runs 1 second (1000 ms) after the last change
    saveToDB({
      component: 'stop-loss',
      value: $('#stop-loss').val()
    })
  }, 1000);
})

// saves take-profit while typing
$('#take-profit').on('input propertychange change', () => {
  // runs the saving animation
  isSaving(true)
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    // Runs 1 second (1000 ms) after the last change
    saveToDB({
      component: 'take-profit',
      value: $('#take-profit').val()
    })
  }, 1000);
})

// saves entry-date
$('#entry-date-pretty').change(() => {
  isSaving(true)
  saveToDB({
    component: 'entry-date',
    value: $('#entry-date').val()
  })
})

// saves direction
$('input[name="direction"]').change((e) => {
  isSaving(true)
  saveToDB({
    component: 'direction',
    value: $(e.target).val()
  })
})

// saves commen while typing
$('#comment').on('input propertychange change', () => {
  // runs the saving animation
  isSaving(true)
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    // Runs 1 second (1000 ms) after the last change
    saveToDB({
      component: 'comment',
      value: document.getElementById('comment').innerText.replace(/\n/g, '<br>')
    })
  }, 1000);
})

// saves entry-date
$('#exit-date-pretty').change(() => {
  isSaving(true)
  saveToDB({
    component: 'exit-date',
    value: $('#exit-date').val()
  })
})

// saves exit-price while typing
$('#exit-price').on('input propertychange change', () => {
  // runs the saving animation
  isSaving(true)
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    // Runs 1 second (1000 ms) after the last change
    saveToDB({
      component: 'exit-price',
      value: $('#exit-price').val()
    })
  }, 1000);
})

// saves profits while typing
$('#profits').on('input propertychange change', () => {
  // runs the saving animation
  isSaving(true)
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    // Runs 1 second (1000 ms) after the last change
    saveToDB({
      component: 'profits',
      value: $('#profits').val()
    })
  }, 1000);
})

// saves fees while typing
$('#fees').on('input propertychange change', () => {
  // runs the saving animation
  isSaving(true)
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    // Runs 1 second (1000 ms) after the last change
    saveToDB({
      component: 'fees',
      value: $('#fees').val()
    })
  }, 1000);
})

// controls what image gets uploaded: 1, 2, 3 or 4
function uploadTo(number) {
  $('#url-1').addClass('d-none')
  $('#url-2').addClass('d-none')
  $('#url-3').addClass('d-none')
  $('#url-4').addClass('d-none')
  $('#file-1').addClass('d-none')
  $('#file-2').addClass('d-none')
  $('#file-3').addClass('d-none')
  $('#file-4').addClass('d-none')
  switch (number) {
    case 1:
      $('#url-1').removeClass('d-none')
      $('#file-1').removeClass('d-none')
      break;
    case 2:
      $('#url-2').removeClass('d-none')
      $('#file-2').removeClass('d-none')
      break;
    case 3:
      $('#url-3').removeClass('d-none')
      $('#file-3').removeClass('d-none')
      break;
    case 4:
      $('#url-4').removeClass('d-none')
      $('#file-4').removeClass('d-none')
      break;
  }
}

// renders images from URL
function renderURL(number) {
  var src = $(`#url-src-${number}`).val()
  if (src != '') {
    var data = {
      component: 'imageURL',
      src: src,
      number: number
    }
    saveToDB(data)
    $(`#entry-image-${number}`).attr('src', src)
    $(`#entry-image-${number}`).removeClass('d-none')
  }
}

// renders images from fil
function renderFile(number) {
  isSaving(true)
  var fileBtn = `#file-src-${number}`
  $(fileBtn).click()
  $(`#file-src-${number}`).change(function() {
    var formData = new FormData()
    formData.append('number', number)
    formData.append('file', this.files[0])
    $.ajax({
      url: '/' + username + '/journal/entry/' + id + '/edit/imageFile',
      method: 'POST',
      type: 'POST',
      data: formData,
      cache: false,
      contentType: false,
      processData: false
    })
    .done((result) => {
      if (result.status) {
        $(`#entry-image-${number}`).attr('src', result.urlPoint)
        $(`#entry-image-${number}`).removeClass('d-none')
        isSaving(false)
      }
    })
  })
}

function saveToDB(data) {
  isSaving(true)
  $.post('/' + username + '/journal/entry/' + id + '/edit/' + data.component, data)
    .done((result) => {
      if (result.status) {
        isSaving(false)
      }
    })
}
