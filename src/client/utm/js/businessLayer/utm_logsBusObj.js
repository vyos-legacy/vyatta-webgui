/*
    Document   : utm_fwBusObj.js
    Created on : Sep 15, 2009, 11:21:31 AM
    Author     : Kevin.Choi
    Description:
*/


/**
 * logs business object
 */
function UTM_firewallBusObj(busObj)
{
    /////////////////////////////////////
    // properteis
    var thisObj = this;
    this.m_busObj = busObj;


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
            if(thisObj.m_guiCb != null)
                thisObj.m_guiCb(response);
            else
            {
                g_utils.f_popupMessage("Connection failed! Please refresh page and  try again",
                    'error', "Connection Error", true);
            }
        }
        else
        {
            var evt = new UTM_eventObj(0, thisObj, '');

            var err = response.getElementsByTagName('error');
            if(err != null && err[0] != null)
            {
                if(thisObj.m_lastCmdSent.indexOf(
                    '<handler>log-basic-intrusion get') > 0)
                {
                }
            }

            if(thisObj.m_guiCb != undefined)
                thisObj.m_guiCb(evt);
        }
    }

    /**
     * get basic intrusion prevention log data
     */
    this.f_getBasicIntrusionPreventionLog = function(guicb)
    {
        thisObj.m_guiCb = guicb;
        var xmlstr = "<statement mode='proc'>" +
                      "<handler>log-basic-intrusion get" +
                      "</handler><data>ALL</data></statement>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }
}