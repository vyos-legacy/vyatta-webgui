/*
    Document   : ft_confRestart.js
    Created on : Mar 03, 2009, 6:18:51 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_confRestart(name, callback, busLayer)
{
    this.thisObjName = 'FT_confRestart';
    var thisObj = this;
    this.m_colHd = null;
    this.m_vmRec = null;

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confRestart.superclass.constructor(name, callback, busLayer);
    }
    this.constructor(name, callback, busLayer);

    this.f_getConfigurationPage = function()
    {
        var page = this.f_getNewPanelDiv(this.f_init());

        return page;
    }

    this.f_createColumns = function()
    {
        var cols = [];

        cols[0] = this.f_createColumn(g_lang.m_dbHdApplication, 250, 'text', '6', true);
        cols[1] = this.f_createColumn(g_lang.m_dbHdStatus, 80, 'image', '35', true);
        cols[2] = this.f_createColumn('', 100, 'button', '25');
        cols[3] = this.f_createColumn('', 100, 'button', '25');
        cols[4] = this.f_createColumn('', 100, 'button', '25');

        return cols;
    }

    this.f_loadVMData = function()
    {
        thisObj.f_resetSorting();

        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            if(evt != undefined && evt.m_objName == 'FT_eventObj')
            {
                if(thisObj.f_isServerError(evt, g_lang.m_restartErrorTitle))
                {
                    thisObj.f_stopLoadVMData();
                    return;
                }

                thisObj.m_vmRec = evt.m_value;
                if(thisObj.m_vmRec == undefined) return;
                thisObj.f_populateTable();
            }
            thisObj.f_resize();
        }

        g_utils.f_cursorWait();
        this.m_threadId = this.m_busLayer.f_startVMRequestThread(cb);
    }

    this.f_populateTable = function()
    {
        thisObj.f_removeDivChildren(thisObj.m_div);
        thisObj.f_removeDivChildren(thisObj.m_body);
        thisObj.f_removeDivChildren(thisObj.m_header);
        thisObj.m_header = thisObj.f_createGridHeader(thisObj.m_colHd,
                            'f_restartGridHeaderOnclick');
        thisObj.m_div.appendChild(thisObj.m_header);
        thisObj.m_div.appendChild(thisObj.m_body);
        thisObj.m_div.appendChild(thisObj.m_button);

        var sortCol = FT_confDashboard.superclass.m_sortCol;
        var vm = thisObj.f_createSortingArray(sortCol, thisObj.m_vmRec);
        for(var i=0; i<vm.length; i++)
        {
            var v = vm[i].split('|');

            var enabled = v[1] == 'down' ? false : true;

            var img = thisObj.f_renderStatus(v[1]);
            var restart = thisObj.f_renderButton(
                        'Restart', enabled, "f_vmRestart('" +
                        v[0] + "', '" + v[2] + "')",
                        'Restart ' + v[2]);
            var stop = thisObj.f_renderButton(
                        'Stop', v[0] == "utm" ? false : enabled, "f_vmStop('" +
                        v[0] + "', '" + v[2] + "')",
                        'Stop ' + v[2]);
            var start = thisObj.f_renderButton(
                        'Start', !enabled, "f_vmHandleStart('" +
                        v[0] + "', '" + v[2] + "')", 'Start ' + v[2]);
            var vmData = [v[2], img, restart, stop, start];

            var bodyDiv = thisObj.f_createGridRow(thisObj.m_colHd, vmData);
            thisObj.m_body.appendChild(bodyDiv);
        }

        thisObj.f_adjustDivPosition(thisObj.m_button);
    }

    this.f_createSortingArray = function(sortIndex, vm)
    {
        var ar = new Array();

        for(var i=0; i<vm.length; i++)
        {
            //////////////////////////////////
            // skip open appliance, blb and undeploy vm
            if(vm[i].m_name == 'openapp' || vm[i].m_name == 'blb' ||
                !vm[i].m_isDeployed) continue;

            // NOTE: the order of this partition same as the order
            // grid columns.
            // compose a default table row
            ar[ar.length] = vm[i].m_name + '|' + vm[i].m_status + '|' +
                    vm[i].m_displayName;
        }

        return thisObj.f_sortArray(sortIndex, ar);
    }

    this.f_handleGridSort = function(col)
    {
        if(thisObj.f_isSortEnabled(thisObj.m_colHd, col))
            thisObj.f_populateTable();
    }

    this.f_stopLoadVMData = function()
    {
        this.m_busLayer.f_stopVMRequestThread(this.m_threadId);
        this.m_threadId = null;
    }

    this.f_init = function()
    {
        this.m_colHd = this.f_createColumns();
        this.m_header = this.f_createGridHeader(this.m_colHd, 'f_restartGridHeaderOnclick');
        this.m_body = this.f_createGridView(this.m_colHd);
        this.m_button = this.f_createOARestart();
        this.f_loadVMData();

        return [this.m_header, this.m_body, this.m_button];
    }

    this.f_createOARestart = function()
    {
        var cursor = thisObj.f_getCursor(true);
        var handleFunc = "f_vmRestart('openapp')";
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.height = '40px';

        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">';
        innerHtml += '<tbody><tr height="22">';

        innerHtml += '<td width="120"><div style="height:30px; padding-left:10px; ' +
                      'padding-top:30px;"><b>' + g_lang.m_restartOA + ':</b></div></td>';

        innerHtml += '<td width="110">' +
                    '<div title="Restart ' + g_lang.m_restartOA + '" style="height:30px; ' +
                    'padding-top:15px; ' + cursor + '">' +
                    '<input type="image" src="' + g_lang.m_imageDir +
                    'bt_restart.gif" name="OpenAppl" ' +
                    'value="Restart" onclick="' + handleFunc +
                    '"></div></td>';

        innerHtml += '</tr></tbody></table>';

        div.innerHTML = innerHtml;

        return div;
    }
}
FT_extend(FT_confRestart, FT_confBaseObj);

function f_vmStop(vmId, vmName)
{
    g_utils.f_popupMessage(g_lang.m_restartStopConfirm + ' (' + vmName + ') VM?',
                'confirm', g_lang.m_restartStopTitle, true,
                "f_vmHandleStop(this, '"+ vmId + "')");
}
function f_vmHandleStop(e, vmId)
{
    if(e.getAttribute('id')== 'ft_popup_message_apply')
    {
        var cb = function()
        {
            g_utils.f_cursorDefault();
            g_configPanelObj.m_activeObj.f_loadVMData();
        }

        g_utils.f_cursorWait();
        g_busObj.f_stopVM(vmId, cb);
    }
}

function f_vmRestart(vmId, vmName)
{
    if(vmId == 'openapp') vmName = g_lang.m_restartOA;

    g_utils.f_popupMessage(g_lang.m_restartConfirm + ' (' + vmName + ') VM?',
                'confirm', g_lang.m_restartTitle, true,
                "f_vmHandleRestart(this, '"+ vmId + "')");
}
function f_vmHandleRestart(e, vmId)
{
    if(e.getAttribute('id')== 'ft_popup_message_apply')
    {
        var cb = function()
        {
            g_utils.f_cursorDefault();
            g_configPanelObj.m_activeObj.f_loadVMData();
        }

        g_utils.f_cursorWait();
        g_busObj.f_restartVM(vmId, cb);
    }
}

function f_vmHandleStart(vm)
{
    var cb = function()
    {
        g_utils.f_cursorDefault();
        g_configPanelObj.m_activeObj.f_loadVMData();
    }

    g_utils.f_cursorWait();
    g_busObj.f_startVM(vm, cb);
}

function f_restartGridHeaderOnclick(col)
{
    g_configPanelObj.m_activeObj.f_handleGridSort(col);
}