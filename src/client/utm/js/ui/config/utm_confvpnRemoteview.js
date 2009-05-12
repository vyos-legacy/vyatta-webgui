/*
    Document   : utm_confvpnRemoteview.js
    Created on : Apr 01, 2009, 11:21:31 AM
    Author     : Kevin.Choi
    Description:
*/

function UTM_confVPNRemoteview(name, callback, busLayer)
{
    var thisObj = this;
    this.thisObjName = 'UTM_confVPNRemoteview';

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        UTM_confVPNRemoteview.superclass.constructor(name, callback, busLayer);
    }
    this.constructor(name, callback, busLayer);

    this.f_getConfigurationPage = function()
    {
        var div = this.f_getPanelDiv(this.f_init());
		thisObj.f_resize();
		return div;
    }

    this.f_createGroupColumns = function()
    {
        var cols = [];
        var chkbox = 'Enabled<br>' + thisObj.f_renderCheckbox('no',
                      'vpnGroupsRemoteView', 'f_vpnRemoteViewGroupChkboxCb',
                      'tooltip');

        cols[0] = this.f_createColumn('Name<br>', 110, 'text', '6');
        cols[1] = this.f_createColumn('Authentification<br>', 120, 'text', '6');
        cols[2] = this.f_createColumn('Internet Access<br>', 100, 'text', '6');
        cols[3] = this.f_createColumn('User<br>', 110, 'text', '6');
        cols[4] = this.f_createColumn(chkbox, 70, 'checkbox', '45');
        cols[5] = this.f_createColumn('Delete<br>', 70, 'image', '45');

        return cols;
    }

    this.f_createUserColumns = function()
    {
        var cols = [];
        var chkbox = 'Enabled<br>' + thisObj.f_renderCheckbox('no',
                      'vpnUsersRemoteView', 'f_vpnRemoteViewUserChkboxCb',
                      'tooltip');

        cols[0] = this.f_createColumn('User Name<br>', 220, 'text', '6');
        cols[1] = this.f_createColumn('Group<br>', 220, 'text', '6');
        cols[2] = this.f_createColumn(chkbox, 70, 'checkbox', '45');
        cols[3] = this.f_createColumn('Delete<br>', 70, 'image', '45');

        return cols;
    }

    this.f_groupsChkboxCb = function()
    {

    }

    this.f_usersChkboxCb = function()
    {

    }

    this.f_loadVMData = function()
    {
        //this.m_hds2s = this.f_createGroupColumns();
        //this.m_hdRemote = this.f_createUserColumns();
        thisObj.m_updateFields = [];

        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            if(evt != undefined && evt.m_objName == 'FT_eventObj')
            {

            }
        };

        g_utils.f_cursorWait();
        //this.m_threadId = this.m_busLayer.f_startVMRequestThread(cb);
    };

    this.f_handleCheckboxClick = function(chkbox)
    {

    }

    this.f_stopLoadVMData = function()
    {
    }

    this.f_init = function()
    {
        this.m_hds2s = this.f_createGroupColumns();
        this.m_hdRemote = this.f_createUserColumns();
        this.m_anchorGroups = this.f_createAnchorDiv('<b>Groups:</b>', 'group', 'f_vpnRemoteViewGroupHandler()');
        this.m_anchorUsers = this.f_createAnchorDiv('<b>Users:</b>', 'user', 'f_vpnRemoteViewUserHandler()');
        this.m_dummy = this.f_createAnchorDiv('', '');
        this.m_headerGroups = this.f_createGridHeader(this.m_hds2s);
        this.m_bodyGroups = this.f_createGridView(this.m_hds2s);
        this.m_headerUsers = this.f_createGridHeader(this.m_hdRemote);
        this.m_bodyUsers = this.f_createGridView(this.m_hdRemote);

        this.f_loadVMData();

        return [this.f_headerText(), this.m_anchorGroups, this.m_headerGroups,
                this.m_bodyGroups,
                this.m_dummy, this.m_anchorUsers, this.m_headerUsers,
                this.m_bodyUsers];
    }

    this.f_headerText = function()
    {
        return this.f_createGeneralDiv(g_lang.m_vpnRemoteviewHeader+"<br><br><br>");
    }
}
UTM_extend(UTM_confVPNRemoteview, UTM_confBaseObj);


function f_vpnRemoteViewGroupChkboxCb(e)
{
    g_configPanelObj.m_activeObj.f_groupsChkboxCb();
}

function f_vpnRemoteViewUserChkboxCb(e)
{
    g_configPanelObj.m_activeObj.f_usersChkboxCb();
}

function f_vpnRemoteViewGroupHandler()
{
    g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_REMOTE_USR_GRP_ID);
}

function f_vpnRemoteViewUserHandler()
{
    g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_REMOTE_USR_GRP_ID);
}
