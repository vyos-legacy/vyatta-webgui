/*
 Document   : ft_confUserUpdate.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function FT_confUserUpdate (name, callback, busLayer) {
    var thisObj = this;  	
    var thisObjName = 'FT_confUserUpdate';
    this.m_user = undefined;
	  
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confUserUpdate.superclass.constructor(name, callback, busLayer);
    }

	this.constructor(name, callback, busLayer);
    
	
	////////////////////////////////////////////////////////////////////////////////////
	// This function needs to be removed.
	////////////////////////////////////////////////////////////////////////////////////
	this.f_getDummyUser = function(obj) 
	{ 
		 var user = new FT_userRecObj(obj, 'last', 'first', obj, 0, 'change', 'first.last@ft.com', '');
		 return user;
	}
		
    this.f_init = function(obj)
    {
		thisObj.m_user = g_busObj.f_getUserFromLocal(obj);
        ///////////////////////////////////////////////////////////////////////////////
        //dummy user.  will be removed after backend is ready.
		///////////////////////////////////////////////////////////////////////////////
		thisObj.m_user = thisObj.f_getDummyUser(obj);
		///////////////////////////////////////////////////////////////////////////////
				
        this.f_setConfig( {
			id : 'conf_user_update',
			items: [ {
				v_type: 'label',
				id: 'conf_user_update_username_label',
				text: 'username',
				v_new_row: 'true'
			}, {
				v_type: 'text',
				id: 'conf_user_update_username',
				size: '32'
			}, {
				v_type: 'html',
				v_end_row: 'true',
				text: '<a href="#" id="conf_user_update_reset_passwd" class="v_label_bold_right">Reset password</a>'				
			}, {
				v_type: 'label',
				id: 'conf_user_update_surname_label',
				text: 'surname',
				v_new_row: 'true'
			}, {
				v_type: 'text',
				id : 'conf_user_update_surname',
				size: '32',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_user_update_givenname_label',
				text: 'given name',
				v_new_row: 'true'
			}, {
				v_type: 'text',
				id: 'conf_user_update_givenname',
				size: '32',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_user_update_email_label',
				text: 'email',
				v_new_row: 'true'
			}, {
				v_type: 'text',
				id: 'conf_user_update_email',
				size: '32',
				v_end_row: 'true'
			}],
			buttons: [ {
				id: 'conf_user_update_apply_button',
				text: 'Apply',
				onclick: this.f_handleClick
			}, {
				id: 'conf_user_update_cancel_button',
				text: 'Cancel',
				onclick: this.f_handleClick
			}]
		})  
    }
	
    this.f_loadVMData = function(element)
    { 
        var href = document.getElementById('conf_user_update_reset_passwd');	
		g_xbObj.f_xbAttachEventListener(href, 'click', thisObj.f_handleClick, true);

        var form = document.getElementById('conf_user_update' + "_form");		
		form.conf_user_update_username.value = thisObj.m_user.m_user;
		form.conf_user_update_surname.value = thisObj.m_user.m_last;
		form.conf_user_update_givenname.value = thisObj.m_user.m_first;
		form.conf_user_update_email.value = thisObj.m_user.m_email;
		
    }
    
    this.f_stopLoadVMData = function()
    {
    }
	
	this.f_validate = function()
	{
		return true;
	}	
    	
	this.f_updateUser = function()
	{
		var form = document.getElementById('conf_user_update' + "_form");
		var role = thisObj.m_user.m_role;

		var user = new FT_userRecObj(form.conf_user_update_username.value, 
		    form.conf_user_update_surname.value, 
			form.conf_user_update_givenname.value, 
			thisObj.m_user.m_pw, 
			role, 
			'change', 
			form.conf_user_update_email.value, 
			new Array());
		g_busObj.f_addUserToServer(user, thisObj.f_updateUserCb);
		//Here we need to popup a waiting message dialog
	}
	
	this.f_updateUserCb = function()
	{
		//Here we will need to:
		//    1. Close  the waiting message dialog
		//    2. Display error messsage from server if any.  
		//    3. Take user to user list screen when no error.
		g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_USER_ID);
	}
	
	this.f_resetPasswd = function ()
	{
		this.m_user.m_pw = this.m_user.username;
		g_busObj.f_addUserToServer(this.m_user, thisObj.f_resetPasswdConfirmCb);
		
		var message = 'Password was reset';
		var type= 'ok';
		var title = 'Reset password'
		g_utils.f_popupMessage(message, type, title);
	}	
	
	this.f_resetPasswdConfirmCb = function(buttonClick) 
	{
	    switch (buttonClick) {
			case 'apply':
			    alert ('reset the passwd');
				break;
			case 'cancel':
			    alert('cancel click');
				break;			
		}	
	}
	
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_user_update_apply_button') { //apply clicked
                if (!thisObj.f_validate()) {
					return;
				}
				thisObj.f_updateUser();
            } else if (id == 'conf_user_update_cancel_button') { //cancel clicked
                g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_USER_ID);               
            } else if (id == 'conf_user_update_reset_passwd') {
				thisObj.f_resetPasswd();
			}
        }
    }	    
}

FT_extend(FT_confUserUpdate, FT_confFormObj);