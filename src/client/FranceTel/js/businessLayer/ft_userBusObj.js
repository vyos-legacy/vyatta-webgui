/*
    Document   : ft_userBusObj.js
    Created on : Feb 26, 2009, 3:19:25 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_userRecObj(user, last, first, pw, level, type)
{
    this.m_user = user;    // login username
    this.m_last = last;
    this.m_first = first;
    this.m_pw = pw;
    this.m_level = level;
    this.m_type = type;    // add, change, delete, list
}

function FT_userBusObj(busObj)
{
    this.V_ROLE_ADMIN = 0;
    this.V_ROLE_INSTALL = 1;
    this.V_ROLE_USER = 2;

    var thisObj = this;
    this.m_busObj = busObj;
    this.m_username = null; // login username
    this.m_pw = null;
    this.m_sid = null;
    this.m_guiCb = null;
    this.m_role = null;   // user role: admin=0, installer=1, user=2

    /////////////////////////////////////////
    /**
     * A callback function for request.
     */
    this.f_respondRequestCallback = function()
    {
        var response = thisObj.m_busObj.f_getRequestResponse(
                        thisObj.m_busObj.m_request);

        if(response == null) return;

        if(response.f_isError != null)
        {
            thisObj.m_guiCb(response);
        }
        else
        {
            var sid = response.getElementsByTagName('id');
            if(sid != undefined && sid[0] != undefined)
                thisObj.m_sid = sid[0].firstChild.nodeValue;

            var ulist = response.getElementsByTagName('vmuser')
            if(ulist != undefined && ulist[0] != undefined)
                thisObj.f_parseUserListResponse(ulist);

            /////////////////////////////////////////
            // create an event then send back to ui
            var evt = new FT_eventObj(0, thisObj, undefined);
            thisObj.m_guiCb(evt);
        }
    }

    this.f_logout = function(cb)
    {
        thisObj.m_sid = undefined;
        g_cookie.f_remove(g_consObj.V_COOKIES_USER_ID);
        g_utils.f_gotoHomePage();
    }

    this.f_setLogin = function(u, p, cb)
    {
        thisObj.m_username = u;
        thisObj.m_pw = p;
        thisObj.m_guiCb = cb;

        switch(u)
        {
            case 'admin':
                thisObj.m_role = thisObj.V_ROLE_ADMIN;
                break;
            case 'installer':
                thisObj.m_role = thisObj.V_ROLE_INSTALL;
                break;
            default:
                thisObj.m_role = thisObj.V_ROLE_USER;
        }
    }

    this.f_isLogin = function()
    {
        return g_cookie.f_get(g_consObj.V_COOKIES_USER_ID) ==
                              g_consObj.V_NOT_FOUND ? false : true;
    }

    /**
     * To set username, last, first, pw to server. Use userObj.m_type to
     * specify the operation to be exceuted.
     */
    this.f_setUser = function(userRec, guiCb)
    {
        thisObj.m_guiCb = guiCb;
        var ur = userRec;
        var sid = f_getUserLoginedID();
        var xmlstr = "<vmuser op='" + userRec.type + "' ";

        if(ur.m_user != undefined && ur.m_user.length > 0)
            xmlstr += "user='" + ur.m_user + "' ";
        if(ur.m_last != undefined && ur.m_last.length > 0)
            xmlstr += "last='" + ur.m_last + "' ";
        if(ur.m_first != undefined && ur.m_first.length > 0)
            xmlstr += "first='" + ur.m_first + "' ";
        if(ur.m_password != undefined && ur.m_password.length > 0)
            xmlstr += "password='" + ur.m_password+ "' ";

        xmlstr += ">\n<id>" + sid + "</id></vmuser>";
        thisObj.m_busObj.f_sendRequest(xmlstr, thisObj.f_respondRequestCallback);
    }
    /**
     * get a user profile by username.
     * @param user - a username of profile to be returned. if user == null,
     *                entire list of user profile return.
     * @param guiCb -
     */
    this.f_getUsers = function(user, guiCb)
    {
        thisObj.m_guiCb = guiCb;
        var uRec = new FT_userRecObj(null, null, null, null, null, 'list');
        thisObj.f_setUser(uRec);
    }

    this.f_parseUserListResponse = function(ulist)
    {
        for(var i=0; i<ulist.length; i++)
        {
            alert(ulist[i].getAttribute('user'));
            alert(ulist[i].getAttribute('last'));
            alert(ulist[i].getAttribute('first'));
        }
    }
}