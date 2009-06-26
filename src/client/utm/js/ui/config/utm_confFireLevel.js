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
    this.m_fwObj = busLayer.f_getFWObject();
    this.thisObjName = 'UTM_confFireLevel';
    this.m_levelRecs = [];
    this.m_btnApplyId = "id_fireLevelApply";
    this.m_btnCancelId = "id_fireLevelCancel";
    this.m_rdDefaultId = "id_fireLevelDefault";
    this.m_rdAuthAllId = "id_fireLevelAuthAll";
    this.m_rdStandId = "id_fireLevelStandard";
    this.m_rdAdvanId = "id_fireLevelAdvance";
    this.m_rdCustomId = "id_fireLevelCustomized";
    this.m_rdBlockId = "id_fireLevelBlockAll";
    this.m_selLvlRadioId = this.m_rdAuthAllId;
    this.m_curSelLvlRadioId = null;
    this.m_selLvlRec = null;

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
        this.m_selLvlRec = null;
        return this.f_getPanelDiv(this.f_init());
    }

    this.f_createActiveTableColumns = function()
    {
        var cols = [];
        UTM_confFireLevel.superclass.m_allowSort = false;

        cols[0] = this.f_createColumn(g_lang.m_fireLevelColSelect, 90, 'checkbox', '3', false);
        cols[1] = this.f_createColumn(g_lang.m_fireLevelColDir + "<br>" +
                              g_lang.m_fireLevelColFrom, 120, 'text', '11', false);
        cols[2] = this.f_createColumn(g_lang.m_fireLevelColDir + "<br>" +
                              g_lang.m_fireLevelColTo, 120, 'text', '11', false);
        cols[3] = this.f_createColumn(g_lang.m_fireLevelColName, 150, 'text', '11', false);

        return cols;
    }

    this.f_createLevelColumns = function(dir)
    {
        var cols = [];
        UTM_confFireLevel.superclass.m_allowSort = false;

        cols[0] = this.f_createColumn(g_lang.m_fireLevelColName + " for " + dir,
                    780, 'radTxt', '10', false, 'left');

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
                thisObj.m_levelRecs = evt.m_value;
                if(thisObj.m_selLvlRec == null)
                    thisObj.m_selLvlRec = thisObj.m_levelRecs[0];

                thisObj.f_populateActiveTable(thisObj.m_levelRecs, thisObj.m_selLvlRec);

                if(thisObj.m_selLvlRec != null)
                    thisObj.f_populateLevelTable(thisObj.m_selLvlRec);
                else
                {
                    thisObj.f_updateLevelTableHeader("-");
                }
            }
        };

        g_utils.f_cursorWait();
        this.m_busLayer.f_getFirewallSecurityLevel('ALL', cb);
    };

    this.f_populateActiveTable = function(recs, selRec)
    {
        thisObj.f_removeDivChildren(thisObj.m_gridActiveBody);

        for(var i=0; i<recs.length; i++)
        {
            var rec = recs[i];
            var check = 'no';

            if(rec.m_direction == selRec.m_direction)
                check = 'yes';

            var radio = "<div align=center>" + this.f_renderRadio(check,
                        rec.m_direction+"-id",
                        "f_fireActiveRadioHandler('"+rec.m_direction+"')",
                        "activeLevel", "") + "</div>";
            var dirs = this.f_getDirection(rec.m_direction);

            this.m_gridActiveBody.appendChild(thisObj.f_createGridRow(this.m_colActiveModel,
                    [radio, dirs[0], dirs[1], rec.m_level]));
        }

        thisObj.m_gridActiveBody.style.height = (recs.length * 28 + 10) + "px";
    }

    this.f_getDirection = function(zonePair)
    {
        var dirs = [];

        if(zonePair.indexOf("_to_") > 0)
        {
            var zps = zonePair.split("_");
            dirs.push(zps[0]);
            dirs.push(zps[2]);
        }

        return dirs;
    }

    this.f_populateLevelTable = function(rec)
    {
        thisObj.f_removeDivChildren(thisObj.m_gridLevelBody);

        var custom = g_lang.m_fireLevelBdCustom + "&nbsp;&nbsp;&nbsp;<input type='" +
                      "image' src='" + g_lang.m_imageDir + "bt_config.gif' " +
                      "onclick='f_fireLevelConfigHandler()' title='" +
                      g_lang.m_fireLevelCustConfTip + "'>";

        var radioIds = [];
        var rdHeaders = [];
        var hdBodies = [];
        var h = [];
        var dir = rec.m_direction;
        if(dir != "LAN_to_WAN" && dir != "WAN_to_LAN")
        {
            radioIds = [this.m_rdDefaultId, this.m_rdCustomId];
            rdHeaders = [g_lang.m_fireLevelHdDef, g_lang.m_fireLevelHdCustom];
            hdBodies = [g_lang.m_fireLevelBdDef, custom];

            if(dir == "LAN_to_DMZ")
            {
                hdBodies = [g_lang.m_fireLevelBdLANtoDMZ_Def, custom];
            }
            else if(dir == "DMZ_to_LAN")
            {
                hdBodies = [g_lang.m_fireLevelBdDMZtoLAN, custom];
            }
            else if(dir.indexOf("DMZ_to_") >= 0 ||
                dir.indexOf("LAN2_to_") >= 0)
            {
                hdBodies = [g_lang.m_fireLevelBdDef, custom];
            }
            
            h = [43, 53];
        }
        else
        {
            radioIds = [this.m_rdAuthAllId, this.m_rdStandId,
                        this.m_rdAdvanId, this.m_rdCustomId, this.m_rdBlockId];
            rdHeaders = [g_lang.m_fireLevelHdAuth, g_lang.m_fireLevelHdStand,
                        g_lang.m_fireLevelHdAdvan, g_lang.m_fireLevelHdCustom,
                        g_lang.m_fireLevelHdBlock];

            if(dir == "WAN_to_LAN")
                hdBodies = [g_lang.m_fireLevelBdAuth, g_lang.m_fireLevelBdStand_WtoL,
                        g_lang.m_fireLevelBdAdvan, custom,
                        g_lang.m_fireLevelBdBlock];
            else
                hdBodies = [g_lang.m_fireLevelBdAuth, g_lang.m_fireLevelBdStand,
                        g_lang.m_fireLevelBdAdvan, custom,
                        g_lang.m_fireLevelBdBlock];

            h = [43, 43, 43, 53, 43];
        }

        for(var i=0; i<radioIds.length; i++)
        {
            var radio = this.f_getGridRowData(this.f_renderRadio('no',
                        radioIds[i], "f_fireLevelRadioHandler('"+radioIds[i]+"')",
                        "secLevel", ""), rdHeaders[i], hdBodies[i]);

            this.m_gridLevelBody.appendChild(thisObj.f_createGridRow(this.m_colLevelModel,
                    [radio], h[i]));
        }

        thisObj.f_updateGridRowRadioValue(rec);
        thisObj.f_updateLevelTableHeader(rec.m_direction);
    }


    this.f_updateGridRowRadioValue = function(val)
    {
        var rId = null;

        switch(val.m_level)
        {
            case "Default":
                rId = thisObj.m_rdDefaultId;
            break;
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

        thisObj.m_selLvlRadioId = rId;
        thisObj.f_enabledActionButtons(rId);
    };

    this.f_updateLevelTableHeader = function(direction)
    {
        var zp = thisObj.m_fwObj.m_ruleZonePair;

        for(var i=1; i<zp.length; i++)
        {
            if(thisObj.m_gridLevelHeader.innerHTML.indexOf(zp[i]) > 0)
            {
                ////////////////////////////////////
                // make sure we not fall in LAN2
                if(thisObj.m_gridLevelHeader.innerHTML.indexOf(zp[i]+2) > 0)
                {
                    thisObj.m_gridLevelHeader.innerHTML =
                    thisObj.m_gridLevelHeader.innerHTML.replace(zp[i]+2, direction);
                }
                else
                {
                    thisObj.m_gridLevelHeader.innerHTML =
                      thisObj.m_gridLevelHeader.innerHTML.replace(zp[i], direction);
                }
                break;
            }
        }
    }

    this.f_getGridRowData = function(radio, header, msg)
    {
        var html = "<table cellspacing=0 cellpadding=0 border=0><tbody><tr>" +
               "<td rowspan=2 valign=top>" + radio +
               "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><b>" + header +
               "</b></td><tr><td>" + msg + "</td></tr></tbody></table>";

        return html;
    };

    this.f_init = function()
    {
        this.m_colActiveModel = this.f_createActiveTableColumns();
        this.m_gridActiveHeader = this.f_createGridHeader(this.m_colActiveModel);
        this.m_gridActiveBody = this.f_createGridView(this.m_colActiveModel, false);

        this.m_colLevelModel = this.f_createLevelColumns("LAN_to_WAN");
        this.m_gridLevelHeader = this.f_createGridHeader(this.m_colLevelModel);
        this.m_gridLevelHeader.style.marginTop = "35px";
        this.m_gridLevelBody = this.f_createGridView(this.m_colLevelModel, false);

        this.f_loadVMData();

        var btns = [['Apply', "f_fireLevelApplyHandler()",
                    g_lang.m_fireLevelApplyTip, this.m_btnApplyId, false],
                    ['Cancel', "f_fireLevelCancelHandler()",
                    g_lang.m_fireLevelCancelTip, this.m_btnCancelId, false]];
        this.m_buttons = this.f_createButtons(btns);

        var actHeader = this.f_createGeneralDiv("<u>" +
                        g_lang.m_fireActiveHeader+"</u><br><br>");

        return [this.f_headerText(), actHeader, this.m_gridActiveHeader,
                this.m_gridActiveBody, this.m_gridLevelHeader,
                this.m_gridLevelBody, this.m_buttons];
    };

    this.f_headerText = function()
    {
        return this.f_createGeneralDiv("<br>");
    };

    this.f_handleActiveRadioChanged = function(rId)
    {
        var dir = rId.split("-");

        if(dir[0] != null)
        {
            for(var i=0; i<thisObj.m_levelRecs.length; i++)
            {
                var rec = thisObj.m_levelRecs[i];

                if(rec.m_direction == dir[0])
                {
                    thisObj.f_populateLevelTable(rec);
                    thisObj.f_enabledActionButtons(thisObj.m_selLvlRadioId);
                    thisObj.m_selLvlRec = rec;
                    break;
                }
            }
        }
    };

    this.f_enabledActionButtons = function(rId)
    {
        var isDirty = rId == thisObj.m_selLvlRadioId ? false : true;

        thisObj.m_curSelLvlRadioId = rId;
        thisObj.f_enabledDisableButton(this.m_btnApplyId, isDirty);
        thisObj.f_enabledDisableButton(this.m_btnCancelId, isDirty);
    };

    this.f_resetInput = function()
    {
        var r = document.getElementById(thisObj.m_selLvlRadioId);
        if(r != null)
        {
            r.checked = true;
            thisObj.f_enabledActionButtons(thisObj.m_selLvlRadioId);
        }
    };

    this.f_applyHandler = function()
    {
        var fr = new UTM_fwLevelRecord();
        fr.m_direction = thisObj.m_selLvlRec.m_direction;

        switch(thisObj.m_curSelLvlRadioId)
        {
            case thisObj.m_rdDefaultId:
                fr.m_level = "Default";
            break;
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
            thisObj.m_selLvlRec = fr;
            thisObj.f_loadVMData();
        };

        g_utils.f_cursorWait();
        thisObj.m_busLayer.f_setFirewallSecurityLevel(fr, cb);
    };
}
UTM_extend(UTM_confFireLevel, UTM_confBaseObj);


function f_fireLevelConfigHandler(e)
{
    g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_FW_CUSTOM_ID,
            g_configPanelObj.m_activeObj.m_selLvlRec);
}

function f_fireLevelApplyHandler(e)
{
    g_configPanelObj.m_activeObj.f_applyHandler();
}

function f_fireLevelCancelHandler(e)
{
    g_configPanelObj.m_activeObj.f_resetInput();
}

function f_fireActiveRadioHandler(rId)
{
    g_configPanelObj.m_activeObj.f_handleActiveRadioChanged(rId);
}

function f_fireLevelRadioHandler(rId)
{
    g_configPanelObj.m_activeObj.f_enabledActionButtons(rId);
}
