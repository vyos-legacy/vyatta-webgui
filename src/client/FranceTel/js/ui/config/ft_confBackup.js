/*
    Document   : ft_confBackup.js
    Created on : Mar 03, 2009, 6:18:51 PM
    Author     : Kevin.Choi, Loi.Vo
    Description:
*/

function FT_confBackup(name, callback, busLayer)
{
    this.thisObjName = 'FT_confBackup';
	this.m_vmName = [];
	var thisObj = this;
	this.m_bottom = undefined;

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confBackup.superclass.constructor(name, callback, busLayer);
    }
    this.constructor(name, callback, busLayer);

    this.f_getConfigurationPage = function()
    {
        var page = this.f_getNewPanelDiv(this.f_init());
        page.style.height = '360px';
        thisObj.f_attachEventListener();			
        return page;
    }

    this.f_createColumns = function()
    {
        var cols = [];
    
	    var config = '<input type="checkbox" id="conf_backup_config_checkall" name="config_checkall" value="config_checkall">&nbsp;Config.</input>';
	    var data = '<input type="checkbox" id="conf_backup_data_checkall" name="data_checkall" value="data_checkall">&nbsp;Data</input>';

        cols[0] = this.f_createColumn('Application', 250, 'text', '6');
        cols[1] = this.f_createColumn(config,120, 'checkbox', '32');		
        cols[2] = this.f_createColumn(data, 120, 'checkbox', '40');

        return cols;
    }
	
	this.f_attachEventListener = function()
	{
		var el = document.getElementById('conf_backup_config_checkall');
        g_xbObj.f_xbAttachEventListener(el, 'click', thisObj.f_handleClick, true);		
		el = document.getElementById('conf_backup_data_checkall');
        g_xbObj.f_xbAttachEventListener(el, 'click', thisObj.f_handleClick, true);							
	}
	
	this.f_detachEventListener = function()
	{
		var el = document.getElementById('conf_backup_config_checkall');
        g_xbObj.f_xbDetachEventListener(el, 'click', thisObj.f_handleClick, true);				
		el = document.getElementById('conf_backup_data_checkall');		
        g_xbObj.f_xbDetachEventListener(el, 'click', thisObj.f_handleClick, true);						
	}

    this.f_checkAll = function(target, value)
	{
        var s = 'conf_backup_' + target + '_cb';
		for (var i=0; i < thisObj.m_vmName.length; i++) {
	        var el = document.getElementById(s + '_' + thisObj.m_vmName[i]);
			el.checked = value;		
		}			
	}

    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_backup_config_checkall') { //config checkall clicked
                thisObj.f_checkAll('config', target.checked);
            } else if (id == 'conf_backup_data_checkall') { //data checkall clicked
                thisObj.f_checkAll('data', target.checked);
            } 
        }
    }
	
	this.f_reset = function()
	{
		thisObj.f_checkAll('config', false);
		thisObj.f_checkAll('data', false);
		var el = document.getElementById('conf_backup_config_checkall');
		el.checked = false;
        el = document.getElementById('conf_backup_data_checkall');
		el.checked = false;				
		el = document.getElementById('conf_backup_form');
        el.target_group[0].checked = false;
		el.target_group[1].checked = true;		
	}
	
	this.f_validate = function()
	{
		var s = 'conf_backup_config_cb';
		for (var i=0; i < thisObj.m_vmName.length; i++) {
	        var el = document.getElementById(s + '_' + thisObj.m_vmName[i]);
			if (el.checked == true) {
				return true;
			}	
		}
		s = 'conf_backup_data_cb';
		for (var i=0; i < thisObj.m_vmName.length; i++) {
	        var el = document.getElementById(s + '_' + thisObj.m_vmName[i]);
			if (el.checked == true) {
				return true;
			}	
		}
		       
        g_utils.f_popupMessage('Please select at least one application to backup', 'error', 'Error!');		
		
		return false;
	}
    
	//////////////////////////////////////////////////////////////////////////
	////////// TODO : NEED BACKEND SUPPORT
	////////////////////////////////////////////////////////////////////////// 
	this.f_overflow = function() 
	{
		//Hard code a value for now.  It will need backend support.
		return 1;
	}
	
	//////////////////////////////////////////////////////////////////////////
	////////// TODO : NEED BACKEND SUPPORT
	////////////////////////////////////////////////////////////////////////// 	
	this.f_pcBackup = function()
	{
		//need to define a mechanism to receive file from the backup.
		var url = 'test.zip';
		window.open(url, 'Download');
	}

	//////////////////////////////////////////////////////////////////////////
	////////// TODO : NEED BACKEND SUPPORT
	////////////////////////////////////////////////////////////////////////// 	
	this.f_oaBackup = function()
	{
		/** get the list of checked vm, and what check **/
//		var s = 'conf_backup_config_cb';
//		for (var i=0; i < thisObj.m_vmName.length; i++) {
//	        var el = document.getElementById(s + '_' + thisObj.m_vmName[i]);
//			if (el.checked == true) {
//				return true;
//			}	
//		}
//		s = 'conf_backup_data_cb';
//		for (var i=0; i < thisObj.m_vmName.length; i++) {
//	        var el = document.getElementById(s + '_' + thisObj.m_vmName[i]);
//			if (el.checked == true) {
//				return true;
//			}	
//		}
//		g_busObj.f_backup(vms, mode, guiCb);
	
        g_utils.f_popupMessage('Backup is in progress.  You will receive an email notification when the operation is finshed.', 'ok', 'Information');
	}
	
	this.f_backup = function()
	{
		if (!this.f_validate()) {			
			return;
		}
		
		var el = document.getElementById('conf_backup_form');
        if (el.target_group[0].checked == true) {
			thisObj.f_pcBackup();
			return;
		}
		
		var max = 3;		
		if (g_roleManagerObj.f_isInstaller()) {
			max = 2;
		} 
		if (thisObj.f_overflow() > max) {
            g_utils.f_popupMessage('There are ' + max + ' backups already stored on the Open Appliance.  Please delete the oldest and try again.', 'error', 'Error!');
			return;				    
		}
		thisObj.f_oaBackup();
	}

    this.f_loadVMData = function()
    {
        var hd = this.f_createColumns();

        var cb = function(evt)
        {
            if(evt != undefined && evt.m_objName == 'FT_eventObj')
            {
                var vmData = [];
                var vm = evt.m_value;
                if(vm == undefined)  
				    return;

                /*  
                thisObj.f_removeDivChildren(thisObj.m_div);
                thisObj.f_removeDivChildren(thisObj.m_body);
                thisObj.m_div.appendChild(thisObj.m_header);
                thisObj.m_div.appendChild(thisObj.m_body);
                */
				// only need to remove the grid body.  the header should be the same, as well as other.
				thisObj.f_removeDivChildren(thisObj.m_body);
				
				thisObj.m_vmName.length = 0;
				
                for(var i=0; i<vm.length; i++)
                {
                    var v = vm[i];
					//alert('vm name: ' + vm[i].m_name + ' vm dn:' + vm[i].m_displayName);
                    if(v == undefined) break;
	////////////////////////////////////////////////////////////////////////////////////////////
	////////// TODO : NEED BACKEND SUPPORT for the ID of OpenAppliance, ie dom0 VM
	//////////////////////////////////////////////////////////////////////////////////////////// 	
                    if (v.m_name == VYA.FT_CONST.OA_ID) {
						if (!g_roleManagerObj.f_isInstaller()) {
							continue;
						}
					}
                    var data = thisObj.f_renderCheckbox('no','conf_backup_data_cb_' + v.m_name);
                    var config = thisObj.f_renderCheckbox('no','conf_backup_config_cb_' + v.m_name);
					thisObj.m_vmName.push(v.m_name);
                    vmData[i] = [v.m_displayName, config, data];

                    var bodyDiv = thisObj.f_createGridRow(hd, vmData[i]);
					//alert('adding row: vm: ' + v.m_name + ' innerHTML: ' + bodyDiv.innerHTML);
                    thisObj.m_body.appendChild(bodyDiv);
                }
                thisObj.f_adjustDivPosition(thisObj.m_bottom);				
				//////////////////////////////////////////////////////////
				//// adding the check all, check all to the last row
				//////////////////////////////////////////////////////////
				/*
				var cAllData ='<input type="checkbox" id="conf_backup_data_checkall" name="data_checkall" value="data_checkall">&nbsp;Check All</a>';
				var cAllConfig = '<input type="checkbox" id="conf_backup_config_checkall" name="data_checkall" value="data_checkall">&nbsp;Check All</a>';
				var row = ['&nbsp;&nbsp;', cAllConfig, cAllData];
				var bDiv = thisObj.f_createGridRow(hd, row);
				thisObj.m_body.appendChild(bDiv);
				*/
            }
        }
        thisObj.m_busLayer.f_getVMDataFromServer(cb);	
        //this.m_treadId = this.m_busLayer.f_startVMRequestThread(cb);
    }

    this.f_stopLoadVMData = function()
    {
		thisObj.f_detachEventListener();
        //this.m_busLayer.f_stopVMRequestThread(this.m_treadId);
    }
	
    /**
     * create a div for target selection.
     */
    this.f_createTargetView = function()
	{
		var div = document.createElement('div');
		div.style.display = 'block';
		div.style.marginTop = '30px';
		div.style.marginBottom = '20px';
		div.style.backgroundColor = 'white';
		div.style.height = '50px';
		
		var innerHtml = 
		    '<form id="conf_backup_form" class="v_form" border="0">' +
				'<table cellspacing="0" cellpadding="0" border="0">' +
					'<tr><td><label class="v_label">Target:</label></td></tr>' +				
				    '<tr><td style="padding-left:35px;"><input type="radio" name="target_group" value="pc">&nbsp;My PC</td></tr>' +
				    '<tr><td style="padding-left:35px;"><input type="radio" name="target_group" value="oa" checked>&nbsp;Open appliance</td></tr>' +
				'</table>' +
		    '</form>';		

        div.innerHTML = innerHtml;

        return div;
    }		
		
	this.f_createBottom = function()
	{
        var div = document.createElement('div');
        div.style.position = 'relative';
        //div.style.borderBottom = '1px dotted #CCC';
        div.style.backgroundColor = 'white';
        div.style.paddingTop = '0px';
        div.style.paddingBottom = '0px';		
		return div;
	}	

    this.f_init = function()
    {
        var hd = thisObj.f_createColumns();
        this.m_header = thisObj.f_createGridHeader(hd);
        this.m_body = thisObj.f_createGridView(hd);
		this.m_target = thisObj.f_createTargetView();
		
        thisObj.f_loadVMData();

        var btns = [['Backup', 'f_handleConfBackupBkCb()'],
		            ['Cancel', 'f_handleConfBackupCancelCb()']];
        this.m_buttons = thisObj.f_createButtons(btns);
        
		this.m_bottom = thisObj.f_createBottom();
		this.m_bottom.appendChild(this.m_target);
		this.m_bottom.appendChild(this.m_buttons);
		
        return [this.m_header, this.m_body, this.m_bottom];
    }
}
FT_extend(FT_confBackup, FT_confBaseObj);

function f_handleConfBackupBkCb()
{
    g_configPanelObj.m_activeObj.f_backup();
}

function f_handleConfBackupCancelCb()
{
   g_configPanelObj.m_activeObj.f_reset();
}
