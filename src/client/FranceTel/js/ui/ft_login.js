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
		/*
        var div = document.createElement('div');
        div.setAttribute('id', 'ft_login_div');
        div.setAttribute('align', 'center');
        div.className = 'className';

        /////////////////////////////////////////
        // set inner styling of the div tag
        //div.style.position = 'absolute';
        div.style.pixelLeft = 0;
        div.style.backgroundColor = 'white';

        //////////////////////////////////////
        // set the html content inside the div tag
        div.innerHTML = this.f_createLoginInnerHTML();
         
        document.getElementById('ft_container').appendChild(div);
        */
		
		var div = document.getElementById('ft_login_container');
		
        ///////////////////////////////////
        // set initial focus
        var el = document.getElementById('username');
		if (!g_xbObj.m_isSafari) {
			el.focus();
		}
		
        return div;
    }

    this.f_createLoginInnerHTML = function()
    {
        var str = '<br><br><div id="login_content" align="center">' +
                  '<table id="ft_table" align="center" width="100%">'+
                  '<tbody><tr>'+
                  '<td class="alignRight"><label for="username">' +
                  '<script>document.write(eval("user_"+lang))</script>username</label></td>'+
		  '<td class="alignLeft">' +
                  '<input id="username" name="username" type="text" '+
                  'onkeydown="f_LoginKeyPressHandler(event)"></td>'+
		  '</tr>'+
		  '<tr>'+
		  '<td class="alignRight"><label for="password">'+
                  '<script>document.write(eval("password_"+lang))'+
                  '</script>password</label></td>'+
		  '<td class="alignLeft">'+
                  '<input id="password" name="password" type="password" '+
                  'onkeydown="f_LoginKeyPressHandler(event)"></td>'+
		  '</tr>'+
		  '</tbody></table></div>';

        str += '<div align="center"><input name="goto2" id="goto22" value="OK" onclick="f_submit()" '+
                'class="OneButton" type="button"></div>';

        str += "<br><br><div id='messageContactServiceCustomer' align='center'>" +
                  "If you have no username and password, contact your Customer Service Center.<br>";
        str += "Warning: to connect to the Open Appliance program,";
        str += " your browser must accept pop-ups and cookies.</div>";

        return str;
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
        g_utils.f_popupMessage("Please enter username and password to login.",
                              "ok", "Login error");
        return;
    }

    var cb = function(event)
    {
        if(event.f_isError())
        {
            g_utils.f_popupMessage('Unable to login: ' + event.m_errMsg,
                            "ok", "Login error");
        }
        else
        {
            g_utils.f_saveUserLoginId(event.m_value.m_sid);
            g_utils.f_gotoHomePage();
        }
    }

    g_busObj.f_userLoginRequest(un, pw, cb);
}
