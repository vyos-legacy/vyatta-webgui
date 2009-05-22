/*
    Document   : utm_utils.js
    Created on : Feb 25, 2009, 2:35:25 PM
    Author     : Kevin.Choi
    Description:
*/

UTM_extend = function(subClass, baseClass)
{
   function inheritance() {}
   inheritance.prototype = baseClass.prototype;

   subClass.prototype = new inheritance();
   subClass.prototype.constructor = subClass;
   subClass.baseConstructor = baseClass;
   subClass.superclass = baseClass.prototype;
}

/////////////////////////////////////////////////////////////////////////
function UTM_thread(interval)
{
    this.m_isRun = false;
    this.m_interval = interval == undefined ? 8000/* 8 sec default*/ : interval;

    ////////////////////////////////////////////////////
    this.f_start = function(runFunction)
    {
        if(this.m_timerId != null)
            this.f_stop();

        this.m_isRun = true;
        var timerId = window.setInterval(runFunction, this.m_interval);

        return timerId;
    }

    this.f_stop = function(threadId)
    {
        this.m_isRun = false;
        window.clearInterval(threadId);
    }
}

//////////////////////////////////////////////////////////////////////////////
// sorting table
function UTM_sortingTable()
{
    var thisObj = this;
    this.m_table = null;		// Table object
    this.m_rowArray = new Array();	// Data row array
    this.m_titleRowArray = new Array();	// Contains title texts
    this.m_titleRowCellArray = new Array();// Dynamically constructed title cells
    this.m_titleSpanCellArray = new Array();// Title elelments from row-spanned
    this.m_colSpanArray = new Array();	// Rows col-spanned
    this.m_colTitleFilled = new Array();// Indicates whether title is filled
    this.m_sortIndex = 0;		// Selected index for sort
    this.m_descending = false;		// Descending order
    this.m_nRow, this.m_actualNRow, this.m_maxNCol;	// Various table stats
    this.m_origColor;			// Holds original default color
    this.m_isIE = false;		// True if IE
    this.m_linkEventString =		// What's insider <a> tag
	'onMouseOver=\'setCursor(this);' +
	'setColor(this,"selected");\' ' +
	'onMouseOut=\'setColor(this,"default");\' ' +
	'onClick=\'sortTable(';

    // Configurable constants
    this.m_ascChr = "^";			// Symbol for ascending sort
    this.m_desChr = "v";			// Symbol for descending sort
    this.m_selectedColor = "blue";		// Color for sort focus
    this.m_defaultColor = "black";		// Default color for sort off-focus
    this.m_recDelimiter = '|';		// Char used as a record separator
    this.m_titleFace = 'b';		// Specifies the HTML tag for titles
    this.m_updownColor = 'gray';		// Specified the color for up/downs

    /**
     */
    this.f_initTable = function(obj)
    {
        // Check whether it's viewed by IE 5.0 or greater
	if(! thisObj.checkBrowser()) return;

	// Local variables
	var countCol;
	var nChildNodes;
	var innerMostNode;
	var nColSpan, nRowSpannedTitleCol, colPos;
	var cell, cellText;
	var titleFound = false;
	var rNRowSpan, rNColSpan;

	// Initializing global table object variable
	if(obj.tagName == "TABLE")
	{
            // Assumes that the obj is THE OBJECT
            thisObj.m_table = obj;
	}
	else
	{
            // Assumes that the obj is the id of the object
            thisObj.m_table = document.getElementById(obj);
	}
        var table = thisObj.m_table;

	// Check whether it's an object
	if(table == null) return;

	// Check whether it's a table
	if(table.tagName != "TABLE") return;

	// Initializing the max col number with the size of last data row
	thisObj.m_maxNCol = table.rows[table.rows.length-1].cells.length;

	// Initializing arrays
	thisObj.m_rowArray = new Array();
	thisObj.m_colSpanArray = new Array();
	thisObj.m_colTitleFilled = new Array();
	thisObj.m_titleRowArray = new Array();
	thisObj.m_titleRowCellArray = new Array();

	for(var i=0; i<thisObj.m_maxNCol; i++)
            thisObj.m_colTitleFilled[i] = false;

	// Setting the number of rows
	thisObj.m_nRow = table.rows.length;

	// Should have at least 1 row
	if(thisObj.m_nRow < 1) return;

	// Initialization of local variables
	thisObj.m_actualNRow = 0;       // Number of actual data rows
	rNRowSpan = 0;			// Remaining rows in the row span
	rNColSpan = 0;			// Remaining cols in the col span
	nRowSpannedTitleCol = 0;	// Number of title cols from row span

	// Loop through rows
	for(var i=0; i<thisObj.m_nRow; i++)
	{
            nColSpan = 1, colPos = 0;
            // Loop through columns
            // Initializing
            for(var j=0; j<table.rows[i].cells.length; j++)
            {
                // Do this iff title has not been found
                if(titleFound == false)
                {
                    if(table.rows[i].cells[j].rowSpan > 1)
                    {
                        if(table.rows[i].cells[j].colSpan < 2)
                        {
                            thisObj.m_titleSpanCellArray[colPos] = table.rows[i].cells[j];
                            thisObj.m_colTitleFilled[colPos] = true;
                            nRowSpannedTitleCol++;
                        }

                        if(table.rows[i].cells[j].rowSpan - 1 > rNRowSpan)
                        {
                            rNRowSpan = table.rows[i].cells[j].rowSpan - 1;

                            if(table.rows[i].cells[j].colSpan > 1)
                                rNColSpan = rNRowSpan + 1;
                        }
                    }
                }

                if(table.rows[i].cells[j].colSpan > 1 && rNColSpan == 0)
                {
                    nColSpan = table.rows[i].cells[j].colSpan;
                    colPos += nColSpan;
                }
                else
                    colPos++;
            }

            // Setting up the title cells
            if(titleFound == false && nColSpan == 1 &&
                    rNRowSpan == 0 && rNColSpan == 0 && titleFound == false)
            {
                thisObj.m_colSpanArray[i] = true;
                titleFound = true;

                // Using indivisual cell as an array element
                countCol = 0;
                for(var j=0; j<table.rows[i].cells.length + nRowSpannedTitleCol; j++)
                {
                    if(thisObj.m_colTitleFilled[j] != true)
                    {
                        thisObj.m_titleRowCellArray[j] = table.rows[i].cells[countCol];
                        countCol++;
                    }
                    else
                        thisObj.m_titleRowCellArray[j] = thisObj.m_titleSpanCellArray[j];
                }
            }
            // Setting up the data rows
            else if(titleFound == true && nColSpan == 1 && rNRowSpan == 0)
            {
                for(var j=0; j<table.rows[i].cells.length; j++)
                {
                    // Can't have row span in record rows ...
                    if(table.rows[i].cells[j].rowSpan > 1) return;

                    nChildNodes = table.rows[i].cells[j].firstChild.childNodes.length;
                    innerMostNode = table.rows[i].cells[j].firstChild;

                    while(nChildNodes != 0)
                    {
                        innerMostNode = innerMostNode.firstChild;
                        nChildNodes = innerMostNode.childNodes.length;
                    }

                    if(j == 0)
                        thisObj.m_rowArray[thisObj.m_actualNRow] = innerMostNode.data;
                    else
                        thisObj.m_rowArray[thisObj.m_actualNRow] += thisObj.m_recDelimiter +
                                                          innerMostNode.data;
                }

                // Inconsistent col lengh for data rows
                if(table.rows[i].cells.length > thisObj.m_maxNCol)
                    return;

                thisObj.m_actualNRow++;
                thisObj.m_colSpanArray[i] = false;
            }
            else if(nColSpan == 1 && rNRowSpan == 0 &&
                    rNColSpan == 0 && titleFound == false)
                thisObj.m_colSpanArray[i] = false;
            else
                thisObj.m_colSpanArray[i] = true;

            // Counters for row/column spans
            if(rNRowSpan > 0) rNRowSpan--;
            if(rNColSpan > 0) rNColSpan--;
	}

	// If the row number is < 1, no need to do anything ...
	if(thisObj.m_actualNRow < 1) return;

	// Re-drawing the title row
	for(var j=0; j<thisObj.m_maxNCol; j++)
	{
            // If for some reason, the rows do NOT have any child, then
            // simply return ...
            if(thisObj.m_titleRowCellArray[j].childNodes.length == 0) return;

            if(thisObj.m_titleRowCellArray[j].firstChild != null)
            {
                nChildNodes = thisObj.m_titleRowCellArray[j].firstChild.childNodes.length;
                innerMostNode = thisObj.m_titleRowCellArray[j].firstChild;

                while(nChildNodes != 0)
                {
                    innerMostNode = innerMostNode.firstChild;
                    nChildNodes = innerMostNode.childNodes.length;
                }
                cellText = innerMostNode.data;
            }
            else
            {
                cellText = "column(" + j + ")";
            }

            thisObj.m_titleRowArray[j] = cellText;
            thisObj.m_titleRowCellArray[j].innerHTML = '<a ' + thisObj.m_linkEventString +
                    j + ',' + '"' + table.id + '"' + ');\'>' +
                    '<' + thisObj.m_titleFace + '>' + cellText +
                    '</' + thisObj.m_titleFace +'></a>';
	}
    }

    /**
     * called when user clicks on  a title to sort
     */
    this.f_sortTable = function(index, obj)
    {
        // Re-inializing the table object
	initTable(obj);

	// Local variables
	var nChildNodes;
	var innerMostNode;
	var rowContent;
	var rowCount;
	var cell, cellText;
	var newTitle;

	// Can't sort past the max allowed column size
	if(index < 0 || index >= thisObj.m_maxNCol) return;

	// Assignment of sort index
	thisObj.m_sortIndex = index;
	// Doing the sort using JavaScript generic function for an Array
	thisObj.m_rowArray.sort(thisObj.f_compare);

	// Re-drawing the title row
	for(var j=0; j<thisObj.m_maxNCol; j++)
	{
            cellText = thisObj.m_titleRowArray[j];
            cellText = '<' + thisObj.m_titleFace +'>' +
                    cellText + '</' + thisObj.m_titleFace + '></a>';
            newTitle = '<a ' + thisObj.m_linkEventString +
                    j + ',' + '"' + thisObj.m_table.id + '"' + ');\'>' +
                    cellText + '</a>';
            if(j == thisObj.m_sortIndex)
            {
                newTitle += '&nbsp;<font color=' + thisObj.m_updownColor + '>';
                if(thisObj.m_descending)
                    newTitle += thisObj.m_desChr;
                else
                    newTitle += thisObj.m_ascChr;
                newTitle += '</font>';
            }

            thisObj.m_titleRowCellArray[j].innerHTML = newTitle;
	}

	// Re-drawing the table
	rowCount = 0;
	for(var i=0; i<thisObj.m_nRow; i++)
	{
            if(! thisObj.m_colSpanArray[i])
            {
                for(var j=0; j<thisObj.m_maxNCol; j++)
                {
                    rowContent = thisObj.m_rowArray[rowCount].split(thisObj.m_recDelimiter);
                    nChildNodes = thisObj.m_table.rows[i].cells[j].firstChild.childNodes.length;
                    innerMostNode = thisObj.m_table.rows[i].cells[j].firstChild;

                    while(nChildNodes != 0)
                    {
                        innerMostNode = innerMostNode.firstChild;
                        nChildNodes = innerMostNode.childNodes.length;
                    }
                    innerMostNode.data = rowContent[j];
                }
                rowCount++;
            }
	}

	// Switching btw descending/ascending sort
	if(thisObj.m_descending)
            thisObj.m_descending = false;
	else
            thisObj.m_descending = true;
    }

    /**
     * Function to be used for Array sorting
     */
    this.f_compare = function(a, b)
    {
        var sIndex = thisObj.m_sortIndex;

	// Getting the element array for inputs (a,b)
	var aRowContent = a.split(thisObj.m_recDelimiter);
	var bRowContent = b.split(thisObj.m_recDelimiter);

	// Needed in case the data conversion is necessary
	var aToBeCompared, bToBeCompared;

	if(! isNaN(aRowContent[sIndex]))
            aToBeCompared = parseInt(aRowContent[sIndex], 10);
	else
            aToBeCompared = aRowContent[sIndex];

	if(! isNaN(bRowContent[sIndex]))
            bToBeCompared = parseInt(bRowContent[sIndex], 0);
	else
            bToBeCompared = bRowContent[sIndex];

	if(aToBeCompared < bToBeCompared)
        {
            if(!thisObj.m_descending)
		return -1;
            else
		return 1;
        }

	if(aToBeCompared > bToBeCompared)
        {
            if(!thisObj.m_descending)
		return 1;
            else
          	return -1;
        }

	return 0;
    }

    /**
     * Function to set the cursor
     */
    function setCursor(obj)
    {
	// Show hint text at the browser status bar
	window.status = "Sort by " + obj.firstChild.innerHTML;
	// Change the mouse cursor to hand or pointer
	if(thisObj.m_isIE)
            obj.firstChild.style.cursor = "hand";
	else
            obj.firstChild.style.cursor = "pointer";
    }

    /**
     * Function to set the title color
     */
    function setColor(obj,mode)
    {
	if (mode == "selected")
	{
            // Remember the original color
            if (obj.style.color != thisObj.m_selectedColor)
                    thisObj.m_defaultColor = obj.style.color;
            obj.style.color = thisObj.m_selectedColor;
	}
	else
	{
            // Restoring original color and re-setting the status bar
            obj.style.color = thisObj.m_defaultColor;
            window.status = '';
	}
    }

    /**
     * Function to check browser type/version
     */
    this.checkBrowser = function()
    {
	if (navigator.appName == "Microsoft Internet Explorer"
		&& navigator.appVersion.indexOf("5.") >= 0)
	{
            thisObj.m_isIE = true;
            return true;
	}
	// For some reason, appVersion returns 5 for Netscape 6.2 ...
	else if(navigator.appName == "Fire Fox"
		&& navigator.appVersion.indexOf("5.") >= 0)
	{
            thisObj.m_isIE = false;
            return true;
	}
	else
            return false;
    }
}
g_sortTable = new UTM_sortingTable();
function sortTable(index, obj)
{
    g_sortTable.f_sortTable(index, obj);
}


////////////////////////////////////////////////////////////////////////////
var g_utils =
{
    m_clock_serverTime : null,
    m_clock_isClockRan : false,
    m_clock_secTime : null,
    f_startClock: function(sDate)
    {
        this.m_clock_secTime = new Date().getTime();
        if(sDate != undefined && sDate instanceof Date)
             this.m_clock_secTime = sDate.getTime();

        if(!this.m_clock_isClockRan)
        {
            // create a thread to run every one second
            this.m_thread = new UTM_thread(1000);

            var clockRuns = function()
            {
                this.m_clock_secTime += 1000;
                this.m_clock_serverTime = new Date(
                                this.m_clock_secTime).format('j-n-y g:i:s A');
            }

            // start the clock
            this.m_thread.f_start(clockRuns);
            this.m_clock_isClockRan = true; // makesure only 1 clock is running
        }
    },
    f_getServerTime: function()
    {
        return this.m_clock_serverTime;
    },

    f_findPercentage: function(total, free)
    {
        if(total == 0 && free == 0) return 0;
        if(free <= 0) return 100;

        var p = 100 - Math.round((free/total) * 100);

        return p < 0 ? 0 : p;
    },

    f_saveUserLoginId: function(id)
    {
        g_cookie.f_set(g_consObj.V_COOKIES_USER_ID, id, g_cookie.m_userNameExpire);
    },

    f_saveLanguage: function(lang)
    {
        g_cookie.f_set(g_consObj.V_COOKIES_LANG, lang, g_cookie.m_userNameExpire);
    },

    f_saveUserName: function(username)
    {
        g_cookie.f_set(g_consObj.V_COOKIES_USER_NAME, username, g_cookie.m_userNameExpire);
    },

    f_getUserLoginedID: function(cookieP /* cookieP is optional */)
    {
        return g_cookie.f_get(g_consObj.V_COOKIES_USER_ID);
    },

    f_getLanguage: function()
    {
        return g_cookie.f_get(g_consObj.V_COOKIES_LANG);
    },

    f_getUserLoginedName: function()
    {
        return g_cookie.f_get(g_consObj.V_COOKIES_USER_NAME);
    },

    f_launchHomePage: function()
    {
        var lang = this.f_getLanguage();

        switch(lang)
        {
            default:
            case g_consObj.V_LANG_EN:
                return "utm_main_en.html";
            case g_consObj.V_LANG_FR:
                return "utm_main_fr.html";
        }
    },

    f_gotoHomePage: function()
    {
        var hp = this.f_launchHomePage();

        if (navigator.userAgent.indexOf('Chrome') > 0)
			location.reload(true);
		else {
			var loc = window.location.href;
			var index = loc.indexOf('ft_main');
			var homepage = g_consObj.V_HOME_PAGE;
			if (index != -1) {
				if (loc.charAt(index+7) != '.') {
				    //get the location code.
					var locale = loc.substring(index+7,index+10);
					homepage = 'utm_main' + locale + '.html';
				}
			}

			//window.location = homepage;
                        window.location = hp;
		}
    },

	f_gotoHomePageLocale: function(locale)
	{
	    //var homepage = 'utm_main' + locale + '.html';
            var homepage = this.f_launchHomePage();
            window.location = homepage;
	},

    f_cursorWait: function()
    {
        var body = document.body;
        //body.style.cursor = "url('images/wait.gif'), wait;";
        body.className = 'ft_wait_cursor';
    },

    f_cursorDefault: function()
    {
        var body = document.body;
        //body.style.cursor = 'default';
        body.className = 'ft_default_cursor';
    },

    f_createPopupDiv : function(isModal)
	{
        var div = document.createElement('div');
        div.setAttribute('id', 'ft_popup_div');
		div.style.width = '300px';
		div.style.backgroundColor = 'white';
        div.style.display = 'block';
        div.style.overflow = 'visible';
        div.style.font = 'normal 10pt arial';
        div.style.borderTop = '2px solid #CCC';
        div.style.borderLeft = '2px solid #CCC';
        div.style.borderBottom = '2px solid #000';
        div.style.borderRight = '2px solid #000';
        div.style.padding = '15px';

		if (isModal==true) {
		    div.style.margin = '100px auto';
		    div.style.textAlign = 'center';
		} else {
            div.style.position = 'relative';
            div.style.top = '-265px';
            div.style.height = '70px';
		}

		return div;
	},

    f_popupMessage: function(message, type, title, isModal, cb, ccb)
    {
        var popDivId = 'ft_popup_message';

        /////////////////////////////////////////
        // set inner styling of the div tag
        var div = this.f_createPopupDiv(isModal);

		if (isModal==true) {
			popDivId = 'ft_modal_popup_message';
			var el = document.getElementById(popDivId);
			el.style.visibility = "visible";
		}
		document.getElementById(popDivId).appendChild(div);

		var cancelHandler = "f_utilsPopupCancel('" + popDivId + "')";
		var applyHandler = "f_utilsPopupApply('" + popDivId + "')";
		var timeoutHandler = "f_utilsPopupTimeout('" + popDivId + "')";
		var okHandler = "f_utilsPopupOk('" + popDivId + "')";

        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">';

        var buttonsDiv = '';
        switch(type)
        {
            case 'confirm': // yes/no or apply/cancel
                if(title != undefined)
                {
                    div.style.height = '100px';
                    message = '<b>' + title + '</b><br><br>' + message;
                }
                var cancelCb = ccb == undefined ? cancelHandler : cancelHandler + ";" + ccb;
                cb = cb == undefined ? applyHandler : applyHandler + ";" + cb;
                buttonsDiv = '<div align="center"><input id="ft_popup_message_apply" src="' + g_lang.m_imageDir + 'bt_apply.gif" ' +
                          'type="image" onclick="' + cb + '">&nbsp;&nbsp;' +
                          '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
                          '<input id="ft_popup_message_cancel" src="' + g_lang.m_imageDir + 'bt_cancel.gif" ' +
                          'type="image" onclick="' + cancelCb + '"></div>';
                innerHtml += '<tbody><tr height="65">' +
                      '<td width="48"><img src="images/ft_confirm.PNG"></td>' +
                        '<td style="text-align:left;" width="250"><p ' +
                        'style="padding-left:5px; font:normal 10pt arial;">' +
                        message + '</p></td>';
                break;
            case 'timeout':
                div.style.width = '380px';
                div.style.height = '100px';
                message = '<b>' + g_lang.m_puSessionTimeout + '</b><br><br>' +
                      g_lang.m_puSessionTimeoutMsg;

                buttonsDiv = '<div align="center" style="padding-top:8px;">' +
                              '<input type="image" src="' + g_lang.m_imageDir + 'bt_ok.gif" ' +
                              'onclick="' + timeoutHandler + '"></div>';
                innerHtml += '<tbody><tr height="73">' +
                        '<td width="48"><img src="' + g_lang.m_imageDir + 'ft_confirm.PNG"></td>' +
                        '<td style="text-align:left;" width="350"><p ' +
                        'style="padding-left:5px; font:normal 10pt arial;">' +
                        message + '</p></td>';
                break;
            case 'ok':    // ok only
                cb = cb == undefined ? okHandler : okHandler + ";" + cb;
                div.style.width = '350px';
                if(title != undefined)
                {
                    div.style.height = '100px';
                    message = '<b>' + title + '</b><br><br>' + message;
                }

                buttonsDiv = '<div align="center" style="padding-top:8px;">' +
                              '<input type="image" src="' + g_lang.m_imageDir +  'bt_ok.gif" ' +
                              'onclick="' + cb + '"></div>';
                innerHtml += '<tbody><tr height="73">' +
                        '<td width="48"><img src="' + g_lang.m_imageDir + 'ft_confirm.PNG"></td>' +
                        '<td style="text-align:left;" width="300"><p ' +
                        'style="padding-left:5px; font:normal 10pt arial;">' +
                        message + '</p></td>';
                break;
            case 'error':    // ok only
                cb = cb == undefined ? okHandler : okHandler + ";" + cb;
                div.style.width = '350px';
                if(title != undefined)
                {
                    div.style.height = '';
                    message = '<b>' + title + '</b><br><br>' + message;
                }

                buttonsDiv = '<div align="center" style="padding-top:8px;">' +
                              '<img src="' + g_lang.m_imageDir + 'bt_ok.gif" ' +
                              'onclick="' + cb + '"></div>';
                innerHtml += '<tbody><tr height="73">' +
                        '<td width="48"><img src="' + g_lang.m_imageDir + 'ft_confirm.PNG"></td>' +
                        '<td style="text-align:left;" width="300"><p ' +
                        'style="padding-left:5px; font:normal 10pt arial;">' +
                        message + '</p></td>';
                break;
        }

        innerHtml += '</tr><tr height="28">' +
                      '<td valign="bottom" colspan="2">' + buttonsDiv + '</td>' +
                      '</tr></table>';

        div.innerHTML = innerHtml;
        return div;
    },

    f_hidePopupMessage: function(id)
    {
        var div = document.getElementById(id);
		if (id=='ft_modal_popup_message') {
			div.style.visibility = "hidden";
		}
        var cDiv = document.getElementById('ft_popup_div');
        div.removeChild(cDiv);
    },

    f_replace: function(str, expOld, expNew)
    {
        if(str != undefined && str.search != undefined)
        {
            while(str.search(expOld) > -1)
                str = str.replace(expOld, expNew);
        }

        return str;
    },

    f_validateIP : function(ip)
    {
        var ipRegex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;
        if (!ip.match(ipRegex))
            return false;

        return true;
    },

    f_validateNetmask : function(nm)
    {
        if(this.f_validateIP(nm))
        {
            var ns = nm.split(".");
            var bin = '';
            for(var i=0; i<ns.length; i++)
                bin += parseInt(ns[i]).toString(2);

            var flagZero = false;
            for(var i=0; i<bin.length; i++)
            {
                if(bin[i] == '0')
                    flagZero = true;
                else if(bin[i] == '1' && flagZero)
                    return false;
            }
        }

        return true;
    },

    /**
     * convert netmask in xxx.xxx.xxx.xxx format into CIRD format (/mm) where
     * mm is between 0 and 32.
     * @param nm - netmask in (xxx.xxx.xxx.xxx) format.
     * @return 0 .. 32 CIRD format
     *         greate 32 is netmask conversion error,
     *         OR netmask xxx.xxx.xxx.xxx is invalided
     */
    f_convertNetmaskToCIDR : function(nm)
    {
        if(this.f_validateIP(nm))
        {
            var ns = nm.split(".");
            var bin = '';
            for(var i=0; i<ns.length; i++)
                bin += parseInt(ns[i]).toString(2);

            for(var i=0; i<bin.length; i++)
            {
                if(bin[i] == '0')
                    return i;
            }

            return 32;
        }

        return 34;
    },

    /**
     * convert netmask in /mm format into (xxx.xxx.xxx.xxx) format where
     * mm is between 0 and 32.
     * @param cidr - 0..32
     * @return netmask in xxx.xxx.xxx.xxx form
     */
    f_convertCIDRToNetmask : function(cidr)
    {
        var bin = '';
        var ncidr = parseInt(cidr);

        // form a binary string as 'bbbbbbbb.bbbbbbbb.bbbbbbbb.bbbbbbbb'
        for(var i=0; i<32; i++)
        {
            if(i == 8 || i == 16 || i == 24)
                bin += ".";

            if(i < ncidr)
                bin += "1";
            else
                bin += "0";
        }

        // now convert it into xxx.xxx.xxx.xxx form
        var bins = bin.split(".");
        var netmask = '';
        for(var i=0; i<4; i++)
        {
            var pp = parseInt(bins[i], 2);

            if(i < 3)
                netmask += pp + '.';
            else
                netmask += pp;
        }

        return netmask;
    }
};

function f_utilsPopupTimeout(id)
{
    g_utils.f_hidePopupMessage(id);
    g_busObj.f_userLogout();
}

function f_utilsPopupApply(id)
{
    g_utils.f_hidePopupMessage(id);
}

function f_utilsPopupOk(id)
{
    g_utils.f_hidePopupMessage(id);
}

function f_utilsPopupCancel(id)
{
    g_utils.f_hidePopupMessage(id);
}