/*
 Document   : utm_confIDSEz.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description: URL filtering expert
 */
function UTM_confIDSEz(name, callback, busLayer)
{
	var thisObjName = 'UTM_confIDSEz';
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
        UTM_confIDSEz.superclass.constructor(name, callback, busLayer);
    }
    
    this.privateConstructor(name, callback, busLayer);	

    var thisObjName = 'UTM_confIDSEz';
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
        UTM_confIDSEz.superclass.constructor(name, callback, busLayer);
    }
    
    this.privateConstructor(name, callback, busLayer);
    
    this.f_init = function()
    {
        this.f_setConfig({
            id: 'conf_ids_ez',
			nofieldset: 'true',
            items: [{
                v_type: 'html',
                id: 'conf_ids_ez_enable',
                text: '<input id="conf_ids_ez_enable" type="checkbox" name="idp_enable" value="enable" checked>&nbsp;' + g_lang.m_ids_ezEnable,
                v_new_row: 'true',
                v_end_row: 'true'
            }],
            buttons: [{
                id: 'conf_ids_ez_cancel_button',
                align: 'left',
                text: 'Cancel',
				tooltip: g_lang.m_tooltip_cancel,				
                onclick: this.f_handleClick
            }, {
                id: 'conf_ids_ez_apply_button',
                align: 'left',
                text: 'Apply',
				tooltip: g_lang.m_tooltip_apply,
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
			    id = 'conf_ids_ez_apply_button';
				break;
			case 'cancel' :
			    id = 'conf_ids_ez_cancel_button';
				break;
			default:
			    break;
		}
        thisObj.f_enabledDisableButton(id, state);		
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
        var txt = '<br>';
        
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
                //thisObj.f_enableIDS(evt.m_value);     
            }                                 
        };      
		
	    //g_busObj.f_getUrlFilterConfig(cb);
	}
	
	this.f_enableIDS = function(state)
	{
		var el = document.getElementById('conf_ids_ez_enable');
		if (state) {
			el.checked = 'checked';
		} else {
			el.checked = '';
		}
	}
	
    this.f_loadVMData = function(element)
    {		
        thisObj.f_attachListener();
        thisObj.m_form = document.getElementById('conf_ids_ez_form');
        thisObj.f_setFocus();
        thisObj.f_resize();                
        thisObj.f_reload();
    }
    
    this.f_attachListener = function()
    {
	    var el = document.getElementById('conf_ids_ez_enable');
        g_xbObj.f_xbAttachEventListener(el, 'click', thisObj.f_handleClick, false);		 
    }
    
    this.f_detachListener = function()
    {
	    var el = document.getElementById('conf_ids_ez_enable');
        g_xbObj.f_xbDetachEventListener(el, 'click', thisObj.f_handleClick, false);								
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
			case 'conf_ids_ez_enable':
				thisObj.f_enableAllButton(true);
				break;			
            case 'conf_ids_ez_apply_button': //apply clicked
                thisObj.f_apply();
                break;
            case 'conf_ids_ez_cancel_button': //cancel clicked
                thisObj.f_reload();
                break;
				
        }
        return false;
    }
    
}

UTM_extend(UTM_confIDSEz, UTM_confFormObj);

