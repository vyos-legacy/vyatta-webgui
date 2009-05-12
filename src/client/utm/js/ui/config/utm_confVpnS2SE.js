/*
 Document   : utm_confVpnS2SE.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function UTM_confVpnS2SE(name, callback, busLayer)
{
    var thisObjName = 'UTM_confVpnS2SE';
    var thisObj = this;
    this.m_form = undefined;
	this.m_vpn = undefined;
	
	this.m_ezItems = [
	    'conf_vpn_s2se_preshared_key_label',
		'conf_vpn_s2se_confirm_preshared_key_label',
		'conf_vpn_s2se_local_network_label',
		'conf_vpn_s2se_remote_network_label'
	];
						  
	this.m_expItems = [
	    'conf_vpn_s2sexp_ike_phase1_label',
	    'conf_vpn_s2sexp_ike_p1_proto_label',
		'conf_vpn_s2sexp_ike_p1_ex_mode_label',
	    'conf_vpn_s2sexp_ike_p1_encrypt_label',
		'conf_vpn_s2sexp_ike_p1_preshare_label',
		'conf_vpn_s2sexp_ike_p1_confirm_preshare_label',
		'conf_vpn_s2sexp_ike_p1_auth_label',
		'conf_vpn_s2sexp_ike_p1_diffle_label',
		'conf_vpn_s2sexp_ike_p1_lifetime_label',
		'conf_vpn_s2se_basic_spacer3',
		'conf_vpn_s2se_divider2',
		'conf_vpn_s2se_basic_spacer4',
		'conf_vpn_s2se_divider3',		
		'conf_vpn_s2se_basic_spacer5',		
		'conf_vpn_s2se_ike_p2_label',
		'conf_vpn_s2se_ike_p2_local_network_label',
		'conf_vpn_s2se_ike_p2_remote_network_label',
		'conf_vpn_s2sexp_ike_p2_dfs_label',
		'conf_vpn_s2sexp_ike_p2_lifetime_label',
		'conf_vpn_s2sexp_ike_p2_encrypt_label',
		'conf_vpn_s2sexp_ike_p2_auth_label'
	]
		    
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
        UTM_confVpnS2SE.superclass.constructor(name, callback, busLayer);
    }			
    this.privateConstructor(name, callback, busLayer);			
		
    this.f_init = function()
    {
		var o = new UTM_vpnRecord();
        o.m_tunnel = 'Nice';
        o.m_peerIp = '11.0.0.127';
        o.m_remoteVpnDevice = 'Cisco';
        o.m_presharedKey = 'preshare';
        o.m_localNetwork = '192.168.1.0/24';
        o.m_remoteNetwork = '192.168.3.0/24';	
		o.m_mode = 'easy';	
		thisObj.m_vpn = o;		
		
		var defObj = new UTM_confFormDefObj('conf_vpn_s2se', '500', new Array(), 
		    [{
                id: 'conf_vpn_s2se_update_button',
                text: 'Update',
				align: 'left',
                onclick: this.f_handleClick
            }, {
                id: 'conf_vpn_s2se_cancel_button',
				align: 'right',
                text: 'Cancel',
                onclick: this.f_handleClick
            }, {
                id: 'conf_vpn_s2se_apply_button',
				align: 'right',
                text: 'Apply',
                onclick: this.f_handleClick
            }]		
		);
		defObj.f_addLabelBold('conf_vpn_s2se_header_label',g_lang.m_vpnS2S_VpnConSettings,'true');
        defObj.f_addDivider('conf_vpn_s2se_divider','2');
		defObj.f_addEmptySpace('conf_vpn_s2se_basic_spacer','2');
		defObj.f_addLabelBold('conf_vpn_s2se_basic_label',g_lang.m_vpn_BasicSettings,'true');
		defObj.f_addInput('conf_vpn_s2se_tunnel_name', '32', g_lang.m_vpnS2S_TunnelName);
		defObj.f_addInput('conf_vpn_s2se_peer_ip', '32', g_lang.m_vpnS2S_DomainName);		
		defObj.f_addHtml(
		   'conf_vpn_s2se_remote_device',
		   '<select name="rm_device" id="rm_device" class="v_form_input"><option value="Cisco" selected>Cisco</option><option value="Vyatta">Vyatta</option></select>',
		   g_lang.m_vpnS2S_RemoteVPNdevice
		);
		defObj.f_addEmptySpace('conf_vpn_s2se_tunnel_spacer','2');
		defObj.f_addLabelBold('conf_vpn_s2se_tunnel_setting_label',g_lang.m_vpn_TunnelSettings,'true');
		defObj.f_addHtml(
		   'conf_vpn_s2se_tunnel_config_mode',
           '<input id="conf_vpn_s2se_tunnel_config_mode_ez" type="radio" name="conf_vpn_s2se_tunnel_mode_group" value="ez" checked>&nbsp;' + 
				      g_lang.m_vpn_EZ + '&nbsp;&nbsp;' +
					  '<input id="conf_vpn_s2se_tunnel_config_mode_exp" type="radio" name="conf_vpn_s2se_tunnel_mode_group" value="exp">&nbsp;' +
					  g_lang.m_vpn_Expert,	
		   g_lang.m_vpn_TunnelConfigMode	   
		);
		defObj.f_addEmptySpace('conf_vpn_s2se_tunnel_spacer2','2');
        ////----------------------Easy mode----------------------							
		defObj.f_addPassword('conf_vpn_s2se_preshared_key','25',g_lang.m_vpn_PresharedKey);
		defObj.f_addPassword('conf_vpn_s2se_confirm_preshared_key','25',g_lang.m_vpn_Confirm + ' ' + g_lang.m_vpn_PresharedKey);
		defObj.f_addHtml(
		    'conf_vpn_s2se_local_network',
            '<input type="text" id="conf_vpn_s2se_local_network_ip" size="16" class="v_form_input">&nbsp;/&nbsp;' +
				      '<input type="text" id="conf_vpn_s2se_local_network_mask" size="2" class="v_form_input">',
			g_lang.m_vpn_LocalNetwork			
		);
		defObj.f_addHtml(
		    'conf_vpn_s2se_remote_network',
            '<input type="text" id="conf_vpn_s2se_remote_network_ip" size="16" class="v_form_input">&nbsp;/&nbsp;' +
				      '<input type="text" id="conf_vpn_s2se_remote_network_mask" size="2" class="v_form_input">',
			g_lang.m_vpn_RemoteNetwork			
		);
		////----------------------Expert mode------------------ 
        defObj.f_addDivider('conf_vpn_s2se_divider2','2');	
		defObj.f_addEmptySpace('conf_vpn_s2se_basic_spacer3','2');
		defObj.f_addLabelBold('conf_vpn_s2sexp_ike_phase1_label',g_lang.m_vpn_IKEnegPhase1,'true');
		defObj.f_addHtml(
		    'conf_vpn_s2sexp_ike_p1_proto',
            '<select name="ike_p1_proto" id="ike_p1_proto" class="v_form_input"><option value="ESP/Tunnel" selected>EXP/Tunnel</option></select>',
			g_lang.m_vpn_IKE_p1_proto			
		);		
		defObj.f_addHtml(
		    'conf_vpn_s2sexp_ike_p1_ex_mode',
            '<select name="ike_p1_ex_mode" id="ike_p1_ex_mode" class="v_form_input"><option value="Aggressive" selected>Aggressive</option></select>',
			g_lang.m_vpn_IKE_p1_ex_mode		
		);			
		defObj.f_addHtml(
		    'conf_vpn_s2sexp_ike_p1_encrypt',
            '<select name="ike_p1_encrypt" id="ike_p1_encrypt" class="v_form_input"><option value="AES128" selected>AES128</option></select>',
			g_lang.m_vpn_Encrypt		
		);	
		defObj.f_addPassword('conf_vpn_s2sexp_ike_p1_preshare','25',g_lang.m_vpn_PresharedKey);
		defObj.f_addPassword('conf_vpn_s2sexp_ike_p1_confirm_preshare','25',g_lang.m_vpn_Confirm + ' ' + g_lang.m_vpn_PresharedKey);
		defObj.f_addHtml(
		    'conf_vpn_s2sexp_ike_p1_auth',
            '<select name="ike_p1_auth" id="ike_p1_auth" class="v_form_input"><option value="SHA1" selected>SHA1</option></select>',
			g_lang.m_vpn_auth		
		);			
		defObj.f_addHtml(
		    'conf_vpn_s2sexp_ike_p1_diffle',
            '<select name="ike_p1_diffle" id="ike_p1_diffle" class="v_form_input"><option value="Group 5" selected>Group 5</option></select>',
			g_lang.m_vpn_Diffle		
		);			
		defObj.f_addPassword('conf_vpn_s2sexp_ike_p1_lifetime','25',g_lang.m_vpn_LifeTime);
		defObj.f_addEmptySpace('conf_vpn_s2se_basic_spacer4','2');
        defObj.f_addDivider('conf_vpn_s2se_divider3','2');
		defObj.f_addEmptySpace('conf_vpn_s2se_basic_spacer5','2');
		defObj.f_addLabelBold('conf_vpn_s2se_ike_p2_label',g_lang.m_vpn_IKEphase2,'true');
		defObj.f_addHtml(
		    'conf_vpn_s2se_ike_p2_local_network',
            '<input type="text" id="conf_vpn_s2se_ike_p2_local_network_ip" size="16" class="v_form_input">&nbsp;/&nbsp;' +
				      '<input type="text" id="conf_vpn_s2se_ike_p2_local_network_mask" size="2" class="v_form_input">',
			g_lang.m_vpn_LocalNetwork	
		);						
		defObj.f_addHtml(
		    'conf_vpn_s2se_ike_p2_remote_network',
            '<input type="text" id="conf_vpn_s2se_ike_p2_remote_network_ip" size="16" class="v_form_input">&nbsp;/&nbsp;' +
				      '<input type="text" id="conf_vpn_s2se_ike_p2_remote_network_mask" size="2" class="v_form_input">',
			g_lang.m_vpn_RemoteNetwork	
		);						
		defObj.f_addHtml(
		    'conf_vpn_s2sexp_ike_p2_dfs',
            '<select name="ike_p2_dfs" id="ike_p2_dfs" class="v_form_input"><option value="Group 5" selected>Group 5</option></select>',
			g_lang.m_vpn_DFS	
		);							
		defObj.f_addPassword('conf_vpn_s2sexp_ike_p2_lifetime','25',g_lang.m_vpn_LifeTime);
		defObj.f_addHtml(
		    'conf_vpn_s2sexp_ike_p2_encrypt',
            '<select name="ike_p2_encrypt" id="ike_p2_encrypt" class="v_form_input"><option value="AES128" selected>AES128</option></select>',
			g_lang.m_vpn_Encrypt
		);						
		defObj.f_addHtml(
		    'conf_vpn_s2sexp_ike_p2_auth',
            '<select name="ike_p2_auth" id="ike_p2_auth" class="v_form_input"><option value="SHA1" selected>SHA1</option></select>',
			g_lang.m_vpn_auth
		);						

        this.f_setConfig(defObj);
    }
    
    this.f_getConfigurationPage = function()
	{
		var children = new Array();
		children.push(this.f_createHeader());
		children.push(this.f_getForm());
		
		///////-------- Test link.  Will be removed later
		children.push(this.f_createTestLink());
		///////-------------------------------------------
		
	    return this.f_getPage(children);
	}	
	
	this.f_createHeader = function()
	{
        var txt = 'Lorem ipsum onsectetuer adipiscing elit, sed diam ' +
            'nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam ' +
            'erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci ' +
            'tation ullamcorper suscipit lobortis nisl ut aliquip ex ea ' +
            'commodo consequat.<br>';

        return this.f_createGeneralDiv(txt);
    }	
	
	this.f_createTestLink = function()
	{		
		var txt = '<a href="#" onclick="f_loadVpnLink(\'usrGrp\')">Remote User Group</a><br/>' +
		          '<a href="#" onclick="f_loadVpnLink(\'usr\')">Remote User</a><br/>';
				  
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.overflow = 'visible';
		
		div.innerHTML = txt;
				  
		return div;
	}	
		
	this.f_loadVMDataEZ = function()
	{		
		thisObj.m_form.conf_vpn_s2se_preshared_key.value = thisObj.m_vpn.m_presharedKey;
		thisObj.m_form.conf_vpn_s2se_confirm_preshared_key.value = thisObj.m_vpn.m_presharedKey;
		thisObj.m_form.conf_vpn_s2se_local_network_ip.value = thisObj.m_vpn.f_getLocalNetworkIp();
		thisObj.m_form.conf_vpn_s2se_local_network_mask.value = thisObj.m_vpn.f_getLocalNetworkPrefix();
        thisObj.m_form.conf_vpn_s2se_remote_network_ip.value = thisObj.m_vpn.f_getRemoteNetworkIp();
		thisObj.m_form.conf_vpn_s2se_remote_network_mask.value = thisObj.m_vpn.f_getRemoteNetworkPrefix();			
	}	
	
	this.f_loadVMDataExpert = function()
	{
		
	}
		
    this.f_loadVMData = function(element)
    {
		thisObj.m_form = document.getElementById('conf_vpn_s2se_form');
		thisObj.m_form.conf_vpn_s2se_tunnel_name.value = thisObj.m_vpn.m_tunnel;
		thisObj.m_form.conf_vpn_s2se_peer_ip.value = thisObj.m_vpn.m_peerIp;
		//select from drop down combo box.
		this.f_setComboBoxSelectionByName(thisObj.m_form.rm_device, thisObj.m_vpn.m_remoteVpnDevice);
		//select from which mode.
		if (thisObj.m_vpn.m_mode == 'easy') {
            thisObj.m_form.conf_vpn_s2se_tunnel_config_mode_ez.checked = true;
			thisObj.m_form.conf_vpn_s2se_tunnel_config_mode_exp.checked = false;
			thisObj.f_loadVMDataEZ();
		} else {
            thisObj.m_form.conf_vpn_s2se_tunnel_config_mode_ez.checked = false;
			thisObj.m_form.conf_vpn_s2se_tunnel_config_mode_exp.checked = true;		
			thisObj.f_loadVMDataExpert();			
		}		
        thisObj.m_form = document.getElementById('conf_vpn_s2se' + "_form");
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
		var ft = document.getElementById('ft_container');
		//alert('div height: ' + thisObj.f_getHeight() + ' ft.height: ' + ft.style.height);
		g_utmMainPanel.f_requestResize();
	}
    
    this.f_attachListener = function()
    {
        var el = document.getElementById('conf_vpn_s2se_tunnel_config_mode_ez');
        g_xbObj.f_xbAttachEventListener(el, 'click', thisObj.f_handleClick, false);
		el = document.getElementById('conf_vpn_s2se_tunnel_config_mode_exp');
        g_xbObj.f_xbAttachEventListener(el, 'click', thisObj.f_handleClick, false);	
    }
    
    this.f_detachListener = function()
    {
        var el = document.getElementById('conf_vpn_s2se_tunnel_config_mode_ez');
        g_xbObj.f_xbDetachEventListener(el, 'click', thisObj.f_handleClick, false);
		el = document.getElementById('conf_vpn_s2se_tunnel_config_mode_exp');
        g_xbObj.f_xbDetachEventListener(el, 'click', thisObj.f_handleClick, false);	
    }		
	
	
	this.f_setFocus = function()
	{
		thisObj.m_form.conf_vpn_s2se_tunnel_name.focus();
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
		alert('apply');
    }
    
    this.f_reset = function()
    {
        alert('reset');
    }
    
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_vpn_s2se_apply_button') { //apply clicked
                if (!thisObj.f_validate()) {
					return false;
				} 
			    thisObj.f_apply();
            } else if (id == 'conf_vpn_s2se_cancel_button') { //cancel clicked
                thisObj.f_reset();
            } else if (id == 'conf_vpn_s2se_tunnel_config_mode_ez') {
				thisObj.f_showExpert(false);
			} else if (id == 'conf_vpn_s2se_tunnel_config_mode_exp') {
				thisObj.f_showExpert(true);
			}
        }
    }
    
}

UTM_extend(UTM_confVpnS2SE, UTM_confFormObj);

function f_loadVpnLink(id)
{		
	switch (id) {
		case 'usrGrp':
			g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_REMOTE_USR_GRP_ID);
			break;
		case 'usr':
			g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_REMOTE_USR_ADD_ID);
			break;
	}		
}
