/*
 Document   : utm_confDNS.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description: DNS config
 */
function UTM_confDNS(name, callback, busLayer)
{
	var thisObjName = 'UTM_confDNS';
	var thisObj = this;
	this.m_div = undefined;
	this.m_id = undefined;

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
        UTM_confDNS.superclass.constructor(name, callback, busLayer);
    }
    
    this.privateConstructor(name, callback, busLayer);	

    var thisObjName = 'UTM_confDNS';
    var thisObj = this;
    this.m_form = undefined;
	
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
        UTM_confDNS.superclass.constructor(name, callback, busLayer);
    }
    
    this.privateConstructor(name, callback, busLayer);
    
    this.f_init = function()
    {
        this.f_setConfig({
            id: 'conf_dns',
			width: '550',
            items: [{
                v_type: 'label',
                text: g_lang.m_dns_setServer,
                v_new_row: 'true',
                v_end_row: 'true'
            }, EMPTY_ROW, {
                v_type: 'html',
                id: 'conf_dns_autoDhcp',
                text: '<input id="conf_dns_auto" type="radio" name="dns_options" value="auto" checked>&nbsp;' + g_lang.m_dns_autoDhcp,
                padding: '30px',
				colspan: '2',
                v_new_row: 'true',
                v_end_row: 'true'
            }, {
                v_type: 'html',
                id: 'conf_dns_manual',
                padding: '30px',
                text: '<input id="conf_dns_manual" type="radio" name="dns_options" value="manual">&nbsp;' + g_lang.m_dns_manual,
				colspan: '2',
				v_new_row: 'true',
                v_end_row: 'true'
            }, {
                v_type: 'label',
                text: g_lang.m_dns_Primary + ' ' + g_lang.m_dns,
                v_new_row: 'true',
                padding: '60px'
            }, {
				v_type: 'text',
				id : 'conf_dns_primary',				
				size: '32',
				v_end_row: 'true'
			},{
                v_type: 'label',
                text: g_lang.m_dns_Secondary + ' ' + g_lang.m_dns,
                v_new_row: 'true',
                padding: '60px'
            }, {
				v_type: 'text',
				id : 'conf_dns_secondary',				
				size: '32',
				v_end_row: 'true'
			}],
            buttons: [{
                id: 'conf_dns_apply_button',
                align: 'right',
                text: 'Apply',
				tooltip: g_lang.m_tooltip_apply,
                onclick: this.f_handleClick
            }, {
                id: 'conf_dns_cancel_button',
                align: 'right',
                text: 'Cancel',
				tooltip: g_lang.m_tooltip_cancel,				
                onclick: this.f_handleClick
            }]
        })
    }
    
	this.f_enableAllButton = function(state)
	{
		thisObj.f_enableButton('apply',state);
		thisObj.f_enableButton('cancel',state);
	}
	
	this.f_enableButton = function(btName, state)
	{
		var id ='';
		switch (btName.toLowerCase()) {
			case 'apply' :
			    id = 'conf_dns_apply_button';
				break;
			case 'cancel' :
			    id = 'conf_dns_cancel_button';
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
	
	this.f_enableManual = function(state)
	{
		var a = ['conf_dns_primary', 'conf_dns_secondary'];
		for (var i=0; i < a.length; i++) {
			thisObj.f_enableTextField(state, a[i]);
		}
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
        var txt = g_lang.m_dns_header  + '.<br>';
        
        return this.f_createGeneralDiv(txt);
    }
    
	this.f_reload = function()
	{
		thisObj.f_enableAllButton(false);
				
		var cb = function(evt)
        {        
            if (evt != undefined && evt.m_objName == 'UTM_eventObj') {            
                if (evt.f_isError()) {                
                    g_utils.f_popupMessage(evt.m_errMsg, 'ok', g_lang.m_error, true);  
                    return;                    
                }                
                //thisObj.f_setValue(evt.m_value);     
            }                                 
        };      
		
	    //g_busObj.f_getUrlFilterConfig(cb);
	}
	
	this.f_setValue = function()
	{

	}
	
    this.f_loadVMData = function(element)
    {		
        thisObj.f_attachListener();
        thisObj.m_form = document.getElementById('conf_dns_form');
        thisObj.f_setFocus();
        thisObj.f_resize();                
        thisObj.f_reload();
    }
    
    this.f_attachListener = function()
    {
		var a1 = ['conf_dns_auto', 'conf_dns_manual'];
		var a2 = ['conf_dns_primary', 'conf_dns_secondary'];
		
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
		var a1 = ['conf_dns_auto', 'conf_dns_manual'];
		var a2 = ['conf_dns_primary', 'conf_dns_secondary'];
				
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
    }
	
    this.f_apply = function()
    {			
		//g_utils.f_startWait();
		
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
		   
		
		//g_busObj.f_setUrlFilterConfig(thisObj.m_ufcObj, cb);		
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
			case 'conf_dns_auto':
			    thisObj.f_enableManual(false);
				thisObj.f_enableAllButton(true);
				break;			
			case 'conf_dns_manual':
			    thisObj.f_enableManual(true);
				thisObj.f_enableAllButton(true);
				break;
			case 'conf_dns_primary':
			case 'conf_dns_secondary':
			    thisObj.f_enableAllButton(true);
            case 'conf_dns_apply_button': //apply clicked
                thisObj.f_apply();
                break;
            case 'conf_dns_cancel_button': //cancel clicked
                thisObj.f_reload();
                break;
				
        }
        return false;
    }
    
}

UTM_extend(UTM_confDNS, UTM_confFormObj);

