/*
    Document   : ft_userBusObj.js
    Created on : Feb 26, 2009, 3:19:25 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_userRecObj(user, last, first, pw, role, type, email, right, newPw)
{
    this.m_user = user;    // login username
    this.m_last = last;
    this.m_first = first;
    this.m_email = email;
    this.m_pw = pw;         // old or current pw
    this.m_newPw = newPw;   // new pw to be changed
    this.m_role = role; // user role: admin=0, installer=1, user=2
    this.m_rights = right; // an array of unique vm id
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

    this.f_setUserRight = function(nodeValue)
    {
        if(nodeValue == undefined) return;

        if(this.m_rights == undefined)
            this.m_rights = [];

        this.m_rights[this.m_rights.length] = nodeValue;
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

                // if reqeust is login request, we need to get user role for
                // this login user before we call the guicb.
                if(thisObj.m_lastCmdSent.indexOf('<auth>') >= 0)
                {
                    g_utils.f_saveUserLoginId(thisObj.m_sid);
                    thisObj.f_getUserFromServer(thisObj.m_loginUser.m_user, thisObj.m_guiCb);
                }
                else
                {
                    // if request is 'get user list', need to update the login
                    // user's role from userList
                    if(thisObj.m_lastCmdSent.indexOf('open-app user list'))
                        thisObj.f_updateLoginUserRole();

                    /////////////////////////////////////////
                    // create an event then send back to ui
                    if(noUICallback == undefined || !noUICallback)
                    {
                        var evt = new FT_eventObj(0, thisObj, undefined);
                        thisObj.m_guiCb(evt);
                    }
                }
            }
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
        // need to remove all cookies
        g_cookie.f_remove_all();
        g_utils.f_gotoHomePage();
    }

    /**
     * set user's request login data before send to server.
     */
    this.f_setLogin = function(u, p, cb)
    {
        if(cb != undefined)
            thisObj.m_guiCb = cb;

        thisObj.m_loginUser = new FT_userRecObj(u, null, null, p, null, null, null, null);
        thisObj.f_setUserRole(u);
    }

    this.f_setUserRole = function(role)
    {
        switch(role)
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
     */
    this.f_getUserRoleFromServer = function(guiCb)
    {
        thisObj.f_getUserListFromServer(guiCb);
    }

    /**
     * update current login user's role from user list.
     */
    this.f_updateLoginUserRole = function()
    {
        // walk through the user list and find the current login user role,
        // then update it.
        var ul = thisObj.m_userList;
        if(ul == undefined) return;
        for(var i=0; i<ul.length; i++)
        {
            if(ul[i].m_user == thisObj.m_loginUser.m_user)
            {
                thisObj.f_setUserRole(thisObj.m_userList[i].m_role);
                break;
            }
        }
    }

    /**
     * call this fuction to find out is current user login.
     */
    this.f_isLogin = function()
    {
        var isLogin = g_cookie.f_get(g_consObj.V_COOKIES_USER_ID) ==
                              g_consObj.V_NOT_FOUND ? false : true;

        if(isLogin)
        {
            var name = g_cookie.f_get(g_consObj.V_COOKIES_USER_NAME);
            this.f_setLogin(name, null, undefined);
        }

        return isLogin;
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
        // if the login user is USER_ROLE, they only can change their own profile
        if(this.m_loginUser.m_role == thisObj.V_ROLE_USER)
        {
            if(this.m_loginUser.m_user == username)
                return true;
            else
                return false;
        }
        else if(this.m_userList != undefined && this.m_userList.length > 0)
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
     * add userRec to server
     * To set username, last, first, pw to server. Use userObj.m_type to
     * specify the operation to be exceuted.
     * @param userRec - user record to be add to server
     * @param guiCb - gui callback function
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
        xmlstr += "' email '" + ur.m_email + "' ";
        if(ur.m_right != null) {
            xmlstr += "rights '" + ur.m_rights + "' ";
        } else {
            xmlstr += "rights 'none' ";
        }
        if(ur.m_role != null)
            xmlstr += "role '" + ur.m_role + "'";

        xmlstr += "</statement></command>";
        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_modifyUserRight = function(userRightCmd, guiCb)
    {
        var r = userRightCmd;
        if(r == undefined || r.length == 0) return;

        thisObj.m_guiCb = guiCb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>";

        for(var i=0; i<r.length; i++)
            xmlstr += "<statement>open-app user " + r[i] + "</statement>\n";

        xmlstr += "</command>";
        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_modifyUser = function(userRec, guiCb)
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

        if(ur.m_last != undefined && ur.m_last.length > 0)
            xmlstr += "last '" + ur.m_last + "' ";
        if(ur.m_first != undefined && ur.m_first.length > 0)
            xmlstr += "first '" + ur.m_first + "' ";
        if(ur.m_email != undefined && ur.m_email.length > 0)
            xmlstr += "email '" + ur.m_email + "' ";
        if(ur.m_rights != undefined && ur.m_email.length > 0)
            xmlstr += "rights '" + ur.m_rights + "' ";
        if(ur.m_role != undefined && ur.m_role.llength > 0)
            xmlstr += "role '" + ur.m_role + "'";

        xmlstr += "</statement></command>";
        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_modifyUserPassword = function(userRec, guiCb)
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

        if(ur.m_newPw != undefined && ur.m_newPw.length > 0)
            xmlstr += "password '" + ur.m_newPw + "' ";
        if(ur.m_pw != undefined && ur.m_pw.length > 0)
            xmlstr += "oldpassword '" + ur.m_pw + "' ";

        xmlstr += "</statement></command>";
        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_resetUserPassword = function(userRec, guiCb)
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
                    "open-app user modify '" + ur.m_user + "' " +
                    "password reset</statement></command>";

        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    /**
     * get a user profile by username.
     * @param userName - a username of profile to be returned. if user == null,
     *                entire list of user profile return.
     * @param guiCb - gui callback function
     */
    this.f_getUserFromServer = function(userName, guiCb)
    {
        this.m_guiCb = guiCb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement>" +
                      "open-app user list '" + userName + "'</statement></command>";

        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
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

    this.f_isDeletableUser = function(role)
    {
        switch(role)
        {
            case 'admin':
            case 'installer':
            default:
                return false;
            case 'user':
            case 'User':
                return true;
        }
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
                    var cNode = val.childNodes[j];
                    if(cNode == undefined) continue;

                    if(cNode.nodeName == 'email' &&
                        cNode.firstChild != undefined)
                        ul[c].m_email = cNode.firstChild.nodeValue;
                    else if(cNode.nodeName == 'role' &&
                        cNode.firstChild != undefined)
                        ul[c].m_role = cNode.firstChild.nodeValue;
                    else if(cNode.nodeName == 'rights' &&
                        cNode.firstChild != undefined)
                        ul[c].f_setUserRight(cNode.firstChild.nodeValue);
                    else if(cNode.nodeName == 'name')
                        ul[c].f_setUserName(cNode);
                }
                c++;
            }
        }

        return ul;
    }
}
