/**
 * @author loi
 */
function FT_timeoutMonitor(busObj)
{
    var thisObj = this;
	this.m_start = false;
	this.m_request = createXMLHttpRequest();
	this.m_busObj = busObj;
	this.m_lastSentTimestamp = undefined;
	this.m_queryThreadId = null;
	
    this.f_start = function() 
	{
		if (thisObj.m_start)
		    return;
        thisObj.f_poll();
		thisObj.m_start = true;
	}
	
	this.f_stop = function()
	{
        if (thisObj.m_queryThreadId != null) {
			window.clearTimeout(thisObj.m_queryThreadId);
			thisObj.m_queryThreadId = null;
		}		
	}
	
	this.f_poll = function()
	{
        if (thisObj.m_lastSentTimestamp == undefined) {
			thisObj.f_query();
		} 
	}
	
	this.f_query = function()
	{
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<static></static>";
        //var xmlstr = "";

        xmlstr += "<command><id>" + sid + "</id><statement>" +
                      "open-app archive backup status</statement></command>";

        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback, thisObj.m_request);	
		thisObj.m_lastSentTimestamp = new Date();	
	}
	
	this.f_timeout = function()
	{
		thisObj.f_stop();
		thisObj.m_busObj.f_userTimeout();
		g_utils.f_popupMessage('timeout', 'timeout', null, true);		
	}
	
    this.f_respondRequestCallback = function()
    {
        var response = thisObj.f_getRequestResponse(thisObj.m_request);
        if(response == null) return;
    }
	
    this.f_getRequestResponse = function(request)
    {
        var r = request;

        if(r.readyState == 4)
        {
            if(r.status == 200)
            {						
                var response = r.responseXML;
				thisObj.m_queryThreadId = window.setTimeout(thisObj.f_query, g_oaConfig.m_oaTimeoutMonitorInterval);			
				
                var error = thisObj.f_parseResponseError(response, false);

                if(error.f_isError())
                    response = error;
			    
                return response;
            }
			thisObj.m_queryThreadId = window.setTimeout(thisObj.f_query, g_oaConfig.m_oaTimeoutMonitorInterval);			
        }

        return null;
    }

    /**
     * parse and handle the respond error from server.
     */
    this.f_parseResponseError = function(response, promptErrMsg)
    {
        var errCode = 0;
        var errmsg = '';
        var errSid = '';
		
        var err = response.getElementsByTagName('error');
        if(err != null && err[0] != null)
        {
            var cn = err[0].childNodes;
            for(var i=0; i<cn.length; i++)
            {
                if (cn[i].nodeName == 'code')
                {
                    errCode = Number(cn[i].firstChild.nodeValue);
                    if (errCode == 8)
                    {
			            var sid = response.getElementsByTagName('id');
                        if (sid != undefined && sid[0] != undefined)
                        {
                            errSid = sid[0].firstChild.nodeValue;
			             }
                    }
                    else if(errCode == 3) {
						thisObj.f_timeout();
					} 
		        } 
                else if (cn[i].nodeName == 'msg' && errCode != 0)
                {
                    errmsg = cn[i].firstChild.nodeValue;
		        }
            }
        }
        
		var rvalue = new FT_eventObj(errCode, '', errmsg);
		if (errSid.length > 0) {
			rvalue.m_sid = errSid;
		}
        return rvalue;
    }	

}