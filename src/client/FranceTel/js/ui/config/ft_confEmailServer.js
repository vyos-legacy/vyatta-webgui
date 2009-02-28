/*
 Document   : ft_confEmailServer.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function FT_confEmailServer(name, callback, busLayer) {
    var thisObjName = 'FT_confEmailServer';
    
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
        this.f_setConfig( {
			id : 'conf_email_srv',
			items: [ {
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
				id : 'conf_email_srv_local_machine',
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
			buttons: [ {
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
    }
    
    this.f_stopLoadVMData = function()
    {
    }
    
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_email_server_apply_button') { //apply clicked
                alert('Email server apply button clicked');
            } else if (id == 'conf_email_server_cancel_button') { //cancel clicked
                alert('Email server cancel button clicked');               
            }
        }
    }	
    
}

FT_extend(FT_confEmailServer, FT_confFormObj);