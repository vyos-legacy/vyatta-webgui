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
		    
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        UTM_confVpnRemoteUsrAdd.superclass.constructor(name, callback, busLayer);
    }
    
    this.constructor(name, callback, busLayer);
    	
    this.f_init = function()
    {
		var defObj = new UTM_confFormDefObj('conf_vpn_rusr', '400', new Array(), 
		    [{
                id: 'conf_vpn_rusr_update_button',
                text: 'Update',
				align: 'left',
                onclick: this.f_handleClick
            }, {
                id: 'conf_vpn_rusr_cancel_button',
				align: 'right',
                text: 'Cancel',
                onclick: this.f_handleClick
            }, {
                id: 'conf_vpn_rusr_apply_button',
				align: 'right',
                text: 'Apply',
                onclick: this.f_handleClick
            }]		
		);
		defObj.f_addLabelBold('conf_vpn_rusr_header_label', g_lang.m_vpnRUadd_RemoteUserSettings,'true');
        defObj.f_addDivider('conf_vpn_rusr_divider1','2');
		defObj.f_addEmptySpace('conf_vpn_rusr_spacer1','2');
		defObj.f_addInput('conf_vpn_rusr_usr_name', '32', g_lang.m_vpnRUadd_UserName);
		defObj.f_addPassword('conf_vpn_rusr_usr_passwd', '32', g_lang.m_vpnRUadd_UserPasswd);		
		defObj.f_addPassword('conf_vpn_rusr_confirm_usr_passwd', '32', g_lang.m_vpn_Confirm + ' ' + g_lang.m_vpnRUadd_UserPasswd);		
		defObj.f_addHtml(
		   'conf_vpn_rusr_vpn_grp',
		   '<select name="vpn_grp" class="v_form_input"><option value="Manager" selected>Manager</option>',
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
    }
	
	
	
	this.f_setFocus = function()
	{
		thisObj.m_form.conf_vpn_rusr_usr_name.focus();
	}		
    
    this.f_stopLoadVMData = function()
    {
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
            } 
        }
    }
    
}

UTM_extend(UTM_confVpnRemoteUsrAdd, UTM_confFormObj);

