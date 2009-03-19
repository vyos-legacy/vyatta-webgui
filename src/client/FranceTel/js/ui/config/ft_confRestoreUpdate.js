/*
 Document   : ft_confRestoreUpdate.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function FT_confRestoreUpdate (name, callback, busLayer) {
    var thisObjName = 'FT_confRestoreUpdate';
    
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confRestoreUpdate.superclass.constructor(name, callback, busLayer);
    }	

	this.constructor(name, callback, busLayer);
		
    this.f_init = function(vmUpdate)
    {
        this.f_setConfig( {
			id : 'conf_restore_update',
			items: [ {
				v_type: 'label',
				id: 'conf_restore_update_vm_label',
				text: vmUpdate.m_name,			
				font_weight : 'bold',	
				v_new_row : 'true'
			}, {
				v_type: 'empty',
				v_new_row: 'true',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_restore_update_cver_label',
				padding : '30px',				
				text: 'Current version',
				v_new_row: 'true'
			}, {
				v_type: 'label',
				id : 'conf_restore_update_cver_value',				
				text: vmUpdate.m_versions[0],
				font_weight: 'bold',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_restore_update_pver_label',
				padding : '30px',				
				text: 'Previous version',
				v_new_row: 'true'
			}, {
				v_type: 'label',
				id : 'conf_restore_update_pver_value',				
				text: vmUpdate.m_versions[1],
				font_weight: 'bold',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_ldap_srv_user_update_passwd_label',
				padding : '60px',					
				text: 'Password',
				v_new_row: 'true'
			}],				
			buttons: [ {
				id: 'conf_restore_update_update_button',
				text: 'Update',
				onclick: this.f_handleClick
			}, {
				id: 'conf_restore_update_cancel_button',
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
    
	this.f_update = function() 
	{
		
	}
	
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_restore_update_update_button') { //update clicked
                this.f_update();
            } else if (id == 'conf_restore_update_cancel_button') { //cancel clicked
                g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_UPDATE_ID);                             
            }
        }
    }	    
}

FT_extend(FT_confRestoreUpdate, FT_confFormObj);