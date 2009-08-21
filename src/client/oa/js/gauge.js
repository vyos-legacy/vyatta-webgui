/*
	JQuery plugin to display a gauge
*/

// All components with 'gauge' class are gauge components
$(function() {
	$(".gauge").gauge();
});

// Plugin
(function($) {
  // plugin definition

  $.fn.gauge = function(options) {

	var defaults = {
				greenlimit: 80
					};

	var opts = $.extend(defaults, options);

	var gauge;

	return this.each(function() {

		// Geting value and description
		var value = $(".gauge-value", $(this)).text().replace("%","");
		var message = $(".gauge-description", $(this)).html();

		// Defining the bar color with the value and the limit
		var classColor = 'gauge-bar-green';
		if(value> opts.greenlimit)
			classColor = 'gauge-bar-red';

		gauge = $(this).addClass("gauge-border").attr("title",message);

		// Adding the bar
		$("#gauge-bar", $(this)).remove();
		
		$('<div id="gauge-bar" class="gauge-bar, '+classColor+'">&nbsp;</div>')
			.css("width", value+"px")
			.attr("title",message)
			.prependTo(gauge);

		// Setting class on value and description
		$(".gauge-value", $(this)).addClass('gauge-value');
		$(".gauge-description", $(this)).addClass('gauge-description');



    });

  };


// end of closure
//

})(jQuery);