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
    this.m_btnS2SAddId = "vpnS2SAddId";
    this.m_btnS2SApplyId = "vpnS2SApplyId";
    this.m_btnS2SCancelId = "vpnS2SCancelId";
    this.m_s2sRecs = null;
    this.m_s2sGridChkboxId = "s2sGridChkboxId";
    this.m_remoteRecs = null;
    this.m_remoteGridChkboxId = "remoteGridChkboxId";

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
                      this.m_s2sGridChkboxId, "f_vpnS2SChkboxHandler('" +
                      this.m_s2sGridChkboxId + "')", 'tooltip');

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
                      this.m_remoteGridChkboxId, "f_vpnRemoteChkboxCb('" +
                      this.m_remoteGridChkboxId + "')", 'tooltip');

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
        //var wait = true;

        var cb = function(evt)
        {
            //if(wait)
            {
                g_utils.f_cursorDefault();
            //    wait = false;
            }

            if(evt != undefined && evt.m_objName == 'UTM_eventObj')
            {
                thisObj.m_s2sRecs = evt.m_value;
                thisObj.f_populateS2STable(thisObj.m_s2sRecs);
            }
        }

        g_utils.f_cursorWait();
        //this.m_threadId = this.m_busLayer.f_startVPNRequestThread(cb);
        this.m_busLayer.f_vpnGetSite2SiteConfigData(cb);
    }

    this.f_stopLoadVMData = function()
    {
        this.m_busLayer.f_stopVPNRequestThread(this.m_threadId);
    }

    this.f_reappendChildren = function()
    {
        thisObj.m_div.appendChild(thisObj.m_anchorS2s);
        thisObj.m_div.appendChild(thisObj.m_headerS2s);
        thisObj.m_div.appendChild(thisObj.m_bodyS2s);
        thisObj.m_div.appendChild(thisObj.m_buttons);
        thisObj.m_div.appendChild(thisObj.m_anchorRemote);
        thisObj.m_div.appendChild(thisObj.m_headerRemotes);
        thisObj.m_div.appendChild(thisObj.m_bodyRemotes);
    }

    this.f_populateS2STable = function(recs)
    {
        thisObj.f_removeDivChildren(thisObj.m_div);
        thisObj.f_removeDivChildren(thisObj.m_bodyS2s);
        thisObj.m_headerS2s = thisObj.f_createGridHeader(
                thisObj.m_hds2s, "f_vpnS2SGridHeaderOnclick");
        thisObj.f_reappendChildren();

        //////////////////////////////////
        // perform sorting
        var sortCol = UTM_confVPNOverview.superclass.m_sortCol;
        recs = thisObj.f_createSortingArray(sortCol, recs);

        for(var i=0; i<recs.length; i++)
        {
            var rec = recs[i];
            var c = "<div align=center>";
            var eId = "s2s_enabledId-" + rec.m_tunnel;

            var tname = thisObj.f_renderAnchor(rec.m_tunnel,
                    "f_s2sUpdateHandler('" +
                    rec.m_tunnel + "')", 'Click on name for update');

            var enable = c + thisObj.f_renderCheckbox(rec.m_enable, eId,
                          "f_vpnS2SChkboxHandler('"+ eId +"')", "") + "</div>";

            var del = c + thisObj.f_renderButton("delete", true,
                          "f_s2sDeleteHandler('" + rec.m_tunnel +
                          "')", g_lang.m_tooltip_delete) + "</div>";

            var status = rec.m_status == 'disconnected' ?
                          thisObj.f_createSimpleDiv("<b>" + rec.m_status +
                          "</b>", 'center', 'red') :
                          thisObj.f_createSimpleDiv(rec.m_status, 'center');


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

    this.f_createSortingArray = function(sortIndex, zRecs)
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

    this.f_populateRemoteTable = function()
    {

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

    this.f_enabledActionButtons = function(enabled)
    {
        thisObj.f_enabledDisableButton(thisObj.m_btnS2SApplyId, enabled);
        thisObj.f_enabledDisableButton(thisObj.m_btnS2SCancelId, enabled);
    };

    this.f_updateS2SChkbox = function()
    {
        var checked = true;

        for(var i=0; i<this.m_s2sRecs.length; i++)
        {
            var rec = this.m_s2sRecs[i];
            var el = document.getElementById("s2s_enabledId-"+rec.m_tunnel);

            if(el != null)
            {
                if(!el.checked)
                {
                    checked = false;
                    break;
                }
            }
        }

        var el = document.getElementById(this.m_s2sGridChkboxId);
        el.checked = checked;
    }

    this.f_s2sChkboxCb = function(eid)
    {
        if(eid == this.m_s2sGridChkboxId)
        {
            var el = document.getElementById(eid);
            for(var i=0; i<this.m_s2sRecs.length; i++)
            {
                var rec = this.m_s2sRecs[i];
                var eel = document.getElementById("s2s_enabledId-" + rec.m_tunnel);
                if(eel != null)
                    eel.checked = el.checked;
            }
        }
        else if(eid.indexOf("s2s_enabledId-") >= 0)
        {
            this.f_updateS2SChkbox();
        }

        this.f_enabledActionButtons(true);
    }

    this.f_remoteChkboxCb = function()
    {

    }

    this.f_handleS2SUpdate = function(name)
    {
        var rec = this.f_getS2SRecByName(name);

        if(rec != null)
            g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_S2S_ID, rec);
    }

    this.f_handleS2SApply = function()
    {
        var cb = function(evt)
        {

        }

        //this.m_busLayer
    }

    this.f_handleS2SDelete = function(name)
    {
        var cb = function(evt)
        {
            thisObj.f_stopLoadVMData();
            thisObj.f_loadVMData();
        }

        this.m_busLayer.f_vpnDeleteSite2SiteConfig(name, cb);
    }

    this.f_handleRemoteGridSort = function(col)
    {
        if(thisObj.f_isSortEnabled(thisObj.m_hdremote, col))
            thisObj.f_populateRemoteTable();
    }

    this.f_handleCheckboxClick = function(chkbox)
    {
        
    }

    this.f_init = function()
    {
        this.m_hds2s = this.f_createS2SColumns();
        this.m_anchorS2s = this.f_createAnchorDiv('<b>' + g_lang.m_vpnOVS2S + '</b>', 's2s');
        this.m_headerS2s = this.f_createGridHeader(this.m_hds2s, 'f_vpnS2SGridHeaderOnclick');
        this.m_bodyS2s = this.f_createGridView(this.m_hds2s);

        this.m_hdremote = this.f_createRemotesColumns();
        this.m_anchorRemote = this.f_createAnchorDiv('<b>' + g_lang.m_vpnOVRemote + '</b>', 'remote');
        this.m_anchorRemote.style.marginTop = "35px";
        this.m_headerRemotes = this.f_createGridHeader(this.m_hdremote, 'f_vpnRemoteGridHeaderOnclick');
        this.m_bodyRemotes = this.f_createGridView(this.m_hdremote);

        var btns = [['Add', "f_site2siteAddHandler()",
                    g_lang.m_fireCustAddTip, this.m_btnS2SAddId],
                    ['Apply', "f_site2siteApplyHandler()",
                    g_lang.m_fireLevelApplyTip, this.m_btnS2SApplyId, false],
                    ['Cancel', "f_site2siteCancelHandler()",
                    g_lang.m_fireLevelCancelTip, this.m_btnS2SCancelId, false]];
        this.m_buttons = this.f_createButtons(btns, 'center');

        this.f_loadVMData();

        return [this.m_anchorS2s, this.m_headerS2s, this.m_bodyS2s, this.m_buttons,
                this.m_anchorRemote, this.m_headerRemotes, this.m_bodyRemotes];
    }
}
UTM_extend(UTM_confVPNOverview, UTM_confBaseObj);
////////////////////////////////////////////////////////////////////////////////

function f_site2siteAddHandler(e)
{
    g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_S2S_ID);
}

function f_vpnS2SChkboxHandler(eid)
{
    g_configPanelObj.m_activeObj.f_s2sChkboxCb(eid);
}

function f_vpnRemoteChkboxCb(eid)
{
    g_configPanelObj.m_activeObj.f_remoteChkboxCb();
}

function f_vpnS2SGridHeaderOnclick(col)
{
    g_configPanelObj.m_activeObj.f_handleS2sGridSort(col);
}

function f_vpnRemoteGridHeaderOnclick(col)
{
    g_configPanelObj.m_activeObj.f_handleRemoteGridSort(col);
}

function f_s2sUpdateHandler(name)
{
    g_configPanelObj.m_activeObj.f_handleS2SUpdate(name);
}

function f_s2sDeleteConfirmation(e, name)
{
    if(e.getAttribute('id')== 'ft_popup_message_apply')
    {
        g_configPanelObj.m_activeObj.f_handleS2SDelete(name);
    }
}

function f_s2sDeleteHandler(name)
{
    g_utils.f_popupMessage(g_lang.m_vpnDeleteConfirm + " " + name,
                'confirm', g_lang.m_vpnDeleteTitle, true,
                "f_s2sDeleteConfirmation(this, '"+name+"')");
}

function f_site2siteApplyHandler()
{
    g_configPanelObj.m_activeObj.f_handleS2SApply();
}