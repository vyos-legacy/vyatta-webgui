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

        cols[0] = this.f_createColumn(g_lang.m_fireLevelColName, 710, 'radTxt',
                    '10', false, 'left');

        return cols;
    }

    this.f_loadVMData = function()
    {
        thisObj.m_updateFields = [];

        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            if(evt != undefined && evt.m_objName == 'FT_eventObj')
            {

            }
        }

        var r = document.getElementById(thisObj.m_rdAuthAllId);
        if(r != null)
            r.checked = true;
			
		thisObj.f_resize(10);	
        //g_utils.f_cursorWait();
        //this.m_threadId = this.m_busLayer.f_startVMRequestThread(cb);
    };

    this.f_getGridRowData = function(radio, header, msg)
    {
        var html = "<table cellspacing=0 cellpadding=0 border=0><tbody><tr><td>" + radio +
            "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><b>" + header +
            "</b></td></tr>" +
            "<tr border=0><td></td><td>" + msg + "</td></tr>" +
            "</tbody></table";

        return html;
    };

    this.f_initGridData = function()
    {
        var custom = g_lang.m_fireLevelBdCustom + "&nbsp;&nbsp;&nbsp;<input type='" +
                      "image' src='" + g_lang.m_imageDir + "bt_cancel.gif' " +
                      "onclick='f_fireLevelConfigHandler()'>";
        var radioIds = [this.m_rdAuthAllId, this.m_rdStandId,
                        this.m_rdAdvanId, this.m_rdCustomId, this.m_rdBlockId];
        var rdHeaders = [g_lang.m_fireLevelHdAuth, g_lang.m_fireLevelHdStand,
                        g_lang.m_fireLevelHdAdvan, g_lang.m_fireLevelHdCustom,
                        g_lang.m_fireLevelHdBlock];
        var hdBodies = [g_lang.m_fireLevelBdAuth, g_lang.m_fireLevelBdStand,
                        g_lang.m_fireLevelBdAdvan, custom,
                        g_lang.m_fireLevelBdBlock];
        var h = [43, 43, 43, 58, 43];

        for(var i=0; i<radioIds.length; i++)
        {
            var radio = this.f_getGridRowData(this.f_renderRadio('no',
                        radioIds[i], null, "secLevel", ""), rdHeaders[i], hdBodies[i]);

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

        var btns = [['Apply', "f_fireLevelApplyHandler()", "", this.m_btnApplyId],
                    ['Cancel', "f_fireLevelCancelHandler()", "", this.m_btnCancelId]];
        this.m_buttons = this.f_createButtons(btns);
        this.f_adjustDivPosition(this.m_buttons);

        window.setTimeout("f_testing()", 500);
        return [this.f_headerText(), this.m_gridHeader,
                this.m_gridBody, this.m_buttons];
    };

    this.f_headerText = function()
    {
        return this.f_createGeneralDiv(g_lang.m_fireLevelHeader+"<br><br><br>");
    };
}
UTM_extend(UTM_confFireLevel, UTM_confBaseObj);


function f_fireLevelConfigHandler(e)
{
    g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_FW_CUSTOM_ID);
}

function f_fireLevelApplyHandler(e)
{
    g_configPanelObj.m_activeObj.f_groupsChkboxCb();
}

function f_fireLevelCancelHandler(e)
{
    g_configPanelObj.m_activeObj.f_usersChkboxCb();
}

function f_testing()
{
    g_configPanelObj.m_activeObj.f_loadVMData();
}