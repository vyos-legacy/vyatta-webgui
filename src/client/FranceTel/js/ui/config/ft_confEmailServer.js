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
                text: 'SMTP server address',
                v_new_row: 'true'
            }, {
                v_type: 'text',
                id: 'conf_email_srv_stmp',
                size: '64',
                v_end_row: 'true'
            }, {
                v_type: 'label',
                id: 'conf_email_srv_local_machine_label',
                text: 'Local machine name',
                v_new_row: 'true'
            }, {
                v_type: 'text',
                id: 'conf_email_srv_local_machine',
                size: '64',
                v_end_row: 'true'
            }, {
                v_type: 'label',
                id: 'conf_email_srv_local_email_label',
                text: 'Local email address',
                v_new_row: 'true'
            }, {
                v_type: 'text',
                id: 'conf_email_srv_local_email',
                size: '64',
                v_end_row: 'true'
            }, {
                v_type: 'label',
                id: 'conf_email_srv_auth_name_label',
                text: 'Authorization name',
                v_new_row: 'true'
            }, {
                v_type: 'text',
                id: 'conf_email_srv_auth_name',
                size: '64',
                v_end_row: 'true'
            }, {
                v_type: 'label',
                id: 'conf_email_srv_auth_passwd_label',
                text: 'Authorization password',
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
    }
    
    this.f_stopLoadVMData = function()
    {
    }
    
    this.f_checkEmpty = function(field, message, err)
    {
        if (field.value.trim().length <= 0) {
            return (err + thisObj.f_liWrap(message));
        } else {
            return err;
        }
    }
    
	this.f_liWrap = function (err)
	{
		return ('<li style="list-style-type:square;list-style-image: url(images/puce_squar.gif);">' + err + '</li>');
	}
	
	
    this.f_validate = function()
    {
        var error = 'Please fix the following errors:<br>';
        var errorInner = '';
        
        if (!thisObj.f_checkIP(thisObj.m_form.conf_email_srv_stmp.value)) {
            if (!thisObj.f_checkHostname(thisObj.m_form.conf_email_srv_stmp.value)) {
                errorInner += thisObj.f_liWrap('SMTP server address is invalid');
            }
        }
        
        if (!thisObj.f_checkHostname(thisObj.m_form.conf_email_srv_local_machine.value)) {
            errorInner += thisObj.f_liWrap('Local machine name is invalid');
        }
        
        if (!thisObj.f_checkEmail(thisObj.m_form.conf_email_srv_local_email.value)) {
            errorInner += thisObj.f_liWrap('Local email address is invalid');
        }
        
        errorInner = thisObj.f_checkEmpty(thisObj.m_form.conf_email_srv_auth_name, 'Authorization name cannot be empty', errorInner);
        errorInner = thisObj.f_checkEmpty(thisObj.m_form.conf_email_srv_auth_passwd, 'Authorization password cannot be empty', errorInner);
        
        if (errorInner.trim().length > 0) {
            error = error + '<ul style="padding-left:30px;">';
            error = error + errorInner + '</ul>';
            g_utils.f_popupMessage(error, 'error', 'Error!');
			return false;
        }
        return true;
    }
    
    this.f_apply = function()
    {
        g_utils.f_popupMessage('Email server configuration saved.', 'ok', 'Email server configuration');
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

