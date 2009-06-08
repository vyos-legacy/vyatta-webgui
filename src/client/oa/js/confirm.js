/*
	JQuery plugin to display a confirmation dialog
*/

(function($) {
  // plugin definition

  $.fn.confirm = function(options, source) {

	// Open the dialog and keep the source
	if(options == 'open') {
		$.fn.confirm.source = source;
		$.fn.confirm.dialog = $(this);
		return $(this).dialog('open');
	}

	// Defaults options for modal confirmation dialog
	var defaults = {
				autoOpen: false,
				bgiframe: true,
				resizable: false,
//				height:20,
				modal: true,
				overlay: {
					backgroundColor: '#000',
					opacity: 0.5
				},
				apply: function(source) {
					oApply(source);
				},
				cancel: function(source) {
					oCancel(source);
				}
					};

	var opts = $.extend(defaults, options);

	return this.each(function() {

		// Add the icon on the left
		$(this).prepend("<span class=\"confirm-icon\"></span>");
		buttonsPane = $('<span class="confirm-buttons"></span>');

		// Add the Apply button
		$('<a href="#"><img src="../oa/images/en/bt_apply.png" /></a>')
			.click(function() { opts.apply($.fn.confirm.source); $.fn.confirm.dialog.dialog('close'); })
			.appendTo(buttonsPane);

		// Add the Cancel button
		$('<a href="#"><img src="../oa/images/en/bt_cancel.png" /></a>')
			.click(function() { opts.cancel($.fn.confirm.source); $.fn.confirm.dialog.dialog('close');})
			.appendTo(buttonsPane);
		$(this).append(buttonsPane);

		// Build the popup using JQuery UI Dialog
		$(this).dialog(opts);

    });

  };

  // Could be used to keep the source of the event
  $.fn.confirm.source = '';
  $.fn.confirm.dialog = '';

// end of closure
//

})(jQuery);