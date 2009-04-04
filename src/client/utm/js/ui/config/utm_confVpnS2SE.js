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
    
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        UTM_confVpnS2SE.superclass.constructor(name, callback, busLayer);
    }
    
    this.constructor(name, callback, busLayer);
    
    this.f_init = function()
    {
        this.f_setConfig({
            id: 'conf_vpn_s2se',
			width: '500',
            items: [{
                v_type: 'label',
                id: 'conf_vpn_s2se_header_label',
                text: 'VPN connection setttings',
                v_new_row: 'true',
				v_end_row: 'true',
				font_weight: 'bold',
				align: 'left',
				colspan : '2'
            }, {
                v_type: 'label',
                id: 'conf_vpn_s2se_basic_label',
                text: 'Basic setttings',
                v_new_row: 'true',
				v_end_row: 'true',
				align: 'left',
				colspan : '2'
            }, {
                v_type: 'label',
                id: 'conf_vpn_s2se_tunnel_name_label',
                text: 'Tunnel name',
				v_new_row: 'true',
				align: 'left',
				
            }, {
                v_type: 'text',
                id: 'conf_vpn_s2se_tunnel_name',
                size: '32',
                align: 'right',				
                v_end_row: 'true'
            }, {
                v_type: 'label',
                id: 'conf_vpn_s2se_peer_ip_label',
                text: 'Peer IP Address/ Domain name',
				align: 'left',				
                v_new_row: 'true'
            }, {
                v_type: 'text',
                id: 'conf_vpn_s2se_peer_ip',
                size: '32',
                align: 'right',					
                v_end_row: 'true'
            }, {
                v_type: 'label',
                id: 'conf_vpn_s2se_remote_device_label',
                text: 'Remote site VPN device',
				align: 'left',	
                v_new_row: 'true'
            }, {
                v_type: 'text',
                id: 'conf_vpn_s2se_remote_device',
                size: '32',
				align: 'right',	
                v_end_row: 'true'
            }, {
                v_type: 'label',
                id: 'conf_vpn_s2se_tunnel_setting_label',
                text: 'Tunnel setttings',
                v_new_row: 'true',
				v_end_row: 'true',
				align: 'left',
				colspan : '2'
            }, {
                v_type: 'label',
                id: 'conf_vpn_s2se_tunnel_config_mode_label',
                text: 'Tunnel Configuration Mode',
				align: 'left',	
                v_new_row: 'true'
            }, {
                v_type: 'text',
                id: 'conf_vpn_s2se_tunnel_config_mode',
                size: '32',
				align: 'right',	
                v_end_row: 'true'
            }, {
                v_type: 'label',
                id: 'conf_vpn_s2se_preshared_key_label',
                text: 'Preshared Key',
				align: 'left',	
                v_new_row: 'true'
            }, {
                v_type: 'password',
                id: 'conf_vpn_s2se_preshared_key',
                size: '25',
				align: 'right',	
                v_end_row: 'true'
            }, {
                v_type: 'label',
                id: 'conf_vpn_s2se_confirm_preshared_key_label',
                text: 'Confirm Preshared Key',
				align: 'left',	
                v_new_row: 'true'
            }, {
                v_type: 'password',
                id: 'conf_vpn_s2se_confirm_preshared_key',
                size: '25',
				align: 'right',	
                v_end_row: 'true'
            }, {
                v_type: 'label',
                id: 'conf_vpn_s2se_local_network_label',
                text: 'Local Network',
				align: 'left',	
                v_new_row: 'true'
            }, {
                v_type: 'text',
                id: 'conf_vpn_s2se_local_network',
                size: '25',
				align: 'right',	
                v_end_row: 'true'
            }, {
                v_type: 'label',
                id: 'conf_vpn_s2se_remote_network_label',
                text: 'Remote Network',
				align: 'left',	
                v_new_row: 'true'
            }, {
                v_type: 'password',
                id: 'conf_vpn_s2se_remote_network',
                size: '25',
				align: 'right',	
                v_end_row: 'true'
            }],
            buttons: [{
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
        })
    }
    
    this.f_loadVMData = function(element)
    {
        thisObj.m_form = document.getElementById('conf_vpn_s2se' + "_form");
		thisObj.f_setFocus();
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
    }
    
    this.f_reset = function()
    {
    
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
            }
        }
    }
    
}

FT_extend(UTM_confVpnS2SE, UTM_confFormObj);

