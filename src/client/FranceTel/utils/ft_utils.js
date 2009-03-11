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

    f_getUserLoginedID: function(cookieP /* cookieP is optional */)
    {
        return g_cookie.f_get(g_consObj.V_COOKIES_USER_ID);
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

    f_popupMessage: function(message, type, title)
    {
        var div = document.createElement('div');
        div.setAttribute('id', 'ft_popup_div');

        /////////////////////////////////////////
        // set inner styling of the div tag
        div.style.position = 'relative';
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.top = '-265px';
        div.style.height = '70px';
        div.style.width = '300px';
        div.style.overflow = 'visible';
        div.style.font = 'normal 10pt arial';
        div.style.borderTop = '2px solid #CCC';
        div.style.borderLeft = '2px solid #CCC';
        div.style.borderBottom = '2px solid #000';
        div.style.borderRight = '2px solid #000';
        div.style.padding = '20px';

        document.getElementById('ft_popup_message').appendChild(div);

        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">';
                        

        var buttonsDiv = '';
        switch(type)
        {
            case 'confirm': // yes/no or apply/cancel
                buttonsDiv = '<div align="center"><img src="images/ft_apply.PNG" ' +
                          'onclick="f_utilsPopupApply()">&nbsp;&nbsp;' +
                          '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
                          '<img src="images/ft_cancel.PNG" ' +
                          'onclick="f_utilsPopupCancel()"></div>';
                innerHtml += '<tbody><tr height="55">' +
                      '<td width="48"><img src="images/ft_confirm.PNG"></td>' +
                        '<td style="text-align:left;" width="250"><p ' +
                        'style="padding-left:5px; font:normal 10pt arial;">' +
                        message + '</p></td>';
                break;
            case 'timeout':
                div.style.width = '350px';
                div.style.height = '90px';
                message = '<b>Session Time Out</b><br><br>' +
                      'For security reasons, your session is no longer active.' +
                      '<br>Please re-login again.';

                buttonsDiv = '<div align="center" style="padding-top:8px;">' +
                              '<img src="images/ft_apply.PNG" ' +
                              'onclick="f_utilsPopupTimeout()"></div>';
                innerHtml += '<tbody><tr height="73">' +
                        '<td width="48"><img src="images/ft_confirm.PNG"></td>' +
                        '<td style="text-align:left;" width="300"><p ' +
                        'style="padding-left:5px; font:normal 10pt arial;">' +
                        message + '</p></td>';
                break;
            case 'ok':    // ok only
                div.style.width = '350px';
                if(title != undefined)
                {
                    div.style.height = '90px';
                    message = '<b>' + title + '</b><br><br>' + message;
                }

                buttonsDiv = '<div align="center" style="padding-top:8px;">' +
                              '<img src="images/ft_apply.PNG" ' +
                              'onclick="f_utilsPopupOk()"></div>';
                innerHtml += '<tbody><tr height="73">' +
                        '<td width="48"><img src="images/ft_confirm.PNG"></td>' +
                        '<td style="text-align:left;" width="300"><p ' +
                        'style="padding-left:5px; font:normal 10pt arial;">' +
                        message + '</p></td>';
                break;
        }

        innerHtml += '</tr><tr height="28">' +
                      '<td colspan="2">' + buttonsDiv + '</td>' +
                      '</tr></table>';

        div.innerHTML = innerHtml;
        return div;
    },

    f_hidePopupMessage: function()
    {
        var div = document.getElementById('ft_popup_message');
        var cDiv = document.getElementById('ft_popup_div');
        div.removeChild(cDiv);
    }
};

function f_utilsPopupTimeout()
{
    g_utils.f_hidePopupMessage();
    g_busObj.f_userLogout();
}

function f_utilsPopupApply()
{
    g_utils.f_hidePopupMessage();
}

function f_utilsPopupOk()
{
    g_utils.f_hidePopupMessage();
}

function f_utilsPopupCancel()
{
    g_utils.f_hidePopupMessage();
}