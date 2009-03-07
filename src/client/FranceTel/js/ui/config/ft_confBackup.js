/*
    Document   : ft_confBackup.js
    Created on : Mar 03, 2009, 6:18:51 PM
    Author     : Kevin.Choi
    Description:
*/

FT_confBackup = Ext.extend(FT_confBaseObj,
{
    thisObjName: 'FT_confBackup',

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    constructor: function(name, callback, busLayer)
    {
        FT_confBackup.superclass.constructor(name, callback, busLayer);
    },

    f_getConfigurationPage: function()
    {
        var page = this.f_getNewPanelDiv(this.f_init());

        return page;
    },

    f_createColumns: function()
    {
        var cols = [];

        cols[0] = this.f_createColumn('Application', 250, 'text', '6');
        cols[1] = this.f_createColumn('Data', 80, 'checkbox', '35');
        cols[2] = this.f_createColumn('Config.', 80, 'checkbox', '35');

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
                var vm = evt.m_value.m_vmRecObj;
                if(vm == undefined) return;

                thisObj.f_removeDivChildren(thisObj.m_div);
                thisObj.f_removeDivChildren(thisObj.m_body);
                thisObj.m_div.appendChild(thisObj.m_header);
                thisObj.m_div.appendChild(thisObj.m_body);

                for(var i=0; i<=vm.length; i++)
                {
                    var v = vm[i];
                    if(v == undefined) break;

                    var data = thisObj.f_renderCheckbox('yes');
                    var config = thisObj.f_renderCheckbox('no');
                    vmData[i] = [v.m_name, data, config];

                    var bodyDiv = thisObj.f_createGridRow(hd, vmData[i]);
                    thisObj.m_body.appendChild(bodyDiv);
                }
            }
        }

        this.m_treadId = this.m_busLayer.f_startVMRequestThread(cb);
    },

    f_stopLoadVMData: function()
    {
        this.m_busLayer.f_stopVMRequestThread(this.m_treadId);
    },

    f_init: function()
    {
        var hd = this.f_createColumns();
        this.m_header = this.f_createGridHeader(hd);
        this.m_body = this.f_createGridView(hd);
        this.f_loadVMData();

        var btns = [['Add', 'f_addButtonCallback()']];
        this.m_buttons = this.f_createButtons(btns);

        return [this.m_header, this.m_body, this.m_buttons];
    }
});

function f_handleStop(vm)
{
    alert('stop ' + vm)
}

function f_handleRestart(vm)
{
    alert('restart ' + vm)
}

function f_handleStart(vm)
{
    alert('start ' + vm)
}