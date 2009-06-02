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
        cols[1] = this.f_createColumn(g_lang.m_fireZMMember, 150, 'combo', '3', true, 'center');
        cols[2] = this.f_createColumn(g_lang.m_fireZMDesc, 250, 'combo', '3', false, 'center');
        cols[3] = this.f_createColumn(g_lang.m_fireZMDelete, 100, 'textField', '3', false, 'center');

        return cols;
    }

    this.f_loadVMData = function()
    {
        thisObj.m_updateFields = [];

        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            if(evt != undefined)// && evt.m_objName == 'UTM_eventObj')
            {
                while(evt.length > 0)
                {
                    var rec = evt.pop();
                    thisObj.m_zoneRecs.push(rec);
                    thisObj.f_addFirewallIntoRow(rec);
                }
            }

            thisObj.f_adjustDivPosition(thisObj.m_buttons);
            //thisObj.f_increateTableRowCounter(2);
            thisObj.f_resize();
        };

        g_utils.f_cursorWait();

        thisObj.m_busLayer.f_getFirewallZoneMgmtList(cb);
    };

    this.f_addFirewallIntoRow = function(zoneRec)
    {
        var del = "<div align=center>" + thisObj.f_renderButton(
                  "delete", true, "f_fwZoneMgmtDeleteHandler('" + zoneRec.m_name +
                  "')", "") + "</div";
        var zname = thisObj.f_renderAnchor(zoneRec.m_name, "f_fwZoneMgmtUpdateHandler('" +
                    zoneRec.m_name + "')", 'Click on name to update zone');

        ///////////////////////////////////
        // add fields into grid view
        var div = thisObj.f_createGridRow(thisObj.m_colModel,
                    [zname, zoneRec.m_members, zoneRec.m_description,
                    del]);
        thisObj.m_gridBody.appendChild(div);
    };


    this.f_init = function()
    {
        this.m_colModel = this.f_createColumns();
        this.m_gridHeader = this.f_createGridHeader(this.m_colModel, "f_fwZMGridHeaderClick");
        this.m_gridBody = this.f_createGridView(this.m_colModel, false);

        var btns = [['Add', "f_fireZoneMgmtAddHandler()", g_lang.m_fireZMAddTip, this.m_btnAddId]];
        this.m_buttons = this.f_createButtons(btns);

        //window.setTimeout(function(){thisObj.f_resize();}, 100);
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

    this.f_handleDeleteZone= function(zname)
    {
        
    }

    this.f_handleUpdateZone = function(zname)
    {
        var zr = thisObj.f_getZoneRecByName(zname);

        g_configPanelObj.f_showPage(
          VYA.UTM_CONST.DOM_3_NAV_SUB_FW_ZONE_MGMT_EDITOR_UPDATE_ID, zr);
    }
}
UTM_extend(UTM_confFireZoneMgmt, UTM_confBaseObj);

function f_fwZMGridHeaderClick()
{
    
}

function f_fireZoneMgmtAddHandler()
{
    g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_FW_ZONE_MGMT_EDITOR_ID);
}

function f_fwZoneMgmtDeleteHandler(zname)
{
    g_configPanelObj.m_activeObj.f_handleDeleteZone(zname);
}

function f_fwZoneMgmtUpdateHandler(zname)
{
    g_configPanelObj.m_activeObj.f_handleUpdateZone(zname);
}