/*
    Document   : ft_businessLayer.js
    Created on : Feb 26, 2009, 3:19:25 PM
    Author     : Kevin.Choi
    Description:
*/

/**
 * create an XMLHttpRequest object with browser-compatible
 */
function createXMLHttpRequest()
{
    var request = false;
    if(window.XMLHttpRequest) // browser support XMLHttpRequest
    {
        // Mozilla, Safari etc
        if(typeof XMLHttpRequest != undefined)
        {
            try
            {
                request = new XMLHttpRequest();
            }
            catch(e)
            {
                request = false;
            }
        }
    }
    else if(window.ActiveXObject) // browser support activeX object
    {
        //activeX versions to check for in IE
        var activexmodes=["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"]

        for(var i=0; i<activexmodes.length; i++)
        {
            try
            {
                request = new ActiveXObject(activexmodes[i]);
                break;
            }
            catch(e)
            {
                request = false;
            }
        }
    }

    return request;
}

/////////////////////////////////////////////////////////////////////////
function FT_thread(busObj)
{
    this.m_busObj = busObj;
    this.m_isRun = false;

    ////////////////////////////////////////////////////
    this.f_start = function(runFunction)
    {
        if(this.m_timerId != null)
            this.f_stop();

        this.m_isRun = true;
        var timerId = window.setInterval(runFunction, 8000 /* 8 sec */)

        return timerId;
    }

    this.f_stop = function(threadId)
    {
        this.m_isRun = false;
        window.clearInterval(threadId);
    }
}

////////////////////////////////////////////////////////////////////////////////
// an OA business object. This object acts as a core interface to the server
// and GUI layer. It does all the logic works for the GUI.
function FT_businessLayer()
{
    //////////////////////////////
    // properties
    var thisObj = this;
    this.m_request = createXMLHttpRequest();
    this.m_userObj = new FT_userBusObj(this);
    this.m_vm = new FT_vmBusObj(this);

    ///////////////////////////////
    // functions

    /**
     * send request to server. All server get must call this function.
     * @param content - content to be sent (w/o xml header)
     * @param callback - a callback function to be called upon respond
     */
    this.f_sendRequest = function(content, callback)
    {
        var r = this.m_request;

        var cmdSend = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                       + "<vyatta>" + content + "</vyatta>\n";
        var innerCB = callback;
        var requestCB = function(resp)
        {
            innerCB(resp, cmdSend);
        }

        r.open('POST', '/cgi-bin/webgui-oa', true);
        r.onreadystatechange = requestCB;
        r.send(cmdSend);

        return cmdSend;
    }

    /**
     * get the response object from request. It handle all the server error
     * msgs before it hand over the response over if there are any.
     *
     * @return response object.
     */
    this.f_getRequestResponse = function(request)
    {
        var r = request;

        if(r.readyState == 4)
        {
            if(r.status == 200)
            {
                var response = r.responseXML;
                var error = thisObj.f_parseResponseError(response, false);

                if(error.f_isError())
                    response = error;

                return response;
            }
        }

        return null;
    }

    /**
     * parse and handle the respond error from server.
     */
    this.f_parseResponseError = function(response, promptErrMsg)
    {
        var errCode = 0;
        var errmsg = '';

        var err = response.getElementsByTagName('error');
        if(err != null && err[0] != null)
        {
            var cn = err[0].childNodes;
            for(var i=0; i<cn.length; i++)
            {
                if(cn[i].nodeName == 'code')
                    errCode = Number(cn[i].firstChild.nodeValue);
                else if(cn[i].nodeName == 'msg' && errCode != 0)
                    errmsg = cn[i].firstChild.nodeValue;
            }
        }

        if(promptErrMsg && errmsg.length > 0)
        {
            // prompt msg here...

        }

        return new FT_eventObj(errCode, '', errmsg);
    }

    ////////////////////////////////////////////////////
    // functions for public

    ////////////////////////////////////////////////////////////////////////////
    // user management support functions:
    // f_isLogin() - find out if user is login
    // f_userLoginRequest() - user provide username and pw to request login
    // f_userLogout() - user logout.
    // f_getLoginUserObj -
    // f_getUserListFromServer()

    /**
     * check to see if user is login
     */
    this.f_isLogin = function()
    {
        return thisObj.m_userObj.f_isLogin();
    }

    /**
     * user requests a login to server.
     * @param username -
     * @param pw -
     * @param guiCb - business layer call this cb upon completion of
     *                auth from server.
     */
    this.f_userLoginRequest = function(username, pw, guiCb)
    {
        thisObj.m_userObj.f_setLogin(username, pw, guiCb);
        var xmlstr = '<vyatta><auth><user>' + username + '</user>\n' +
                      '<pswd><![CDATA[' + pw +
                      ']]></pswd></auth></vyatta>\n';

        return this.f_sendRequest(xmlstr, this.m_userObj.f_respondRequestCallback);
    }

    /**
     *
     */
    this.f_getLoginUserObj = function()
    {
        return this.m_userObj;
    }

    /**
     *
     */
    this.f_getLoginUserRec = function()
    {
        return this.m_userObj.m_loginUser;
    }

    /**
     * Find the user from the local cache. Returns a user record
     * object that match the username.
     * @return the a FT_userRecObj if username is found in from the local cache
     *          return null if not found.
     */
    this.f_getUserFromLocal = function(username)
    {
        return thisObj.m_userObj.f_getUserFromLocal(username);
    }

    /**
     * retrieve a fresh user list from server.
     */
    this.f_getUserListFromServer = function(guiCb)
    {
        thisObj.m_userObj.f_getUserListFromServer(guiCb);
    }

    /**
     * add new user to server.
     * @param userRec - an FT_userRecObj to be added
     * @param guiCb = callback function
     */
    this.f_addUserToServer = function(userRec, guiCb)
    {
        thisObj.m_userObj.f_setUser(userRec, guiCb);
    }

    /**
     * modify user data.
     * @param userRec - userRecObj. this function modified only the provided
     *                  field specified in the userRecObj.
     *                  etc: if userRecObj.m_email field is specified, then
     *                  only this field will be sent to server for updated.
     * @param guiCb - callback function
     */
    this.f_modifyUserFromServer = function(userRec, guiCb)
    {
        thisObj.m_userObj.f_modifyUser(userRec, guiCb);
    }

    /**
     * delete user from server.
     * @param user - username to be deleted
     * @param guiCb - callback function
     */
    this.f_deleteUserFromServer = function(user, guiCb)
    {
        thisObj.m_userObj.f_deleteUser(user, guiCb);
    }

    /**
     * logout the system.
     */
    this.f_userLogout = function(guiCb)
    {
        thisObj.m_userObj.f_logout(guiCb);
    }

    ////////////////////////////////////////////////////////////////////////////
    // VM supported functions:
    // f_getVMSummaryDataFromServer() - get only the vm name and number of vms for current logon user.
    // f_getVMDataFromServer()

    /**
     * GUI layer call this function to get summary VM data, such as number
     * of vms, vm name.
     * @param cb - callback function to be called when data is ready.
     *            ex. cb(responseObj) where responseObj is FT_eventObj;
     */
    this.f_getVMSummaryDataFromServer = function(cb)
    {
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<vmstatus><id>" + sid + "</id>\n"
                      + "</vmstatus>";

        thisObj.m_vm.m_guiCb = cb;
        //this.f_sendRequest(xmlstr, this.m_vm.f_respondRequestCallback);

        thisObj.m_vm.m_vmRecObj[0] = new FT_vmRecObj('Business Livebox');
        thisObj.m_vm.m_vmRecObj[1] = new FT_vmRecObj('Open Applicance');
        thisObj.m_vm.m_vmRecObj[2] = new FT_vmRecObj('UTM Configuration');
        thisObj.m_vm.m_vmRecObj[3] = new FT_vmRecObj('PBX Configuration');
        //thisObj.m_vm.m_vmRecObj[4] = new FT_vmRecObj('3rd Parties Application');

        var evt = new FT_eventObj(0, thisObj.m_vm.m_vmRecObj, '');
        cb(evt);
    }

    /**
     * GUI layer simple call this function to get details VM data.
     * @param callback - a callback function to be called
     *          when data is ready.
     *          ex. callback(responseObj); where responseObj is FT_eventObj;
     */
    this.f_getVMDataFromServer = function(callback)
    {
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<vmstatus><id>" + sid + "</id>\n"
                      + "</vmstatus>";

        this.m_vm.m_guiCb = callback;
        return this.f_sendRequest(xmlstr, this.m_vm.f_respondRequestCallback);
    }
    /**
     * start a thread run in background to pull VM requests. call this function
     * if you wish to continue getting VM request.
     * NOTE: must call f_stopVMRequestThread to stop this thread.
     *       is not recommand to call from outside of business layer.
     * @param cb - gui callback function. Thread will call this function
     *              for response data.
     * @return thread unique id. use this id to stop the thread
     */
    this.f_startVMRequestThread = function(cb)
    {
        // create a new thread object
        thisObj.m_reqThread = new FT_thread(thisObj);

        var guiCb = cb;
        var callback = function()
        {
            thisObj.f_getVMDataFromServer(guiCb);
        }

        // start to run
        var threadId = thisObj.m_reqThread.f_start(callback);

        return threadId;
    }
    /**
     * stop VM request thread run in background and destroy the thread
     */
    this.f_stopVMRequestThread = function(threadId)
    {
        if(threadId != null)
            thisObj.m_reqThread.f_stop(threadId);
    }
    /**
     * stop VM request
     */
    this.f_stopVM = function(vmName, guiCb)
    {
        var sid = g_utils.f_getUserLoginedID();
        var content = "<command><id>" + sid + "</id>" +
                    "<statement>vm stop '" + vmName + "'</statement></command>";

        return this.f_sendRequest(content, guiCb);
    }
    /**
     * start VM request
     */
    this.f_startVM = function(vmName, guiCb)
    {
          var sid = g_utils.f_getUserLoginedID();
        var content = "<command><id>" + sid + "</id>" +
                    "<statement>vm start '" + vmName + "'</statement></command>";

        return this.f_sendRequest(content, guiCb);
    }
    /**
     * restart VM request
     */
    this.f_restartVM = function(vmName, guiCb)
    {
          var sid = g_utils.f_getUserLoginedID();
        var content = "<command><id>" + sid + "</id>" +
                    "<statement>vm restart '" + vmName + "'</statement></command>";

        return this.f_sendRequest(content, guiCb);
    }

    /**
     *
     */
    this.f_getVMBackupListFromServer = function(guiCb)
    {

    }
}

///////////////////////////////////////////////
// new FT_businessLayout object
g_busObj = new FT_businessLayer();

