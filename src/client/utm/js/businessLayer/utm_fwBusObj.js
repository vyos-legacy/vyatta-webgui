/*
    Document   : utm_fwBusObj.js
    Created on : Apr 01, 2009, 11:21:31 AM
    Author     : Kevin.Choi
    Description:
*/

/**
 * Firewall data record
 */
function UTM_fireRecord(ruleNo, zone)
{
    var thisObj = this;
    this.m_level = null;  // 'Authorize All', 'Standard', 'Advanced', 'Customized', 'Block All'
    this.m_ruleNo = ruleNo;
    this.m_zone = zone;
    this.m_appService = null;
    this.m_protocol = null;
    this.m_srcIpAddr = null;
    this.m_srcMaskIpAddr = null;
    this.m_srcPort = null;
    this.m_destIpAddr = null;
    this.m_destMaskIpAddr = null;
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
                    thisObj.f_parseFirewallSecurityCustomize(err);
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
                    alert(n.firstChild.nodeValue);
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
        nodes = thisObj.m_busObj.f_getResponseChildNodes(nodes, 'customize-firewall');

        if(nodes != null)
            alert(nodes.firstChild.nodeValue);
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
                      "</handler><data>zonepair=[" + fireRec.m_zone +
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
                      " set</handler><data>zonepair=[" + fireRec.m_zone +
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
                      " delete-rule</handler><data>zonepair=[" + fireRec.m_zone +
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
