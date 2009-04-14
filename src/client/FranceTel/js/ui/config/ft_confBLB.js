/*
 Document   : ft_confBLB.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function FT_confBLB(name, callback, busLayer)
{
    var thisObjName = 'ft_confBLB';
	var  thisObj = this;
    
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
                text: '<input type="radio" name="blb_group" value="standalone" checked>&nbsp;' + 
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
                text: '<input type="radio" name="blb_group" value="association">&nbsp;' + 
				      g_lang.m_blbAssociation,
                v_new_row: 'true',
                v_end_row: 'true'
            }],
            buttons: [{
                id: 'conf_blb_apply_button',
                text: 'Apply',
                onclick: this.f_handleClick
            }, {
                id: 'conf_blb_cancel_button',
                text: 'Cancel',
                onclick: this.f_handleClick
            }]
        })
    }
    
    this.f_loadVMData = function(element)
    {
		var cb = function(evt)
        {
            if(evt != undefined && evt.m_objName == 'FT_eventObj')
            {
                var response = evt.m_value;
                if(response == undefined)  
				    return;
            }
        }
        //thisObj.m_busLayer.f_getOAConfig(cb, 'blb');				
    }
    
    this.f_stopLoadVMData = function()
    {
    }
    
    this.f_reset = function()
    {
       
    }
    
    this.f_apply = function()
    {
        var el = document.getElementById('blb_group');
        if (el.target_group[0].checked == true) {
            thisObj.f_applyStandAlone();
        } else {
            thisObj.f_applyAssociation();
        }
    }
	
	this.f_applyStandAlone = function()
	{
		
	}
	
	this.f_applyAssociation = function()
	{
        g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_BLB_CHECK_ID);			
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
