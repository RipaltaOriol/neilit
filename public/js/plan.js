// Sets placeholder for business routine input
jQuery(function($){
  $(".diveditable").focusout(function(){
    var element = $(this);
    if (!element.text().replace(" ", "").length) {
      element.empty();
    }
  });
});

// Add items to include in the plan's journal section
$('#addTrack').keypress(function(event) {
  if(event.which == 13) {
    // gets the user's input
    var newItem = $(this).val();
    $(this).val("");
    $("#listJournalItems").append('<li class="bg-hover mt-1 px-2">' + newItem + '</li>')
    // prevents the form from submitting
    event.preventDefault();
    return false;
  }
})

// Adds scrollspy feature
$('#document').scrollspy({ target: '#scheme' })
