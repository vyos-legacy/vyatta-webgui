/*
    Document   : ft_confDashboard.js
    Created on : Mar 02, 2009, 6:18:51 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_confDashboard(name, callback, busLayer)
{
    var thisObj = this;
    this.thisObjName = 'FT_confDashboard';
    this.m_btnUpdateId = 'ft_dbUpdateButtonId';
    this.m_btnCancelId = 'ft_dbCancelButtonId';

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confDashboard.superclass.constructor(name, callback, busLayer);
    }
    this.constructor(name, callback, busLayer);

    this.f_getConfigurationPage = function()
    {
        return this.f_getNewPanelDiv(this.f_init());
    }

    this.f_createColumns = function()
    {
        var cols = [];

        cols[0] = this.f_createColumn(g_lang.m_dbHdApplication, 180, 'text', '6');
        cols[1] = this.f_createColumn(g_lang.m_dbHdStatus, 80, 'image', '35');
        cols[2] = this.f_createColumn(g_lang.m_dbHdCPU, 120, 'progress', '8');
        cols[3] = this.f_createColumn(g_lang.m_dbMemory, 120, 'progress', '8');
        cols[4] = this.f_createColumn(g_lang.m_dbDiskSpace, 120, 'progress', '8');
        cols[5] = this.f_createColumn(g_lang.m_dbUpdateNeeded, 130, 'checkbox', '55');

        return cols;
    }

    this.f_loadVMData = function()
    {
        var hd = this.f_createColumns();
        thisObj.m_updateFields = [];

        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            if(evt != undefined && evt.m_objName == 'FT_eventObj')
            {
                if(thisObj.f_isServerError(evt, g_lang.m_dbErrorTitle))
                {
                    thisObj.f_stopLoadVMData();
                    return;
                }

                var vm = evt.m_value;
                if(vm == undefined) return;

                thisObj.f_removeDivChildren(thisObj.m_div);
                thisObj.f_removeDivChildren(thisObj.m_body);
                thisObj.m_div.appendChild(thisObj.m_header);
                thisObj.m_div.appendChild(thisObj.m_body);
                thisObj.m_div.appendChild(thisObj.m_buttons);

                var vmIndex = 0;
                for(var i=0; i<vm.length; i++)
                {
                    var v = vm[i];

                    // skip business live box
                    if(v.m_name == 'blb') continue;

                    var img = thisObj.f_renderStatus(v.m_status);
                    var cpu = thisObj.f_renderProgressBar(v.m_cpu,
                            g_lang.m_dbHdCPU + ' ' + g_lang.m_dbUsed + ': ' + v.m_cpu + '%');
                    var mem = thisObj.f_renderProgressBar(v.f_getMemPercentage(),
                            g_lang.m_dbMemory + ' ' + g_lang.m_dbUsed + ': ' +
                            g_lang.m_dbTotal + ' = ' + v.m_memTotal +
                            ', ' + g_lang.m_dbFree + ' = ' + v.m_memFree);
                    var disk = thisObj.f_renderProgressBar(v.f_getDiskPercentage(),
                            g_lang.m_dbDiskSpace + ' ' + g_lang.m_dbUsed + ': ' +
                            g_lang.m_dbTotal + ' = ' + v.m_diskTotal +
                            ', ' + g_lang.m_dbFree + ' = ' + v.m_diskFree);
                    var update = thisObj.f_handleUpdateNeedField(vmIndex, v, thisObj.m_updateFields);
                    thisObj.m_updateFields[vmIndex++] = update[1];

                    var vmData = [v.m_displayName, img, cpu, mem, disk, update[0]];

                    var bodyDiv = thisObj.f_createGridRow(hd, vmData);
                    thisObj.m_body.appendChild(bodyDiv);
                }

                thisObj.f_adjustDivPosition(thisObj.m_buttons);
                thisObj.f_updateButtons();
            }
        }

        g_utils.f_cursorWait();
        this.m_threadId = this.m_busLayer.f_startVMRequestThread(cb);
    }

    this.f_handleCheckboxClick = function(chkbox)
    {
        var f = thisObj.m_updateFields;

        // update the m_updateFields to keep user's last input. so the background
        // refresh would not overrided user's last input.
        for(var i=0; i<f.length; i++)
        {
            var vm = f[i];
            if('db_' + vm[1].m_name == chkbox.id)
            {
                vm[2] = chkbox.checked ? 'yes' : 'no';
                break;
            }
        }

        thisObj.f_updateButtons();

        // always enabled cancel button if any check box is dirty
        thisObj.f_enabledDisableButton(thisObj.m_btnCancelId, true);
    }

    this.f_handleResetCheckbox = function()
    {
        var f = thisObj.m_updateFields;

        for(var i=0; i<f.length; i++)
        {
            var vm = f[i];
            var chkbox = document.getElementById('db_' + vm[1].m_name)
            if(chkbox != undefined)
                chkbox.checked = true;
        }
    }

    this.f_updateButtons = function()
    {
        thisObj.f_updateButton(thisObj.m_btnUpdateId);
        thisObj.f_updateButton(thisObj.m_btnCancelId);
    }

    this.f_updateButton = function(btnId)
    {
        var f = thisObj.m_updateFields;
        var isAnyChkboxChecked = false;

        for(var i=0; i<f.length; i++)
        {
            var vm = f[i];
            var chkbox = document.getElementById('db_' + vm[1].m_name)
            if(chkbox != undefined && chkbox.checked)
            {
                isAnyChkboxChecked = true;
                break;
            }
        }

        thisObj.f_enabledDisableButton(btnId, isAnyChkboxChecked);
    }

    /**
     * get a list of vm id who's checkbox is checked for update
     */
    this.f_getUpdateList = function()
    {
        var vmList = [];
        var index = 0;
        var f = thisObj.m_updateFields;

        for(var i=0; i<f.length; i++)
        {
            var vm = f[i];
            if(vm[2] != 'no')
                vmList[index++] = vm[1].m_name;
        }

        return vmList;
    }

    /**
     *  if no available update version, return empty string else return
     *  a check box input.
     */
    this.f_handleUpdateNeedField = function(vmindex, vm, updates)
    {
        if(updates[vmindex] == undefined)
            updates[vmindex] = [vm.m_needUpdate, vm, vm.m_needUpdate /*user input*/];

        // need update checkbox
        if(vm.m_needUpdate != 'no')
        {
            // now let create checkbox
            var vmu = updates[vmindex];

            // we want to keep user's last input
            var isChecked = vmu[2] == 'no' ? 'no' : 'yes';

            return [thisObj.f_renderCheckbox(isChecked, 'db_' + vm.m_name,
                            'f_dbCheckboxClick(this)', g_lang.m_dbTooltipUpdateNeed +
                            vm.m_needUpdate), updates[vmindex]];
        }
        else
            return ["", updates[vmindex]];
    }

    this.f_stopLoadVMData = function()
    {
        this.m_busLayer.f_stopVMRequestThread(this.m_threadId);
    }

    this.f_init = function()
    {
        var hd = this.f_createColumns();
        this.m_header = this.f_createGridHeader(hd);
        this.m_body = this.f_createGridView(hd);
        this.f_loadVMData();

        var btns = [['Update', "f_dbHandleUpdate()", g_lang.m_dbTooltipUpdate,
                      this.m_btnUpdateId],
                    ['Cancel', "f_dbHandleCancel()", g_lang.m_dbTooltipCancel,
                      this.m_btnCancelId]];
        this.m_buttons = this.f_createButtons(btns);

        return [this.m_header, this.m_body, this.m_buttons];
    }
}
FT_extend(FT_confDashboard, FT_confBaseObj);


function f_dbHandleUpdate()
{
    var ul = g_configPanelObj.m_activeObj.f_getUpdateList();
    g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_SCHED_UPDATE_ID, ul);
}

function f_dbHandleCancel()
{
    g_configPanelObj.m_activeObj.f_handleResetCheckbox();
}

function f_dbCheckboxClick(e)
{
    g_configPanelObj.m_activeObj.f_handleCheckboxClick(e);
}