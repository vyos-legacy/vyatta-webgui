/*
    Document   : ft_userBusObj.js
    Created on : Feb 26, 2009, 3:19:25 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_userRecObj(user, last, first, pw, role, type, email, right)
{
    this.m_user = user;    // login username
    this.m_last = last;
    this.m_first = first;
    this.m_email = email;
    this.m_pw = pw;
    this.m_role = role; // user role: admin=0, installer=1, user=2
    this.m_right = right;
    this.m_type = type;    // add, change, delete, list

    /**
     * set user name from server node
     */
    this.f_setUserName = function(node)
    {
        if(node == undefined || node.childNodes == undefined) return;

        var s=0;
        for(var i=0; i<node.childNodes.length; i++)
        {
            if(node.childNodes.nodeName == 'first')
                this.m_first = node.childNodes.firstChild.nodeValue;

            if(node.childNodes.nodeName == 'last')
                this.m_last = node.childNodes.firstChild.nodeValue;
        }
    }
}

function FT_userBusObj(busObj)
{
    this.V_ROLE_ADMIN = 0;
    this.V_ROLE_INSTALL = 1;
    this.V_ROLE_USER = 2;

    var thisObj = this;
    this.m_busObj = busObj;
    this.m_sid = null;
    this.m_guiCb = null;
    this.m_userList;
    this.m_loginUser;

    /////////////////////////////////////////
    /**
     * A callback function for all user management requests.
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

            var user = response.getElementsByTagName('user');
            if(user != undefined && user.length > 0)
                thisObj.m_userList = this.f_parseUserResponse(user);

            /////////////////////////////////////////
            // create an event then send back to ui
            var evt = new FT_eventObj(0, thisObj, undefined);
            thisObj.m_guiCb(evt);
        }
    }

    /**
     * logout current login user. This end the user session, clean up cookie
     * and load the login page.
     * @param cb - is optional. (it is not use right now)
     */
    this.f_logout = function(cb)
    {
        thisObj.m_sid = undefined;
        g_cookie.f_remove(g_consObj.V_COOKIES_USER_ID);
        g_utils.f_gotoHomePage();
    }

    /**
     * set user's request login data before send to server.
     */
    this.f_setLogin = function(u, p, cb)
    {
        thisObj.m_guiCb = cb;
        thisObj.m_loginUser = new FT_userRecObj(u, null, null, p, null, null, null, null);

        switch(u)
        {
            case 'admin':
                thisObj.m_loginUser.m_role = thisObj.V_ROLE_ADMIN;
                break;
            case 'installer':
                thisObj.m_loginUser.m_role = thisObj.V_ROLE_INSTALL;
                break;
            default:
                thisObj.m_loginUser.m_role = thisObj.V_ROLE_USER;
        }
    }

    /**
     * call this fuction to find out is current user login.
     */
    this.f_isLogin = function()
    {
        return g_cookie.f_get(g_consObj.V_COOKIES_USER_ID) ==
                              g_consObj.V_NOT_FOUND ? false : true;
    }

    this.f_getUserListFromServer = function(guiCb)
    {
        this.m_guiCb = guiCb;
        var xmlstr = 'open-app user list';
        thisObj.m_busObj.f_sendRequest(xmlstr, thisObj.f_respondRequestCallback);
    }
    /**
     * set user record to server.
     * To set username, last, first, pw to server. Use userObj.m_type to
     * specify the operation to be exceuted.
     */
    this.f_setUser = function(userRec, guiCb)
    {
        thisObj.m_guiCb = guiCb;
        var ur = userRec;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<open-app user add '" + userRec.type + "' ";

        if(ur.m_user != undefined && ur.m_user.length > 0)
            xmlstr += "username '" + ur.m_user + "' ";
        if(ur.m_last != undefined && ur.m_last.length > 0)
            xmlstr += "last '" + ur.m_last + "' ";
        if(ur.m_first != undefined && ur.m_first.length > 0)
            xmlstr += "first '" + ur.m_first + "' ";
        if(ur.m_password != undefined && ur.m_password.length > 0)
            xmlstr += "password '" + ur.m_password+ "' ";
        if(ur.m_email != undefined && ur.m_email.length > 0)
            xmlstr += "email '" + ur.m_email+ "' ";


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

    this.f_deleteUser = function(user, guiCb)
    {
        thisObj.m_guiCb = guiCb;
        var xmlstr = 'open-app user delete ' + user;
        thisObj.m_busObj.f_sendRequest(xmlstr, thisObj.f_respondRequestCallback);
    }

    this.f_parseUserResponse = function(user)
    {
        var ul = [];
        for(var i=0; i<user.length; i++)
        {
            ul[i] = new FT_userRecObj(user[i].getAttribute('user'));

            for(var j=0; j<user[i].childNodes.length; j++)
            {
                if(user[i].childNodes[j].nodeName == 'email')
                    ul[i].m_email = user[i].childNodes[j].firstChild.nodeValue;

                if(user[i].childNodes[j].nodeName == 'role')
                    ul[i].m_role = user[i].childNodes[j].firstChild.nodeValue;

                if(user[i].childNodes[j].nodeName == 'right')
                    ul[i].m_right = user[i].childNodes[j].firstChild.nodeValue;

                if(user[i].childNodes[j].nodeName == 'name')
                    ul[i].f_setUserName(user[i].childNodes[j]);
            }
        }

        for(var i=0; i<10; i++)
        {
            ul[i] = new FT_userRecObj('user'+i, 'last'+i, 'first'+i,
                      'pw'+i, 'role'+i, 'type'+i, 'kevin.choi@vyatta.com', 'right');
        }
        return ul;
    }
}