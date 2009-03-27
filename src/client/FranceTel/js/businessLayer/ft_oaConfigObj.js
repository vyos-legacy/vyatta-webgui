/*
    Document   : ft_oaConfigObj.js
    Created on : Feb 26, 2009, 3:19:25 PM
    Author     : Loi.Vo
    Description:
*/

function FT_emailServer(smtp, machine, email, name, passwd)
{
    this.m_stmp= smtp;
    this.m_machine = machine;
	this.m_email = email;
	this.m_name = name;
	this.m_passwd = passwd;
}

function FT_ntpServer(ntp)
{
    this.m_ntp = ntp;
}

function FT_ldapServer(type /* oa | lan */, ldap, update_username, update_userpasswd, read_username, read_userpasswd)
{
    this.m_type= type;
    this.m_ldap = ldap;
	this.m_update_username = update_username;
	this.m_update_userpasswd = update_userpasswd;
	this.m_read_username = read_username;
	this.m_read_userpasswd = read_userpasswd;
}

function FT_blb(type /* oa | blb */, username, passwd)
{
    this.m_type = type;
    this.m_username = username;
	this.m_passwd = passwd;
}

function FT_passwordPolicy(type /* first | default */)
{
    this.m_type = type;
}

function FT_oaConfigObj (busObj)
{
    /////////////////////////////////////
    // properties
    var thisObj = this;
    this.m_objName = 'FT_oaConfigObj';
    this.m_guiCb = null;
    this.m_busObj = busObj;
    this.m_lastCmdSent = undefined;
	this.m_emailSrv = undefined;
	this.m_ntpSrv = undefined;
	this.m_ldapSrv = undefined;
	this.m_blb = undefined;
	this.m_passwdPolicy = undefined;
	
    /////////////////////////////////////////
    /**
     * A callback function for all user management requests.
     */
    this.f_respondRequestCallback = function(resp, cmdSent, noUICallback)
    {
        var response = thisObj.m_busObj.f_getRequestResponse(
                        thisObj.m_busObj.m_request);

        if(response == null) return;

        if(response.f_isError != null)
        {
            if(noUICallback == undefined || !noUICallback)
                thisObj.m_guiCb(response);
        }
        else
        {
            var evt = new FT_eventObj(0, thisObj, '');

            var err = response.getElementsByTagName('error');
            if(err != null && err[0] != null)
            {
                if(thisObj.m_lastCmdSent.indexOf('email') > 0)
                {
                    thisObj.m_emailSrv = thisObj.f_parseEmail(err);
                    evt = new FT_eventObj(0, thisObj.m_emailSrv, '');
                }
            }

            if(thisObj.m_guiCb != undefined)
                thisObj.m_guiCb(evt);
        }
    }

    this.f_parseEmail = function(response)
    {
        return 'not yet implemented.';
    }
	
    this.f_parseNtp = function(response)
    {
        return 'not yet implemented.';
    }	
	
    this.f_parseLdap = function(response)
    {
        return 'not yet implemented.';
    }	
	
    this.f_parseBlb = function(response)
    {
        return 'not yet implemented.';
    }	
	
    this.f_parsePasswdPolicy = function(response)
    {
        return 'not yet implemented.';
    }	
	
    /**
     *  retrieve oa email server configuration
     */
    this.f_getEmail = function(guiCb)
    {
        thisObj.m_guiCb = guiCb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                     "<statement>open-app email</statement></command>";
        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }	
	
}
