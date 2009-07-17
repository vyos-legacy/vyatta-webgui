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
    this.m_enabled = false;
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

    this.m_services = ["DNS-UDP", "DNS-TCP", "HTTP", "HTTPS", "FTP_DATA",
                        "FTP", "POP3", "SMTP", "SMTP-Auth", "TFTP", "POP3S",
                        "IMAP", "NTP", "NNTP", "SNMP", "Telnet", "SSH",
                        "L2TP", "Traceroute", "IPSec", "UNIK", "H323 host call - TCP",
                        "H323 host call - UDP", "SIP-TCP", "SIP-UDP",
                        "ICA-TCP", "ICA-UDP", "Others", " "];

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
                    'network-nat-pat get') > 0)
                {
                    thisObj.m_nwRec = thisObj.f_parseNatPatList(err);
                    evt = new UTM_eventObj(0, thisObj.m_nwRec, '');
                }
                else if(thisObj.m_lastCmdSent.indexOf(
                        'network-nat-pat next-rulenum') > 0)
                {
                    thisObj.m_nwRec = thisObj.f_parseNatPatNextRuleNo(err);
                    evt = new UTM_eventObj(0, thisObj.m_nwRec, '');
                }
            }

            if(thisObj.m_guiCb != undefined)
                thisObj.m_guiCb(evt);
        }
    }

    /**
     */
    this.f_parseNatPatNextRuleNo = function(response)
    {
        var nodes = thisObj.m_busObj.f_getResponseChildNodes(response, 'msg');

        if(nodes != null)
        {
            for(var i=0; i<nodes.length; i++)
            {
                var n = nodes[i];
                if(n.nodeName == "network-nat-pat")
                {
                    var vals = n.firstChild.nodeValue;
                    var rec = new UTM_nwNatPatRecord();

                    rec.m_ruleNo = this.f_getValueFromNameValuePair("rulenum", vals);
                    return rec;
                }
            }
        }

        return null;
    }

    this.f_parseNatPatList = function(response)
    {

    }

    this.f_parseRouteList = function(response)
    {
        var nodes = thisObj.m_busObj.f_getResponseChildNodes(response, 'msg');
        nodes = thisObj.m_busObj.f_getResponseChildNodes(nodes, 'static-route');
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

g_next = 0;
    this.f_getNatPatNextRuleNo = function(guicb)
    {
        var cb = function()
        {
            g_next++;
            var rec = new UTM_nwNatPatRecord(g_next+"");
            var evt = new UTM_eventObj(0, rec, '');
            guicb(evt);
        }

        window.setTimeout(cb, 500);
        return;

        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement mode='proc'>" +
                      "<handler>network-nat-pat next-rulenum" +
                      "</handler><data>rulename=[next]</data></statement></command>";

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

    this.f_deleteNatPat = function(rec, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>network-nat-pat" +
                      " delete</handler><data>rulenum=[" + rec.m_ruleNo +
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
		return this.m_busObj.f_getFormErrMsg(form);
	}

    this.f_getFormNode = function(response)
	{
		return this.m_busObj.f_getFormErrMsg(response);
	}

    this.f_getFormError = function(response)
	{
		return this.m_busObj.f_getFormError(response);
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
		return this.m_busObj.f_getFormErrMsg(form);
	}

    this.f_getFormNode = function(response)
	{
		return this.m_busObj.f_getFormNode(response);
	}

    this.f_getFormError = function(response)
	{
        return this.m_busObj.f_getFormError(response);
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

function UTM_nwDHCPmapRecord(name, ip, mac, enable)
{
	var thisObj = this;
	this.m_name = name;
	this.m_ip = ip;
	this.m_mac = mac;
	this.m_enable = enable;
	this.m_action = '';

	this.f_setAction = function(action) {
		thisObj.m_action = action;
	}

	this.f_toXml = function() {
		var xml = '<mapping><action>' + thisObj.m_action + '</action><tagname>' + thisObj.m_name + '</tagname>';
		xml += '<ip>' + thisObj.m_ip + '</ip><mac>' + thisObj.m_mac + '</mac>';
		xml += '<enable>' +  thisObj.m_enable + '</enable></mapping>';
		return xml;
	}

}

function UTM_nwDHCPmap(ifName, dhcpMapList)
{
	var thisObj = this;
	this.m_ifName = ifName;
	this.m_dhcpMapList = dhcpMapList;

	this.f_toXml = function() {
		var xml = '<mapping-config>';
		xml += '<interface>' + thisObj.m_ifName.toUpperCase() + '</interface>';
		for (var i=0; i < thisObj.m_dhcpMapList.length; i++) {
			xml += thisObj.m_dhcpMapList[i].f_toXml();
		}
		xml += '</mapping-config>';
		return xml;
	}
}

function UTM_nwIfConfigObj(name, ip, mask)
{
	var thisObj = this;
	this.m_name = name;
	this.m_ip = ip;
	this.m_mask = mask;

	this.f_toXml = function() {
		var xml = '<interface-config><interface>' + thisObj.m_name + '</interface>';
		xml += '<ip>' + thisObj.m_ip + '</ip><mask>' + thisObj.m_mask + '</mask></interface-config>';
		return xml;
	}

}

function UTM_nwDhcpConfigObj(name, enable, start, end, dnsMode, dnsPrimary, dnsSecondary)
{
	var thisObj = this;
	this.m_name = name;
	this.m_enable = enable;
	this.m_start = start;
	this.m_end = end;
	this.m_dnsMode = dnsMode;
	this.m_dnsPrimary = dnsPrimary;
	this.m_dnsSecondary = dnsSecondary;

	this.f_toXml = function() {
		var xml = '<dhcp-config><interface>' + thisObj.m_name.toUpperCase() + '</interface>';
		xml += '<enable>' + thisObj.m_enable + '</enable>';
		if (thisObj.m_enable=='true') {
			xml += '<start>' + thisObj.m_start + '</start>';
			xml += '<end>' + thisObj.m_end + '</end>';
			xml += '<dns-mode>' + thisObj.m_dnsMode + '</dns-mode>';
			xml += '<primary-dns>' + thisObj.m_dnsPrimary + '</primary-dns>';
			xml += '<secondary-dns>' + thisObj.m_dnsSecondary + '</secondary-dns>';
		}
		xml += '</dhcp-config>';
		return xml;
	}

}

function UTM_nwIfBusObj(busObj)
{
	/////////////////////////////////////
	// properties
	var thisObj = this;
	this.m_busObj = busObj;
	this.m_lastCmdSent = null;
	this.m_ifConfigObj = null;
	this.m_dhcpConfigObj = null;
	this.m_dhcpMap = null;
	this.m_GET_IF_CMD = 'interface-config get';
	this.m_SET_IF_CMD = 'interface-config set';
	this.m_GET_DHCP_CMD = 'dhcp-config get';
	this.m_SET_DHCP_CMD = 'dhcp-config set';
	this.m_GET_DHCP_MAP_CMD = 'dhcp-static-mapping get';
	this.m_SET_DHCP_MAP_CMD = 'dhcp-static-mapping set';

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
                var tmp = thisObj.m_busObj.f_getFormError(err);
				if (tmp != null) { //form has error
					if (thisObj.m_guiCb != undefined) {
						return thisObj.m_guiCb(tmp);
					}
				}
                if (thisObj.m_lastCmdSent.indexOf(thisObj.m_GET_IF_CMD) > 0) {
                    thisObj.m_ifConfigObj = thisObj.f_parseIfConfig(err);
                    evt = new UTM_eventObj(0, thisObj.m_ifConfigObj, '');
				} else if (thisObj.m_lastCmdSent.indexOf(thisObj.m_GET_DHCP_CMD) > 0) {
                    thisObj.m_dhcpConfigObj = thisObj.f_parseDhcpConfig(err);
                    evt = new UTM_eventObj(0, thisObj.m_dhcpConfigObj, '');
				} else if (thisObj.m_lastCmdSent.indexOf(thisObj.m_GET_DHCP_MAP_CMD) > 0) {
                    thisObj.m_dhcpMap = thisObj.f_parseDhcpMap(err);
                    evt = new UTM_eventObj(0, thisObj.m_dhcpMap, '');
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
				var tmp = thisObj.m_busObj.f_getFormError(err);
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

	this.f_parseIfName = function(form)
	{
		var ifNode = g_utils.f_xmlGetChildNode(form, 'interface');
		if (ifNode == null) {
			return '';
		}
        return g_utils.f_xmlGetNodeValue(ifNode);
	}

	this.f_getNodeValue = function(node)
	{
		var nodeValue = g_utils.f_xmlGetNodeValue(node);
		if (nodeValue == null) {
			nodeValue = '';
		}
		return nodeValue;
	}

	this.f_parseDhcpMapList = function(mapConfigNode)
	{
		var a = new Array();
		var nodeArray = ['tagname', 'ip', 'mac', 'enable'];
		var nodeValue = [];
        var mapNodeArray = g_utils.f_xmlGetChildNodeArray(mapConfigNode, 'mapping');

		for (var j=0; j < mapNodeArray.length; j++) {
			var mapNode = mapNodeArray[j];
			for (var i=0; i < nodeArray.length; i++) {
			    var cnode = g_utils.f_xmlGetChildNode(mapNode, nodeArray[i]);
			    if (cnode != null) {
					var value = g_utils.f_xmlGetNodeValue(cnode);
					if (value != null) {
						nodeValue[nodeArray[i]] = value;
					}
				}
			}
		    var name = (nodeValue['tagname'] == undefined)? '' : nodeValue['tagname'];
		    var ip = (nodeValue['ip'] == undefined)? '' : nodeValue['ip'];
		    var mac = (nodeValue['mac'] == undefined)? '' : nodeValue['mac'];
		    var enable = (nodeValue['enable'] == undefined)? 'false' : nodeValue['enable'];

		    a.push(new UTM_nwDHCPmapRecord(name, ip, mac, enable));
		}
        return a;
	}

    this.f_parseDhcpMap= function(response)
	{
		var a = new Array();
		var nodeArray = ['num', 'name', 'group', 'enable'];
		var nodeValue = [];

		var form = thisObj.m_busObj.f_getFormNode(response);
		var mapConfigNode = g_utils.f_xmlGetChildNode(form, 'mapping-config');
		var ifName = thisObj.f_parseIfName(mapConfigNode);
		var dhcpMapList =  thisObj.f_parseDhcpMapList(mapConfigNode);

		return new UTM_nwDHCPmap(ifName, dhcpMapList);
	}

    this.f_parseIfConfig= function(response)
	{
		var form = thisObj.m_busObj.f_getFormNode(response);
		var ifNode = g_utils.f_xmlGetChildNode(form,'interface-config');
		var ifName = thisObj.f_parseIfName(ifNode);
		var ip = thisObj.f_getNodeValue(ifNode);
		var mask = thisObj.f_getNodeValue(ifNode);

		return new UTM_nwIfConfigObj(ifName, ip, mask);
	}

    this.f_parseDhcpConfig= function(response)
	{
		var form = thisObj.m_busObj.f_getFormNode(response);
		var ifName = thisObj.f_parseIfName(form);
		var dhcpNode = g_utisl.f_xmlGetChildNode(form, 'dhcp-config');
		var enable = g_utils.f_xmlGetNodeValue(dhcpNode);
        if (enable==null) enable='false';
		var start = thisObj.f_getNodeValue(dhcpNode);
		var end = thisObj.f_getNodeValue(dhcpNode);
		var dnsMode = thisObj.f_getNodeValue(dhcpNode);
		var dnsPrimary = thisObj.f_getNodeValue(dhcpNode);
		var dnsSecondary = thisObj.f_getNodeValue(dhcpNode);

		return new UTM_nwDhcpConfigObj(ifName, enable, start, end, dnsMode, dnsPrimary, dnsSecondary);
	}

	this.f_getIfConfig = function(ifName, guicb)
	{
		(g_devConfig.m_isLocalMode) ? thisObj.f_getIfConfigLocal(ifName, guicb) : thisObj.f_getIfConfigServer(ifName, guicb);
	}

	this.f_getDhcpConfig = function(ifName, guicb)
	{
		(g_devConfig.m_isLocalMode) ? thisObj.f_getDhcpConfigLocal(ifName, guicb) : thisObj.f_getDhcpConfigServer(ifName, guicb);
	}

	this.f_getDhcpMap = function(ifName, guicb)
	{
		(g_devConfig.m_isLocalMode) ? thisObj.f_getDhcpMapLocal(ifName, guicb) : thisObj.f_getDhcpMapServer(ifName, guicb);
	}

    this.f_getIfConfigServer = function(ifName, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement mode='proc'>" +
                      "<handler>interface-config get" +
                      "</handler><data>" + ifName.toUpperCase() + "</data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_getDhcpConfigServer = function(ifName, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement mode='proc'>" +
                      "<handler>dhcp-config get" +
                      "</handler><data>" + ifName.toUpperCase() + "</data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_getDhcpMapServer = function(ifName, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement mode='proc'>" +
                      "<handler>dhcp-static-mapping get" +
                      "</handler><data>" + ifName.toUpperCase() + "</data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_setIfConfig = function(ifConfigObj, guicb)
	{
	    (g_devConfig.m_isLocalMode) ? thisObj.f_setIfConfigLocal(ifConfigObj, guicb) : thisObj.f_getIfConfigServer(ifConfigObj, guicb);
	}

    this.f_setDhcpConfig = function(dhcpConfigObj, guicb)
	{
	    (g_devConfig.m_isLocalMode) ? thisObj.f_setDhcpConfigLocal(dhcpConfigObj, guicb) : thisObj.f_getDhcpConfigServer(dhcpConfigObj, guicb);
	}

    this.f_setDhcpMap = function(dhcpMap, guicb)
	{
	    (g_devConfig.m_isLocalMode) ? thisObj.f_setDhcpMapLocal(dhcpMap, guicb) : thisObj.f_getDhcpMapServer(dhcpMap, guicb);
	}

    this.f_setIfConfigServer = function(ifConfigObj, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>interface-config" +
                      " set</handler><data>";
	    xmlstr += ifConfigObj.f_toXml();
        xmlstr +=  "</data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallbackSetCmd);
    }

	this.f_setDhcpConfigServer = function(dhcpConfigObj, guicb)
	{
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>dhcp-config set</handler><data>";
	    xmlstr += dhcpConfigObj.f_toXml();
        xmlstr +=  "</data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallbackSetCmd);
	}

    this.f_setDhcpMapServer = function(dhcpMap, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>dhcp-static-mapping set</handler><data>";
	    xmlstr += dhcpMap.f_toXml();
        xmlstr +=  "</data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallbackSetCmd);
    }

	///////////////////////////////////////////////////////////////////////////////////////
	/////// begining simulation
	///////////////////////////////////////////////////////////////////////////////////////
    this.f_getIfConfigLocal = function(ifName, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement mode='proc'>" +
                      "<handler>interface-config get" +
                      "</handler><data>" + ifName.toUpperCase() + "</data></statement></command>";
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
                                   '<form name=\'interface-config\' code=\'0\'>' +
								       '<interface-config>' +
								           '<interface>' + ifName.toUppderCase() + '</interface>' +
									       '<ip>192.168.1.1</ip>' +
									       '<mask>21</mask>' +
									   '</interface-config>' +
                                    '</form>' +
                                '</msg>' +
                          '</error>' +
                  '</openappliance>');

        thisObj.f_respondRequestCallback(resp, guicb);
    }

    this.f_getDhcpConfigLocal = function(ifName, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();

        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>dhcp-config get</handler><data>";
	    xmlstr += ifName.toUpperCase();
        xmlstr +=  "</data></statement></command>";
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
                                   '<form name=\'dhcp-config\' code=\'0\'>' +
									   '<dhcp-config>' +
								           '<interface>' + ifName.toUppderCase() + '</interface>' +
									       '<enable>true</enable>' +
									       '<start>192.168.1.2</start>' +
										   '<end>192.168.1.254</end>' +
										   '<dns-mode>static</dns-mode>' +
										   '<primary-dns>192.168.1.51</primary-dns>' +
										   '<secondary-dns>192.168.1.53</secondary-dns>' +
									   '</dhcp-config>' +
                                    '</form>' +
                                '</msg>' +
                          '</error>' +
                  '</openappliance>');

        thisObj.f_respondRequestCallback(resp, guicb);
    }

    this.f_getDhcpMapLocal = function(ifName, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();

        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>dhcp-static-mapping get</handler><data>";
	    xmlstr += ifName.toUpperCase();
        xmlstr +=  "</data></statement></command>";
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
                                   '<form name=\'dhcp-static-mapping\' code=\'0\'>' +
									   '<mapping-config>' +
								           '<interface>' + ifName.toUpperCase() + '</interface>' +
									       '<mapping>' +
									           '<tagname>one</tagname>' +
									           '<ip>192.168.1.2</ip>' +
										       '<mac>24:ef:03:04:dd:10</mac>' +
										       '<enable>true</enable>' +
                                           '</mapping>' +
									       '<mapping>' +
									           '<tagname>two</tagname>' +
									           '<ip>192.168.1.3</ip>' +
										       '<mac>24:ef:03:04:dd:20</mac>' +
										       '<enable>false</enable>' +
                                           '</mapping>' +
									   '</mapping-config>' +
                                    '</form>' +
                                '</msg>' +
                          '</error>' +
                  '</openappliance>');

        thisObj.f_respondRequestCallback(resp, guicb);
    }

    this.f_setIfConfigLocal = function(ifConfigObj, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();

        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>interface-config set</handler><data>";
	    xmlstr += ifConfigObj.f_toXml();
        xmlstr +=  "</data></statement></command>";
        var cmdSend = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                       + "<openappliance>" + xmlstr + "</openappliance>\n";

        thisObj.m_lastCmdSent = cmdSend;

		alert ('cmdSend: ' + cmdSend);

		var resp = g_utils.f_parseXmlFromString(
		    '<?xml version="1.0" encoding="utf-8"?>' +
                '<openappliance>' +
                    '<token></token>' +
                        '<error>' +
                            '<code>0</code>' +
                               '<msg>' +
                                   '<form name=\'interface-config\' code=\'0\'>' +
                                    '</form>' +
                                '</msg>' +
                          '</error>' +
                  '</openappliance>');
        thisObj.f_respondRequestCallbackSetCmd(resp, guicb);
    }

    this.f_setDhcpConfigLocal = function(dhcpConfigObj, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();

        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>dhcp-config set</handler><data>";
	    xmlstr += dhcpConfigObj.f_toXml();
        xmlstr +=  "</data></statement></command>";
        var cmdSend = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                       + "<openappliance>" + xmlstr + "</openappliance>\n";

        thisObj.m_lastCmdSent = cmdSend;

		alert ('cmdSend: ' + cmdSend);

		var resp = g_utils.f_parseXmlFromString(
		    '<?xml version="1.0" encoding="utf-8"?>' +
                '<openappliance>' +
                    '<token></token>' +
                        '<error>' +
                            '<code>0</code>' +
                               '<msg>' +
                                   '<form name=\'dhcp-config\' code=\'0\'>' +
                                    '</form>' +
                                '</msg>' +
                          '</error>' +
                  '</openappliance>');
        thisObj.f_respondRequestCallbackSetCmd(resp, guicb);
    }

    this.f_setDhcpMapLocal = function(dhcpMap, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();

        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>dhcp-static-mapping set</handler><data>";
	    xmlstr += dhcpMap.f_toXml();
        xmlstr +=  "</data></statement></command>";
        var cmdSend = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                       + "<openappliance>" + xmlstr + "</openappliance>\n";

        thisObj.m_lastCmdSent = cmdSend;

		alert ('cmdSend: ' + cmdSend);

		var resp = g_utils.f_parseXmlFromString(
		    '<?xml version="1.0" encoding="utf-8"?>' +
                '<openappliance>' +
                    '<token></token>' +
                        '<error>' +
                            '<code>0</code>' +
                               '<msg>' +
                                   '<form name=\'dhcp-static-mapping\' code=\'0\'>' +
                                    '</form>' +
                                '</msg>' +
                          '</error>' +
                  '</openappliance>');
        thisObj.f_respondRequestCallbackSetCmd(resp, guicb);
    }
}

