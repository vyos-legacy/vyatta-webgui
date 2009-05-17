/*
    Document   : utm_userBusObj.js
    Created on : Feb 26, 2009, 3:19:25 PM
    Author     : Kevin.Choi
    Description:
*/

function UTM_userRecObj(user,pw)
{
    this.m_user = user;    // login username
    this.m_pw = pw;         // old or current pw
}

function UTM_userBusObj(busObj)
{
    var thisObj = this;
    this.m_busObj = busObj;
    this.m_sid = null;
    this.m_guiCb = null;
    this.m_loginUser = null;
    this.m_lastCmdSent = null;

    /////////////////////////////////////////
    /**
     * A callback function for all user management requests.
     */
    this.f_respondRequestCallback = function(resp, cmdSent, noUICallback)
    {
        var response = thisObj.m_busObj.f_getRequestResponse(
                        thisObj.m_busObj.m_request);

        if(response == null) return;

        if(response.f_isError != null)
        {
            if(noUICallback == undefined || !noUICallback)
                thisObj.m_guiCb(response);
        }
        else
        {
            var evt = new UTM_eventObj(0, thisObj, '');		
				
            var sid = response.getElementsByTagName('id');
            if(sid != undefined && sid[0] != undefined)
                thisObj.m_sid = sid[0].firstChild.nodeValue;

            var err = response.getElementsByTagName('error');
            if(err != null && err[0] != null)
            {
                if(thisObj.m_lastCmdSent.indexOf('<auth>') >= 0)
                {
                    g_utils.f_saveUserLoginId(thisObj.m_sid);
                }
            }
			
			if(thisObj.m_guiCb != undefined)
                thisObj.m_guiCb(evt);
        }
    }

    /**
     * reqeust callback from server and do not forward to GUI layer
     */
    this.f_respondRequestCallbackWithoutGIUCB = function(resp, cmdSent)
    {
        thisObj.f_respondRequestCallback(resp, cmdSent, true);
    }

    /**
     * logout current login user. This end the user session, clean up cookie
     * and load the login page.
     * @param cb - is optional. (it is not use right now)
     */
    this.f_logout = function(cb)
    {
        thisObj.m_sid = undefined;
        g_cookie.f_remove_all();
    }

    /**
     * set user's request login data before send to server.
     */
    this.f_setLogin = function(u, p, cb)
    {
        if(cb != undefined)
            thisObj.m_guiCb = cb;

        thisObj.m_loginUser = new UTM_userRecObj(u,p);
    }


    /**
     * call this fuction to find out is current user login.
     */
    this.f_isLogin = function()
    {
		var isLogin = true;
		var cid = g_cookie.f_get(g_consObj.V_COOKIES_USER_ID);
		
		if ((cid == g_consObj.V_NOT_FOUND) || (cid == null) || (cid.trim().length <= 0)) {
			isLogin = false;
		}

        if(isLogin)
        {
            var name = g_cookie.f_get(g_consObj.V_COOKIES_USER_NAME);
            this.f_setLogin(name, null, undefined);
        }

        return isLogin;
    }
}
