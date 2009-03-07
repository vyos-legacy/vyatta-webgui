/*
    Document   : ft_confHwMonitor.js
    Created on : Mar 03, 2009, 3:18:51 PM
    Author     : Kevin.Choi
    Description:
*/

FT_confHwMonitor = Ext.extend(FT_confBaseObj,
{
    thisObjName: 'FT_confHwMonitor',

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    constructor: function(name, callback, busLayer)
    {
        FT_confHwMonitor.superclass.constructor(name, callback, busLayer);
    },

    f_getConfigurationPage: function()
    {
        return this.f_getNewPanelDiv(this.f_init());
    },

    f_createColumns: function()
    {
        var cols = [];

        // colname, width, type, paddingLeft
        cols[0] = this.f_createColumn('Component', 300, 'text', '6');
        cols[1] = this.f_createColumn('Status', 100, 'image', '45');

        return cols;
    },

    f_loadVMData: function()
    {
        var thisObj = this;
        var hd = this.f_createColumns();

        var cb = function(evt)
        {
            if(evt != undefined && evt.m_objName == 'FT_eventObj')
            {
                // handle error code
                if(evt.f_isError())
                {
                    thisObj.f_stopLoadVMData();
                    alert(evt.m_errMsg);

                    return;
                }

                var vmData = [];
                var vm = evt.m_value.m_hwRecObj;
                if(vm == undefined) return;

                thisObj.f_removeDivChildren(thisObj.m_div);
                thisObj.f_removeDivChildren(thisObj.m_body);
                thisObj.m_div.appendChild(thisObj.m_header);
                thisObj.m_div.appendChild(thisObj.m_body);

                for(var i=0; i<=vm.FAN; i++)
                {
                    var img = thisObj.f_renderStatus(vm.m_hwStatus[i]);
                    vmData[i] = [vm.m_hwName[i], img];

                    var bodyDiv = thisObj.f_createGridRow(hd, vmData[i]);
                    thisObj.m_body.appendChild(bodyDiv);
                }
            }
        }

        this.m_threadId = this.m_busLayer.f_startVMRequestThread(cb);
    },

    f_stopLoadVMData: function()
    {
        this.m_busLayer.f_stopVMRequestThread(this.m_threadId);
        this.m_threadId = null;
    },

    f_init: function()
    {
        var hd = this.f_createColumns();
        this.m_header = this.f_createGridHeader(hd);
        this.m_body = this.f_createGridView(hd);
        this.f_loadVMData();

        return [this.m_header, this.m_body];
    }
});
