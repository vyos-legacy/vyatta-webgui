/*
    Document   : ft_confRestart.js
    Created on : Mar 03, 2009, 6:18:51 PM
    Author     : Kevin.Choi
    Description:
*/

FT_confRestart = Ext.extend(FT_confBaseObj,
{
    thisObjName: 'FT_confRestart',

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    constructor: function(name, callback, busLayer)
    {
        FT_confRestart.superclass.constructor(name, callback, busLayer);
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
        cols[1] = this.f_createColumn('Status', 80, 'image', '35');
        cols[2] = this.f_createColumn('', 100, 'button', '25');
        cols[3] = this.f_createColumn('', 100, 'button', '25');
        cols[4] = this.f_createColumn('', 100, 'button', '25');

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
                var vm = evt.m_value.m_vmRecObj;
                if(vm == undefined) return;

                thisObj.f_removeDivChildren(thisObj.m_div);
                thisObj.f_removeDivChildren(thisObj.m_body);
                thisObj.m_div.appendChild(thisObj.m_header);
                thisObj.m_div.appendChild(thisObj.m_body);
                thisObj.m_div.appendChild(thisObj.m_button);

                for(var i=0; i<=vm.length; i++)
                {
                    var v = vm[i];
                    if(v == undefined) break;

                    //////////////////////////////////
                    // skip open appliance
                    if(v.m_name == 'OpenAppliance') continue;

                    var enabled = v.m_status == 'up' ? true : false;

                    var img = thisObj.f_renderStatus(v.m_status);
                    var restart = thisObj.f_renderButton(
                                'Restart', enabled, "f_handleRestart('" +
                                v.m_name + "')");
                    var stop = thisObj.f_renderButton(
                                'Stop', enabled, "f_handleStop('" +
                                v.m_name + "')");
                    var start = thisObj.f_renderButton(
                                'Start', !enabled, "f_handleStart('" +
                                v.m_name + "')");
                    vmData[i] = [v.m_name, img, restart, stop, start];

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
        this.m_button = this.f_createOARestart();
        this.f_loadVMData();

        return [this.m_header, this.m_body, this.m_button];
    },

    f_createOARestart: function()
    {
        var handleFunc = "f_handleRestart('OpenAppliance')";
        var div = document.createElement('div');
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.height = '50px';

        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">';
        innerHtml += '<tbody><tr height="22">';

        innerHtml += '<td width="120"><div style="height:30px; padding-left:10px; ' +
                      'padding-top:30px;"><b>Open Appliance:</b></div></td>';

        innerHtml += '<td width="110">' +
                    '<div style="height:30px; ' +
                    'padding-top:15px;" >' +
                    '<img src="images/vm_restart.PNG" name="OpenAppl" ' +
                    'style="cursor:pointer;" ' +
                    'value="Restart" onclick="' + handleFunc +
                    '></div></td>';

        innerHtml += '</tr></tbody></table>';

        div.innerHTML = innerHtml;

        return div;
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