/*
 Document   : ft_confTimeServer.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function FT_confTimeServer (name, callback, busLayer) {
    var thisObjName = 'FT_confTimeServer';
    var thisObj = this;
    this.m_form = undefined;
	
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confTimeServer.superclass.constructor(name, callback, busLayer);
    }

	this.constructor(name, callback, busLayer);
    	
    this.f_init = function()
    {
        this.f_setConfig( {
			id : 'conf_time_srv',
			items: [ {
				v_type: 'label',
				id: 'conf_time_srv_ntp_label',
				text: 'NTP server address',
				v_new_row: 'true'
			}, {
				v_type: 'text',
				id: 'conf_time_srv_ntp',
				size: '30',
				v_end_row: 'true'
			}],				
			buttons: [ {
				id: 'conf_time_server_apply_button',
				text: 'Apply',
				onclick: this.f_handleClick
			}, {
				id: 'conf_time_server_cancel_button',
				text: 'Cancel',
				onclick: this.f_handleClick
			}]
		})  
    }
	
    this.f_loadVMData = function(element)
    {
        thisObj.m_form = document.getElementById('conf_time_srv' + "_form");		
    }
    
    this.f_stopLoadVMData = function()
    {
    }
    
    this.f_validate = function()
    {
        var error = 'Please fix the following errors:<br>';
        var errorInner = '';
        
		if (thisObj.m_form.conf_time_srv_ntp.value.trim().length <= 0) {
			return true;
		}
        if (!thisObj.f_checkIP(thisObj.m_form.conf_time_srv_ntp.value)) {
            if (!thisObj.f_checkHostname(thisObj.m_form.conf_time_srv_ntp.value)) {
                errorInner += thisObj.f_createListItem('Time server address is invalid');
            }
        }
       
        if (errorInner.trim().length > 0) {
            error = error + '<ul style="padding-left:30px;">';
            error = error + errorInner + '</ul>';
            g_utils.f_popupMessage(error, 'error', 'Error!',true);
			return false;
        }
        return true;
    }	
	
    this.f_apply = function()
    {
        g_utils.f_popupMessage('Time server configuration saved.', 'ok', 'Time server configuration',true);
    }
    
    this.f_reset = function()
    {
    
    }	
	
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_time_server_apply_button') { //apply clicked
                if (!thisObj.f_validate()) {
					return false;
				} 
			    thisObj.f_apply();
            } else if (id == 'conf_time_server_cancel_button') { //cancel clicked
                thisObj.f_reset();            
            }
        }
    }	   
}

FT_extend(FT_confTimeServer, FT_confFormObj);