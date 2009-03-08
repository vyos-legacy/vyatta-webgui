/*
    Document   : ft_confDashboard.js
    Created on : Mar 02, 2009, 6:18:51 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_confDashboard(name, callback, busLayer)
{
    var thisObjName = 'FT_confDashboard';

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

        cols[0] = this.f_createColumn('Application', 180, 'text', '6');
        cols[1] = this.f_createColumn('Status', 80, 'image', '35');
        cols[2] = this.f_createColumn('CPU', 120, 'progress', '8');
        cols[3] = this.f_createColumn('RAM', 120, 'progress', '8');
        cols[4] = this.f_createColumn('Disk', 120, 'progress', '8');
        cols[5] = this.f_createColumn('Need Updated', 130, 'checkbox', '40');

        return cols;
    }

    this.f_loadVMData = function()
    {
        var thisObj = this;
        var hd = this.f_createColumns();

        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            if(evt != undefined && evt.m_objName == 'FT_eventObj')
            {
                // handle error code
                if(evt.f_isError())
                {
                    thisObj.f_stopLoadVMData();

                    if(evt.m_errCode == 3)
                        g_utils.f_popupMessage('timeout', 'timeout');
                    else
                        alert(evt.m_errMsg);

                    return;
                }

                var vmData = [];
                var vm = evt.m_value.m_vmRecObj;
                if(vm == undefined) return;

                thisObj.f_removeDivChildren(thisObj.m_div);
                thisObj.f_removeDivChildren(thisObj.m_body);
                thisObj.m_div.appendChild(thisObj.m_header);
                thisObj.m_div.appendChild(thisObj.m_body);
                thisObj.m_div.appendChild(thisObj.m_buttons);

                for(var i=0; i<=vm.length; i++)
                {
                    var v = vm[i];

                    if(v == undefined) break;
                    var img = thisObj.f_renderStatus(v.m_status);
                    var cpu = thisObj.f_renderProgressBar(v.m_cpu,
                            'CPU Used: ' + v.m_cpu + '%');
                    var mem = thisObj.f_renderProgressBar(v.f_getMemPercentage(),
                            'RAM Used: Total = ' + v.m_memTotal +
                            ', Free = ' + v.m_memFree);
                    var disk = thisObj.f_renderProgressBar(v.f_getDiskPercentage(),
                            'Disk Used: Total = ' + v.m_diskTotal +
                            ', Free = ' + v.m_diskFree);
                    vmData[i] = [v.m_name, img, cpu, mem, disk, ''];

                    var bodyDiv = thisObj.f_createGridRow(hd, vmData[i]);
                    thisObj.m_body.appendChild(bodyDiv);
                }
            }
        }

        g_utils.f_cursorWait();
        this.m_threadId = this.m_busLayer.f_startVMRequestThread(cb);
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


        /////////////////////////////////////////////////////
        // for testing
        var cb = function()
        {
            alert('got user list');
        }
        g_busObj.f_getUserListFromServer(cb);


        var btns = [['Update', "f_dbHandleUpdate('vm')", 'Update selected VM(s)'],
                    ['Cancel', "f_dbHandleCancel()", '']];
        this.m_buttons = this.f_createButtons(btns);

        return [this.m_header, this.m_body, this.m_buttons];
    }
}
FT_extend(FT_confDashboard, FT_confBaseObj);


function f_dbHandleUpdate(vm)
{
    g_utils.f_popupMessage('testing tseting testing', 'confirm');
}

function f_dbHandelCancel()
{

}