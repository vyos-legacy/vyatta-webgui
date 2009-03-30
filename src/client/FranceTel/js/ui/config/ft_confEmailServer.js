/*
 Document   : ft_confEmailServer.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function FT_confEmailServer(name, callback, busLayer)
{
    var thisObjName = 'FT_confEmailServer';
    var thisObj = this;
    this.m_form = undefined;
    
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confEmailServer.superclass.constructor(name, callback, busLayer);
    }
    
    this.constructor(name, callback, busLayer);
    
    this.f_init = function()
    {
        this.f_setConfig({
            id: 'conf_email_srv',
            items: [{
                v_type: 'label',
                id: 'conf_email_srv_stmp_label',
                text: g_lang.m_emailStmpAddr,
                v_new_row: 'true'
            }, {
                v_type: 'text',
                id: 'conf_email_srv_stmp',
                size: '64',
                v_end_row: 'true'
            }, {
                v_type: 'label',
                id: 'conf_email_srv_local_machine_label',
                text: g_lang.m_emailLocalMachName,
                v_new_row: 'true'
            }, {
                v_type: 'text',
                id: 'conf_email_srv_local_machine',
                size: '64',
                v_end_row: 'true'
            }, {
                v_type: 'label',
                id: 'conf_email_srv_local_email_label',
                text: g_lang.m_emailLocalEmail,
                v_new_row: 'true'
            }, {
                v_type: 'text',
                id: 'conf_email_srv_local_email',
                size: '64',
                v_end_row: 'true'
            }, {
                v_type: 'label',
                id: 'conf_email_srv_auth_name_label',
                text: g_lang.m_emailAuthName,
                v_new_row: 'true'
            }, {
                v_type: 'text',
                id: 'conf_email_srv_auth_name',
                size: '64',
                v_end_row: 'true'
            }, {
                v_type: 'label',
                id: 'conf_email_srv_auth_passwd_label',
                text: g_lang.m_emailAuthPasswd,
                v_new_row: 'true'
            }, {
                v_type: 'password',
                id: 'conf_email_srv_auth_passwd',
                size: '64',
                v_end_row: 'true'
            }],
            buttons: [{
                id: 'conf_email_server_apply_button',
                text: 'Apply',
                onclick: this.f_handleClick
            }, {
                id: 'conf_email_server_cancel_button',
                text: 'Cancel',
                onclick: this.f_handleClick
            }]
        })
    }
    
    this.f_loadVMData = function(element)
    {
        thisObj.m_form = document.getElementById('conf_email_srv' + "_form");
		thisObj.f_setFocus();
    }
	
	this.f_setFocus = function()
	{
		thisObj.m_form.conf_email_srv_stmp.focus();
	}		
    
    this.f_stopLoadVMData = function()
    {
    }
        		
    this.f_validate = function()
    {
        var error = g_lang.m_formFixError + '<br>';
        var errorInner = '';
        
        if (!thisObj.f_checkIP(thisObj.m_form.conf_email_srv_stmp.value)) {
            if (!thisObj.f_checkHostname(thisObj.m_form.conf_email_srv_stmp.value)) {
                errorInner += thisObj.f_createListItem(g_lang.m_emailSmtpAddr + ' '+ g_lang.m_formInvalid);
            }
        }
        
        if (!thisObj.f_checkHostname(thisObj.m_form.conf_email_srv_local_machine.value)) {
            errorInner += thisObj.f_createListItem(g_lang.m_emailLocalMachName + ' '+ g_lang.m_formInvalid);
        }
        
        if (!thisObj.f_checkEmail(thisObj.m_form.conf_email_srv_local_email.value)) {
            errorInner += thisObj.f_createListItem(g_lang.m_emailLocalEmail + ' '+ g_lang.m_formInvalid);
        }
        
        errorInner = thisObj.f_checkEmpty(thisObj.m_form.conf_email_srv_auth_name, g_lang.m_emailAuthName + ' '+ g_lang.m_formNoEmpty, errorInner);
        errorInner = thisObj.f_checkEmpty(thisObj.m_form.conf_email_srv_auth_passwd, g_lang.m_emailAuthPasswd + ' ' + g_lang.m_formNoEmpty, errorInner);
        
        if (errorInner.trim().length > 0) {
            error = error + '<ul style="padding-left:30px;">';
            error = error + errorInner + '</ul>';
            g_utils.f_popupMessage(error, 'error', g_lang.m_error, true);
			return false;
        }
        return true;
    }
    
    this.f_apply = function()
    {
        g_utils.f_popupMessage(g_lang.m_emailSrvConfig + ' ' + g_lang.m_formSave, 'ok', g_lang.m_emailSrvConfig,true);
    }
    
    this.f_reset = function()
    {
    
    }
    
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_email_server_apply_button') { //apply clicked
                if (!thisObj.f_validate()) {
					return false;
				} 
			    thisObj.f_apply();
            } else if (id == 'conf_email_server_cancel_button') { //cancel clicked
                thisObj.f_reset();
            }
        }
    }
    
}

FT_extend(FT_confEmailServer, FT_confFormObj);

