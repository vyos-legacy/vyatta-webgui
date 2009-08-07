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
	this.m_clickable = true;
	
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
				id: 'conf_user_add_surname_label',
				text: g_lang.m_userSurname,			
				v_new_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_user_add_surname_label_require',
				text: ' ',
				require: 'true'
			}, {
				v_type: 'text',
				id: 'conf_user_add_surname',
				size: '32',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_user_add_givenname_label',
				text: g_lang.m_userGivenName,				
				v_new_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_user_add_givenname_label_require',
				text: ' ',
				require: 'true'
			}, {
				v_type: 'text',
				id: 'conf_user_add_givenname',
				size: '32',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_user_add_email_label',
				text: g_lang.m_userEmail,
				colspan: '2',
				v_new_row: 'true'
			}, {
				v_type: 'text',
				id: 'conf_user_add_email',
				size: '32',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_user_add_username_label',
				text: g_lang.m_userUsername,
				v_new_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_user_add_username_label_require',
				text: ' ',
				require: 'true'
			}, {
				v_type: 'text',
				id: 'conf_user_add_username',
				size: '32',
				v_end_row: 'true'
			}],
			buttons: [{
				id: 'conf_user_add_apply_button',
				text: 'Apply',
				tooltip: g_lang.m_tooltip_apply,
				onclick: this.f_handleClick
			}, {
				id: 'conf_user_add_cancel_button',
				text: 'Cancel',
				tooltip: g_lang.m_tooltip_cancel,
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
		if (!g_xbObj.m_isSafari) {
			var e = document.getElementById('conf_user_add_surname');
			e.focus();
		}
	} 
	
	this.f_stopLoadVMData = function()
	{
		thisObj.f_detachEventListener();
	}
	
	this.f_validate = function()
	{
		var error = g_lang.m_formFixError + '<br>';
		var errorInner = '';
		var valid = true;
		var t = '';
				
		if (thisObj.form.conf_user_add_username.value.trim().length <=0 ) {
			errorInner = errorInner + '<li style="list-style-type:square;list-style-image: url(' + g_lang.m_imageDir + 'puce_squar.gif);">'+ g_lang.m_userUsername + ' ' + g_lang.m_formNoEmpty + '</li>';
			valid = false;
		}
		if (thisObj.form.conf_user_add_username.value.trim().length > 32 ) {
			errorInner = errorInner + '<li style="list-style-type:square;list-style-image: url(' + g_lang.m_imageDir + 'puce_squar.gif);">'+ g_lang.m_userUsername + ' ' + g_lang.m_formTooLong + ' 32 ' + g_lang.m_formChar  + '</li>';
			valid = false;
		}		
		if (!thisObj.f_checkUsername(thisObj.form.conf_user_add_username.value.trim())) {
			errorInner = errorInner + '<li style="list-style-type:square;list-style-image: url(' + g_lang.m_imageDir + 'puce_squar.gif);">'+ g_lang.m_userUsernameInvalidCharacter + '</li>';
			valid = false;			
		}
        if (thisObj.form.conf_user_add_surname.value.trim().length <= 0) {
            errorInner = errorInner + '<li style="list-style-type:square;list-style-image: url(' + g_lang.m_imageDir +'puce_squar.gif)">' + 
			                        g_lang.m_userSurname + ' ' + g_lang.m_formNoEmpty + '</li>';
            valid = false;
        }		
        if (thisObj.form.conf_user_add_surname.value.trim().length > 32) {
            errorInner = errorInner + '<li style="list-style-type:square;list-style-image: url(' + g_lang.m_imageDir +'puce_squar.gif)">' + 
			                        g_lang.m_userSurname + ' ' + g_lang.m_formTooLong + ' 32 ' + g_lang.m_formChar  + '</li>';
            valid = false;
        }		
        if (thisObj.form.conf_user_add_givenname.value.trim().length <= 0) {
            errorInner = errorInner + '<li style="list-style-type:square;list-style-image: url(' + g_lang.m_imageDir +'puce_squar.gif)">' + 
			                        g_lang.m_userGivenName + ' ' + g_lang.m_formNoEmpty + '</li>';
            valid = false;
        }		
        if (thisObj.form.conf_user_add_givenname.value.trim().length > 32) {
            errorInner = errorInner + '<li style="list-style-type:square;list-style-image: url(' + g_lang.m_imageDir +'puce_squar.gif)">' + 
			                        g_lang.m_userGivenName + ' ' + g_lang.m_formTooLong + ' 32 ' + g_lang.m_formChar  + '</li>';
            valid = false;
        }		
		t = thisObj.form.conf_user_add_email.value.trim();
		if (t.length > 0) {			            
            if (!thisObj.f_checkEmail(t)) {
                errorInner = errorInner + '<li style="list-style-type:square;list-style-image: url(' + g_lang.m_imageDir + 'puce_squar.gif);">' +
                g_lang.m_userEmail +
                ' ' +
                thisObj.form.conf_user_add_email.value +
                ' ' +
                g_lang.m_formInvalid +
                '</li>';
                valid = false;
            }
		}
		if (!valid) {
			error = error + '<ul style="padding-left:30px;">';
			error = error + errorInner + '</ul>';
			thisObj.f_enableClick(false);
			g_utils.f_popupMessage(error, 'error', g_lang.m_error,true,'f_confUserAddError()');
		}
		return valid;
	}
	
	this.f_enableClick = function(b) {
	    thisObj.m_clickable= b;
	}
	
	this.f_handleClick = function(e)
	{
		if (!thisObj.m_clickable) {
			return;
		}
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
	
    this.f_handleKeydown = function(e)
    {
        if(e.keyCode != 13)	{
			return;
		}	
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_user_add_cancel_button') { //cancel clicked
                g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_USER_ID);
				return false;			   
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
		var loginUser = g_busObj.f_getLoginUserObj();
		switch (loginUser.m_role) {
			case loginUser.V_ROLE_INSTALL:
				role = loginUser.V_ROLE_USER;
				break;
			case loginUser.V_ROLE_ADMIN:
				role = loginUser.V_ROLE_USER;
				break;
			default:
				break;
		}
		/*
		alert('username: ' + thisObj.form.conf_user_add_username.value + ' surname:'
		  + thisObj.form.conf_user_add_surname.value + ' givenname: ' +
		  thisObj.form.conf_user_add_givenname.value + ' passwd: ' +
		  thisObj.form.conf_user_add_username.value + ' role: ' + role + ' type: add' +
		  ' email: ' + thisObj.form.conf_user_add_email.value);
		*/  
		var user = new FT_userRecObj(thisObj.form.conf_user_add_username.value, 
		    thisObj.form.conf_user_add_surname.value, 
			thisObj.form.conf_user_add_givenname.value, 
			thisObj.form.conf_user_add_username.value, 
			'user', 
			'add', 
			thisObj.form.conf_user_add_email.value, 
			null
			);
		g_busObj.f_addUserToServer(user, thisObj.f_addUserCb);
		//Here we need to popup a waiting message dialog
	}
	
	this.f_addUserCb = function(eventObj)
	{
		//Here we will need to:
		//    1. Close  the waiting message dialog
		//    2. Display error messsage from server if any.  
		//    3. Take user to user list screen when no error.
		if (thisObj.f_isServerError(eventObj, g_lang.m_error)) {
		    return;	    
		} else {
			g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_USER_ID);
		}
	}
}    


FT_extend(FT_confUserAdd, FT_confFormObj);

function f_confUserAddError(e)
{    
	g_configPanelObj.m_activeObj.f_enableClick(true);
}









