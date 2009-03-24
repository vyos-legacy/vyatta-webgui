/*
    Document   : ft_utils.js
    Created on : Feb 25, 2009, 2:35:25 PM
    Author     : Kevin.Choi
    Description:
*/

FT_extend = function(subClass, baseClass)
{
   function inheritance() {}
   inheritance.prototype = baseClass.prototype;

   subClass.prototype = new inheritance();
   subClass.prototype.constructor = subClass;
   subClass.baseConstructor = baseClass;
   subClass.superclass = baseClass.prototype;
}

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
            this.m_thread = new FT_thread(this, 1000);

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

    f_saveUserName: function(username)
    {
        g_cookie.f_set(g_consObj.V_COOKIES_USER_NAME, username, g_cookie.m_userNameExpire);
    },

    f_getUserLoginedID: function(cookieP /* cookieP is optional */)
    {
        return g_cookie.f_get(g_consObj.V_COOKIES_USER_ID);
    },

    f_getUserLoginedName: function()
    {
        return g_cookie.f_get(g_consObj.V_COOKIES_USER_NAME);
    },

    f_gotoHomePage: function()
    {
        if(navigator.userAgent.indexOf('Chrome') > 0)
            location.reload(true);
        else
            window.location = g_consObj.V_HOME_PAGE;
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

    f_popupMessage: function(message, type)
    {
        this.f_popupMessage(message, type, "", true, null, null);
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
                buttonsDiv = '<div align="center"><input id="ft_popup_message_apply" src="images/bt_apply.gif" ' +
                          'type="image" onclick="' + cb + '">&nbsp;&nbsp;' +
                          '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
                          '<input id="ft_popup_message_cancel" src="images/bt_cancel.gif" ' +
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
                              '<input type="image" src="images/bt_ok.gif" ' +
                              'onclick="' + timeoutHandler + '"></div>';
                innerHtml += '<tbody><tr height="73">' +
                        '<td width="48"><img src="images/ft_confirm.PNG"></td>' +
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
                              '<input type="image" src="images/bt_ok.gif" ' +
                              'onclick="' + cb + '"></div>';
                innerHtml += '<tbody><tr height="73">' +
                        '<td width="48"><img src="images/ft_confirm.PNG"></td>' +
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
                              '<img src="images/bt_ok.gif" ' +
                              'onclick="' + cb + '"></div>';
                innerHtml += '<tbody><tr height="73">' +
                        '<td width="48"><img src="images/ft_confirm.PNG"></td>' +
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