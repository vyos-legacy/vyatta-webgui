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

        cols[0] = this.f_createColumn(g_lang.m_fireZMZoneName, 150, 'text', '6', true, 'center');
        cols[1] = this.f_createColumn(g_lang.m_fireZMMember, 130, 'combo', '3', true, 'center');
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
            if(evt != undefined && evt.m_objName == 'UTM_eventObj')
            {
                
            }

            thisObj.f_resize();
        };

        g_utils.f_cursorWait();

        //thisObj.m_busLayer.f_getFirewallSecurityCustomize(fireRec, cb);
    };

    

    this.f_addFirewallIntoRow = function(fireRec)
    {
        

        ///////////////////////////////////
        // add fields into grid view
        var div = thisObj.f_createGridRow(thisObj.m_colModel,
                    [fireRec.m_direction, app, pro, sip, smip, sport, dip, dmip, dport,
                    act, log, order, enable, del]);
        thisObj.m_gridBody.appendChild(div);
    };


    this.f_init = function()
    {
        this.m_colModel = this.f_createColumns();
        this.m_gridHeader = this.f_createGridHeader(this.m_colModel, "f_fwZMGridHeaderClick");
        this.m_gridBody = this.f_createGridView(this.m_colModel, false);

        var btns = [['Add', "f_fireZoneMgmtAddHandler()", g_lang.m_fireZMAddTip, this.m_btnAddId]];
        this.m_buttons = this.f_createButtons(btns);

        window.setTimeout(function(){thisObj.f_resize();}, 100);

        return [this.m_gridHeader, this.m_gridBody, this.m_buttons];
    };

    this.f_handleDeleteRule = function(ruleNo)
    {
        var cb = function(evt)
        {
            thisObj.f_loadVMData();
            thisObj.m_isDirty = true;
        };

        var fireRec = thisObj.f_createFireRecord(ruleNo);
        thisObj.m_busLayer.f_deleteFirewallCustomizeRule(fireRec, cb);
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