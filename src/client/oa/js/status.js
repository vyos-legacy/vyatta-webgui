/*
	JQuery plugin to display a status indicator
*/

$(function() {
	$(".status-indicator").status();
});

(function($) {
  // plugin definition

  $.fn.status = function(options) {

	return this.each(function() {

		var status = $(".status", $(this)).text();
		var statusMsg = $(".status-message", $(this)).html();
		var imgDesc = '';

		if(statusMsg != null)
			imgDesc = 'alt="'+statusMsg+'" title="'+statusMsg+'"';

		var imgStatus = ["status_up.png","status_unknown.png","status_down.png", "status_inactive.png"];

		$("#status-indicator", $(this)).remove();
		$(this).append('<img id="status-indicator" src="../oa/images/'+imgStatus[status]+'" '+imgDesc+' />');
		$(".status", $(this)).addClass('status-value');
		$(".status-message", $(this)).addClass('status-description');


    });

  };


// end of closure
//

})(jQuery);