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
    this.m_colHd = null;
    this.m_bkRec = null;
    this.m_btnBackupId = 'ft_confBackupBtnBkId';
    this.m_btnCancelId = 'ft_confBackupBtnCancelId';
    
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
        //page.style.height = '360px';
        thisObj.f_attachEventListener();
        return page;
    }
    
    this.f_createColumns = function()
    {
        var cols = [];
        
        var config = '<input type="checkbox" id="conf_backup_config_checkall" name="config_checkall" value="config_checkall">&nbsp;' +
        g_lang.m_backupConfig +
        '</input>';
        var data = '<input type="checkbox" id="conf_backup_data_checkall" name="data_checkall" value="data_checkall">&nbsp;' +
        g_lang.m_backupData +
        '</input>';
        
        cols[0] = this.f_createColumn(g_lang.m_backupApp, 250, 'text', '6');
        cols[1] = this.f_createColumn(config, 120, 'checkbox', '32');
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
        for (var i = 0; i < thisObj.m_vmName.length; i++) {
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
        for (var i = 0; i < thisObj.m_vmName.length; i++) {
            var el = document.getElementById(s + '_' + thisObj.m_vmName[i]);
            if (el.checked == true) {
                return true;
            }
        }
        s = 'conf_backup_data_cb';
        for (var i = 0; i < thisObj.m_vmName.length; i++) {
            var el = document.getElementById(s + '_' + thisObj.m_vmName[i]);
            if (el.checked == true) {
                return true;
            }
        }
        
        g_utils.f_popupMessage(g_lang.m_backupSelectOne, 'error', g_lang.m_error, true);
        
        return false;
    }
    
    //////////////////////////////////////////////////////////////////////////
    ////////// TODO : NEED BACKEND SUPPORT
    ////////////////////////////////////////////////////////////////////////// 	
    this.f_pcBackup = function()
    {
        var vms = new Array();
        var mode = new Array();
        
        var s = 'conf_backup_config_cb';
        for (var i = 0; i < thisObj.m_vmName.length; i++) {
            var el = document.getElementById(s + '_' + thisObj.m_vmName[i]);
            if (el.checked == true) {
                vms.push(thisObj.m_vmName[i]);
                mode.push('config');
            }
        }
        s = 'conf_backup_data_cb';
        for (var i = 0; i < thisObj.m_vmName.length; i++) {
            var el = document.getElementById(s + '_' + thisObj.m_vmName[i]);
            if (el.checked == true) {
                vms.push(thisObj.m_vmName[i]);
                mode.push('data');
            }
        }
        g_busObj.f_backup(vms, mode, thisObj.f_pcBackupCb, '2pc');	
        g_utils.f_popupMessage(g_lang.m_backup2pcInProgress + '.', 'ok', g_lang.m_info, false);
    }
    
    this.f_pcBackupCb = function(eventObj)
    {
		var path = '';
        if (eventObj.f_isError()) {
            g_utils.f_popupMessage(g_lang.m_backupFail + ': ' + eventObj.m_errMsg, 'error', g_lang.m_error, true);
            return;
        }
        /* http://[oaip]/archive/[sessionid]/bu.tar */
		if (eventObj.m_value != null) {
			path = eventObj.m_value;
		}
        var url = g_utils.f_getHomePageIP() +  '/' + path;
		//'/archive/' /*+ g_utils.f_getUserLoginedID()*/ + 'bu.tar';
        window.open(url, 'Download');
    }
    
    this.f_oaBackupCb = function(eventObj)
    {
        if (eventObj.f_isError()) {
            g_utils.f_popupMessage(g_lang.m_backupFail + ': ' + eventObj.m_errMsg, 'error', g_lang.m_error, true);
        } else {
            g_utils.f_popupMessage(g_lang.m_backupInProgress + '.', 'ok', g_lang.m_info, true, 'f_handleConfBackupOkCb()');
        }
    }
    
    this.f_oaBackup = function()
    {
        var vms = new Array();
        var mode = new Array();
        
        var s = 'conf_backup_config_cb';
        for (var i = 0; i < thisObj.m_vmName.length; i++) {
            var el = document.getElementById(s + '_' + thisObj.m_vmName[i]);
            if (el.checked == true) {
                vms.push(thisObj.m_vmName[i]);
                mode.push('config');
            }
        }
        s = 'conf_backup_data_cb';
        for (var i = 0; i < thisObj.m_vmName.length; i++) {
            var el = document.getElementById(s + '_' + thisObj.m_vmName[i]);
            if (el.checked == true) {
                vms.push(thisObj.m_vmName[i]);
                mode.push('data');
            }
        }
        g_busObj.f_backup(vms, mode, thisObj.f_oaBackupCb);
    }
    
    this.f_overflow = function(evt)
    {
        if (evt.f_isError()) {
            g_utils.f_popupMessage(eventObj.m_errMsg, 'error', g_lang.m_error, true);
        } else {
            if (thisObj.m_busLayer.m_backup.m_limit == true) { //the limit has been reached
                g_utils.f_popupMessage(g_lang.m_backupPlsDelete + '!', 'error', g_lang.m_error, true);
                return;
            }
            thisObj.f_oaBackup();
        }
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
        //g_utils.f_cursorWait();
        thisObj.m_busLayer.f_getVMRestoreListFromServer(thisObj.f_overflow);
    }
    
    this.f_filterVm = function(vm)
    {
        if (vm.m_name == VYA.FT_CONST.BLB_ID) {
            return true;
        }
        if (vm.m_status != 'up') {
            return true;
        }
        return false;
    }
    
    this.f_loadVMData = function()
    {
        var cb = function(evt)
        {
            if (evt != undefined && evt.m_objName == 'FT_eventObj') {
                var vmData = [];
                var vm = evt.m_value;
                if (vm == undefined) 
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
                
                for (var i = 0; i < vm.length; i++) {
                    var v = vm[i];
                    //alert('vm name: ' + vm[i].m_name + ' vm dn:' + vm[i].m_displayName);
                    if (v == undefined) 
                        break;
                    if (v.m_name == VYA.FT_CONST.OA_ID) {
                        if (!g_roleManagerObj.f_isInstaller()) {
                            continue;
                        }
                    }
                    
                    if (thisObj.f_filterVm(v)) {
                        continue;
                    }
                    var data = thisObj.f_renderCheckbox('no', 'conf_backup_data_cb_' + v.m_name);
                    var config = thisObj.f_renderCheckbox('no', 'conf_backup_config_cb_' + v.m_name);
                    thisObj.m_vmName.push(v.m_name);
                    vmData[i] = [v.m_displayName, config, data];
                    
                    var bodyDiv = thisObj.f_createGridRow(thisObj.m_colHd, vmData[i]);
                    //alert('adding row: vm: ' + v.m_name + ' innerHTML: ' + bodyDiv.innerHTML);
                    thisObj.m_body.appendChild(bodyDiv);
                }
                thisObj.f_adjustDivPosition(thisObj.m_bottom);
                thisObj.f_resize(10);
            }
        }
        thisObj.m_busLayer.f_getVMDataFromServer(cb);
    }
    
    this.f_stopLoadVMData = function()
    {
        thisObj.f_detachEventListener();
    }
    
    /**
     * create a div for target selection.
     */
    this.f_createTargetView = function()
    {
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        
        var innerHtml = '<form id="conf_backup_form" class="v_form" border="0">' +
        '<table cellspacing="0" cellpadding="0" border="0">' +
        '<tr><td><label class="v_label">Target:</label></td></tr>' +
        '<tr><td style="padding-left:35px;"><input type="radio" name="target_group" value="pc">&nbsp;' +
        g_lang.m_backupMyPC +
        '</td></tr>' +
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
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        
        return div;
    }
    
    this.f_init = function()
    {
        this.m_colHd = thisObj.f_createColumns();
        this.m_header = thisObj.f_createGridHeader(this.m_colHd, 'f_bkGridHeaderOnclick');
        this.m_body = thisObj.f_createGridView(this.m_colHd);
        this.m_target = thisObj.f_createTargetView();
        
        thisObj.f_loadVMData();
        
        var btns = [['Backup', 'f_handleConfBackupBkCb()', g_lang.m_backupTooltipBackup, this.m_btnBackupId], ['Cancel', 'f_handleConfBackupCancelCb()', g_lang.m_backupTooltipCancel, this.m_btnCancelId]];
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

function f_handleConfBackupOkCb(redirect)
{
    g_mainFrameObj.f_selectPage(VYA.FT_CONST.DOM_2_NAV_BACKUP_ID, VYA.FT_CONST.DOM_3_NAV_SUB_RESTORE_ID);
}

function f_bkGridHeaderOnclick(col)
{
    //g_configPanelObj.m_activeObj.f_handleGridSort(col);
}
