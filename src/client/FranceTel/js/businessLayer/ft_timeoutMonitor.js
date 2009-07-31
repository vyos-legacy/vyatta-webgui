/**
 * @author loi
 */
function FT_timeoutMonitor(busObj)
{
    var thisObj = this;
	this.m_threadId = null;
	this.m_thread = null;
	this.m_request = createXMLHttpRequest();
	this.m_busObj = busObj;
	
    this.f_start = function() 
	{
		if (thisObj.m_threadId != null)
		    return;
		// create a new thread object
        thisObj.m_thread = new FT_thread(g_oaConfig.m_oaTimeoutMonitorInterval);

        var callback = function()
        {
            thisObj.f_poll();
        }

        // start to run
        thisObj.m_threadId = thisObj.m_thread.f_start(callback);
	}
	
	this.f_stop = function()
	{
        if (thisObj.m_threadId != null) {
			thisObj.m_thread.f_stop(thisObj.m_threadId);
			thisObj.m_threadId = null;
		}		
	}
	
	this.f_poll = function(cb)
	{
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<static></static>";
        //var xmlstr = "";

        xmlstr += "<command><id>" + sid + "</id><statement>" +
                      "open-app vm status </statement></command>";

        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback, thisObj.m_request);
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
                var error = thisObj.f_parseResponseError(response, false);

                if(error.f_isError())
                    response = error;

                return response;
            }
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