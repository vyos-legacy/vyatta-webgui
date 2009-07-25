/*
 Document   : ft_confLDAPserver.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function FT_confLDAPserver (name, callback, busLayer) {
    var thisObjName = 'FT_confLDAPserver';
	var thisObj = this;
    this.m_form = undefined;
	this.m_ldap = undefined;		
    
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confLDAPserver.superclass.constructor(name, callback, busLayer);
    }	

	this.constructor(name, callback, busLayer);
		
    this.f_init = function()
    {
        this.f_setConfig( {
			id : 'conf_ldap_srv',
			items: [ {
				v_type: 'label',
				id: 'conf_ldap_srv_location_label',
				text: g_lang.m_ldapSrvLoc,			
				font_weight : 'bold',	
				v_new_row : 'true'
			}, 
			    FT_EMPTY_ROW
			, {
				v_type: 'html',
				id: 'conf_ldap_srv_in_oa',
				padding : '30px',
				size: '30',
				text: '<input id="conf_ldap_srv_in_oa" type="radio" name="loc_group" value="oa" checked>&nbsp;' + g_lang.m_ldapInOA,
                v_new_row: 'true',
				v_end_row: 'true'
			}, 
			    FT_EMPTY_ROW
			, {
				v_type: 'html',
				id: 'conf_ldap_srv_in_lan',
				padding : '30px',				
				size: '30',
				text: '<input id="conf_ldap_srv_in_lan" type="radio" name="loc_group" value="lan">&nbsp;' + g_lang.m_ldapInLan,
				v_new_row: 'true',
				v_end_row: 'true'
			}, 
			    FT_EMPTY_ROW
			, {
				v_type: 'label',
				id: 'conf_ldap_srv_server_addr_label',
				padding : '60px',				
				text: g_lang.m_ldapSrvAddr,
				v_new_row: 'true'
			}, {
				v_type: 'text',
				id : 'conf_ldap_srv_server_addr',				
				size: '64',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_ldap_srv_suffix_label',
				padding : '60px',				
				text: g_lang.m_ldapSuffix,
				v_new_row: 'true'				
			}, {
				v_type: 'text',
				id : 'conf_ldap_srv_suffix',				
				size: '64',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_ldap_srv_user_update_label',
				padding : '60px',				
				text: g_lang.m_ldapUsrUpdateRt,
				v_new_row: 'true'
			}, {
				v_type: 'text',
				id: 'conf_ldap_srv_user_update',
				size: '64',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_ldap_srv_user_update_passwd_label',
				padding : '60px',					
				text: g_lang.m_formPassword,
				v_new_row: 'true'
			}, {
				v_type: 'password',
				id: 'conf_ldap_srv_user_update_passwd',
				size: '64',
				v_end_row: 'true'				
			}, {
				v_type: 'label',
				id: 'conf_ldap_srv_user_read_label',
				padding : '60px',					
				text: g_lang.m_ldapUsrReadRt,
				v_new_row: 'true'
			}, {
				v_type: 'text',
				id: 'conf_ldap_srv_user_read',
				size: '64',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_ldap_srv_user_read_passwd_label',
				padding : '60px',					
				text: g_lang.m_formPassword,
				v_new_row: 'true'
			}, {
				v_type: 'password',
				id: 'conf_ldap_srv_user_read_passwd',
				size: '64',
				v_end_row: 'true'					
			}],				
			buttons: [ {
				id: 'conf_ldap_server_apply_button',
				text: 'Apply',
				tooltip: g_lang.m_tooltip_apply,
				onclick: this.f_handleClick
			}, {
				id: 'conf_ldap_server_cancel_button',
				text: 'Cancel',
				tooltip: g_lang.m_tooltip_cancel,
				onclick: this.f_handleClick
			}]
		})  
    }
	
	this.f_setFocus = function() {
		
	}

	this.f_enableTextField = function(b, id)
	{
		var el = document.getElementById(id);
		el.readOnly = (!b);
		if (b) {
			el.style.backgroundColor = '#FFFFFF';
		} else {
			el.style.backgroundColor = '#EFEFEF';			
		}		
	}
	
	this.f_setLdapValue = function()
	{
	    if ((thisObj.m_ldap != undefined) && (thisObj.m_ldap != null)) {
			thisObj.m_form.conf_ldap_srv_server_addr.value = thisObj.m_ldap.m_ldap;	
            thisObj.m_form.conf_ldap_srv_user_update.value = thisObj.m_ldap.m_update_username;
		    thisObj.m_form.conf_ldap_srv_user_update_passwd.value = thisObj.m_ldap.m_update_userpasswd;		
			thisObj.m_form.conf_ldap_srv_user_read.value = thisObj.m_ldap.m_read_username;
			thisObj.m_form.conf_ldap_srv_user_read_passwd.value = thisObj.m_ldap.m_read_userpasswd;
			thisObj.m_form.conf_ldap_srv_suffix.value = thisObj.m_ldap.m_suffix;			
		} else {
			thisObj.f_setBlank();
		}	
	}
	
	this.f_saveLdapValue = function()
	{
		if ((thisObj.m_ldap != undefined) && (thisObj.m_ldap != null)) {
			thisObj.m_ldap = new FT_ldapServer('oa', '', '', '', '', '','');
		}
		thisObj.m_ldap.m_ldap = thisObj.m_form.conf_ldap_srv_server_addr.value;
		thisObj.m_ldap.m_update_username = thisObj.m_form.conf_ldap_srv_user_update.value;
		thisObj.m_ldap.m_update_userpasswd = thisObj.m_form.conf_ldap_srv_user_update_passwd.value;
		thisObj.m_ldap.m_read_username = thisObj.m_form.conf_ldap_srv_user_read.value;
		thisObj.m_ldap.m_read_userpasswd = thisObj.m_form.conf_ldap_srv_user_read_passwd.value;
		thisObj.m_ldap.m_suffix = thisObj.m_form.conf_ldap_srv_suffix.value;
	}
	
	this.f_setBlank = function()
	{
		thisObj.m_form.conf_ldap_srv_server_addr.value = '';	
        thisObj.m_form.conf_ldap_srv_user_update.value = '';
		thisObj.m_form.conf_ldap_srv_user_update_passwd.value = '';		
	    thisObj.m_form.conf_ldap_srv_user_read.value = '';
		thisObj.m_form.conf_ldap_srv_user_read_passwd.value = '';
		thisObj.m_form.conf_ldap_srv_suffix.value = '';				
	}
	
	this.f_enable = function(b)
	{
		thisObj.f_enableTextField(b,'conf_ldap_srv_server_addr');		
		thisObj.f_enableTextField(b,'conf_ldap_srv_suffix');				
        thisObj.f_enableTextField(b, 'conf_ldap_srv_user_update');
        thisObj.f_enableTextField(b, 'conf_ldap_srv_user_update_passwd');
		thisObj.f_enableTextField(b, 'conf_ldap_srv_user_read');
		thisObj.f_enableTextField(b, 'conf_ldap_srv_user_read_passwd');		
		if (b) {
			thisObj.f_setLdapValue();			
		} else {
			thisObj.f_saveLdapValue();
			thisObj.f_setBlank();
		}
	}
	
    this.f_attachListener = function()
    {
        var el = document.getElementById('conf_ldap_srv_in_oa');
        g_xbObj.f_xbAttachEventListener(el, 'click', thisObj.f_handleClick, true);
		el = document.getElementById('conf_ldap_srv_in_lan');
        g_xbObj.f_xbAttachEventListener(el, 'click', thisObj.f_handleClick, true);	
    }
    
    this.f_detachListener = function()
    {
        var el = document.getElementById('conf_ldap_srv_in_oa');
        g_xbObj.f_xbDetachEventListener(el, 'click', thisObj.f_handleClick, true);
		el = document.getElementById('conf_ldap_srv_in_lan');
        g_xbObj.f_xbDetachEventListener(el, 'click', thisObj.f_handleClick, true);		
    }	
	
    this.f_loadVMData = function(element)
    {
        thisObj.m_form = document.getElementById('conf_ldap_srv' + "_form");	
		thisObj.f_setFocus();
		thisObj.f_attachListener();	
				
        var cb = function(evt)
        {
            if(evt != undefined && evt.m_objName == 'FT_eventObj')
            {
		        if (evt.f_isError()) {
					g_utils.f_popupMessage(evt.m_errMsg, 'ok', g_lang.m_error, true);
					return;
				}				
				thisObj.m_ldap = evt.m_value;
                if(thisObj.m_ldap == undefined)  
				    return;
				thisObj.m_form.conf_ldap_srv_server_addr.value = thisObj.m_ldap.m_ldap;	
                thisObj.m_form.conf_ldap_srv_user_update.value = thisObj.m_ldap.m_update_username;
				thisObj.m_form.conf_ldap_srv_user_update_passwd.value = thisObj.m_ldap.m_update_userpasswd;		
				thisObj.m_form.conf_ldap_srv_user_read.value = thisObj.m_ldap.m_read_username;
				thisObj.m_form.conf_ldap_srv_user_read_passwd.value = thisObj.m_ldap.m_read_userpasswd;
				thisObj.m_form.conf_ldap_srv_suffix.value = thisObj.m_ldap.m_suffix;
				if (thisObj.m_ldap.m_type == 'oa') {
		            thisObj.m_form.conf_ldap_srv_in_oa.checked = true;
					thisObj.m_form.conf_ldap_srv_in_lan.checked = false;
					thisObj.f_enable(false);
				} else {
		            thisObj.m_form.conf_ldap_srv_in_oa.checked = false;
					thisObj.m_form.conf_ldap_srv_in_lan.checked = true;		
					thisObj.f_enable(true);			
				}
            }
        }
        thisObj.m_busLayer.f_getOAConfig(cb, 'ldap');					
    }
    
    this.f_stopLoadVMData = function()
    {
		thisObj.f_detachListener();		
    }
	
	this.f_validate = function() 
	{
        var error = g_lang.m_formFixError + '<br>';
        var errorInner = '';
        if (thisObj.m_form.conf_ldap_srv_in_oa.checked == true) {
			return true;
		}
        if (!thisObj.f_checkIP(thisObj.m_form.conf_ldap_srv_server_addr.value)) {
            if (!thisObj.f_checkHostname(thisObj.m_form.conf_ldap_srv_server_addr.value)) {
                errorInner += thisObj.f_createListItem(g_lang.m_ldapSrvAddr + ' ' + g_lang.m_formInvalid);
            }
        }
			
		errorInner = thisObj.f_checkEmpty(thisObj.m_form.conf_ldap_srv_suffix, g_lang.m_ldapSuffix + ' ' + g_lang.m_formNoEmpty, errorInner);
		errorInner = thisObj.f_checkEmpty(thisObj.m_form.conf_ldap_srv_user_update, g_lang.m_ldapUsrUpdateRt + ' ' + g_lang.m_formNoEmpty, errorInner);
		errorInner = thisObj.f_checkEmpty(thisObj.m_form.conf_ldap_srv_user_update_passwd, g_lang.m_ldapPasswdUpdateRt + ' ' + g_lang.m_formNoEmpty, errorInner);
		errorInner = thisObj.f_checkEmpty(thisObj.m_form.conf_ldap_srv_user_read, g_lang.m_ldapUsrReadRt + ' ' + g_lang.m_formNoEmpty, errorInner);
		errorInner = thisObj.f_checkEmpty(thisObj.m_form.conf_ldap_srv_user_read_passwd, g_lang.m_ldapPasswdReadRt + ' ' + g_lang.m_formNoEmpty, errorInner);
			   		   
        if (errorInner.trim().length > 0) {
            error = error + '<ul style="padding-left:30px;">';
            error = error + errorInner + '</ul>';
            g_utils.f_popupMessage(error, 'error', g_lang.m_error,true);
			return false;
        }

        return true;		
		
	}
	
	/*
	this.f_setLdapLocation = function()
	{
		var type = 'lan';
		
		if (thisObj.m_form.conf_ldap_srv_in_oa.checked == true) {
			type = 'oa';
		} else {
			type = 'lan';
		}		
		var cb = function(evt) {
		    if (evt.f_isError()) {
		        g_utils.f_popupMessage(evt.m_errMsg, 'ok', g_lang.m_error, true);			    
		    } else {
				if (type == 'lan') {
					thisObj.f_setLdapConfig();
				} else {
                    g_utils.f_popupMessage(g_lang.m_menuLDAPConfig +  ' ' + g_lang.m_formSave,   'ok', g_lang.m_menuLDAPConfig,true);				
				}
		    }				
		}
		thisObj.m_busLayer.f_setLDAPlocation(cb, type);
	}
	*/
	
	this.f_setLdapConfig = function()
	{
		var type = 'lan';
		
		if (thisObj.m_form.conf_ldap_srv_in_oa.checked == true) {
			type = 'oa';
		} else {
			type = 'lan';
		}
		
		var ldap = new FT_ldapServer(type /* oa | lan */, 
		                             thisObj.m_form.conf_ldap_srv_server_addr.value, 
									 thisObj.m_form.conf_ldap_srv_user_update.value, 
									 thisObj.m_form.conf_ldap_srv_user_update_passwd.value, 
									 thisObj.m_form.conf_ldap_srv_user_read.value, 
									 thisObj.m_form.conf_ldap_srv_user_read_passwd.value,
									 thisObj.m_form.conf_ldap_srv_suffix.value);
		thisObj.m_ldap = ldap;	
			
        var cb = function(evt) {
		    if (evt.f_isError()) {
		        g_utils.f_popupMessage(evt.m_errMsg, 'ok', g_lang.m_error, true);			    
		    } else {
                g_utils.f_popupMessage(g_lang.m_menuLDAPConfig +  ' ' + g_lang.m_formSave,   'ok', g_lang.m_menuLDAPConfig,true);
		    }			
		}	
		thisObj.m_busLayer.f_setOAConfig(cb, ldap);		
	}
	
	this.f_apply = function()
	{
        //thisObj.f_setLdapLocation();
		thisObj.f_setLdapConfig();
		return false;			
	}
	
	this.f_reset = function()
	{
        thisObj.f_loadVMData();
		return false; 	
	}
    
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_ldap_server_apply_button') { //apply clicked
                if (!thisObj.f_validate()) {
					return false;
				}
                thisObj.f_apply();
            } else if (id == 'conf_ldap_server_cancel_button') { //cancel clicked
                thisObj.f_reset();               
            } else if (id == 'conf_ldap_srv_in_lan') {
				thisObj.f_enable(true);
				thisObj.m_form.conf_ldap_srv_server_addr.focus();
			} else if (id == 'conf_ldap_srv_in_oa') {
				thisObj.f_enable(false);
			} 
        }
    }	
	
    this.f_handleKeydown = function(e)
    {
        if(e.keyCode != 13)	{
			return;
		}	
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_ldap_server_cancel_button') { //cancel clicked
                thisObj.f_reset();
				return false;				
            }
        }
    }
}

FT_extend(FT_confLDAPserver, FT_confFormObj);