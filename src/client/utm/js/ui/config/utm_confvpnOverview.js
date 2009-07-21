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
    this.m_remoteRecs = null;

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
                      'vpns2sOverView', 'f_vpns2sOverViewChkboxCb',
                      'tooltip');

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
                      'vpnRemoteOverView', 'f_vpnRemoteOverViewChkboxCb',
                      'tooltip');

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

    this.f_s2sChkboxCb = function()
    {

    }

    this.f_remoteChkboxCb = function()
    {

    }

    this.f_loadVMData = function()
    {
        var wait = true;

        var cb = function(evt)
        {
            if(wait)
            {
                g_utils.f_cursorDefault();
                wait = false;
            }

            if(evt != undefined && evt.m_objName == 'UTM_eventObj')
            {
                thisObj.m_s2sRecs = evt.m_value;
                thisObj.f_populateS2STable(thisObj.m_s2sRecs);
            }
        }

        g_utils.f_cursorWait();
        this.m_threadId = this.m_busLayer.f_startVPNRequestThread(cb);
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

            var tname = thisObj.f_renderAnchor(rec.m_tunnel,
                    "f_s2sUpdateHandler('" +
                    rec.m_tunnel + "')", 'Click on name for update');

            var enable = c + thisObj.f_renderCheckbox(
                  rec.m_enable, 'enabledId-'+rec.m_tunnel,
                  "f_fwCustomizeOnChkBlur('"+'enabledId-'+rec.m_tunnel+"')",
                  "") + "</div>";

            var del = c + thisObj.f_renderButton(
                  "delete", true, "f_fireCustomDeleteHandler(" + rec.m_tunnel +
                  ")", g_lang.m_tooltip_delete) + "</div>";

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

    this.f_handleS2SUpdate = function(name)
    {
        var rec = this.f_getS2SRecByName(name);

        if(rec != null)
        {
            alert('update ' + rec.m_tunnel);
            g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_S2S_ID, rec);
        }
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
                    g_lang.m_fireCustAddTip, this.m_btnAddId]];
        this.m_buttons = this.f_createButtons(btns, 'left');

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