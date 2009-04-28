/*
    Document   : utm_confvpnOverview.js
    Created on : Apr 01, 2009, 11:21:31 AM
    Author     : Kevin.Choi
    Description:
*/

function UTM_confVPNOverview(name, callback, busLayer)
{
    var thisObj = this;
    this.thisObjName = 'UTM_confVPNOverview';

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        UTM_confVPNOverview.superclass.constructor(name, callback, busLayer);
    }
    this.constructor(name, callback, busLayer);

    this.f_getConfigurationPage = function()
    {
        return this.f_getPanelDiv(this.f_init());
    }

    this.f_createS2SColumns = function()
    {
        var cols = [];
        var chkbox = g_lang.m_enabled + '<br>' + thisObj.f_renderCheckbox('no',
                      'vpns2sOverView', 'f_vpns2sOverViewChkboxCb',
                      'tooltip');

        cols[0] = this.f_createColumn(g_lang.m_name + '<br>', 90, 'text', '6');
        cols[1] = this.f_createColumn(g_lang.m_vpnOVSource + '<br>', 100, 'text', '6');
        cols[2] = this.f_createColumn(g_lang.m_vpnOVDest + '<br>', 100, 'text', '6');
        cols[3] = this.f_createColumn(g_lang.m_vpnOVPeerDomainName, 110, 'text', '6');
        cols[4] = this.f_createColumn(g_lang.m_status + '<br>', 80, 'text', '6');
        cols[5] = this.f_createColumn(g_lang.m_vpnOVConfNode, 100, 'text', '6');
        cols[6] = this.f_createColumn(chkbox, 70, 'checkbox', '45');
        cols[7] = this.f_createColumn(g_lang.m_delete + '<br>', 70, 'image', '45');

        return cols;
    }

    this.f_createRemotesColumns = function()
    {
        var cols = [];
        var chkbox = g_lang.m_enabled + '<br>' + thisObj.f_renderCheckbox('no',
                      'vpnRemoteOverView', 'f_vpnRemoteOverViewChkboxCb',
                      'tooltip');

        cols[0] = this.f_createColumn(g_lang.m_username + '<br>', 120, 'text', '6', true);
        cols[1] = this.f_createColumn(g_lang.m_group + '<br>', 100, 'text', '6', true);
        cols[2] = this.f_createColumn(g_lang.m_ipAddr + '<br>', 90, 'text', '6');
        cols[3] = this.f_createColumn(g_lang.m_vpnOVLocal + ' ' + g_lang.m_ipAddr,
                                      90, 'text', '6');
        cols[4] = this.f_createColumn(g_lang.m_status + '<br>', 80, 'text', '6');
        cols[5] = this.f_createColumn(g_lang.m_vpnOVConfNode, 100, 'text', '6');
        cols[6] = this.f_createColumn(chkbox, 70, 'checkbox', '45');
        cols[7] = this.f_createColumn(g_lang.m_delete + '<br>', 70, 'image', '45');

        return cols;
    }

    this.f_s2sChkboxCb = function()
    {

    }

    this.f_remoteChkboxCb = function()
    {

    }

    this.f_loadVMData = function()
    {
        //var hds2s = this.f_createS2SColumns();
        //var hdRemote = this.f_createRemotesColumns();
        thisObj.m_updateFields = [];

        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            if(evt != undefined && evt.m_objName == 'FT_eventObj')
            {
                thisObj.f_populateTable();
            }
        }

        //g_utils.f_cursorWait();
        //this.m_threadId = this.m_busLayer.f_startVMRequestThread(cb);
    }

    this.f_populateTable = function()
    {

    }

    this.f_handleGridSort = function(col)
    {
        if(thisObj.f_isSortEnabled(thisObj.m_colHd, col))
            thisObj.f_populateTable();
    }

    this.f_handleCheckboxClick = function(chkbox)
    {
        
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

    this.f_stopLoadVMData = function()
    {
    }

    this.f_init = function()
    {
        this.m_hds2s = this.f_createS2SColumns();
        this.m_hdremote = this.f_createRemotesColumns();
        this.m_anchorS2s = this.f_createAnchorDiv('<b>' + g_lang.m_vpnOVS2S + '</b>', 's2s');
        this.m_anchorRemote = this.f_createAnchorDiv('<b>' + g_lang.m_vpnOVRemote + '</b>', 'remote');
        this.m_dummy = this.f_createAnchorDiv('', '');
        this.m_headerS2s = this.f_createGridHeader(this.m_hds2s, 'f_vpnS2SGridHeaderOnclick');
        this.m_bodyS2s = this.f_createGridView(this.m_hds2s);
        this.m_headerRemotes = this.f_createGridHeader(this.m_hdremote, 'f_vpnRemoteGridHeaderOnclick');
        this.m_bodyRemotes = this.f_createGridView(this.m_hdremote);

        this.f_loadVMData();

        return [this.f_headerText(), this.m_anchorS2s, this.m_headerS2s, this.m_bodyS2s,
                this.m_dummy, this.m_anchorRemote, this.m_headerRemotes,
                this.m_bodyRemotes];
    }

    this.f_headerText = function()
    {
        return this.f_createGeneralDiv(g_lang.m_vpnOverviewHeader+"<br><br>");
    }
}
UTM_extend(UTM_confVPNOverview, UTM_confBaseObj);


function f_vpns2sOverViewChkboxCb(e)
{
    g_configPanelObj.m_activeObj.f_s2sChkboxCb();
}

function f_vpnRemoteOverViewChkboxCb(e)
{
    g_configPanelObj.m_activeObj.f_remoteChkboxCb();
}

function f_vpnS2SGridHeaderOnclick(col)
{
    g_configPanelObj.m_activeObj.f_handleGridSort(col);
}

function f_vpnRemoteGridHeaderOnclick(col)
{
    g_configPanelObj.m_activeObj.f_handleGridSort(col);
}