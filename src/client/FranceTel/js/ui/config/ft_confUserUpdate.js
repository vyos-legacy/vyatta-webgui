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
    this.m_transaction = undefined;
    
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
                text: g_lang.m_userUsername,
                v_new_row: 'true'
            }, {
                v_type: 'text',
                id: 'conf_user_update_username',
                size: '32',
                readonly: 'true'
            }, {
                v_type: 'html',
                v_end_row: 'true',
                text: '<a href="#" id="conf_user_update_reset_passwd" class="v_label_bold_right">' + g_lang.m_userResetPasswd + '</a>'
            }, {
                v_type: 'label',
                id: 'conf_user_update_surname_label',
                text: g_lang.m_userSurname,
                v_new_row: 'true'
            }, {
                v_type: 'text',
                id: 'conf_user_update_surname',
                size: '32',
                v_end_row: 'true'
            }, {
                v_type: 'label',
                id: 'conf_user_update_givenname_label',
                text: g_lang.m_userGivenName,
                v_new_row: 'true'
            }, {
                v_type: 'text',
                id: 'conf_user_update_givenname',
                size: '32',
                v_end_row: 'true'
            }, {
                v_type: 'label',
                id: 'conf_user_update_email_label',
                text: g_lang.m_userEmail,
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
				tooltip: g_lang.m_tooltip_apply,
                onclick: this.f_handleClick
            }, {
                id: 'conf_user_update_cancel_button',
                text: 'Cancel',
				tooltip: g_lang.m_tooltip_cancel,
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
        thisObj.f_setFocus();
    }
	
	this.f_setFocus = function()
	{
		thisObj.form.conf_user_update_surname.focus();
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
        thisObj.f_enableClick(false);
        thisObj.m_transaction = new Array();
        
        if (thisObj.m_user.m_last != thisObj.form.conf_user_update_surname.value.trim()) {
            thisObj.m_transaction.push(new FT_transaction('mod', 'last', thisObj.form.conf_user_update_surname.value.trim()));
        }
        if (thisObj.m_user.m_first != thisObj.form.conf_user_update_givenname.value.trim()) {
            thisObj.m_transaction.push(new FT_transaction('mod', 'first', thisObj.form.conf_user_update_givenname.value.trim()));
        }
        if (thisObj.m_user.m_email != thisObj.form.conf_user_update_email.value.trim()) {
            thisObj.m_transaction.push(new FT_transaction('mod', 'email', thisObj.form.conf_user_update_email.value.trim()));
        }
        
        if (thisObj.m_transaction.length > 0) {
            thisObj.f_processTransaction();
        }
    }
    
    this.f_processTransaction = function()
    {
        if (thisObj.m_transaction.length <= 0) {
            thisObj.f_enableClick(true);
        } else {
            var t = thisObj.m_transaction.shift();
            var user = undefined;
            switch (t.m_name) {
                case 'last':
                    user = new FT_userRecObj(thisObj.form.conf_user_update_username.value, t.m_value, null, null, null, 'change', null, null);
                    break;
                case 'first':
                    user = new FT_userRecObj(thisObj.form.conf_user_update_username.value, null, t.m_value, null, null, 'change', null, null);
                    break;
                case 'email':
                    user = new FT_userRecObj(thisObj.form.conf_user_update_username.value, null, null, null, null, 'change', t.m_value, null);
                    break;
            }
            g_busObj.f_modifyUserFromServer(user, thisObj.f_updateUserCb);
        }
    }
    
    this.f_updateUserCb = function(eventObj)
    {
        //Here we will need to:
        //    1. Close  the waiting message dialog
        //    2. Display error messsage from server if any.  
        //    3. Take user to user list screen when no error.
        if (eventObj.f_isError()) {
            thisObj.f_enableClick(true);
            thisObj.m_transaction.length = 0;
            g_utils.f_popupMessage(eventObj.m_errMsg, 'ok', g_lang.m_error,true);
        } else if (thisObj.m_transaction.length > 0) {
            thisObj.f_processTransaction();
        } else {
            g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_USER_ID);
        }
    }
    
    this.f_resetPasswd = function()
    {
        var message = g_lang.m_userResetPasswdConfirm;
        var type = 'confirm';
        var title = g_lang.m_userResetPasswd + ' ' + g_lang.m_userConfirmation;
        thisObj.f_enableClick(false);
        g_utils.f_popupMessage(message, type, title, true,'f_confUserUpdateApply(this)', 'f_confUserUpdateApply(this)');
    }
    
    this.f_resetPasswdConfirmCb = function()
    {
        var user = new FT_userRecObj(this.m_user.m_user, null, null, null, null, null, null, null,null);
        g_busObj.f_resetUserPassword(user, thisObj.f_resetPasswordCb);
    }
    
    /**
     * This is a callback from the server.
     */
    this.f_resetPasswordCb = function(eventObj)
    {
        if (eventObj.f_isError()) {
            thisObj.f_enableClick(false);
            g_utils.f_popupMessage(eventObj.m_errMsg, 'ok', g_lang.m_error, true,'f_confUserUpdateMakeModal()');
        } else {
            var message = g_lang.m_userResetPasswdSuccess;
            var type = 'ok';
            var title = g_lang.m_userResetPasswdComplete;
            thisObj.f_enableClick(false);
            g_utils.f_popupMessage(message, type, title, true,'f_confUserUpdateMakeModal()');
        }
    }
    
    this.f_validate = function()
    {
        var error = g_lang.m_formFixError + '<br>';
        var errorInner = '';
        var valid = true;
		var t = '';
		
        if (thisObj.form.conf_user_update_username.value.trim().length <= 0) {
            errorInner = errorInner + '<li style="list-style-type:square;list-style-image: url(' + g_lang.m_imageDir +'puce_squar.gif)">' + 
			                        g_lang.m_userUsername + ' ' + g_lang.m_formNoEmpty + '</li>';
            valid = false;
        }
		t = thisObj.form.conf_user_update_email.value.trim();
		//if (t.length > 0) {
			if (!thisObj.f_checkEmail(t)) {
				errorInner = errorInner + '<li style="list-style-type:square;list-style-image: url(' + g_lang.m_imageDir + 'puce_squar.gif)">' +
				g_lang.m_userEmail +
				': ' +
				thisObj.form.conf_user_update_email.value +
				' ' +
				g_lang.m_formInvalid +
				'</li>';
				valid = false;
			}
		//}
        if (!valid) {
            error = error + '<ul style="padding-left:30px;">';
            error = error + errorInner + '</ul>';
            thisObj.f_enableClick(false);
            g_utils.f_popupMessage(error, 'error',g_lang.m_error,true, 'f_confUserUpdateMakeModal()');
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
	
    this.f_handleKeydown = function(e)
    {
        if(e.keyCode != 13)	{
			return;
		}	
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_user_update_cancel_button') { //cancel clicked
                g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_USER_ID);
				return false;			   
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

function FT_transaction(type, name, value)
{
    this.m_type = type;
    this.m_name = name;
    this.m_value = value;
}
