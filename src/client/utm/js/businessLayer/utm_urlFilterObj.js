/*
 Document   : utm_urlFilterObj.js
 Created on : Apr 01, 2009, 11:22:11 AM
 Author     : Kevin.Choi
 Description:
 */
function UTM_rangeObj(range)
{
    this.m_range = range;
    
    this.f_getLowerBound = function()
    {
        var a = this.m_range.split("-");
        var aa = a[0].split(":");
        return parseInt(aa[0], 10);
    }
    
    this.f_getUpperBound = function()
    {
        var a = this.m_range.split("-");
        var aa = a[1].split(":");
        return parseInt(aa[1], 10);
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
    this.m_schedule = schedArray;
    
    this.f_getScheduleByDay = function(day)
    {
        var period = thisObj.m_schedule[day];
        var a = new Array(24);
        for (var i = 0; i < 24; i++) {
            a[i] = 0;
        }
        var periodArray = period.split(",");
        for (var i = 0; i < periodArray.length; i++) {
            var rangeObj = new UTM_rangeObj(periodArray[i]);
            var lower = rangeObj.getLowerBound();
            var upper = rangeObj.getUpperBound();
            for (var j = lower; j <= upper; j++) {
                a[j] = 1;
            }
        }
        return a;
    }
    
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
                    }
                    i = j;
                }
            }
        }
    }
    
}

function UTM_urlFilterConfigObj(cat, subcat, url, keyword, schedule)
{
    this.m_cat = cat;
    this.m_subcat = subcat;
    this.m_url = url;
    this.m_keyword = keyword;
    this.m_scheduleObj = new UTM_urlFilterScheduleObj(schedule);
}

function UTM_urlFilterUrlList(urlList)
{

}

function UTM_urlFilterKeywordList(kwList)
{

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
                    thisObj.m_urlFilterObj = thisObj.f_parseUrlFilter(err);
                    evt = new UTM_eventObj(0, thisObj.m_urlFilterObj, '');
                } else if (thisObj.m_lastCmdSent.indexOf(thisObj.m_WL_CONFIG_GET) > 0) {
                    thisObj.m_urlList = thisObj.f_parseUrlList(err);
                    evt = new UTM_eventObj(0, thisObj.m_urlList, '');					
				}  else if (thisObj.m_lastCmdSent.indexOf(thisObj.m_WL_KEYWORD_GET) > 0) {
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
	
    this.f_parseUrlPolicy = function(policy)
	{
		if (policy==null) return null;
		var cat = ['blacklist', 'whitelist', 'keyword'];
		var subCat = ['legal', 'professional', 'strict'];
		var a = new Array(6);
		
		for (var i=0; i < cat.length; i++) {
			var node = thisObj.f_getChildNode(policy, cat[i]);
			if (node != null) {
				var status = thisObj.f_getNodeAttribute(node);
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
		return a;
	}

    this.f_parseUrlSchedule = function(schedule)
	{
		if (schedule==null) return null;
	} 
	
    this.f_parseUrlFilter = function(response)
	{
		var obj = new UTM_urlFilterConfigObj(false, false, false, false, '');		
		
		var urlNode = thisObj.f_getChildNode(response[0], 'url-filtering-easy-config');
		
		if (urlNode != null) {
			var policyNode = thisObj.f_getChildNode(urlNode, 'policy');
			var schedNode = thisObj.f_getChildNode(urlNode, 'schedule');
			var p = thisObj.f_parseUrlPolicy(policyNode);
			var s = thisObj.f_parseUrlSchedule(schedNode);
			
		}

        return obj;
	}
	    
}
