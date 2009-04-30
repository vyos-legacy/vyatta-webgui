/*
 Document   : ft_changePassword.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function FT_changePassword(name, callback, busLayer)
{
    var thisObjName = 'FT_changePassword';
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
        FT_changePassword.superclass.constructor(name, callback, busLayer);
    }
    
    this.constructor(name, callback, busLayer);
    
    this.f_init = function(username)
    {
        thisObj.m_user = username;
        this.f_setConfig({
            id: 'conf_changepasswd',
            items: [{
                v_type: 'label',
                id: 'conf_changepasswd_login_label',
                text: g_lang.m_myprofLogin,
                v_new_row: 'true'
            }, {
                v_type: 'label',
                id: 'conf_changepasswd_login',
                text: 'admin',
                v_end_row: 'true',
                padding: '30px'
            }, {
                v_type: 'empty'
            }, {
                v_type: 'empty'
            }, {
                v_type: 'label',
                id: 'conf_changepasswd_old_passwd_label',
                text: g_lang.m_myprofOldPasswd,
                v_new_row: 'true'
            }, {
                v_type: 'password',
                id: 'conf_changepasswd_old_passwd',
                size: '32',
                v_end_row: 'true'
            }, {
                v_type: 'label',
                id: 'conf_changepasswd_new_passwd_label',
                text: g_lang.m_myprofNewPasswd,
                v_new_row: 'true'
            }, {
                v_type: 'password',
                id: 'conf_changepasswd_new_passwd',
                size: '32',
                v_end_row: 'true'
            }, {
                v_type: 'label',
                id: 'conf_changepasswd_confirm_passwd_label',
                text: g_lang.m_myprofConfirmPasswd,
                v_new_row: 'true'
            }, {
                v_type: 'password',
                id: 'conf_changepasswd_confirm_passwd',
                size: '32',
                v_end_row: 'true'
            }],
            buttons: [{
                id: 'conf_changepasswd_apply_button',
                text: 'Apply',
                onclick: this.f_handleClick
            }, {
                id: 'conf_changepasswd_cancel_button',
                text: 'Cancel',
                onclick: this.f_handleClick
            }]
        })
    }
    
    this.f_resize = function()
    {
        return true;//override ft_confFormObj purposely.	
    }
    
    this.f_createGeneralDiv = function(id, text, fs, color)
    {
        var div = document.createElement('div');
        div.setAttribute('id', id);
        
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.fontSize = fs;
        div.style.width = '100%';
        div.style.color = color;
        
        var innerHtml = '<div align="left" id="' + id + '_text"><p>' + text + '</p></div>';
        
        div.innerHTML = innerHtml;
        
        return div;
    }
    
    this.f_createContentPanel = function()
    {
        var contentPanel = g_utils.f_createPopupDiv(true, 500);
        var titleDiv = thisObj.f_createGeneralDiv('change_passwd_dialog', g_lang.m_passwordChangePlease, '1.64em', '#000000');
        var errorDiv = thisObj.f_createGeneralDiv('change_passwd_dialog_err', '<br/>', '11px', '#FF6600');
        errorDiv.style.display = 'none';
        var formDiv = thisObj.f_createForm();
        contentPanel.appendChild(titleDiv);
        contentPanel.appendChild(errorDiv);
        contentPanel.appendChild(formDiv);
        
        return contentPanel;
    }
    
    this.f_createForm = function()
    {
        var div = document.createElement('div');
        div.setAttribute('id', this.m_config.id);
        div.setAttribute('align', 'center');
        div.setAttribute('class', 'conf_html_base_cls');
        /////////////////////////////////////////
        // set inner styling of the div tag
        //div.style.position = 'absolute';
        div.style.pixelLeft = 0;
        div.style.backgroundColor = 'white';
        
        //div.innerHTML = FT_confMyProfile.m_html.innerHTML;
        div.innerHTML = this.f_doLayout();
        //alert('form generated html: ' + div.innerHTML);
        div.style.display = 'block';
        
        return div;
    }
    
    this.f_getConfigurationPage = function()
    {
        var div = thisObj.f_createContentPanel();
        var popDivId = 'ft_modal_popup_message';
        var el = document.getElementById(popDivId);
        
        el.style.visibility = "visible";
        document.getElementById(popDivId).appendChild(div);
        g_utils.f_centerPopupDiv(div, true, 500);
        
        this.f_attachEventListener();
        this.f_loadVMData(div);
        this.m_div = div;
        
        return div;
    }
    
    this.f_loadVMData = function(element)
    {
        var field = document.getElementById('conf_changepasswd_login');
        field.innerHTML = thisObj.m_user;
        thisObj.form = document.getElementById('conf_changepasswd' + "_form");
        thisObj.f_setFocus();
    }
    
    this.f_setFocus = function()
    {
        thisObj.form.conf_changepasswd_old_passwd.focus();
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
    
    this.f_showError = function(bShow, message, focusField)
    {
        var div = document.getElementById('change_passwd_dialog_err');
        if (bShow) {
            var el = document.getElementById('change_passwd_dialog_err_text');
//            el.innerHTML = '<br/><img src="' + g_lang.m_imageDir + 'ft_warn_ico.PNG">&nbsp;' + 
//			               '<span style="text-align:top">' + g_lang.m_formFixError + '</span><br/>' +
//			               message;
            el.innerHTML = '<br/>' + g_lang.m_formFixError + '<br/></br>' + message;						   
            div.style.display = 'block';
            focusField.focus();
        } else {
            div.style.display = 'none';
        }
    }
    
    this.f_validate = function()
    {
        var opw = thisObj.form.conf_changepasswd_old_passwd.value.trim();
        var npw = thisObj.form.conf_changepasswd_new_passwd.value.trim();
        var cpw = thisObj.form.conf_changepasswd_confirm_passwd.value.trim();
        var error = '';
        var errorInner = '';
        var a = new Array();
        a.push(thisObj.form.conf_changepasswd_old_passwd);
        a.push(thisObj.form.conf_changepasswd_new_passwd);
        a.push(thisObj.form.conf_changepasswd_confirm_passwd);
        var index = -1;
        
        if (opw.length <= 0) {
            errorInner += thisObj.f_createListItem(g_lang.m_myprofOldPasswd + ' ' + g_lang.m_formNoEmpty);
            index = 0;
        }
        
        if (npw.length <= 0) {
            errorInner += thisObj.f_createListItem(g_lang.m_myprofNewPasswd + ' ' + g_lang.m_formNoEmpty);
            if (index == -1) {
                index = 1;
            }
        }
        
        if (cpw.length <= 0) {
            errorInner += thisObj.f_createListItem(g_lang.m_myprofConfirmPasswd + ' ' + g_lang.m_formNoEmpty);
            if (index == -1) {
                index = 2;
            }
        }
        
        if (npw != cpw) {
            errorInner += thisObj.f_createListItem(g_lang.m_myprofNPWnotCPW);
            if (index == -1) {
                index = 2;
            }
        }
        if (errorInner.trim().length > 0) {
            error = error + '<ul style="padding-left:45px;">';
            error = error + errorInner + '</ul>';
            thisObj.f_showError(true, error, a[index]);
            
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
            var err = '<br/>' + g_lang.m_error + ': ' + eventObj.m_errMsg;
            thisObj.f_showError(true, err, thisObj.form.conf_changepasswd_old_passwd);
        } else { //password saved.  Proceed to login.
            g_cookie.f_remove_all();
            g_utils.f_hidePopupMessage('ft_modal_popup_message');
			var un = thisObj.m_user;
			var pw = thisObj.form.conf_changepasswd_new_passwd.value;
            document.getElementById('password').value = ''; 			
			thisObj.f_autoLogin(un,pw);			
//            document.getElementById('password').value = '';            
//            var message = g_lang.m_passwordChangeRelogin;
//            var type = 'ok';
//            var title = g_lang.m_passwordChangeSuccess;
//            g_utils.f_popupMessage(message, type, title, true, 'f_changePasswordDialogOkCb');
        }
    }
    
    
    this.f_resetPassword = function()
    {
        var user = new FT_userRecObj(thisObj.m_user, null, null, thisObj.form.conf_changepasswd_old_passwd.value, null, null, null, null, thisObj.form.conf_changepasswd_new_passwd.value);
        g_busObj.f_modifyUserPassword(user, thisObj.f_resetPasswordCb);
    }
    
    this.f_reset = function()
    {
        //		thisObj.form.conf_changepasswd_old_passwd.value = '';
        //		thisObj.form.conf_changepasswd_new_passwd.value = '';
        //        thisObj.form.conf_changepasswd_confirm_passwd.value = '';	
        g_cookie.f_remove_all();
        g_utils.f_hidePopupMessage('ft_modal_popup_message');
    }
    
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_changepasswd_apply_button') { //apply clicked  
                if (!thisObj.f_validate()) {
                    return;
                }
                thisObj.f_resetPassword();
            } else if (id == 'conf_changepasswd_cancel_button') { //cancel clicked
                thisObj.f_reset();
            }
        }
    }
    
    this.f_handleKeydown = function(e)
    {
        if (e.keyCode != 13) {
            return;
        }
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_changepasswd_cancel_button') { //cancel clicked
                thisObj.f_reset();
                return false;
            }
        }
    }
    
    this.f_autoLogin = function(un, pw)
    {                
        var cb = function(event)
        {
            if (event.f_isError()) {
                g_utils.f_popupMessage(g_lang.m_loginUnableToLogin + event.m_errMsg, g_lang.m_ok, g_lang.m_loginError);
            } else {
                g_utils.f_saveUserLoginId(event.m_value.m_sid);
                g_utils.f_saveUserName(un);
                g_utils.f_gotoHomePage();
            }
        }
        
        g_busObj.f_userLoginRequest(un, pw, cb);
    }
    
}

FT_extend(FT_changePassword, FT_confFormObj);

function f_changePasswordDialogOkCb()
{
    //document.getElementById('password').focus();	
    //g_busObj.f_userLogout();	    
    g_utils.f_gotoHomePage();
}
