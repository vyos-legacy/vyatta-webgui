/*
    Document   : utm_confNwNatPat.js
    Created on : June 05, 2009, 9:21:31 AM
    Author     : Kevin.Choi
    Description: network configuration for NAT/PAT screen
*/

/**
 * Network configuration NAT/PAT panel screen
 */
function UTM_confNwNatPat(name, callback, busLayer)
{
    var thisObj = this;
    this.m_nwObj = busLayer.f_getNwObject();
    this.m_sendList = [];
    this.m_direction = "incoming";
    this.m_enabledchkId = "nwNatEnableId";
    this.m_btnAddId = "nwNatPatAddId";
    this.m_btnSaveId = "nwNatPatSaveId";
    this.m_btnCancelId = "nwNatPatCancelId";
    this.m_npRecs = [];
    this.m_fieldIds = ["nat_rulenoId-", "nat_appId-", "nat_dportId-",
                        "nat_iportId-", "nat_proId-", "nat_iipId-", "nat_enableId-"];
    this.m_protocol = ["tcp", "udp", "both", " "];
    this.m_resyncNextRuleNo = -1;           // auto get next rule number.
                                            // to be used for case get next rule num is
                                            // exceed the limit. when limitation is
                                            // reach, backend re-order all rule numbers.
                                            // Frontend needs to reload and
                                            // get next rule number again.
                                            // -1 : no resync required
                                            // > 0 : resynce is required.

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        UTM_confNwNatPat.superclass.constructor(name, callback, busLayer);
    }
    this.constructor(name, callback, busLayer);

    this.f_getConfigurationPage = function()
    {
        this.m_resyncNextRuleNo = -1;
        return this.f_getPanelDiv(this.f_init());
    }

    this.f_createColumns = function()
    {
        var cols = [];
        UTM_confNwNatPat.superclass.m_allowSort = false;
        this.f_colorGridBackgroundRow(true);

        var chkbox = 'enabled<br><br>' + thisObj.f_renderCheckbox("no",
                      thisObj.m_enabledchkId, "f_nwNatPatOnChkClick('" +
                      thisObj.m_enabledchkId+"')", 'Click here to enable/disable all');

        cols[0] = this.f_createColumn(g_lang.m_fireCustAppService, 150, 'combo', '3', false, 'center');
        cols[1] = this.f_createColumn(g_lang.m_fireCustDestPort, 100, 'textField', '3', false, 'center');
        cols[2] = this.f_createColumn(g_lang.m_fireCustInternPort, 100, 'textField', '3', false, 'center');
        cols[3] = this.f_createColumn(g_lang.m_fireCustProtocol, 90, 'combo', '3', false, 'center');
        cols[4] = this.f_createColumn(g_lang.m_fireCustInternIpAddr, 180, 'textField', '3', false, 'center');
        cols[5] = this.f_createColumn(chkbox, 55, 'checkbox', '3', false, 'center');
        cols[6] = this.f_createColumn(g_lang.m_fireCustDelete, 70, 'combo', '3', false, 'center');

        return cols;
    }

    this.f_sendSetCommand = function(fireRec, name, value, wantCB)
    {
        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            thisObj.f_enabledActionButtons(true);

            if(wantCB != null)
                wantCB(evt);
        }

        g_utils.f_cursorWait();
        thisObj.m_busLayer.f_setNatPatNamePairValue(fireRec, name, value, cb);
    }

    this.f_sendMultiCommands = function(cmds, cmdName)
    {
        var cb = function(evt)
        {
            if(cmds.length > 0)
            {
                var sRC = cmds.pop();
                thisObj.f_sendSetCommand(sRC, cmdName, sRC.m_enabled, cb);
            }
        }
    }

    this.f_loadVMData = function()
    {
        thisObj.m_updateFields = [];

        thisObj.m_cb = function(evt)
        {
            g_utils.f_cursorDefault();
            if(evt != undefined && evt.m_objName == 'UTM_eventObj')
            {
                if(evt.m_value != null)
                {
                    thisObj.m_npRecs = evt.m_value;
                    thisObj.f_removeDivChildren(thisObj.m_gridBody);

                    for(var i=0; i<evt.m_value.length; i++)
                        thisObj.f_addDataIntoTable(evt.m_value[i]);
                }
            }
        };

        g_utils.f_cursorWait();
        var rec = new UTM_nwNatPatRecord("all", "incoming");
        thisObj.m_busLayer.f_getNatPatConfigurations(rec, thisObj.m_cb);
    };

    this.f_stopLoadVMData = function()
    {
        //thisObj.m_busLayer.f_cancelFirewallCustomizeRule(null);
    }

    this.f_addDataIntoTable = function(rec)
    {
        var zpRule = rec.m_ruleNo;
        var readonly = rec.m_appService.indexOf("Others") >= 0 ? false :true;

        var app = thisObj.f_renderCombobox(thisObj.m_nwObj.m_services, rec.m_appService,
                            140, thisObj.m_fieldIds[1]+zpRule,
                            ["f_nwNatPatOnCbbBlur('" + thisObj.m_fieldIds[1]+
                            zpRule + "')", thisObj.m_nwObj.m_ports]);
        var dport = thisObj.f_renderTextField(thisObj.m_fieldIds[2]+zpRule,
                            rec.m_destPort, rec.m_destPort, 90,
                            ["f_nwNatPatOnTFBlur('" + thisObj.m_fieldIds[2]+
                            zpRule + "')"], readonly);
        var sport = thisObj.f_renderTextField(thisObj.m_fieldIds[3]+zpRule,
                            rec.m_internPort, rec.m_srcPort, 90,
                            ["f_nwNatPatOnTFBlur('" + thisObj.m_fieldIds[3]+
                            zpRule + "')"], false);
        var pro = thisObj.f_renderCombobox(thisObj.m_protocol, rec.m_protocol,
                            80, thisObj.m_fieldIds[4]+zpRule,
                            ["f_nwNatPatOnCbbBlur('" + thisObj.m_fieldIds[4]+
                            zpRule + "')"]);
        var sip = thisObj.f_renderTextField(thisObj.m_fieldIds[5]+zpRule,
                            rec.m_internIpAddr, '', 170,
                            ["f_nwNatPatOnTFBlur('" + thisObj.m_fieldIds[5]+
                            zpRule + "')"], false);
        var enable = "<div align=center>" + thisObj.f_renderCheckbox(
                  rec.m_enabled, thisObj.m_fieldIds[6]+zpRule,
                  "f_nwNatPatOnChkClick('"+thisObj.m_fieldIds[6]+zpRule+"')",
                  "") + "</div>";
        var del = "<div align=center width=45>" + thisObj.f_renderButton(
                  "delete", true, "f_nwNatPatDeleteHandler(" + rec.m_ruleNo +
                  ")", "") + "</div>";

        ///////////////////////////////////
        // add fields into grid view
        var div = thisObj.f_createGridRow(thisObj.m_colModel,
                    [app, dport, sport, pro, sip, enable, del], null, null, true);
        thisObj.f_addRowIntoGridTable(thisObj.m_gridBody, div, true);
    };

    this.f_handleAddNewNatRow = function(ruleNo)
    {
        var rec = new UTM_nwNatPatRecord(ruleNo);
        thisObj.m_npRecs.push(rec);
        thisObj.f_addDataIntoTable(rec);
    };

    this.f_init = function()
    {
        this.f_handleCancelAction(true);

        this.m_colModel = this.f_createColumns();
        this.m_gridHeader = this.f_createGridHeader(this.m_colModel, "f_nwNatPatNotUse");
        this.m_gridBody = this.f_createGridView(this.m_colModel, false, true);
        this.f_loadVMData();

        var btns = [['Add', "f_nwNatPatAddHandler()",
                    g_lang.m_fireCustAddTip, this.m_btnAddId],
                    ['Apply', "f_nwNatPatSaveHandler()",
                    g_lang.m_fireCustSaveTip, this.m_btnSaveId],
                    ['Cancel', "f_nwNatPatCancelHandler()",
                    g_lang.m_fireCustCancelTip, this.m_btnCancelId]];
        this.m_buttons = this.f_createButtons(btns);

        window.setTimeout(function()
        {
            thisObj.f_enabledActionButtons(false);
        }, 100);

        return [this.f_headerText(), this.m_gridHeader, this.m_gridBody, this.m_buttons];
    };

    this.f_headerText = function()
    {
        return this.f_createGeneralDiv(g_lang.m_nwNatPatHeader+"<br><br>");
    };

    this.f_enabledActionButtons = function(enabled)
    {
        thisObj.f_enabledDisableButton(thisObj.m_btnSaveId, enabled);
        thisObj.f_enabledDisableButton(thisObj.m_btnCancelId, enabled);
    };

    this.f_isIPAddressValidated = function(ip)
    {
        ///////////////////////////////
        // validate ip address
        if(!g_utils.f_validateIP(ip))
        {
            g_utils.f_popupMessage(g_lang.m_invalidIpAddr + " : " + ip, "error",
                                    g_lang.m_ipaddrTitle, true);
            return false;
        }

        return true;
    }

    this.f_cbOnTFBlur = function(tfeid)
    {
        var ids = thisObj.m_fieldIds;
        var rNo = tfeid.split("-");
        var rec = new UTM_nwNatPatRecord(rNo[1], thisObj.m_direction);
        var el = document.getElementById(tfeid);
        var val = el.value;
        var fName = null;

        // ip address text fields
        if(tfeid.indexOf(ids[5]) >= 0 && thisObj.f_isIPAddressValidated(val))
            fName = "iaddr";
        // destination port
        else if(tfeid.indexOf(ids[2]) >= 0)
            fName = "dport";
        // internal port
        else if(tfeid.indexOf(ids[3]) >= 0)
            fName = "iport";

        thisObj.f_sendSetCommand(rec, fName, val);
    }

    this.f_setEnableValue2Server = function()
    {
        var cb = function(evt)
        {
            if(evt.m_errCode != 0)
                alert("set enable error: " + evt.m_errMsg + " for " + eid);

            if(thisObj.m_sendList.length > 0)
                thisObj.f_setEnableValue2Server();
        }

        var eid = this.m_sendList.pop();
        if(eid != null)
        {
            ///////////////////////////////////////////
            // submit set to server.
            var el = document.getElementById(eid);
            var ids = eid.split("-");
            var rec = new UTM_nwNatPatRecord(ids[1], thisObj.m_direction);

            rec.m_enable = el.checked ? 'Yes' : 'No';
            thisObj.f_sendSetCommand(rec, "enable", el.checked ? "Yes":"No", cb);
        }
    }

    this.f_updateGridHeaderChkbox = function()
    {
        var checked = true;

        for(var i=0; i<this.m_npRecs.length; i++)
        {
            var rec = this.m_npRecs[i];
            var el = document.getElementById(this.m_fieldIds[6]+rec.m_ruleNo);

            if(el != null)
            {
                if(!el.checked)
                {
                    checked = false;
                    break;
                }
            }
        }

        var el = document.getElementById(this.m_enabledchkId);
        el.checked = checked;
    }

    this.f_cbOnChkClick = function(chkid)
    {
        var chk = document.getElementById(chkid);
        var rNo = chkid.split("-");

        if(chkid.indexOf(thisObj.m_fieldIds[6]) >= 0)
        {
            this.f_updateGridHeaderChkbox();
            this.m_sendList.push(chkid);
        }
        else  // chkbox from grid table clicked
        {
            for(var i=0; i<thisObj.m_npRecs.length; i++)
            {
                var rec = thisObj.m_npRecs[i];
                var eeid = thisObj.m_fieldIds[6] + rec.m_ruleNo;
                var eel = document.getElementById(eeid);

                if(eel != null)
                {
                    if(eel.checked != chk.checked)
                        this.m_sendList.push(eeid);

                    eel.checked = chk.checked;
                }
            }
        }

        thisObj.f_setEnableValue2Server();
    };

    this.f_cbOnSelected = function(cbeid)
    {
        var cbb = document.getElementById(cbeid);
        var val = cbb.value;
        var rNo = cbeid.split("-");
        var rec = new UTM_nwNatPatRecord(rNo[1], thisObj.m_direction);

        var sendDPort = function()
        {
            var dport = document.getElementById(thisObj.m_fieldIds[2]+rNo[1]);
            dport.value = thisObj.m_nwObj.f_getPortNumber(rec);
            thisObj.f_sendSetCommand(rec, "dport", dport.value);

            if(rec.m_appService.indexOf("Other") >= 0)
                thisObj.f_enableTextField(dport, true);
            else
                thisObj.f_enableTextField(dport, false);
        }

        var sendProtocol = function()
        {
            var app = rec.m_appService;
            if(app.indexOf("UNIK") >= 0)
            {
                // do nothing
            }
            else if(app.indexOf("IPSec") >= 0)
            {
                // do nothing
            }
            else if(app.indexOf("Others") < 0)
            {
                ////////////////////////////////////
                // set protocol per appService
                var proId = thisObj.m_fieldIds[4]+rNo[1];
                var eProto = document.getElementById(proId);
                var proVal = thisObj.m_nwObj.f_getProtocol(rec);
                eProto.value = proVal;
                rec.m_protocol = proVal;
                thisObj.f_enableComboboxSelection(proId, thisObj.m_protocol, true);

                thisObj.f_sendSetCommand(rec, 'protocol', proVal, sendDPort);
            }
        }

        //////////////////////////////////////////////////////
        // the app service combo changed. set value to server,
        // then send protocol value to server.
        if(cbeid.indexOf(thisObj.m_fieldIds[1]) >= 0)
        {
            rec.m_appService = cbb.value;
            cbb = document.getElementById(thisObj.m_fieldIds[4]+rNo[1]);
            rec.m_protocol = cbb.value;
            thisObj.f_sendSetCommand(rec, 'application', val, sendProtocol);
        }
        else if(cbeid.indexOf(thisObj.m_fieldIds[4]) >= 0)
        {
            rec.m_protocol = cbb.value;
            cbb = document.getElementById(thisObj.m_fieldIds[1]+rNo[1]);
            rec.m_appService = cbb.value;
            thisObj.f_sendSetCommand(rec, 'protocol', val, sendDPort);
        }
    };

    this.f_validateInternalIPAddrs = function()
    {
        //f_isIPAddressValidated
    }

    this.f_handleAddAction = function()
    {
        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            
            if(evt.m_value != null)
            {
                thisObj.f_handleAddNewNatRow(evt.m_value.m_ruleNo);
                thisObj.f_enabledActionButtons(true);
            }
        }

        g_utils.f_cursorWait();
        thisObj.m_busLayer.f_getNatPatNextRuleNo("incoming", cb);
    }

    this.f_handleSaveAction = function()
    {
        var cb = function(evt)
        {
            g_utils.f_cursorDefault();

            if(evt.m_errCode != 0)
                g_utils.f_popupMessage(evt.m_errMsg, "error", g_lang.m_applyError, true);

            thisObj.f_loadVMData();
        };

        thisObj.f_enabledActionButtons(false);
        g_utils.f_cursorWait();
        thisObj.m_busLayer.f_saveNatPatConfiguration(cb);
    };

    this.f_handleCancelAction = function(noCallback)
    {
        var cb = function(evt)
        {
            if(evt.m_errCode != 0)
                g_utils.f_popupMessage(evt.m_errMsg, "error", g_lang.m_cancelError, true);

            g_utils.f_cursorDefault();
            thisObj.f_loadVMData();
        };

        if(noCallback != null && noCallback)
            cb = null;

        g_utils.f_cursorWait();
        thisObj.f_enabledActionButtons(false);
        thisObj.m_busLayer.f_cancelNatPatConfiguration(cb);
    };

    this.f_handleDeleteNatPat = function(ruleNo)
    {
        var cb = function(evt)
        {
            g_utils.f_cursorDefault();

            if(evt.m_errCode != 0)
                g_utils.f_popupMessage(evt.m_errMsg, "error", g_lang.m_deleteError, true);

            thisObj.f_loadVMData();
            thisObj.f_enabledActionButtons(true);
        };

        g_utils.f_cursorWait();
        var fireRec = new UTM_nwNatPatRecord(ruleNo, "incoming");
        thisObj.m_busLayer.f_deleteNatPatConfiguration(fireRec, cb);
    }
}
UTM_extend(UTM_confNwNatPat, UTM_confBaseObj);
//==============================================================================

function f_nwNatPatAddHandler()
{
    g_configPanelObj.m_activeObj.f_handleAddAction();
}

function f_nwNatPatSaveHandler()
{
    g_configPanelObj.m_activeObj.f_handleSaveAction();
}

function f_nwNatPatCancelHandler()
{
    g_configPanelObj.m_activeObj.f_handleCancelAction();
}

function f_nwNatPatDeleteConfirm(ruleNo)
{
    g_configPanelObj.m_activeObj.f_handleDeleteNatPat(ruleNo);
}
function f_nwNatPatDeleteHandler(ruleNo)
{
    g_utils.f_popupMessage(g_lang.m_fireDeleteConfirm,
                'confirm', g_lang.m_fireCustDeleteConfirmHeader, true,
                "f_nwNatPatDeleteConfirm('" + ruleNo + "')");
}

function f_nwNatPatOnTFBlur(tfeid)
{
    g_configPanelObj.m_activeObj.f_cbOnTFBlur(tfeid);
}

function f_nwNatPatOnCbbBlur(cbeId)
{
    g_configPanelObj.m_activeObj.f_cbOnSelected(cbeId);
}

function f_nwNatPatOnChkClick(chkeId)
{
    g_configPanelObj.m_activeObj.f_cbOnChkClick(chkeId);
}
function f_nwNatPatNotUse()
{

}