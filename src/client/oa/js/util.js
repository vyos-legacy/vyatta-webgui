/* Open the help Window and display the page with helpUrl URL */
function loadHelp(helpUrl) {

	var left=window.screen.width/2;
	var top=window.screen.height/2-250;
	var configuration="'toolbar=no, menubar=no, location=no, scrollbars=yes, directories=no, status=no, resizeable=no, width=580, height=550, left=" + left + ", top=" + top;
	newWin = window.open(helpUrl, 'newWin', configuration);
	newWin.focus();

	return false;
}
