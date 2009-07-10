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
    this.m_backup = new FT_backupObj(this);
    this.m_oaConfig = new FT_oaConfigObj(this);

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
                       + "<openappliance>" + content + "</openappliance>\n";
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
        var errSid = '';
		
        var err = response.getElementsByTagName('error');
        if(err != null && err[0] != null)
        {
            var cn = err[0].childNodes;
            for(var i=0; i<cn.length; i++)
            {
                if (cn[i].nodeName == 'code')
                {
                    errCode = Number(cn[i].firstChild.nodeValue);
                    if (errCode == 8)
                    {
			            var sid = response.getElementsByTagName('id');
                        if (sid != undefined && sid[0] != undefined)
                        {
                            errSid = sid[0].firstChild.nodeValue;
			             }
                    }
                    else if(errCode == 3) {
						thisObj.f_userTimeout();
					} //handle in confBaseObj
		        } 
                else if (cn[i].nodeName == 'msg' && errCode != 0)
                {
                    errmsg = cn[i].firstChild.nodeValue;
		        }
            }
        }

        if(promptErrMsg && errmsg.length > 0)
        {
            // prompt msg here...

        }
        
		var rvalue = new FT_eventObj(errCode, '', errmsg);
		if (errSid.length > 0) {
			rvalue.m_sid = errSid;
		}
        return rvalue;
    }

    /**
     * get child nodes of 'node' from 'response'
     * @param response - a response data from server
     * @param node - a node name of the child nodes to be returned
     */
    this.f_getResponseChildNodes = function(response, node)
    {
        if(response != undefined && response.length != undefined)
        {
            for(var i=0; i<response.length; i++)
            {
                var cn = response[i].childNodes;

                if(cn.nodeName == node)
                    return cn.childNodes;
            }
        }

        return null;
    }

    ////////////////////////////////////////////////////
    // functions for public
    // ////////////////////////////////////////////////////
    //
    /**
     */
    this.f_sentChuckerRequest = function(requestStr, guiCb)
    {

    }


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
        var xmlstr = '<openappliance><auth><user>' + username + '</user>\n' +
                      '<pswd><![CDATA[' + pw +
                      ']]></pswd></auth></openappliance>\n';
        thisObj.m_userObj.m_lastCmdSent = xmlstr;

        return this.f_sendRequest(xmlstr, this.m_userObj.f_respondRequestCallback);
    }
	
	
	this.f_discard = function()
	{
        var sid = g_utils.f_getUserLoginedID();		
        var xmlstr = "<command><id>" + sid + "</id>" +
                     "<statement mode='conf'>discard" + "</statement></command>";
        var f = function(resp, cmdSent, noUICallback) {
            var response = thisObj.f_getRequestResponse(thisObj.m_request);

            if (response == null) {
				return;
			}

            if(response.f_isError != null)
            {
                return;
            }
            else
            {
                var sid = response.getElementsByTagName('id');
                if(sid != undefined && sid[0] != undefined)
                    thisObj.m_sid = sid[0].firstChild.nodeValue;

                var err = response.getElementsByTagName('error');
                if(err != null && err[0] != null)
                {
                    return;
                }
            }			
		}; 
        return this.f_sendRequest(xmlstr, f);		
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

    this.f_getUserRecByUserName = function(username)
    {
        return this.m_userObj.f_getUserRecByUserName(username);
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

    this.f_modifyUserPassword = function(userRec, guiCb)
    {
        thisObj.m_userObj.f_modifyUserPassword(userRec, guiCb);
    }

    this.f_resetUserPassword = function(userRec, guiCb)
    {
       thisObj.m_userObj.f_resetUserPassword(userRec, guiCb);
    }

    this.f_modifyUserRightToServer = function(userRightCmd, guiCb)
    {
        thisObj.m_userObj.f_modifyUserRight(userRightCmd, guiCb);
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

    this.f_isDeletableUser = function(role)
    {
        return thisObj.m_userObj.f_isDeletableUser(role);
    }

    /**
     * logout the system.
     * Logout will remove all the cookies, including the selection path
     */
    this.f_userLogout = function(guiCb)
    {
        thisObj.m_userObj.f_logout(guiCb);
    }

    /**
     * timeout the system.
     * Timeout will remove all the cookies, except the selection path
     */
    this.f_userTimeout = function(guiCb)
    {
        thisObj.m_userObj.f_timeout(guiCb);
    } 

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    // VM session start here.....
    ////////////////////////////////////////////////////////////////////////////
    // VM supported functions:
    // f_getVMSummaryDataFromServer() - get only the vm name and number of vms for current logon user.
    // f_getVMDataFromServer()

    /**
     */
    this.f_getVmObj = function()
    {
        return this.m_vm;
    }

    /**
     * return a list of vm record object from cache
     */
    this.f_getVmRecObj = function()
    {
        return this.m_vm.m_vmRecObj;
    }

    /**
     * return a vm record object from cache by given a vm id
     * @param id - vm id
     */
    this.f_getVmRecByVmId = function(id)
    {
        return this.m_vm.f_getVMRecObjByVMId(id);
    }

    /**
     * Call backend api -- <open-app vm list>
     * GUI layer call this function handle the top level tabs.
     * call this to get summary VM data, such as number
     * of vm, vm id, vm name etc....
     * @param cb - callback function to be called when data is ready.
     *            ex. cb(responseObj) where responseObj is FT_eventObj;
     */
    this.f_getVMSummaryDataFromServer = function(cb)
    {
        thisObj.m_vm.f_getSummaryVMListFromServer(cb);
    }

    /**
     * Call backend api -- <open-app vm status>
     * GUI layer simple call this function to get details VM data.
     * @param callback - a callback function to be called
     *          when data is ready.
     *          ex. callback(responseObj); where responseObj is FT_eventObj;
     */
    this.f_getVMDataFromServer = function(callback)
    {
        thisObj.m_vm.f_getVMStatusFromServer(callback);
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
        thisObj.m_reqThread = new FT_thread(g_oaConfig.m_oaRefreshTime);

        var guiCb = cb;
        var callback = function()
        {
            thisObj.f_getVMDataFromServer(guiCb);
        }

        // start to run
        var threadId = thisObj.m_reqThread.f_start(callback);

        thisObj.f_getVMDataFromServer(guiCb);
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

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    // VM start/stop/restart session start here.....
    /**
     * stop specific VM request
     * @param vmId - vm id
     * @param guiCb - gui callback function
     */
    this.f_stopVM = function(vmId, guiCb)
    {
        thisObj.m_vm.setVmStartStopRequest(vmId, 'stop', guiCb);
    }
    /**
     * start VM request
     */
    this.f_startVM = function(vmId, guiCb)
    {
          thisObj.m_vm.setVmStartStopRequest(vmId, 'start', guiCb);
    }
    /**
     * restart VM request
     */
    this.f_restartVM = function(vmId, guiCb)
    {
        thisObj.m_vm.setVmStartStopRequest(vmId, 'restart', guiCb);
    }

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    // VM update/deploy session start here.....
    /**
     * to get a list of vm deploy list from server
     * @param guiCb - gui callback funtion
     * @param withThread - true to run the thread
     * @return thread id if withThread is true, else null
     */
    this.f_getVMUpdateListFromServer = function(guiCb, withThread)
    {
        var threadId = null;

        if(withThread != undefined && withThread)
        {
            // create a new thread object
            thisObj.m_reqThread = new FT_thread(g_oaConfig.m_oaRefreshTime);

            var cb = guiCb;
            var callback = function()
            {
                thisObj.m_vm.f_getVMUpdateListFromServer(cb);
            }

            // start to run
            threadId = thisObj.m_reqThread.f_start(callback);
        }

        thisObj.m_vm.f_getVMUpdateListFromServer(cb);
        return threadId;
    }

    this.f_stopGetVMUpdateListFromServerThread = function(threadId)
    {
        if(threadId != null)
            thisObj.m_reqThread.f_stop(threadId);
    }

    /**
     * Cancel a vm update scheduled
     * @param vmId - vm id of a scheduled upgrade
     * @param guiCb - callback function
     */
    this.f_cancelVMDeploy = function(vmId, guiCb)
    {
        thisObj.m_vm.f_cancelVMDeploy(vmId, guiCb);
    }

    this.f_getVMDeployRecObjByVMId = function(vmId)
    {
        return thisObj.m_vm.f_getVMDeployRecObjByVMId(vmId);
    }

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    // hw monitor session start here.....
    /**
     * start a thread run in background to pull HW monitor requests. call this function
     * if you wish to continue getting VM request from background.
     * NOTE: must call f_stopHWMonitorRequestThread to stop this thread.
     *       is not recommand to call from outside of business layer.
     * @param cb - gui callback function. Thread will call this function
     *              for response data.
     * @return thread unique id. use this id to stop the thread
     */
    this.f_startHWMonitorRequestThread = function(cb)
    {
        // create a new thread object
        thisObj.m_reqThread = new FT_thread(g_oaConfig.m_oaRefreshTime);

        var guiCb = cb;
        var callback = function()
        {
            thisObj.f_getHWMonitorFromServer(guiCb);
        }

        // start to run
        var threadId = thisObj.m_reqThread.f_start(callback);

        thisObj.f_getHWMonitorFromServer(guiCb);
        return threadId;
    }
    /**
     * stop VM request thread run in background and destroy the thread
     */
    this.f_stopHWMonitorRequestThread = function(threadId)
    {
        if(threadId != null)
            thisObj.m_reqThread.f_stop(threadId);
    }

    this.f_getHWMonitorFromServer = function(guiCb)
    {
        thisObj.m_vm.f_getHWMonitorFromServer(guiCb);
    }

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    // backup/restore session start here.....
    this.f_getVMBackupObj = function()
    {
        return thisObj.m_backup;
    }

    /**
     *
     */
    this.f_getVMBackupListFromServer = function(guiCb)
    {
        thisObj.m_backup.f_getVMBackupList(guiCb);
    }

    /**
     *
     */
    this.f_getVMRestoreListFromServer = function(guiCb)
    {
        thisObj.m_backup.f_getVMRestoreList(guiCb);
    }

    /**
     * restore backup file
     * @param vms - list of vms to be restored. ex. [vm1, vm2, vm3,...] array type
     * @param modes - list of back modes. ex. ['config', 'data', 'data'....] array type
     *                this list shoudl sync with vms.
     * @param guiCb - gui callback function
     * @param archiveName - backup archive filename
     */
    this.f_restore = function(vms, modes, archiveName, guiCb)
    {
        thisObj.m_backup.f_backupRestore(vms, modes, "restore", guiCb, archiveName);
    }

    this.f_deleteArchiveFileFromServer = function(arName, arFile, guiCb)
    {
        thisObj.m_backup.f_deleteArchiveFile(arName, arFile, guiCb);
    }

    this.f_downloadArchiveFileFromServer = function(arName, arFile, guiCb)
    {
        thisObj.m_backup.f_loadArchiveFile(arFile, guiCb, 'get');
    }

    this.f_uploadArchiveFileFromServer = function(arName, arFile, guiCb)
    {
        thisObj.m_backup.f_loadArchiveFile(arFile, guiCb, 'put');
    }

    /**
     * backup vm config/data/both
     * @param vms - list of vms to be backup. ex. [vm1, vm2, vm3,...] array type
     * @param modes - list of back modes. ex. ['config', 'data', 'data'....] array type
     *                this list shoudl sync with vms.
     * @param guiCb - gui callback function
     * @param backupTo - "2pc" backup to PC, "OA" or else to backup to oa
     */
    this.f_backup = function(vms, modes, guiCb, backupTo)
    {
        if(backupTo == '2pc')
            thisObj.m_backup.f_backupToPC(vms, modes, guiCb);
        else
            thisObj.m_backup.f_backupRestore(vms, modes, "backup", guiCb);

    }

    this.f_getBackupStatus = function(guiCb)
	{
		thisObj.m_backup.f_getBackupStatus(guiCb);
	}

	/**
	 * upgrade vm, one vm at a time.
	 * @param {Object} vm
	 * @param {Object} ver
	 * @param {Object} time - time is in 'hh:mm dd.mm.yy or 'now'
	 * @param {Object} guiCb
	 */
    this.f_upgradeVm = function(vm, ver, time /*time is in 'hh:mm dd.mm.yy*/, guiCb)
	{
		thisObj.m_vm.f_upgradeVm(vm, ver, time, guiCb);
	}

    this.f_restoreVm = function(vm, ver, guiCb)
	{
		thisObj.m_vm.f_restoreVm(vm, ver, guiCb);
	}
	
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    // oa configuration start here.....
    this.f_getOAConfigObj = function()
    {
        return thisObj.m_oaConfig;
    }	
	
	this.f_getOAConfig = function(guiCb, type) { //smtp | ldap | ntp server | password-policy
		return thisObj.m_oaConfig.f_getConfig(guiCb, type);
	}
	
	this.f_setOAConfig = function(guiCb, obj) {
		return thisObj.m_oaConfig.f_setConfig(guiCb, obj);
	}
	
	this.f_setLDAPlocation = function(guiCb, where) {
		return thisObj.m_oaConfig.f_setLDAPlocation(guiCb, where);
	}	
}

///////////////////////////////////////////////
// new FT_businessLayout object
g_busObj = new FT_businessLayer();

