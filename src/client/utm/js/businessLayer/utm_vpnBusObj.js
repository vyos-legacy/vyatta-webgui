/*
    Document   : utm_vpnBusObj.js
    Created on : Apr 01, 2009, 11:21:31 AM
    Author     : Kevin.Choi
    Description:
*/


/**
 * VPN data record
 */
function UTM_vpnRecord()
{
    var thisObj = this;
    this.m_mode = null; // easy or export
    this.m_tunnel = null;
    this.m_peerIp = null;
    this.m_remoteVpnDevice = null;
    this.m_presharedKey = null;
    this.m_localNetwork = null;
    this.m_remoteNetwork = null;
    this.m_type = null;
    this.m_exchange = null;
    this.m_encryption1 = null;
    this.m_auth1 = null;
    this.m_diffieHellmann = null;
    this.m_lifeTime1 = null;
    this.m_pfsGroup = null;
    this.m_lifeTime2 = null;
    this.m_encryption2 = null;
    this.m_auth2 = null;

    this.f_setLocalNetwork = function(ip, prefix)
    {
        thisObj.m_localNetwork = ip + '/' + prefix;
    }

    this.f_getLocalNetworkIp = function()
    {
        var n = thisObj.m_localNetwork.split('/');

        return n[0];
    }

    this.f_getLocalNetworkPrefix = function()
    {
        var n = thisObj.m_localNetwork.split('/');

        return n[1];
    }

    this.f_setRemoteNetwork = function(ip, prefix)
    {
        thisObj.m_remoteNetwork = ip + '/' + prefix;
    }

    this.f_getRemoteNetworkIp = function()
    {
        var n = thisObj.m_remoteNetwork.split('/');

        return n[0];
    }

    this.f_getRemoteNetworkPrefix = function()
    {
        var n = thisObj.m_remoteNetwork.split('/');

        return n[1];
    }
}

/**
 * VPN business object
 */
function UTM_vpnBusObj(busObj)
{
    /////////////////////////////////////
    // properteis
    var thisObj = this;
    this.m_busObj = busObj;
    this.m_lastCmdSent = null;
    this.m_configMode = null; // easy or expert
    this.m_vpnRec = null;

    /**
     * A callback function for request.
     */
    this.f_respondRequestCallback = function()
    {
        var response = thisObj.m_busObj.f_getRequestResponse(
                        thisObj.m_busObj.m_request);

        if(response == null) return;

        if(response.f_isError != undefined)
        {
            thisObj.m_guiCb(response);
        }
        else
        {
            var evt = new FT_eventObj(0, thisObj, '');

            var err = response.getElementsByTagName('error');
            if(err != null && err[0] != null)
            {
                if(thisObj.m_lastCmdSent.indexOf(
                    'get vpn site-to-site easy</statement>') > 0)
                {
                    thisObj.f_parseEasyModeData(err);
                    evt = new UTM_eventObj(0, thisObj.m_vpnRec, '');
                }
                else if(thisObj.m_lastCmdSent.indexOf(
                    'get vpn site-to-site expert</statement>') > 0)
                {
                    thisObj.f_parseExpertModeData(err);
                    evt = new UTM_eventObj(0, thisObj.m_vpnRec, '');
                }
            }

            if(thisObj.m_guiCb != undefined)
                thisObj.m_guiCb(evt);
        }
    }

    this.f_getVPNNodesFromResponse = function(response, node)
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

    this.f_constructKeyValueString = function(vpnRec)
    {
        var kvstr = '';
        var statement = "<statement>" +
                      "utm configuration set vpn site-to-site " +
                      vpnRec.m_mode + " key name ";

        if(vpnRec.m_tunnel != null)
            kvstr += statement + "'tunnel' '" + vpnRec.m_tunnel + "'</statement> ";

        if(vpnRec.m_peerIp != null)
            kvstr += statement + "'peerip' '" + vpnRec.m_peerIp + "'</statement> ";

        if(vpnRec.m_remoteVpnDevice != null)
            kvstr += statement + "'remotedevice' '" + vpnRec.m_remoteVpnDevice +
                       "'</statement> ";

        if(vpnRec.m_presharedKey != null)
            kvstr += statement + "'presharedkey' '" + vpnRec.m_presharedKey +
                       "'</statement> ";

        if(vpnRec.m_localNetwork != null)
            kvstr += statement + "'localnetwork' '" + vpnRec.m_localNetwork +
                         "'</statement> ";

        if(vpnRec.m_remoteNetwork != null)
            kvstr += statement + "'remotenetwork' '" + vpnRec.m_remoteNetwork +
                         "'</statement> ";

        if(vpnRec.m_type != null)
            kvstr += statement + "'type' '" + vpnRec.m_type +
                         "'</statement> ";

        if(vpnRec.m_exchange != null)
            kvstr += statement + "'exchange' '" + vpnRec.m_exchange +
                         "'</statement> ";

        if(vpnRec.m_encryption1 != null)
            kvstr += statement + "'encryption1' '" + vpnRec.m_encryption1 +
                         "'</statement> ";

        if(vpnRec.m_auth1 != null)
            kvstr += statement + "'auth1' '" + vpnRec.m_auth1 +
                         "'</statement> ";

        if(vpnRec.m_diffieHellmann != null)
            kvstr += statement + "'diffiehellmann' '" + vpnRec.m_diffieHellmann +
                         "'</statement> ";

        if(vpnRec.m_lifeTime1 != null)
            kvstr += statement + "'lifetime1' '" + vpnRec.m_lifeTime1 +
                         "'</statement> ";

        if(vpnRec.m_pfsGroup != null)
            kvstr += statement + "'pfsgroup' '" + vpnRec.m_pfsGroup +
                         "'</statement> ";

        if(vpnRec.m_lifeTime2 != null)
            kvstr += statement + "'lifetime2' '" + vpnRec.m_lifeTime2 +
                         "'</statement> ";

        if(vpnRec.m_encryption2 != null)
            kvstr += statement + "'encryption2' '" + vpnRec.m_encryption2 +
                         "'</statement> ";

        if(vpnRec.m_auth2 != null)
            kvstr += statement + "'auth2' '" + vpnRec.m_auth2 +
                         "'</statement> ";

        return kvstr;
    }

    this.f_setVpnRecordData = function(nodes)
    {
        var vpn = new UTM_vpnRecord();

        for(var i=0; i<nodes.length; i++)
        {
            var val = nodes[i];

            switch(val.nodeName)
            {
                case 'tunnel':
                    vpn.m_tunnel = val.firstChild.nodeValue;
                    break;
                case 'peerip':
                    vpn.m_peerIp = val.firstChild.nodeValue;
                    break;
                case 'remotedevice':
                    vpn.m_remoteDevice = val.firstChild.nodeValue;
                    break;
                case 'presharedkey':
                    vpn.m_presharedKey = val.firstChild.nodeValue;
                    break;
                case 'localnetwork':
                    vpn.m_localNetwork = val.firstChild.nodeValue;
                    break;
                case 'remotenetwork':
                    vpn.m_remoteNetwork = val.firstChild.nodeValue;
                    break;
                case 'type':
                    vpn.m_type = val.firstChild.nodeValue;
                    break;
                case 'exchange':
                    vpn.m_exchange = val.firstChild.nodeValue;
                    break;
                case 'encryption1':
                    vpn.m_encryption1 = val.firstChild.nodeValue;
                    break;
                case 'auth1':
                    vpn.m_auth1 = val.firstChild.nodeValue;
                    break;
                case 'diffiehellmann':
                    vpn.m_diffieHellmann = val.firstChild.nodeValue;
                    break;
                case 'lifetime1':
                    vpn.m_lifeTime1 = val.firstChild.nodeValue;
                    break;
                case 'pfsgroup':
                    vpn.m_pfsGroup = val.firstChild.nodeValue;
                    break;
                case 'lifeTime2':
                    vpn.m_lifeTime2 = val.firstChild.nodeValue;
                    break;
                case 'encryption2':
                    vpn.m_encryption2 = val.firstChild.nodeValue;
                    break;
                case 'auth2':
                    vpn.m_auth2 = val.firstChild.nodeValue;
                    break;
            }
        }

        return vpn;
    }

    /**
     * parse easy mode response data from server into vpnRec form.
     */
    this.f_parseEasyModeData = function(response)
    {
        var nodes = thisObj.f_getVPNNodesFromResponse(response, 'msg');
        nodes = thisObj.f_getVPNNodesFromResponse(nodes, 'vpn');
        nodes = thisObj.f_getVPNNodesFromResponse(nodes, 'site-to-site');
        nodes = thisObj.f_getVPNNodesFromResponse(nodes, 'easy');

        if(nodes != null)
        {
            thisObj.m_vpnRec = thisObj.f_setVpnRecordData(nodes);
            thisObj.m_configMode = 'easy';
        }
    }

    /**
     * parse expert mode response data from server into vpnRec form.
     */
    this.f_parseExpertModeData = function(response)
    {
        var nodes = thisObj.f_getVPNNodesFromResponse(response, 'msg');
        nodes = thisObj.f_getVPNNodesFromResponse(nodes, 'vpn');
        nodes = thisObj.f_getVPNNodesFromResponse(nodes, 'site-to-site');
        nodes = thisObj.f_getVPNNodesFromResponse(nodes, 'expert');

        if(nodes != null)
        {
            thisObj.m_vpnRec = thisObj.f_setVpnRecordData(nodes);
            thisObj.m_configMode = 'expert';
        }
    }

    /**
     * perform a get vpn site2site configurations request from server.
     * @param mode - configuration mode 'easy' or 'expert'
     * @param guicb - gui callback function
     */
    this.f_getSite2SiteConfig = function(mode, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement>" +
                      "utm configuration get vpn site-to-site " + mode +
                      "</statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    /**
     * perform a set vpn site2site configurations request to server.
     * @param vpnRec - vpn record object
     * @param guicb - gui callback function
     */
    this.f_setSite2SiteConfig = function(vpnRec, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      thisObj.f_constructKeyValueString(vpnRec) +
                      "<statement>utm configuration set vpn site-to-site " +
                      vpnRec.m_mode + " submit</statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }
}