/*
    Document   : utm_fwBusObj.js
    Created on : Apr 01, 2009, 11:21:31 AM
    Author     : Kevin.Choi
    Description:
*/

/**
 * Firewall data record
 */
function UTM_fireRecord(ruleNo, zonePair)
{
    var thisObj = this;
    this.m_level = null;  // 'Authorize All', 'Standard', 'Advanced', 'Customized', 'Block All'
    this.m_ruleNo = ruleNo;   // data type int
    this.m_zonePair = zonePair;
    this.m_direction = null;
    this.m_appService = null;
    this.m_protocol = null;
    this.m_srcIpAddr = "0.0.0.0";
    this.m_srcMaskIpAddr = "0.0.0.0";
    this.m_srcPort = null;
    this.m_destIpAddr = "0.0.0.0";
    this.m_destMaskIpAddr = "0.0.0.0";
    this.m_destPort = null;
    this.m_action = null;
    this.m_log = null;
    this.m_order = null;
    this.m_enabled = null;
}

/**
 * VPN business object
 */
function UTM_firewallBusObj(busObj)
{
    /////////////////////////////////////
    // properteis
    var thisObj = this;
    this.m_busObj = busObj;
    this.m_lastCmdSent = null;
    this.m_fireRec = null;

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
            var evt = new UTM_eventObj(0, thisObj, '');

            var err = response.getElementsByTagName('error');
            if(err != null && err[0] != null)
            {
                if(thisObj.m_lastCmdSent.indexOf(
                    '<handler>firewall-security-level get') > 0)
                {
                    var fr = thisObj.f_parseFirewallSecurityLevel(err);
                    evt = new UTM_eventObj(0, fr, '');
                }
                else if(thisObj.m_lastCmdSent.indexOf(
                    '<handler>customize-firewall get') > 0)
                {
                    thisObj.m_fireRec = thisObj.f_parseFirewallSecurityCustomize(err);
                    evt = new UTM_eventObj(0, thisObj.m_fireRec, '');
                }
                else if(thisObj.m_lastCmdSent.indexOf(
                    '<handler>customize-firewall delete-rule') > 0)
                {

                }
                else if(thisObj.m_lastCmdSent.indexOf(
                    '<handler>customize-firewall cancel ') > 0 ||
                    thisObj.m_lastCmdSent.indexOf(
                    '<handler>customize-firewall save') > 0)
                {

                }
            }

            if(thisObj.m_guiCb != undefined)
                thisObj.m_guiCb(evt);
        }
    }


    /**
     * parse firewall security level data.
     */
    this.f_parseFirewallSecurityLevel = function(response)
    {
        var nodes = thisObj.m_busObj.f_getResponseChildNodes(response, 'msg');

        if(nodes != null)
        {
            for(var i=0; i<nodes.length; i++)
            {
                var n = nodes[i];
                if(n.nodeName == 'firewall-security-level')
                {
                    var fr = new UTM_fireRecord();
                    fr.m_level = n.firstChild.nodeValue;
                    return fr;
                }
            }
        }

        return null;
    }

    /**
     */
    this.f_parseFirewallSecurityCustomize = function(response)
    {
        var nodes = thisObj.m_busObj.f_getResponseChildNodes(response, 'msg');
        var fws = new Array();

        if(nodes != null)
        {
            for(var i=0; i<nodes.length; i++)
            {
                var n = nodes[i];
                if(n.nodeName == "customize-firewall")
                {
                    var vals = n.firstChild.nodeValue.split(":");
                    var zp = this.f_getValueFromNameValuePair("zonepair", vals[0]);
                    for(var j=1; j<vals.length; j++)
                    {
                        var rNo = this.f_getValueFromNameValuePair("rulenum", vals[j]);

                        if(rNo.length == 0) break;

                        var x = j-1;
                        fws[x] = new UTM_fireRecord();
                        
                        fws[x].m_zonePair = zp;
                        fws[x].m_direction = zp;
                        fws[x].m_ruleNo = rNo;
                        fws[x].m_protocol = this.f_getValueFromNameValuePair("protocol", vals[j]);
                        this.f_setSrouceAddress(fws[x], 
                            this.f_getValueFromNameValuePair("saddr", vals[j]));
                        fws[x].m_srcPort = this.f_getValueFromNameValuePair("sport", vals[j]);
                        this.f_setDestinationAddress(fws[x],
                            this.f_getValueFromNameValuePair("daddr", vals[j]));
                        fws[x].m_destPort = this.f_getValueFromNameValuePair("dport", vals[j]);
                        fws[x].m_action = this.f_getValueFromNameValuePair("action", vals[j]);
                        fws[x].m_log = this.f_getValueFromNameValuePair("log", vals[j]);
                        fws[x].m_enabled = this.f_getValueFromNameValuePair("enable", vals[j]);
                    }
                }
            }
        }

        return fws;
    }

    this.f_setSrouceAddress = function(fireRec, addr)
    {
        if(addr.length > 0)
        {
            if(addr.indexOf("/") > 0)
            {
                var ips = addr.split("/");
                fireRec.m_srcIpAddr = ips[0];
                fireRec.m_srcMaskIpAddr = ips[1];
            }
        }
    };

    this.f_setDestinationAddress = function(fireRec, addr)
    {
        if(addr.length > 0)
        {
            if(addr.indexOf("/") > 0)
            {
                var ips = addr.split("/");
                fireRec.m_destIpAddr = ips[0];
                fireRec.m_destMaskIpAddr = ips[1];
            }
        }
    };

    this.f_getValueFromNameValuePair = function(name, nv)
    {
        var nvs = nv.split(",");

        for(var i=0; i<nvs.length; i++)
        {
            if(nvs[i].indexOf(name+"=") >= 0)
            {
                var v = nvs[i].split("=");
                if(v[1].length > 2)
                {
                    v = v[1].replace("[", "");
                    v = v.replace("]", "");
                    v = v.replace(/;/g, ",");
                    return v;
                }
            }
        }

        return "";
    }

    /**
     */
    this.f_getFirewallSecurityLevel = function(guicb)
    {
        //var e = new UTM_eventObj(0, 'Advanced', '');
        //window.setTimeout(function(){guicb(e)}, 500);

        //return;
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement mode='proc'>" +
                      "<handler>firewall-security-level get" +
                      "</handler></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    /**
     * perform a set vpn site2site configurations request to server.
     * @param fireRec - firewall record object
     * @param guicb - gui callback function
     */
    this.f_setFirewallSecurityLevel = function(fireRec, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>firewall-security-level" +
                      " set</handler><data>" + fireRec.m_level +
                      "</data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_getFirewallSecurityCustomize = function(fireRec, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement mode='proc'>" +
                      "<handler>customize-firewall get" +
                      "</handler><data>zonepair=[" + fireRec.m_zonePair +
                      "], rulename=[all]</data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_setFirewallCustomize = function(fireRec, name, value, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>customize-firewall" +
                      " set</handler><data>zonepair=[" + fireRec.m_zonePair +
                      "], rulenum=[" + fireRec.m_ruleNo + "]," + name +
                      "=[" + value + "]</data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_deleteFirewallCustomizeRule = function(fireRec, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>customize-firewall" +
                      " delete-rule</handler><data>zonepair=[" + fireRec.m_zonePair +
                      "], rulenum=[" + fireRec.m_ruleNo +
                      "]</data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_saveFirewallCustomizeRule = function(guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>customize-firewall" +
                      " save</handler><data></data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_cancelFirewallCustomizeRule = function(guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>customize-firewall" +
                      " cancel</handler><data></data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_deleteFirewallCustomizeRule = function(fireRec, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>customize-firewall" +
                      " delete-rule</handler><data>zonepair=[" + fireRec.m_zonePair +
                      "], rulenum=[" + fireRec.m_ruleNo +
                      "]</data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    /**
     * @param type - 'cancel' to cancel already setted customize rules
     *               'save' to save all the setted customize rules
     * @param guicb - gui callbackk function
     */
    this.f_sendFirewallCustomizeRuleCmd = function(type, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>customize-firewall " +
                      type + "</handler><data></data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }
}
