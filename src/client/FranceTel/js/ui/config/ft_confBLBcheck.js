/*
 Document   : ft_confBLBcheck.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function FT_confBLBcheck(name, callback, busLayer)
{
    var thisObjName = 'ft_confBLBcheck';
	var thisObj = this;
    this.m_form = undefined;
	this.m_blb = undefined;
    
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confBLBcheck.superclass.constructor(name, callback, busLayer);
    }
    
    this.constructor(name, callback, busLayer);
    
    
    this.f_init = function(obj)
    {
		thisObj.m_blb = obj;
		thisObj.m_blb.m_passwd = '';
		
        this.f_setConfig({
            id: 'conf_blb_check',
            items: [{
                v_type: 'label',
                id: 'conf_blb_check_login_label',
                text: g_lang.m_login,
                v_new_row: 'true'
            }, {
                v_type: 'text',
                id: 'conf_blb_check_login',
                size: '64',
				readonly: 'true',
                v_end_row: 'true'
            }, {
                v_type: 'label',
                id: 'conf_blb_check_password_label',
                text: g_lang.m_password,
                v_new_row: 'true'
            }, {
                v_type: 'password',
                id: 'conf_blb_check_password',
                size: '64',
                v_end_row: 'true'
            }],
            buttons: [{
                id: 'conf_blb_check_apply_button',
                text: 'Apply',
				tooltip: g_lang.m_tooltip_apply,
                onclick: this.f_handleClick
            }, {
                id: 'conf_blb_check_cancel_button',
                text: 'Cancel',
				tooltip: g_lang.m_tooltip_cancel,
                onclick: this.f_handleClick
            }]
        })
    }
    
    this.f_loadVMData = function(element)
    {
        thisObj.m_form = document.getElementById('conf_blb_check_form');
		thisObj.m_form.conf_blb_check_login.value = thisObj.m_blb.m_username;
    }
        
	this.f_setFocus = function() {
		thisObj.m_form.conf_blb_check_password.focus();
	}
		
    this.f_stopLoadVMData = function()
    {
    }
    
    this.f_reset = function()
    {
        thisObj.m_form.conf_blb_check_login.value = thisObj.m_blb.m_username;
        thisObj.m_form.conf_blb_check_password.value = '';
    }
    
	this.f_validate = function() 
	{
        var error = g_lang.m_formFixError + '<br>';
        var errorInner = '';
			
		errorInner = thisObj.f_checkEmpty(thisObj.m_form.conf_blb_check_login, g_lang.m_mainLogin + ' ' + g_lang.m_formNoEmpty, errorInner);
		errorInner = thisObj.f_checkEmpty(thisObj.m_form.conf_blb_check_password, g_lang.m_password + ' ' + g_lang.m_formNoEmpty, errorInner);
			   		   
        if (errorInner.trim().length > 0) {
            error = error + '<ul style="padding-left:30px;">';
            error = error + errorInner + '</ul>';
            g_utils.f_popupMessage(error, 'error', g_lang.m_error,true);
			return false;
        }

        return true;		
		
	}	
	
    this.f_apply = function()
    {				
		var blb = new FT_blb('association', 
		                     thisObj.m_form.conf_blb_check_login.value, 
							 thisObj.m_form.conf_blb_check_password.value);
			
        var cb = function(evt) {
		    if (evt.f_isError()) {
		        g_utils.f_popupMessage(evt.m_errMsg, 'ok', g_lang.m_error, true,'f_confBLBcheckApply()');			    
		    } else {
                g_utils.f_popupMessage(g_lang.m_menuBLBAssocication +  ' ' + g_lang.m_formSave,   
				                       'ok', g_lang.m_menuBLBCredCheck, true, 'f_confBLBcheckApply()');
		    }	
		}	
		thisObj.m_busLayer.f_setOAConfig(cb, blb);					
    }
    
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_blb_check_apply_button') { //apply clicked
                if (!thisObj.f_validate()) {
					return false;
				}
                thisObj.f_apply();
            } else if (id == 'conf_blb_check_cancel_button') { //cancel clicked
                thisObj.f_reset();
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
            if (id == 'conf_blb_check_cancel_button') { //cancel clicked
                thisObj.f_reset();
				return false;				
            }
        }
    }	
    
}
FT_extend(FT_confBLBcheck, FT_confFormObj);

function f_confBLBcheckApply()
{
    g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_BLB_ID);	
}
