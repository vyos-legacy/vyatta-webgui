/*
 Document   : ft_confBLBcheck.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function FT_confBLBcheck(name, callback, busLayer)
{
    var thisObjName = 'ft_confBLBcheck';
    this.m_form = undefined;
    
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
    
    
    this.f_init = function()
    {
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
                onclick: this.f_handleClick
            }, {
                id: 'conf_blb_check_cancel_button',
                text: 'Cancel',
                onclick: this.f_handleClick,
				onkeydown: this.f_handleKeydown
            }]
        })
    }
    
    this.f_loadVMData = function(element)
    {
        this.m_form = document.getElementById('conf_blb_check_form');
    }
    
    this.f_stopLoadVMData = function()
    {
    }
    
    this.f_reset = function()
    {
        this.m_form.conf_blb_check_login.value = '';
        this.m_form.conf_blb_check_password.value = '';
    }
    
    this.f_apply = function()
    {
        var message = g_lang.m_blbComplete;
        var type = 'ok';
        var title = g_lang.m_blbAssociation;
        g_utils.f_popupMessage(message, type, title, true, 'f_confBLBcheckApply()');
    }
    
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_blb_check_apply_button') { //apply clicked
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
            }
        }
    }	
    
}
FT_extend(FT_confBLBcheck, FT_confFormObj);

function f_confBLBcheckApply()
{
    g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_BLB_ID);	
}
