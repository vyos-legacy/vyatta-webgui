/*
    Document   : utm_confFireZoneMgmt.js
    Created on : May 25, 2009, 06:21:31 PM
    Author     : Kevin.Choi
    Description:
*/

/**
 * Firewall zone management configuration panel screen
 */
function UTM_confFireZoneMgmt(name, callback, busLayer)
{
    var thisObj = this;
    this.m_isDirty = false;
    this.m_zoneRecs = [];
    this.m_btnApplyId = "fwZoneMgmt_apply_id";
    this.m_btnCancelId = "fwZoneMgmt_cancel_id";

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        UTM_confFireZoneMgmt.superclass.constructor(name, callback, busLayer);
    }
    this.constructor(name, callback, busLayer);

    this.f_getConfigurationPage = function()
    {
        return this.f_getPanelDiv(this.f_init());
    }

    this.f_createColumns = function()
    {
        var cols = [];
        this.f_colorGridBackgroundRow(true);

        cols[0] = this.f_createColumn(g_lang.m_fireZMZoneName, 110, 'text', '6', true, 'center');
        cols[1] = this.f_createColumn(g_lang.m_fireZMMember, 150, 'combo', '6', true, 'center');
        cols[2] = this.f_createColumn(g_lang.m_fireZMDesc, 250, 'combo', '6', false, 'center');
        cols[3] = this.f_createColumn(g_lang.m_enabled, 100, 'checkbox', '3', false, 'center');

        return cols;
    }

    this.f_loadVMData = function()
    {
        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            if(evt != undefined && evt.m_objName == 'UTM_eventObj')
            {
                thisObj.m_zoneRecs = evt.m_value;
                thisObj.f_populateTable();
            }

            thisObj.f_increateTableRowCounter(-1);
            thisObj.f_adjustDivPosition(thisObj.m_buttons);
            thisObj.f_resize();
        };

        g_utils.f_cursorWait();
        thisObj.m_busLayer.f_getFirewallZoneMgmtList(cb);
    };

    this.f_populateTable = function()
    {
        thisObj.f_removeDivChildren(thisObj.m_div);
        thisObj.f_removeDivChildren(thisObj.m_gridBody);

        this.m_gridHeader = this.f_createGridHeader(this.m_colModel, "f_fwZMGridHeaderClick");
        thisObj.m_div.appendChild(thisObj.m_gridHeader);
        thisObj.m_div.appendChild(thisObj.m_gridBody);
        thisObj.m_div.appendChild(thisObj.m_buttons);

        var sortCol = UTM_confFireZoneMgmt.superclass.m_sortCol;
        var ar = thisObj.f_createSortingArray(sortCol, thisObj.m_zoneRecs);

        for(var i=0; i<ar.length; i++)
            thisObj.f_addFirewallIntoRow(ar[i]);
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
            ar[i] = zRecs[i].m_name + '|' + zRecs[i].m_members + '|' +
                    zRecs[i].m_description;
        }

        var sar = thisObj.f_sortArray(sortIndex, ar);
        for(var i=0; i<sar.length; i++)
        {
            var r = sar[i].split("|");
            var rec = new UTM_fwZoneRecord(r[0])
            rec.m_members = [r[1]];
            rec.m_description = r[2];
            recs.push(rec);
        }

        return recs;
    }

    this.f_addFirewallIntoRow = function(zoneRec)
    {
        var enable = "<div align=center>" + thisObj.f_renderCheckbox(
                  zoneRec.m_enabled, zoneRec.m_name+"_id",
                  "f_fwZoneMgmtEnabledHandler('"+zoneRec.m_name+"')",
                  "") + "</div>";
        var zname = thisObj.f_renderAnchor(zoneRec.m_name, "f_fwZoneMgmtUpdateHandler('" +
                    zoneRec.m_name + "')", 'Click on name to update zone');

        ///////////////////////////////////
        // add fields into grid view
        var div = thisObj.f_createGridRow(thisObj.m_colModel,
                    [zname, zoneRec.m_members, zoneRec.m_description, enable]);
        thisObj.m_gridBody.appendChild(div);
    };


    this.f_init = function()
    {
        this.m_colModel = this.f_createColumns();
        this.m_gridHeader = this.f_createGridHeader(this.m_colModel, "f_fwZMGridHeaderClick");
        this.m_gridBody = this.f_createGridView(this.m_colModel, false);

        var btns = [['Apply', "f_fireZoneMgmtApplyHandler()", g_lang.m_applyTip, this.m_btnApplyId],
              ['Cancel', "f_fireZoneMgmtCancelHandler()", g_lang.m_cancelTip, this.m_btnCancelId]];
        this.m_buttons = this.f_createButtons(btns);

        this.f_loadVMData();
        return [this.m_gridHeader, this.m_gridBody, this.m_buttons];
    };

    this.f_getZoneRecByName = function(zname)
    {
        if(thisObj.m_zoneRecs != null)
        {
            for(var i=0; i<thisObj.m_zoneRecs.length; i++)
            {
                if(thisObj.m_zoneRecs[i].m_name == zname)
                    return thisObj.m_zoneRecs[i];
            }
        }

        return null;
    }

    this.f_handleGridSort = function(col)
    {
        if(thisObj.f_isSortEnabled(thisObj.m_colModel, col))
            thisObj.f_populateTable();
    };

    this.f_handleEnabledZone= function(zname)
    {
        alert(zname);
    }

    this.f_handleUpdateZone = function(zname)
    {
        var zr = thisObj.f_getZoneRecByName(zname);

        g_configPanelObj.f_showPage(
          VYA.UTM_CONST.DOM_3_NAV_SUB_FW_ZONE_MGMT_EDITOR_UPDATE_ID, zr);
    }
}
UTM_extend(UTM_confFireZoneMgmt, UTM_confBaseObj);

function f_fwZMGridHeaderClick(col)
{
    g_configPanelObj.m_activeObj.f_handleGridSort(col);
}

function f_fireZoneMgmtApplyHandler()
{
}

function f_fireZoneMgmtCancelHandler()
{
    g_configPanelObj.m_activeObj.f_populateTable();
}
function f_fwZoneMgmtEnabledHandler(zname)
{
    g_configPanelObj.m_activeObj.f_handleEnabledZone(zname);
}

function f_fwZoneMgmtUpdateHandler(zname)
{
    g_configPanelObj.m_activeObj.f_handleUpdateZone(zname);
}