var storeComment = document.getElementById("store-comment")
var clientComment = document.getElementById("client-comment");
var serverComment = document.getElementById("server-comment");
var commentIndex1 = '<a href="'
var commentIndex2 = '"><div class="bg-grey mx-3 p-2 mb-3 rounded"><div>'
var commentIndex3 = '</div><div class="orange">'
var commentIndex4 = '</div><p class="mb-0">'
var commentIndex5 = '</p></div></a>'
var entryIndex1 = '<div class="comment-entry journal-box mx-3 mb-3"><span class="orange float-right">'
var entryIndex2 = '</span><h5>'
var entryIndex3 = '</h5><p class="card-text">'
var entryIndex4 = '</p><a href="'
var entryIndex5 = '" class="btn-neilit">'
var entryIndex6 = '</a></div>'
var taIndex1 = '<div class="comment-tas mx-3 mb-3 p-2 pb-3"><div class="mb-3"><span><strong>'
var taIndex2 = '</strong></span><span class="float-right">'
var taIndex3 = '</span></div><a href="'
var taIndex4 = '" class="btn-neilit">'
var taIndex5 = '</a></div>'
var filterQuery;


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
  });
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
$('.journal-scroll').scroll(() => {
  var $el = $('.journal-scroll');
  var $eh = $('.journal-scroll')[0];
  if ($el.innerHeight() + $el.scrollTop() >= $eh.scrollHeight - 5 && loadedCount) {
    var data = {
      offset: loadedCount
    }
    if (filterQuery) { data.query = filterQuery }
    loadingState(true);
    $.post('comment/load-index', data)
      .done((data) => {
        loadedCount+= 25;
        // add new comments to the index list
        console.log(data.dataList);
        data.dataList.forEach((element) => {
          var newContent = ''
          switch (element.type) {
            case 1:
              newContent = commentIndex1 + '/' + username + '/journal/comment/'
                + element.id + commentIndex2 + data.lastUpdate + ': '
                + new Date(element.last_update).toLocaleDateString(language, data.options)
                + commentIndex3 +  new Date(element.created_at).toLocaleDateString(language, data.options)
                + commentIndex4 + element.comment.substring(0,100).split("<br>")[0] + commentIndex5;
              break;
            case 2:
              var comment = ''
              if (element.comment !== null) { element.comment.substring(0,100).split("<br>")[0] }
              newContent = entryIndex1 + new Date(element.created_at).toLocaleDateString(language, data.options)
                + entryIndex2 + element.pair + entryIndex3
                + comment
                + entryIndex4 + '/' + username + '/journal/entry/' + element.id
                + entryIndex5 + data.btnEntry + entryIndex6
              break;
            case 3:
              newContent = taIndex1 + element.pair
                + taIndex2 + new Date(element.created_at).toLocaleDateString(language, data.options)
                + taIndex3 + '/' + username + '/journal/ta/' + element.id
                + taIndex4 + data.btnTa + taIndex5
              break;
          }
          $('.journal-scroll')[0].innerHTML += newContent
        });
        loadingState(false);

        if (data.dataList.length < 25) {
          loadedCount = 0;
        }
    })
      .fail(() => {
        // error
    })
  }
})

// filter results
$('#apply-filter').click(() => {
  $("#modal-loading").modal();
  var filterCreate, filterEdit, filterEntries, filterTA, filterOrder;
  if ($('#display-create').is(":checked")) {
    filterCreate = $('input[name=create]').map(function(){
      return '"' + this.value + '"';
    }).get().join(' && ');
  }
  if ($('#display-edit').is(":checked")) {
    filterEdit = $('input[name=edit]').map(function(){
      return '"' + this.value + '"';
    }).get().join(' && ');
  }
  filterEntries = $('input[name=add-entries]:checked').val()
  filterTA = $('input[name=add-tas]:checked').val()
  filterOrder = $('input[name=order]:checked').val()
  var data = {
    create: filterCreate,
    edit: filterEdit,
    entries: filterEntries,
    ta: filterTA,
    order: filterOrder
  }
  $.post('comment/filter', data)
    .done((data) => {
      console.log(data);
      console.log(data.dataList.length);
      console.log(data.query);
      $('.journal-scroll')[0].innerHTML = ''
      // add new comments to the index list
      data.dataList.forEach((element) => {
        var newContent = ''
        switch (element.type) {
          case 1:
            newContent = commentIndex1 + '/' + username + '/journal/comment/'
              + element.id + commentIndex2 + data.lastUpdate + ': '
              + new Date(element.last_update).toLocaleDateString(language, data.options)
              + commentIndex3 +  new Date(element.created_at).toLocaleDateString(language, data.options)
              + commentIndex4 + element.comment.substring(0,100).split("<br>")[0] + commentIndex5;
            break;
          case 2:
            var comment = ''
            if (element.comment !== null) { element.comment.substring(0,100).split("<br>")[0] }
            newContent = entryIndex1 + new Date(element.created_at).toLocaleDateString(language, data.options)
              + entryIndex2 + element.pair + entryIndex3
              + comment
              + entryIndex4 + '/' + username + '/journal/entry/' + element.id
              + entryIndex5 + data.btnEntry + entryIndex6
            break;
          case 3:
          console.log('this is a ta');
            newContent = taIndex1 + element.pair
              + taIndex2 + new Date(element.created_at).toLocaleDateString(language, data.options)
              + taIndex3 + '/' + username + '/journal/ta/' + element.id
              + taIndex4 + data.btnTa + taIndex5
            break;
        }
        $('.journal-scroll')[0].innerHTML += newContent
      });
      filterQuery = data.query;
      loadedCount = 25;
      $("#modal-loading").modal('hide');
  })
    .fail(() => {

  })
})

// manages filter functions
$('#display-create').click(() => {
  $('#filter-create').toggleClass('d-none')
})

$('#display-edit').click(() => {
  $('#filter-edit').toggleClass('d-none')
})

$('#display-advance').click(() => {
  $('#filter-advance').toggleClass('d-none')
})

// Send the comment from Client -> Server
if (storeComment != null) {
  storeComment.addEventListener("click", () => {
    serverComment.value = clientComment.innerText.replace(/\n/g, '<br>');
  })
}

// Sets placeholder for comment input
jQuery(function($){
  $("#client-comment").focusout(function(){
    var element = $(this);
    if (!element.text().replace(" ", "").length) {
      element.empty();
    }
  });
});
