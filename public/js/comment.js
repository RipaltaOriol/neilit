// Button New Comment
var storeComment = document.getElementById("store-comment")
var clientComment = document.getElementById("client-comment");
var serverComment = document.getElementById("server-comment");

// Send the comment from Client -> Server
if (storeComment != null) {
  storeComment.addEventListener("click", () => {
    serverComment.value = clientComment.textContent || clientComment.innerText;
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

// Removes all entries on INDEX comment route
function noneEntries() {
  document.getElementById('remove-entries').classList.add('d-none')
  document.getElementById('show-entries').classList.remove('d-none')
  var allEntries = document.getElementsByClassName('comment-entry');
  for (var i = 0; i < allEntries.length; i++) {
    allEntries[i].classList.add('d-none')
  }
}

// Shows all entries on INDEX comment route
function showEntries() {
  document.getElementById('remove-entries').classList.remove('d-none')
  document.getElementById('show-entries').classList.add('d-none')
  var allEntries = document.getElementsByClassName('comment-entry');
  for (var i = 0; i < allEntries.length; i++) {
    allEntries[i].classList.remove('d-none')
  }
}
