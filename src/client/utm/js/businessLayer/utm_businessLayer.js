/*
    Document   : utm_businessLayers.js
    Created on : Apr 01, 2009, 11:08:28 AM
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
// a UTM business object. This object acts as a core interface to the server
// and GUI layer. It does all the logic works for the GUI.
function UTM_businessLayer()
{
    //////////////////////////////
    // properties
    var thisObj = this;
    var m_vpnObj = null;
    var m_fwObj = null;
    var m_nwObj = null;   // network config business obj for NAT/PAT and Routing
	var m_urlObj = null;
	var m_nwDNSObj = null;
	var m_nwPortConfigObj = null;
	var m_nwIfObj = null;   //interface config biz obj
    this.m_userObj = new UTM_userBusObj(this);
	thisObj.m_request = createXMLHttpRequest();

    /**
     * send request to server. All server get must call this function.
     * @param content - content to be sent (w/o xml header)
     * @param callback - a callback function to be called upon respond
     */
    this.f_sendRequest = function(content, callback)
    {
        var r = this.m_request;

        var sid = g_utils.f_getUserLoginedID();
        var cmdSend = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
                       "<openappliance><command><id>" + sid + "</id>" +
                        content + "</command></openappliance>\n";
        var innerCB = callback;
        var requestCB = function(resp)
        {
            innerCB(resp, cmdSend);
        }

        r.open('POST', '/utm/cgi-bin/webgui-wrap', true);
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
            } else if (r.status == 404) { //assuming  timeout on dom0. dom0 stop proxy the request.
                thisObj.f_userTimeout();
			}
        }

        return null;
    }

	/*
    this.f_send302Request = function(content)
    {
        var r = this.m_request;

        var cmdSend = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                       + "<openappliance>" + content + "</openappliance>\n";

        var requestCB = function(resp)
        {
            //innerCB(resp, cmdSend);
            if(r.readyState == 4)
            {
                if(r.status == 200)
                {
				    alert('200');
					if (r.responseXML) {
						alert('response is XML');
					} else {
						alert(r.responseText);
					}
                } else if (r.status == 404) { //assuming  timeout on dom0. dom0 stop proxy the request.
                    alert('404');
			    } else if (r.status == 201) {
				    alert('4.201');
			    } else if (r.status == 302) {
				    alert('4.302');
			    }
            }
        }

        r.open('GET', '/utm/cgi-bin/302.pl', true);
        r.onreadystatechange = requestCB;
        r.send(cmdSend);

        return cmdSend;
    }

    this.f_respond302RequestCallback = function(resp, cmdSent, noUICallback)
    {
        var response = this.f_getRequestResponse(this.m_request);
        return null;
    }
    */

    /**
     * start a thread run in background to pull vpn overview requests. call this function
     * if you wish to continue getting vpn overview request.
     * NOTE: must call f_stopVPNRequestThread to stop this thread.
     *       is not recommand to call from outside of business layer.
     * @param cb - gui callback function. Thread will call this function
     *              for response data.
     * @return thread unique id. use this id to stop the thread
     */
    this.f_startVPNRequestThread = function(cb)
    {
        // create a new thread object
        thisObj.m_reqThread = new UTM_thread(g_nwConfig.m_domURefreshTime);

        var guiCb = cb;
        var callback = function()
        {
            thisObj.f_vpnGetSite2SiteConfigData(guiCb);
        }

        // start to run
        var threadId = thisObj.m_reqThread.f_start(callback);

        thisObj.f_vpnGetSite2SiteConfigData(guiCb);
        return threadId;
    }
    /**
     * stop VM request thread run in background and destroy the thread
     */
    this.f_stopVPNRequestThread = function(threadId)
    {
        if(threadId != null)
            thisObj.m_reqThread.f_stop(threadId);
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
                var cns = response[i].childNodes;

                for(var j=0; j<cns.length; j++)
                {
                    var cn = cns[j];
                    if(cn.nodeName == node)
                        return cn.childNodes;
                }
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

        return new UTM_eventObj(errCode, '', errmsg);
    }

    this.f_discardConfiguration = function(cb)
    {
        this.f_cancelFirewallCustomizeRule("customize-firewall", cb);
    }

    this.f_saveConfiguration = function(cb)
    {
        this.f_saveFirewallCustomizeRule("customize-firewall", cb);
    }

    this.f_getFormErrMsg = function(form)
	{
		var errmsgNode = g_utils.f_xmlGetChildNode(form, 'errmsg');
		if (errmsgNode == null) return null;

		return g_utils.f_xmlGetNodeValue(errmsgNode);
	}

    this.f_getFormNode = function(response)
	{
		var msgNode = g_utils.f_xmlGetChildNode(response[0], 'msg');
		return g_utils.f_xmlGetChildNode(msgNode, 'form');
	}

    this.f_getFormError = function(response)
	{
		var cn = response[0].childNodes;
		for (var i=0; i< cn.length; i++) {
			if (cn[i].nodeName == 'msg') {
				var node = cn[i].childNodes;
				for (var j=0; j < node.length; j++) {
					if (node != undefined && node[j] != undefined && node[j].nodeName == 'form') {
						var errCode = node[j].getAttribute('code');
						if (errCode==0) { //success case
						    return null;
						} else {
                            var errMsg = thisObj.f_getFormErrMsg(node[j]);
                            return (new UTM_eventObj(errCode, null, errMsg));
						}
					}
				}
			}
		}
		return null;
	}

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    // user management
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

    this.f_userLogout = function(guiCb)
    {
        thisObj.m_userObj.f_logout(guiCb);
    }

    this.f_userTimeout = function(guiCb)
    {
        thisObj.m_userObj.f_timeout(guiCb);
		if ((window.parent != undefined) && (window.parent != null)) {
			if (window.parent.f_timeout != undefined) {
				window.parent.f_timeout();
			}
		}
    }

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    // firewall security level section
    this.f_getFWObject = function()
    {
        if(m_fwObj == null)
            m_fwObj = new UTM_firewallBusObj(thisObj);

        return m_fwObj;
    }

    this.f_getFirewallZoneMgmtNextRuleNo = function(zonepair, guicb)
    {
        thisObj.f_getFWObject().f_getFirewallZoneMgmtNextRuleNo(zonepair, guicb);
    }
    this.f_getFirewallZoneMgmtList = function(guicb)
    {
        thisObj.f_getFWObject().f_getFirewallZoneMgmtList(guicb);
    }
    this.f_setFirewallZoneMgmtDescription = function(rec, guicb)
    {
        thisObj.f_getFWObject().f_setFirewallZoneMgmtDescription(rec, guicb);
    }
    this.f_setFirewallZoneMgmtInterface = function(rec, cmd, interf, guicb)
    {
        thisObj.f_getFWObject().f_setFirewallZoneMgmtInterface(rec,cmd, interf, guicb);
    }
    this.f_saveFirewallZoneMgmt = function(handler, guicb)
    {
        thisObj.f_getFWObject().f_saveFirewallInput(handler, guicb);
    }
    this.f_cancelFireallZoneMgmt = function(handler, cb)
    {
        thisObj.f_getFWObject().f_cancelFirewallInput(handler, cb);
    }

    this.f_getFirewallZoneMemberAvailable = function(zoneRec, guicb)
    {
        thisObj.f_getFWObject().f_getFirewallZoneMemberAvailable(zoneRec,guicb);
    }

    this.f_getFirewallSecurityLevel = function(zonepair, guicb)
    {
        thisObj.f_getFWObject().f_getFirewallSecurityLevel(zonepair, guicb);
    }

    /**
     * @param fireRec - firewall record object
     * @param guicb - gui callback function
     */
    this.f_setFirewallSecurityLevel = function(fireRec, guicb)
    {
        thisObj.f_getFWObject().f_setFirewallSecurityLevel(fireRec, guicb);
    }

    this.f_getFirewallSecurityCustomize = function(zone, guicb)
    {
        thisObj.f_getFWObject().f_getFirewallSecurityCustomize(zone, guicb);
    }

    this.f_setFirewallCustomizeOrder = function(fireRec, order, guicb)
    {
        thisObj.f_getFWObject().f_setFirewallCustomizeOrder(fireRec, order, guicb);
    }

    this.f_setFirewallCustomize = function(fireRec, name, value, guicb)
    {
        thisObj.f_getFWObject().f_setFirewallCustomize(fireRec, name, value, guicb);
    }

    this.f_saveFirewallCustomizeRule = function(handler, guicb)
    {
        thisObj.f_getFWObject().f_saveFirewallInput(handler, guicb);
    }

    this.f_resetFirewallCustomizeRule = function(fireRec, guicb)
    {
        thisObj.f_getFWObject().f_resetFirewallCustomizeRule(fireRec, guicb);
    }

    this.f_deleteFirewallCustomizeRule = function(fireRec, guicb)
    {
        thisObj.f_getFWObject().f_deleteFirewallCustomizeRule(fireRec, guicb);
    }

    this.f_cancelFirewallCustomizeRule = function(handler, guicb)
    {
        thisObj.f_getFWObject().f_cancelFirewallInput(handler, guicb);
    }

    /**
     * @param type - 'cancel' to cancel already setted customize rules
     *               'save' to save all the setted customize rules
     * @param guicb - gui callbackk function
     */
    this.f_sendFirewallCustomizeRuleCmd = function(type, guicb)
    {
        thisObj.f_getFWObject().f_sendFirewallCustomizeRuleCmd(type, guicb);
    }

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    // vpn section
    this.f_getVPNObject = function()
    {
        if(m_vpnObj == null)
            m_vpnObj = new UTM_vpnBusObj(thisObj);

        return m_vpnObj;
    }

    /**
     * get vpn site2site easy mode configurations
     */
    this.f_vpnGetSite2SiteConfigData = function(guicb)
    {
        thisObj.f_getVPNObject().f_getSite2SiteData(guicb);
    }


    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    // url filtering section
	this.f_getUrlFilterObj = function()
    {
        if(m_urlObj == null)
            m_urlObj = new UTM_urlFilterBusObj(thisObj);

        return m_urlObj;
    }

    this.f_getUrlFilterConfig = function(guicb)
    {
        thisObj.f_getUrlFilterObj().f_getUrlFilterConfig(guicb);
    }

    this.f_setUrlFilterConfig = function(ufcObj, guicb)
    {
        thisObj.f_getUrlFilterObj().f_setUrlFilterConfig(ufcObj, guicb);
    }

    this.f_getUrlList = function(guicb)
    {
        thisObj.f_getUrlFilterObj().f_getUrlList(guicb);
    }

    this.f_setUrlList = function(urlList, guicb)
    {
        thisObj.f_getUrlFilterObj().f_setUrlList(urlList, guicb);
    }


    this.f_getKeywordList = function(guicb)
    {
        thisObj.f_getUrlFilterObj().f_getKeywordList(guicb);
    }

    this.f_setKeywordList = function(kwList, guicb)
    {
        thisObj.f_getUrlFilterObj().f_setKeywordList(kwList, guicb);
    }

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    // DNS section
	this.f_getDNSObj = function()
    {
        if(m_nwDNSObj == null)
            m_nwDNSObj = new UTM_nwDNSBusObj(thisObj);

        return m_nwDNSObj;
    }

    this.f_getDNSConfig = function(guicb)
    {
        thisObj.f_getDNSObj().f_getDNSConfig(guicb);
    }

    this.f_setDNSConfig = function(dnsRecObj, guicb)
    {
        thisObj.f_getDNSObj().f_setDNSConfig(dnsRecObj, guicb);
    }

    ////////////////////////////////////////////////////////////////////////////
    // Network NAT/PAT and Routing
    this.f_getNwObject = function()
    {
        if(m_nwObj == null)
            m_nwObj = new UTM_nwConfigBusObj(thisObj);

        return m_nwObj;
    }

    this.f_getNatPatNextRuleNo = function(guicb)
    {
        thisObj.f_getNwObject().f_getNatPatNextRuleNo(guicb);
    }

    this.f_getNatPatConfigurations = function(rec, guicb)
    {
        this.f_getNwObject().f_getNatPath(rec, guicb);
    }

    this.f_setNatPatNamePairValue = function(rec, name, value, guicb)
    {
        this.f_getNwObject().f_setNatPatNamePairValue(rec, name, value, guicb);
    }

    this.f_saveNatPatConfiguration = function(guicb)
    {
        this.f_getNwObject().f_saveNatPat(guicb);
    }

    this.f_cancelNatPatConfiguration = function(guicb)
    {
        this.f_getNwObject().f_cancelNatPat(guicb);
    }

    this.f_deleteNatPatConfiguration = function(rec, guicb)
    {
        this.f_getNwObject().f_deleteNatPat(rec, guicb);
    }
    /**
     *
     */
    this.f_getNwRoutingList = function(guicb)
    {
        thisObj.f_getNwObject().f_getNwRoutingList(guicb);
    }

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    // Port config section
	this.f_getPortConfigObj = function()
    {
        if(m_nwPortConfigObj == null)
            m_nwPortConfigObj = new UTM_nwPortConfigBusObj(thisObj);

        return m_nwPortConfigObj;
    }

    this.f_getPortConfig = function(guicb)
    {
        thisObj.f_getPortConfigObj().f_getPortConfig(guicb);
    }

    this.f_setPortConfig = function(portConfigList, guicb)
    {
        thisObj.f_getPortConfigObj().f_setPortConfig(portConfigList, guicb);
    }

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    // Interface config section
	this.f_getNwIfObj = function()
    {
        if(m_nwIfObj == null)
            m_nwIfObj = new UTM_nwIfBusObj(thisObj);

        return m_nwIfObj;
    }

    this.f_getIfConfig = function(ifName, guicb)
    {
        thisObj.f_getNwIfObj().f_getIfConfig(ifName, guicb);
    }

    this.f_getDhcpConfig = function(ifName, guicb)
    {
        thisObj.f_getNwIfObj().f_getDhcpConfig(ifName, guicb);
    }

    this.f_getDhcpMap = function(ifName, guicb)
    {
        thisObj.f_getNwIfObj().f_getDhcpMap(ifName, guicb);
    }

    this.f_setIfConfig = function(ifConfigObj, guicb)
    {
        thisObj.f_getNwIfObj().f_setIfConfig(ifConfigObj, guicb);
    }

    this.f_setDhcpConfig = function(dhcpConfigObj, guicb)
	{
        thisObj.f_getNwIfObj().f_setDhcpConfig(dhcpConfigObj, guicb);
	}

    this.f_setDhcpMap = function(dhcpMap, guicb)
	{
        thisObj.f_getNwIfObj().f_setDhcpMap(dhcpMap, guicb);
	}
}

///////////////////////////////////////////////
// new UTM_businessLayout object
g_busObj = new UTM_businessLayer();