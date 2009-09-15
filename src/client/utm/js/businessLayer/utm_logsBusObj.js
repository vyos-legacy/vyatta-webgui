/*
    Document   : utm_fwBusObj.js
    Created on : Sep 15, 2009, 11:21:31 AM
    Author     : Kevin.Choi
    Description:
*/


function UTM_firewallLogRec()
{

}

function UTM_intrusionLogRec()
{

}

function UTM_webFilteringLogRec()
{

}

function UTM_vpnLogRec()
{

}

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
                else if(thisObj.m_lastCmdSent.indexOf(
                    '<handler>log-basic-firewall get') > 0)
                {
                }
                else if(thisObj.m_lastCmdSent.indexOf(
                    '<handler>log-basic-webfiltering get') > 0)
                {
                }
                else if(thisObj.m_lastCmdSent.indexOf(
                    '<handler>log-basic-vpn get') > 0)
                {
                }
                if(thisObj.m_lastCmdSent.indexOf(
                    '<handler>log-advanced-intrusion get') > 0)
                {
                }
                else if(thisObj.m_lastCmdSent.indexOf(
                    '<handler>log-advanced-firewall get') > 0)
                {
                }
                else if(thisObj.m_lastCmdSent.indexOf(
                    '<handler>log-advanced-webfiltering get') > 0)
                {
                }
                else if(thisObj.m_lastCmdSent.indexOf(
                    '<handler>log-advanced-vpn get') > 0)
                {
                }
            }

            if(thisObj.m_guiCb != undefined)
                thisObj.m_guiCb(evt);
        }
    }

    ////////////////////////////////////////////////////////////////////////////
    this.f_getModeByString = function(mode)
    {
        return mode == 0 ? 'basic' : 'advanced';
    }

    /**
     * get basic intrusion prevention log data
     */
    this.f_getBasicIntrusionPreventionLog = function(mode, guicb)
    {
        thisObj.m_guiCb = guicb;
        var xmlstr = "<statement mode='proc'>" +
                      "<handler>log-" +
                      this.f_getModeByString(mode) + "-intrusion get" +
                      "</handler><data>ALL</data></statement>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_getFirewallLog = function(mode, guicb)
    {
        thisObj.m_guiCb = guicb;
        var xmlstr = "<statement mode='proc'>" +
                      "<handler>log-" +
                      this.f_getModeByString(mode) + "-firewall get" +
                      "</handler><data>ALL</data></statement>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

    this.f_getBasicWebFilteringLog = function(mode, guicb)
    {
        thisObj.m_guiCb = guicb;
        var xmlstr = "<statement mode='proc'>" +
                      "<handler>log-" +
                      this.f_getModeByString(mode) + "-webfiltering get" +
                      "</handler><data>ALL</data></statement>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }
    this.f_getBasicVPNLog = function(mode, guicb)
    {
        thisObj.m_guiCb = guicb;
        var xmlstr = "<statement mode='proc'>" +
                      "<handler>log-" +
                      this.f_getModeByString(mode) + "-vpn get" +
                      "</handler><data>ALL</data></statement>";

        thisObj.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }

}