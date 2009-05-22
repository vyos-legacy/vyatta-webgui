/*
 Document   : utm_urlFilterObj.js
 Created on : Apr 01, 2009, 11:22:11 AM
 Author     : Loi.Vo
 Description:
 */
function UTM_rangeObj(range)
{
	var thisObj = this;
    this.m_range = range;
    
    this.f_getLowerBound = function()
    {
        var a = thisObj.m_range.split("-");
        var aa = a[0].split(":");
        return parseInt(aa[0], 10);
    }
    
    this.f_getUpperBound = function()
    {
        var a = thisObj.m_range.split("-");
        var aa = a[1].split(":");
        return parseInt(aa[0], 10);
    }
    
    this.f_bound2range = function(lower, higher)
    {
        if (lower < 10) {
            lower = '0' + lower;
        }
        if (higher < 10) {
            higher = '0' + higher;
        }
        return lower + ':00-' + higher + ':59';
    }    
}

function UTM_urlFilterScheduleObj(schedArray)
{
    var thisObj = this;
    this.m_schedule = schedArray; //this schedArray is an array of array.
    
	/**
	 * Input: string to identify the day: 'm', 't', ...
	 * Output: array of [0,1,2,3,...,23] with the corresponding value of 1, or 0.
	 */
    this.f_getScheduleByDay = function(day)
    {
        var a = new Array(24);
        for (var i = 0; i < 24; i++) {
            a[i] = 0;
        }		
        var period = thisObj.m_schedule[day];
        if (period==null) {
			return a;
		}

        var periodArray = period.split(",");
        for (var i = 0; i < periodArray.length; i++) {
            var rangeObj = new UTM_rangeObj(periodArray[i]);
            var lower = rangeObj.f_getLowerBound();
            var upper = rangeObj.f_getUpperBound();
            for (var j = lower; j <= upper; j++) {
                a[j] = 1;
            }
        }
        return a;
    }
    
	/**
	 * Format the schedule to use the format understandable by backend.
	 * @param {Object} day: which day.
	 * @param {Object} schedArray: array of [0,1,2,...,23]
	 * @return (Object) string in the format of: 00:00-12:59,15:00-19:59, ...
	 */
    this.f_setScheduleForDay = function(day, schedArray)
    {
        var s = '';
        for (var i = 0; i < schedArray.length; i++) {
            var lower = -1;
            var upper = -1;
            if (schedArray[i] == 0) {
                continue;
            } else {
                lower = i;
                for (var j = lower; j < schedArray.length; j++) {
					i = j;
                    if (schedArray[j] == 1) {
                        if ((j == schedArray.length - 1) && (lower != -1)) {
                            var rObj = new UTM_rangeObj('');
                            if (s.length != 0) {
                                s += ',';
                            }
                            s += rObj.f_bound2range(lower, j);
                        }
                    } else if (lower != -1) {
                        var rObj = new UTM_rangeObj('');
                        if (s.length != 0) {
                            s += ',';
                        }
                        s += rObj.f_bound2range(lower, j-1);
						break;
                    }
                }
            }
        }
		thisObj.m_schedule[day] = s;
		return s;
    }
	
	this.f_toXml = function() {
		var s = '<schedule>';
		var a = ['m','t','w','h','f','a','s'];
		
		for (var i=0; i < a.length; i++) {
			var timeRange = thisObj.m_schedule[a[i]];
			if ((timeRange != null) && (timeRange.length > 0)) {
				s += '<' + a[i] + '>' + timeRange + '</' + a[i] + '>';
			}
		}
		s += '</schedule>';
		return s;
	}
}

function UTM_urlFilterPolicyObj(policyArray)
{
	var thisObj = this;
	
	this.m_policy = policyArray;
	
	this.f_getAttribute = function(name) {
		return thisObj.m_policy[name];
	}
	
	this.f_setAttribute = function(name, value) {
		thisObj.m_policy[name] = value;
	}	
	
	this.f_toXml = function() {
		var s = '<policy>';
		var a = ['blacklist', 'whitelist', 'keyword'];
		var aa = ['legal', 'productivity', 'strict'];
		
		for (var i=0; i < a.length; i++) {
			var attr = thisObj.f_getAttribute(a[i]);
			if ((attr != undefined) && (attr != null)) {
				s+= "<" + a[i] + " status='" + attr + "'>";
				if (a[i]=='blacklist') {
					for (var j=0; j < aa.length; j++) {
						var subAttr = thisObj.f_getAttribute(aa[j]);
						if ((subAttr != undefined) && (subAttr != null) && (subAttr=='true')) {
							s += "<" + aa[j] + ">" + subAttr + "</" + aa[j] + ">";
						}
					}
				}
				s+= "</" + a[i] + ">";
			}
		}
		s += "</policy>";
		return s;
	}	
}


function UTM_urlFilterConfigObj(policy, schedule)
{
	var thisObj = this;
	
    this.m_policy = policy
    this.m_schedule = schedule;
	
	this.f_setPolicy = function(policyObj) {
		thisObj.m_policy = policyObj;
	}
	
	this.f_setSchedule = function(schedObj) {
		thisObj.m_schedule = schedObj;
	}
	
	this.f_toXml= function() {
		var s = "<url-filtering-easy-config>";
		s += thisObj.m_policy.f_toXml();
		s += thisObj.m_schedule.f_toXml();
		s += "</url-filtering-easy-config>";
		return s;
	}
}

function UTM_urlFilterListObj(rawText)
{
	var thisObj = this;
	
    this.m_value = null;
	this.m_status = null;
	this.m_action = 'noop';
	
	if (rawText.startsWith('!')) {
		this.m_value = rawText.substring(1,rawText.length);
		this.m_status = false;
	} else {
		this.m_value = rawText;
		this.m_status = true;
	}
	
	this.f_toString = function() {
		if (thisObj.m_status) {
			return thisObj.m_value;
		} else {
			return '!' + thisObj.m_value;
		}
	}	
}


function UTM_urlFilterBusObj(busObj)
{
    /////////////////////////////////////
    // properties
    var thisObj = this;
    this.m_busObj = busObj;
    this.m_lastCmdSent = null;
    this.m_urlFilterObj = null;	
	this.m_urlList = null;
	this.m_kwList = null;
	
	this.m_URL_CONFIG_GET = 'url-filtering-easy-config get';
	this.m_URL_CONFIG_SET = 'url-filtering-easy-config set';
	this.m_WL_CONFIG_GET = 'white-list-easy-config get';
	this.m_WL_CONFIG_SET = 'white-list-easy-config set';
	this.m_KEYWORD_CONFIG_GET = 'banned-list-easy-config get';
	this.m_KEYWORD_CONFIG_SET = 'banned-list-easy-config set';
	
    /////////////////////////////////////////
	
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
                if(thisObj.m_lastCmdSent.indexOf(thisObj.m_URL_CONFIG_GET) > 0) {
					if (g_devConfig.m_isLocalMode) {
						if (thisObj.m_urlFilterObj != null) {
							evt = UTM_eventObj(0, thisObj.m_urlFilterObj,'');
                            if(thisObj.m_guiCb != undefined)
                                thisObj.m_guiCb(evt);							
						} 
					}
                    thisObj.m_urlFilterObj = thisObj.f_parseUrlFilter(err);
                    evt = new UTM_eventObj(0, thisObj.m_urlFilterObj, '');
                } else if (thisObj.m_lastCmdSent.indexOf(thisObj.m_WL_CONFIG_GET) > 0) {
                    thisObj.m_urlList = thisObj.f_parseUrlList(err);
                    evt = new UTM_eventObj(0, thisObj.m_urlList, '');					
				}  else if (thisObj.m_lastCmdSent.indexOf(thisObj.m_KEYWORD_CONFIG_GET) > 0) {
                    thisObj.m_kwList = thisObj.f_parseKeywordList(err);
                    evt = new UTM_eventObj(0, thisObj.m_kwList, '');					
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

	this.f_getChildNode = function(parent, child)
	{
	    var cn = parent.childNodes;
		for (var i=0; i < cn.length; i++) {
			if (cn[i].nodeName == child) {
				return cn[i];
			}
		}	
		return null;
	}
	
	this.f_getNodeValue = function(node)
	{	
		if (node != null && node.childNodes[0]) {
		    return node.childNodes[0].nodeValue;
		}	
		return null;	
	}
	
	this.f_getNodeAttribute = function(node, attr)
	{
		if (node==null) return null;
		return node.getAttribute(attr);
	}

    this.f_getFormErrMsg = function(form)
	{
		var errmsgNode = thisObj.f_getChildNode(form, 'errmsg');
		if (errmsgNode == null) return null;
		
		return thisObj.f_getNodeValue(errmsgNode);		
	}

    this.f_getFormNode = function(response)
	{
		var msgNode = this.f_getChildNode(response[0], 'msg');
		return this.f_getChildNode(msgNode, 'form');
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
	
	this.f_getDefaultUfc = function()
	{
		var defaultPolicy = thisObj.f_getDefaultUrlPolicy();
		var defaultSched = thisObj.f_getDefaultUrlSched();
		
		return new UTM_urlFilterConfigObj(new UTM_urlFilterPolicyObj(defaultPolicy),
		                                  new UTM_urlFilterScheduleObj(defaultSched));
	}
	
	this.f_getDefaultUrlPolicy = function() 
	{
		var a = new Array(6);
		var c = ['blacklist', 'whitelist', 'keyword', 'productivity', 'strict'];
		for (var i =0; i < a.length; i++) {
			a[c[i]] = 'false';
		}
		a['blacklist'] = 'true';
		a['legal'] = 'true';
		
		return a;
	}
	
	/**
	 * Return an array of [blacklist,legal,productivity,strict,whitelist,keyword]
	 * @param {Object} policy
	 */
    this.f_parseUrlPolicy = function(policy)
	{
		var defaultPolicy = thisObj.f_getDefaultUrlPolicy();
		
		if (policy == null) {
			return defaultPolicy;
		}
		
		var cat = ['blacklist', 'whitelist', 'keyword'];
		var subCat = ['legal', 'productivity', 'strict'];
		var a = new Array(6);
		var found = false;
		
		for (var i=0; i < cat.length; i++) {
			var node = thisObj.f_getChildNode(policy, cat[i]);
			if (node != null) {
				found = true;
				var status = thisObj.f_getNodeAttribute(node,'status');
				if (status != null) {
					a[cat[i]] = status;
				} else {
					a[cat[i]] = 'false';
				}
				if (i==0) { //blacklist node, parse sub cat
				    for (var j=0; j < subCat.length; j++) {
						var cnode = thisObj.f_getChildNode(node, subCat[j]);
						if (cnode != null) {
							var cvalue = thisObj.f_getNodeValue(cnode);
							if (cvalue != null) {
								a[subCat[j]] = cvalue;
							} else {
								a[subCat[j]] = 'false';
							}							
						} else {
							a[subCat[j]] = 'false';
						}
					}	
				}
			} else {
				a[cat[i]] = 'false';
			}
		}
		if (!found) {
			return defaultPolicy;
		}
		return a;
	}

    this.f_getDefaultUrlSched = function()
	{
	    var days = ['m','t','w','h','f','a','s'];
		var w = new Array(7);
		
		for (var i=0; i < days.length; i++) {
			w[days[i]] = '00:00-23:59';
		}	
		
		return w;
	}

    /**
     * Return an array of:
     *   m: [00:00-15:00,16:00-19:00]
     *   t: [00:00-15:00,16:00-19:00]
     *   ...
     *   a: [00:00-15:00,16:00-19:00]
     */
    this.f_parseUrlSchedule = function(schedule)
	{
		var days = ['m','t','w','h','f','a','s'];
		var defaultSched = thisObj.f_getDefaultUrlSched();
		var found = false;
		
		if (schedule == null) {
			return defaultSched;
		}
		
		var w = new Array(7);
		for (var i=0; i < w.length; i++) {
			var cnode = thisObj.f_getChildNode(schedule, days[i]);
			if (cnode != null) {
				found = true;
			}
			w[days[i]] = thisObj.f_getNodeValue(cnode);
		}
		
		if (!found) {
			return defaultSched;
		}

		return w;
	} 
	
    this.f_parseUrlFilter = function(response)
	{
		var obj = new UTM_urlFilterConfigObj(new Array(), new Array());		
		var form = thisObj.f_getFormNode(response);		
		var urlNode = thisObj.f_getChildNode(form, 'url-filtering-easy-config');
		
		if (urlNode != null) {
			var policyNode = thisObj.f_getChildNode(urlNode, 'policy');
			var schedNode = thisObj.f_getChildNode(urlNode, 'schedule');
			var p = thisObj.f_parseUrlPolicy(policyNode);
			var s = thisObj.f_parseUrlSchedule(schedNode);
			obj.f_setPolicy(new UTM_urlFilterPolicyObj(p));
			obj.f_setSchedule(new UTM_urlFilterScheduleObj(s));
		}

        //alert('f_parseUrlFilter: obj.toXml: ' + obj.f_toXml());
        return obj;
	}
	
	this.f_parseUrlList = function(response)
	{
		var list = new Array();
		var form = thisObj.f_getFormNode(response);		
		var wlNode = thisObj.f_getChildNode(form, 'white-list-easy-config');		
		
		if (wlNode != null) {
			var cn = wlNode.childNodes;
			for (var i = 0; i < cn.length; i++) {
				if (cn[i].nodeName == 'url') {
					var value = thisObj.f_getNodeValue(cn[i]);
					//list.push(new UTM_urlFilterListObj(decodeURI(value)));
					list.push(new UTM_urlFilterListObj(value));					
				}
			}
		}
		return list;
	}
	
	this.f_parseKeywordList = function(response)
	{
		var list = new Array();
		var form = thisObj.f_getFormNode(response);		
		var bannedNode = thisObj.f_getChildNode(form, 'banned-list-easy-config');		
		
		if (bannedNode != null) {
			var cn = bannedNode.childNodes;
			for (var i = 0; i < cn.length; i++) {
				if (cn[i].nodeName == 'keyword') {
					var value = thisObj.f_getNodeValue(cn[i]);
					list.push(new UTM_urlFilterListObj(value));
				}
			}
		}
		return list;
	}
	
	this.f_getUrlFilterConfig = function(guicb)
	{
		if (g_devConfig.m_isLocalMode) {
			thisObj.f_getUrlFilterConfigLocal(guicb);
		} else {
			thisObj.f_getUrlFilterConfigServer(guicb);
		}
	}
	
    /**
     */
    this.f_getUrlFilterConfigServer = function(guicb)
    {
		/*
        var e = new UTM_eventObj(0, '', '');
        window.setTimeout(function(){guicb(e)}, 500);
        return;
		*/
		
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement mode='proc'>" +
                      "<handler>url-filtering-easy-config get" +
                      "</handler><data></data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_setUrlFilterConfig = function(ufcObj, guicb)
	{
		if (g_devConfig.m_isLocalMode) {
			thisObj.f_setUrlFilterConfigLocal(ufcObj,guicb);
		} else {
			thisObj.f_setUrlFilterConfigServer(ufcObj,guicb);
		}		
	}

    /**
     * perform a set vpn site2site configurations request to server.
     * @param ufcObj - url filtering config object.
     * @param guicb - gui callback function
     */
    this.f_setUrlFilterConfigServer = function(ufcObj, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>url-filtering-easy-config" +
                      " set</handler><data>" + ufcObj.f_toXml() +
                      "</data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallbackSetCmd);
    }	

	this.f_getUrlList = function(guicb)
	{
		if (g_devConfig.m_isLocalMode) {
			thisObj.f_getUrlListLocal(guicb);
		} else {
			thisObj.f_getUrlListServer(guicb);
		}
	}

    /**
     */
    this.f_getUrlListServer = function(guicb)
    {
		/*
        var e = new UTM_eventObj(0, '', '');
        window.setTimeout(function(){guicb(e)}, 500);
        return;
		*/
		
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement mode='proc'>" +
                      "<handler>white-list-easy-config get" +
                      "</handler><data></data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }
	
	this.f_cdataWrap = function(s)
	{
		return "<![CDATA[" + s + "]]>";
	}

    /**
     * Format a list of url list object to xml
     * @param {Object} urlList: an array of url list obj.
     * @return: xml representation.
     */
    this.f_urlList2xml = function(urlList)
	{
		var xml = "<white-list-easy-config>";
		for (var i=0; i < urlList.length; i++) {
			if (urlList[i].m_action != 'noop') {
				xml += "<url action='" + urlList[i].m_action + "'>";
//				xml += encodeURI(urlList[i].toString());
				xml += thisObj.f_cdataWrap(urlList[i].f_toString());
				xml += "</url>";
			}
		}
		xml += "</white-list-easy-config>";
		return xml;
		
	}

    this.f_setUrlList = function(urlList, guicb)
	{
		if (g_devConfig.m_isLocalMode) {
			thisObj.f_setUrlListLocal(urlList,guicb);
		} else {
			thisObj.f_setUrlListServer(urlList,guicb);
		}		
	}

    /**
     * perform a set vpn site2site configurations request to server.
     * @param ufcObj - url filtering config object.
     * @param guicb - gui callback function
     */
    this.f_setUrlListServer= function(urlList, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>white-list-easy-config" +
                      " set</handler><data>" + thisObj.f_urlList2xml(urlList) +
                      "</data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallbackSetCmd);
    }

	this.f_getKeywordList = function(guicb)
	{
		if (g_devConfig.m_isLocalMode) {
			thisObj.f_getKeywordListLocal(guicb);
		} else {
			thisObj.f_getKeywordListServer(guicb);
		}
	}

    /**
     */
    this.f_getKeywordListServer = function(guicb)
    {
		/*
        var e = new UTM_eventObj(0, '', '');
        window.setTimeout(function(){guicb(e)}, 500);
        return;
		*/
		
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement mode='proc'>" +
                      "<handler>banned-list-easy-config get" +
                      "</handler><data></data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    /**
     * Format a list of keyword list object to xml
     * @param {Object} kwList: an array of keyword list obj.
     * @return: xml representation.
     */
    this.f_kwList2xml = function(kwList)
	{
		var xml = '<banned-list-easy-config>';
		for (var i=0; i < kwList.length; i++) {
			if (kwList[i].m_action != 'noop') {
				xml += "<keyword action='" + kwList[i].m_action + "'>";
				xml += thisObj.f_cdataWrap(kwList[i].f_toString());
				xml += "</keyword>";
			}
		}
		xml += "</banned-list-easy-config>";
		return xml;		
	}

    this.f_setKeywordList = function(kwList, guicb)
	{
		if (g_devConfig.m_isLocalMode) {
			thisObj.f_setKeywordListLocal(kwList,guicb);
		} else {
			thisObj.f_setKeywordListServer(kwList,guicb);
		}		
	}

    /**
     * perform a set vpn site2site configurations request to server.
     * @param ufcObj - url filtering config object.
     * @param guicb - gui callback function
     */
    this.f_setKeywordListServer= function(kwList, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>banned-list-easy-config" +
                      " set</handler><data>" + thisObj.f_kwList2xml(kwList) +
                      "</data></statement></command>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallbackSetCmd);
    }
	
	///////////////////////////////////////////////////////////////////////////////////////
	/////// begining simulation
	///////////////////////////////////////////////////////////////////////////////////////
    this.f_getUrlFilterConfigLocal = function(guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement mode='proc'>" +
                      "<handler>url-filtering-easy-config get" +
                      "</handler><data></data></statement></command>";
        var cmdSend = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                       + "<openappliance>" + xmlstr + "</openappliance>\n";
					   
        thisObj.m_lastCmdSent = cmdSend;
		
		var resp = (new DOMParser()).parseFromString(
		    '<?xml version="1.0" encoding="utf-8"?>' +
                '<openappliance>' +
                    '<token></token>' +
                        '<error>' + 
                            '<code>0</code>' + 
                               '<msg>' +
                                   '<form name=\'url-filtering-easy-config\' code=\'0\'>' +
                                       '<url-filtering-easy-config>' + 
                                           '<policy>' + 
                                               '<blacklist status=\'true\'>' + 
                                                   '<strict>true</strict>' + 
                                               '</blacklist>' + 
                                               '<whitelist status=\'true\'></whitelist>' + 
                                               '<keyword status=\'false\'></keyword>' + 
                                           '</policy>' + 
                                           '<schedule>' + 
                                               '<m>00:00-12:59,15:00-19:59</m>' + 
                                               '<t>00:00-23:59</t>' + 
                                               '<w>00:00-02:59,06:00-08:59,13:00-23:59</w>' +
                                               '<h>00:00-23:59</h>' + 
                                               '<f>00:00-23:59</f>' + 
                                               '<a></a>' + 
                                               '<s></s>' + 
                                           '</schedule>' + 
                                        '</url-filtering-easy-config>' + 
                                    '</form>' + 
                                '</msg>' + 
                          '</error>' + 
                  '</openappliance>', "text/xml");
		
        thisObj.f_respondRequestCallback(resp, guicb);
    }	
	
    this.f_setUrlFilterConfigLocal = function(ufcObj, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>url-filtering-easy-config" +
                      " set</handler><data>" + ufcObj.f_toXml() +
                      "</data></statement></command>";

        var cmdSend = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                       + "<openappliance>" + xmlstr + "</openappliance>\n";
		
		alert ('cmdSend: ' + cmdSend);
					   
        thisObj.m_lastCmdSent = cmdSend;

		var resp = (new DOMParser()).parseFromString(
		    '<?xml version="1.0" encoding="utf-8"?>' +
                '<openappliance>' +
                    '<token></token>' +
                        '<error>' + 
                            '<code>0</code>' + 
                               '<msg>' +
                                   '<form name=\'url-filtering-easy-config\' code=\'0\'>' +
                                    '</form>' + 
                                '</msg>' + 
                          '</error>' + 
                  '</openappliance>', "text/xml");

        thisObj.f_respondRequestCallback(resp, guicb);
    }	

    /**
     */
    this.f_getUrlListLocal = function(guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement mode='proc'>" +
                      "<handler>white-list-easy-config get" +
                      "</handler><data></data></statement></command>";

        var cmdSend = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                       + "<openappliance>" + xmlstr + "</openappliance>\n";

        thisObj.m_lastCmdSent = cmdSend;
		var resp = (new DOMParser()).parseFromString(
		    '<?xml version="1.0" encoding="utf-8"?>' +
                '<openappliance>' +
                    '<token></token>' +
                        '<error>' + 
                            '<code>0</code>' + 
                               '<msg>' +
                                   '<form name=\'white-list-easy-config\' code=\'0\'>' +
								       '<white-list-easy-config>' +
									       '<url>www.vyatta.com</url>' +
										   '<url>!www.sun.com</url>' +
										   '<url>www.facebook.com</url>' +
									   '</white-list-easy-config>' +
                                    '</form>' + 
                                '</msg>' + 
                          '</error>' + 
                  '</openappliance>', "text/xml");

        //alert ('cmdSend: ' + cmdSend);
        thisObj.f_respondRequestCallback(resp, guicb);
    }
	
    this.f_setUrlListLocal = function(urlList, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>white-list-easy-config" +
                      " set</handler><data>" + thisObj.f_urlList2xml(urlList) +
                      "</data></statement></command>";

        var cmdSend = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                       + "<openappliance>" + xmlstr + "</openappliance>\n";
		
		alert ('cmdSend: ' + cmdSend);
					   
        thisObj.m_lastCmdSent = cmdSend;

		var resp = (new DOMParser()).parseFromString(
		    '<?xml version="1.0" encoding="utf-8"?>' +
                '<openappliance>' +
                    '<token></token>' +
                        '<error>' + 
                            '<code>0</code>' + 
                               '<msg>' +
                                   '<form name=\'white-list-easy-config\' code=\'0\'>' +
                                    '</form>' + 
                                '</msg>' + 
                          '</error>' + 
                  '</openappliance>', "text/xml");

        thisObj.f_respondRequestCallback(resp, guicb);
    }	

    /**
     */
    this.f_getKeywordListLocal = function(guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id><statement mode='proc'>" +
                      "<handler>banned-list-easy-config get" +
                      "</handler><data></data></statement></command>";

        var cmdSend = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                       + "<openappliance>" + xmlstr + "</openappliance>\n";

        thisObj.m_lastCmdSent = cmdSend;
		var resp = (new DOMParser()).parseFromString(
		    '<?xml version="1.0" encoding="utf-8"?>' +
                '<openappliance>' +
                    '<token></token>' +
                        '<error>' + 
                            '<code>0</code>' + 
                               '<msg>' +
                                   '<form name=\'banned-list-easy-config\' code=\'0\'>' +
								       '<banned-list-easy-config>' +
									       '<keyword>damn</keyword>' +
										   '<keyword>!what-da-hell</keyword>' +
										   '<keyword>swted</keyword>' +
									   '</banned-list-easy-config>' +
                                    '</form>' + 
                                '</msg>' + 
                          '</error>' + 
                  '</openappliance>', "text/xml");

        //alert ('cmdSend: ' + cmdSend);
        thisObj.f_respondRequestCallback(resp, guicb);
    }
	
    this.f_setKeywordListLocal = function(kwList, guicb)
    {
        thisObj.m_guiCb = guicb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                      "<statement mode='proc'><handler>banned-list-easy-config" +
                      " set</handler><data>" + thisObj.f_kwList2xml(kwList) +
                      "</data></statement></command>";

        var cmdSend = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                       + "<openappliance>" + xmlstr + "</openappliance>\n";
		
		alert ('cmdSend: ' + cmdSend);
					   
        thisObj.m_lastCmdSent = cmdSend;

		var resp = (new DOMParser()).parseFromString(
		    '<?xml version="1.0" encoding="utf-8"?>' +
                '<openappliance>' +
                    '<token></token>' +
                        '<error>' + 
                            '<code>0</code>' + 
                               '<msg>' +
                                   '<form name=\'banned-list-easy-config\' code=\'0\'>' +
                                    '</form>' + 
                                '</msg>' + 
                          '</error>' + 
                  '</openappliance>', "text/xml");

        thisObj.f_respondRequestCallback(resp, guicb);
    }		
}
