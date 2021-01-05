$(document).ready(function() {
  // redirects to notification page
  if (screen.width < 768) {
    window.location.replace("/mobile")
  }
  if (document.referrer != window.location.href)
  window.localStorage.setItem('prev', document.referrer);
})

// back button
function goBack() {
  var prev = window.localStorage.getItem('prev')
  window.localStorage.removeItem('prev');
  window.location.href = prev
}
