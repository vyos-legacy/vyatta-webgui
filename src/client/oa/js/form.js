/*	Form Labels Alignement */
$(function() {
	var max = 0;
	$("label:not(.choices label)").each(function(){
		if ($(this).width() > max)
			max = $(this).width();   
	});
	$("label:not(.choices label)").width(max);
	$("input:first").select();
});
