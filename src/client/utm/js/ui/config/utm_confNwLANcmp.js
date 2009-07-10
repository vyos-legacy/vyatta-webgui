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
    
    this.f_reload = function()
    {		
        thisObj.f_enableAllButton(false);
        /*
        var cb = function(evt)
        {
            if (evt != undefined && evt.m_objName == 'UTM_eventObj') {
                if (evt.f_isError()) {
                    g_utils.f_popupMessage(evt.m_errMsg, 'ok', g_lang.m_error, true);
                    return;
                }
                thisObj.m_dnsObj = evt.m_value;
                thisObj.f_setValue();
            }
        };
        
        g_busObj.f_getDNSConfig(cb);
        */
    }
    
    this.f_setValue = function()
    {
		/*
        if (thisObj.m_dnsObj.m_mode == 'auto') {
            thisObj.f_setMode('conf_dns_auto', true);
            thisObj.f_setMode('conf_dns_manual', false);
            thisObj.f_enableManual(false);
            thisObj.m_form.conf_dns_primary.value = '';
            thisObj.m_form.conf_dns_secondary.value = '';
        } else {
            thisObj.f_setMode('conf_dns_auto', false);
            thisObj.f_setMode('conf_dns_manual', true);
            thisObj.f_enableManual(true);
            thisObj.m_form.conf_dns_primary.value = thisObj.m_dnsObj.m_pri;
            thisObj.m_form.conf_dns_secondary.value = thisObj.m_dnsObj.m_sec;
        }
        */
    }
    
    this.f_loadVMData = function(element)
    {
        thisObj.m_form = document.getElementById('conf_lan_itf_form');
        thisObj.f_setFocus();
		thisObj.f_attachListener();
        thisObj.f_reload();
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
        if (!g_utils.f_validateNetmask(thisObj.m_form.conf_lan_itf_ip.value)) {
           errorInner += thisObj.f_createListItem(g_lang.m_lanitf_mask + ' ' + g_lang.m_formInvalid);
        }

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
	    /*      
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
        g_busObj.f_setDNSConfig(thisObj.m_dnsObj, cb);
        */
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
        var a = ['conf_lan_dhcp_range_start', 'conf_lan_dhcp_range_end',
		         'conf_lan_dhcp_dns_mode', 'conf_lan_dhcp_dns_pri',
				 'conf_lan_dhcp_dns_sec'];
        for (var i = 0; i < a.length; i++) {
            thisObj.f_enableTextField(state, a[i]);
        }
    }
    
    this.f_getContentPane = function()
    {
		thisObj.f_init();
        return thisObj.f_getForm();
    }
    
    this.f_reload = function()
    {
        thisObj.f_enableAllButton(false);
        /*
        var cb = function(evt)
        {
            if (evt != undefined && evt.m_objName == 'UTM_eventObj') {
                if (evt.f_isError()) {
                    g_utils.f_popupMessage(evt.m_errMsg, 'ok', g_lang.m_error, true);
                    return;
                }
                thisObj.m_dnsObj = evt.m_value;
                thisObj.f_setValue();
            }
        };        
        g_busObj.f_getDNSConfig(cb);
        */
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
		/*
        if (thisObj.m_dnsObj.m_mode == 'auto') {
            thisObj.f_setMode('conf_dns_auto', true);
            thisObj.f_setMode('conf_dns_manual', false);
            thisObj.f_enableManual(false);
            thisObj.m_form.conf_dns_primary.value = '';
            thisObj.m_form.conf_dns_secondary.value = '';
        } else {
            thisObj.f_setMode('conf_dns_auto', false);
            thisObj.f_setMode('conf_dns_manual', true);
            thisObj.f_enableManual(true);
            thisObj.m_form.conf_dns_primary.value = thisObj.m_dnsObj.m_pri;
            thisObj.m_form.conf_dns_secondary.value = thisObj.m_dnsObj.m_sec;
        }
        */
    }
    
    this.f_loadVMData = function(element)
    {
        thisObj.m_form = document.getElementById('conf_lan_dhcp_form');
        thisObj.f_setFocus();
		thisObj.f_attachListener();		
        thisObj.f_reload();
    }
    
    this.f_attachListener = function()
    {
        var a1 = ['conf_lan_dhcp_enable', 'conf_lan_dhcp_dns_mode'];
        var a2 = ['conf_lan_dhcp_range_start', 'conf_lan_dhcp_range_end',
		          'conf_lan_dhcp_dns_pri', 'conf_lan_dhcp_dns_sec'];
        
        for (var i = 0; i < a1.length; i++) {
            var el = document.getElementById(a1[i]);
            g_xbObj.f_xbAttachEventListener(el, 'click', thisObj.f_handleClick, false);
        }
        for (var i = 0; i < a2.length; i++) {
            var el = document.getElementById(a2[i]);
            g_xbObj.f_xbAttachEventListener(el, 'keydown', thisObj.f_handleClick, false);
        }
    }
    
    this.f_detachListener = function()
    {
        var a1 = ['conf_lan_dhcp_enable', 'conf_lan_dhcp_dns_mode'];
        var a2 = ['conf_lan_dhcp_range_start', 'conf_lan_dhcp_range_end',
		          'conf_lan_dhcp_dns_pri', 'conf_lan_dhcp_dns_sec'];
        
        for (var i = 0; i < a1.length; i++) {
            var el = document.getElementById(a1[i]);
            g_xbObj.f_xbDetachEventListener(el, 'click', thisObj.f_handleClick, false);
        }
        for (var i = 0; i < a2.length; i++) {
            var el = document.getElementById(a2[i]);
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
        
        if (!thisObj.m_form.conf_lan_dhcp_enable.checked) {
            return true;
        } 
        
        if (!thisObj.f_checkIP(thisObj.m_form.conf_lan_dhcp_range_start.value)) {
            errorInner += thisObj.f_createListItem(m_landhcp_range_start + ' ' + g_lang.m_formInvalid);
        }
        if (!thisObj.f_checkIP(thisObj.m_form.conf_lan_dhcp_range_end.value)) {
            errorInner += thisObj.f_createListItem(m_landhcp_range_end + ' ' + g_lang.m_formInvalid);
        }        
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
		/*        
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
        g_busObj.f_setDNSConfig(thisObj.m_dnsObj, cb);
        */
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
			case 'conf_lan_dhcp_dns_mode':
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
    this.thisObjName = 'UTM_confNwLANip';
    this.m_hdcolumns = undefined;	
	this.m_headerText = undefined;
	this.m_header = undefined;
    this.m_buttons = undefined;	
    this.m_body = undefined;
    this.m_row = 0;
	this.m_rowIdArray = new Array();	
    this.m_cnt = 0;
	this.m_entryList = null;
	this.m_deletedRow = null;
	this.m_addedRow = null;
	this.m_updatedRow = null;
	this.m_eventCbFunction = 'f_confNwLANipEventCallback';	
		
	this.m_prefix = 'conf_lan_ip_';			
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
	
    this.f_init = function()
    {
        this.m_hdcolumns = this.f_createHdColumns();
		this.m_headerText = this.f_headerText();
		this.f_createTableHeader();
        this.m_body = this.f_createGridView(this.m_hdcolumns, true);
		
        var btns = [['Add', this.m_eventCbFunction + "('" + this.m_btnAddId + "')", g_lang.m_tooltip_add, this.m_btnAddId, g_lang.m_imageDir + 'bt_add.gif', 'left'],
		            ['Cancel', this.m_eventCbFunction + "('" + this.m_btnCancelId + "')", g_lang.m_tooltip_cancel, this.m_btnCancelId, g_lang.m_imageDir + 'bt_cancel.gif', 'right'], 
		            ['Apply', this.m_eventCbFunction + "('" + this.m_btnApplyId + "')", g_lang.m_tooltip_apply, this.m_btnApplyId, g_lang.m_imageDir + 'bt_apply.gif', 'right']]; 
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
        thisObj.f_renderCheckbox('no', thisObj.m_prefix + 'enable_cb', this.m_eventCbFunction + "('" + thisObj.m_prefix + "enable_cb')", 'tooltip');
        
        cols[0] = this.f_createColumn(g_lang.m_ipAddr, this.m_textWidth, 'textField', '10', false, 'center');
        cols[1] = this.f_createColumn(g_lang.m_macAddr, this.m_textWidth, 'textField', '10', false, 'center');		
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
	
	this.f_attachEventListener = function() {}
	this.f_detachEventListener = function() {}
	
	this.f_loadVMData = function() 
	{
		
	}
	
	this.f_stopLoadVMData = function()
	{
		
	}
	
    this.f_enableAll = function()
    {
        var cb = document.getElementById(this.m_prefix + 'enable_cb');		
        var s = this.m_prefix + 'cb_';
		
		for (var i=0; i < this.m_rowIdArray.length; i++) {
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
		var eventIp = ["","f_confNwLANipKeydown('" + prefix+ 'ip_' + this.m_cnt + "')"];
		var eventMac = ["","f_confNwLANipKeydown('" + prefix+ 'mac_' + this.m_cnt + "')"];
		
        this.m_rowIdArray.push(rowId);
								
        var ip = this.f_renderTextField(prefix + 'ip_' + this.m_cnt, '', '', this.m_textWidth-20, eventIp);
        var mac = this.f_renderTextField(prefix + 'mac_' + this.m_cnt, '', '', this.m_textWidth-20, eventMac);		
		var a = [
                    {id: prefix + 'cb_add_' + this.m_cnt, value: 'checked', hidden: true}, 
                    {id: prefix + 'cb_' + this.m_cnt, value: 'checked', hidden: false, cb: thisObj.m_eventCbFunction + "('" + this.m_cbGroupId +"')", tooltip: '', readonly: false}, 					
		            {id: prefix + 'cb_change_' + this.m_cnt, value: 'checked', hidden: true}
				];		
        var cb = this.f_renderCheckboxArray(a);
        var del = this.f_renderButton('delete', true, thisObj.m_eventCbFunction + "('" +
            this.m_btnDeleteId + "','" + rowId +
        "')", 'delete row');
		//var ctrlCb = this.f_renderHiddenCheckbox(a);		
        //var data = [ip, mac, cb, del, ctrlCb];
        var data = [ip, mac, cb, del];		
        var bodyDiv = this.f_createGridRow(this.m_hdcolumns, data, 28, rowId);
        
        this.m_body.appendChild(bodyDiv);
        this.m_cnt++;
    }
	
	this.f_rowIdArrayRemoveRow = function(rowId)
	{
		var i = this.m_rowIdArray.indexOf(rowId);
		if (i >= 0) {
			this.m_rowIdArray.splice(i,1);
		}
	}
	
	this.f_deleteRow = function(rowId)
	{				
		var prefix = this.m_prefix + 'row_';
        var row = document.getElementById(rowId);
		
		if (row != null) {
			var seedId = this.f_getSeedIdByRowId(rowId);
			var cbAdd = document.getElementById(this.m_prefix + 'cb_add_' + seedId);
			
			if (!cbAdd.checked) {				
			    //need to send delete command to the server.
				/*
			    var entryList = new Array();
				var listObj = new UTM_urlFilterListObj(text.value);				
				entryList.push(listObj);
				this.m_deletedRow = seedId;
		        g_utils.f_startWait();				
				this.f_setEntryList(entryList, this.f_deleteRowCb);
				*/ 	
				return;
			} else {
				row.parentNode.removeChild(row);
				this.f_rowIdArrayRemoveRow(prefix + seedId);				
			}			
		}
	}	
	
    this.f_apply = function()
	{
		//doing dumb iteration for now.
		/*
		var entryList = new Array();
		this.m_addedRow = new Array();
		this.m_updatedRow = new Array();
				
		for (var i = 0; i < this.m_rowIdArray.length; i++) {
			var seedId = this.f_getSeedIdByRowId(this.m_rowIdArray[i]);
			var text = document.getElementById(this.m_prefix + 'addr_' + seedId);
			var cb = document.getElementById(this.m_prefix + 'cb_' + seedId);
			var cbHidden = document.getElementById(this.m_prefix + 'cb_hidden_' + seedId);
			
			if ((text != undefined) && (text != null)) {
				if (!text.disabled) {
					if (text.value.trim().length <= 0) {
						continue;
					}
					this.m_addedRow.push(seedId);
					
					var listObj = new UTM_urlFilterListObj(text.value);
					listObj.m_action = 'add';
					listObj.m_status = cb.checked;
					if (cb.checked) {
						listObj.m_status = true;
					} else {
						listObj.m_status = false;
					}
					entryList.push(listObj);
				} else {
					if (cb.checked != cbHidden.checked) {
					    var listObj = new UTM_urlFilterListObj(text.value);
						listObj.m_action = 'delete';
						listObj.m_status = cbHidden.checked;
						entryList.push(listObj);
						listObj = new UTM_urlFilterListObj(text.value);
						listObj.m_action = 'add';
						listObj.m_status = cb.checked;
						entryList.push(listObj);
						this.m_updatedRow.push(seedId);	
					}
				}
			}
		}
				
		if (entryList.length > 0) {
			g_utils.f_startWait();
			this.f_setEntryList(entryList, this.f_applyCb);
		}
		*/		
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

    this.f_handleClick = function(id, obj)
    {
        if (id == this.m_btnCancelId) {
            this.f_reset();
        } else if (id == this.m_btnApplyId) {
            this.f_apply();
        } else if (id == this.m_btnAddId) {
			this.f_enableAllButton(true);
            this.f_addRow();
        } else if (id == this.m_prefix + 'enable_cb') {
		    this.f_enableAll();	
			this.f_enableAllButton(true);
		} else if (id == this.m_btnDeleteId) {			
            g_utils.f_popupMessage(g_lang.m_url_ezDeleteConfirm, 'confirm', g_lang.m_info, true, 
			    this.m_eventCbFunction + "('" + this.m_btnDeleteConfirmId + ","  + obj + "')"); 
		} else if (id.indexOf(this.m_btnDeleteConfirmId) != -1) {
			var args = id.split(",");
			this.f_deleteRow(args[1]);
		} else if (id ==  this.m_cbGroupId) {
			this.f_enableAllButton(true);
		}
    }	

	this.f_cleanup = function()
	{
        this.m_row = 0;
		this.m_rowIdArray = new Array();		
        this.m_cnt = 0;
	    this.m_entryList = null;
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

    this.f_populateTable = function(a)
    {
		/*
        if (a != null) {
			a.sort(this.f_sort);
		
			for (var i = 0; i < a.length; i++) {
				var prefix = this.m_prefix;
				var rowId = prefix + 'row_' + this.m_cnt;
  		        this.m_rowIdArray.push(rowId);
				
				var enable = 'yes';
				if (!a[i].m_status) {
					enable = 'no';
				}
				var hiddenEnable = 'yes';
				if (!a[i].m_cbHidden) {
					hiddenEnable = 'no';
				}

                var events = ["","f_confUrlEzByListKeydown('" + prefix+ 'addr_' + this.m_cnt + "')"];

				var addr = this.f_renderTextField(prefix + 'addr_' + this.m_cnt, a[i].m_value, '', this.m_textWidth, events, a[i].m_readonly);
				var cb = this.f_renderSmartCheckbox(enable, prefix + 'cb_' + this.m_cnt,  
				                                    thisObj.m_eventCbFunction + "('" + this.m_cbGroupId +"')", '',
				                                    prefix + 'cb_hidden_' + this.m_cnt, hiddenEnable);
				var del = this.f_renderButton('delete', true, this.m_eventCbFunction + "('" +
				this.m_btnDeleteId +
				"','" +
				rowId +
				"')", 'delete row');
				var data = [addr, cb, del];
				var bodyDiv = this.f_createGridRow(this.m_hdcolumns, data, 28, rowId);
				this.m_body.appendChild(bodyDiv);
				this.m_cnt++;
			}
		}
        */
    }

    this.f_handleCheckboxClick = function(chkbox)
    {
    
    }

	this.f_handleKeydown = function(id)
	{
		var el = document.getElementById(id);
		if (!el.disabled) {
			this.f_enableAllButton(true);
		}
	}		
	
	this.f_setEntryList = function(entryList, cb)
	{
		//g_busObj.f_setKeywordList(entryList, cb); 	
	}
	
	this.f_getEntryList = function(cb)
	{
		//g_busObj.f_getKeywordList(cb);
	}	
	
    this.f_loadVMData = function()
    {			    
	    thisObj.f_cleanup();
		/*
        var cb = function(evt)
        {        
            if (evt != undefined && evt.m_objName == 'UTM_eventObj') {            
                if (evt.f_isError()) {                
                    g_utils.f_popupMessage(evt.m_errMsg, 'error', g_lang.m_error, true);  
                    return;                    
                }                
                thisObj.m_entryList = evt.m_value;    
                thisObj.f_populateTable(thisObj.m_entryList);     
                thisObj.m_sortCol = 0;
                thisObj.m_sortColPrev = 0;					
				thisObj.f_addRow();
                window.setTimeout(function(){thisObj.f_adjust();}, 10);										
                //thisObj.f_adjust();	
            }                                 
        };      
        this.f_getEntryList(cb);
        */
		this.f_enableAllButton(false);		
    }	

    this.f_deleteRowCb = function(evt)
    {
		/*
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
            thisObj.f_adjust();
        }
        */
    }

    this.f_applyCb = function(evt)
    {
		/*
		g_utils.f_stopWait();
				
        if (evt != undefined && evt.m_objName == 'UTM_eventObj') {
            if (evt.f_isError()) {
                g_utils.f_popupMessage(evt.m_errMsg, 'error', g_lang.m_error, true);
                thisObj.m_goBack = false;
                return;
            } else {
                for (var i = 0; i < thisObj.m_addedRow.length; i++) {
                    var seedId = thisObj.m_addedRow[i];
					var rowId = thisObj.m_prefix + 'row_' + seedId; 
                    var cb = document.getElementById(thisObj.m_prefix + 'cb_' + seedId);
                    var cbHidden = document.getElementById(thisObj.m_prefix + 'cb_hidden_' + seedId);
                    var url = document.getElementById(thisObj.m_prefix + 'addr_' + seedId);
                    cbHidden.checked = cb.checked;					
					url.disabled = true;
					url.style.backgroundColor = '#EFEFEF';
                }
                for (var i = 0; i < thisObj.m_updatedRow.length; i++) {
                    var seedId = thisObj.m_updatedRow[i];
					var rowId = thisObj.m_prefix + 'row_' + seedId; 
                    var cb = document.getElementById(thisObj.m_prefix + 'cb_' + seedId);
                    var cbHidden = document.getElementById(thisObj.m_prefix + 'cb_hidden_' + seedId);
                    cbHidden.checked = cb.checked;
                }
				thisObj.f_enableAllButton(false);				
            }
        }
        if (thisObj.m_goBack) {
			var f = function () {
			    g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_EASY_WEBF_ID);	
			}
            window.setTimeout(f,10);
        }
        */
    }			
}
UTM_extend(UTM_confNwLANip, UTM_confBaseObjExt);

function f_confNwLANipEventCallback(id, obj)
{
    g_configPanelObj.m_activeObj.f_handleClickLanIp(id, obj);
}

function f_confNwLANipGridHeaderOnclick(col)
{
}

function f_confNwLANipKeydown(id)
{
	g_configPanelObj.m_activeObj.f_handleKeydownLanIp(id);
}