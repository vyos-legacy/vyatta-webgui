/*
    Document   : ft_confVMUpdates.js
    Created on : Mar 05, 2009, 3:18:51 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_confVMUpdates(name, callback, busLayer)
{
    this.thisObjName = 'FT_confVMUpdates';
    var thisObj = this;
    this.m_colHd = null;
    this.m_depRec = null;

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confVMUpdates.superclass.constructor(name, callback, busLayer);
    }
    this.constructor(name, callback, busLayer);

    this.f_getConfigurationPage = function()
    {
        return this.f_getNewPanelDiv(this.f_init());
    }

    /**
     * define your column header here....
     */
    this.f_createColumns = function()
    {
        var cols = [];

        cols[0] = this.f_createColumn(g_lang.m_uhHdDate, 180, 'text', '6', true);
        cols[1] = this.f_createColumn(g_lang.m_dbHdApplication, 280, 'text', '6', true);
        cols[2] = this.f_createColumn(g_lang.m_dbHdStatus, 120, 'text', '6', true);
        cols[3] = this.f_createColumn(' ', 100, 'button', '25');

        return cols;
    }

    this.f_loadVMData = function()
    {
        thisObj.f_stopLoadVMData();

        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            thisObj.f_resetPagination();

            if(evt != undefined && evt.m_objName == 'FT_eventObj')
            {
                if(thisObj.f_isServerError(evt, g_lang.m_uhErrorTitle))
                    return;

                thisObj.m_depRec = evt.m_value;  // get vm deploy record object
                if(thisObj.m_depRec == undefined) return;

                thisObj.f_populateTable();
            }
            thisObj.f_resize();
        }

        g_utils.f_cursorWait();
        this.m_threadId = this.m_busLayer.f_getVMUpdateListFromServer(cb, true);
    }

    this.f_stopLoadVMData = function()
    {
        this.m_busLayer.f_stopGetVMUpdateListFromServerThread(this.m_threadId);
        this.m_threadId = null;
    },

    this.f_populateTable = function()
    {
        thisObj.f_removeDivChildren(thisObj.m_div);
        thisObj.f_removeDivChildren(thisObj.m_body);

        thisObj.f_removeDivChildren(thisObj.m_header);
        thisObj.m_header = thisObj.f_createGridHeader(thisObj.m_colHd,
                            'f_vmGridHeaderOnclick');
        thisObj.m_div.appendChild(thisObj.m_header);
        thisObj.m_div.appendChild(thisObj.m_body);

        var sortCol = FT_confDashboard.superclass.m_sortCol;
        var depArray = thisObj.f_createSortingArray(sortCol, thisObj.m_depRec);
        for(var i=0; i<depArray.length; i++)
        {
            var dep = depArray[i].split('|');

            var vmRec = g_busObj.f_getVmRecByVmId(dep[1]);
            var button = thisObj.f_createRenderButton(dep[1],
                          vmRec, dep[2], dep[3], dep[6]);

            var vmData = [dep[0], vmRec.m_displayName + " (" +
                          dep[4] + ")",
                          thisObj.f_createRenderStatus(dep[2],
                          dep[5]), button];

            var bodyDiv = thisObj.f_createGridRow(thisObj.m_colHd, vmData, depArray.length);
            if(bodyDiv != null)
                thisObj.m_body.appendChild(bodyDiv);
        }
    }

    this.f_handleGridSort = function(col)
    {
        if(thisObj.f_isSortEnabled(thisObj.m_colHd, col))
            thisObj.f_populateTable();
    }

    this.f_createSortingArray = function(sortIndex, vm)
    {
        var ar = new Array();

        for(var i=0; i<vm.length; i++)
        {
            // NOTE: the order of this partition same as the order
            // grid columns.
            // compose a default table row
            ar[i] = vm[i].m_time + '|' + vm[i].m_id + '|' +
                    vm[i].m_status + '|' + vm[i].m_prevVersion + '|' +
                    vm[i].m_version + '|' + vm[i].m_msg + '|' + vm[i].m_isOld;
        }

        return thisObj.f_sortArray(sortIndex, ar);
    }

    this.f_createRenderStatus = function(status, msg)
    {
        if(msg == undefined || msg.length == 0 || msg == 'undefined')
            return "<p>"+status+"</p>";
        else
            return '<p title="' + msg + '">' + status + '</p>';
    }

    this.f_createRenderButton = function(vmId, vmRec, status, prevVer, isOld)
    {
        var cb = '';
        var vmName = vmRec.m_displayName;

        if(isOld != "true")
        {
            if(status == 'Scheduled')
            {
                cb = "f_vmDeployCancel('" + vmId + "', '" + vmName + "')";
                return thisObj.f_renderButton('Cancel', true, cb,
                        'Cancel ' + vmName);
            }
            else if(status == 'Failed' || status == 'Succeeded')
            {
                cb = "f_vmDeployRestore('" + vmId + "', '" + vmName + "')";
                return thisObj.f_renderButton('Restore', prevVer == undefined ||
                    prevVer == 'undefined' ? false:true, cb, 'Restore ' + vmName);
            }
        }

        return "";
    }

    this.f_init = function()
    {
        this.m_colHd = this.f_createColumns();
        this.m_header = this.f_createGridHeader(this.m_colHd, 'f_vmGridHeaderOnclick');
        this.m_body = this.f_createGridView(this.m_colHd, true);
        this.f_loadVMData();
        this.f_resetSorting();

        /////////////////////////////////////////////////////////
        // create a callback for paging. when user click on the
        // page number, this function will be called.
        FT_confVMUpdates.superclass.prototype = this.f_populateTable;

        return [this.m_header, this.m_body];
    }
}
FT_extend(FT_confVMUpdates, FT_confBaseObj);

function f_vmHandleDeployCancel(e, vmId)
{
    var cb = function(evt)
    {
        g_utils.f_cursorDefault();
        if(!g_configPanelObj.m_activeObj.f_isServerError(evt, g_lang.m_uhErrorTitle))
            g_configPanelObj.m_activeObj.f_loadVMData();
    }

    if(e.getAttribute('id')== 'ft_popup_message_apply')
    {
        g_utils.f_cursorWait();
        g_busObj.f_cancelVMDeploy(vmId, cb);
    }
}

function f_vmDeployCancel(vmId, vmName)
{
    g_utils.f_popupMessage(g_lang.m_cancelConfirm + ' (' + vmName + ') VM?',
                'confirm', g_lang.m_uhCancelTitle, true,
                "f_vmHandleDeployCancel(this, '"+ vmId + "')");
}

function f_vmDeployRestore(vmId, vmName)
{
    g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_RESTORE_UPDATE_ID, vmId);
}

function f_vmGridHeaderOnclick(col)
{
    g_configPanelObj.m_activeObj.f_handleGridSort(col);
}

