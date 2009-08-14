/*
    Document   : utm_vpnBusObj.js
    Created on : Apr 01, 2009, 11:21:31 AM
    Author     : Kevin.Choi
    Description:
*/


/**
 * VPN data record
 */
function UTM_vpnRemoteUserRec(name, pw, group)
{
    this.m_userName = name;
    this.m_pw = pw;
    this.m_groupName = group;
}

function UTM_vpnRemoteTableRec(userRec, groupRec, status, enable)
{
    this.m_userRec = userRec;
    this.m_groupRec = groupRec;
    this.m_enable = enable;  // yes/no
    this.m_status = status;
}

function UTM_vpnRemoteUsrGrpRec(name, vpnsw, users, auth, ipalloc, internetAccess, mode,p1_proto,
                          exchangeMode, p1_encrypt, preshareKey, p1_auth, p1_dfsGrp, p1_lifetime,
						  localNetwork, remoteNetwork, p2_dfsGrp, p2_lifetime, p2_encrypt, p2_auth)
{
	this.m_name = name;
	this.m_vpnsw= vpnsw;
	this.m_users = users;
	this.m_auth = auth;
	this.m_ipalloc = ipalloc;
	this.m_internetAccess = internetAccess;
	this.m_mode = mode;
	this.m_p1_proto = p1_proto;
	this.m_exchangeMode = exchangeMode;
	this.m_p1_encrypt = p1_encrypt;
	this.m_preshareKey = preshareKey;
	this.m_p1_auth = p1_auth;
	this.m_p1_dfsGrp = p1_dfsGrp;
	this.m_p1_lifetime = p1_lifetime;
	this.m_localNetwork = localNetwork;
	this.m_remoteNetwork = remoteNetwork;
	this.m_p2_dfsGrp = p2_dfsGrp;
	this.m_p2_lifetime = p2_lifetime;
	this.m_p2_encrypt = p2_encrypt;
	this.m_p2_auth = p2_auth;

	this.f_setDefault = function()
	{
		this.m_name = '';
		this.m_vpnsw = 'cisco';
		this.m_users = new Array();
		this.m_auth = 'Xauth';
		this.m_ipalloc = 'internet DHCP';
		this.m_internetAccess = 'directly';
		this.m_mode = 'easy';
		this.m_preshareKey = '';
		this.m_p1_proto = 'ESP';
		this.m_exchangeMode = 'aggressive';
		this.m_p1_encrypt = 'DES';
		this.m_p1_auth = 'MD5';
		this.m_p1_dfsGrp = 'group 2';
		this.m_p1_lifetime = '';
		this.m_localNetwork = '';
		this.m_remoteNetwork = '';
		this.m_p2_dfsGrp = 'group 2';
		this.m_p2_lifetime = '';
		this.m_p2_encrypt = 'DES';
		this.m_p2_auth = 'MD5';
	}

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
    this.m_dfsGroup = null;
    this.m_lifeTime2 = null;
    this.m_encryption2 = null;
    this.m_auth2 = null;
    this.m_status = status;   // yes/no
    this.m_enable = enable;

    this.f_setDefault = function()
	{
        thisObj.m_mode = 'easy'; // easy or export
        thisObj.m_tunnel = '';
        thisObj.m_peerIp = '0.0.0.0';
        thisObj.m_remoteVpnDevice = 'Cisco';
        thisObj.m_presharedKey = null;
        thisObj.m_localNetwork = '0.0.0.0/24';
        thisObj.m_remoteNetwork = '0.0.0.0/24';
        thisObj.m_type = 'EXP/Tunnel';
        thisObj.m_exchange = 'Aggresive';
        thisObj.m_encryption1 = 'AES128';
        thisObj.m_auth1 = 'SHA1';
        thisObj.m_diffieHellmann = 'Group 5';
        thisObj.m_lifeTime1 = '';
        thisObj.m_dfsGroup = 'Group 5';
        thisObj.m_lifeTime2 = '';
        thisObj.m_encryption2 = 'AES128';
        thisObj.m_auth2 = 'SHA1';
        thisObj.m_status = 'yes';   // yes/no
        thisObj.m_enable = false;
	}

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
	
	this.f_toXml = function()
	{
		var xml = '<site-to-site>';
		if (thisObj.m_mode == 'easy') {
			xml += '<easy>';
		} else {
		    xml += '<expert>';
		}
		xml = xml + '<peerip>' + thisObj.m_peerIp + '</peerip>';
		xml = xml + '<tunnelname>' + thisObj.m_tunnel + '</tunnelname>';
		xml = xml + '<presharedkey>' + thisObj.m_presharedKey + '</presharedkey>';	
		xml = xml + '<lnet>' + thisObj.m_localNetwork + '</lnet>';
		xml = xml + '<rnet>' + thisObj.m_remoteNetwork + '</rnet>';
		if (thisObj.m_mode == 'expert') {
			xml = xml + '<type>' + thisObj.m_type + '</type>';
			xml = xml + '<emode>' + thisObj.m_exchange + '</emode>';
			xml = xml + '<ikeencrypt>' + thisObj.m_encryption1 + '</ikeencrypt>';
			xml = xml + '<espencrypt>' + thisObj.m_encryption2 + '</espencrypt>';
			xml = xml + '<dhgroup>' + thisObj.m_diffieHellmann + '</dhgroup>';
			xml = xml + '<ikeltime>' + thisObj.m_lifeTime1 + '</ikeltime>';
			xml = xml + '<espltime>' + thisObj.m_lifeTime2 + '</espltime>';
			xml = xml + '<ikeauth>' + thisObj.m_auth1 + '</ikeauth>';
			xml = xml + '<espauth>' + thisObj.m_auth2 + '</espauth>';
		} 
		if (thisObj.m_mode == 'easy') {
			xml += '</easy>';
		} else {
			xml += '</expert>';
		}
		xml += '</site-to-site>';
		return xml;
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

    /**
     * A callback function for request.
     */
    this.f_respondRequestCallback = function(resp, cmdSent, callback)
    {
        var response = thisObj.m_busObj.f_getRequestResponse(
                        thisObj.m_busObj.m_request);

        if (g_devConfig.m_isLocalMode) {
			response = resp;
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
                if(thisObj.m_lastCmdSent.indexOf("<handler>vpn site-to-site get") > 0)
                {
                    var vpnRec = thisObj.f_parseSite2SiteOverviewGet(err);
                    evt = new UTM_eventObj(0, vpnRec, '');
                }
                else if(thisObj.m_lastCmdSent.indexOf("<handler>vpn-remote get-overview") > 0)
                {
                    var vpnRec = thisObj.f_parseRemoteOverviewGet(err);
                    evt = new UTM_eventObj(0, vpnRec, '');
                }
            }

            if(thisObj.m_guiCb != undefined)
                thisObj.m_guiCb(evt);
        }
    }

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

    this.f_getFormErrMsg = function(form)
	{
		var errmsgNode = g_utils.f_xmlGetChildNode(form, 'errmsg');
		if (errmsgNode == null) return null;
		
		return g_utils.f_xmlGetNodeValue(errmsgNode);		
	}

    this.f_parseSite2SiteOverviewGet = function(resp)
    {
		var msgNode = g_utils.f_xmlGetChildNode(resp[0], 'msg');
        var s2sNodeArray = g_utils.f_xmlGetChildNodeArray(msgNode, 'site-to-site');
		var tagArray = ['peerip', 'presharedkey', 'tunnelname', 'lnet', 'rnet', 'type',
		                'emode', 'ikeencrypt', 'espencrypt', 'dhgroup', 'ikeltime',
						'espltime', 'ikeauth', 'espauth', 'status', 'enable'];
		var tagValue = [];				
        var vpn = new Array();
		
		if (s2sNodeArray == null) {
			return vpn;
		}

		for (var i = 0; i < s2sNodeArray.length; i++) {
			var s2sNode = g_utils.f_xmlGetChildNode(s2sNodeArray[i], 'easy');
			var mode = 'easy';
			if (s2sNode == null) {
				s2sNode = g_utils.f_xmlGetChildNode(s2sNodeArray[i], 'expert');
				mode = 'expert';
			}
			if (s2sNode == null) {
				continue;
			}
			for (var j = 0; j < tagArray.length; j++) {
				var cnode = g_utils.f_xmlGetChildNode(s2sNode, tagArray[j]);
				if (cnode != null) {
					var value = g_utils.f_xmlGetNodeValue(cnode);
					if (value != null) {
						tagValue[tagArray[j]] = value;
					}
				}
			}
			vpn[i] = new UTM_vpnRecord();
			vpn[i].m_tunnel = (tagValue['tunnelname'] == undefined)? '' : tagValue['tunnelname'];
			vpn[i].m_mode = mode;
			vpn[i].m_peerIp = (tagValue['peerip'] == undefined)? '' : tagValue['peerip'];
			vpn[i].m_remoteVpnDevice = 'cisco'; //MISSING DATA FROM BACKEND
			vpn[i].m_presharedKey = (tagValue['presharedkey'] == undefined)? '' : tagValue['presharedkey'];
			vpn[i].m_localNetwork = (tagValue['lnet'] == undefined)? '' : tagValue['lnet'];
			vpn[i].m_remoteNetwork = (tagValue['rnet'] == undefined)? '' : tagValue['rnet'];
			vpn[i].m_type= (tagValue['type'] == undefined)? 'ESP' : tagValue['type'];
			vpn[i].m_exchange= (tagValue['emode'] == undefined)? 'aggressive' : tagValue['emode'];
			vpn[i].m_encryption1= (tagValue['ikeencrypt'] == undefined)? 'DES' : tagValue['ikeencrypt'];
			vpn[i].m_auth1= (tagValue['ikeauth'] == undefined)? 'MD5' : tagValue['ikeauth'];
			vpn[i].m_diffieHellmann= (tagValue['dhgroup'] == undefined)? 'group 5' : tagValue['dhgroup'];
			vpn[i].m_dfsGroup= (tagValue['dhgroup'] == undefined)? 'group 5' : tagValue['dhgroup'];
			vpn[i].m_lifeTime1= (tagValue['ikeltime'] == undefined)? '' : tagValue['ikeltime'];
			vpn[i].m_lifeTime2= (tagValue['espltime'] == undefined)? '' : tagValue['espltime'];
			vpn[i].m_encryption2= (tagValue['espencrypt'] == undefined)? '' : tagValue['espencrypt'];
			vpn[i].m_auth2= (tagValue['espauth'] == undefined)? 'DES' : tagValue['espauth'];
			vpn[i].m_status= (tagValue['status'] == undefined)? 'yes' : tagValue['status'];
			vpn[i].m_enable= (tagValue['enable'] == undefined)? 'no' : tagValue['enable'];			
		}

        return vpn;
    }

    this.f_parseRemoteOverviewGet = function(resp)
    {
        var nodes = thisObj.m_busObj.f_getResponseChildNodes(resp, 'msg');
        var vpn = new Array();

        if(nodes != null)
        {
            for(var i=0; i<nodes.length; i++)
            {
                var n = nodes[i];
                if(n.nodeName == "vpn-remote")
                {
                    var vals = n.firstChild.nodeValue.split(":");

                    for(var j=0; j<vals.length; j++)
                    {
                        vpn[j] = new UTM_vpnRemoteTableRec();

                        vpn[j].m_userName = this.f_getValueFromNameValuePair("name", vals[j]);
                        vpn[j].m_groupName = this.f_getValueFromNameValuePair("group", vals[j]);
                        vpn[j].m_ipAllocation = this.f_getValueFromNameValuePair("localaddress", vals[j]);
                        vpn[j].m_internetAccess = this.f_getValueFromNameValuePair("ipaddress", vals[j]);
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
    this.f_getSite2SiteOverviewData = function(rec, guicb)
    {
		if (g_devConfig.m_isLocalMode) {
			thisObj.f_getSite2SiteOverviewDataLocal(rec,guicb);
		} else {
			thisObj.f_getSite2SiteOverviewDataServer(rec,guicb);
		}		
    }
	
    this.f_getSite2SiteOverviewDataServer = function(guicb)
	{
        thisObj.m_guiCb = guicb;
        var xmlstr = "<statement mode='proc'>" +
                      "<handler>vpn site-to-site get" +
                      "</handler><data></data></statement>";
        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);					  		
	}	

    this.f_getSite2SiteOverviewDataLocal = function(guicb)
	{
        thisObj.m_guiCb = guicb;
        var xmlstr = "<statement mode='proc'>" +
                      "<handler>vpn site-to-site get" +
                      "</handler><data></data></statement>";
		var cmdSend = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                       + "<openappliance>" + xmlstr + "</openappliance>\n";
        thisObj.m_lastCmdSent = cmdSend;
		
        var resp = '<?xml version="1.0" encoding="utf-8"?>' +
                        '<openappliance><token></token><error><code>0</code><msg>';
        
        for (var i=0; i<5; i++)
        {
			resp += '<site-to-site>';			
            var dis = i == 2 || i==4 ? "disconnected" : "connected";
            if (dis=="disconnected") {
			    resp += '<easy>';
				resp += '<tunnelname>' + i + '</tunnelname>';
				resp += '<peerip>192.168.1.' + i + '</peerip>';
				resp += '<presharedkey>test_key_' + i + '</presharedkey>';
				resp += '<lnet>10.1.3.' + i + '/24</lnet>';
				resp += '<rnet>10.1.2.' + i + '/24</rnet>';
				resp += '<status>' + dis + '</status>';
				resp += '<enable>no</enable>';
				resp += '</easy>';	
			} else {
			    resp += '<expert>';
				resp += '<tunnelname>' + i + '</tunnelname>';
				resp += '<peerip>192.168.1.' + i + '</peerip>';
				resp += '<presharedkey>test_key_' + i + '</presharedkey>';
				resp += '<lnet>10.1.3.' + i + '/24</lnet>';
				resp += '<rnet>10.1.2.' + i + '/24</rnet>';
				resp += '<type>ESP</type>';
				resp += '<emode>aggressive</emode>';
				resp += '<ikeencrypt>aes128</ikeencrypt>';
				resp += '<espencrypt>aes128</espencrypt>';
				resp += '<dhgroup>group 5</dhgroup>';
				resp += '<ikeltime>500</ikeltime>';
				resp += '<espltime>500</espltime>';
				resp += '<ikeauth>sha1</ikeauth>';
				resp += '<espauth>sha1</espauth>';
				resp += '<status>' + dis + '</status>';
				resp += '<enable>no</enable>';
				resp += '</expert>';					
			}
			resp += '</site-to-site>';	
        }
             
        resp += "</msg></error></openappliance>";      
        resp = g_utils.f_parseXmlFromString(resp);		
		
        thisObj.f_respondRequestCallback(resp, guicb);				
	}

    this.f_deleteSite2SiteOverviewConfig = function(tunnelName, cb)
    {
        thisObj.m_guiCb = cb;
        var xmlstr = "<statement mode='proc'>" +
                      "<handler>vpn-site2site delete-overview" +
                      "</handler><data>name=["+tunnelName+"]</data></statement>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_getRemoteOverviewData = function(guicb)
    {
        thisObj.m_guiCb = guicb;
        var xmlstr = "<statement mode='proc'>" +
                      "<handler>vpn-remote get-overview" +
                      "</handler><data></data></statement>";

        var cb = function()
        {
            var resp = '<?xml version="1.0" encoding="utf-8"?>' +
                        '<openappliance><token></token><error><code>0</code><msg><vpn-remote>';
            var sep = ":";

            for(var i=0; i<5; i++)
            {
                var dis = i == 2 || i==4 ? "disconnected" : "connected";

                if(i == 4) sep = "";
                resp += "name=[user_" + i + "],group=[group_" + i +
                        "],ipaddress=[10.1.2." + i + "],localaddress=[192.168.1." + i +
                        "],status=[" + dis + "],configmode=[expert],enable=[no]" +
                        sep;
            }

            resp += "</vpn-remote></msg></error></openappliance>";

            resp = g_utils.f_parseXmlFromString(resp);
            thisObj.m_simulationMode = true;
            thisObj.m_lastCmdSent = xmlstr;
            thisObj.f_respondRequestCallback(resp, xmlstr, guicb);
        }
        window.setTimeout(cb, 200);

        return;
        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_deleteRemoteOverviewConfig = function(userName, cb)
    {
        thisObj.m_guiCb = cb;
        var xmlstr = "<statement mode='proc'>" +
                      "<handler>vpn-remote delete-overview" +
                      "</handler><data>name=["+userName+"]</data></statement>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_setOverviewEnableValue = function(rec, guicb)
    {
        thisObj.m_guiCb = guicb;
        var xmlstr = "";

        if(rec.m_tunnel != null)
            xmlstr = "<statement mode='proc'>" +
                      "<handler>vpn-site2site set-overview-enable" +
                      "</handler><data>name=["+rec.m_tunnel+"],enable=[" +
                      rec.m_enable + "]</data></statement>";
        else
            xmlstr = "<statement mode='proc'>" +
                      "<handler>vpn-remote set-overview-enable" +
                      "</handler><data>name=["+rec.m_userName+"],enable=[" +
                      rec.m_enable + "]</data></statement>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_setSite2SiteConfig = function(rec, guicb)
	{
		if (g_devConfig.m_isLocalMode) {
			thisObj.f_setSite2SiteConfigLocal(rec,guicb);
		} else {
			thisObj.f_setSite2SiteConfigServer(rec,guicb);
		}
	}
	
    this.f_setSite2SiteConfigServer = function(rec, guicb)
    {
        thisObj.m_guiCb = guicb;
        var xmlstr = "<statement mode='proc'><handler>vpn site-to-site set</handler><data>";
	    xmlstr += rec.f_toXml();
        xmlstr +=  "</data></statement>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallbackSetCmd);
    }	

    this.f_setSite2SiteConfigLocal = function(rec, guicb)
    {
        thisObj.m_guiCb = guicb;
        var xmlstr = "<statement mode='proc'><handler>vpn site-to-site set</handler><data>";
	    xmlstr += rec.f_toXml();
        xmlstr +=  "</data></statement>";

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
                                   '<form name=\'site-to-site-easy\' code=\'0\'>' +
                                    '</form>' +
                                '</msg>' +
                          '</error>' +
                  '</openappliance>');
        thisObj.f_respondRequestCallback(resp, guicb);
    }

}