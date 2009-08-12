/*
 Document   : utm_confVpnRemoteUsrAdd.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function UTM_confVpnRemoteUsrAdd(name, callback, busLayer)
{
    var thisObjName = 'UTM_confVpnRemoteUsrAdd';
    var thisObj = this;
    this.m_form = undefined;
	this.m_change = false;
	this.m_usr= undefined;
	this.m_eventCbFunction = 'f_confFormObjEventCallback';

	this.m_clickItems = [
	];
	
	this.m_keyItems = [
	    'conf_vpn_rusr_usr_name',
		'conf_vpn_rusr_usr_passwd',
        'conf_vpn_rusr_confirm_usr_passwd'	
	];		
	
	this.m_changeItems = [
        'conf_vpn_rusr_vpn_grp'
	];

		    
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        this.privateConstructor(name, callback, busLayer);
    }

    this.privateConstructor = function(name, callback, busLayer)
    {
        UTM_confVpnRemoteUsrAdd.superclass.constructor(name, callback, busLayer);
    }			
    this.privateConstructor(name, callback, busLayer);	    
    	
    this.f_init = function(obj)
    {
		if (obj != undefined) {
			thisObj.m_usr = obj;
		} else {
			thisObj.m_usr = UTM_vpnRemoteRec();
			thisObj.m_usr.f_setDefault();
		}		
		var defObj = new UTM_confFormDefObj('conf_vpn_rusr', '400', new Array(), 
		    [{
                id: 'conf_vpn_rusr_back_button',
                text: 'Back',
				align: 'left',
				tooltip: g_lang.m_tooltip_back,
                onclick: this.f_handleClick
            }, {
                id: 'conf_vpn_rusr_cancel_button',
				align: 'right',
                text: 'Cancel',
				tooltip: g_lang.m_tooltip_cancel,
                onclick: this.f_handleClick
            }, {
                id: 'conf_vpn_rusr_apply_button',
				align: 'right',
                text: 'Apply',
				tooltip: g_lang.m_tooltip_apply,
                onclick: this.f_handleClick
            }]		
		);
		defObj.padding = '0px 0px 0px 30px';		
		defObj.f_addLabelBold('conf_vpn_rusr_header_label', g_lang.m_vpnRUadd_RemoteUserSettings,'true');
        defObj.f_addDivider('conf_vpn_rusr_divider1','2');
		defObj.f_addEmptySpace('conf_vpn_rusr_spacer1','2');
		defObj.f_addInput('conf_vpn_rusr_usr_name', '32', g_lang.m_vpnRUadd_UserName);
		defObj.f_addPassword('conf_vpn_rusr_usr_passwd', '32', g_lang.m_vpnRUadd_UserPasswd);		
		defObj.f_addPassword('conf_vpn_rusr_confirm_usr_passwd', '32', g_lang.m_vpn_Confirm + ' ' + g_lang.m_vpnRUadd_UserPasswd);		
		defObj.f_addHtml(
		   'conf_vpn_rusr_vpn_grp',
		   '<select name="conf_vpn_rusr_vpn_grp" id="conf_vpn_rusr_vpn_grp" class="v_form_input"><option value="manager" selected>manager</option>',
		   g_lang.m_vpnRUadd_VPNGroup
		);
					

        this.f_setConfig(defObj);
    }
    
    this.f_getConfigurationPage = function()
	{
		var children = new Array();
		children.push(this.f_createHeader());
		children.push(this.f_getForm());
		
	    return this.f_getPage(children);
	}	
	
	this.f_createHeader = function()
	{
        var txt = 'This page enables you to configure VPN users.<br><br>';

        return this.f_createGeneralDiv(txt);
    }		

    this.f_loadVMData = function(element)
    {
        thisObj.m_form = document.getElementById('conf_vpn_rusr' + "_form");
		thisObj.f_setFocus();
		thisObj.f_resize();
		thisObj.f_attachListener();			
		thisObj.f_enableAllButton(false);
    }
	
	
	
	this.f_setFocus = function()
	{
		thisObj.m_form.conf_vpn_rusr_usr_name.focus();
	}		
    
    this.f_stopLoadVMData = function()
    {
		thisObj.f_detachListener();
    }
        		
    this.f_validate = function()
    {
        var error = g_lang.m_formFixError + '<br>';
        var errorInner = '';
        if (errorInner.trim().length > 0) {
            error = error + '<ul style="padding-left:30px;">';
            error = error + errorInner + '</ul>';
            g_utils.f_popupMessage(error, 'error', g_lang.m_error, true);
			return false;
        }
        return true;
    }
    
    this.f_apply = function()
    {
    }
    
    this.f_reset = function()
    {
    
    }
    
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_vpn_rusr_apply_button') { //apply clicked
                if (!thisObj.f_validate()) {
					return false;
				} 
			    thisObj.f_apply();
            } else if (id == 'conf_vpn_rusr_cancel_button') { //cancel clicked
                thisObj.f_reset();
            } else if (id == 'conf_vpn_rusr_back_button') {
				thisObj.f_back();
			}
        }
    }

	this.f_eventCallback = function(id)
	{
		g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_OVERVIEW_ID, null, true);				
	}
    
	this.f_changed = function()
	{
		return thisObj.m_change;		
	}
	
	this.f_back = function()
	{
		if (thisObj.f_changed()) {
			g_utils.f_popupMessage(g_lang.m_remindSaveChange, 'confirm', g_lang.m_info, true, 
			    thisObj.m_eventCbFunction + "('apply')"); 
		} else {
			g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_OVERVIEW_ID, null, true);			
		}
	}

    this.f_handleKey = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            thisObj.f_enableAllButton(true);
        }
    }	
   
    this.f_handleChange = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            thisObj.f_enableAllButton(true);
        }
    }   
   
    this.f_enableAllButton = function(state)
    {
        thisObj.f_enableButton('apply', state);
        thisObj.f_enableButton('cancel', state);
    }
    
    this.f_enableButton = function(btName, state)
    {
        var id = '';
        switch (btName.toLowerCase()) {
            case 'apply':
                id = 'conf_vpn_rusr_apply_button';
                break;
            case 'cancel':
                id = 'conf_vpn_rusr_cancel_button';
                break;
            default:
                break;
        }
        thisObj.f_enabledDisableButton(id, state);
		if (state) {
			thisObj.m_change = true;
		} else {
			thisObj.m_change = false;
		}
    }   

    this.f_attachListener = function()
    {        
        for (var i = 0; i < thisObj.m_clickItems.length; i++) {
            var el = document.getElementById(thisObj.m_clickItems[i]);
            g_xbObj.f_xbAttachEventListener(el, 'click', thisObj.f_handleClick, false);
        }
        for (var i = 0; i < thisObj.m_keyItems.length; i++) {
            var el = document.getElementById(thisObj.m_keyItems[i]);
            g_xbObj.f_xbAttachEventListener(el, 'keydown', thisObj.f_handleKey, false);
        }
		for (var i = 0; i < thisObj.m_changeItems.length; i++) {
			var el = document.getElementById(thisObj.m_changeItems[i]);
			g_xbObj.f_xbAttachEventListener(el, 'change', thisObj.f_handleChange, false);
		}		
    }
    
    this.f_detachListener = function()
    {		
        for (var i = 0; i < thisObj.m_clickItems.length; i++) {
            var el = document.getElementById(thisObj.m_clickItems[i]);
            g_xbObj.f_xbDetachEventListener(el, 'click', thisObj.f_handleClick, false);
        }
        for (var i = 0; i < thisObj.m_keyItems.length; i++) {
            var el = document.getElementById(thisObj.m_keyItems[i]);
            g_xbObj.f_xbDetachEventListener(el, 'keydown', thisObj.f_handleKey, false);
        }
		for (var i = 0; i < thisObj.m_changeItems.length; i++) {
			var el = document.getElementById(thisObj.m_changeItems[i]);
			g_xbObj.f_xbDetachEventListener(el, 'change', thisObj.f_handleChange, false);
		}		
    }	
    
}

UTM_extend(UTM_confVpnRemoteUsrAdd, UTM_confFormObj);

