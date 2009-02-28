/**
 * @author loi
 */
/*  dw_loader.js      version date: July 2008
    loads url in iframe, transfers body content into div
    provides defaults for iframe and display div ID's 
    also supports use with multiple iframes and divs
    optional message for loading in display div 
    supports functions to be called once the div has been populated with new content 
    function in iframed document can be invoked should some operations need to be performed from there 
*/

function f_dw_loadExternal(url, ifrmId, divId, bLoadMsg) {
    // defaults for iframe, display div
    ifrmId = ifrmId || 'buffer'; divId = divId || 'display'; 
    if ( window.frames[ifrmId] ) {
        // Could use location.replace method if you do not want back button to load previous iframe url 
        //window.frames[ifrmId].location.replace(url);
        window.frames[ifrmId].location = url;
        var lyr = document.getElementById? document.getElementById(divId): null;
        if ( lyr && bLoadMsg ) { // Option to display message while retrieving data 
            lyr.innerHTML = '<p>Retrieving data. Please wait ...</p>';
            lyr.style.display = 'block'; 
        }
        return false;
    } 
    return true; // other browsers follow link
}


// called onload of iframe 
// displays body content of iframed doc in div
// checks for and invokes optional functions in both current document and iframed document 
function f_dw_displayExternal(ifrmId, divId, fp) {
    // defaults for iframe, display div
    ifrmId = ifrmId || 'buffer'; divId = divId || 'display'; 
    
    var lyr = document.getElementById? document.getElementById(divId): null;
    if ( window.frames[ifrmId] && lyr ) {
        lyr.innerHTML = window.frames[ifrmId].document.body.innerHTML;
        lyr.style.display = 'block'; 

        // when using with script, may have some operations to coordinate
        // function in current doc or iframed doc (doOnIframedLoad)
        if ( typeof fp == 'function' ) {
            fp();
        }
        
        // Demonstrated in tooltip demo
        if ( typeof window.frames[ifrmId].doOnIframedLoad == 'function' ) {
            window.frames[ifrmId].doOnIframedLoad();
        }
    }
}

/**
 * Example:
 * 
 * <div id="display"></div>
    <iframe id="buffer" name="buffer" src="hidden1.html"
    onload="dw_displayExternal()"></iframe>
    <a href="hidden1.html" onclick="return dw_loadExternal(this.href)">Load me</a>
 */
