/*
 Document   : ft_confSchedUpdate.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function FT_confSchedUpdate (name, callback, busLayer) {
    var thisObjName = 'FT_confSchedUpdate';
    
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confSchedUpdate.superclass.constructor(name, callback, busLayer);
    }	

	this.constructor(name, callback, busLayer);
		
    this.f_init = function()
    {
        this.f_setConfig( {
			id : 'conf_sched_update',
			items: [ {
				v_type: 'label',
				id: 'conf_sched_update_label',
				text: 'Please schedule update for the following applications',			
				font_weight : 'bold',	
				colspan: '4',
				v_new_row : 'true'
			}, {
				v_type: 'empty',
				v_new_row: 'true',
				v_end_row: 'true'
			}, {
				v_type: 'html',
				id: 'conf_sched_update_app',
				padding : '30px',
				size: '30',
				text: '<div id="conf_sched_update_app></div>',
                v_new_row: 'true',
				v_end_row: 'true'
			}, {
				v_type: 'empty',
				v_new_row: 'true',
				v_end_row: 'true'
			}, {
				v_type: 'html',
				id: 'conf_sched_update_now',
				padding : '30px',				
				text: '<input type="radio" name="conf_sched_update_when" value="now" checked>&nbsp;Now',
				v_new_row: 'true',
				v_end_row: 'true'
			}, {
				v_type: 'empty',
				v_new_row: 'true',
				v_end_row: 'true'
			}, {
				v_type: 'html',
				id: 'conf_sched_update_later',
				padding : '30px',		
				text: '<input type="radio" name="conf_sched_update_when" value="later">&nbsp;Later',
				v_new_row: 'true'
			}, {
				v_type: 'text',
				id: 'conf_sched_update_cal_text',
				size: '12'
			}, {
				v_type: 'text',
				id: 'conf_sched_update_cal',
				no_left_margin: 'true',
				size: '8'
			}, {
				v_type: 'text',
				id: 'conf_sched_update_time',
				size: '10',
				no_left_margin: 'true',
				v_end_row: 'true'
			}],				
			buttons: [ {
				id: 'conf_sched_update_update_button',
				text: 'Update',
				onclick: this.f_handleClick
			}, {
				id: 'conf_sched_update_cancel_button',
				text: 'Cancel',
				onclick: this.f_handleClick
			}]
		})  
    }
	
    this.f_loadVMData = function(element)
    {
    }
    
    this.f_stopLoadVMData = function()
    {
    }
    
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_sched_update_update_button') { //update clicked
                alert('Schedule update update button clicked');
            } else if (id == 'conf_sched_update_cancel_button') { //cancel clicked
                g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_DASHBOARD_ID);           
            }
        }
    }	    
}

FT_extend(FT_confSchedUpdate, FT_confFormObj);