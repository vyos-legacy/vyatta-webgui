/*
    Document   : utm_fwBusObj.js
    Created on : Apr 01, 2009, 11:21:31 AM
    Author     : Kevin.Choi
    Description:
*/

/**
 * firewall zone record
 */
function UTM_fwZoneRecord(name)
{
    var thisObj = this;
    this.m_name = name;
    this.m_members = [];        // members included
    this.m_memAvailable = [];   // members available
    this.m_description = null;
    this.m_enabled = 'yes';     // yes/no
}


function UTM_fwLevelRecord(dir)
{
    this.m_isSelected = false;
    this.m_direction = dir;
    this.m_level = null;
}

/**
 * Firewall data record
 */
function UTM_fireRecord(ruleNo, zonePair)
{
    var thisObj = this;
    this.m_level = null;  // 'Authorize All', 'Standard', 'Advanced', 'Customized', 'Block All'
    this.m_ruleNo = ruleNo;   // data type int
    this.m_zonePair = zonePair;
    this.m_direction = zonePair;
    this.m_appService = " ";
    this.m_protocol = " ";
    this.m_srcIpAddr = "0.0.0.0";
    this.m_srcMaskIpAddr = "0.0.0.0";
    this.m_srcPort = "";
    this.m_destIpAddr = "0.0.0.0";
    this.m_destMaskIpAddr = "0.0.0.0";
    this.m_destPort = "";
    this.m_action = "accept";
    this.m_log = "No";
    this.m_order = null;
    this.m_enabled = 'Yes';
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
    this.m_zoneRecs = [];

    this.m_udpServices = ["DNS-UDP", "TFTP", "NTP", "SNMP", "L2TP", "Traceroute",
                        "IPSec", "UNIK", "H323 host call - UDP", "SIP-UDP",
                        "ICA-UDP"];
    this.m_services = ["DNS-UDP", "DNS-TCP", "HTTP", "HTTPS", "FTP_DATA",
                        "FTP", "POP3", "SMTP", "SMTP-Auth", "TFTP", "POP3S",
                        "IMAP", "NTP", "NNTP", "SNMP", "Telnet", "SSH",
                        "L2TP", "Traceroute", "IPSec", "UNIK", "H323 host call - TCP",
                        "H323 host call - UDP", "SIP-TCP", "SIP-UDP",
                        "ICA-TCP", "ICA-UDP", "Others", " "];
    this.m_ports = ["53", "53", "80", "443", "20", "21", "110", "25", "587",
                        "69", "995", "143", "119", "199", "161-162", "23", "22",
                        "1701", "32769-65535", "500, 4500", "500, 4500",
                        "1720", "1718, 1719", "5060", "5060", "1494", "1494", " ", " "];

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
                    "customize-firewall next-rulenum") > 0)
                {
                    var fr = thisObj.f_parseFirewallNextRuleNo(err);
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
                      "zone-mgmt get-zone-info") > 0)
                {
                    thisObj.m_zoneRecs = thisObj.f_parseFwZoneMgmt(err);
                    evt = new UTM_eventObj(0, thisObj.m_zoneRecs, '');
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


    this.f_parseFwZoneMgmt = function(response)
    {
        var nodes = thisObj.m_busObj.f_getResponseChildNodes(response, 'msg');
        var zones = [];

        if(nodes != null)
        {
            for(var i=0; i<nodes.length; i++)
            {
                var n = nodes[i];
                if(n.nodeName == "zone-mgmt")
                {
                    var vals = n.firstChild.nodeValue.split(":");
                    for(var j=0; j<vals.length; j++)
                    {
                        var zone = new UTM_fwZoneRecord();

                        zone.m_name = this.f_getValueFromNameValuePair("zone", vals[j]);
                        zone.m_description = this.f_getValueFromNameValuePair("description", vals[j]);
                        var enabled = this.f_getValueFromNameValuePair("enable", vals[j]);
                        zone.m_enabled = enabled == "" ? 'yes' : enabled;

                        var inter = this.f_getValueFromNameValuePair("interfaces", vals[j]);

                        if(inter.indexOf(",") >= 0)
                        {
                            var inters = inter.split(",");
                            for(var k=0; k<inters.length; k++)
                                zone.m_members.push(inters[k])
                        }
                        else
                            zone.m_members.push(inter);

                        if(zone.m_name.length > 0)
                            zones.push(zone);
                    }
                }
            }
        }

        return zones;
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

    this.f_parseFirewallNextRuleNo = function(response)
    {
        var nodes = thisObj.m_busObj.f_getResponseChildNodes(response, 'msg');

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
                        var rec = new UTM_fireRecord();

                        rec.m_zonePair = zp;
                        rec.m_ruleNo = this.f_getValueFromNameValuePair("rulenum", vals[j]);
                        return rec;
                    }
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
                        fws[x].m_appService = this.f_getValueFromNameValuePair("application", vals[j]);
                        //this.f_mapAppServiceFromPort(fws[x]);
                    }
                }
            }
        }

        return fws;
    };
/*/
    this.f_mapAppServiceFromPort = function(fireRec)
    {
        fireRec.m_appService = "Others";
        var port = fireRec.m_destPort; //.split(",");
        var proto = fireRec.m_protocol;
        var s = thisObj.m_services;
        var p = thisObj.m_ports;

        if(proto == "udp")
        {
            switch(port)
            {
                case p[0]:
                    fireRec.m_appService = s[0];
                case p[24]:
                    fireRec.m_appService = s[24];
                    break;
                case p[26]:
                    fireRec.m_appService = s[26];
                    break;
                case p[12]:
                    fireRec.m_appService = s[12];
                    break;
                case "161":
                case "162":
                case p[14]:
                    fireRec.m_appService = s[14];
                    break;
                case "500":
                case "4500":
                    fireRec.m_appService = s[20];
                    break;
                case p[17]:
                    fireRec.m_appService = s[17];
                    break;
                case "1718":
                case "1719":
                    fireRec.m_appService = s[22];
                    break;
                case "32769-65535":
                    fireRec.m_appService = s[18];
                    break;
                default:
                    if(parseInt(p[0]) != NaN)
                    {
                        var udp = Number(p[0]);
                        if(udp >= 32769 && udp <= 65535)
                            fireRec.m_appService = s[18];
                    }
            }
        }
        else if(proto == "tcp")
        {
            switch(port)
            {
                case p[1]:
                    fireRec.m_appService = s[1];
                    break;
                case p[13]:
                    fireRec.m_appService = s[13];
                    break;
                case "500":
                case "4500":
                    fireRec.m_appService = s[19];
                    break;
                case "5060":
                    fireRec.m_appService = s[23];
                    break;
                case "1949":
                    fireRec.m_appService = s[25];
                    break;
                default:
                {
                    for(var i=0; i<p.length; i++)
                    {
                        if(port == p[i])
                        {
                            fireRec.m_appService = s[i];
                            break;
                        }
                    }
                }
            }
        }
        else if(proto.indexOf("ip") >= 0)
        {
            fireRec.m_appService = s[19];
        }
    };
*/
    this.f_setSrouceAddress = function(fireRec, addr)
    {
        if(addr.length > 0)
        {
            if(addr.indexOf("/") > 0)
            {
                var ips = addr.split("/");
                fireRec.m_srcIpAddr = ips[0];
                fireRec.m_srcMaskIpAddr = g_utils.f_convertCIDRToNetmask(ips[1]);
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
                fireRec.m_destMaskIpAddr = g_utils.f_convertCIDRToNetmask(ips[1]);
            }
        }
    };

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

    this.f_getFirewallZoneMgmtList = function(guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement mode='proc'>" +
                      "<handler>zone-mgmt get-zone-info" +
                      "</handler><data>ALL</data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_getFirewallZoneMemberAvailable = function(zoneRec, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();

        var zm = function(name)
        {
            var z = new UTM_fwZoneRecord(name);
            z.m_memAvailable = ['eth0', 'eth1', 'eth2', 'eth3'];

            return z;
        }

        var cb = function()
        {
            var z = [];
            z.push(zm('zone1'));
            z.push(zm('zone2'));
            z.push(zm('zone3'));
            z.push(zm('zone4'));
            z.push(zm('zone5'));
            z.push(zm('zone6'));

            guicb(z);
        }

        window.setTimeout(cb, 500);
    }

    /**
     */
    this.f_getFirewallSecurityLevel = function(guicb)
    {
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

    this.f_getFirewallZoneMgmtNextRuleNo = function(zonepair, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement mode='proc'>" +
                      "<handler>customize-firewall next-rulenum" +
                      "</handler><data>zonepair=[" + zonepair +
                      "], rulename=[next]</data></statement></command>";

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

    this.f_resetFirewallCustomizeRule = function(fireRec, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>customize-firewall" +
                      " reset</handler><data>zonepair=[" + fireRec.m_zonePair +
                      "],rulenum=[all]</data></statement></command>";

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

    this.f_getPortNumber = function(fireRec)
    {
        if(fireRec.m_protocol != null && fireRec.m_appService != null)
        {
            var s = thisObj.m_services;
            var p = thisObj.m_ports;
            if(fireRec.m_protocol == "tcp" || fireRec.m_protocol == "udp")
            {
                for(var i=0; i<s.length; i++)
                {
                    if(fireRec.m_appService == s[i])
                        return p[i];
                }
            }
            else if(fireRec.m_protocol.indexOf("ip") >= 0)
            {
                if(fireRec.m_appService == s[20])
                    return p[20];
            }
            else if(fireRec.m_protocol.indexOf("icmp") >= 0)
            {

            }
        }

        return "";
    }

    this.f_getProtocol = function(fireRec)
    {
        var s = thisObj.m_services;
        var a = fireRec.m_appService;

        if(a == s[19] || a == s[20] || a == s[27] || a == s[28])
            return " ";

        var udp = thisObj.m_udpServices.indexOf(a);
        if(udp > -1)
            return "udp";
        else
            return "tcp";
    }
}
