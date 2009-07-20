/**
 * @author loi
 */
/*
 Document   : utm_confNwLANcmp.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description: Contains all the components that make up the LAN configuration page.
 */
function UTM_confNwLANitf(name, callback, busLayer)
{
    var thisObjName = 'UTM_confNwLANitf';
    var thisObj = this;
	this.m_objectId = 'conf_lan_itf';
	this.m_ifObj = undefined;
	this.m_ifName = undefined;
    this.m_form = undefined;
    this.m_div = undefined;
    
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
        UTM_confNwLANitf.superclass.constructor(name, callback, busLayer);
    }
    
    this.privateConstructor(name, callback, busLayer);
    
    this.f_init = function()
    {
        this.f_setConfig({
            id: 'conf_lan_itf',
            width: '550',
            items: [{
                v_type: 'label',
                text: g_lang.m_lanitf_title,
                v_new_row: 'true',
                v_end_row: 'true',
                font_weight: 'bold'
            }, {
                v_type: 'label',
                text: g_lang.m_lanitf_ip,
                v_new_row: 'true',
                padding: '60px'
            }, {
                v_type: 'text',
                id: 'conf_lan_itf_ip',
                size: '32',
                align: 'right',
                v_end_row: 'true'
            }, {
                v_type: 'label',
                text: g_lang.m_lanitf_mask,
                v_new_row: 'true',
                padding: '60px'
            }, {
                v_type: 'text',
                id: 'conf_lan_itf_mask',
                size: '32',
                align: 'right',
                v_end_row: 'true'
            }],
            buttons: [{
                id: 'conf_lan_itf_cancel_button',
                align: 'right',
                text: 'Cancel',
                tooltip: g_lang.m_tooltip_cancel,
                onclick: this.f_handleClick
            }, {
                id: 'conf_lan_itf_apply_button',
                align: 'right',
                text: 'Apply',
                tooltip: g_lang.m_tooltip_apply,
                onclick: this.f_handleClick
            }]
        })
    }
	
	this.f_setIfName = function(ifName)
	{
		thisObj.m_ifName = ifName;
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
                id = 'conf_lan_itf_apply_button';
                break;
            case 'cancel':
                id = 'conf_lan_itf_cancel_button';
                break;
            default:
                break;
        }
        thisObj.f_enabledDisableButton(id, state);
    }
    
    this.f_enableTextField = function(b, id)
    {
        var el = document.getElementById(id);
        el.readOnly = (!b);
        if (b) {
            el.style.backgroundColor = '#FFFFFF';
        } else {
            el.style.backgroundColor = '#EFEFEF';
        }
    }
    
    this.f_getContentPane = function()
    {
        thisObj.f_init();
        return thisObj.f_getForm();
    }
    
    this.f_reload = function(parentReference)
    {
		var p = parentReference;
        thisObj.f_enableAllButton(false);
     
         var cb = function(evt) {
             if (evt != undefined && evt.m_objName == 'UTM_eventObj') {   
                 if (evt.f_isError()) {
                     g_utils.f_popupMessage(evt.m_errMsg, 'ok', g_lang.m_error, true);
			         if ((p != undefined) && (p != null)) {
			             p.f_loadVMDataCb();
		             }						 
                     return; 
                 }
                 thisObj.m_ifObj = evt.m_value;
                 thisObj.f_setValue();                       
             }        
			 if ((p != undefined) && (p != null)) {
			    p.f_loadVMDataCb();
		     }	
         };
         g_busObj.f_getIfConfig(thisObj.m_ifName, cb);        
    }
    
    this.f_setValue = function()
    {
		if ((thisObj.m_ifObj != undefined) && (thisObj.m_ifObj != null)) {
			thisObj.m_form.conf_lan_itf_ip.value = thisObj.m_ifObj.m_ip;
			thisObj.m_form.conf_lan_itf_mask.value = g_utils.f_convertCIDRToNetmask(thisObj.m_ifObj.m_mask);
		}
        thisObj.f_enableAllButton(false);
    }
    
    this.f_loadVMData = function(divElement, parentReference)
    {
        thisObj.m_form = document.getElementById('conf_lan_itf_form');
        thisObj.f_setFocus();
        thisObj.f_attachListener();
        thisObj.f_reload(parentReference);	
    }
    
    this.f_attachListener = function()
    {
        var a1 = ['conf_lan_itf_ip', 'conf_lan_itf_mask'];
        
        for (var i = 0; i < a1.length; i++) {
            var el = document.getElementById(a1[i]);
            g_xbObj.f_xbAttachEventListener(el, 'keydown', thisObj.f_handleClick, false);
        }
    }
    
    this.f_detachListener = function()
    {
        var a1 = ['conf_lan_itf_ip', 'conf_lan_itf_mask'];
        
        for (var i = 0; i < a1.length; i++) {
            var el = document.getElementById(a1[i]);
            g_xbObj.f_xbDetachEventListener(el, 'keydown', thisObj.f_handleClick, false);
        }
    }
    
    
    this.f_setFocus = function()
    {
    
    }
    
    this.f_stopLoadVMData = function()
    {
        thisObj.f_detachListener();
    }
    
    this.f_validate = function()
    {
        var error = g_lang.m_formFixError + '<br>';
        var errorInner = '';
        
        if (!thisObj.f_checkIP(thisObj.m_form.conf_lan_itf_ip.value)) {
            errorInner += thisObj.f_createListItem(g_lang.m_lanitf_ip + ' ' + g_lang.m_formInvalid);
        }
        if (!g_utils.f_validateNetmask(thisObj.m_form.conf_lan_itf_mask.value)) {
            errorInner += thisObj.f_createListItem(g_lang.m_lanitf_mask + ' ' + g_lang.m_formInvalid);
        }
        
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
        var cb = function(evt)
        {
            if (evt != undefined && evt.m_objName == 'UTM_eventObj') {
                if (evt.f_isError()) {
                    g_utils.f_popupMessage(evt.m_errMsg, 'error', g_lang.m_error, true);
                    return;
                } else {
                    thisObj.f_enableAllButton(false);
                }
            }
        };
        thisObj.m_ifObj.m_ip = thisObj.m_form.conf_lan_itf_ip.value.trim();
		thisObj.m_ifObj.m_mask = g_utils.f_convertNetmaskToCIDR(thisObj.m_form.conf_lan_itf_mask.value.trim());
		
        g_busObj.f_setDNSConfig(thisObj.m_ifObj, cb);
    }
    
    this.f_reset = function()
    {
    }
    
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            return thisObj.f_handleClickById(id);
        }
    }
    
    this.f_handleClickById = function(id)
    {
        switch (id) {
            case 'conf_lan_itf_ip':
            case 'conf_lan_itf_mask':
                thisObj.f_enableAllButton(true);
                break;
            case 'conf_lan_itf_apply_button': //apply clicked
                if (!thisObj.f_validate()) {
                    return false;
                }
                thisObj.f_apply();
                break;
            case 'conf_lan_itf_cancel_button': //cancel clicked
                thisObj.f_reload();
                break;
                
        }
        return false;
    }
}

UTM_extend(UTM_confNwLANitf, UTM_confFormObj);


function UTM_confNwLANdhcp(name, callback, busLayer)
{
    var thisObjName = 'UTM_confNwLANdhcp';
    var thisObj = this;
	this.m_objectId = 'conf_lan_dhcp';
	this.m_ifName = undefined;
	this.m_dhcpObj = undefined;
    this.m_form = undefined;
    this.m_div = undefined;
    
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
        UTM_confNwLANdhcp.superclass.constructor(name, callback, busLayer);
    }
    
    this.privateConstructor(name, callback, busLayer);
    
    this.f_init = function()
    {
        this.f_setConfig({
            id: 'conf_lan_dhcp',
            width: '550',
            items: [{
                v_type: 'label',
                text: g_lang.m_landhcp_title,
                v_new_row: 'true',
                v_end_row: 'true',
                font_weight: 'bold'
            }, {
                v_type: 'html',
                id: 'conf_lan_dhcp_enable',
                text: '<input id="conf_lan_dhcp_enable" type="checkbox" name="conf_lan_dhcp_enable" checked>&nbsp;' + g_lang.m_landhcp_enable,
                padding: '30px',
                colspan: '2',
                v_new_row: 'true',
                v_end_row: 'true'
            }, {
                v_type: 'label',
                text: g_lang.m_landhcp_range_start,
                v_new_row: 'true',
                padding: '60px'
            }, {
                v_type: 'text',
                id: 'conf_lan_dhcp_range_start',
                size: '32',
                align: 'right',
                v_end_row: 'true'
            }, {
                v_type: 'label',
                text: g_lang.m_landhcp_range_end,
                v_new_row: 'true',
                padding: '60px'
            }, {
                v_type: 'text',
                id: 'conf_lan_dhcp_range_end',
                size: '32',
                align: 'right',
                v_end_row: 'true'
            }, {
                v_type: 'label',
                text: g_lang.m_landhcp_dns_mode,
                v_new_row: 'true',
                padding: '60px'
            }, {
                v_type: 'html',
                id: 'conf_lan_dhcp_dns_mode',
                text: '<select name="conf_lan_dhcp_dns_mode" id="conf_lan_dhcp_dns_mode" class="v_form_input"><option value="static" selected>' +
                g_lang.m_landhcp_dns_static +
                '</option><option value="dynamic">' +
                g_lang.m_landhcp_dns_dynamic +
                '</option><option value="none">' +
                g_lang.m_landhcp_dns_none +
                '</option></select>',
                align: 'right',
                v_end_row: 'true'
            }, {
                v_type: 'label',
                text: g_lang.m_landhcp_dns_pri,
                v_new_row: 'true',
                padding: '60px'
            }, {
                v_type: 'text',
                id: 'conf_lan_dhcp_dns_pri',
                size: '32',
                align: 'right',
                v_end_row: 'true'
            }, {
                v_type: 'label',
                text: g_lang.m_landhcp_dns_sec,
                v_new_row: 'true',
                padding: '60px'
            }, {
                v_type: 'text',
                id: 'conf_lan_dhcp_dns_sec',
                size: '32',
                align: 'right',
                v_end_row: 'true'
            }],
            buttons: [{
                id: 'conf_lan_dhcp_cancel_button',
                align: 'right',
                text: 'Cancel',
                tooltip: g_lang.m_tooltip_cancel,
                onclick: this.f_handleClick
            }, {
                id: 'conf_lan_dhcp_apply_button',
                align: 'right',
                text: 'Apply',
                tooltip: g_lang.m_tooltip_apply,
                onclick: this.f_handleClick
            }]
        })
    }
    
	this.f_setIfName = function(ifName)
	{
		thisObj.m_ifName = ifName;
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
                id = 'conf_lan_dhcp_apply_button';
                break;
            case 'cancel':
                id = 'conf_lan_dhcp_cancel_button';
                break;
            default:
                break;
        }
        thisObj.f_enabledDisableButton(id, state);
    }
    
    this.f_enableTextField = function(b, id)
    {
        var el = document.getElementById(id);
        el.readOnly = (!b);
        if (b) {
            el.style.backgroundColor = '#FFFFFF';
        } else {
            el.style.backgroundColor = '#EFEFEF';
        }
    }
    
    this.f_enableDHCP = function(state)
    {
        var a = ['conf_lan_dhcp_range_start', 'conf_lan_dhcp_range_end', 'conf_lan_dhcp_dns_mode'];
        for (var i = 0; i < a.length; i++) {
            thisObj.f_enableTextField(state, a[i]);
        }
        var dnsMode = thisObj.f_getComboBoxSelectedValue(thisObj.m_form.conf_lan_dhcp_dns_mode);
		var en = state;		
		if (state) {
			if (dnsMode == 'static') {
				en = true;
			} else {
				en = false;
			}
		} 
		thisObj.f_enableDNS(en);		
    }
	
	this.f_enableDNS = function(state)
	{	
        var a = ['conf_lan_dhcp_dns_pri', 'conf_lan_dhcp_dns_sec'];
        for (var i = 0; i < a.length; i++) {
            thisObj.f_enableTextField(state, a[i]);
        }		
	}
    
    this.f_getContentPane = function()
    {
        thisObj.f_init();
        return thisObj.f_getForm();
    }
    
    this.f_reload = function(parentElement)
    {
		var p = parentElement;
        thisObj.f_enableAllButton(false);
        
        var cb = function(evt)
        {
            if (evt != undefined && evt.m_objName == 'UTM_eventObj') {
                if (evt.f_isError()) {
                    g_utils.f_popupMessage(evt.m_errMsg, 'ok', g_lang.m_error, true);
                    return;
                }
                thisObj.m_dhcpObj = evt.m_value;
                thisObj.f_setValue();
            }
			 if ((p != undefined) && (p != null)) {
			    p.f_loadVMDataCb();
		     }			
        };
        
        g_busObj.f_getDhcpConfig(thisObj.m_ifName, cb);
    }
    
    this.f_setMode = function(id, state)
    {
        var el = document.getElementById(id);
        if (state) {
            el.checked = 'checked';
        } else {
            el.checked = '';
        }
    }
    
    this.f_setValue = function()
    {
		thisObj.m_form.conf_lan_dhcp_range_start.value = thisObj.m_dhcpObj.m_start;
		thisObj.m_form.conf_lan_dhcp_range_end.value = thisObj.m_dhcpObj.m_end;
		thisObj.m_form.conf_lan_dhcp_dns_pri.value = thisObj.m_dhcpObj.m_dnsPrimary;
		thisObj.m_form.conf_lan_dhcp_dns_sec.value = thisObj.m_dhcpObj.m_dnsSecondary;
		
		if ((thisObj.m_dhcpObj.m_dnsMode==null) || (thisObj.m_dhcpObj.m_dnsMode.trim().length <= 0)) {
			thisObj.m_dhcpObj.m_dnsMode = 'none';
		}		
		thisObj.f_setComboBoxSelectionByValue(thisObj.m_form.conf_lan_dhcp_dns_mode, thisObj.m_dhcpObj.m_dnsMode);
		
		if (thisObj.m_dhcpObj.m_enable == 'true') {
			thisObj.m_form.conf_lan_dhcp_enable.checked = 'checked';
			thisObj.f_enableDHCP(true);
		} else {
			thisObj.m_form.conf_lan_dhcp_enable.checked = '';			
			thisObj.f_enableDHCP(false);
		}                
    }
    
    this.f_loadVMData = function(divElement, parentReference)
    {
        thisObj.m_form = document.getElementById('conf_lan_dhcp_form');
        thisObj.f_setFocus();
        thisObj.f_attachListener();
        thisObj.f_reload(parentReference);
    }
    
    this.f_attachListener = function()
    {
        var a1 = ['conf_lan_dhcp_enable'];
        var a2 = ['conf_lan_dhcp_range_start', 'conf_lan_dhcp_range_end', 'conf_lan_dhcp_dns_pri', 'conf_lan_dhcp_dns_sec'];
        
        for (var i = 0; i < a1.length; i++) {
            var el = document.getElementById(a1[i]);
            g_xbObj.f_xbAttachEventListener(el, 'click', thisObj.f_handleClick, false);
        }
        for (var i = 0; i < a2.length; i++) {
            var el = document.getElementById(a2[i]);
            g_xbObj.f_xbAttachEventListener(el, 'keydown', thisObj.f_handleClick, false);
        }
		el = document.getElementById('conf_lan_dhcp_dns_mode');
        g_xbObj.f_xbAttachEventListener(el, 'change', thisObj.f_handleChange, false);		
    }
    
    this.f_detachListener = function()
    {
        var a1 = ['conf_lan_dhcp_enable'];
        var a2 = ['conf_lan_dhcp_range_start', 'conf_lan_dhcp_range_end', 'conf_lan_dhcp_dns_pri', 'conf_lan_dhcp_dns_sec'];
        
        for (var i = 0; i < a1.length; i++) {
            var el = document.getElementById(a1[i]);
            g_xbObj.f_xbDetachEventListener(el, 'click', thisObj.f_handleClick, false);
        }
        for (var i = 0; i < a2.length; i++) {
            var el = document.getElementById(a2[i]);
            g_xbObj.f_xbDetachEventListener(el, 'keydown', thisObj.f_handleClick, false);
        }
		el = document.getElementById('conf_lan_dhcp_dns_mode');
        g_xbObj.f_xbDetachEventListener(el, 'change', thisObj.f_handleChange, false);			
    }
    
    
    this.f_setFocus = function()
    {
    
    }
    
    this.f_stopLoadVMData = function()
    {
        thisObj.f_detachListener();
    }
    
	this.f_validateDHCPrange = function()
	{
		var error = '';
		var start = thisObj.m_form.conf_lan_dhcp_range_start.value;
		var end = thisObj.m_form.conf_lan_dhcp_range_end.value;
		if ((start.trim().length > 0) && (end.trim().length >0)) {
			var startNum = f_inetAddr(start);
			var endNum = f_inetAddr(end);
			if (endNum < startNum) {
				error += thisObj.f_createListItem(g_lang.m_landdhcp_range_invalid + ' [' + 
				    start + ' - ' + end + ']');
			}
		}
		return error;
	}
	
    this.f_validate = function()
    {
        var error = g_lang.m_formFixError + '<br>';
        var errorInner = '';
        
        if (!thisObj.m_form.conf_lan_dhcp_enable.checked) {
            return true;
        }
        
        if (!thisObj.f_checkIP(thisObj.m_form.conf_lan_dhcp_range_start.value)) {
            errorInner += thisObj.f_createListItem(g_lang.m_landhcp_range_start + ' ' + g_lang.m_formInvalid);
        }
        if (!thisObj.f_checkIP(thisObj.m_form.conf_lan_dhcp_range_end.value)) {
            errorInner += thisObj.f_createListItem(g_lang.m_landhcp_range_end + ' ' + g_lang.m_formInvalid);
        }
		errorInner += thisObj.f_validateDHCPrange();
		var dnsMode = thisObj.f_getComboBoxSelectedValue(thisObj.m_form.conf_lan_dhcp_dns_mode);
        if (dnsMode == 'static') {
			if (!thisObj.f_checkIP(thisObj.m_form.conf_lan_dhcp_dns_pri.value)) {
				if (!thisObj.f_checkHostname(thisObj.m_form.conf_lan_dhcp_dns_pri.value)) {
					errorInner += thisObj.f_createListItem(g_lang.m_landhcp_dns_pri + ' ' + g_lang.m_formInvalid);
				}
			}
			if (!thisObj.f_checkIP(thisObj.m_form.conf_lan_dhcp_dns_sec.value)) {
				if (!thisObj.f_checkHostname(thisObj.m_form.conf_lan_dhcp_dns_sec.value)) {
					errorInner += thisObj.f_createListItem(g_lang.m_landhcp_dns_sec + ' ' + g_lang.m_formInvalid);
				}
			}
		}
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
        var cb = function(evt)
        {
            g_utils.f_stopWait();
            if (evt != undefined && evt.m_objName == 'UTM_eventObj') {
                if (evt.f_isError()) {
                    g_utils.f_popupMessage(evt.m_errMsg, 'error', g_lang.m_error, true);
                    return;
                } else {
                    thisObj.f_enableAllButton(false);
                }
            }
        };
		
		thisObj.m_dhcpObj.m_start = thisObj.m_form.conf_lan_dhcp_range_start.value;
		thisObj.m_dhcpObj.m_end = thisObj.m_form.conf_lan_dhcp_range_end.value;
		thisObj.m_dhcpObj.m_dnsPrimary = thisObj.m_form.conf_lan_dhcp_dns_pri.value;
		thisObj.m_dhcpObj.m_dnsSecondary = thisObj.m_form.conf_lan_dhcp_dns_sec.value;
		thisObj.m_dhcpObj.m_dnsMode = thisObj.f_getComboBoxSelectedValue(thisObj.m_form.conf_lan_dhcp_dns_mode);
		
		if (thisObj.m_dhcpObj.m_dnsMode != 'static') {
			thisObj.m_dhcpObj.m_dnsPrimary = '';
			thisObj.m_dhcpObj.m_dnsSecondary = '';
		}
		
		if (thisObj.m_form.conf_lan_dhcp_enable.checked) {
			 thisObj.m_dhcpObj.m_enable = 'true';
		} else {
             thisObj.m_dhcpObj.m_enable = 'false';
		} 		
        g_busObj.f_setDhcpConfig(thisObj.m_dhcpObj, cb);
    }
    
    this.f_reset = function()
    {
    }
    
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            return thisObj.f_handleClickById(id);
        }
    }
    
	this.f_handleChange = function()
	{
		thisObj.f_enableAllButton(true);
        var dnsMode = thisObj.f_getComboBoxSelectedValue(thisObj.m_form.conf_lan_dhcp_dns_mode);
        if (thisObj.m_form.conf_lan_dhcp_enable.checked) {
            if (dnsMode == 'static') {
			    thisObj.f_enableDNS(true);
				thisObj.m_form.conf_lan_dhcp_dns_pri.value = thisObj.m_dhcpObj.m_dnsPrimary;
				thisObj.m_form.conf_lan_dhcp_dns_sec.value = thisObj.m_dhcpObj.m_dnsSecondary;								
			} else {
				thisObj.f_enableDNS(false);
				thisObj.m_form.conf_lan_dhcp_dns_pri.value = '';
				thisObj.m_form.conf_lan_dhcp_dns_sec.value = '';				
			}					
		}		
	}
	
    this.f_handleClickById = function(id)
    {
        switch (id) {
            case 'conf_lan_dhcp_enable':
                if (thisObj.m_form.conf_lan_dhcp_enable.checked) {
                    thisObj.f_enableDHCP(true);
                } else {
                    thisObj.f_enableDHCP(false);
                }
                thisObj.f_enableAllButton(true);
                break;				
            case 'conf_lan_dhcp_range_start':
            case 'conf_lan_dhcp_range_end':
            case 'conf_lan_dhcp_dns_pri':
            case 'conf_lan_dhcp_dns_sec':
                thisObj.f_enableAllButton(true);
                break;
            case 'conf_lan_dhcp_apply_button': //apply clicked
                if (!thisObj.f_validate()) {
                    return false;
                }
                thisObj.f_apply();
                break;
            case 'conf_lan_dhcp_cancel_button': //cancel clicked
                thisObj.f_reload();
                break;
                
        }
        return false;
    }
    
}

UTM_extend(UTM_confNwLANdhcp, UTM_confFormObj);

function UTM_confNwLANip(name, callback, busLayer)
{
    var thisObj = this;
    this.m_ifName = undefined;
    this.thisObjName = 'UTM_confNwLANip';
    this.m_hdcolumns = undefined;
    this.m_headerText = undefined;
    this.m_header = undefined;
    this.m_buttons = undefined;
    this.m_body = undefined;
    this.m_row = 0;
    this.m_rowIdArray = new Array();
    this.m_tagNameArray = new Array();
    this.m_cnt = 0;
    this.m_dhcpMap = null;
    this.m_deletedRow = null;
    this.m_addedRow = null;
    this.m_updatedRow = null;
    this.m_handleClickCbFunction = 'f_confNwLANipHandleClickCb';
    this.m_handleKeyEventCbFunction = 'f_confNwLANipHandleKeyEventCb';
    this.m_prefix = 'conf_lan_ip_';
    this.m_objectId = 'conf_lan_ip';
    this.m_btnCancelId = this.m_prefix + 'btn_cancel';
    this.m_btnApplyId = this.m_prefix + 'btn_apply';
    this.m_btnAddId = this.m_prefix + 'btn_add';
    this.m_btnDeleteId = this.m_prefix + 'btn_delete';
    this.m_btnDeleteConfirmId = this.m_prefix + 'btn_delete_confirm';
    this.m_textWidth = 205;
    this.m_cbGroupId = this.m_prefix + 'cb_group';
    
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
        UTM_confNwLANip.superclass.constructor(name, callback, busLayer);
    }
    this.privateConstructor(name, callback, busLayer);
    
    this.f_setIfName = function(ifName)
    {
        this.m_ifName = ifName;
    }
    
    this.f_init = function()
    {
        this.m_hdcolumns = this.f_createHdColumns();
        this.m_headerText = this.f_headerText();
        this.f_createTableHeader();
        this.m_body = this.f_createGridView(this.m_hdcolumns, true);
        
        var btns = [['Add', this.m_handleClickCbFunction + "('" + this.m_objectId + "," + this.m_btnAddId + "')", g_lang.m_tooltip_add, this.m_btnAddId, g_lang.m_imageDir + 'bt_add.gif', 'left'], ['Cancel', this.m_handleClickCbFunction + "('" + this.m_objectId + "," + this.m_btnCancelId + "')", g_lang.m_tooltip_cancel, this.m_btnCancelId, g_lang.m_imageDir + 'bt_cancel.gif', 'right'], ['Apply', this.m_handleClickCbFunction + "('" + this.m_objectId + "," + this.m_btnApplyId + "')", g_lang.m_tooltip_apply, this.m_btnApplyId, g_lang.m_imageDir + 'bt_apply.gif', 'right']];
        this.m_buttons = this.f_createLRButtons(btns, '550px');
        
        return [this.m_headerText, this.m_header, this.m_body, this.m_buttons];
    }
    
    this.f_headerText = function()
    {
        return this.f_createHtmlDiv('<span class="v_label_bold">' + g_lang.m_lanip_reserved_ip + '</span>');
    }
    
    this.f_createTableHeader = function()
    {
        this.m_header = this.f_createGridHeader(this.m_hdcolumns, 'f_confNwLANipGridHeaderOnclick');
    }
    
    this.f_createHdColumns = function()
    {
        this.f_colorGridBackgroundRow(true);
        var cols = [];
        var chkbox = g_lang.m_enabled + '<br>' +
        thisObj.f_renderCheckbox('no', thisObj.m_prefix + 'enable_cb', this.m_handleClickCbFunction + "('" + thisObj.m_objectId + "," + thisObj.m_prefix + "enable_cb')", 'tooltip');
        
        cols[0] = this.f_createColumn(g_lang.m_ipAddr, this.m_textWidth, 'textField', '10',true, 'center');
        cols[1] = this.f_createColumn(g_lang.m_macAddr, this.m_textWidth, 'textField', '10',true, 'center');
        cols[2] = this.f_createColumn(chkbox, 70, 'checkbox', '28');
        cols[3] = this.f_createColumn(g_lang.m_delete + '<br>', 70, 'image', '28');
        //cols[4] = this.f_createColumn('',0,'hidden','28');
        
        return cols;
    }
    
    this.f_getContentPane = function()
    {
        var div = this.f_getPanelDiv(this.f_init());
        return div;
    }
    
    this.f_attachEventListener = function()
    {
    }
    this.f_detachEventListener = function()
    {
    }
    
    this.f_stopLoadVMData = function()
    {
    
    }
    
    this.f_enableAll = function()
    {
        var cb = document.getElementById(this.m_prefix + 'enable_cb');
        var s = this.m_prefix + 'cb_';
        
        for (var i = 0; i < this.m_rowIdArray.length; i++) {
            var seedId = this.f_getSeedIdByRowId(this.m_rowIdArray[i]);
            var el = document.getElementById(s + seedId);
            
            if (el != null) {
                el.checked = cb.checked;
            }
        }
    }
    
    this.f_getSeedIdByRowId = function(rowId)
    {
        var prefix = this.m_prefix + 'row_';
        return rowId.substring(prefix.length, rowId.length);
    }
    
    this.f_addRow = function()
    {
        var prefix = this.m_prefix;
        var rowId = prefix + 'row_' + this.m_cnt;
        var eventIp = ["", this.m_handleKeyEventCbFunction + "('" + this.m_objectId + "," + prefix + 'ip_' + this.m_cnt + "," + "keyDown," + rowId + "')"];
        var eventMac = ["", this.m_handleKeyEventCbFunction + "('" + this.m_objectId + "," + prefix + 'mac_' + this.m_cnt + "," + "keyDown," + rowId + "')"];
        this.m_rowIdArray.push(rowId);
        var ip = this.f_renderTextField(prefix + 'ip_' + this.m_cnt, '', '', this.m_textWidth - 20, eventIp);
        var mac = this.f_renderTextField(prefix + 'mac_' + this.m_cnt, '', '', this.m_textWidth - 20, eventMac);
        var a = [{
            id: prefix + 'cb_add_' + this.m_cnt,
            value: 'checked',
            hidden: true
        }, {
            id: prefix + 'cb_' + this.m_cnt,
            value: 'checked',
            hidden: false,
            cb: thisObj.m_handleClickCbFunction + "('" + this.m_objectId + "," + this.m_cbGroupId + "," + rowId + "')",
            tooltip: '',
            readonly: false
        }, {
            id: prefix + 'cb_change_' + this.m_cnt,
            value: '',
            hidden: true
        }];
        var cb = this.f_renderCheckboxArray(a);
        var del = this.f_renderButton('delete', true, thisObj.m_handleClickCbFunction + "('" +
        this.m_objectId +
        "," +
        this.m_btnDeleteId +
        "," +
        rowId +
        "')", 'delete row');
        //var ctrlCb = this.f_renderHiddenCheckbox(a);		
        //var data = [ip, mac, cb, del, ctrlCb];
        var data = [ip, mac, cb, del];
        var bodyDiv = this.f_createGridRow(this.m_hdcolumns, data, 28, rowId);
        
        this.m_body.appendChild(bodyDiv);
        this.m_cnt++;
    }
        
	this.f_sort = function(a,b)
	{
		var ap = a.m_ip.trim();
		var bp = b.m_ip.trim();

        if (thisObj.m_sortCol == 1) {
			ap = a.m_mac.trim();
			bp = b.m_mac.trim();
		}
		(ap.trim().length <= 0) ? (ap = '1' + ap) : (ap = '0' + ap);
		(bp.trim().length <= 0) ? (bp = '1' + bp) : (bp = '0' + bp);

		if (thisObj.m_sortOrder == 'asc') {
			return ap.cmp(bp);
		} else {
			return bp.cmp(ap);
		}
	}		

	this.f_handleColumnSorting = function(column) 
	{
        if(this.f_isSortEnabled(this.m_hdcolumns, column)) {	//f_isSortEnabled assign the m_sortOrder, m_sortCol		
			var a = new Array();
			for (var i=0; i < this.m_rowIdArray.length; i++) {
				var seedId = this.f_getSeedIdByRowId(this.m_rowIdArray[i]);
                var cb = document.getElementById(this.m_prefix + 'cb_' + seedId);
                var cbAdd = document.getElementById(this.m_prefix + 'cb_add_' + seedId);
                var cbChange = document.getElementById(this.m_prefix + 'cb_change_' + seedId);							
                var ip = document.getElementById(this.m_prefix + 'ip_' + seedId);	
				var mac = document.getElementById(this.m_prefix + 'mac_' + seedId);
				var cbValue = (cb.checked) ? 'true' : 'false';
				var cbAddValue = (cbAdd.checked) ? 'checked' : '';
				var cbChangeValue = (cbChange.checked) ? 'checked' : '';
				var tagName = this.m_tagNameArray[seedId];
				if ((tagName == undefined) || (tagName == null)) {
					tagName = '';
				}
                var o = new UTM_nwDHCPmapRecord(tagName, ip.value, mac.value, cbValue);
				o.f_setGuiParams(cbAddValue, cbChangeValue);	
				a.push(o);
			}
			var dhcpMap = new UTM_nwDHCPmap(thisObj.m_ifName, a);
			this.f_cleanup();
            thisObj.m_sortCol = column;
			this.f_populateTable(dhcpMap);			
			this.f_setSortOnColPerformed(column, column);		
		}
		
	}
			
    this.f_populateTable = function(dhcpMap)
    {           
	    var a = dhcpMap.m_dhcpMapList;
		if ((a == undefined) || (a==null)) {
			return;
		}

        a.sort(this.f_sort);

        for (var i = 0; i < a.length; i++) {
            var prefix = this.m_prefix;
            var rowId = prefix + 'row_' + this.m_cnt;
            var eventIp = ["", this.m_handleKeyEventCbFunction + "('" + this.m_objectId + "," + prefix + 'ip_' + this.m_cnt + "," + "keyDown," + rowId + "')"];
            var eventMac = ["", this.m_handleKeyEventCbFunction + "('" + this.m_objectId + "," + prefix + 'mac_' + this.m_cnt + "," + "keyDown," + rowId + "')"];			
            this.m_rowIdArray.push(rowId);
			if (a[i].m_name.trim().length > 0) {
				this.m_tagNameArray[this.m_cnt] = a[i].m_name;
			}
            var ip = this.f_renderTextField(prefix + 'ip_' + this.m_cnt, a[i].m_ip, '', this.m_textWidth - 20, eventIp);
            var mac = this.f_renderTextField(prefix + 'mac_' + this.m_cnt, a[i].m_mac, '', this.m_textWidth - 20, eventMac);			
			var enable = 'checked';
			if (a[i].m_enable=='false') {
				enable = '';
			}
			
            var cbArr = [{
                id: prefix + 'cb_add_' + this.m_cnt,
                value: a[i].m_guiAdd,
                hidden: true
            }, {
                id: prefix + 'cb_' + this.m_cnt,
                value: enable,
                hidden: false,
                cb: thisObj.m_handleClickCbFunction + "('" + this.m_objectId + "," + this.m_cbGroupId + "," + rowId + "')",
                tooltip: '',
                readonly: false
            }, {
                id: prefix + 'cb_change_' + this.m_cnt,
                value: a[i].m_guiChange,
                hidden: true
            }];			
			
            var cb = this.f_renderCheckboxArray(cbArr);
			
            var del = this.f_renderButton('delete', true, thisObj.m_handleClickCbFunction + "('" +
                          this.m_objectId +
                          "," +
                          this.m_btnDeleteId +
                          "," +
                          rowId +
                          "')", 'delete row');			
			
            var data = [ip, mac, cb, del];
            var bodyDiv = this.f_createGridRow(this.m_hdcolumns, data, 28, rowId);			
            this.m_body.appendChild(bodyDiv);
            this.m_cnt++;
        }
    }	
	
    this.f_rowIdArrayRemoveRow = function(rowId)
    {
        var i = this.m_rowIdArray.indexOf(rowId);
        if (i >= 0) {
            this.m_rowIdArray.splice(i, 1);
        }
    }
    
    this.f_tagNameArrayRemoveRow = function(seedId)
    {
        delete thisObj.m_tagNameArray[seedId];
    }
    
    this.f_deleteRow = function(rowId)
    {
        var prefix = this.m_prefix + 'row_';
        var row = document.getElementById(rowId);
        
        if (row != null) {
            var seedId = this.f_getSeedIdByRowId(rowId);
            var cbAdd = document.getElementById(this.m_prefix + 'cb_add_' + seedId);
            
			var tagName = thisObj.m_tagNameArray[seedId];
			var ip = document.getElementById(this.m_prefix + 'ip_' + seedId).value;
			var mac = document.getElementById(this.m_prefix + 'mac_' + seedId).value;
			var enableCb = document.getElementById(this.m_prefix + 'cb_' + seedId);
			var enable = 'true';
			if (!enableCb.checked) {
				enable = 'false';
			}
			
            if (!cbAdd.checked) {
                //need to send delete command to the server.
                 var dhcpMapList = new Array();
                 var mapObj = new UTM_nwDHCPmapRecord(tagName, ip, mac, enable);
				 mapObj.f_setAction('delete');
                 dhcpMapList.push(mapObj);
                 this.m_deletedRow = seedId;
				 var dhcpMap = new UTM_nwDHCPmap(thisObj.m_ifName, dhcpMapList)
                 g_utils.f_startWait();
                 this.f_setDhcpMap(dhcpMap, this.f_deleteRowCb);
                 return;
            } else {
                row.parentNode.removeChild(row);
                //this.f_tagNameArrayRemoveRow(seedId);
                this.f_rowIdArrayRemoveRow(prefix + seedId);
            }
        }
    }
    
	this.f_generateTagName = function(ip)
	{
		var i = thisObj.m_tagNameArray.indexOf(ip);
		if (i < 0) {
			return ip;
		}
        var j = 0;
	    while (i >= 0) {
			j++;
			i = thisObj.m_tagNameArray.indexOf(ip + '_' + j + '_');		
		}
		return (ip + '_' + j + '_');
	}
	
	this.f_canAdd = function()
	{
		if (this.m_rowIdArray.length < g_nwConfig.m_nwMaxDHCPresevedIP) {
			return true;
		}
		return false;
	}
	
	this.f_validate = function()
	{
		var ipArray = new Array();
		var macArray = new Array();
		
        var error = g_lang.m_formFixError + '<br>';
        var errorInner = '';
		var ipEmptyError = false;
		var macEmptyError = false;
      		
		for (var i=0; i < this.m_rowIdArray.length; i++) {
            var seedId = this.f_getSeedIdByRowId(this.m_rowIdArray[i]);
            var ip = document.getElementById(this.m_prefix + 'ip_' + seedId).value;
			var mac = document.getElementById(this.m_prefix + 'mac_' + seedId).value;		
			var cbAdd = document.getElementById(this.m_prefix + 'cb_add_' + seedId);
			ip = ip.trim();
			mac = mac.trim();
            if ((ip.length <=0) && (mac.length <= 0)) {
				if (!cbAdd.checked) {
					if (ip.length <= 0) {
						ipEmptyError = true;
					} else {
						macEmptyError = true;
					}
				}
			} else if (ip.length <= 0) {
				ipEmptyError = true;
			} else if (mac.length <= 0){
				macEmptyError = true;
			}
			if (ip.length > 0) {
				if (!f_validateIP(ip)) {
					errorInner += thisObj.f_createListItem(ip + ' ' + g_lang.m_formNotAValidIP);
				}
			    if (ipArray.indexOf(ip) >= 0) {
				    errorInner += thisObj.f_createListItem(g_lang.m_duplicate + ' ' + g_lang.m_ipAddr + ': ' + ip);
			    }
			    ipArray.push(ip);				
			}
			if (mac.length > 0) {
				if (!f_validateMac(mac)) {
					errorInner += thisObj.f_createListItem(mac + ' ' + g_lang.m_formNotAValidMac);
				}
				
				if (macArray.indexOf(mac) >= 0) {
					errorInner += thisObj.f_createListItem(g_lang.m_duplicate + ' ' + g_lang.m_macAddr + ': ' + mac);
				}
				macArray.push(mac);
			}
		}
		if (ipEmptyError) {
			errorInner += thisObj.f_createListItem(g_lang.m_ipAddr + ' ' + g_lang.m_formNoEmpty);			
		}
		if (macEmptyError) {
			errorInner += thisObj.f_createListItem(g_lang.m_macAddr + ' ' + g_lang.m_formNoEmpty);			
		}	
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
		if (!this.f_validate()) {
			return false;
		}
        var dhcpMapList = new Array();
        this.m_addedRow = new Array();
        this.m_updatedRow = new Array();
		
        for (var i = 0; i < this.m_rowIdArray.length; i++) {
            var seedId = this.f_getSeedIdByRowId(this.m_rowIdArray[i]);
            var ip = document.getElementById(this.m_prefix + 'ip_' + seedId);
			var mac = document.getElementById(this.m_prefix + 'mac_' + seedId);
            var cb = document.getElementById(this.m_prefix + 'cb_' + seedId);
            var cbAdd = document.getElementById(this.m_prefix + 'cb_add_' + seedId);
			var cbChange = document.getElementById(this.m_prefix + 'cb_change_' + seedId);
			var enable = 'true';
			if (!cb.checked) enable = 'false';
			
            if ((ip != undefined) && (ip != null) && (mac != undefined) && (mac != null)) {
                if (cbAdd.checked) { //add case
                    if ((ip.value.trim().length <= 0) || (mac.value.trim().length <= 0)) {
                        continue;
                    }
                    this.m_addedRow.push(seedId);					
					var tagName = thisObj.f_generateTagName(ip.value);								
                    this.m_tagNameArray[seedId] = tagName;										
                    var mapObj = new UTM_nwDHCPmapRecord(tagName, ip.value, mac.value, enable);					
					mapObj.f_setAction('add');
                    dhcpMapList.push(mapObj);
                } else {
                    if (cbChange.checked) {
                        this.m_updatedRow.push(seedId);
						var tagName = thisObj.m_tagNameArray[seedId];
                        var mapObj = new UTM_nwDHCPmapRecord(tagName, ip.value, mac.value, enable);
						mapObj.f_setAction('update');
						dhcpMapList.push(mapObj);
                    }
                }
            }
        }
        if (dhcpMapList.length > 0) {
			var dhcpMap = new UTM_nwDHCPmap(thisObj.m_ifName, dhcpMapList)
            g_utils.f_startWait();
            this.f_setDhcpMap(dhcpMap, this.f_applyCb);
        } else {
			thisObj.f_enableAllButton(false);
		}     
    }
    
    this.f_reset = function()
    {
        this.f_loadVMData();
    }
    
    this.f_enableAllButton = function(state)
    {
        this.f_enabledDisableButton(this.m_btnApplyId, state);
        this.f_enabledDisableButton(this.m_btnCancelId, state);
    }
    
	
	
    this.f_handleClick = function(sourceId, userData)
    {
        if (sourceId == this.m_btnCancelId) {
            this.f_reset();
        } else if (sourceId == this.m_btnApplyId) {
            this.f_apply();
        } else if (sourceId == this.m_btnAddId) {
			if (this.f_canAdd()) {
				this.f_enableAllButton(true);
				this.f_addRow();
			} else {
                g_utils.f_popupMessage(g_lang.m_lanip_reserved_ip_limit + ' ' 
				    + g_nwConfig.m_nwMaxDHCPresevedIP + ' ' + g_lang.m_lanip_reserved_ip_entry, 'ok', g_lang.m_info, true);				
			}
        } else if (sourceId == this.m_prefix + 'enable_cb') {
            this.f_enableAll();
			this.f_setDirtyAll();
            this.f_enableAllButton(true);
        } else if (sourceId == this.m_btnDeleteId) {
            g_utils.f_popupMessage(g_lang.m_url_ezDeleteConfirm, 'confirm', g_lang.m_info, true, this.m_handleClickCbFunction + "('" + this.m_objectId + "," + this.m_btnDeleteConfirmId + "," + userData + "')");
        } else if (sourceId.indexOf(this.m_btnDeleteConfirmId) != -1) {
            this.f_deleteRow(userData);
        } else if (sourceId == this.m_cbGroupId) {
            this.f_enableAllButton(true);
            var seedId = thisObj.f_getSeedIdByRowId(userData);
			thisObj.f_setDirty(seedId);			
        }
    }
    
    this.f_cleanup = function()
    {
        this.m_row = 0;
        this.m_rowIdArray = new Array();
        this.m_tagNameArray = new Array();
        this.m_cnt = 0;
        this.m_dhcpMap = null;
        this.m_deletedRow = null;
        this.m_addedRow = null;
        this.m_updatedRow = null;
        
        this.f_removeDivChildren(this.m_div);
        this.f_removeDivChildren(this.m_body);
        this.f_removeDivChildren(this.m_header);
        this.f_createTableHeader();
        this.m_div.appendChild(this.m_headerText);
        this.m_div.appendChild(this.m_header);
        this.m_div.appendChild(this.m_body);
        this.m_div.appendChild(this.m_buttons);
    }
    
    this.f_handleKeyEvent = function(sourceId, eventType, userData)
    {
        if (eventType == 'keyDown') {
            thisObj.f_handleKeydown(sourceId, userData);
        }
    }
    
    this.f_handleKeydown = function(sourceId, userData)
    {
        var el = document.getElementById(sourceId);       
        this.f_enableAllButton(true);
		this.f_setDirty(thisObj.f_getSeedIdByRowId(userData));
    }
		
	this.f_setDirty = function(seedId)
	{
		var cbChange = document.getElementById(thisObj.m_prefix + 'cb_change_' + seedId);
		if (cbChange != null) {
			cbChange.checked = 'checked';
		}
	}
	
	this.f_setDirtyAll = function()
	{
        for (var i = 0; i < thisObj.m_rowIdArray.length; i++) {
			var seedId = thisObj.f_getSeedIdByRowId(thisObj.m_rowIdArray[i]);
			thisObj.f_setDirty(seedId);
		}		
	}
    
    this.f_setDhcpMap = function(dhcpMap, cb)
    {
        g_busObj.f_setDhcpMap(dhcpMap, cb);
    }
    
    this.f_getDhcpMap = function(cb)
    {
        g_busObj.f_getDhcpMap(thisObj.m_ifName, cb);
    }
    
    this.f_loadVMData = function(divElement, parentReference)
    {
        var p = parentReference;
        thisObj.f_cleanup();
		
        var cb = function(evt)
        {
            if (evt != undefined && evt.m_objName == 'UTM_eventObj') {
                if (evt.f_isError()) {
                    g_utils.f_popupMessage(evt.m_errMsg, 'error', g_lang.m_error, true);
                    return;
                }
                thisObj.m_dhcpMap = evt.m_value;
                thisObj.f_populateTable(thisObj.m_dhcpMap);
				thisObj.f_setSortOnColPerformed(0, 0);						
				if (thisObj.f_canAdd()) {
					thisObj.f_addRow();
				}
            }
			if ((p != undefined) && (p != null)) 
			    p.f_loadVMDataCb();
        };
        this.f_getDhcpMap(cb);
        this.f_enableAllButton(false);
    }
    
    this.f_deleteRowCb = function(evt)
    {
        g_utils.f_stopWait();
        if (evt != undefined && evt.m_objName == 'UTM_eventObj') {
            if (evt.f_isError()) {
                g_utils.f_popupMessage(evt.m_errMsg, 'error', g_lang.m_error, true);
                return;
            }
            var id = thisObj.m_prefix + 'row_' + thisObj.m_deletedRow;
            var row = document.getElementById(id);
            row.parentNode.removeChild(row);
            thisObj.f_rowIdArrayRemoveRow(id);
			thisObj.f_tagNameArrayRemoveRow(thisObj.m_deletedRow);
            //thisObj.f_adjust();
        }
    }
    
    this.f_applyCb = function(evt)
    {
        g_utils.f_stopWait();
        
        if (evt != undefined && evt.m_objName == 'UTM_eventObj') {
            if (evt.f_isError()) {
                g_utils.f_popupMessage(evt.m_errMsg, 'error', g_lang.m_error, true);
                return;
            } else {
                for (var i = 0; i < thisObj.m_addedRow.length; i++) {
                    var seedId = thisObj.m_addedRow[i];
                    var rowId = thisObj.m_prefix + 'row_' + seedId;
                    var cbAdd = document.getElementById(thisObj.m_prefix + 'cb_add_' + seedId);
                    var cbChange = document.getElementById(thisObj.m_prefix + 'cb_change_' + seedId);					
                    cbAdd.checked = '';
					cbChange.checked = '';
                }
                for (var i = 0; i < thisObj.m_updatedRow.length; i++) {
                    var seedId = thisObj.m_updatedRow[i];
                    var rowId = thisObj.m_prefix + 'row_' + seedId;
                    var cbAdd = document.getElementById(thisObj.m_prefix + 'cb_add_' + seedId);
                    var cbChange = document.getElementById(thisObj.m_prefix + 'cb_change_' + seedId);
                    cbAdd.checked = '';
					cbChange.checked = '';
                }
                thisObj.f_enableAllButton(false);
            }
        }
    }
}

UTM_extend(UTM_confNwLANip, UTM_confBaseObjExt);

function f_confNwLANipHandleClickCb(arg)
{
    if (arg) {
        var a = arg.split(",");
        var childId = a[0];
        var sourceId = (a.length > 1) ? a[1] : null;
        var userData = (a.length > 2) ? a[2] : null;
        g_configPanelObj.m_activeObj.f_handleClick(childId, sourceId, userData);
    }
}

function f_confNwLANipGridHeaderOnclick(column)
{
	g_configPanelObj.m_activeObj.f_handleColumnSorting('conf_lan_ip', column);	
}

function f_confNwLANipHandleKeyEventCb(arg)
{
    if (arg) {
        var a = arg.split(",");
        var childId = a[0];
        var sourceId = (a.length > 1) ? a[1] : null;
        var eventType = (a.length > 2) ? a[2] : null;
        var userData = (a.length > 3) ? a[3] : null;
        g_configPanelObj.m_activeObj.f_handleKeyEvent(childId, sourceId, eventType, userData);
    }
}


