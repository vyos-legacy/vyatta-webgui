/*
 Document   : ft_confUserAdd.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
FT_confUserAdd = Ext.extend(FT_confFormObj, {
    thisObjName: 'FT_confUserAdd',
    
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    constructor: function(name, callback, busLayer)
    {
        FT_confUserAdd.superclass.constructor(name, callback, busLayer);
    },
    	
    f_init: function()
    {
        this.f_setConfig( {
			id : 'conf_user_add',
			items: [ {
				v_type: 'label',
				id: 'conf_user_add_username_label',
				text: 'username *',
				v_new_row: 'true'
			}, {
				v_type: 'text',
				id: 'conf_user_add_username',
				size: '30',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_user_add_surname_label',
				text: 'surname',
				v_new_row: 'true'
			}, {
				v_type: 'text',
				id : 'conf_user_add_surname',
				size: '30',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_user_add_givenname_label',
				text: 'given name',
				v_new_row: 'true'
			}, {
				v_type: 'text',
				id: 'conf_user_add_givenname',
				size: '30',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_user_add_email_label',
				text: 'email',
				v_new_row: 'true'
			}, {
				v_type: 'text',
				id: 'conf_user_add_email',
				size: '30',
				v_end_row: 'true'
			}],
			buttons: [ {
				id: 'conf_user_add_apply_button',
				text: 'Apply',
				onclick: this.f_handleClick
			}, {
				id: 'conf_user_add_cancel_button',
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
            if (id == 'conf_user_add_apply_button') { //apply clicked
                g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_USER_ID);
            } else if (id == 'conf_user_add_cancel_button') { //cancel clicked
                g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_USER_ID);               
            }
        }
    }	
    
});













