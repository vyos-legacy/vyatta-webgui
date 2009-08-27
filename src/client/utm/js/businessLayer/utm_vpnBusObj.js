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
	this.m_enable = 'no';
	var thisObj =  this;

	this.f_setDefault = function()
	{
	    this.m_userName = '';
		this.m_pw = '';
		this.m_groupName = '';
		this.m_enable = 'no';
	}

	this.f_toXml = function(action)
	{
		var xml = '<remote_user>';
		xml += '<action>' + action + '</action>';
		xml = xml + '<username>' + thisObj.m_userName + '</username>';
		xml = xml + '<passwd><![CDATA[' + thisObj.m_pw + ']]></passwd>';
		xml = xml + '<groupname>' + thisObj.m_groupName + '</groupname>';
		xml += '</remote_user>';
		return xml;
	}
}

function UTM_vpnRemoteOverviewRec(userName, groupName, ipAddr, localIpAddr,
                                  mode, status, enable)
{
    this.m_userName = userName;
    this.m_groupName = groupName;
    this.m_ipAddr = ipAddr==null?"":ipAddr;   // remote ip
    this.m_localIpAddr = localIpAddr==null?"":localIpAddr;
    this.m_mode = mode == null?"easy":mode; // easy/expert
    this.m_enable = enable==null?"no":enable;  // yes/no
    this.m_status = status==null?"disconnected":status;
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
	this.m_start = '';
	this.m_stop = '';
        this.m_enable = 'no';
	var thisObj = this;

	this.f_setDefault = function()
	{
		this.m_name = '';
		this.m_vpnsw = 'microsoft';
		this.m_users = new Array();
		this.m_auth = 'l2tp';
		this.m_ipalloc = 'static';
		this.m_internetAccess = 'directly';
		this.m_mode = 'easy';
		this.m_preshareKey = '';
		this.m_p1_proto = 'esp';
		this.m_exchangeMode = 'aggressive';
		this.m_p1_encrypt = 'des';
		this.m_p1_auth = 'md5';
		this.m_p1_dfsGrp = '2';
		this.m_p1_lifetime = '';
		this.m_localNetwork = '';
		this.m_remoteNetwork = '';
		this.m_p2_dfsGrp = '2';
		this.m_p2_lifetime = '';
		this.m_p2_encrypt = 'des';
		this.m_p2_auth = 'md5';
		this.m_start = '';
		this.m_stop = '';

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

	this.f_toXml = function(action)
	{
		var xml = '<remote_group>';
		xml += '<action>' + action + '</action>';
		if (thisObj.m_mode == 'easy') {
			xml += '<mode>easy</mode>';
		} else {
		    xml += '<mode>expert</mode>';
		}
		xml = xml + '<name>' + thisObj.m_name + '</name>';
                xml += "<enable>" + thisObj.m_enable + "</enable>";
		xml = xml + '<vpnsw>' + thisObj.m_vpnsw + '</vpnsw>';
		xml = xml + '<users>';
		for (var i=0; i < thisObj.m_users.length; i++) {
		    xml = xml + '<user>' + thisObj.m_users[i] + '</user>';
		}
		xml = xml + '</users>';
		xml = xml + '<groupauth>' + thisObj.m_auth + '</groupauth>';
		if (thisObj.m_ipalloc == 'static') {
			xml = xml + '<ipalloc><static><start>' + thisObj.m_start + '</start><stop>' + thisObj.m_stop + '</stop></static></ipalloc>';
		} else {
			xml = xml + '<ipalloc><dhcp/></ipalloc>';
		}
		xml = xml + '<iaccess>' + thisObj.m_internetAccess + '</iaccess>';
		xml = xml + '<presharedkey>' + thisObj.m_preshareKey + '</presharedkey>';

		if (thisObj.m_mode == 'expert') {
			xml = xml + '<type>' + thisObj.m_p1_proto + '</type>';
			xml = xml + '<emode>' + thisObj.m_exchangeMode + '</emode>';
			xml = xml + '<ikeencrypt>' + thisObj.m_p1_encrypt + '</ikeencrypt>';
			xml = xml + '<ikeauth>' + thisObj.m_p1_auth + '</ikeauth>';
			xml = xml + '<dhgroup>' + thisObj.m_p1_dfsGrp + '</dhgroup>';
			xml = xml + '<ikeltime>' + thisObj.m_p1_lifetime + '</ikeltime>';
			xml = xml + '<lnet>' + thisObj.m_localNetwork + '</lnet>';
		    xml = xml + '<rnet>' + thisObj.m_remoteNetwork + '</rnet>';
			xml = xml + '<espdhgroup>' + thisObj.m_p2_dfsGrp + '</espdhgroup>';
			xml = xml + '<espltime>' + thisObj.m_p2_lifetime + '</espltime>';
			xml = xml + '<espencrypt>' + thisObj.m_p2_encrypt + '</espencrypt>';
			xml = xml + '<espauth>' + thisObj.m_p2_auth + '</espauth>';
		}
		xml += '</remote_group>';
		return xml;
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
        thisObj.m_remoteVpnDevice = 'cisco';
        thisObj.m_presharedKey = null;
        thisObj.m_localNetwork = '0.0.0.0/24';
        thisObj.m_remoteNetwork = '0.0.0.0/24';
        thisObj.m_type = 'ESP/Tunnel';
        thisObj.m_exchange = 'aggresive';
        thisObj.m_encryption1 = 'aes128';
        thisObj.m_auth1 = 'pre-shared-secret';
        thisObj.m_diffieHellmann = '5';
        thisObj.m_lifeTime1 = '';
        thisObj.m_dfsGroup = '5';
        thisObj.m_lifeTime2 = '';
        thisObj.m_encryption2 = 'aes128';
        thisObj.m_auth2 = 'sha1';
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
			xml += '<easy/>';
		} else {
		    xml += '<expert/>';
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
		} else if (thisObj.m_simulationMode) {
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
                if(thisObj.m_lastCmdSent.indexOf("<handler>vpn site-to-site get") > 0) {
                    var vpnRec = thisObj.f_parseSite2SiteOverviewGet(err);
                    evt = new UTM_eventObj(0, vpnRec, '');
                } else { //These APIs have the form tag.  Check for form error.
                    var tmp = thisObj.m_busObj.f_getFormError(err);
                    if (tmp != null) { //form has error
                        if (thisObj.m_guiCb != undefined) {
                                return thisObj.m_guiCb(tmp);
                        }
                    } else {
                        if(thisObj.m_lastCmdSent.indexOf("<handler>vpn remote-access get-user") > 0)
                        {
                            var vpnRec = thisObj.f_parseRemoteOverviewGet(err);
                            evt = new UTM_eventObj(0, vpnRec, '');
                        }
                        else if (thisObj.m_lastCmdSent.indexOf("<handler>vpn remote-access get_group") > 0) {
                                    var groupList = thisObj.f_parseRemoteUserGroupGet(err);
                                    evt = new UTM_eventObj(0, groupList, '');
                        } else if (thisObj.m_lastCmdSent.indexOf("<handler>vpn remote-access get_user") > 0) {
                                var userList = thisObj.f_parseRemoteUserGet(err);
                                evt = new UTM_eventObj(0, userList, '');
                        }
                    }
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
						'espltime', 'ikeauth', 'espauth', 'status', 'disable'];
		var tagValue = [];
        var vpn = new Array();

		if (s2sNodeArray == null) {
			return vpn;
		}

		for (var i = 0; i < s2sNodeArray.length; i++) {
			/*
			var s2sNode = g_utils.f_xmlGetChildNode(s2sNodeArray[i], 'easy');
			var mode = 'easy';
			if (s2sNode == null) {
				s2sNode = g_utils.f_xmlGetChildNode(s2sNodeArray[i], 'expert');
				mode = 'expert';
			}
			*/
			var s2sNode = s2sNodeArray[i];
			var mode = 'easy';
			var modeNode = g_utils.f_xmlGetChildNode(s2sNode, 'easy');
			if (modeNode == null) {
				modeNode = g_utils.f_xmlGetChildNode(s2sNode, 'expert');
				if (modeNode == null) {
					continue;
				} else {
					mode = 'expert';
				}
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
			vpn[i].m_type= (tagValue['type'] == undefined)? 'esp' : tagValue['type'];
			vpn[i].m_exchange= (tagValue['emode'] == undefined)? 'aggressive' : tagValue['emode'];
			vpn[i].m_encryption1= (tagValue['ikeencrypt'] == undefined)? 'des' : tagValue['ikeencrypt'];
			vpn[i].m_auth1= (tagValue['ikeauth'] == undefined)? 'pre-shared-secret' : tagValue['ikeauth'];
			vpn[i].m_diffieHellmann= (tagValue['dhgroup'] == undefined)? '5' : tagValue['dhgroup'];
			vpn[i].m_dfsGroup= (tagValue['dhgroup'] == undefined)? '5' : tagValue['dhgroup'];
			vpn[i].m_lifeTime1= (tagValue['ikeltime'] == undefined)? '' : tagValue['ikeltime'];
			vpn[i].m_lifeTime2= (tagValue['espltime'] == undefined)? '' : tagValue['espltime'];
			vpn[i].m_encryption2= (tagValue['espencrypt'] == undefined)? '' : tagValue['espencrypt'];
			vpn[i].m_auth2= (tagValue['espauth'] == undefined)? 'des' : tagValue['espauth'];
			vpn[i].m_status= (tagValue['status'] == undefined)? 'yes' : tagValue['status'];
			vpn[i].m_enable= (tagValue['disable'] == undefined)? 'yes' : 'no';
		}

        return vpn;
    }

    this.f_parseRemoteOverviewGet = function(resp)
    {
        var nodes = thisObj.m_busObj.f_getResponseChildNodes(resp, 'msg');
        nodes = thisObj.m_busObj.f_getResponseChildNodes(resp, 'remote_user');
        var vpn = new Array();

        if(nodes != null)
        {
            for(var i=0; i<nodes.length; i++)
            {
                var n = nodes[i];

                if(n.nodeName == "remote_user")
                {
                    var rec = new UTM_vpnRemoteOverviewRec();
                    for(var j=0; j<n.childNodes.length; j++)
                    {
                        var cNode = n.childNodes[j];
                        if(cNode == undefined) continue;

                        if(cNode.nodeName == "username" && cNode.firstChild != undefined)
                            rec.m_userName = cNode.firstChild.nodeValue;
                        else if(cNode.nodeName == "groupname" && cNode.firstChild != undefined)
                            rec.m_groupName = cNode.firstChild.nodeValue;
                        else if(cNode.nodeName == "enable" && cNode.firstChild != undefined)
                            rec.m_enable = cNode.firstChild.nodeValue;
                        else if(cNode.nodeName == "remoteip" && cNode.firstChild != undefined)
                            rec.m_ipAddr = cNode.firstChild.nodeValue;
                        else if(cNode.nodeName == "localip" && cNode.firstChild != undefined)
                            rec.m_localIpAddr = cNode.firstChild.nodeValue;
                        else if(cNode.nodeName == "status" && cNode.firstChild != undefined)
                            rec.m_status = cNode.firstChild.nodeValue;
                        else if(cNode.nodeName == "mode" && cNode.firstChild != undefined)
                            rec.m_mode = cNode.firstChild.nodeValue;
                    }
                    vpn.push(rec);
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
			    resp += '<easy/>';
				resp += '<tunnelname>' + i + '</tunnelname>';
				resp += '<peerip>192.168.1.' + i + '</peerip>';
				resp += '<presharedkey>test_key_' + i + '</presharedkey>';
				resp += '<lnet>10.1.3.' + i + '/24</lnet>';
				resp += '<rnet>10.1.2.' + i + '/24</rnet>';
				resp += '<status>' + dis + '</status>';
				resp += '<disable/>';
			} else {
			    resp += '<expert/>';
				resp += '<tunnelname>' + i + '</tunnelname>';
				resp += '<peerip>192.168.1.' + i + '</peerip>';
				resp += '<presharedkey>test_key_' + i + '</presharedkey>';
				resp += '<lnet>10.1.3.' + i + '/24</lnet>';
				resp += '<rnet>10.1.2.' + i + '/24</rnet>';
				resp += '<type>esp</type>';
				resp += '<emode>aggressive</emode>';
				resp += '<ikeencrypt>aes128</ikeencrypt>';
				resp += '<espencrypt>aes128</espencrypt>';
				resp += '<dhgroup>5</dhgroup>';
				resp += '<ikeltime>500</ikeltime>';
				resp += '<espltime>500</espltime>';
				resp += '<ikeauth>sha1</ikeauth>';
				resp += '<espauth>sha1</espauth>';
				resp += '<status>' + dis + '</status>';
				resp += '<disable/>';
			}
			resp += '</site-to-site>';
        }

        resp += "</msg></error></openappliance>";
        resp = g_utils.f_parseXmlFromString(resp);

        thisObj.f_respondRequestCallback(resp, guicb);
	}

    this.f_deleteSite2SiteOverviewConfig = function(rec, cb)
    {
        thisObj.m_guiCb = cb;
        var xmlstr = "<statement mode='proc'>" +
                      "<handler>vpn site-to-site delete" +
                      "</handler><data><site-to-site>" +
					  "<peerip>" + rec.m_peerIp + "</peerip>" +
					  //"<tunnelname>" + rec.m_tunnel + "</tunnelname>" +
					  "</site-to-site></data></statement>";


        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_getRemoteOverviewData = function(guicb)
    {
        thisObj.m_guiCb = guicb;
        var xmlstr = "<statement mode='proc'>" +
                      "<handler>vpn remote-access get-user" +
                      "</handler><data><remote_user></remote_user></data></statement>";
/*/
        var cb = function()
        {
            var resp = '<?xml version="1.0" encoding="utf-8"?>' +
                        '<openappliance><token></token><error><code>0</code><msg>';
            //resp += "<form name='vpn remote-access get_user' code='0'>";

            for(var i=0; i<1; i++)
            {
                resp += "<remote_user>" +
                      "<username>username</username>" +
                      "<passwd>string</passwd>" +
                      "<groupname>groupname</groupname>" +
                      "<enable>yes</enable>" +
                      "<remoteip>1.3.3." + i + "</remoteip>" +
                      "<localip>33.33.33.1" + i + "</localip>" +
                      "<status>disconnected</status>" +
                      "<mode>easy</mode>" +
                      "</remote_user>";
            }

            resp += "</vpn remote-access get_user></msg></error></openappliance>";

            resp = g_utils.f_parseXmlFromString(resp);
            thisObj.m_simulationMode = true;
            thisObj.m_lastCmdSent = xmlstr;
            thisObj.f_respondRequestCallback(resp, xmlstr, guicb);
			thisObj.m_simulationMode = false;
        }
        window.setTimeout(cb, 200);

        return;
        */
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

        if (rec.m_tunnel != null) {
			xmlstr = "<statement mode='proc'>" +
			"<handler>vpn site-to-site disable" +
			"</handler><data><site-to-site><peerip>" +
			rec.m_peerIp +
			"</peerip>";
			if (rec.m_enable == 'yes') {
				xmlstr += "<disable>false</disable>";
			} else {
				xmlstr += "<disable>true</disable>"
			}
			xmlstr += "</site-to-site></data></statement>";
		} else {
			xmlstr = "<statement mode='proc'>" +
			"<handler>vpn-remote set-overview-enable" +
			"</handler><data>name=[" +
			rec.m_userName +
			"],enable=[" +
			rec.m_enable +
			"]</data></statement>";
		}
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

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
	///// Remote Group
	///////////////////////////////////////////////////////////////////////////////////////////////////////
    this.f_parseRemoteUserGroupGet = function(resp)
	{
		var form = thisObj.m_busObj.f_getFormNode(resp);
        var rgNodeArray = g_utils.f_xmlGetChildNodeArray(form, 'remote_group');
		//<users>, <ipalloc> are special cases, will be processed separately.
		var tagArray = ['mode','name', 'vpnsw', 'groupauth', 'iaccess', 'presharedkey',
		                'enable', 'type', 'emode', 'ikeencrypt', 'ikeauth',
						'dhgroup', 'ikeltime', 'lnet', 'rnet', 'espdhgroup', 'espltime',
						'espencrypt', 'espauth'];
		var tagValue = [];
        var groupList = new Array();

		if (rgNodeArray == null)
		    return groupList;

		for (var i = 0; i < rgNodeArray.length; i++) {
			var rgNode = rgNodeArray[i];

			for (var j = 0; j < tagArray.length; j++) {
				var cnode = g_utils.f_xmlGetChildNode(rgNode, tagArray[j]);
				if (cnode != null) {
					var value = g_utils.f_xmlGetNodeValue(cnode);
					if (value != null) {
						tagValue[tagArray[j]] = value;
					}
				}
			}
			groupList[i] = new UTM_vpnRemoteUsrGrpRec();
			//parse user list.
			groupList[i].m_users = new Array();
			var uNode = g_utils.f_xmlGetChildNode(rgNode, 'users');
			if (uNode != null) {
				var uNodeArray = g_utils.f_xmlGetChildNodeArray(uNode, 'user');
				if (uNodeArray != null) {
				    for (var j=0 ; j < uNodeArray.length; j++) {
						var value = g_utils.f_xmlGetNodeValue(uNodeArray[j]);
						if (value != null) {
							groupList[i].m_users.push(value);
						}
					}
				}
			}
            //parse ip allocation.
            var iNode = g_utils.f_xmlGetChildNode(rgNode, 'ipalloc');
			if (iNode == null) {
				groupList[i].m_ipalloc = 'static';
				groupList[i].m_start = '';
			    groupList[i].m_stop = '';
			} else {
				var iSubNode = g_utils.f_xmlGetChildNode(iNode, 'static');
				if (iSubNode != null) {
					groupList[i].m_ipalloc = 'static';
					var value = g_utils.f_xmlGetChildNodeValue(iSubNode, 'start');
					groupList[i].m_start = (value == null)? '' : value;
					value = g_utils.f_xmlGetChildNodeValue(iSubNode, 'stop');
					groupList[i].m_stop = (value == null)? '' : value;
				}
			}

			groupList[i].m_name = (tagValue['name'] == undefined)? '' : tagValue['name'];
			groupList[i].m_mode = (tagValue['mode'] == undefined)? 'easy' : tagValue['mode'];
			groupList[i].m_vpnsw = (tagValue['vpnsw'] == undefined)? '' : tagValue['vpnsw'];
			groupList[i].m_auth = (tagValue['groupauth'] == undefined)? 'l2tp' : tagValue['groupauth'];
			groupList[i].m_internetAccess = (tagValue['iaccess'] == undefined)? 'directly' : tagValue['iaccess'];
			groupList[i].m_preshareKey = (tagValue['presharedkey'] == undefined)? '' : tagValue['presharedkey'];
			groupList[i].m_p1_proto = (tagValue['type'] == undefined)? 'esp' : tagValue['type'];
			groupList[i].m_exchangeMode= (tagValue['emode'] == undefined)? 'aggressive' : tagValue['emode'];
			groupList[i].m_p1_encrypt= (tagValue['ikeencrypt'] == undefined)? 'des' : tagValue['ikeencrypt'];
			groupList[i].m_p1_auth = (tagValue['ikeauth'] == undefined)? 'md5' : tagValue['ikeauth'];
			groupList[i].m_p1_dfsGrp= (tagValue['dhgroup'] == undefined)? '5' : tagValue['dhgroup'];
			groupList[i].m_p1_lifetime= (tagValue['ikeltime'] == undefined)? '' : tagValue['ikeltime'];
			groupList[i].m_localNetwork = (tagValue['lnet'] == undefined)? '' : tagValue['lnet'];
			groupList[i].m_remoteNetwork = (tagValue['rnet'] == undefined)? '' : tagValue['rnet'];
			groupList[i].m_p2_dfsGrp= (tagValue['espdhgroup'] == undefined)? '2' : tagValue['espdhgroup'];
			groupList[i].m_p2_lifetime= (tagValue['espltime'] == undefined)? '' : tagValue['espltime'];
			groupList[i].m_p2_encrypt= (tagValue['espencrypt'] == undefined)? 'des' : tagValue['espencrypt'];
			groupList[i].m_p2_auth = (tagValue['espauth'] == undefined)? 'md5' : tagValue['espauth'];
			groupList[i].m_enable= (tagValue['enable'] == undefined)? 'yes' : tagValue['enable'];
		}

		return groupList;

	}

	this.f_getRemoteUserGroup = function(groupName, guicb)
	{
        thisObj.m_guiCb = guicb;
        var xmlstr = "<statement mode='proc'>" +
                      "<handler>vpn remote-access get_group" +
                      "</handler><data>";
        if (groupName != null) {
			xmlstr += "<remote_group><name>" + groupName + "</name></remote_group>";
		}
		xmlstr += "</data></statement>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
	}

    this.f_deleteRemoteUserGroup = function(groupName, cb)
    {
        thisObj.m_guiCb = cb;
        var xmlstr = "<statement mode='proc'>" +
                      "<handler>vpn remote-access delete_group" +
                      "</handler><data><remote_group>" +
					  "<name>" + groupName + "</name>" +
					  "</remote_group></data></statement>";


        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_disableRemoteUserGroup = function(groupName, disable, cb)
    {
        thisObj.m_guiCb = cb;
        var xmlstr = "<statement mode='proc'>" +
                      "<handler>vpn remote-access disable_group" +
                      "</handler><data><remote_group>" +
					  "<name>" + groupName + "</name>" +
					  "<disable>" + disable + "</disable>" +
					  "</remote_group></data></statement>";


        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_setRemoteUserGroup = function(rec, action, guicb)
    {
        thisObj.m_guiCb = guicb;
        var xmlstr = "<statement mode='proc'><handler>vpn remote-access set_group</handler><data>";
	    xmlstr += rec.f_toXml(action);
        xmlstr +=  "</data></statement>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallbackSetCmd);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
	////// Remote user
	///////////////////////////////////////////////////////////////////////////////////////////////////////
    this.f_parseRemoteUserGet = function(resp)
	{
		var form = thisObj.m_busObj.f_getFormNode(resp);
        var ruNodeArray = g_utils.f_xmlGetChildNodeArray(form, 'remote_user');
		//<groups> is special cases, will be processed separately.
		var tagArray = ['username', 'passwd', 'enable'];
		var tagValue = [];
        var userList = new Array();

		if (ruNodeArray == null)
		    return userList;

		for (var i = 0; i < ruNodeArray.length; i++) {
			var ruNode = ruNodeArray[i];

			for (var j = 0; j < tagArray.length; j++) {
				var cnode = g_utils.f_xmlGetChildNode(ruNode, tagArray[j]);
				if (cnode != null) {
					var value = g_utils.f_xmlGetNodeValue(cnode);
					if (value != null) {
						tagValue[tagArray[j]] = value;
					}
				}
			}
			userList[i] = new UTM_vpnRemoteUserRec();
			//parse group list.  One user belongs to one group for now.
			userList[i].m_groupName = '';
			var gNode = g_utils.f_xmlGetChildNode(ruNode, 'groups');
			if (gNode != null) {
				var gNodeArray = g_utils.f_xmlGetChildNodeArray(gNode, 'group');
				if (uNodeArray != null) {
				    for (var j=0 ; j < gNodeArray.length; j++) {
						var value = g_utils.f_xmlGetNodeValue(gNodeArray[j]);
						if (value != null) {
							userList[i].m_groupName = value;
							break;
						}
					}
				}
			}
			userList[i].m_userName = (tagValue['username'] == undefined)? '' : tagValue['username'];
			userList[i].m_pw = (tagValue['passwd'] == undefined)? '' : tagValue['passwd'];
			userList[i].m_enable= (tagValue['enable'] == undefined)? 'yes' : tagValue['enable'];
		}

		return userList;

	}

	this.f_getRemoteUser = function(userName, groupName, guicb)
	{
        thisObj.m_guiCb = guicb;
        var xmlstr = "<statement mode='proc'>" +
                      "<handler>vpn remote-access get_user" +
                      "</handler><data>";
        if (userName != null) {
			xmlstr += "<remote_user><username>" + userName + "</username><groupname>" +
                            groupName + "</groupname></remote_user>";
		}
		xmlstr += "</data></statement>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
	}

    this.f_deleteRemoteUser = function(userName, groupName, cb)
    {
        thisObj.m_guiCb = cb;
        var xmlstr = "<statement mode='proc'>" +
                      "<handler>vpn remote-access delete_user" +
                      "</handler><data><remote_user>" +
					  "<username>" + userName + "</username>" +
					  "<groupname>" + groupName + "</groupname>" +
					  "</remote_user></data></statement>";


        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_disableRemoteUser = function(userName, groupName, disable, cb)
    {
        thisObj.m_guiCb = cb;
        var xmlstr = "<statement mode='proc'>" +
                      "<handler>vpn remote-access disable_user" +
                      "</handler><data><remote_user>" +
					  "<username>" + userName + "</username>" +
					  "<groupname>" + groupName + "</groupname>";
		xml += "<disable>" + disable + "</disable>";
		xml += "</remote_user></data></statement>";


        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_setRemoteUser = function(rec, action, guicb)
    {
        thisObj.m_guiCb = guicb;
        var xmlstr = "<statement mode='proc'><handler>vpn remote-access set_user</handler><data>";
	    xmlstr += rec.f_toXml(action);
        xmlstr +=  "</data></statement>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallbackSetCmd);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////


}