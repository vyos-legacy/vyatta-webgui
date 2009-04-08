/*
 Document   : ft_confSchedUpdate.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function FT_confSchedUpdate (name, callback, busLayer) {
    var thisObjName = 'FT_confSchedUpdate';
	var thisObj = this;
	this.m_vmList = undefined;
    this.m_form = undefined;
	this.m_date = undefined;
	this.m_transaction = undefined;
	this.m_response = undefined;
	this.m_lastCmd = undefined;
    
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
		
    this.f_init = function(vmIds)
    {
		if ((vmIds != undefined) && (vmIds != null)) {
			thisObj.m_vmList = new Array();
			for (var i = 0; i < vmIds.length; i++) {
				var vm = g_busObj.f_getVmRecByVmId(vmIds[i]);
				if ((vm != undefined) && (vm!=null)) {
					thisObj.m_vmList.push(vm);
				}				
			}
		}
        this.f_setConfig( {
			id : 'conf_sched_update',
			items: [ {
				v_type: 'label',
				id: 'conf_sched_update_label',
				text: g_lang.m_schedUpdateSched,			
				font_weight : 'bold',	
				colspan: '5',
				v_new_row : 'true'
			}, {
				v_type: 'empty',
				v_new_row: 'true',
				v_end_row: 'true'
			}, {
				v_type: 'html',
				id: 'conf_sched_update_app',
				padding : '30px',
				colspan: '5',
				text: '<div id="conf_sched_update_app"></div>',
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
				text: '<input type="radio" name="conf_sched_update_when" id="conf_sched_update_now" value="now" checked>&nbsp;' + g_lang.m_schedUpdateNow,
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
				text: '<input type="radio" name="conf_sched_update_when" id="conf_sched_update_later" value="later">&nbsp;' + g_lang.m_schedUpdateLater,
				v_new_row: 'true'
			}, {
				v_type: 'html',
				id: 'conf_sched_update_datetime',
				text: '<div id="conf_sched_update_datetime"></div>',
				colspan: '4',
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
	
	this.f_createDiv = function()
	{
		return (
			'<table>' +
				'<tbody>' +
					'<tr>' +
					    //'<td><input type="radio" name="conf_sched_update_when" id="conf_sched_update_later" value="later">&nbsp;Later</td>' +
						'<td><input id= "conf_sched_update_cal_text" type="text" size="8" class="v_form_input_no_left_margin"></td>' +
						'<td><img id= "conf_sched_update_cal" src="images/en/ico_calendar.gif"></td>' +
						'<td><input id = "conf_sched_update_hour" type="text" size="2" class="v_form_input_no_left_margin"></td>' +
						'<td><label>:</label></td>' +
						'<td><input id="conf_sched_update_minute" type="text" size="2" class="v_form_input_no_left_margin"></td>' +
						'<td><select id="conf_sched_update_ampm" size="1" class="v_form_input_no_left_margin"><option value="am">AM</option><option value="pm">PM</option></select></td>' +						
					'</tr>' +
				'</tbody>' +
			'</table>'
		)		
	}
	
	this.f_showUpdateVm = function()
	{
		var div = document.getElementById('conf_sched_update_app');
		var text = '';
		for (var i=0 ; i < thisObj.m_vmList.length; i++) {
			text += thisObj.f_createListItem(thisObj.m_vmList[i].m_displayName + 
			  '&nbsp;&nbsp;[' + g_lang.m_schedUpdateNewVer + ': ' + thisObj.m_vmList[i].m_needUpdate + ']');
		}
		div.innerHTML = text;
	}
	
    this.f_loadVMData = function()
    {
		thisObj.f_showUpdateVm();
        thisObj.m_form = document.getElementById('conf_sched_update' + "_form");	
		var div = document.getElementById('conf_sched_update_datetime');
		div.innerHTML = thisObj.f_createDiv();
		thisObj.f_enable(false);			
		thisObj.f_attachListener();		
    }
    
    this.f_stopLoadVMData = function()
    {
		thisObj.f_detachListener();
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
	
	this.f_enable = function(b)
	{
		thisObj.f_enableTextField(b,'conf_sched_update_cal_text');
        el = document.getElementById('conf_sched_update_cal');
		if (b) {
			el.src = 'images/en/ico_calendar.gif';
		} else {
			el.src = 'images/en/ico_calendar_disable.png';
		}		
        thisObj.f_enableTextField(b, 'conf_sched_update_hour');
        thisObj.f_enableTextField(b, 'conf_sched_update_minute');
		thisObj.f_enableTextField(b, 'conf_sched_update_ampm');
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
		if (thisObj.m_form.conf_sched_update_when[1].checked) {
			var el = document.getElementById('conf_sched_update_cal_text');
			g_calObj.f_show(el, e);
		}
	}
	
	this.f_validateRange = function()
	{
        var oneMinute = 60 * 1000  // milliseconds in a minute
        var oneHour = oneMinute * 60
        var oneDay = oneHour * 24
        var oneWeek = oneDay * 7
		var oneMonth = oneDay * 30;
		var sixMonth = oneMonth * 6;
		var oneYear = oneDay * 365;
		
		var d = new Date();
		d = d + sixMonth;
		if ((thisObj.m_date.getTime() - d.getTime()) > 0) {
			g_utils.f_popupMessage(g_lang.m_schedUpdateRangeChk, 'ok', g_lang.info, true);
		}
		
	}
		
	this.f_validate = function()
	{
        var error = g_lang.m_formFixError + '<br>';
        var errorInner = '';
        if (thisObj.m_form.conf_sched_update_now.checked == true) {
			return true;
		}
		var date = thisObj.m_form.conf_sched_update_cal_text.value.trim();
		if (!thisObj.f_checkDate(date)) {
            errorInner += thisObj.f_createListItem(g_lang.m_schedUpdateDate + ' ' + g_lang.m_formInvalid);
        }
		var hour = thisObj.m_form.conf_sched_update_hour.value.trim();
		if (!thisObj.f_checkHour(hour)) {
            errorInner += thisObj.f_createListItem(g_lang.m_schedUpdateHour + ' ' + g_lang.m_formInvalid);			
		}
		var mm = thisObj.m_form.conf_sched_update_minute.value.trim();
		if (!thisObj.f_checkMinute(mm)) {
            errorInner += thisObj.f_createListItem(g_lang.m_schedUpdateMinute + ' ' + g_lang.m_formInvalid);			
		}		
		       
		//check to see if it is greater than now.
		thisObj.m_date = thisObj.f_getUpdateTime();
//COMMENT OUT THE LOCAL TIME CHECKING.  LET THE SERVER DO IT.		
//		var  d = new Date();
//		var diff = d.getTime() - thisObj.m_date.getTime();
//		if (diff > 0) {
//			errorInner += thisObj.f_createListItem('You cannot schedule an update time in the past.')
//		}			   
			   
        if (errorInner.trim().length > 0) {
            error = error + '<ul style="padding-left:30px;">';
            error = error + errorInner + '</ul>';
            g_utils.f_popupMessage(error, 'error', g_lang.m_error, true);
			return false;
        }

        return true;		

	}	
	
	this.f_getUpdateTime = function()
	{
		var d = thisObj.m_form.conf_sched_update_cal_text.value.trim();
        var es = new RegExp("[.-]", "g"); //.
        d = d.replace(es, "/");						
		var date = new Date(d);
		var h = parseInt(thisObj.m_form.conf_sched_update_hour.value.trim());
		
		if (thisObj.m_form.conf_sched_update_ampm.value=='pm') {
			(h!=12)? h+=12 : h;
		} else {
			(h==12)? h=0: h; 
		}
		var m = parseInt(thisObj.m_form.conf_sched_update_minute.value.trim());
		date.setHours(h);
		date.setMinutes(m);
		date.setSeconds(0);
		return date;
	}
	
	this.f_formatTime = function()
	{
		var t = '';
		var h = ' ' + thisObj.m_date.getHours();
		var m = ' ' + thisObj.m_date.getMinutes();
		var d = ' ' + thisObj.m_date.getDate();
		var mo_plusOne = thisObj.m_date.getMonth() + 1;
		var mo = ' ' + mo_plusOne;
		var y = ' ' + thisObj.m_date.getFullYear();

		t += f_addZero(h.trim()) + ':' + 
		     f_addZero(m.trim()) + ' ' + 
		     f_addZero(d.trim()) + '.' + 
			 f_addZero(mo
			 .trim()) + '.' +
			 y.trim().substring(2,y.length);
		return t;
	}
    	
    this.f_processResponse = function()
	{
		if (thisObj.m_response.length <= 0) {
            g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_UPDATE_ID);	
			return;		
		}
		var error = g_lang.m_schedUpdateErrorOccur + '<br>';
        var errorInner = '';		
		for (var i=0; i < thisObj.m_response.length; i++) {
			errorInner += thisObj.f_createListItem(thisObj.m_response[i]);
		}
        if (errorInner.trim().length > 0) {
            error = error + '<ul style="padding-left:30px;">';
            error = error + errorInner + '</ul>';
            g_utils.f_popupMessage(error, 'error', g_lang.m_error,true);
        }		
	}
	
	this.f_upgradeVmCb = function(eventObj)
	{
        if (eventObj.f_isError()) {
			thisObj.m_response.push(thisObj.m_lastCmd + ' : ' + eventObj.m_errMsg);
		}             
		thisObj.f_processTransaction();	
	}
	
    this.f_processTransaction = function()
    {
        if (thisObj.m_transaction.length <= 0) {
            thisObj.f_processResponse();
        } else {
            var obj = thisObj.m_transaction.shift();
			thisObj.m_lastCmd = 'Upgrade: [' + obj.m_displayName + ', ' + obj.m_ver + ']'; 
			g_busObj.f_upgradeVm(obj.m_vm, obj.m_ver, obj.m_time, thisObj.f_upgradeVmCb);
        }
    }	
		
	this.f_schedule = function (time)
	{
		thisObj.m_transaction = new Array();
		thisObj.m_response = new Array();
        for (var i=0; i < thisObj.m_vmList.length; i++) {
			thisObj.m_transaction.push(new FT_vmUpgradeTransaction(thisObj.m_vmList[i].m_name,
			    thisObj.m_vmList[i].m_displayName,
			    thisObj.m_vmList[i].m_needUpdate, time));
		}
        
        if (thisObj.m_transaction.length > 0) {
            thisObj.f_processTransaction();
        }
	}	
		
	this.f_update = function()
	{	
	    var time = 'now';
        if (thisObj.m_form.conf_sched_update_later.checked == true) {
			time = thisObj.f_formatTime();
		}	    
		thisObj.f_schedule(time);
		/*
        var vm = new FT_vmRecObj('security', 'up', '50', '50', '50', 
		    '50', '50', 'dummy.html', ['version 1.3 corrupted', 'ver 1.1'], null);		
        g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_RESTORE_UPDATE_ID, vm);
        */				
	}
	
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_sched_update_update_button') { //update clicked
                if (!thisObj.f_validate()) {
					return false;
				}
                thisObj.f_update();
            } else if (id == 'conf_sched_update_cancel_button') { //cancel clicked
                g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_DASHBOARD_ID);           
            } else if (id == 'conf_sched_update_later') {
				thisObj.f_enable(true);
				thisObj.m_form.conf_sched_update_cal_text.focus();
			} else if (id == 'conf_sched_update_now') {
				thisObj.f_enable(false);
			} else if (id == 'conf_sched_update_cal') {				
				thisObj.f_showCal(e);
			}
        }
    }	    
}

FT_extend(FT_confSchedUpdate, FT_confFormObj);

function FT_vmUpgradeTransaction(vm, displayName, ver, time)
{
    this.m_vm = vm;
	this.m_displayName = displayName;
    this.m_ver = ver;
    this.m_time = time;
}
