/*
 Document   : ft_confSchedUpdate.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function FT_confSchedUpdate (name, callback, busLayer) {
    var thisObjName = 'FT_confSchedUpdate';
	var thisObj = this;
    
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
				text: '<input type="radio" name="conf_sched_update_when" id="conf_sched_update_now" value="now" checked>&nbsp;Now',
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
				text: '<input type="radio" name="conf_sched_update_when" id="conf_sched_update_later" value="later">&nbsp;Later',
				v_new_row: 'true'
			}, {
				v_type: 'text',
				id: 'conf_sched_update_cal_text',
				size: '12'
			}, {
				v_type: 'html',
				id: 'conf_sched_update_cal',
				text: '<img id="conf_sched_update_cal" src="images/ico_calendar.gif">',				
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
		thisObj.f_attachListener();
    }
    
    this.f_stopLoadVMData = function()
    {
		thisObj.f_detachListener();
    }
    
    this.f_attachListener = function()
    {
        var el = document.getElementById('conf_sched_update_later');
        g_xbObj.f_xbAttachEventListener(el, 'click', thisObj.f_handleClick, true);
		el = document.getElementById('conf_sched_update_now');
        g_xbObj.f_xbAttachEventListener(el, 'click', thisObj.f_handleClick, true);
        el = document.getElementById('conf_sched_update_cal');
        g_xbObj.f_xbAttachEventListener(el, 'click', thisObj.f_handleClick, true);		
    }
    
    this.f_detachListener = function()
    {
        var el = document.getElementById('conf_sched_update_later');
        g_xbObj.f_xbDetachEventListener(el, 'click', thisObj.f_handleClick, true);
		el = document.getElementById('conf_sched_update_now');
        g_xbObj.f_xbDetachEventListener(el, 'click', thisObj.f_handleClick, true);
        el = document.getElementById('conf_sched_update_cal');		
        g_xbObj.f_xbDetachEventListener(el, 'click', thisObj.f_handleClick, true);		
    }	
	
	this.f_showCal = function(e) 
	{
		var el = document.getElementById('conf_sched_update_cal_text');
		g_calObj.f_show(el,e);
	}
		
	this.f_update = function()
	{	
        var vm = new FT_vmRecObj('security', 'up', '50', '50', '50', 
		    '50', '50', 'dummy.html', ['version 1.3 corrupted', 'ver 1.1'], null);		
        g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_RESTORE_UPDATE_ID, vm);				
	}
	
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_sched_update_update_button') { //update clicked
                thisObj.f_update();
            } else if (id == 'conf_sched_update_cancel_button') { //cancel clicked
                g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_DASHBOARD_ID);           
            } else if (id == 'conf_sched_update_later') {
				
			} else if (id == 'conf_sched_update_now') {
				
			} else if (id == 'conf_sched_update_cal') {
				thisObj.f_showCal(e);
			}
        }
    }	    
}

FT_extend(FT_confSchedUpdate, FT_confFormObj);

