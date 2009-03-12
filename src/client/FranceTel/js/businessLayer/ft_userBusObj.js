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

        for(var i=0; i<node.childNodes.length; i++)
        {
            if(node.childNodes[i].nodeName == 'first')
                this.m_first = node.childNodes[i].firstChild.nodeValue;

            if(node.childNodes[i].nodeName == 'last')
                this.m_last = node.childNodes[i].firstChild.nodeValue;
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
    this.m_userList = null;
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
            var sid = response.getElementsByTagName('id');
            if(sid != undefined && sid[0] != undefined)
                thisObj.m_sid = sid[0].firstChild.nodeValue;

            var err = response.getElementsByTagName('error');
            if(err != null && err[0] != null)
            {
                var user = thisObj.f_getUserNodes(err);
                if(user != null)
                    thisObj.m_userList = thisObj.f_parseUserResponse(user);

                /////////////////////////////////////////
                // create an event then send back to ui
                if(noUICallback == undefined || !noUICallback)
                {
                    var evt = new FT_eventObj(0, thisObj, undefined);
                    thisObj.m_guiCb(evt);
                }
            }
/*
            if(cmdSent.indexOf('open-app user add ') > 0)
            {
                /////////////////////////////////////////////////////////////
                // refresh local user list
                sid = g_utils.f_getUserLoginedID();
                var xmlstr = "<command><id>" + sid + "</id><statement mode='op'>" +
                              "open-app user list</statement></command>";

                thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                    thisObj.f_respondRequestCallbackWithoutGIUCB);
            }
            */
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

    this.f_getUserFromLocal = function(username)
    {
        if(this.m_userList != undefined && this.m_userList.length > 0)
        {
            for(var i=0; i<this.m_userList.length; i++)
            {
                var uRec = this.m_userList[i];
                if(uRec.m_user == username)
                    return uRec;
            }
        }

        return null;
    }

    this.f_getUserListFromServer = function(guiCb)
    {
        this.m_guiCb = guiCb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement mode='op'>" +
                      "open-app user list</statement></command>";

        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_isThisUserExist = function(username)
    {
        if(this.m_userList != undefined && this.m_userList.length > 0)
        {
            for(var i=0; i<this.m_userList.length; i++)
            {
                if(this.m_userList[i].m_user == username)
                    return true;
            }
        }

        return false;
    }

    /**
     * set user record to server.
     * To set username, last, first, pw to server. Use userObj.m_type to
     * specify the operation to be exceuted.
     */
    this.f_setUser = function(userRec, guiCb)
    {
        thisObj.m_guiCb = guiCb;

        if(this.f_isThisUserExist(userRec.m_user))
        {
            var evt = new FT_eventObj(9, '', "User already exist");
            guiCb(evt);
            return;
        }

        var ur = userRec;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement>" +
                    "open-app user add '" + ur.m_user;
        xmlstr += "' password '" + ur.m_pw;
        xmlstr += "' last '" + ur.m_last;
        xmlstr += "' first '" + ur.m_first;
        xmlstr += "' email '" + ur.m_email;
        xmlstr += "' rights '" + ur.m_right;
        xmlstr += "' role '" + ur.m_role + "'";

        xmlstr += "</statement></command>";
        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_modifyUser(userRec, guiCb)
    {
        thisObj.m_guiCb = guiCb;

        if(!this.f_isThisUserExist(userRec.m_user))
        {
            var evt = new FT_eventObj(9, '', "User is not existed");
            guiCb(evt);
            return;
        }

        var ur = userRec;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement>" +
                    "open-app user modify '" + ur.m_user + "' ";

        if(ur.m_pw != undefined && ur.m_pw.length > 0)
            xmlstr += "password '" + ur.m_pw + "' ";
        else if(ur.m_last != undefined && ur.m_last.length > 0)
            xmlstr += "last '" + ur.m_last + "' ";
        else if(ur.m_first != undefined && ur.m_first.length > 0)
            xmlstr += "first '" + ur.m_first + "' ";
        else if(ur.m_email != undefined && ur.m_email.length > 0)
            xmlstr += "email '" + ur.m_email + "' ";
        else if(ur.m_right != undefined && ur.m_email.length > 0)
            xmlstr += "rights '" + ur.m_right + "' ";
        else if(ur.m_role != undefined && ur.m_role.llength > 0)
            xmlstr += "role '" + ur.m_role + "'";

        xmlstr += "</statement></command>";
        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
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

    /**
     * delete user from server.
     * @param user - username
     * @param guiCb - callback function
     */
    this.f_deleteUser = function(user, guiCb)
    {
        thisObj.m_guiCb = guiCb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement>" +
                    "open-app user delete '" + user + "'" +
                    "</statement></command>";

        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_getUserNodes = function(error)
    {
        var cn = error[0].childNodes;
        for(var i=0; i<cn.length; i++)
        {
            if(cn[i].nodeName == 'msg')
            {
                var user = cn[i].childNodes;
                for(var j=0; i<user.length; j++)
                {
                    if(user != undefined && user[j] != undefined &&
                        user[j].nodeName == 'user')
                        return user;
                }
            }
        }

        return null;
    }

    this.f_parseUserResponse = function(user)
    {
        var ul = [];
        var c=0;
        for(var i=0; i<user.length; i++)
        {
            var val = user[i];
            if(val.nodeName == 'user')
            {
                ul[c] = new FT_userRecObj(val.getAttribute('name'));

                for(var j=0; j<val.childNodes.length; j++)
                {
                    if(val.childNodes[j].nodeName == 'email' &&
                        val.childNodes[j].firstChild != undefined)
                        ul[c].m_email = val.childNodes[j].firstChild.nodeValue;
                    if(val.childNodes[j].nodeName == 'role' &&
                        val.childNodes[j].firstChild != undefined)
                        ul[c].m_role = val.childNodes[j].firstChild.nodeValue;
                    if(val.childNodes[j].nodeName == 'right' &&
                        val.childNodes[j].firstChild != undefined)
                        ul[c].m_right = val.childNodes[j].firstChild.nodeValue;
                    if(val.childNodes[j].nodeName == 'name')
                        ul[c].f_setUserName(val.childNodes[j]);
                }
                c++;
            }
        }

        return ul;
    }
}