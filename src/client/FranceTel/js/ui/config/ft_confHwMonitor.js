/*
    Document   : ft_confHwMonitor.js
    Created on : Mar 03, 2009, 3:18:51 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_confHwMonitor(name, callback, busLayer)
{
    this.thisObjName = 'FT_confHwMonitor',

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confHwMonitor.superclass.constructor(name, callback, busLayer);
    }
    this.constructor(name, callback, busLayer);

    this.f_getConfigurationPage = function()
    {
        return this.f_getNewPanelDiv(this.f_init());
    }

    this.f_createColumns = function()
    {
        var cols = [];

        // colname, width, type, paddingLeft
        cols[0] = this.f_createColumn('Component', 300, 'text', '6');
        cols[1] = this.f_createColumn('Status', 100, 'image', '45');

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

                var hw = evt.m_value;
                if(hw == undefined) return;

                thisObj.f_removeDivChildren(thisObj.m_div);
                thisObj.f_removeDivChildren(thisObj.m_body);
                thisObj.m_div.appendChild(thisObj.m_header);
                thisObj.m_div.appendChild(thisObj.m_body);

                for(var i=0; i<=hw.FAN; i++)
                {
                    var img = thisObj.f_renderStatus(hw.m_hwStatus[i]);
                    var hwData = [hw.m_hwName[i], img];

                    var bodyDiv = thisObj.f_createGridRow(hd, hwData);
                    thisObj.m_body.appendChild(bodyDiv);
                }
            }
        }

        g_utils.f_cursorWait();
        this.m_threadId = this.m_busLayer.f_startHWMonitorRequestThread(cb);
    }

    this.f_stopLoadVMData = function()
    {
        this.m_busLayer.f_stopHWMonitorRequestThread(this.m_threadId);
        this.m_threadId = null;
    }

    this.f_init = function()
    {
        var hd = this.f_createColumns();
        this.m_header = this.f_createGridHeader(hd);
        this.m_body = this.f_createGridView(hd);
        this.f_loadVMData();

        return [this.m_header, this.m_body];
    }
}
FT_extend(FT_confHwMonitor, FT_confBaseObj);
