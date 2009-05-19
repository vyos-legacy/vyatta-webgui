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
    thisObj.m_request = createXMLHttpRequest();
    var m_vpnObj = null;
    var m_fwObj = null;


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

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    // firewall security level section
    this.f_getFWObject = function()
    {
        if(m_fwObj == null)
            m_fwObj = new UTM_firewallBusObj(thisObj);

        return m_fwObj;
    }

    this.f_getFirewallSecurityLevel = function(guicb)
    {
        thisObj.f_getFWObject().f_getFirewallSecurityLevel(guicb);
    }

    this.f_setFirewallSecurityLevel = function(fireRec, guicb)
    {
        thisObj.f_getFWObject().f_setFirewallSecurityLevel(fireRec, guicb);
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
    this.f_vpnGetSite2SiteEasyConfig = function(guicb)
    {
        thisObj.f_getVPNObject().f_getSite2SiteConfig('easy', guicb);
    }

    /**
     * set vpn site2site easy mode configuration fields
     */
    this.f_vpnSetSite2SiteEasyConfig = function(vpnRec, guicb)
    {
        thisObj.f_getVPNObject().f_setSite2SiteConfig(vpnRec, 'easy', guicb);
    }

    /**
     * get vpn site2site export mode configurations
     */
    this.f_vpnGetSite2SiteExportConfig = function(guicb)
    {
        thisObj.f_getVPNObject().f_getSite2SiteConfig('expert', guicb);
    }

    /**
     * set vpn site2site export mode configuration fields
     */
    this.f_vpnSetSite2SiteExportConfig = function(vpnRec, guicb)
    {
        thisObj.f_getVPNObject().f_setSite2SiteConfig(vpnRec, 'expert', guicb);
    }
}

///////////////////////////////////////////////
// new UTM_businessLayout object
g_busObj = new UTM_businessLayer();