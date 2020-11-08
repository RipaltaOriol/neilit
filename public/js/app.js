// tooltips code
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

// close menu
$('#close-menu').click(() => {
  if (screen.width <= 992) {
    $('#menu-neilit').css('left', '-200px');
  } else {
    $('#menu-neilit').css('left', '-250px');
  }
  $('#content').css('margin-left', '0px');
})

// open menu
$('#open-menu').click(() => {
  $('#menu-neilit').css('left', '0');
  if (screen.width <= 992) {
    $('#content').css('margin-left', '200px');
  } else {
    $('#content').css('margin-left', '250px');
  }
})
