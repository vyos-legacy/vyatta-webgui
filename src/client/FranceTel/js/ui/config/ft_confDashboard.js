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
    this.m_colHd = null;
    this.m_vmRec=null;

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

        cols[0] = this.f_createColumn(g_lang.m_dbHdApplication, 200, 'text', '6', true);
        cols[1] = this.f_createColumn(g_lang.m_dbHdStatus, 80, 'image', '35', true);
        cols[2] = this.f_createColumn(g_lang.m_dbHdCPU, 120, 'progress', '8');
        cols[3] = this.f_createColumn(g_lang.m_dbMemory, 120, 'progress', '8');
        cols[4] = this.f_createColumn(g_lang.m_dbDiskSpace, 120, 'progress', '8');
        cols[5] = this.f_createColumn(g_lang.m_dbUpdateNeeded, 130, 'checkbox', '55');

        return cols;
    }

    this.f_loadVMData = function()
    {
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

                thisObj.m_vmRec = evt.m_value;
                if(thisObj.m_vmRec == undefined) return;

                thisObj.f_populateTable();
            }
        }

        g_utils.f_cursorWait();
        this.m_threadId = this.m_busLayer.f_startVMRequestThread(cb);
    }

    this.f_populateTable = function()
    {
        var vm = thisObj.m_vmRec;
        var sortCol = FT_confDashboard.superclass.m_sortCol;

        thisObj.f_removeDivChildren(thisObj.m_div);
        thisObj.f_removeDivChildren(thisObj.m_body);

        // refresh header
        thisObj.f_removeDivChildren(thisObj.m_header);
        thisObj.m_header = thisObj.f_createGridHeader(thisObj.m_colHd,
                            'f_dbGridHeaderOnclick');
        thisObj.m_div.appendChild(thisObj.m_header);

        thisObj.m_div.appendChild(thisObj.m_body);
        thisObj.m_div.appendChild(thisObj.m_buttons);

        var avm = thisObj.f_createSortingArray(sortCol, vm);
        var vmIndex = 0;
        for(var i=0; i<avm.length; i++)
        {
            var v = avm[i].split('|');

            // skip business live box
            if(v.m_name == 'blb') continue;

            var img = thisObj.f_renderStatus(v[1]);
            var cpu = thisObj.f_renderProgressBar(v[2],
                    g_lang.m_dbHdCPU + ' ' + g_lang.m_dbUsed + ': ' + v[2] + '%');
            var mem = thisObj.f_renderProgressBar(v[3],
                    g_lang.m_dbMemory + ' ' + g_lang.m_dbUsed + ': ' +
                    g_lang.m_dbTotal + ' = ' + v[4] +
                    ', ' + g_lang.m_dbFree + ' = ' + v[5]);
            var disk = thisObj.f_renderProgressBar(v[6],
                    g_lang.m_dbDiskSpace + ' ' + g_lang.m_dbUsed + ': ' +
                    g_lang.m_dbTotal + ' = ' + v[7] +
                    ', ' + g_lang.m_dbFree + ' = ' + v[8]);
            var vmObj = g_busObj.f_getVmRecByVmId(v[9]);
            var update = thisObj.f_handleUpdateNeedField(vmIndex, vmObj, thisObj.m_updateFields);
            thisObj.m_updateFields[vmIndex++] = update[1];

            var vmData = [v[0], img, cpu, mem, disk, update[0]];
            var bodyDiv = thisObj.f_createGridRow(this.m_colHd, vmData);
            thisObj.m_body.appendChild(bodyDiv);
        }

        thisObj.f_adjustDivPosition(thisObj.m_buttons);
        thisObj.f_updateButtons();
    }

    this.f_createSortingArray = function(sortIndex, vm)
    {
        var ar = new Array();

        for(var i=0; i<vm.length; i++)
        {
            // compose a default table row
            ar[i] = vm[i].m_displayName + '|' + vm[i].m_status + '|' +
                    vm[i].m_cpu + '|' + vm[i].f_getMemPercentage() + '|' +
                    vm[i].m_memTotal + '|' + vm[i].m_memFree + '|' +
                    vm[i].f_getDiskPercentage() + '|' + vm[i].m_diskTotal + '|' +
                    vm[i].m_diskFree + '|' + vm[i].m_name;
        }

        return thisObj.f_sortArray(sortIndex, ar);
    }

    this.f_handleGridSort = function(col)
    {
        // only col 0 & 1 allow sorting
        if(col >= 2) return;

        var order = FT_confDashboard.superclass.m_sortOrder;

        if(col != FT_confDashboard.superclass.m_sortColPrev)
            order = 'asc';
        else if(order == 'asc')
            order = 'desc';
        else
            order = 'asc';

        FT_confDashboard.superclass.m_sortCol = col;
        FT_confDashboard.superclass.m_sortOrder = order;
        thisObj.f_populateTable();
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
        this.m_colHd = this.f_createColumns();
        this.m_header = this.f_createGridHeader(this.m_colHd, 'f_dbGridHeaderOnclick');
        this.m_body = this.f_createGridView(this.m_colHd);
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

function f_dbGridHeaderOnclick(col)
{
    g_configPanelObj.m_activeObj.f_handleGridSort(col);
}