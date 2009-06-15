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
    this.m_zoneRecsCur = [];
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

        cols[0] = this.f_createColumn(g_lang.m_fireZMZoneName, 160, 'text', '6', true, 'center');
        cols[1] = this.f_createColumn(g_lang.m_fireZMMember, 130, 'combo', '6', true, 'center');
        cols[2] = this.f_createColumn(g_lang.m_fireZMDesc, 300, 'combo', '6', false, 'center');
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
                thisObj.m_zoneRecsCur = thisObj.f_copyZoneRecords(evt.m_value);
                thisObj.f_populateTable(thisObj.m_zoneRecsCur);
            }

            thisObj.f_increateTableRowCounter(-1);
            //thisObj.f_adjustDivPosition(thisObj.m_buttons);
            thisObj.f_resize();
            thisObj.f_enableActionButtons(thisObj.m_zoneRecs);
        };

        g_utils.f_cursorWait();
        thisObj.m_busLayer.f_getFirewallZoneMgmtList(cb);
    };

    this.f_copyZoneRecords = function(recs)
    {
        var ar = [];

        for(var i=0; i<recs.length; i++)
        {
            var zone = new UTM_fwZoneRecord();
            zone.m_name = recs[i].m_name;
            zone.m_description = recs[i].m_description;
            zone.m_enabled = recs[i].m_enabled;
            zone.m_members = recs[i].m_members;

            ar.push(zone);
        }

        return ar;
    }

    this.f_populateTable = function(rec)
    {
        thisObj.f_removeDivChildren(thisObj.m_div);
        thisObj.f_removeDivChildren(thisObj.m_gridBody);

        this.m_gridHeader = this.f_createGridHeader(this.m_colModel, "f_fwZMGridHeaderClick");
        thisObj.m_div.appendChild(thisObj.m_gridHeader);
        thisObj.m_div.appendChild(thisObj.m_gridBody);
        //thisObj.m_div.appendChild(thisObj.m_buttons);

        var sortCol = UTM_confFireZoneMgmt.superclass.m_sortCol;
        var ar = thisObj.f_createSortingArray(sortCol, rec);

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
                    zRecs[i].m_description + '|' + zRecs[i].m_enabled;
        }

        var sar = thisObj.f_sortArray(sortIndex, ar);
        for(var i=0; i<sar.length; i++)
        {
            var r = sar[i].split("|");
            var rec = new UTM_fwZoneRecord(r[0])
            rec.m_members = [r[1]];
            rec.m_description = r[2];
            rec.m_enabled = r[3];
            recs.push(rec);
        }

        return recs;
    }

    this.f_enableActionButtons = function(recs)
    {
        var enable = false;

        for(var i=0; i<recs.length; i++)
        {
            var rec = recs[i];
            var enDiv = document.getElementById(rec.m_name+"_id");

            if(enDiv != null)
            {
                if(enDiv.checked && rec.m_enabled == 'yes')
                    continue;
                else if(!enDiv.checked && rec.m_enabled == 'no')
                    continue;
                else
                {
                    enable = true;
                    break;
                }
            }
        }

        thisObj.f_enabledDisableButton(this.m_btnApplyId, enable);
        thisObj.f_enabledDisableButton(this.m_btnCancelId, enable);

    }

    this.f_addFirewallIntoRow = function(zoneRec)
    {
        //var enable = "<div align=center>" + thisObj.f_renderCheckbox(
        //          zoneRec.m_enabled, zoneRec.m_name+"_id",
        //          "f_fwZoneMgmtEnabledHandler('"+zoneRec.m_name+"')",
        //          "") + "</div>";
        var enable = "<div align=center>" + thisObj.f_renderImage(
                    zoneRec.m_enabled == "yes" ? "images/check.gif" :
                    "images/uncheck.gif", "f_fwMgmtNotUse",
                    g_lang.m_fireCustEnableEnabled) + "</div>"
        var zname = thisObj.f_renderAnchor(zoneRec.m_name + " Zone",
                    "f_fwZoneMgmtUpdateHandler('" +
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

        //var btns = [['Apply', "f_fireZoneMgmtApplyHandler()", g_lang.m_applyTip, this.m_btnApplyId],
        //      ['Cancel', "f_fireZoneMgmtCancelHandler()", g_lang.m_cancelTip, this.m_btnCancelId]];
        //this.m_buttons = this.f_createButtons(btns);

        this.f_loadVMData();
        return [this.m_gridHeader, this.m_gridBody];
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
            thisObj.f_populateTable(thisObj.m_zoneRecsCur);
    };

    this.f_handleCancelAction = function()
    {
        thisObj.f_populateTable(thisObj.m_zoneRecs);
        thisObj.f_enableActionButtons(thisObj.m_zoneRecs);
        thisObj.m_zoneRecsCur = thisObj.f_copyZoneRecords(thisObj.m_zoneRecs);
    }

    this.f_handelApplyAction = function()
    {
        thisObj.f_loadVMData();
    }

    this.f_handleEnabledZone= function(zname)
    {
        var enDiv = document.getElementById(zname+"_id");

        var ar = thisObj.m_zoneRecsCur;
        for(var i=0; i<ar.length; i++)
        {
            if(ar[i].m_name == zname)
            {
                ar[i].m_enabled = enDiv.checked ? 'yes' : 'no';
                break;
            }
        }

        thisObj.f_enableActionButtons(thisObj.m_zoneRecs);
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
    g_configPanelObj.m_activeObj.f_handelApplyAction();
}

function f_fireZoneMgmtCancelHandler()
{
    g_configPanelObj.m_activeObj.f_handleCancelAction();
}
function f_fwZoneMgmtEnabledHandler(zname)
{
    g_configPanelObj.m_activeObj.f_handleEnabledZone(zname);
}

function f_fwZoneMgmtUpdateHandler(zname)
{
    g_configPanelObj.m_activeObj.f_handleUpdateZone(zname);
}

function f_fwMgmtNotUse()
{

}