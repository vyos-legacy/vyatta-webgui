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
    this.m_s2sRecs = null;
    this.m_s2sGridChkboxId = "s2sGridChkboxId";
    this.m_remoteRecs = null;
    this.m_remoteGridChkboxId = "remoteGridChkboxId";
    this.m_ugRecs = null;     // remote users table rec.
	this.m_groupRecs = null;

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        this.m_threadId = null;
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
                      this.m_s2sGridChkboxId, "f_vpnChkboxHandler('" +
                      this.m_s2sGridChkboxId + "', 's2s')", 'tooltip');

        cols[0] = this.f_createColumn(g_lang.m_name, 120, 'text', '6', true);
        cols[1] = this.f_createColumn(g_lang.m_vpnOVSource, 100, 'text', '6', true);
        cols[2] = this.f_createColumn(g_lang.m_vpnOVDest, 100, 'text', '6', true);
        cols[3] = this.f_createColumn(g_lang.m_vpnOVPeerDomainName, 110, 'text', '6', true);
        cols[4] = this.f_createColumn(g_lang.m_status, 80, 'text', '6', true);
        cols[5] = this.f_createColumn(g_lang.m_vpnOVConfMode, 100, 'text', '6', true);
        cols[6] = this.f_createColumn(chkbox, 70, 'checkbox', '0', false);
        cols[7] = this.f_createColumn(g_lang.m_delete, 70, 'image', '0');

        return cols;
    }

    this.f_createRemotesColumns = function()
    {
        var cols = [];
        var chkbox = g_lang.m_enabled + '<br>' + thisObj.f_renderCheckbox('no',
                      this.m_remoteGridChkboxId, "f_vpnChkboxHandler('" +
                      this.m_remoteGridChkboxId + "', 'remote')", 'tooltip');

        cols[0] = this.f_createColumn(g_lang.m_username, 120, 'text', '6', true);
        cols[1] = this.f_createColumn(g_lang.m_group, 100, 'text', '6', true);
        cols[2] = this.f_createColumn(g_lang.m_ipAddr, 100, 'text', '6', true);
        cols[3] = this.f_createColumn(g_lang.m_vpnOVLocal + '<br>' + g_lang.m_ipAddr,
                                      110, 'text', '6', true);
        cols[4] = this.f_createColumn(g_lang.m_status, 80, 'text', '6', true);
        cols[5] = this.f_createColumn(g_lang.m_vpnOVConfMode, 100, 'text', '6', true);
        cols[6] = this.f_createColumn(chkbox, 70, 'checkbox', '0');
        cols[7] = this.f_createColumn(g_lang.m_delete, 70, 'image', '0');

        return cols;
    }

    this.f_loadVMData = function()
    {
        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            if(evt != undefined && evt.m_objName == 'UTM_eventObj')
            {
                thisObj.m_s2sRecs = evt.m_value;
                thisObj.f_populateS2STable(thisObj.m_s2sRecs);
                thisObj.f_updateGridHeaderChkbox(thisObj.m_s2sRecs,
                          thisObj.m_s2sGridChkboxId, "s2s_enabledId-");
                thisObj.f_loadRemoteVMData();
            }
        }

        g_utils.f_cursorWait();
        this.m_busLayer.f_vpnGetSite2SiteOverviewConfigData(cb);
    }

    this.f_loadRemoteVMData = function()
    {
        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            if(evt != undefined && evt.m_objName == 'UTM_eventObj')
            {
                thisObj.m_remoteRecs = evt.m_value;
                thisObj.f_populateRemoteTable(thisObj.m_remoteRecs);
                thisObj.f_updateGridHeaderChkbox(thisObj.m_remoteRecs,
                      thisObj.m_remoteGridChkboxId, "remote_enabledId-");
            }
        }

        g_utils.f_cursorWait();
        thisObj.m_busLayer.f_vpnGetRemoteOverviewConfigData(cb);
    }

    this.f_stopLoadVMData = function()
    {
        this.m_busLayer.f_stopVPNRequestThread(this.m_threadId);
    }

    this.f_reappendChildren = function(parent, child)
    {
        for(var i=0; i<child.length; i++)
            parent.appendChild(child[i]);
    }

    this.f_populateS2STable = function(recs)
    {
        thisObj.f_removeDivChildren(thisObj.m_s2sDiv);
        thisObj.f_removeDivChildren(thisObj.m_bodyS2s);
        thisObj.m_headerS2s = thisObj.f_createGridHeader(
                              thisObj.m_hds2s, "f_vpnS2SGridHeaderOnclick");
        thisObj.f_reappendChildren(thisObj.m_s2sDiv, [thisObj.m_anchorS2s,
                  thisObj.m_headerS2s, thisObj.m_bodyS2s, thisObj.m_s2sButtons]);

        //////////////////////////////////
        // perform sorting
        var sortCol = UTM_confVPNOverview.superclass.m_sortCol;
        recs = thisObj.f_createS2SSortingArray(sortCol, recs);

        for(var i=0; i<recs.length; i++)
        {
            var rec = recs[i];
            var c = "<div align=center>";
            var eId = "s2s_enabledId-" + rec.m_tunnel;

            var tname = thisObj.f_renderAnchor(rec.m_tunnel,
                    "f_vpnUpdateHandler('" +
                    rec.m_tunnel + "', 's2s')", 'Click on name for update');

            var enable = c + thisObj.f_renderCheckbox(rec.m_enable, eId,
                          "f_vpnChkboxHandler('"+ eId +"', 's2s')", "") + "</div>";

            var del = c + thisObj.f_renderButton("delete", true,
                          "f_vpnDeleteHandler('" + rec.m_tunnel +
                          "', 's2s')", g_lang.m_tooltip_delete) + "</div>";

            var status = thisObj.f_createStatusDiv(rec.m_status);

            ///////////////////////////////////
            // add fields into grid view
            var div = thisObj.f_createGridRow(thisObj.m_hds2s,
                  [thisObj.f_createSimpleDiv(tname, 'center'),
                  thisObj.f_createSimpleDiv(rec.m_localNetwork, 'center'),
                  thisObj.f_createSimpleDiv(rec.m_remoteNetwork, 'center'),
                  thisObj.f_createSimpleDiv(rec.m_peerIp, 'center'),
                  status,
                  thisObj.f_createSimpleDiv(rec.m_mode, 'center'), enable, del]);

            thisObj.m_bodyS2s.appendChild(div);
        }
    }

    this.f_createStatusDiv = function(status)
    {
        return status == 'disconnected' ?
                    thisObj.f_createSimpleDiv("<b>" + status +
                    "</b>", 'center', 'red') :
                    thisObj.f_createSimpleDiv(status, 'center');
    }

    this.f_createS2SSortingArray = function(sortIndex, zRecs)
    {
        var ar = new Array();
        var recs = new Array();

        for(var i=0; i<zRecs.length; i++)
        {
            // NOTE: the order of this partition same as the order
            // grid columns.
            // compose a default table row
            ar[i] = zRecs[i].m_tunnel + '|' + zRecs[i].m_localNetwork + '|' +
                    zRecs[i].m_remoteNetwork + '|' + zRecs[i].m_peerIp + '|' +
                    zRecs[i].m_status + '|' + zRecs[i].m_mode + '|' +
                    zRecs[i].m_enable;
        }

        var sar = thisObj.f_sortArray(sortIndex, ar);
        for(var i=0; i<sar.length; i++)
        {
            var r = sar[i].split("|");
            var rec = new UTM_vpnRecord(r[0], r[5], r[1], r[2], r[3], r[4], r[6]);
            recs.push(rec);
        }

        return recs;
    }

    this.f_populateRemoteTable = function(recs)
    {
        thisObj.f_removeDivChildren(thisObj.m_remoteDiv);
        thisObj.f_removeDivChildren(thisObj.m_bodyRemotes);
        thisObj.m_headerRemotes = thisObj.f_createGridHeader(thisObj.m_hdremote,
                                    'f_vpnRemoteGridHeaderOnclick');
        thisObj.f_reappendChildren(thisObj.m_remoteDiv, [thisObj.m_anchorRemote,
                  thisObj.m_headerRemotes, thisObj.m_bodyRemotes,
                  thisObj.m_remoteButtons]);

        //////////////////////////////////
        // perform sorting
        var sortCol = UTM_confVPNOverview.superclass.m_sortCol;
        recs = thisObj.f_createRemoteSortingArray(sortCol, recs);
        for(var i=0; i<recs.length; i++)
        {
            var rec = recs[i];
            var c = "<div align=center>";
            var eId = "remote_enabledId-" + rec.m_userName;

            var uname = thisObj.f_renderAnchor(rec.m_userName,
                    "f_vpnUpdateHandler('" + rec.m_userName + "', 'remote', 'user')",
                    'Click on name for update');

            var gname = thisObj.f_renderAnchor(rec.m_groupName,
                    "f_vpnUpdateHandler('" + rec.m_groupName + "', 'remote', 'group')",
                    'Click on name for update');

            var enable = c + thisObj.f_renderCheckbox(rec.m_enable, eId,
                          "f_vpnChkboxHandler('"+ eId +"', 'remote')", "") + "</div>";

            var del = c + thisObj.f_renderButton("delete", true,
                          "f_vpnDeleteHandler('" + rec.m_userName +
                          "', 'remote')", g_lang.m_tooltip_delete) + "</div>";

            var status = thisObj.f_createStatusDiv(rec.m_status);

            ///////////////////////////////////
            // add fields into grid view
            var div = thisObj.f_createGridRow(thisObj.m_hdremote,
                  [thisObj.f_createSimpleDiv(uname, 'center'),
                  thisObj.f_createSimpleDiv(gname, 'center'),
                  thisObj.f_createSimpleDiv(rec.m_ipAddr, 'center'),
                  thisObj.f_createSimpleDiv(rec.m_localIpAddr, 'center'),
                  status,
                  thisObj.f_createSimpleDiv(rec.m_mode, 'center'), enable, del]);

            thisObj.m_bodyRemotes.appendChild(div);
        }
    }

    this.f_createRemoteSortingArray = function(sortIndex, zRecs)
    {
        var ar = new Array();
        var recs = new Array();

        for(var i=0; i<zRecs.length; i++)
        {
            // NOTE: the order of this partition same as the order
            // grid columns.
            // compose a default table row
            ar[i] = zRecs[i].m_userName + '|' + zRecs[i].m_groupName + '|' +
                    zRecs[i].m_ipAddr + '|' + zRecs[i].m_localIpAddr + '|' +
                    zRecs[i].m_status + '|' + zRecs[i].m_mode + '|' +
                    zRecs[i].m_enable;
        }

        var sar = thisObj.f_sortArray(sortIndex, ar);
        for(var i=0; i<sar.length; i++)
        {
            var r = sar[i].split("|");
            var rec = new UTM_vpnRemoteOverviewRec(r[0], r[1], r[2], r[3], r[4], r[5], r[6]);
            recs.push(rec);
        }

        return recs;
    }

    this.f_handleS2sGridSort = function(col)
    {
        if(thisObj.f_isSortEnabled(thisObj.m_hds2s, col))
            thisObj.f_populateS2STable(thisObj.m_s2sRecs);
    }

    this.f_getS2SRecByName = function(name)
    {
        if(thisObj.m_s2sRecs != null)
        {
            for(var i=0; i<thisObj.m_s2sRecs.length; i++)
            {
                if(thisObj.m_s2sRecs[i].m_tunnel == name)
                    return thisObj.m_s2sRecs[i];
            }
        }

        return null;
    }

    this.f_getRemoteUsersRecByUserName = function(name)
    {
        if(thisObj.m_ugRecs != null)
        {
            for(var i=0; i<thisObj.m_ugRecs.length; i++)
            {
                if(thisObj.m_ugRecs[i].m_userName == name)
                    return thisObj.m_ugRecs[i];
            }
        }

        return null;
    }

    this.f_getRemoteUsersRecByGroupName = function(name)
    {
        if(thisObj.m_ugRecs != null)
        {
            for(var i=0; i<thisObj.m_ugRecs.length; i++)
            {
                if(thisObj.m_ugRecs[i].m_groupName == name)
                    return thisObj.m_ugRecs[i];
            }
        }

        return null;
    }

    this.f_getRemoteRecByName = function(name)
    {
        if(thisObj.m_remoteRecs != null)
        {
            for(var i=0; i<thisObj.m_remoteRecs.length; i++)
            {
                if(thisObj.m_remoteRecs[i].m_userName == name)
                    return thisObj.m_remoteRecs[i];
            }
        }

        return null;
    }

    this.f_updateGridHeaderChkbox = function(gridRecs, gridChkboxId, rowChkboxId)
    {
        var el = null;
        var checked = gridRecs.length <= 0 ? false:true;

        for(var i=0; i<gridRecs.length; i++)
        {
            var rec = gridRecs[i];

            if(gridChkboxId.indexOf("s2s") >= 0)
                el = document.getElementById(rowChkboxId+rec.m_tunnel);
            else
                el = document.getElementById(rowChkboxId+rec.m_userName);

            if(el != null)
            {
                if(!el.checked)
                {
                    checked = false;
                    break;
                }
            }
        }

        el = document.getElementById(gridChkboxId);
        el.checked = checked;

        if(gridRecs.length <= 0)
            el.disabled = true;
        else
            el.disabled = false;
    }

    this.f_s2sChkboxCb = function(eid)
    {
        if(this.m_sendList == null) this.m_sendList = [];

        if(eid == this.m_s2sGridChkboxId)
        {
            var el = document.getElementById(eid);

            for(var i=0; i<this.m_s2sRecs.length; i++)
            {
                var rec = this.m_s2sRecs[i];
                var eeid = "s2s_enabledId-" + rec.m_tunnel;
                var eel = document.getElementById(eeid);

                if(eel != null)
                {
                    if(eel.checked != el.checked)
                        this.m_sendList.push(eeid);

                    eel.checked = el.checked;
                }
            }
        }
        else if(eid.indexOf("s2s_enabledId-") >= 0)
        {
            this.f_updateGridHeaderChkbox(this.m_s2sRecs, this.m_s2sGridChkboxId,
                                          "s2s_enabledId-");
            this.m_sendList.push(eid);
        }

        this.f_setEnableValue2Server();
    }

    this.f_remoteChkboxCb = function(eid)
    {
        if(this.m_sendList == null) this.m_sendList = [];

        if(eid == this.m_remoteGridChkboxId)
        {
            var el = document.getElementById(eid);
            for(var i=0; i<this.m_remoteRecs.length; i++)
            {
                var rec = this.m_remoteRecs[i];
                var eeid = "remote_enabledId-" + rec.m_userName;
                var eel = document.getElementById(eeid);
                if(eel != null)
                {
                    if(eel.checked != el.checked)
                        this.m_sendList.push(eeid);

                    eel.checked = el.checked;
                }
            }
        }
        else if(eid.indexOf("remote_enabledId-") >= 0)
        {
            this.f_updateGridHeaderChkbox(this.m_remoteRecs,
                      this.m_remoteGridChkboxId, "remote_enabledId-");
            this.m_sendList.push(eid);
        }

        this.f_setEnableValue2Server();
    }

    this.f_setEnableValue2Server = function()
    {
        var cb = function(evt)
        {
            if(evt.m_errCode != 0)
                alert("set enable error: " + evt.m_errMsg + " for " + eid);

            if(thisObj.m_sendList.length > 0)
                thisObj.f_setEnableValue2Server();
        }

        var eid = this.m_sendList.pop();
        if(eid != null)
        {
            ///////////////////////////////////////////
            // submit set to server.
            var el = document.getElementById(eid);
            var ids = eid.split("-");
            var rec = eid.indexOf("s2s_enabledId-") >= 0 ?
                      this.f_getS2SRecByName(ids[1]) :
                      this.f_getRemoteRecByName(ids[1]);

            rec.m_enable = el.checked ? 'yes' : 'no';
            this.m_busLayer.f_vpnSetOverviewEnableValue(rec, cb);
        }
    }

    this.f_handleS2SUpdate = function(name)
    {
        var rec = this.f_getS2SRecByName(name);
        g_configPanelObj.m_previousPage = VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_OVERVIEW_ID;

        if(rec != null)
            g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_S2S_ID, rec, true);
    }

    this.f_handleRemoteUpdate = function(name, objType)
    {
        var rec = null;
        g_configPanelObj.m_previousPage = VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_OVERVIEW_ID;

        if (objType == 'user') {
            rec = thisObj.f_getRemoteUsersRecByUserName(name);
            if (rec != null) {
                g_configPanelObj.f_showPage(
                  VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_REMOTE_USR_ADD_ID,
                  [rec.m_userName, rec.m_groupName]);
            }
        } else {
            rec = thisObj.f_getRemoteUsersRecByGroupName(name);
            if (rec != null) {
                g_configPanelObj.f_showPage(
                    VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_REMOTE_USR_GRP_ID,
                    rec.m_groupName);
            }
        }
    }

    this.f_handleS2SDelete = function(name)
    {
        var cb = function(evt)
        {
            thisObj.f_stopLoadVMData();
            thisObj.f_loadVMData();
        }
        var rec = this.f_getS2SRecByName(name);
		if (rec != null) {
			this.m_busLayer.f_vpnDeleteSite2SiteOverviewConfig(rec, cb);
		}
    }

    this.f_handleRemoteDelete = function(name)
    {
        var cb = function(evt)
        {
            if(evt.m_errCode == 0)
            {
                thisObj.f_stopLoadVMData();
                thisObj.f_loadRemoteVMData();
            }
            else
                alert('error ' + evt.m_errMsg);
        }

        this.m_busLayer.f_vpnDeleteRemoteOverviewConfig(name, cb);
    }

    this.f_handleRemoteGridSort = function(col)
    {
        if(thisObj.f_isSortEnabled(thisObj.m_hdremote, col))
            thisObj.f_populateRemoteTable(thisObj.m_remoteRecs);
    }

    this.f_init = function()
    {
        // init s2s grid table
        this.m_hds2s = this.f_createS2SColumns();
        this.m_anchorS2s = this.f_createGeneralDiv('<b>' + g_lang.m_vpnOVS2S + '</b><br><br>');
        this.m_headerS2s = this.f_createGridHeader(this.m_hds2s, 'f_vpnS2SGridHeaderOnclick');
        this.m_bodyS2s = this.f_createGridView(this.m_hds2s, false);
        var btns = [['Add', "f_vpnAddHandler('s2s')"]];
        this.m_s2sButtons = this.f_createButtons(btns, 'left');
        this.m_s2sDiv = this.f_createEmptyDiv([this.m_anchorS2s,
                      this.m_headerS2s, this.m_bodyS2s, this.m_s2sButtons]);

        // init remote grid table
        this.m_hdremote = this.f_createRemotesColumns();
        this.m_anchorRemote = this.f_createGeneralDiv('<b>' + g_lang.m_vpnOVRemote + '</b><br><br>');
        this.m_anchorRemote.style.marginTop = "35px";
        this.m_headerRemotes = this.f_createGridHeader(this.m_hdremote, 'f_vpnRemoteGridHeaderOnclick');
        this.m_bodyRemotes = this.f_createGridView(this.m_hdremote, false);
        btns = [['Add', "f_vpnAddHandler('remote')"]];
        this.m_remoteButtons = this.f_createButtons(btns, 'left');
        this.m_remoteDiv = this.f_createEmptyDiv([this.m_anchorRemote,
                  this.m_headerRemotes, this.m_bodyRemotes, this.m_remoteButtons]);
        this.m_remoteDiv = this.f_createEmptyDiv();

        this.f_loadVMData();

        return [this.m_s2sDiv, this.m_remoteDiv];
    }
}
UTM_extend(UTM_confVPNOverview, UTM_confBaseObj);
////////////////////////////////////////////////////////////////////////////////

function f_vpnAddHandler(grid)
{
    g_configPanelObj.m_previousPage = VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_OVERVIEW_ID;

    if(grid == 's2s')
        g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_S2S_ID);
    else
        g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_REMOTE_USR_ADD_ID);
}

function f_vpnChkboxHandler(eid, grid)
{
    if(grid == "s2s")
        g_configPanelObj.m_activeObj.f_s2sChkboxCb(eid);
    else
        g_configPanelObj.m_activeObj.f_remoteChkboxCb(eid);
}

function f_vpnS2SGridHeaderOnclick(col)
{
    g_configPanelObj.m_activeObj.f_handleS2sGridSort(col);
}
function f_vpnRemoteGridHeaderOnclick(col)
{
    g_configPanelObj.m_activeObj.f_handleRemoteGridSort(col);
}

function f_vpnUpdateHandler(name, grid, objType)
{
    if(grid == "s2s")
        g_configPanelObj.m_activeObj.f_handleS2SUpdate(name);
    else
        g_configPanelObj.m_activeObj.f_handleRemoteUpdate(name, objType);
}

function f_deleteConfirmation(e, name, grid)
{
    if(e.getAttribute('id')== 'ft_popup_message_apply')
    {
        if(grid == "s2s")
            g_configPanelObj.m_activeObj.f_handleS2SDelete(name);
        else
            g_configPanelObj.m_activeObj.f_handleRemoteDelete(name);
    }
}
function f_vpnDeleteHandler(name, grid)
{
    g_utils.f_popupMessage(g_lang.m_vpnDeleteConfirm + " " + name,
                'confirm', g_lang.m_vpnDeleteTitle, true,
                "f_deleteConfirmation(this, '"+name+"', '" + grid + "')");
}
