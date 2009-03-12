/*
 Document   : ft_confUserAdd.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function FT_confUserAdd (name, callback, busLayer)
{
	this.thisObjName = 'FT_confUserAdd';
	var thisObj = this;
	this.override = true;
	this.form = undefined;
	
	/**
	 * @param name - name of configuration screens.
	 * @param callback - a container callback
	 * @param busLayer - business object
	 */
	this.constructor = function(name, callback, busLayer)
	{
		FT_confUserAdd.superclass.constructor(name, callback, busLayer);
	}
	
	this.constructor(name, callback, busLayer);
	
	this.f_init = function()
	{
		this.f_setConfig({
			id: 'conf_user_add',
			items: [{
				v_type: 'label',
				id: 'conf_user_add_username_label',
				text: 'username',
				require: 'true',
				v_new_row: 'true'
			}, {
				v_type: 'text',
				id: 'conf_user_add_username',
				size: '32',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_user_add_surname_label',
				text: 'surname',
				v_new_row: 'true'
			}, {
				v_type: 'text',
				id: 'conf_user_add_surname',
				size: '32',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_user_add_givenname_label',
				text: 'given name',
				v_new_row: 'true'
			}, {
				v_type: 'text',
				id: 'conf_user_add_givenname',
				size: '32',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_user_add_email_label',
				text: 'email',
				v_new_row: 'true'
			}, {
				v_type: 'text',
				id: 'conf_user_add_email',
				size: '32',
				v_end_row: 'true'
			}],
			buttons: [{
				id: 'conf_user_add_apply_button',
				text: 'Apply',
				onclick: this.f_handleClick
			}, {
				id: 'conf_user_add_cancel_button',
				text: 'Cancel',
				onclick: this.f_handleClick
			}]
		})
	}
	
	this.f_registerOnKeyUpHandler = function() 
	{
		//register onKeyUp handler for surname, and given name. 
		//As the user types in surname, and given name field, if 
		//the username field is empty, automatically fills the username
		//field with: first charater of given naem + surname (lowercase)
        g_xbObj.f_xbAttachEventListener(document.getElementById('conf_user_add_surname'), 
		    'keyup', thisObj.f_handleKeyUp, true);		
        g_xbObj.f_xbAttachEventListener(document.getElementById('conf_user_add_givenname'), 
		    'keyup', thisObj.f_handleKeyUp, true);				
        g_xbObj.f_xbAttachEventListener(document.getElementById('conf_user_add_username'), 
		    'keyup', thisObj.f_handleKeyUpUsername, true);				
	}
	
    this.f_detachEventListener = function()
    {
        //FT_confUserAdd.superclass.f_detachEventListener();
        for (var i = 0; i < thisObj.m_config.buttons.length; i++) {
            var id = thisObj.m_config.buttons[i].id;
            var b = document.getElementById(id);
            g_xbObj.f_xbDetachEventListener(b, 'click', thisObj.m_config.buttons[i].onclick, true);
        }		
        g_xbObj.f_xbDetachEventListener(document.getElementById('conf_user_add_surname'), 
		    'keyup', thisObj.f_handleKeyUp, true);		
        g_xbObj.f_xbDetachEventListener(document.getElementById('conf_user_add_givenname'), 
		    'keyup', thisObj.f_handleKeyUp, true);			
        g_xbObj.f_xbDetachEventListener(document.getElementById('conf_user_add_username'), 
		    'keyup', thisObj.f_handleKeyUpUsername, true);				
    }	
	
	this.f_loadVMData = function()
	{
        thisObj.form = document.getElementById('conf_user_add' + "_form");		
		thisObj.f_registerOnKeyUpHandler();
	} 
	
	this.f_stopLoadVMData = function()
	{
	}
	
	this.f_validate = function()
	{
		return true;
	}
	
	this.f_handleClick = function(e)
	{
		var target = g_xbObj.f_xbGetEventTarget(e);
		if (target != undefined) {
			var id = target.getAttribute('id');
			if (id == 'conf_user_add_apply_button') { //apply clicked
				if (!thisObj.f_validate()) {
					return;
				}
				thisObj.f_addUser();
			} else if (id == 'conf_user_add_cancel_button') { //cancel clicked
				g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_USER_ID);
			}
		}
	} 
	
	this.f_handleKeyUpUsername = function(e) 
	{
	    thisObj.override = false;
	}
	
	this.f_handleKeyUp = function(e)
	{
		var s = thisObj.form.conf_user_add_username.value.trim();
		if ((s.length <= 0) || (thisObj.override)) {
			var gn = thisObj.form.conf_user_add_givenname.value.trim();
			var text = '';
			if (gn.length > 0) {
				text = text + gn.toLowerCase().charAt(0);
			}
			text = text + thisObj.form.conf_user_add_surname.value.trim().toLowerCase();
			thisObj.form.conf_user_add_username.value = text;
		}
		
	}
	
	this.f_addUser = function()
	{
		var role = undefined;
		var loginUser = g_busObj.f_getLoginUserObj();
		switch (loginUser.m_role) {
			case loginUser.V_ROLE_INSTALL:
				role = loginUser.V_ROLE_ADMIN;
				break;
			case loginUser.V_ROLE_ADMIN:
				role = loginUser.V_ROLE_USER;
				break;
			default:
				break;
		}
		var user = new FT_userRecObj(thisObj.form.conf_user_add_username.value, 
		    thisObj.form.conf_user_add_surname.value, 
			thisObj.form.conf_user_add_givenname.value, 
			thisObj.form.conf_user_add_username.value, 
			role, 
			'add', 
			thisObj.form.conf_user_add_email.value, 
			new Array()
			);
		g_busObj.f_addUserToServer(user, thisObj.f_addUserCb);
		//Here we need to popup a waiting message dialog
	}
	
	this.f_addUserCb = function()
	{
		//Here we will need to:
		//    1. Close  the waiting message dialog
		//    2. Display error messsage from server if any.  
		//    3. Take user to user list screen when no error.
		g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_USER_ID);
	}
}    


FT_extend(FT_confUserAdd, FT_confFormObj);











