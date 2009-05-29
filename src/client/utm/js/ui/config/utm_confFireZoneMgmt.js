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


        cols[0] = this.f_createColumn(g_lang.m_fireCustDirection, 95, 'text', '6', false, 'center');
        cols[1] = this.f_createColumn(g_lang.m_fireCustAppService, 100, 'combo', '3', false, 'center');
        cols[2] = this.f_createColumn(g_lang.m_fireCustProtocol, 70, 'combo', '3', false, 'center');
        cols[3] = this.f_createColumn(g_lang.m_fireCustSrcIpAddr, 115, 'textField', '3', false, 'center');
        cols[4] = this.f_createColumn(g_lang.m_fireCustSrcMaskIpAddr, 75, 'combo', '3', false, 'center');

        return cols;
    }

    this.f_createFireRecord = function(ruleNo)
    {
        var ruleOp = document.getElementById('fwCustomHeaderCombo_id');
        var zonePair = this.f_getComboBoxOptionName(ruleOp);

        return new UTM_fireRecord(ruleNo, zonePair);
    }

    this.f_sendSetCommand = function(fireRec, name, value)
    {
        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            thisObj.m_isDirty = true;
        }

        g_utils.f_cursorWait();
        thisObj.m_busLayer.f_setFirewallCustomize(fireRec, name, value, cb);
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

            thisObj.f_adjustGridHeight();
        };

        g_utils.f_cursorWait();

        //thisObj.m_busLayer.f_getFirewallSecurityCustomize(fireRec, cb);
    };

    this.f_adjustGridHeight = function()
    {
        var mainPanel = document.getElementById("utm_confpanel_");
        if(mainPanel != null)
            mainPanel.style.height = 280+'px';

        thisObj.f_resize();
    }

    this.f_addFirewallIntoRow = function(fireRec)
    {
        

        ///////////////////////////////////
        // add fields into grid view
        var div = thisObj.f_createGridRow(thisObj.m_colModel,
                    [fireRec.m_direction, app, pro, sip, smip, sport, dip, dmip, dport,
                    act, log, order, enable, del]);
        thisObj.m_gridBody.appendChild(div);
    };

    this.f_getTheNextRuleNo = function()
    {
        if(thisObj.m_nextFuleNo == null)
        {
            var fr = thisObj.m_fireRecs[thisObj.m_fireRecs.length-1];
            if(fr == null)
                thisObj.m_nextRuleNo = 10;
            else
                thisObj.m_nextRuleNo = Number(fr.m_ruleNo) + 10;
        }
        else
            thisObj.m_nextRuleNo += 10;

        return thisObj.m_nextRuleNo;
    }

    this.f_handleAddFirewallCustomRow = function(ruleNo)
    {
        
        ///////////////////////////////////
        // add fields into grid view
        var fireRec = thisObj.f_createFireRecord(null);
        var div = thisObj.f_createGridRow(thisObj.m_colModel,
                    [fireRec.m_zonePair, app, pro, sip, smip, sport, dip, dmip, dport,
                    act, log, order, enable, del]);
        thisObj.m_gridBody.appendChild(div);

        /////////////////////////////////////////////
        // make the new added row is in viewable
        div.scrollIntoView(true);
    };

    this.f_init = function()
    {
        this.m_colModel = this.f_createColumns();
        this.m_gridHeader = this.f_createGridHeader(this.m_colModel);
        this.m_gridBody = this.f_createGridView(this.m_colModel, false);
        //this.f_loadVMData();

        var btns = [['Add', "f_fireCustomAddHandler()", "", this.m_btnAddId],
                    ['Save', "f_fireCustomSaveHandler()", "", this.m_btnSaveId],
                    ['Reset', "f_fireCustomResetHandler()", "", this.m_btnRestId],
                    ['Cancel', "f_fireCustomCancelHandler()", "", this.m_btnCancelId],
                    ['Back', "f_fireCustomBackHandler()", "", this.m_btnBackId]];
        this.m_buttons = this.f_createButtons(btns);

        this.m_grid = this.f_initGridDiv([this.m_gridHeader, this.m_gridBody])

        window.setTimeout(function(){thisObj.f_adjustGridHeight();}, 100);

        return [this.m_grid, this.m_buttons];
    };

    this.f_initGridDiv = function(children)
    {
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.display = 'block';
        div.style.border = '1px solid #CCC';
        div.style.backgroundColor = 'white';
        div.style.overflow = 'auto';
        div.style.height = "300px";
        div.style.width = "795px";

        for(var i=0; i<children.length; i++)
            div.appendChild(children[i]);

        return div;
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
