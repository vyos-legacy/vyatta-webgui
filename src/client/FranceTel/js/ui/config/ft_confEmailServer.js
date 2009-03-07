/*
 Document   : ft_confEmailServer.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
FT_confEmailServer = Ext.extend(FT_confFormObj, {
    thisObjName: 'FT_confEmailServer',
    
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    constructor: function(name, callback, busLayer)
    {
        FT_confEmailServer.superclass.constructor(name, callback, busLayer);
    },
    	
    f_init: function()
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
				size: '30',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_email_srv_local_machine_label',
				text: 'Local machine name',
				v_new_row: 'true'
			}, {
				v_type: 'text',
				id : 'conf_email_srv_local_machine',
				size: '30',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_email_srv_local_email_label',
				text: 'Local email address',
				v_new_row: 'true'
			}, {
				v_type: 'text',
				id: 'conf_email_srv_local_email',
				size: '30',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_email_srv_auth_name_label',
				text: 'Authorization name',
				v_new_row: 'true'
			}, {
				v_type: 'text',
				id: 'conf_email_srv_auth_name',
				size: '30',
				v_end_row: 'true'				
			}, {
				v_type: 'label',
				id: 'conf_email_srv_auth_passwd_label',
				text: 'Authorization password',
				v_new_row: 'true'
			}, {
				v_type: 'password',
				id: 'conf_email_srv_auth_passwd',
				size: '30',
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
    },
	
    f_loadVMData: function(element)
    {
    },
    
    f_stopLoadVMData: function()
    {
    },
    
    f_handleClick: function(e)
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
    
});