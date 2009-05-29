/*
    Document   : utm_confFireLevel.js
    Created on : May 04, 2009, 11:21:31 AM
    Author     : Kevin.Choi
    Description:
*/

/**
 * Firewall Security Level configuration panel screen
 */
function UTM_confFireLevel(name, callback, busLayer)
{
    var thisObj = this;
    this.thisObjName = 'UTM_confFireLevel';
    this.m_btnApplyId = "id_fireLevelApply";
    this.m_btnCancelId = "id_fireLevelCancel";
    this.m_rdAuthAllId = "id_fireLevelAuthAll";
    this.m_rdStandId = "id_fireLevelStandard";
    this.m_rdAdvanId = "id_fireLevelAdvance";
    this.m_rdCustomId = "id_fireLevelCustomized";
    this.m_rdBlockId = "id_fireLevelBlockAll";
    this.m_selRadioId = this.m_rdAuthAllId;
    this.m_curSelRadioId = null;

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        UTM_confFireLevel.superclass.constructor(name, callback, busLayer);
    }
    this.constructor(name, callback, busLayer);

    this.f_getConfigurationPage = function()
    {
        return this.f_getPanelDiv(this.f_init());
    }

    this.f_createColumns = function()
    {
        var cols = [];

        cols[0] = this.f_createColumn(g_lang.m_fireLevelColName, 780, 'radTxt',
                    '10', false, 'left');

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
                var val = evt.m_value;
                thisObj.f_updateGridRowRadioValue(val);

                var mainPanel = document.getElementById("utm_confpanel_");
                if(mainPanel != null)
                    mainPanel.style.height = 380+'px';
            }

            thisObj.f_resize();
        };

        g_utils.f_cursorWait();
        this.m_busLayer.f_getFirewallSecurityLevel(cb);
    };

    this.f_updateGridRowRadioValue = function(val)
    {
        var rId = null;

        switch(val.m_level)
        {
            case "Authorize All":
                rId = thisObj.m_rdAuthAllId;
            break;
            case "Standard":
                rId = thisObj.m_rdStandId;
            break;
            case "Advanced":
                rId = thisObj.m_rdAdvanId;
            break;
            case "Customized":
                rId = thisObj.m_rdCustomId;
            break;
            default:
            case "Block All":
                rId = thisObj.m_rdBlockId;
            break;
        }

        var r = document.getElementById(rId);
        if(r != null)
            r.checked = true;

        thisObj.m_selRadioId = rId;
        thisObj.f_enabledActionButtons(rId);
    };

    this.f_getGridRowData = function(radio, header, msg)
    {
        html = "<table cellspacing=0 cellpadding=0 border=0><tbody><tr>" +
               "<td rowspan=2 valign=top>" + radio +
               "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><b>" + header +
               "</b></td><tr><td>" + msg + "</td></tr></tbody></table>";

        return html;
    };

    this.f_initGridData = function()
    {
        var custom = g_lang.m_fireLevelBdCustom + "&nbsp;&nbsp;&nbsp;<input type='" +
                      "image' src='" + g_lang.m_imageDir + "bt_config.png' " +
                      "onclick='f_fireLevelConfigHandler()' title='" +
                      g_lang.m_fireLevelCustConfTip + "'>";
        var radioIds = [this.m_rdAuthAllId, this.m_rdStandId,
                        this.m_rdAdvanId, this.m_rdCustomId, this.m_rdBlockId];
        var rdHeaders = [g_lang.m_fireLevelHdAuth, g_lang.m_fireLevelHdStand,
                        g_lang.m_fireLevelHdAdvan, g_lang.m_fireLevelHdCustom,
                        g_lang.m_fireLevelHdBlock];
        var hdBodies = [g_lang.m_fireLevelBdAuth, g_lang.m_fireLevelBdStand,
                        g_lang.m_fireLevelBdAdvan, custom,
                        g_lang.m_fireLevelBdBlock];
        var h = [43, 43, 43, 53, 43];

        for(var i=0; i<radioIds.length; i++)
        {
            var radio = this.f_getGridRowData(this.f_renderRadio('no',
                        radioIds[i], "f_fireLevelRadioHandler('"+radioIds[i]+"')",
                        "secLevel", ""), rdHeaders[i], hdBodies[i]);

            this.m_gridBody.appendChild(thisObj.f_createGridRow(this.m_colModel,
                    [radio], h[i]));
        }

        ////////////////////////////////////
        // by default the grid row height is 28px. and since we change the
        // height to 43, we want to re-adjust grid height by adding addition
        // 2 rows
        this.f_increateTableRowCounter(2);
    }

    this.f_init = function()
    {
        this.m_colModel = this.f_createColumns();
        this.m_gridHeader = this.f_createGridHeader(this.m_colModel);
        this.m_gridBody = this.f_createGridView(this.m_colModel, false);
        this.f_initGridData();
        this.f_loadVMData();

        var btns = [['Apply', "f_fireLevelApplyHandler()",
                    g_lang.m_fireLevelApplyTip, this.m_btnApplyId, false],
                    ['Cancel', "f_fireLevelCancelHandler()",
                    g_lang.m_fireLevelCancelTip, this.m_btnCancelId, false]];
        this.m_buttons = this.f_createButtons(btns);
        this.f_adjustDivPosition(this.m_buttons);

        return [this.f_headerText(), this.m_gridHeader,
                this.m_gridBody, this.m_buttons];
    };

    this.f_headerText = function()
    {
        return this.f_createGeneralDiv(g_lang.m_fireLevelHeader+"<br><br><br>");
    };

    this.f_enabledActionButtons = function(rId)
    {
        var isDirty = rId == thisObj.m_selRadioId ? false : true;

        thisObj.m_curSelRadioId = rId;
        thisObj.f_enabledDisableButton(this.m_btnApplyId, isDirty);
        thisObj.f_enabledDisableButton(this.m_btnCancelId, isDirty);
    };

    this.f_resetInput = function()
    {
        var r = document.getElementById(thisObj.m_selRadioId);
        if(r != null)
        {
            r.checked = true;
            thisObj.f_enabledActionButtons(thisObj.m_selRadioId);
        }
    };

    this.f_applyHandler = function()
    {
        var fr = new UTM_fireRecord();

        switch(thisObj.m_curSelRadioId)
        {
            case thisObj.m_rdAuthAllId:
                fr.m_level = 'Authorize All';
            break;
            case thisObj.m_rdStandId:
                fr.m_level = 'Standard';
            break;
            case thisObj.m_rdAdvanId:
                fr.m_level = 'Advanced';
            break;
            case thisObj.m_rdCustomId:
                fr.m_level = 'Customized';
            break;
            default:
            case thisObj.m_rdBlockId:
                fr.m_level = 'Block All';
            break;
        }

        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            thisObj.f_loadVMData();
        };

        g_utils.f_cursorWait();
        thisObj.m_busLayer.f_setFirewallSecurityLevel(fr, cb);
    };
}
UTM_extend(UTM_confFireLevel, UTM_confBaseObj);


function f_fireLevelConfigHandler(e)
{
    g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_FW_CUSTOM_ID);
}

function f_fireLevelApplyHandler(e)
{
    g_configPanelObj.m_activeObj.f_applyHandler();
}

function f_fireLevelCancelHandler(e)
{
    g_configPanelObj.m_activeObj.f_resetInput();
}

function f_fireLevelRadioHandler(rId)
{
    g_configPanelObj.m_activeObj.f_enabledActionButtons(rId);
}
