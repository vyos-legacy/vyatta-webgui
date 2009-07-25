/*
 Document   : ft_confBLB.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function FT_confBLB(name, callback, busLayer)
{
    var thisObjName = 'ft_confBLB';
	var thisObj = this;
	this.m_form = undefined;
	this.m_blb = undefined;
    
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confBLB.superclass.constructor(name, callback, busLayer);
    }
    
    this.constructor(name, callback, busLayer);
    
    
    this.f_init = function()
    {
        this.f_setConfig({
            id: 'conf_blb',
            items: [{
                v_type: 'html',
                id: 'conf_blb_standalone',
                size: '30',
                text: '<input type="radio" id="conf_blb_standalone" name="blb_group" value="standalone" checked>&nbsp;' + 
				      g_lang.m_blbStandAloneOA,
                v_new_row: 'true',
                v_end_row: 'true'
            }, {
                v_type: 'empty',
                v_new_row: 'true',
                v_end_row: 'true'
            }, {
                v_type: 'html',
                id: 'conf_blb_association',
                size: '30',
                text: '<input type="radio" id="conf_blb_association" name="blb_group" value="association">&nbsp;' + 
				      g_lang.m_blbAssociation,
                v_new_row: 'true',
                v_end_row: 'true'
            }],
            buttons: [{
                id: 'conf_blb_apply_button',
                text: 'Apply',
				tooltip: g_lang.m_tooltip_apply,
                onclick: this.f_handleClick
            }, {
                id: 'conf_blb_cancel_button',
                text: 'Cancel',
				tooltip: g_lang.m_tooltip_cancel,
                onclick: this.f_handleClick
            }]
        })
    }
    
    this.f_loadVMData = function(element)
    {
        this.m_form = document.getElementById('conf_blb_form');
		
		var cb = function(evt)
        {
            if(evt != undefined && evt.m_objName == 'FT_eventObj')
            {
		        if (evt.f_isError()) {
					g_utils.f_popupMessage(evt.m_errMsg, 'ok', g_lang.m_error, true);
					return;
				}					
                thisObj.m_blb = evt.m_value;
                if(thisObj.m_blb == undefined)  
				    return;
					
				if (thisObj.m_blb.m_type == 'standalone') {
		            thisObj.m_form.conf_blb_standalone.checked = true;
					thisObj.m_form.conf_blb_association.checked = false;
				} else {
		            thisObj.m_form.conf_blb_standalone.checked = false;
					thisObj.m_form.conf_blb_association.checked = true;					
				}										
            }
        }
        thisObj.m_busLayer.f_getOAConfig(cb, 'blb');				
    }
		
    this.f_stopLoadVMData = function()
    {
    }
    
    this.f_reset = function()
    {
        thisObj.f_loadVMData();   
    }
    
    this.f_apply = function()
    {
        if (thisObj.m_form.conf_blb_standalone.checked == true) {
            thisObj.f_applyStandAlone();
        } else {
            thisObj.f_applyAssociation();
        }
    }
	
	this.f_applyStandAlone = function()
	{
        thisObj.m_blb.m_type = 'standalone';
		thisObj.m_blb.m_username = 'installer';
		thisObj.m_blb.m_passwd = '';
			
        var cb = function(evt) {
		    if (evt.f_isError()) {
		        g_utils.f_popupMessage(evt.m_errMsg, 'ok', g_lang.m_error, true);			    
		    } else {
                g_utils.f_popupMessage(g_lang.m_menuBLBAssocication +  ' ' + g_lang.m_formSave,   'ok', g_lang.m_menuBLBAssocication,true);
		    }			
		}	
		thisObj.m_busLayer.f_setOAConfig(cb, thisObj.m_blb);	
		
	}
	
	this.f_applyAssociation = function()
	{
		thisObj.m_blb.m_type = 'association';
		thisObj.m_blb.m_username = 'installer';
        g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_BLB_CHECK_ID, thisObj.m_blb);			
	}
    
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_blb_apply_button') { //apply clicked
                thisObj.f_apply();
            } else if (id == 'conf_blb_cancel_button') { //cancel clicked
                thisObj.f_reset();
            }
        }
    }
	
    this.f_handleKeydown = function(e)
    {
        if(e.keyCode != 13)	{
			return;
		}	
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_blb_cancel_button') { //cancel clicked
                thisObj.f_reset();
				return false;
            }
        }
    }	
    
}

FT_extend(FT_confBLB, FT_confFormObj);
