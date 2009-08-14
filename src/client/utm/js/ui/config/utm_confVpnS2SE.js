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
	this.m_change = false;
	this.m_eventCbFunction = 'f_confFormObjEventCallback';
	
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
	
    this.m_clickItems = ['conf_vpn_s2se_tunnel_config_mode_ez', 'conf_vpn_s2se_tunnel_config_mode_exp'];
    this.m_keyItems = [
	    'conf_vpn_s2se_tunnel_name', 
		'conf_vpn_s2se_peer_ip', 
		'conf_vpn_s2se_remote_device', 
		'conf_vpn_s2se_preshared_key',
		'conf_vpn_s2se_confirm_preshared_key',
		'conf_vpn_s2se_local_network_ip',
		'conf_vpn_s2se_local_network_mask',
		'conf_vpn_s2se_remote_network_ip',
		'conf_vpn_s2se_remote_network_mask',
		'conf_vpn_s2sexp_ike_p1_preshare',
		'conf_vpn_s2sexp_ike_p1_confirm_preshare',
		'conf_vpn_s2sexp_ike_p1_lifetime',
		'conf_vpn_s2se_ike_p2_local_network_ip',
		'conf_vpn_s2se_ike_p2_local_network_mask',
		'conf_vpn_s2se_ike_p2_remote_network_ip',
		'conf_vpn_s2se_ike_p2_remote_network_mask',
		'conf_vpn_s2sexp_ike_p2_lifetime'];
	this.m_changeItems = ['conf_vpn_s2sexp_ike_p1_proto','conf_vpn_s2sexp_ike_p1_ex_mode','conf_vpn_s2sexp_ike_p1_encrypt',
		          'conf_vpn_s2sexp_ike_p1_auth','conf_vpn_s2sexp_ike_p1_diffle','conf_vpn_s2sexp_ike_p2_dfs',
				  'conf_vpn_s2sexp_ike_p2_encrypt','conf_vpn_s2sexp_ike_p2_auth'];
		    
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
		
    this.f_init = function(obj)
    {
		/*
		var o = new UTM_vpnRecord();
        o.m_tunnel = 'Nice';
        o.m_peerIp = '11.0.0.127';
        o.m_remoteVpnDevice = 'Cisco';
        o.m_presharedKey = 'preshare';
        o.m_localNetwork = '192.168.1.0/24';
        o.m_remoteNetwork = '192.168.3.0/24';	
		o.m_mode = 'easy';
		*/	
		if (obj != undefined) {
			thisObj.m_vpn = obj;
		} else {
			thisObj.m_vpn = new UTM_vpnRecord();
			thisObj.m_vpn.f_setDefault();
		}		
		
		var defObj = new UTM_confFormDefObj('conf_vpn_s2se', '500', new Array(), 
		    [{
                id: 'conf_vpn_s2se_back_button',
                text: 'back',
				tooltip: g_lang.m_tooltip_back,
				align: 'left',
                onclick: this.f_handleClick
            }, {
                id: 'conf_vpn_s2se_cancel_button',
				align: 'right',
                text: 'Cancel',
				tooltip: g_lang.m_tooltip_cancel,
                onclick: this.f_handleClick
            }, {
                id: 'conf_vpn_s2se_apply_button',
				align: 'right',
                text: 'Apply',
				tooltip: g_lang.m_tooltip_apply,
                onclick: this.f_handleClick
            }]		
		);
		defObj.padding = '0px 0px 0px 30px';
		defObj.f_addLabelBold('conf_vpn_s2se_header_label',g_lang.m_vpnS2S_VpnConSettings,'true');
        defObj.f_addDivider('conf_vpn_s2se_divider','2');
		defObj.f_addEmptySpace('conf_vpn_s2se_basic_spacer','2');
		defObj.f_addLabelBold('conf_vpn_s2se_basic_label',g_lang.m_vpn_BasicSettings,'true');
		defObj.f_addInput('conf_vpn_s2se_tunnel_name', '32', g_lang.m_vpnS2S_TunnelName);
		defObj.f_addInput('conf_vpn_s2se_peer_ip', '32', g_lang.m_vpnS2S_DomainName);		
		defObj.f_addHtml(
		   'conf_vpn_s2se_remote_device',
		   '<select name="conf_vpn_s2se_remote_device" id="conf_vpn_s2se_remote_device" class="v_form_input"><option value="cisco" selected>cisco</option><option value="vyatta">vyatta</option></select>',
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
            '<select name="conf_vpn_s2sexp_ike_p1_proto" id="conf_vpn_s2sexp_ike_p1_proto" class="v_form_input"><option value="ESP" selected>ESP</option><option value="AH">AH</option></select>',
			g_lang.m_vpn_IKE_p1_proto			
		);		
		defObj.f_addHtml(
		    'conf_vpn_s2sexp_ike_p1_ex_mode',
            '<select name="conf_vpn_s2sexp_ike_p1_ex_mode" id="conf_vpn_s2sexp_ike_p1_ex_mode" class="v_form_input"><option value="aggressive" selected>aggressive</option><option value="main">main</option></select>',
			g_lang.m_vpn_IKE_p1_ex_mode		
		);			
		defObj.f_addHtml(
		    'conf_vpn_s2sexp_ike_p1_encrypt',
            '<select name="conf_vpn_s2sexp_ike_p1_encrypt" id="conf_vpn_s2sexp_ike_p1_encrypt" class="v_form_input"><option value="DES" selected>DES</option><option value="3DES">3DES</option><option value="AES128">AES128</option><option value="AES192">AES192</option><option value="AES256">AES256</option><option value="Blowfish">Blowfish</option></select>',
			g_lang.m_vpn_Encrypt		
		);	
		defObj.f_addPassword('conf_vpn_s2sexp_ike_p1_preshare','25',g_lang.m_vpn_PresharedKey);
		defObj.f_addPassword('conf_vpn_s2sexp_ike_p1_confirm_preshare','25',g_lang.m_vpn_Confirm + ' ' + g_lang.m_vpn_PresharedKey);
		defObj.f_addHtml(
		    'conf_vpn_s2sexp_ike_p1_auth',
            '<select name="conf_vpn_s2sexp_ike_p1_auth" id="conf_vpn_s2sexp_ike_p1_auth" class="v_form_input"><option value="MD5">MD5</option><option value="SHA1" selected>SHA1</option></select>',
			g_lang.m_vpn_auth		
		);			
		defObj.f_addHtml(
		    'conf_vpn_s2sexp_ike_p1_diffle',
            '<select name="conf_vpn_s2sexp_ike_p1_diffle" id="conf_vpn_s2sexp_ike_p1_diffle" class="v_form_input"><option value="group 1" selected>group 1</option><option value="group 2">group 2</option><option value="group 5">group 5</option><option value="group 14">group 14</option></select>',
			g_lang.m_vpn_Diffle		
		);			
		defObj.f_addInput('conf_vpn_s2sexp_ike_p1_lifetime','25',g_lang.m_vpn_LifeTime);
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
            '<select name="conf_vpn_s2sexp_ike_p2_dfs" id="conf_vpn_s2sexp_ike_p2_dfs" class="v_form_input"><option value="group 1" selected>group 1</option><option value="group 2">group 2</option><option value="group 5">group 5</option><option value="group 14">group 14</option></select>',
			g_lang.m_vpn_DFS	
		);							
		defObj.f_addInput('conf_vpn_s2sexp_ike_p2_lifetime','25',g_lang.m_vpn_LifeTime);
		defObj.f_addHtml(
		    'conf_vpn_s2sexp_ike_p2_encrypt',
            '<select name="conf_vpn_s2sexp_ike_p2_encrypt" id="conf_vpn_s2sexp_ike_p2_encrypt" class="v_form_input"><option value="DES" selected>DES</option><option value="3DES">3DES</option><option value="AES128">AES128</option><option value="AES192">AES192</option><option value="AES256">AES256</option><option value="Blowfish">Blowfish</option></select>',
			g_lang.m_vpn_Encrypt
		);						
		defObj.f_addHtml(
		    'conf_vpn_s2sexp_ike_p2_auth',
            '<select name="conf_vpn_s2sexp_ike_p2_auth" id="conf_vpn_s2sexp_ike_p2_auth" class="v_form_input"><option value="MD5">MD5</option><option value="SHA1" selected>SHA1</option></select>',
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
        var txt = '<br>';

        return this.f_createGeneralDiv(txt);
    }	
	
	this.f_createTestLink = function()
	{		
		var txt = '<a href="#" onclick="f_loadVpnLink(\'usrGrp\')">Remote User Group</a><br/>' +
		          '<a href="#" onclick="f_loadVpnLink(\'usr\')">Remote User</a><br/>';
				  
        var div = document.createElement('div');
		div.style.padding = '5px 0px 0px 30px';
        div.style.display = 'block';
		div.style.height = 'auto';
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
		thisObj.f_showExpert(false);
	}	
	
	this.f_loadVMDataExpert = function()
	{
		thisObj.f_showExpert(true);
        //phase 1
		thisObj.f_setComboBoxSelectionByValue(thisObj.m_form.conf_vpn_s2sexp_ike_p1_proto, thisObj.m_vpn.m_type);
		thisObj.f_setComboBoxSelectionByValue(thisObj.m_form.conf_vpn_s2sexp_ike_p1_ex_mode, thisObj.m_vpn.m_exchange);
		thisObj.f_setComboBoxSelectionByValue(thisObj.m_form.conf_vpn_s2sexp_ike_p1_encrypt, thisObj.m_vpn.m_encryption1);
		thisObj.m_form.conf_vpn_s2sexp_ike_p1_preshare.value = thisObj.m_vpn.m_presharedKey;
		thisObj.m_form.conf_vpn_s2sexp_ike_p1_confirm_preshare.value = thisObj.m_vpn.m_presharedKey;
		thisObj.f_setComboBoxSelectionByValue(thisObj.m_form.conf_vpn_s2sexp_ike_p1_auth, thisObj.m_vpn.m_auth1);
		thisObj.f_setComboBoxSelectionByValue(thisObj.m_form.conf_vpn_s2sexp_ike_p1_diffle, thisObj.m_vpn.m_diffieHellmann);
		thisObj.m_form.conf_vpn_s2sexp_ike_p1_lifetime.value = thisObj.m_vpn.m_lifeTime1;
		//phase 2
		thisObj.m_form.conf_vpn_s2se_ike_p2_local_network_ip.value = thisObj.m_vpn.f_getLocalNetworkIp();
		thisObj.m_form.conf_vpn_s2se_ike_p2_local_network_mask.value = thisObj.m_vpn.f_getLocalNetworkPrefix();
        thisObj.m_form.conf_vpn_s2se_ike_p2_remote_network_ip.value = thisObj.m_vpn.f_getRemoteNetworkIp();
		thisObj.m_form.conf_vpn_s2se_ike_p2_remote_network_mask.value = thisObj.m_vpn.f_getRemoteNetworkPrefix();
		thisObj.f_setComboBoxSelectionByValue(thisObj.m_form.conf_vpn_s2sexp_ike_p2_dfs, thisObj.m_vpn.m_dfsGroup);
		thisObj.m_form.conf_vpn_s2sexp_ike_p2_lifetime.value = thisObj.m_vpn.m_lifeTime2;
		thisObj.f_setComboBoxSelectionByValue(thisObj.m_form.conf_vpn_s2sexp_ike_p2_encrypt, thisObj.m_vpn.m_encryption2);
		thisObj.f_setComboBoxSelectionByValue(thisObj.m_form.conf_vpn_s2sexp_ike_p2_auth, thisObj.m_vpn.m_auth2);		
	}
		
    this.f_loadVMData = function(element)
    {
		thisObj.m_form = document.getElementById('conf_vpn_s2se_form');
		thisObj.m_form.conf_vpn_s2se_tunnel_name.value = thisObj.m_vpn.m_tunnel;
		thisObj.m_form.conf_vpn_s2se_peer_ip.value = thisObj.m_vpn.m_peerIp;
		//select from drop down combo box.
		this.f_setComboBoxSelectionByName(thisObj.m_form.conf_vpn_s2se_remote_device, thisObj.m_vpn.m_remoteVpnDevice);
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
		thisObj.f_setFocus();
		this.f_attachListener();	
		thisObj.f_enableAllButton(false);
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
		thisObj.f_resize();
	}
			
	this.f_setFocus = function()
	{
		thisObj.m_form.conf_vpn_s2se_tunnel_name.focus();
	}		
    
    this.f_stopLoadVMData = function()
    {
    }
        		
    this.f_validate = function(vpnRec)
    {
        var error = g_lang.m_formFixError + '<br>';
        var errorInner = '';
		
        if (!thisObj.f_checkIP(vpnRec.m_peerIp)) {
			if (!thisObj.f_checkHostname(vpnRec.m_peerIp)) {
				errorInner += thisObj.f_createListItem(g_lang.m_formInvalidCapital + ' ' + g_lang.m_vpnS2S_DomainName + g_lang.m_exclamationMark);
			}
        }		
		if (vpnRec.m_presharedKey.trim().length <=0 ) {
			;//is preshared key mandatory?
		} else if (vpnRec.m_presharedKey != thisObj.m_form.conf_vpn_s2se_confirm_preshared_key.value) {
			errorInner += thisObj.f_createListItem(g_lang.m_vpnS2S_preshareKey_confirm_mismatch);
		}
		
		if (!thisObj.f_checkIP(vpnRec.f_getLocalNetworkIp())) {
			errorInner += thisObj.f_createListItem(g_lang.m_formInvalidCapital + ' ' + g_lang.m_vpn_LocalNetwork + ' ' + g_lang.m_ipAddr);
		}
		if (!g_utils.f_validateCIDR(vpnRec.f_getLocalNetworkPrefix())) {
			errorInner += thisObj.f_createListItem(g_lang.m_formInvalidCapital + ' ' + g_lang.m_vpn_LocalNetwork + ' ' + g_lang.m_mask);
		}
		
		if (!thisObj.f_checkIP(vpnRec.f_getRemoteNetworkIp())) {
			errorInner += thisObj.f_createListItem(g_lang.m_formInvalidCapital + ' ' + g_lang.m_vpn_RemoteNetwork + ' ' + g_lang.m_ipAddr);
		}
		if (!g_utils.f_validateCIDR(vpnRec.f_getRemoteNetworkPrefix())) {
			errorInner += thisObj.f_createListItem(g_lang.m_formInvalidCapital + ' ' + g_lang.m_vpn_RemoteNetwork + ' ' + g_lang.m_mask);
		}
			
		if (!g_utils.f_validateInt(vpnRec.m_lifeTime1, true)) {
			errorInner += thisObj.f_createListItem(g_lang.m_formInvalidCapital + ' ' + g_lang.m_vpn_IKEnegPhase1 + ' ' + g_lang.m_vpn_LifeTime);
		}			
			
		if (!g_utils.f_validateInt(vpnRec.m_lifeTime2, true)) {
			errorInner += thisObj.f_createListItem(g_lang.m_formInvalidCapital + ' ' + g_lang.m_vpn_IKEphase2 + ' ' + g_lang.m_vpn_LifeTime);
		}				
				
        if (errorInner.trim().length > 0) {
            error = error + '<ul style="padding-left:30px;">';
            error = error + errorInner + '</ul>';
            g_utils.f_popupMessage(error, 'error', g_lang.m_error, true);
			return false;
        }
        return true;
    }
	
	this.f_getVpn = function()
	{		
		var vpnRec = new UTM_vpnRecord();
		vpnRec.m_tunnel = thisObj.m_form.conf_vpn_s2se_tunnel_name.value;
		vpnRec.m_peerIp = thisObj.m_form.conf_vpn_s2se_peer_ip.value;		
		vpnRec.m_remoteVpnDevice = thisObj.f_getComboBoxSelectedValue(thisObj.m_form.conf_vpn_s2se_remote_device);
				
		if (thisObj.m_form.conf_vpn_s2se_tunnel_config_mode_ez.checked) {
			vpnRec.m_mode = 'easy';
			vpnRec.m_presharedKey = thisObj.m_form.conf_vpn_s2se_preshared_key.value;
			vpnRec.f_setLocalNetwork(thisObj.m_form.conf_vpn_s2se_local_network_ip.value, 
			    thisObj.m_form.conf_vpn_s2se_local_network_mask.value);
			vpnRec.f_setRemoteNetwork(thisObj.m_form.conf_vpn_s2se_remote_network_ip.value,
			    thisObj.m_form.conf_vpn_s2se_remote_network_mask);
		} else {
			vpnRec.m_mode = 'expert';
			vpnRec.m_type = thisObj.f_getComboBoxSelectedValue(thisObj.m_form.conf_vpn_s2sexp_ike_p1_proto);
			vpnRec.m_exchange = thisObj.f_getComboBoxSelectedValue(thisObj.m_form.conf_vpn_s2sexp_ike_p1_ex_mode);
			vpnRec.m_encryption1 = thisObj.f_getComboBoxSelectedValue(thisObj.m_form.conf_vpn_s2sexp_ike_p1_encrypt);
			vpnRec.m_presharedKey = thisObj.m_form.conf_vpn_s2sexp_ike_p1_preshare.value;
			vpnRec.m_auth1 = thisObj.f_getComboBoxSelectedValue(thisObj.m_form.conf_vpn_s2sexp_ike_p1_auth);
			vpnRec.m_diffieHellmann = thisObj.f_getComboBoxSelectedValue(thisObj.m_form.conf_vpn_s2sexp_ike_p1_diffle);
			vpnRec.m_lifeTime1 = thisObj.m_form.conf_vpn_s2sexp_ike_p1_lifetime.value;
			vpnRec.f_setLocalNetwork(thisObj.m_form.conf_vpn_s2se_ike_p2_local_network_ip.value,
			    thisObj.m_form.conf_vpn_s2se_ike_p2_local_network_mask.value);
			vpnRec.f_setRemoteNetwork(thisObj.m_form.conf_vpn_s2se_ike_p2_remote_network_ip.value,
			    thisObj.m_form.conf_vpn_s2se_ike_p2_remote_network_mask.value);
			vpnRec.m_dfsGroup = thisObj.f_getComboBoxSelectedValue(thisObj.m_form.conf_vpn_s2sexp_ike_p2_dfs);
			vpnRec.m_lifeTime2 = thisObj.m_form.conf_vpn_s2sexp_ike_p2_lifetime.value;			
			vpnRec.m_encryption2 = thisObj.f_getComboBoxSelectedValue(thisObj.m_form.conf_vpn_s2sexp_ike_p2_encrypt);
			vpnRec.m_auth2 = thisObj.f_getComboBoxSelectedValue(thisObj.m_form.conf_vpn_s2sexp_ike_p2_auth);			
		}
		return vpnRec;

	}
    
    this.f_apply = function()
    {
        var vpnRec = thisObj.f_getVpn();
		if (!thisObj.f_validate(vpnRec)) {
			return;
		}
		g_utils.f_startWait();
				
        var cb = function(evt)
        {        
		    g_utils.f_stopWait();
            if (evt != undefined && evt.m_objName == 'UTM_eventObj') {            
                if (evt.f_isError()) {                
                    g_utils.f_popupMessage(evt.m_errMsg, 'error', g_lang.m_error, true);  
                    return;                    
                }        
                thisObj.f_enableAllButton(false);	
            }                                 
        };      
        g_busObj.f_vpnSetSite2SiteConfig(vpnRec, cb); 	
    }
    
    this.f_reset = function()
    {
        thisObj.f_loadVMData();
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
	
	this.f_eventCallback = function(id) 
    {
		g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_OVERVIEW_ID, null, true);		
	}
    
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_vpn_s2se_apply_button') { //apply clicked
			    thisObj.f_apply();
            } else if (id == 'conf_vpn_s2se_cancel_button') { //cancel clicked
                thisObj.f_reset();
            } else if (id == 'conf_vpn_s2se_tunnel_config_mode_ez') {
				thisObj.f_showExpert(false);
				thisObj.f_enableAllButton(true);
			} else if (id == 'conf_vpn_s2se_tunnel_config_mode_exp') {
				thisObj.f_showExpert(true);
				thisObj.f_enableAllButton(true);				
			} else if ( id=='conf_vpn_s2se_back_button') {
				thisObj.f_back();
			}
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
                id = 'conf_vpn_s2se_apply_button';
                break;
            case 'cancel':
                id = 'conf_vpn_s2se_cancel_button';
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

