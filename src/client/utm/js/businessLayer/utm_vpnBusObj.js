/*
    Document   : utm_vpnBusObj.js
    Created on : Apr 01, 2009, 11:21:31 AM
    Author     : Kevin.Choi
    Description:
*/


/**
 * VPN data record
 */
function UTM_vpnRecord(tunnel, mode, src, dest, peer, status, enable)
{
    var thisObj = this;
    this.m_mode = mode; // easy or export
    this.m_tunnel = tunnel;
    this.m_peerIp = peer;
    this.m_remoteVpnDevice = null;
    this.m_presharedKey = null;
    this.m_localNetwork = src;
    this.m_remoteNetwork = dest;
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
    this.m_status = status;
    this.m_enable = enable;

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
    this.m_simulationMode = false;
    this.m_busObj = busObj;
    this.m_lastCmdSent = null;
    this.m_configMode = null; // easy or expert
    this.m_vpnRec = null;

    /**
     * A callback function for request.
     */
    this.f_respondRequestCallback = function(resp, cmdSent, callback)
    {
        var response = thisObj.m_busObj.f_getRequestResponse(
                        thisObj.m_busObj.m_request);

        if(thisObj.m_simulationMode)
        {
            response = resp;
            thisObj.m_simulationMode = false;
        }

        if(response == null) return;

        if(response.f_isError != undefined)
        {
            thisObj.m_guiCb(response);
        }
        else
        {
            var evt = new UTM_eventObj(0, thisObj, '');

            var err = response.getElementsByTagName('error');
            if(err != null && err[0] != null)
            {
                if(thisObj.m_lastCmdSent.indexOf(
                    "<handler>vpn-site2site get") > 0)
                {
                    thisObj.m_vpnRec = thisObj.f_parseSite2SiteGet(err);
                    evt = new UTM_eventObj(0, thisObj.m_vpnRec, '');
                }
            }

            if(thisObj.m_guiCb != undefined)
                thisObj.m_guiCb(evt);
        }
    }


    this.f_parseSite2SiteGet = function(resp)
    {
        var nodes = thisObj.m_busObj.f_getResponseChildNodes(resp, 'msg');
        var vpn = new Array();

        if(nodes != null)
        {
            for(var i=0; i<nodes.length; i++)
            {
                var n = nodes[i];
                if(n.nodeName == "vpn-site2site")
                {
                    var vals = n.firstChild.nodeValue.split(":");

                    for(var j=0; j<vals.length; j++)
                    {
                        vpn[j] = new UTM_vpnRecord();

                        vpn[j].m_tunnel = this.f_getValueFromNameValuePair("name", vals[j]);
                        vpn[j].m_localNetwork = this.f_getValueFromNameValuePair("source", vals[j]);
                        vpn[j].m_remoteNetwork = this.f_getValueFromNameValuePair("destination", vals[j]);
                        vpn[j].m_peerIp = this.f_getValueFromNameValuePair("peer", vals[j]);
                        vpn[j].m_status = this.f_getValueFromNameValuePair("status", vals[j]);
                        vpn[j].m_enable = this.f_getValueFromNameValuePair("enable", vals[j]);
                        vpn[j].m_mode = this.f_getValueFromNameValuePair("configmode", vals[j]);
                    }
                }
            }
        }

        return vpn;
    }

    this.f_getValueFromNameValuePair = function(name, nv)
    {
        var nvs = nv.split("]");

        for(var i=0; i<nvs.length; i++)
        {
            if(nvs[i].indexOf(name+"=") >= 0)
            {
                var v = nvs[i].split("=");
                if(v[1].length > 1)
                {
                    v = v[1].replace("[", "");
                    //v = v.replace(/;/g, ",");
                    return v;
                }
            }
        }

        return "";
    }

    /**
     * get all site to site configurations
     */
    test1 = 0;
    this.f_getSite2SiteData = function(guicb)
    {
        thisObj.m_guiCb = guicb;
        var xmlstr = "<statement mode='proc'>" +
                      "<handler>vpn-site2site get" +
                      "</handler><data></data></statement>";

        var cb = function()
        {
            var resp = '<?xml version="1.0" encoding="utf-8"?>' +
                        '<openappliance><token></token><error><code>0</code><msg><vpn-site2site>';
            var sep = ":";

            for(var i=0; i<5; i++)
            {
                var dis = i == 2 || i==4 ? "disconnected" : "connected";

                if(i == 4) sep = "";
                resp += "name=[tunnel name" + (i+test1++) + "],source=[10.1.3." + i +
                        "],destination=[10.1.2." + i + "],peer=[192.168.1." + i +
                        "],status=[" + dis + "],configmode=[expert],enable=[no]" +
                        sep;
            }

            resp += "</vpn-site2site></msg></error></openappliance>";

            resp = g_utils.f_parseXmlFromString(resp);
            thisObj.m_simulationMode = true;
            thisObj.m_lastCmdSent = xmlstr;
            thisObj.f_respondRequestCallback(resp, xmlstr, guicb);
        }
        window.setTimeout(cb, 500);

        return;
        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

}