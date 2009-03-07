/*
    Document   : ft_confVMUpdates.js
    Created on : Mar 05, 2009, 3:18:51 PM
    Author     : Kevin.Choi
    Description:
*/

FT_confVMUpdates = Ext.extend(FT_confBaseObj,
{
    thisObjName: 'FT_confVMUpdates',

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    constructor: function(name, callback, busLayer)
    {
        FT_confVMUpdates.superclass.constructor(name, callback, busLayer);
    },

    f_getConfigurationPage: function()
    {
        return this.f_getNewPanelDiv(this.f_init());
    },

    /**
     * define your column header here....
     */
    f_createColumns: function()
    {
        var cols = [];

        cols[0] = this.f_createColumn('Data', 200, 'text', '6');
        cols[1] = this.f_createColumn('VM', 200, 'text', '6');
        cols[2] = this.f_createColumn('Status', 100, 'text', '6');
        cols[3] = this.f_createColumn(' ', 100, 'button', '10');

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
                var vmData = [];

                thisObj.f_removeDivChildren(thisObj.m_div);
                thisObj.m_div.appendChild(thisObj.m_header);
                thisObj.m_div.appendChild(thisObj.m_body);

                //for(var i=0; i<vmData.length; i++)
                //{
                  //  var bodyDiv = thisObj.f_createGridRow(hd, vmData[i]);
                    //thisObj.m_body.appendChild(bodyDiv);
                //}
            }
        }

        this.m_busLayer.f_getVMDataFromServer(cb);
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

function f_handleCancel(vm)
{
    alert('fire up add panel');
}

function f_handleRestore(vm)
{
    alert('fire up user editor panel for ' + vm);
}



