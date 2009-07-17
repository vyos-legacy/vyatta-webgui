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
    this.m_enabledchkId = "nwNatEnableId";
    this.m_btnAddId = "nwNatPatAddId";
    this.m_btnSaveId = "nwNatPatSaveId";
    this.m_btnCancelId = "nwNatPatCancelId";
    this.m_npRecs = [];
    this.m_fieldIds = ["nat_rulenoId-", "nat_appId-", "nat_dportId-",
                        "nat_iportId-", "nat_proId-", "nat_nat_iipId-"];
    this.m_protocol = ["tcp", "udp", "both"];

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
        return this.f_getPanelDiv(this.f_init());
    }

    this.f_createColumns = function()
    {
        var cols = [];
        UTM_confNwNatPat.superclass.m_allowSort = false;
        this.f_colorGridBackgroundRow(true);

        var chkbox = 'enabled<br>yes/no<br><br>' + thisObj.f_renderCheckbox("no",
                      thisObj.m_enabledchkId, "f_nwNatPathOnChkClick('" +
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
            var enabled = true;

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

        //g_utils.f_cursorWait();
        // thisObj.m_busLayer.f_getNatPatConfigurations(null, thisObj.m_cb);
    };

    this.f_stopLoadVMData = function()
    {
        //thisObj.m_busLayer.f_cancelFirewallCustomizeRule(null);
    }

    this.f_addDataIntoTable = function(fireRec)
    {
        var zpRule = fireRec.m_ruleNo;

        var app = thisObj.f_renderCombobox(thisObj.m_nwObj.m_services, fireRec.m_appService,
                            140, thisObj.m_fieldIds[1]+zpRule,
                            ["f_nwNatPatOnCbbBlur('" + thisObj.m_fieldIds[1]+
                            zpRule + "')", thisObj.m_nwObj.m_ports]);
        var dport = thisObj.f_renderTextField(thisObj.m_fieldIds[2]+zpRule,
                            fireRec.m_destPort, fireRec.m_destPort, 90,
                            ["f_nwNatPatOnTFBlur('" + thisObj.m_fieldIds[2]+
                            zpRule + "')"], false);
        var sport = thisObj.f_renderTextField(thisObj.m_fieldIds[3]+zpRule,
                            fireRec.m_InternPort, fireRec.m_srcPort, 90,
                            ["f_nwNatPatOnTFBlur('" + thisObj.m_fieldIds[3]+
                            zpRule + "')"], false);
        var pro = thisObj.f_renderCombobox(thisObj.m_protocol, fireRec.m_protocol,
                            80, thisObj.m_fieldIds[4]+zpRule,
                            ["f_nwNatPatOnCbbBlur('" + thisObj.m_fieldIds[4]+
                            zpRule + "')"]);
        var sip = thisObj.f_renderTextField(thisObj.m_fieldIds[5]+zpRule,
                            fireRec.m_internIpAddr, '', 170,
                            ["f_nwNatPatOnTFBlur('" + thisObj.m_fieldIds[5]+
                            zpRule + "')"], false);
        var enable = "<div align=center>" + thisObj.f_renderCheckbox(
                  fireRec.m_enabled, thisObj.m_fieldIds[6]+zpRule,
                  "f_fwCustomizeOnChkBlur('"+thisObj.m_fieldIds[6]+zpRule+"')",
                  "") + "</div>";
        var del = "<div align=center>" + thisObj.f_renderButton(
                  "delete", true, "f_nwNatPatDeleteHandler(" + fireRec.m_ruleNo +
                  ")", "") + "</div>";

        ///////////////////////////////////
        // add fields into grid view
        var div = thisObj.f_createGridRow(thisObj.m_colModel,
                    [app, dport, sport, pro, sip, enable, del]);
        thisObj.m_gridBody.appendChild(div);
    };

    this.f_handleAddNewNatRow = function(ruleNo)
    {
        var fireRec = new UTM_nwNatPatRecord(ruleNo);
        thisObj.m_npRecs.push(fireRec);
        thisObj.f_addDataIntoTable(fireRec);
    };

    this.f_init = function()
    {
        this.m_colModel = this.f_createColumns();
        this.m_gridHeader = this.f_createGridHeader(this.m_colModel, "f_nwNatPatNotUse");
        this.m_gridBody = this.f_createGridView(this.m_colModel, false);
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
        var rec = new UTM_nwNatPatRecord(rNo[1]);
        var el = document.getElementById(tfeid);
        var val = el.value;
        var fName = null;

        // ip address text fields
        if(tfeid.indexOf(ids[5]) >= 0 && thisObj.f_isIPAddressValidated(val))
            fName = "internaddr";
        // destination port
        else if(tfeid.indexOf(ids[2]) >= 0)
            fName = "dport";
        // internal port
        else if(tfeid.indexOf(ids[3]) >= 0)
            fName = "internport";

        thisObj.f_sendSetCommand(rec, fName, val);
    }

    this.f_chkOnSelected = function(chkid)
    {
        var chk = document.getElementById(chkid);
        var rNo = chkid.split("-");
        var fireRec = new UTM_nwNatPatRecord(rNo[2]);

        if(chkid.indexOf(thisObj.m_fieldIds[12]) >= 0)
        {
            thisObj.f_sendSetCommand(fireRec, "enable",
                    chk.checked ? "Yes":"No");
        }
    };

    this.f_cbOnSelected = function(cbeid)
    {
        var cbb = document.getElementById(cbeid);
        var val = cbb.value;
        var name = null;
        var rNo = cbeid.split("-");
        var rec = new UTM_nwNatPatRecord(rNo[1]);

        if(cbeid.indexOf(thisObj.m_fieldIds[1]) >= 0)
            name = 'application';
        else if(cbeid.indexOf(thisObj.m_fieldIds[4]) >= 0)
            name = 'protocol';

        thisObj.f_sendSetCommand(rec, name, val);
    };

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
        thisObj.m_busLayer.f_getNatPatNextRuleNo(cb);
    }

    this.f_handleSaveAction = function()
    {
        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            thisObj.f_loadVMData();
        };

        thisObj.f_enabledActionButtons(false);
        g_utils.f_cursorWait();
        thisObj.m_busLayer.f_saveNatPatConfiguration(cb);
    };

    this.f_handleCancelAction = function()
    {
        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            thisObj.f_loadVMData();
        };

        g_utils.f_cursorWait();
        thisObj.f_enabledActionButtons(false);
        thisObj.m_busLayer.f_cancelNatPatConfiguration(cb);
    };

    this.f_handleDeleteNatPat = function(ruleNo)
    {
        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            thisObj.f_loadVMData();
            thisObj.f_enabledActionButtons(true);
        };

        g_utils.f_cursorWait();
        var fireRec = new UTM_nwNatPatRecord(ruleNo);
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

function f_nwNatPathOnChkClick(chkeId)
{
    g_configPanelObj.m_activeObj.f_cbOnchkClick(chkeId);
}
function f_nwNatPatNotUse()
{

}