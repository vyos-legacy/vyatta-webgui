/*
    Document   : utm_nwConfBusObj.js
    Created on : Apr 01, 2009, 11:21:31 AM
    Author     : Kevin.Choi
    Description:
*/


/**
 * nat/pat data record
 */
function UTM_nwNatPatRecord(ruleNo, zonePair)
{
    var thisObj = this;
    this.m_ruleNo = ruleNo;   // data type int
    this.m_zonePair = zonePair;
    this.m_direction = zonePair;
    this.m_appService = " ";
    this.m_protocol = " ";
    this.m_internIpAddr = "0.0.0.0";
    this.m_InternPort = "";
    this.m_destPort = "";
}

function UTM_nwDNSRecord(mode, primary, secondary)
{
	var thisObj = this;
	this.m_mode = mode;
	this.m_pri = primary;
	this.m_sec = secondary;

	this.f_toXml = function() {
		var xml = '<name-server><mode>' + thisObj.m_mode + '</mode>';
		if (thisObj.m_mode == 'auto') {
			return xml + '</name-server>';
		}
		xml += '<primary>' + thisObj.m_pri + '</primary><secondary>' + thisObj.m_sec + '</secondary></name-server>';
		return xml;
	}
}

/**
 * routin data record
 */
function UTM_nwRoutingRecord(ruleNo, zonePair)
{
    var thisObj = this;
    this.m_ruleNo = ruleNo;   // data type int
    this.m_zonePair = zonePair;
    this.m_destIpAddr = "";
    this.m_destIpMask = "";
    this.m_gwOrInterface = "";
    this.m_metric = "";
    this.m_isGateway = true;
}

/**
 * network configuration business object for NAT/PAT and Routing
 */
function UTM_nwConfigBusObj(busObj)
{
    /////////////////////////////////////
    // properteis
    var thisObj = this;
    this.m_busObj = busObj;
    this.m_lastCmdSent = null;
    this.m_nwRec = null;

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
            }

            if(thisObj.m_guiCb != undefined)
                thisObj.m_guiCb(evt);
        }
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
                        this.f_setInternAddress(fws[x],
                            this.f_getValueFromNameValuePair("saddr", vals[j]));
                        fws[x].m_srcPort = this.f_getValueFromNameValuePair("sport", vals[j]);
                        this.f_setDestinationAddress(fws[x],
                            this.f_getValueFromNameValuePair("daddr", vals[j]));
                        fws[x].m_destPort = this.f_getValueFromNameValuePair("dport", vals[j]);
                        fws[x].m_action = this.f_getValueFromNameValuePair("action", vals[j]);
                        fws[x].m_log = this.f_getValueFromNameValuePair("log", vals[j]);
                        fws[x].m_enabled = this.f_getValueFromNameValuePair("enable", vals[j]);

                        this.f_mapAppServiceFromPort(fws[x]);
                    }
                }
            }
        }

        return fws;
    };

    this.f_mapAppServiceFromPort = function(fireRec)
    {
        fireRec.m_appService = "Others";
        var port = fireRec.m_destPort.split(",");
        var proto = fireRec.m_protocol;
        var s = thisObj.m_services;
        var p = thisObj.m_ports;

        if(proto == "udp")
        {
            switch(port[0])
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
            switch(port[0])
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
                        if(port[0] == p[i])
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

    this.f_setInternAddress = function(fireRec, addr)
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

    this.f_getNwRoutingList = function(guicb)
    {/*
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement mode='proc'>" +
                      "<handler>zone-mgmt get-zone-info" +
                      "</handler><data>ALL</data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
        return;
*/
        var zm = function(ruleNo)
        {
            var z = new UTM_nwRoutingRecord(ruleNo);
            z.m_destIpAddr = "10.1.21." + ruleNo;
            z.m_destIpMask = "255.255.255.0";
            z.m_metric = 5 + ruleNo;
            if(ruleNo == 1 || ruleNo == 3)
            {
                z.m_isGateway = true;
                z.m_gwOrInterface = "100.23.33." + ruleNo;
            }
            else
            {
                z.m_isGateway = false;
                z.m_gwOrInterface = "tcp";
            }

            return z;
        }

        var cb = function()
        {
            var z = [];
            z.push(zm(1));
            z.push(zm(2));
            z.push(zm(3));
            z.push(zm(4));
            z.push(zm(5));
            z.push(zm(6));

            var evt = new UTM_eventObj(0, z, '');
            guicb(evt);
        }

        window.setTimeout(cb, 500);
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

function UTM_nwDNSBusObj(busObj)
{
    /////////////////////////////////////
    // properties
    var thisObj = this;
    this.m_busObj = busObj;
    this.m_lastCmdSent = null;
    this.m_dnsRec = null;
	this.m_GET_CMD = 'dns-config get';
	this.m_SET_CMD = 'dns-config set';

    /**
     * A callback function for all url filtering requests.
     */
    this.f_respondRequestCallback = function(resp, cmdSent, noUICallback)
    {
        var response = thisObj.m_busObj.f_getRequestResponse(
                        thisObj.m_busObj.m_request);

        if (g_devConfig.m_isLocalMode) {
			response = resp;
		}

        if(response == null) return;

        if(response.f_isError != null) { //This is server error case.
            //alert('response.f_isError is not null');
            if (noUICallback == undefined || !noUICallback) {
				thisObj.m_guiCb(response);
			}
        } else {
            var evt = new UTM_eventObj(0, thisObj, '');

            var err = response.getElementsByTagName('error');
			//alert('err: ' + err);
            if(err != null && err[0] != null) { //The return value is inside the <error> tag.
                var tmp = thisObj.f_getFormError(err);
				if (tmp != null) { //form has error
					if (thisObj.m_guiCb != undefined) {
						return thisObj.m_guiCb(tmp);
					}
				}
                if (thisObj.m_lastCmdSent.indexOf(thisObj.m_GET_CMD) > 0) {
                    thisObj.m_dnsRec = thisObj.f_parseDNS(err);
                    evt = new UTM_eventObj(0, thisObj.m_dnsRec, '');
				}
            }

            if(thisObj.m_guiCb != undefined)
                thisObj.m_guiCb(evt);
        }
    }

    /////////////////////////////////////////
    /**
     * A callback function for all user management requests.
     */
    this.f_respondRequestCallbackSetCmd = function(resp, cmdSent, noUICallback)
    {
        var response = thisObj.m_busObj.f_getRequestResponse(
                        thisObj.m_busObj.m_request);

        if(response == null) return;

        if(response.f_isError != null) { //This is server error case.
            //alert('response.f_isError is not null');
            if(noUICallback == undefined || !noUICallback)
                thisObj.m_guiCb(response);
        } else {
            var evt = new UTM_eventObj(0, thisObj, '');


            var err = response.getElementsByTagName('error');
            if (err != null && err[0] != null) { //The return value is inside the <error> tag.
				var tmp = thisObj.f_getFormError(err);
				if (tmp != null) { //form has error
					if (thisObj.m_guiCb != undefined) {
						return thisObj.m_guiCb(tmp);
					}
				}
			}

            if(thisObj.m_guiCb != undefined)
                thisObj.m_guiCb(evt);
        }
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

    this.f_parseDNS = function(response)
	{
		var mode = 'auto';
		var pri = '';
		var sec = '';

		var form = thisObj.f_getFormNode(response);
		var dnsNode = g_utils.f_xmlGetChildNode(form, 'name-server');

		if (dnsNode != null) {
			var cnode = g_utils.f_xmlGetChildNode(dnsNode, 'mode');
			if (cnode != null) {
				var value = g_utils.f_xmlGetNodeValue(cnode);
				if (value != null) {
					mode = value;
				}
				if (mode == 'manual') {
					cnode = g_utils.f_xmlGetChildNode(dnsNode, 'primary');
					value = g_utils.f_xmlGetNodeValue(cnode);
					if (value != null) pri = value;
					cnode = g_utils.f_xmlGetChildNode(dnsNode, 'secondary');
					value = g_utils.f_xmlGetNodeValue(cnode);
					if (value != null) sec = value;
				}
			}
		}

        return new UTM_nwDNSRecord(mode,pri,sec);
	}


	this.f_getDNSConfig = function(guicb)
	{
		(g_devConfig.m_isLocalMode) ? thisObj.f_getDNSConfigLocal(guicb) : thisObj.f_getDNSConfigServer(guicb);
	}

    /**
     */
    this.f_getDNSConfigServer = function(guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement mode='proc'>" +
                      "<handler>dns-config get" +
                      "</handler><data></data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_setDNSConfig = function(dnsRecObj, guicb)
	{
		if (g_devConfig.m_isLocalMode) {
			thisObj.f_setDNSConfigLocal(dnsRecObj,guicb);
		} else {
			thisObj.f_setDNSConfigServer(dnsRecObj,guicb);
		}
	}

	/**
     * perform a set dns configuration request to server.
     * @param dnsRecObj - dns config object.
     * @param guicb - gui callback function
     */
    this.f_setDNSConfigServer = function(dnsRecObj, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>dns-config" +
                      " set</handler><data>" + dnsRecObj.f_toXml() +
                      "</data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallbackSetCmd);
    }
	///////////////////////////////////////////////////////////////////////////////////////
	/////// begining simulation
	///////////////////////////////////////////////////////////////////////////////////////
    this.f_getDNSConfigLocal = function(guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement mode='proc'>" +
                      "<handler>dns-config get" +
                      "</handler><data></data></statement></command>";
        var cmdSend = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                       + "<openappliance>" + xmlstr + "</openappliance>\n";

        thisObj.m_lastCmdSent = cmdSend;

		var resp = g_utils.f_parseXmlFromString(
		    '<?xml version="1.0" encoding="utf-8"?>' +
                '<openappliance>' +
                    '<token></token>' +
                        '<error>' +
                            '<code>0</code>' +
                               '<msg>' +
                                   '<form name=\'dns-config\' code=\'0\'>' +
                                       '<name-server>' +
                                           '<mode>manual</mode><primary>1.1.1.1</primary><secondary>1.1.1.2</secondary>' +
                                        '</name-server>' +
                                    '</form>' +
                                '</msg>' +
                          '</error>' +
                  '</openappliance>');

        thisObj.f_respondRequestCallback(resp, guicb);
    }

    this.f_setDNSConfigLocal = function(dnsRecObj, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>dns-config" +
                      " set</handler><data>" + dnsRecObj.f_toXml() +
                      "</data></statement></command>";

        var cmdSend = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                       + "<openappliance>" + xmlstr + "</openappliance>\n";

		alert ('cmdSend: ' + cmdSend);

        thisObj.m_lastCmdSent = cmdSend;

		var resp = g_utils.f_parseXmlFromString(
		    '<?xml version="1.0" encoding="utf-8"?>' +
                '<openappliance>' +
                    '<token></token>' +
                        '<error>' +
                            '<code>0</code>' +
                               '<msg>' +
                                   '<form name=\'dns-config\' code=\'0\'>' +
                                    '</form>' +
                                '</msg>' +
                          '</error>' +
                  '</openappliance>');
        thisObj.f_respondRequestCallback(resp, guicb);
    }
}
