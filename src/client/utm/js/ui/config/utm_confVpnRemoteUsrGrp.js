/*
 Document   : utm_confVpnRemoteUsrGrp.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function UTM_confVpnRemoteUsrGrp(name, callback, busLayer)
{
    var thisObjName = 'UTM_confVpnRemoteUsrGrp';
    var thisObj = this;
    this.m_form = undefined;
	
	this.m_ezItems = [
	    'conf_vpn_rug_preshared_key_label',
		'conf_vpn_rug_confirm_preshared_key_label'
	];
							  
	this.m_expItems = [
	    'conf_vpn_rug_divider4',
	    'conf_vpn_rug_basic_spacer7',
		'conf_vpn_rug_ike_phase1_label',
		'conf_vpn_rug_ike_p1_proto_label',
		'conf_vpn_rug_ike_p1_ex_mode_label',		
	    'conf_vpn_rug_ike_p1_encrypt_label',
		'conf_vpn_rug_ike_p1_preshare_label',
		'conf_vpn_rug_ike_p1_confirm_preshare_label',
		'conf_vpn_rug_ike_p1_auth_label',
		'conf_vpn_rug_ike_p1_diffle_label',
		'conf_vpn_rug_ike_p1_lifetime_label',		
		'conf_vpn_rug_spacer8',
		'conf_vpn_rug_divider5',
		'conf_vpn_rug_spacer9',			
		'conf_vpn_rug_ike_p2_label',
		'conf_vpn_rug_ike_p2_local_network_label',
		'conf_vpn_rug_ike_p2_remote_network_label',
		'conf_vpn_rug_ike_p2_dfs_label',
		'conf_vpn_rug_ike_p2_lifetime_label',
		'conf_vpn_rug_ike_p2_encrypt_label',
		'conf_vpn_rug_ike_p2_auth_label'
	]
		    
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        UTM_confVpnRemoteUsrGrp.superclass.constructor(name, callback, busLayer);
    }
    
    this.constructor(name, callback, busLayer);
    	
    this.f_init = function()
    {
		var defObj = new UTM_confFormDefObj('conf_vpn_rug', '500', new Array(), 
		    [{
                id: 'conf_vpn_rug_update_button',
                text: 'Update',
				align: 'left',
                onclick: this.f_handleClick
            }, {
                id: 'conf_vpn_rug_cancel_button',
				align: 'right',
                text: 'Cancel',
                onclick: this.f_handleClick
            }, {
                id: 'conf_vpn_rug_apply_button',
				align: 'right',
                text: 'Apply',
                onclick: this.f_handleClick
            }]		
		);
		defObj.f_addLabelBold('conf_vpn_rug_header_label', g_lang.m_vpnRUG_GroupSettings,'true');
        defObj.f_addDivider('conf_vpn_rug_divider1','2');
		defObj.f_addEmptySpace('conf_vpn_rug_spacer1','2');
		defObj.f_addLabelBold('conf_vpn_rug_basic_label',g_lang.m_vpn_BasicSettings,'true');
		defObj.f_addInput('conf_vpn_rug_prof_name', '32', g_lang.m_vpnRUG_ProfileName);
		defObj.f_addHtml(
		   'conf_vpn_rug_vpn_software',
		   '<select name="vpn_software" class="v_form_input"><option value="Safenet" selected>Safenet</option>' +
		   '<option value="Cisco">Cisco</option>' + 
		   '<option value="Microsoft">Microsoft</option></select>',
		   g_lang.m_vpnRUG_VPNsoft
		);
		defObj.f_addInput('conf_vpn_rug_usr', '32', g_lang.m_vpn_Users);		
		
		defObj.f_addEmptySpace('conf_vpn_rug_spacer2','2');
        defObj.f_addDivider('conf_vpn_rug_divider2','2');	
		defObj.f_addEmptySpace('conf_vpn_rug_spacer3','2');
					
		defObj.f_addLabelBold('conf_vpn_rug_usr_setting_label',g_lang.m_vpnRUG_UsrSettings,'true');
		defObj.f_addHtml(
		   'conf_vpn_rug_auth',
		   '<select name="usr_auth" class="v_form_input"><option value="Xauth" selected>Xauth</option>',
		   g_lang.m_vpn_auth
		);		
		defObj.f_addHtml(
		   'conf_vpn_rug_ip_alloc',
		   '<select name="usr_ip_alloc" class="v_form_input"><option value="Internet DHCP" selected>Internet DHCP</option>',
		   g_lang.m_vpnRUG_IPAlloc
		);			
		defObj.f_addHtml(
		   'conf_vpn_rug_ip_access',
		   '<select name="usr_ip_access" class="v_form_input"><option value="Directly" selected>Directly</option>',
		   g_lang.m_vpnRUG_InternetAccess
		);			
		
		defObj.f_addEmptySpace('conf_vpn_rug_spacer4','2');
        defObj.f_addDivider('conf_vpn_rug_divider3','2');	
		defObj.f_addEmptySpace('conf_vpn_rug_spacer5','2');		
		
		defObj.f_addLabelBold('conf_vpn_rug_tunnel_setting_label',g_lang.m_vpn_TunnelSettings,'true');		
		defObj.f_addHtml(
		   'conf_vpn_rug_tunnel_config_mode',
           '<input id="conf_vpn_rug_tunnel_config_mode_ez" type="radio" name="conf_vpn_rug_tunnel_mode_group" value="ez" checked>&nbsp;' + 
				      g_lang.m_vpn_EZ + '&nbsp;&nbsp;' +
					  '<input id="conf_vpn_rug_tunnel_config_mode_exp" type="radio" name="conf_vpn_rug_tunnel_mode_group" value="exp">&nbsp;' +
					  g_lang.m_vpn_Expert,	
		   g_lang.m_vpn_TunnelConfigMode	   
		);
		defObj.f_addEmptySpace('conf_vpn_rug_spacer6','2');
		
        ////----------------------Easy mode----------------------							
		defObj.f_addPassword('conf_vpn_rug_preshared_key','25',g_lang.m_vpn_PresharedKey);
		defObj.f_addPassword('conf_vpn_rug_confirm_preshared_key','25',g_lang.m_vpn_Confirm + ' ' + g_lang.m_vpn_PresharedKey);

		////----------------------Expert mode------------------ 
        defObj.f_addDivider('conf_vpn_rug_divider4','2');	
		defObj.f_addEmptySpace('conf_vpn_rug_basic_spacer7','2');
		defObj.f_addLabelBold('conf_vpn_rug_ike_phase1_label',g_lang.m_vpn_IKEnegPhase1,'true');
		defObj.f_addHtml(
		    'conf_vpn_rug_ike_p1_proto',
            '<select name="ike_p1_proto" class="v_form_input"><option value="ESP/Tunnel" selected>EXP/Tunnel</option></select>',
			g_lang.m_vpn_IKE_p1_proto			
		);		
		defObj.f_addHtml(
		    'conf_vpn_rug_ike_p1_ex_mode',
            '<select name="ike_p1_ex_mode" class="v_form_input"><option value="Aggressive" selected>Aggressive</option></select>',
			g_lang.m_vpn_IKE_p1_ex_mode		
		);			
		defObj.f_addHtml(
		    'conf_vpn_rug_ike_p1_encrypt',
            '<select name="ike_p1_encrypt" class="v_form_input"><option value="AES128" selected>AES128</option></select>',
			g_lang.m_vpn_Encrypt		
		);	
		defObj.f_addPassword('conf_vpn_rug_ike_p1_preshare','25',g_lang.m_vpn_PresharedKey);
		defObj.f_addPassword('conf_vpn_rug_ike_p1_confirm_preshare','25',g_lang.m_vpn_Confirm + ' ' + g_lang.m_vpn_PresharedKey);
		defObj.f_addHtml(
		    'conf_vpn_rug_ike_p1_auth',
            '<select name="ike_p1_auth" class="v_form_input"><option value="SHA1" selected>SHA1</option></select>',
			g_lang.m_vpn_auth		
		);			
		defObj.f_addHtml(
		    'conf_vpn_rug_ike_p1_diffle',
            '<select name="ike_p1_diffle" class="v_form_input"><option value="Group 5" selected>Group 5</option></select>',
			g_lang.m_vpn_Diffle		
		);			
		defObj.f_addPassword('conf_vpn_rug_ike_p1_lifetime','25',g_lang.m_vpn_LifeTime);
		
		defObj.f_addEmptySpace('conf_vpn_rug_spacer8','2');
        defObj.f_addDivider('conf_vpn_rug_divider5','2');
		defObj.f_addEmptySpace('conf_vpn_rug_spacer9','2');
		
		defObj.f_addLabelBold('conf_vpn_rug_ike_p2_label',g_lang.m_vpn_IKEphase2,'true');
		defObj.f_addHtml(
		    'conf_vpn_rug_ike_p2_local_network',
            '<input type="text" id="conf_vpn_rug_ike_p2_local_network_ip" size="16" class="v_form_input">&nbsp;/&nbsp;' +
				      '<input type="text" id="conf_vpn_rug_ike_p2_local_network_mask" size="2" class="v_form_input">',
			g_lang.m_vpn_LocalNetwork	
		);						
		defObj.f_addHtml(
		    'conf_vpn_rug_ike_p2_remote_network',
            '<input type="text" id="conf_vpn_rug_ike_p2_remote_network_ip" size="16" class="v_form_input">&nbsp;/&nbsp;' +
				      '<input type="text" id="conf_vpn_rug_ike_p2_remote_network_mask" size="2" class="v_form_input">',
			g_lang.m_vpn_RemoteNetwork	
		);						
		defObj.f_addHtml(
		    'conf_vpn_rug_ike_p2_dfs',
            '<select name="ike_p2_dfs" class="v_form_input"><option value="Group 5" selected>Group 5</option></select>',
			g_lang.m_vpn_DFS	
		);							
		defObj.f_addPassword('conf_vpn_rug_ike_p2_lifetime','25',g_lang.m_vpn_LifeTime);
		defObj.f_addHtml(
		    'conf_vpn_rug_ike_p2_encrypt',
            '<select name="ike_p2_encrypt" class="v_form_input"><option value="AES128" selected>AES128</option></select>',
			g_lang.m_vpn_Encrypt
		);						
		defObj.f_addHtml(
		    'conf_vpn_rug_ike_p2_auth',
            '<select name="ike_p2_auth" class="v_form_input"><option value="SHA1" selected>SHA1</option></select>',
			g_lang.m_vpn_auth
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
        var txt = 'This page enables you to configure some connection groups for remote users.  Several users belong to the same group<br><br>';

        return this.f_createGeneralDiv(txt);
    }		

    this.f_loadVMData = function(element)
    {
        thisObj.m_form = document.getElementById('conf_vpn_rug' + "_form");
		thisObj.f_setFocus();
		this.f_showExpert(false);
		this.f_attachListener();			
    }
	
	this.f_showExpert = function(b)
	{
        if (b) {
            for (var i=0; i < thisObj.m_expItems.length; i++) {
				thisObj.f_hideTableRow(thisObj.m_expItems[i], false);
			}
            for (var i=0; i < thisObj.m_ezItems.length; i++) {
				thisObj.f_hideTableRow(thisObj.m_ezItems[i], true);
			}			
		} else {
            for (var i=0; i < thisObj.m_expItems.length; i++) {
				thisObj.f_hideTableRow(thisObj.m_expItems[i], true);
			}
            for (var i=0; i < thisObj.m_ezItems.length; i++) {
				thisObj.f_hideTableRow(thisObj.m_ezItems[i], false);
			}		
		}
		g_utmMainPanel.f_requestResize();
	}
    
    this.f_attachListener = function()
    {
        var el = document.getElementById('conf_vpn_rug_tunnel_config_mode_ez');
        g_xbObj.f_xbAttachEventListener(el, 'click', thisObj.f_handleClick, false);
		el = document.getElementById('conf_vpn_rug_tunnel_config_mode_exp');
        g_xbObj.f_xbAttachEventListener(el, 'click', thisObj.f_handleClick, false);	
    }
    
    this.f_detachListener = function()
    {
        var el = document.getElementById('conf_vpn_rug_tunnel_config_mode_ez');
        g_xbObj.f_xbDetachEventListener(el, 'click', thisObj.f_handleClick, false);
		el = document.getElementById('conf_vpn_rug_tunnel_config_mode_exp');
        g_xbObj.f_xbDetachEventListener(el, 'click', thisObj.f_handleClick, false);	
    }		
	
	
	this.f_setFocus = function()
	{
		thisObj.m_form.conf_vpn_rug_prof_name.focus();
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
            if (id == 'conf_vpn_rug_apply_button') { //apply clicked
                if (!thisObj.f_validate()) {
					return false;
				} 
			    thisObj.f_apply();
            } else if (id == 'conf_vpn_rug_cancel_button') { //cancel clicked
                thisObj.f_reset();
            } else if (id == 'conf_vpn_rug_tunnel_config_mode_ez') {
				thisObj.f_showExpert(false);
			} else if (id == 'conf_vpn_rug_tunnel_config_mode_exp') {
				thisObj.f_showExpert(true);
			}
        }
    }
    
}

UTM_extend(UTM_confVpnRemoteUsrGrp, UTM_confFormObj);

