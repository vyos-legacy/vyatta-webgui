/*
 Document   : ft_confMyProfile.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function FT_confMyProfile (name, callback, busLayer) {
    var thisObjName = 'FT_confMyProfile';
    
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
				id: 'conf_myprofile_confirum_passwd',
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
        var user = g_busObj.f_getLoginUserObj();
        var field = document.getElementById('conf_myprofile_login');
        field.innerHTML = user.m_user;
    }
    
    this.f_stopLoadVMData = function()
    {
    }
    
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_myprofile_apply_button') { //apply clicked
                //g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_USER_ADD_ID);            
                alert('My profile button clicked');
            } else if (id == 'conf_myprofile_cancel_button') { //cancel clicked
                alert('My profile cancel button clicked');        
				//g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_USER_UPDATE_ID);
            }
        }
    }	
    
}

FT_extend(FT_confMyProfile, FT_confFormObj);
