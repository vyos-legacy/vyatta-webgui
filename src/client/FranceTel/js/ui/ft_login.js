/*
    Document   : ft_login.js
    Created on : Feb 26, 2009, 3:19:25 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_login(busObj)
{
    var thisObj = this;
    this.m_busObj = busObj;


    /**
     * get an HTML login div element.
     * @return login div element.
     */
    this.f_getLoginPage = function()
    {
        return thisObj.f_createLoginDiv();
    }

    /**
     * create a login div for login page
     */
    this.f_createLoginDiv = function()
    {		
		var div = document.getElementById('login_content');
		div.innerHTML = thisObj.f_createLoginInnerHTML();
        ///////////////////////////////////
        // set initial focus
        var el = document.getElementById('username');
		el.focus();
        div = document.getElementById('ft_login_container');		
        return div;
    }

    this.f_createLoginInnerHTML = function()
    {
		var html = 
		    '<div id="login_form">' +
                 '<table id="ft_table" align="center">' +
                      '<tbody>' +
                         '<tr>' +
                             '<td class="alignLeft">' + g_lang.m_mainUserName + '</td>' +
                             '<td class="alignLeft">' +
                                 '<input id="username" class="login_form_input" name="username" size="32" type="text" onkeydown="f_LoginKeyPressHandler(event)">' +
                             '</td>' +
                         '</tr>' +
                         '<tr>' +
                             '<td class="alignLeft">' + g_lang.m_mainPassword + '</td>' +
                             '<td class="alignLeft">' +
                                 '<input id="password" name="password" class="login_form_input" size="32" type="password" onkeydown="f_LoginKeyPressHandler(event)">' +
                             '</td>' +
                         '</tr>' +
                      '</tbody>' +
                 '</table>' + '<br/><br/>' +
                 '<div align="center">' +
                      '<img id="goto22" src="' + g_lang.m_imageDir + 'bt_login.gif" onclick="f_submit()">' +
                 '</div>' +
           '</div>' +
		   '<br/><br/><br/>' +
           '<div id="messageContactServiceCustomer" align="center">' +
           g_lang.m_mainWarning +
           '</div>';
		
        return html;
    }
}
g_loginObj = new FT_login();

function f_LoginKeyPressHandler(event)
{
    //////////////////////////////////////////////////
    // check for ENTER key to trigger the 'login'
    // button
    if(event.keyCode == 13)
        f_submit();

}

function f_submit()
{
    var un = document.getElementById('username').value;
    var pw = document.getElementById('password').value;

    if(un.length == 0 || pw.length == 0)
    {
        g_utils.f_popupMessage(g_lang.m_loginPrompt,
                              g_lang.m_ok, g_lang.m_loginError);
        return;
    }

    var cb = function(event)
    {
        g_utils.f_cursorDefault();
        if(event.f_isError()) {
			if (event.m_errCode == 8) {
				//this is the case which requires the user to change his/her password at login.
                g_utils.f_saveUserLoginId(event.m_sid);		
				g_utils.f_saveUserName(un);
				var cb = function()
				{
				};
				var dialog = new FT_changePassword('Change Password', cb, g_busObj);
				dialog.f_init(un);
				dialog.f_getConfigurationPage();
			} else {
				g_utils.f_popupMessage(g_lang.m_loginUnableToLogin + event.m_errMsg, g_lang.m_ok, g_lang.m_loginError);
			}
        } else {
            g_utils.f_saveUserLoginId(event.m_value.m_sid);
            g_utils.f_saveUserName(un);
            g_utils.f_gotoHomePage();
        }
    }

    g_utils.f_cursorWait();
    g_busObj.f_userLoginRequest(un, pw, cb);
}
