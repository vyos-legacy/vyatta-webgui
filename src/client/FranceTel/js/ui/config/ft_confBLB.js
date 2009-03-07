/*
 Document   : ft_confBLB.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
FT_confBLB = Ext.extend(FT_confFormObj, {
    thisObjName: 'ft_confBLB',
    
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    constructor: function(name, callback, busLayer)
    {
        FT_confBLB.superclass.constructor(name, callback, busLayer);
    },	
		
    f_init: function()
    {
        this.f_setConfig( {
			id : 'conf_blb',
			items: [ {
				v_type: 'html',
				id: 'conf_blb_standalone',
				size: '30',
				text: '<input type="radio" name="blb_group" value="standalone" checked>&nbsp;Stand alone Open Appliance',
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
				text: '<input type="radio" name="blb_group" value="association">&nbsp;BLB association',
				v_new_row: 'true',
				v_end_row: 'true'
			}],				
			buttons: [ {
				id: 'conf_blb_apply_button',
				text: 'Apply',
				onclick: this.f_handleClick
			}, {
				id: 'conf_blb_cancel_button',
				text: 'Cancel',
				onclick: this.f_handleClick
			}]
		})  
    },
	
    f_loadVMData: function(element)
    {
    },
    
    f_stopLoadVMData: function()
    {
    },
    
    f_handleClick: function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_blb_apply_button') { //apply clicked
                alert('BLB apply button clicked');
            } else if (id == 'conf_blb_cancel_button') { //cancel clicked
                alert('BLB cancel button clicked');               
            }
        }
    }	
    
});
