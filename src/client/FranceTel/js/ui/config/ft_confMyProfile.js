/*
 Document   : ft_confMyProfile.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function FT_confMyProfile (name, callback, busLayer) {
    var thisObjName = 'FT_confMyProfile';
    var thisObj = this;
    this.m_user = undefined;	
	this.form = undefined;
	
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confMyProfile.superclass.constructor(name, callback, busLayer);
    }
 
	this.constructor(name, callback, busLayer);
    	
    this.f_init = function()
    {
        thisObj.m_user = g_busObj.f_getLoginUserRec();		
        this.f_setConfig( {
			id : 'conf_my_profile',
			items: [ {
				v_type: 'label',
				id: 'conf_myprofile_login_label',
				text: 'Login',
				v_new_row: 'true',
				font_weight: 'bold'
			}, {
				v_type: 'label',
				id: 'conf_myprofile_login',
				text: 'admin',
				v_end_row: 'true',
				font_weight: 'bold'
			}, {
				v_type: 'empty'
			}, {
				v_type: 'empty'
			}, {
				v_type: 'label',
				id: 'conf_myprofile_old_passwd_label',
				text: 'Old password',
				v_new_row: 'true'
			}, {
				v_type: 'password',
				id : 'conf_myprofile_old_passwd',
				size: '64',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_myprofile_new_passwd_label',
				text: 'New password',
				v_new_row: 'true'
			}, {
				v_type: 'password',
				id: 'conf_myprofile_new_passwd',
				size: '64',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_myprofile_confirm_passwd_label',
				text: 'Confirm password',
				v_new_row: 'true'
			}, {
				v_type: 'password',
				id: 'conf_myprofile_confirm_passwd',
				size: '64',
				v_end_row: 'true'
			}],
			buttons: [ {
				id: 'conf_myprofile_apply_button',
				text: 'Apply',
				onclick: this.f_handleClick
			}, {
				id: 'conf_myprofile_cancel_button',
				text: 'Cancel',
				onclick: this.f_handleClick
			}]
		})  
    }
	
    this.f_loadVMData = function(element)
    {
        var user = g_busObj.f_getLoginUserRec();
        var field = document.getElementById('conf_myprofile_login');
        field.innerHTML = user.m_user;
        thisObj.form = document.getElementById('conf_my_profile' + "_form");		
    }
	
	this.f_redraw = function(div)
	{
		//forcing this div to redraw due to label rendering bug.		
		div.style.display = 'none';
		div.style.display = 'block';
	}
    
    this.f_stopLoadVMData = function()
    {
    }
    
	this.f_validate = function() 
	{
		var opw = thisObj.form.conf_myprofile_old_passwd.value.trim(); 
		var npw = thisObj.form.conf_myprofile_new_passwd.value.trim();
        var cpw = thisObj.form.conf_myprofile_confirm_passwd.value.trim();
		
		if (opw.length <= 0) {
            g_utils.f_popupMessage('Old password cannot be empty', 'error', 'Error!', true);					
			return false;			
		}
		
		if (npw.length <= 0) {
            g_utils.f_popupMessage('New password cannot be empty', 'error', 'Error!', true);					
			return false;			
		}		
		
		if (cpw.length <= 0) {
            g_utils.f_popupMessage('Confirm password cannot be empty', 'error', 'Error!',true);					
			return false;			
		}	
				
		if (npw != cpw) {
            g_utils.f_popupMessage('New password does not match confirm password', 'error', 'Error!',true);					
			return false;
		}		
		return true;
	}
    
    /**
     * This is a callback from the server.
     */
    this.f_resetPasswordCb = function(eventObj)
    {
        if (eventObj.f_isError()) {
            g_utils.f_popupMessage(eventObj.m_errMsg, 'ok', 'Error',true);
        } else {
            var message = 'Password reset successfully';
            var type = 'ok';
            var title = 'Reset password completed'
            g_utils.f_popupMessage(message, type, title,true);
        }
    }	
	
	
	this.f_resetPassword = function()
	{
        var user = new FT_userRecObj(thisObj.m_user.m_user, null, null, thisObj.form.conf_myprofile_old_passwd.value, null, null, null, null,thisObj.form.conf_myprofile_new_passwd.value);
        g_busObj.f_modifyUserPassword(user, thisObj.f_resetPasswordCb);		
	}
	
	this.f_reset = function()
	{
		thisObj.form.conf_myprofile_old_passwd.value = '';
		thisObj.form.conf_myprofile_new_passwd.value = '';
        thisObj.form.conf_myprofile_confirm_passwd.value = '';				  		
	}
	
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_myprofile_apply_button') { //apply clicked  
				if (!thisObj.f_validate()) {
					return;
				}        
                thisObj.f_resetPassword();
            } else if (id == 'conf_myprofile_cancel_button') { //cancel clicked
                thisObj.f_reset();
            }
        }
    }	
    
}

FT_extend(FT_confMyProfile, FT_confFormObj);
