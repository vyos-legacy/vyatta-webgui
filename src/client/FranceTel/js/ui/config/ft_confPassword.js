/*
 Document   : ft_confPassword.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function FT_confPassword (name, callback, busLayer) {
    var thisObjName = 'ft_confPassword';
    var thisObj = this;	
	this.m_form = undefined;
    
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confPassword.superclass.constructor(name, callback, busLayer);
    }	

	this.constructor(name, callback, busLayer);
		
    this.f_init = function()
    {
        this.f_setConfig( {
			id : 'conf_password',
			items: [ {
				v_type: 'html',
				id: 'conf_password_chg_at_login',
				text: '<input type="radio" id="conf_password_chg_at_login" name="passwd_group" value="mchange" checked>&nbsp;' + g_lang.m_passwdPolicyChangeAtLogin,
                v_new_row: 'true',
				v_end_row: 'true'
			}, {
				v_type: 'empty',
				v_new_row: 'true',
				v_end_row: 'true'
			}, {
				v_type: 'html',
				id: 'conf_password_default',
				text: '<input type="radio" id="conf_password_default" name="passwd_group" value="default">&nbsp;' + g_lang.m_passwdPolicyCanKeep,
				v_new_row: 'true',
				v_end_row: 'true'
			}],				
			buttons: [ {
				id: 'conf_password_apply_button',
				text: 'Apply',
				tooltip: g_lang.m_tooltip_apply,				
				onclick: this.f_handleClick
			}, {
				id: 'conf_password_cancel_button',
				text: 'Cancel',
				tooltip: g_lang.m_tooltip_cancel,				
				onclick: this.f_handleClick
			}]
		})  
    }
	
	this.f_setFocus = function() {
		
	}
	
    this.f_loadVMData = function(element)
    {
        thisObj.m_form = document.getElementById('conf_password' + "_form");	
		thisObj.f_setFocus();
		
        var cb = function(evt)
        {
            if(evt != undefined && evt.m_objName == 'FT_eventObj')
            {
		        if (thisObj.f_isServerError(evt, g_lang.m_error)) {
					return;
				}				
                var pp = evt.m_value;
                if(pp == undefined)  
				    return;
				if (pp.m_type == 'mchange') {
					thisObj.m_form.conf_password_chg_at_login.checked = true;
					thisObj.m_form.conf_password_default.checked = false;
				} else {
					thisObj.m_form.conf_password_chg_at_login.checked = false;
					thisObj.m_form.conf_password_default.checked = true;					
				}
            }
        }
        thisObj.m_busLayer.f_getOAConfig(cb, 'password-policy');					
    }	
	
    this.f_stopLoadVMData = function()
    {
    }
    
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_password_apply_button') { //apply clicked
                thisObj.f_apply();
            } else if (id == 'conf_password_cancel_button') { //cancel clicked
                thisObj.f_reset();               
            }
        }
    }
	
	this.f_apply = function() 
	{
		var type = 'mchange';
		
		if (thisObj.m_form.conf_password_chg_at_login.checked == true) {
			type = 'mchange';
		} else {
			type = 'default';
		}
		
        var pp = new FT_passwordPolicy(type);		
        var cb = function(evt) {
		    if (thisObj.f_isServerError(evt, g_lang.m_error)) {
		        return;		    
		    } else {
                g_utils.f_popupMessage(g_lang.m_menuPasswordPolicy +  ' ' + g_lang.m_formSave,   'ok', g_lang.m_menuPasswordPolicy,true);
		    }			
		}	
		thisObj.m_busLayer.f_setOAConfig(cb, pp);
		return false;			
	}
	
	this.f_reset = function() 
	{
        thisObj.f_loadVMData();
		return false; 		
	}
	
	this.f_handleKeydown = function(e)
    {
        if(e.keyCode != 13)	{
			return;
		}	
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_password_cancel_button') { //cancel clicked
                thisObj.f_reset();
				return false;			
            }
        }
    }
}

FT_extend(FT_confPassword, FT_confFormObj);
