/* Open the help Window and display the page with helpUrl URL */
function loadHelp(helpUrl) {

	var left=window.screen.width/2;
	var top=window.screen.height/2-250;
	var configuration="'toolbar=no, menubar=no, location=no, scrollbars=yes, directories=no, status=no, resizeable=no, width=580, height=550, left=" + left + ", top=" + top;
	newWin = window.open(helpUrl, 'newWin', configuration);
	newWin.focus();

	return false;
}

/*
 * This function resize the center iframe height to a desirable height in pixel.
 */
function resizeFrameHeight(pixel) {    
    if ((window.parent != undefined) && (window.parent != null)) {
        if (window.parent.f_resizeChildIframe != undefined) {
            window.parent.f_resizeChildIframe(pixel);
        }
    }
}

function stopAutoResize(state) {
    if ((window.parent != undefined) && (window.parent != null)) {
        if (window.parent.f_stopAutoResize != undefined) {
            window.parent.f_stopAutoResize(state);
        }
    }	
}
