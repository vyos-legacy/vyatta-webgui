/*
 Document   : ft_confPassword.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
FT_confPassword = Ext.extend(FT_confFormObj, {
    thisObjName: 'ft_confPassword',
    
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    constructor: function(name, callback, busLayer)
    {
        FT_confPassword.superclass.constructor(name, callback, busLayer);
    },	
		
    f_init: function()
    {
        this.f_setConfig( {
			id : 'conf_password',
			items: [ {
				v_type: 'html',
				id: 'conf_password_chg_at_login',
				text: '<input type="radio" name="passwd_group" value="atlogin" checked>&nbsp;The user has to change his password at first login',
                v_new_row: 'true',
				v_end_row: 'true'
			}, {
				v_type: 'empty',
				v_new_row: 'true',
				v_end_row: 'true'
			}, {
				v_type: 'html',
				id: 'conf_password_default',
				text: '<input type="radio" name="passwd_group" value="default">&nbsp;The user can keep his default password',
				v_new_row: 'true',
				v_end_row: 'true'
			}],				
			buttons: [ {
				id: 'conf_password_apply_button',
				text: 'Apply',
				onclick: this.f_handleClick
			}, {
				id: 'conf_password_cancel_button',
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
            if (id == 'conf_password_apply_button') { //apply clicked
                alert('Password Policy apply button clicked');
            } else if (id == 'conf_password_cancel_button') { //cancel clicked
                alert('Password Policy cancel button clicked');               
            }
        }
    }	
    
});
