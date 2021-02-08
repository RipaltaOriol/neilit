// dropdown to select a time period for statistics
$('.dropdown-menu li').on('click', function() {
  var allDD = $('.dropdown-menu');
  var current = allDD.index($(this).parent())
  var getValue = $(this).text();
  $('.dropdown-select')[current].innerHTML = getValue;
});

// change the direction data in statistics table
function changeStats(direction) {
  $.get('/' + username + '/statistics/direction/load-stats/' + direction)
  .done((data) => {
    $('#revenue').text(data.directionStats.revenue.toFixed(2) + ' ' + userCurrency)
    $('#fees').text(data.directionStats.fees.toFixed(2) + ' ' + userCurrency)
    $('#profit').text(data.directionStats.profit.toFixed(2) + ' ' + userCurrency)
    $('#return').text(data.directionStats.str_return.toFixed(2) + ' %')
    $('#max-win').text(data.directionStats.max.toFixed(2) + ' ' + userCurrency)
    $('#max-loss').text(data.directionStats.min.toFixed(2) + ' ' + userCurrency)
    $('#avg-win').text(data.directionStats.avg_win.toFixed(2) + ' ' + userCurrency)
    $('#avg-loss').text(data.directionStats.avg_loss.toFixed(2) + ' ' + userCurrency)
    $('#avg').text(data.directionStats.avg.toFixed(2) + ' ' + userCurrency)
    $('#avg-hold').text(data.directionStats.avg_holding.toFixed(2) + ' days')
    $('#gross-loss').text(data.directionStats.gross_loss.toFixed(2) + ' ' + userCurrency)
    $('#profit-factor').text(data.directionStats.profit_factor.toFixed(2))
    $('#playoff-ratio').text(data.directionStats.playoff.toFixed(2))
    $('#max-drawdown').text(data.directionDrawdown.max_drawdown.toFixed(2) + ' ' + userCurrency)
    if (data.directionCountWin != undefined) {
      $('#consec-win').text(data.directionCountWin.numcount.toFixed(2))
    } else {
      $('#consec-win').text('N/A')
    }
    if (data.directionCountLoss != undefined) {
      $('#consec-loss').text(data.directionCountLoss.numcount.toFixed(2))
    } else {
      $('#consec-loss').text('N/A')
    }
  })
  .fail(() => {
    // fail
  })
}

function changeAvgs(direction) {
  $.get('/' + username + '/statistics/direction/load-avgs/' + direction)
  .done((data) => {
    $('#avg-day').text(data.directionAvgs.avg_daily.toFixed(2))
    $('#avg-week').text(data.directionAvgs.avg_week.toFixed(2))
    $('#avg-month').text(data.directionAvgs.avg_month.toFixed(2))
    $('#avg-win-day').text(data.directionAvgs.avg_win_daily.toFixed(2))
    $('#avg-win-week').text(data.directionAvgs.avg_win_week.toFixed(2))
    $('#avg-win-month').text(data.directionAvgs.avg_win_month.toFixed(2))
    $('#avg-loss-day').text(data.directionAvgs.avg_loss_daily.toFixed(2))
    $('#avg-loss-week').text(data.directionAvgs.avg_win_week.toFixed(2))
    $('#avg-loss-month').text(data.directionAvgs.avg_win_month.toFixed(2))
  })
  .fail(() => {
    // fail
  })
}
