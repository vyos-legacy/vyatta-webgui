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
    this.m_groupRecs = null;
    this.m_userRecs = null;

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
        this.m_groupRecs = null;
        this.m_userRecs = null;

        var div = this.f_getPanelDiv(this.f_init());
		thisObj.f_resize();
		return div;
    }

    this.f_createGroupColumns = function()
    {
        var cols = [];
        var chkbox = 'Enabled<br>' + thisObj.f_renderCheckbox('no',
                      'vpnGroupsRemoteView', 'f_vpnRemoteViewGroupHdChkboxCb',
                      'tooltip');

        cols[0] = this.f_createColumn('Name<br>', 110, 'text', '6');
        cols[1] = this.f_createColumn('Authentification<br>', 120, 'text', '6');
        cols[2] = this.f_createColumn('Internet Access<br>', 100, 'text', '6');
        cols[3] = this.f_createColumn('User<br>', 110, 'text', '6');
        cols[4] = this.f_createColumn(chkbox, 70, 'checkbox', '0');
        cols[5] = this.f_createColumn('Delete<br>', 70, 'image', '0');

        return cols;
    }

    this.f_createUserColumns = function()
    {
        var cols = [];
        var chkbox = 'Enabled<br>' + thisObj.f_renderCheckbox('no',
                      'vpnUsersRemoteView', 'f_vpnRemoteViewUserHdChkboxCb',
                      'tooltip');

        cols[0] = this.f_createColumn('User Name<br>', 220, 'text', '6');
        cols[1] = this.f_createColumn('Group<br>', 220, 'text', '6');
        cols[2] = this.f_createColumn(chkbox, 70, 'checkbox', '0');
        cols[3] = this.f_createColumn('Delete<br>', 70, 'image', '0');

        return cols;
    }

    this.f_groupsChkboxCb = function()
    {

    }

    this.f_usersChkboxCb = function()
    {

    }

    this.f_loadVMDataRemoteUser = function()
    {
        var cb = function(evt)
        {
            g_utils.f_cursorDefault();

            if(evt != undefined && evt.m_objName == 'UTM_eventObj')
            {
                thisObj.m_userRecs = evt.m_value;
                thisObj.f_populateUsersTable(thisObj.m_userRecs);
            }
        }

        g_utils.f_cursorWait();
        this.m_busLayer.f_vpnGetRemoteUser(null, cb);
    }

    this.f_loadVMData = function()
    {
        thisObj.m_updateFields = [];

        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            if(evt != undefined && evt.m_objName == 'UTM_eventObj')
            {
                thisObj.m_groupRecs = evt.m_value;
                thisObj.f_populateGroupTable(thisObj.m_groupRecs);
                thisObj.f_loadVMDataRemoteUser();
            }
        };

        g_utils.f_cursorWait();
        this.m_busLayer.f_vpnGetRemoteUserGroup(null, cb);
    };

    this.f_populateGroupTable = function(recs)
    {
        thisObj.f_removeDivChildren(thisObj.m_grpDiv);
        thisObj.f_removeDivChildren(thisObj.m_bodyGroup);
        thisObj.m_headerGroup = thisObj.f_createGridHeader(thisObj.m_hdGroup,
                                  'f_vpnGroupGridHeaderOnclick');
        thisObj.f_reappendChildren(thisObj.m_grpDiv, [thisObj.m_anchorGroup,
                  thisObj.m_headerGroup, thisObj.m_bodyGroup, thisObj.m_grpButtons]);

        //////////////////////////////////
        // perform sorting
        var sortCol = UTM_confVPNOverview.superclass.m_sortCol;
        //recs = thisObj.f_createGroupSortingArray(sortCol, recs);
        for(var i=0; i<recs.length; i++)
        {
            var rec = recs[i];
            var c = "<div align=center>";
            var eId = "remote_enabledId-" + rec.m_name;

            var gname = thisObj.f_renderAnchor(rec.m_name,
                    "f_vpnGroupUpdateHandler('" + rec.m_name + "')",
                    'Click on name for update');

            var enable = c + thisObj.f_renderCheckbox(rec.m_enable, eId,
                          "f_vpnChkboxHandler('"+ eId +"', 'remote')", "") + "</div>";

            var del = c + thisObj.f_renderButton("delete", true,
                          "f_vpnGroupDeleteHandler('" + rec.m_name +
                          "')", g_lang.m_tooltip_delete) + "</div>";

            ///////////////////////////////////
            // add fields into grid view
            var div = thisObj.f_createGridRow(thisObj.m_hdGroup,
                  [thisObj.f_createSimpleDiv(gname, 'center'),
                  thisObj.f_createSimpleDiv(rec.m_auth, 'center'),
                  thisObj.f_createSimpleDiv(rec.m_internetAccess, "center"),
                  thisObj.f_createGroupUserDiv(rec.m_users),
                  enable, del]);

            thisObj.m_bodyGroup.appendChild(div);
        }
    }

    this.f_getGroupRecByName = function(name)
    {
        if(thisObj.m_groupRecs != null)
        {
            for(var i=0; i<thisObj.m_groupRecs.length; i++)
                if(thisObj.m_groupRecs[i].m_name == name)
                    return thisObj.m_groupRecs[i];
        }

        return null;
    }

    this.f_createGroupUserDiv = function(users)
    {
        var ulist = "";

        if(users != null && users.length > 0)
        {
            for(var i=0; i<users.length; i++)
            {
                ulist += users[i] + "<br>";
            }
        }

        return thisObj.f_createSimpleDiv(ulist, "center");
    }

    this.f_populateUsersTable = function(recs)
    {
        thisObj.f_removeDivChildren(thisObj.m_userDiv);
        thisObj.f_removeDivChildren(thisObj.m_bodyUser);
        thisObj.m_headerUser = thisObj.f_createGridHeader(thisObj.m_hdUser, 'f_vpnUserGridHeaderOnclick');
        thisObj.f_reappendChildren(thisObj.m_userDiv, [thisObj.m_anchorUsers,
                  thisObj.m_headerUsers, thisObj.m_bodyUsers, thisObj.m_userButtons]);

        //////////////////////////////////
        // perform sorting
        var sortCol = UTM_confVPNOverview.superclass.m_sortCol;
        //recs = thisObj.f_createGroupSortingArray(sortCol, recs);
        for(var i=0; i<recs.length; i++)
        {
            var rec = recs[i];
            var c = "<div align=center>";
            var eId = "remote_enabledId-" + rec.m_userRec.m_userName;

            var uname = thisObj.f_renderAnchor(rec.m_userRec.m_userName,
                    "f_vpnUpdateHandler('" + rec.m_userRec.m_userName + "', 'remote', 'user')",
                    'Click on name for update');

            var gname = thisObj.f_renderAnchor(rec.m_groupRec.m_name,
                    "f_vpnUpdateHandler('" + rec.m_groupRec.m_name + "', 'remote', 'group')",
                    'Click on name for update');

            var enable = c + thisObj.f_renderCheckbox("yes", eId,
                          "f_vpnChkboxHandler('"+ eId +"', 'remote')", "") + "</div>";

            var del = c + thisObj.f_renderButton("delete", true,
                          "f_vpnDeleteHandler('" + rec.m_userRec.m_userName +
                          "', 'remote')", g_lang.m_tooltip_delete) + "</div>";

            var status = thisObj.f_createStatusDiv(rec.m_status);

            ///////////////////////////////////
            // add fields into grid view
            var div = thisObj.f_createGridRow(thisObj.m_hdremote,
                  [thisObj.f_createSimpleDiv(uname, 'center'),
                  thisObj.f_createSimpleDiv(gname, 'center'),
                  thisObj.f_createSimpleDiv(rec.m_groupRec.f_getLocalNetworkIp(), 'center'),
                  thisObj.f_createSimpleDiv(rec.m_groupRec.f_getRemoteNetworkIp(), 'center'),
                  status,
                  thisObj.f_createSimpleDiv(rec.m_groupRec.m_mode, 'center'), enable, del]);

            thisObj.m_bodyRemotes.appendChild(div);
        }
    }

    this.f_reappendChildren = function(parent, child)
    {
        for(var i=0; i<child.length; i++)
            parent.appendChild(child[i]);
    }

    this.f_handleCheckboxClick = function(chkbox)
    {

    }

    this.f_stopLoadVMData = function()
    {
    }

    this.f_init = function()
    {
        // group
        this.m_hdGroup = this.f_createGroupColumns();
        this.m_anchorGroup = this.f_createGeneralDiv('<b>Groups:</b><br><br>');
        this.m_headerGroup = this.f_createGridHeader(this.m_hdGroup, 'f_vpnGroupGridHeaderOnclick');
        this.m_bodyGroup = this.f_createGridView(this.m_hdGroup, false);
        var btns = [['Add', "f_vpnRemoteAddHandler('group')"]];
        this.m_grpButtons = this.f_createButtons(btns, 'left');
        this.m_grpDiv = this.f_createEmptyDiv([this.m_anchorGroup,
                      this.m_headerGroup, this.m_bodyGroup, this.m_grpButtons]);

        // users
        this.m_hdUser = this.f_createUserColumns();
        this.m_anchorUsers = this.f_createGeneralDiv('<b>Users:</b><br><br>');
        this.m_anchorUsers.style.marginTop = "35px";
        this.m_headerUsers = this.f_createGridHeader(this.m_hdUser, 'f_vpnUserGridHeaderOnclick');
        this.m_bodyUsers = this.f_createGridView(this.m_hdUser, false);
        btns = [['Add', "f_vpnRemoteAddHandler('user')"]];
        this.m_userButtons = this.f_createButtons(btns, 'left');
        this.m_userDiv = this.f_createEmptyDiv([this.m_anchorUsers]);

        this.f_loadVMData();

        return [this.f_headerText(), this.m_grpDiv, this.m_userDiv];
    }

    this.f_headerText = function()
    {
        return this.f_createGeneralDiv(g_lang.m_vpnRemoteviewHeader+"<br><br><br>");
    }
}
UTM_extend(UTM_confVPNRemoteview, UTM_confBaseObj);


function f_vpnRemoteViewGroupHdChkboxCb(e)
{
    g_configPanelObj.m_activeObj.f_groupsChkboxCb();
}

function f_vpnRemoteViewUserHdChkboxCb(e)
{
    g_configPanelObj.m_activeObj.f_usersChkboxCb();
}

function f_vpnGroupGridHeaderOnclick(col)
{
    g_configPanelObj.m_activeObj.f_handleS2sGridSort(col);
}

function f_vpnUserGridHeaderOnclick(col)
{

}

function f_vpnGroupUpdateHandler(gName)
{
    var gRec = g_configPanelObj.m_activeObj.f_getGroupRecByName(gName);
    g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_REMOTE_USR_GRP_ID, gRec);
}

function f_vpnUserUpdateHandler(uRec)
{

}

function f_vpnGroupDeleteHandler(eid)
{

}

function f_vpnUserDeleteHandler(eid)
{

}

function f_vpnRemoteAddHandler(table)
{
    if(table == 'group')
        g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_REMOTE_USR_GRP_ID);
    else
        g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_REMOTE_USR_ADD_ID);
}