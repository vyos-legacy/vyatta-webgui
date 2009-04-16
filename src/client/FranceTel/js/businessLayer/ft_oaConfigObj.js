/*
    Document   : ft_oaConfigObj.js
    Created on : Feb 26, 2009, 3:19:25 PM
    Author     : Loi.Vo
    Description:
*/

function FT_emailServer(smtp, machine, email, name, passwd)
{
    this.m_smtp= smtp;
    this.m_machine = machine;
	this.m_email = email;
	this.m_name = name;
	this.m_passwd = passwd;
	
	this.f_setCmd = function() {
		return "set smtp ip '" + this.m_smtp + "' name '" + this.m_machine + "' email '" +
		       this.m_email + "' username '" + this.m_name + "' password '" + this.m_passwd + "'";
	}
}

function FT_ntpServer(ntp)
{
    this.m_ntp = ntp;
	
	this.f_setCmd = function() {
		return "set ntp server '" + this.m_ntp + "'";
	}
}

function FT_ldapServer(type /* oa | lan */, ldap, update_username, update_userpasswd, read_username, read_userpasswd)
{
    this.m_type= type;
    this.m_ldap = ldap;
	this.m_update_username = update_username;
	this.m_update_userpasswd = update_userpasswd;
	this.m_read_username = read_username;
	this.m_read_userpasswd = read_userpasswd;
	
	this.f_setCmd = function() {
		return "set ldap ip '" + this.m_ldap + "' r-user '" + this.m_read_username + "' r-password '" +
		       this.m_read_userpasswd + "' rw-user '" + this.m_update_username + "' rw-password '" +
			   this.m_update_userpasswd + "'";
	}	
}

function FT_blb(type /* oa | blb */, username, passwd)
{
    this.m_type = type;
    this.m_username = username;
	this.m_passwd = passwd;
}

function FT_passwordPolicy(type /* mchange | default */)
{
    this.m_type = type;
	
	this.f_scope = function() {
		var scope = 'user';
		var uo = g_busObj.f_getLoginUserObj();
		var loginUser = g_busObj.f_getLoginUserRec();

        if (loginUser.m_role == uo.V_ROLE_INSTALL) {
			scope = 'admin';
		}	
		return scope;		
	}
	
	this.f_setCmd = function() {			
		if (type == 'mchange') {
			return "set password-policy " + this.f_scope();
		} else {
			return "delete password-policy " + this.f_scope();
		}
	}
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

        if(response.f_isError != null) { //This is server error case.
            //alert('response.f_isError is not null');
            if (noUICallback == undefined || !noUICallback) {
				thisObj.m_guiCb(response);
			} 
        } else {
            var evt = new FT_eventObj(0, thisObj, '');

            var err = response.getElementsByTagName('error');
			//alert('err: ' + err);
            if(err != null && err[0] != null) { //The return value is inside the <error> tag.
                if(thisObj.m_lastCmdSent.indexOf('smtp') > 0) {
                    thisObj.m_emailSrv = thisObj.f_parseEmail(err);
                    evt = new FT_eventObj(0, thisObj.m_emailSrv, '');
                } else if (thisObj.m_lastCmdSent.indexOf('ldap') > 0) {
                    thisObj.m_ldapSrv = thisObj.f_parseLdap(err);
                    evt = new FT_eventObj(0, thisObj.m_ldapSrv, '');					
				}  else if (thisObj.m_lastCmdSent.indexOf('ntp') > 0) {
                    thisObj.m_ntpSrv = thisObj.f_parseNtp(err);
                    evt = new FT_eventObj(0, thisObj.m_ntpSrv, '');					
				}  else if (thisObj.m_lastCmdSent.indexOf('password-policy') > 0) {
                    thisObj.m_passwdPolicy= thisObj.f_parsePasswdPolicy(err);
                    evt = new FT_eventObj(0, thisObj.m_passwdPolicy, '');					
				}  else if (thisObj.m_lastCmdSent.indexOf('blb') > 0) {
                    thisObj.m_blb = thisObj.f_parseBlb(err);
                    evt = new FT_eventObj(0, thisObj.m_blb, '');					
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
            var evt = new FT_eventObj(0, thisObj, '');
            if(thisObj.m_guiCb != undefined)
                thisObj.m_guiCb(evt);
        }
    }

    this.f_getConfigNodeFromResponse = function(response, node)
    {
        var cn = response[0].childNodes;
        for(var i=0; i<cn.length; i++)
        {
            if(cn[i].nodeName == 'msg')
            {
                var obj = cn[i].childNodes;
                for(var j=0; j<obj.length; j++)
                {
                    if(obj != undefined && obj[j] != undefined &&
                        obj[j].nodeName == node)
                        return obj[j];
                }
            }
        }

        return null;
    }

    this.f_parseEmail = function(response)
    {	
		var val = thisObj.f_getConfigNodeFromResponse(response, 'smtp-client');
		var obj = new FT_emailServer('','','','','');
		
		for (var i=0; i < val.childNodes.length; i++) {
			var cNode = val.childNodes[i];
			var cNodeValue = '';
			if (cNode.childNodes[0]) {
				cNodeValue = cNode.childNodes[0].nodeValue;
			}
			switch (cNode.nodeName) {
                case 'address':
				    obj.m_smtp = cNodeValue;
					break;
                case 'name':
				    obj.m_machine = cNodeValue;
					break;
                case 'password':
				    obj.m_passwd = cNodeValue;
					break;
                case 'email':
				    obj.m_email = cNodeValue;
					break;
			    case 'username':
				    obj.m_name = cNodeValue;
				    break;
			}
		}
        return obj;
    }
	
    this.f_parseNtp = function(response)
    {
		var val = thisObj.f_getConfigNodeFromResponse(response, 'ntp-server');
		var obj = new FT_ntpServer('');
		if (val.childNodes[0]) {
			obj.m_ntp = val.childNodes[0].nodeValue;
		}
		
        return obj;		
    }	
	
    this.f_parseLdap = function(response)
    {
		var val = thisObj.f_getConfigNodeFromResponse(response, 'ldap');	
        var obj = new FT_ldapServer('', '', '', '', '', '');

		for (var i=0; i < val.childNodes.length; i++) {
			var cNode = val.childNodes[i];
			var cNodeValue = '';
			if (cNode.childNodes[0]) {
				cNodeValue = cNode.childNodes[0].nodeValue;
			}
			
			switch (cNode.nodeName) {
                case 'address':
				    obj.m_ldap = cNodeValue;
					break;
                case 'local':
				    if (cNodeValue == 'true') {
						this.m_type = 'oa';
					} else {
						this.m_type = 'lan';
					}
					break;
                case 'r-password':
				    obj.m_read_userpasswd = cNodeValue;
					break;
                case 'r-username':
				    obj.m_read_username= cNodeValue;
					break;
			    case 'rw-password':
				    obj.m_update_userpasswd = cNodeValue;
				    break;
				case 'rw-username':
				    obj.m_update_username = cNodeValue;
				    break;	
				
			}
		}
        return obj;		
    }	
	
    this.f_parseBlb = function(response)
    {
        return new FT_blb('oa', '', '')
    }	
	
    this.f_parsePasswdPolicy = function(response)
    {
		var val = thisObj.f_getConfigNodeFromResponse(response, 'password-policy');
		var obj = new FT_passwordPolicy('');
		
		for (var i=0; i < val.childNodes.length; i++) {
			var cNode = val.childNodes[i];
			var cNodeValue = '';
			if (cNode.childNodes[0]) {
				cNodeValue = cNode.childNodes[0].nodeValue;
			}
			
			switch (cNode.nodeName) {
                case 'user':
				    if (obj.f_scope() == 'user') {
						if (cNodeValue == 'true') {
							obj.m_type = 'mchange';
						} else {
							obj.m_type = 'default';
						}
					}
					break;
                case 'admin':
				    if (obj.f_scope() == 'admin') {
						if (cNodeValue == 'true') {
							obj.m_type = 'mchange';
						} else {
							obj.m_type = 'default';
						}
					}
					break;
			}
		}
        return obj;
    }	
	
    /**
     *  retrieve oa email server configuration
     */
    this.f_getEmail = function(guiCb)
    {
        thisObj.f_getConfig(guiCb, 'smtp');
    }	
	
    /**
     *  retrieve oa ntp server configuration
     */
    this.f_getNtp = function(guiCb)
    {
        thisObj.f_getConfig(guiCb, 'ntp server');
    }	
	
    /**
     *  retrieve oa password policy configuration
     */
    this.f_getPasswordPolicy = function(guiCb)
    {
        thisObj.f_getConfig(guiCb, 'password-policy');
    }	
	
    /**
     *  retrieve oa password policy configuration
     */
    this.f_getLdap = function(guiCb)
    {
        thisObj.f_getConfig(guiCb, 'ldap');
    }
		
    /**
     *  retrieve oa configuration
     *  @param type: Specify what type of configuration to retrieve.  
     *               Values are: smtp | ldap | ntp server | password-policy
     */
    this.f_getConfig = function(guiCb, type)
    {
        thisObj.m_guiCb = guiCb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                     "<statement mode='op'>open-app configuration get " + 
					 type + "</statement></command>";
        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    }		
	
    /**
     *  Set oa email server configuration
     */
    this.f_setEmail = function(guiCb, emailObj)
    {
        thisObj.f_setConfig(guiCb, emailObj);
    }	
	
    /**
     *  set oa ntp server configuration
     */
    this.f_setNtp = function(guiCb, ntpObj)
    {
        thisObj.f_setConfig(guiCb, ntpObj);
    }	
	
    /**
     *  set oa password policy configuration
     */
    this.f_setPasswordPolicy = function(guiCb, ppObj)
    {
        thisObj.f_setConfig(guiCb, ppObj);
    }	
	
    /**
     * set ldap configuration
     */
    this.f_setLdap = function(guiCb, ldapObj)
    {
        thisObj.f_setConfig(guiCb, ldapObj);
    }	

    /**
     *  set oa configuration
     *  @param obj: one of the object to be configured.
     */
    this.f_setConfig = function(guiCb, obj)
    {
        thisObj.m_guiCb = guiCb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                     "<statement mode='op'>open-app configuration " + 
					 obj.f_setCmd() + "</statement></command>";
        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallbackSetCmd);
    }	
	
	this.f_setLDAPlocation = function(guiCb, where)
	{
        thisObj.m_guiCb = guiCb;
        var sid = g_utils.f_getUserLoginedID();
		var en = '';
		if (where == 'oa') {
			en = 'enable';
		} else {
			en = 'disable';
		}
        var xmlstr = "<command><id>" + sid + "</id>" +
                     "<statement mode='op'>open-app configuration set ldap local '" + 
					 en + "'</statement></command>";
        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallbackSetCmd);		
	}
}
