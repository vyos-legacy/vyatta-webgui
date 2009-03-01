/*
 Document   : ft_confUserUpdate.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function FT_confUserUpdate(name, callback, busLayer)
{
    var thisObj = this;
    var thisObjName = 'FT_confUserUpdate';
    this.m_user = undefined;
    this.m_clickable = true;
    this.form = undefined;
    
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
        
        this.f_setConfig({
            id: 'conf_user_update',
            items: [{
                v_type: 'label',
                id: 'conf_user_update_username_label',
                text: 'username',
                v_new_row: 'true'
            }, {
                v_type: 'text',
                id: 'conf_user_update_username',
                size: '32',
				readonly: 'true'
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
                id: 'conf_user_update_surname',
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
            buttons: [{
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
        thisObj.form = document.getElementById('conf_user_update' + "_form");
        thisObj.form.conf_user_update_username.value = thisObj.m_user.m_user;
        thisObj.form.conf_user_update_surname.value = thisObj.m_user.m_last;
        thisObj.form.conf_user_update_givenname.value = thisObj.m_user.m_first;
        thisObj.form.conf_user_update_email.value = thisObj.m_user.m_email;
        
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
        var user = new FT_userRecObj(thisObj.form.conf_user_update_username.value, 
		    thisObj.form.conf_user_update_surname.value, 
			thisObj.form.conf_user_update_givenname.value,null, null, 'change', 
			thisObj.form.conf_user_update_email.value,null);
		/*	
	    alert('User: username:' + user.m_user + ' last: ' + user.m_last + ' first: ' + user.m_first +
		      ' email: ' + user.m_email + ' role: ' + user.m_role + ' type: ' + user.m_type + ' password: ' +
			  user.m_pw + ' right: ' + user.m_right);
		*/
        g_busObj.f_modifyUserFromServer(user, thisObj.f_updateUserCb);
        //Here we need to popup a waiting message dialog
    }
    
    this.f_updateUserCb = function(eventObj)
    {
        //Here we will need to:
        //    1. Close  the waiting message dialog
        //    2. Display error messsage from server if any.  
        //    3. Take user to user list screen when no error.
		if (eventObj.f_isError()) {
		    g_utils.f_popupMessage(eventObj.m_errMsg, 'ok', 'Error');			    
		} else {
			g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_USER_ID);
		}		
    }
    
    this.f_resetPasswd = function()
    {
        var message = 'Are you sure you want to reset password for this user?';
        var type = 'confirm';
        var title = 'Reset password confirmation';
        thisObj.f_enableClick(false);
        g_utils.f_popupMessage(message, type, title, 'f_confUserUpdateApply(this)');
    }
    
    this.f_resetPasswdConfirmCb = function()
    {
		var user = new FT_userRecObj(this.m_user.m_user, null, null, this.m_user.m_user, null, null, null, null);
        g_busObj.f_modifyUserFromServer(user, thisObj.f_resetPasswordCb);
    }
    
    /**
     * This is a callback from the server.
     */
    this.f_resetPasswordCb = function(eventObj)
    {
        if (eventObj.f_isError()) {
            thisObj.f_enableClick(false);
            g_utils.f_popupMessage(eventObj.m_errMsg, 'ok', 'Error', 'f_confUserUpdateMakeModal()');
        } else {
            var message = 'Password reset successfully';
            var type = 'ok';
            var title = 'Reset password completed'
            thisObj.f_enableClick(false);
            g_utils.f_popupMessage(message, type, title, 'f_confUserUpdateMakeModal()');
        }
    }
    
    this.f_validate = function()
    {
        var error = 'Please fix the following errors:<br>';
        var errorInner = '';
        var valid = true;
        if (thisObj.form.conf_user_update_username.value.trim().length <= 0) {
            errorInner = errorInner + '<li style="list-style-type:square;">username cannot be empty</li>';
            valid = false;
        }
        if (!thisObj.f_checkEmail(thisObj.form.conf_user_update_email.value.trim())) {
            errorInner = errorInner + '<li style="list-style-type:square">email address: ' +
            thisObj.form.conf_user_update_email.value +
            ' is invalid</li>';
            valid = false;
        }
        if (!valid) {
            error = error + '<ul style="padding-left:30px;">';
            error = error + errorInner + '</ul>';
            thisObj.f_enableClick(false);
            g_utils.f_popupMessage(error, 'error', 'Error!', 'f_confUserUpdateMakeModal()');
        }
        return valid;
    }
    
    this.f_enableClick = function(b)
    {
        thisObj.m_clickable = b;
    }
    
    this.f_handleClick = function(e)
    {
        if (!thisObj.m_clickable) {
            return;
        }
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


function f_confUserUpdateApply(e)
{
    g_configPanelObj.m_activeObj.f_enableClick(true);
    //check to see if the apply or cancel button clicked.
    if (e != undefined) {
        var id = e.getAttribute('id');
        if (id == 'ft_popup_message_apply') {
            g_configPanelObj.m_activeObj.f_resetPasswdConfirmCb();
        }
    }
}

function f_confUserUpdateMakeModal(e)
{
    g_configPanelObj.m_activeObj.f_enableClick(true);
}
