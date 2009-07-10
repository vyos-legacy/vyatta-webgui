/*
    Document   : utm_nwConfBusObj.js
    Created on : Apr 01, 2009, 11:21:31 AM
    Author     : Kevin.Choi
    Description:
*/


/**
 * nat/pat data record
 */
function UTM_nwNatPatRecord(ruleNo)
{
    var thisObj = this;
    this.m_ruleNo = ruleNo;   // data type int
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
function UTM_nwRoutingRecord()
{
    var thisObj = this;
    this.m_destIpAddr = "";
    this.m_destIpMask = "";
    this.m_gwOrInterface = "";
    this.m_metric = "";
    this.m_isGateway = true;
}

/**
 * port configuration
 * @param {Object} busObj
 */
function UTM_nwPortConfigRecord(num, name, group, enable)
{
	var thisObj = this;
	this.m_num = num;
	this.m_name = name;
	this.m_group = group; /* group can be: LAN, LAN2, DMZ, WAN */
	this.m_enable = enable;

	this.f_toXml = function() {
		var xml = '<port-config><num>' + thisObj.m_num + '</num>';
		xml += '<name>' + thisObj.m_name + '</name><group>' + thisObj.m_group + '</group>';
		xml += '<enable>' +  thisObj.m_enable + '</enable></port-config>';
		return xml;
	}
	
	this.f_toXmlForSet = function() {
		var xml = '<port><num>' + thisObj.m_num + '</num>';;
		xml += '<enable>' +  thisObj.m_enable + '</enable></port>';
		return xml;		
	}
}

/**
 * port configuration
 * @param {Object} busObj
 */
function UTM_nwPortConfigObj(groupList, portList)
{
	var thisObj = this;
	this.m_groupList = groupList;
	this.m_portList = portList;
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
    this.m_protocols = ["tcp", "udp", "both"];

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
                    'static-route get') > 0)
                {
                    var fr = thisObj.f_parseRouteList(err);
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
    this.f_parseRouteList = function(response)
    {
        var nodes = thisObj.m_busObj.f_getResponseChildNodes(response, 'msg');
        nodes = thisObj..m_busObj.f_getResponseChildNodes(nodes, 'static-route');
        var recs = new Array();

        for(var i=0; nodes != null && i<nodes.length; i++)
        {
            var n = nodes[i];

            if(n.nodeName == "route" && n.firstChild != null)
                recs.push(this.f_parseRouteNode(n));
        }

        return recs;
    };

    /**
     * @param node = element node
     * @return UTM_nwRoutingRecord object
     */
    this.f_parseRouteNode = function(node)
    {
        var rec = new UTM_nwRoutingRecord();

        for(var i=0; i<node.childNodes.length; i++)
        {
            var n = node.childNodes[i];

            if(n.nodeName == "dest-network")
                rec.m_destIpAddr = n.nodeValue;
            else if(n.nodeName == "dest-mask")
                rec.m_destIpMask = n.nodeValue;
            else if(node.nodeName == "gateway")
                rec.m_gateway = n.nodeValue;
            else if(node.nodeName == "interface")
                rec.m_interface = n.nodeValue;
            else if(node.nodeName == "metric")
                rec.m_metric = n.nodeValue;
        }

        return rec;
    }

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
                      "<handler>static-route get" +
                      "</handler><data></data></statement></command>";

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

    this.f_getNatPat = function(rec, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var ruleName = rec != null ? rec.m_ruleNo : 'all';

        var xmlstr = "<command><id>" + sid + "</id><statement mode='proc'>" +
                      "<handler>network-nat-path get" +
                      "</handler><data>rulename=[" + ruleName +
                      "]</data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_setNatPatNamePairValue = function(rec, name, value, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>network-nat-pat" +
                      " set</handler><data>rulenum=[" + rec.m_ruleNo + "]," + name +
                      "=[" + value + "]</data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_saveNatPat = function(guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>network-nat-pat" +
                      " save</handler><data></data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_cancelNatPat = function(guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>network-nat-pat" +
                      " cancel</handler><data></data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_deleteNatPath = function(rec, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>customize-firewall" +
                      " delete-rule</handler><data>rulenum=[" + rec.m_ruleNo +
                      "]</data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
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

function UTM_nwPortConfigBusObj(busObj)
{
    /////////////////////////////////////
    // properties
    var thisObj = this;
    this.m_busObj = busObj;
    this.m_lastCmdSent = null;
    this.m_portConfigObj = null;
	this.m_GET_CMD = 'port-config get';
	this.m_SET_CMD = 'port-config set';

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
                    thisObj.m_portConfigObj = thisObj.f_parsePortConfig(err);
                    evt = new UTM_eventObj(0, thisObj.m_portConfigObj, '');
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

    this.f_parsePortConfig = function(response)
	{
		var a = new Array();
		var nodeArray = ['num', 'name', 'group', 'enable'];
		var nodeValue = [];

		var form = thisObj.f_getFormNode(response);
		var groupList = thisObj.f_parseGroupList(form);
		var portList =  thisObj.f_parsePortList(form);
		
		return new UTM_nwPortConfigObj(groupList, portList);
	}

    this.f_parsePortList = function(form)
	{
		var a = new Array();
		var nodeArray = ['num', 'name', 'group', 'enable'];
		var nodeValue = [];
		var portConfigNode = g_utils.f_xmlGetChildNode(form, 'port-config');
        var portNodeArray = g_utils.f_xmlGetChildNodeArray(portConfigNode, 'port');
		
		for (var j=0; j < portNodeArray.length; j++) {
			var portNode = portNodeArray[j];
			for (var i=0; i < nodeArray.length; i++) {
			    var cnode = g_utils.f_xmlGetChildNode(portNode, nodeArray[i]);
			    if (cnode != null) {
					var value = g_utils.f_xmlGetNodeValue(cnode);
					if (value != null) {
						nodeValue[nodeArray[i]] = value;
					}
				}		
			}
		    var num = (nodeValue['num'] == undefined)? '' : nodeValue['num'];
		    var name = (nodeValue['name'] == undefined)? '' : nodeValue['name'];
		    var group = (nodeValue['group'] == undefined)? '' : nodeValue['group'];
		    var enable = (nodeValue['enable'] == undefined)? 'false' : nodeValue['enable'];
		
		    a.push(new UTM_nwPortConfigRecord(num, name, group, enable));			
		}
        return a;		
	}
	
	this.f_parseGroupList = function(form)
	{
		var groupListNode = g_utils.f_xmlGetChildNode(form, 'port-group');
		var groupArray = g_utils.f_xmlGetChildNodeArray(groupListNode, 'group');
		var a = new Array();
		
		for (var i=0; i < groupArray.length; i++) {
			var value = g_utils.f_xmlGetNodeValue(groupArray[i]);
			if (value != null) {
			     a.push(value);
			}			
		}
		
		return a;
	}

	this.f_getPortConfig = function(guicb)
	{
		(g_devConfig.m_isLocalMode) ? thisObj.f_getPortConfigLocal(guicb) : thisObj.f_getPortConfigServer(guicb);
	}

    /**
     */
    this.f_getPortConfigServer = function(guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement mode='proc'>" +
                      "<handler>port-config get" +
                      "</handler><data></data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_setPortConfig = function(portConfigList, guicb)
	{
		if (g_devConfig.m_isLocalMode) {
			thisObj.f_setPortConfigLocal(portConfigList,guicb);
		} else {
			thisObj.f_setPortConfigServer(portConfigList,guicb);
		}
	}

	/**
     * perform a set dns configuration request to server.
     * @param dnsRecObj - dns config object.
     * @param guicb - gui callback function
     */
    this.f_setPortConfigServer = function(portConfigList, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>port-config" +
                      " set</handler><data>";
	    xmlstr += '<port-config>';
		for (var i=0; i < portConfigList.length; i++) {
			xmlstr += portConfigList[i].f_toXmlForSet();
		}			  					
        xmlstr +=  "</port-config></data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallbackSetCmd);
    }
	///////////////////////////////////////////////////////////////////////////////////////
	/////// begining simulation
	///////////////////////////////////////////////////////////////////////////////////////
    this.f_getPortConfigLocal = function(guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement mode='proc'>" +
                      "<handler>port-config get" +
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
                                   '<form name=\'port-config\' code=\'0\'>' +
								       '<port-group>' +
									       '<group>LAN</group>' +
										   '<group>LAN2</group>' +
										   '<group>DMZ</group>' +
										   '<group>WAN</group>' +
									   '</port-group>' +
                                       '<port-config>' +
									       '<port>' +
                                               '<num>4</num><name>Port E0</name><group>WAN</group><enable>true</enable>' +
										   '</port><port>' +
                                               '<num>1</num><name>Port E3</name><group>LAN2</group><enable>true</enable>' +
										   '</port><port>' +
										   	    '<num>2</num><name>Port E2</name><group>DMZ</group><enable>false</enable>' +
										   '</port><port>' +
                                                '<num>3</num><name>Port E1</name><group>LAN</group><enable>true</enable>' +
                                           '</port>' +
                                        '</port-config>' +									
                                    '</form>' +
                                '</msg>' +
                          '</error>' +
                  '</openappliance>');

        thisObj.f_respondRequestCallback(resp, guicb);
    }

    this.f_setPortConfigLocal = function(portConfigList, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>port-config" +
                      " set</handler><data>";
		xmlstr += '<port-config>';
		for (var i=0; i < portConfigList.length; i++) {
			xmlstr += portConfigList[i].f_toXmlForSet();
		}			  					
        xmlstr +=  "</port-config></data></statement></command>";

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
                                   '<form name=\'port-config\' code=\'0\'>' +
                                    '</form>' +
                                '</msg>' +
                          '</error>' +
                  '</openappliance>');
        thisObj.f_respondRequestCallback(resp, guicb);
    }
}

