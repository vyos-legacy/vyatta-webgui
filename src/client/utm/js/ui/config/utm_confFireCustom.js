/*
    Document   : utm_confFireCustom.js
    Created on : May 05, 2009, 11:21:31 AM
    Author     : Kevin.Choi
    Description:
*/

/**
 * Firewall Customized configuration panel screen
 */
function UTM_confFireCustom(name, callback, busLayer, levelRec)
{
    var thisObj = this;
    this.m_fwObj = busLayer.f_getFWObject();
    this.m_levelRec = levelRec;
    this.m_isDirty = false;
    this.m_resyncNextRuleNo = -1;           // auto get next rule number.
                                            // to be used for case get next rule num is
                                            // exceed the limit. when limitation is
                                            // reach, backend re-order all rule numbers.
                                            // Frontend needs to reload and
                                            // get next rule number again.
                                            // -1 : no resync required
                                            // > 0 : resynce is required.
    this.m_headercbbId = "fwCustomHeaderCombo_id";
    this.m_enabledchkId = "firewallCustomEnableId";
    this.m_btnAddId = "wfCustomizeAddId";
    this.m_btnSaveId = "wfCustomizeSaveId";
    this.m_btnResetId = "wfCustomizeResetId";
    this.m_btnCancelId = "wfCustomeizeCancelId";
    this.m_btnBackId = "wfCustomizeBackId";
    this.m_zonePairs = ["Any"];
    this.m_fireRecs = [];
    this.thisObjName = 'UTM_confFireCustom';
    this.m_fieldIds = ["rulenoId-", "dirId-", "appId-", "proId-", "sipId-", "smipId-",
                        "sportId-", "dipId-", "dmipId-", "dportId-",
                        "actId-", "logId-", "orderId-", "enableId-"];
    this.m_protocol = ["Any", "tcp", "udp", "both", "icmp", "ip", " "];

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        UTM_confFireCustom.superclass.constructor(name, callback, busLayer);
    }
    this.constructor(name, callback, busLayer);

    this.f_getConfigurationPage = function()
    {
        this.m_resyncNextRuleNo = -1;

        this.f_handleCancelAction(true);
        return this.f_getPanelDiv(this.f_init());
    }

    this.f_createColumns = function()
    {
        var cols = [];
        this.f_colorGridBackgroundRow(true);

        var chkbox = 'enabled<br><br>' + thisObj.f_renderCheckbox("no",
                      thisObj.m_enabledchkId, "f_fwCustomizeOnChkBlur('" +
                      thisObj.m_enabledchkId+"')", 'Click here to enable/disable all');

        cols[0] = this.f_createColumn(g_lang.m_fireCustRuleNo, 60, 'combo', '6', false, 'center');
        cols[1] = this.f_createColumn(g_lang.m_fireCustDirection, 100, 'text', '6', false, 'center');
        cols[2] = this.f_createColumn(g_lang.m_fireCustAppService, 100, 'combo', '3', false, 'center');
        cols[3] = this.f_createColumn(g_lang.m_fireCustProtocol, 70, 'combo', '3', false, 'center');
        cols[4] = this.f_createColumn(g_lang.m_fireCustSrcIpAddr, 115, 'textField', '3', false, 'center');
        cols[5] = this.f_createColumn(g_lang.m_fireCustSrcMaskIpAddr, 115, 'textField', '3', false, 'center');
        cols[6] = this.f_createColumn(g_lang.m_fireCustSrcPort, 90, 'textField', '3', false, 'center');
        cols[7] = this.f_createColumn(g_lang.m_fireCustDestIpAddr, 115, 'textField', '3', false, 'center');
        cols[8] = this.f_createColumn(g_lang.m_fireCustDestMaskIpAddr, 115, 'textField', '3', false, 'center');
        cols[9] = this.f_createColumn(g_lang.m_fireCustDestPort, 90, 'textField', '3', false, 'center');
        cols[10] = this.f_createColumn(g_lang.m_fireCustAction, 90, 'combo', '3', false, 'center');
        cols[11] = this.f_createColumn("log", 55, 'checkbox', '3', false, 'center');
        cols[12] = this.f_createColumn(g_lang.m_fireCustOrder, 80, 'combo', '3', false, 'center');
        cols[13] = this.f_createColumn(chkbox, 55, 'checkbox', '3', false, 'center');
        cols[14] = this.f_createColumn(g_lang.m_fireCustDelete, 60, 'combo', '3', false, 'center');

        return cols;
    }

    this.f_createFireRecord = function(ruleNo)
    {
        var ruleOp = document.getElementById(thisObj.m_headercbbId);
        var zonePair = this.f_getComboBoxOptionName(ruleOp);

        return new UTM_fireRecord(ruleNo, zonePair);
    }

    this.f_sendSetCommand = function(fireRec, name, value, wantCB)
    {
        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            thisObj.f_enabledActionButtons(true);

            if(name == 'enable')
                thisObj.f_onOffEnabledAllChkBox();

            if(wantCB != null)
                wantCB(evt);
        }

        g_utils.f_cursorWait();
        thisObj.m_busLayer.f_setFirewallCustomize(fireRec, name, value, cb);
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

    this.f_onOffEnabledAllChkBox = function()
    {
        var enabled = true;
        for(var i=0; i<thisObj.m_fireRecs.length; i++)
        {
            var fr = thisObj.m_fireRecs[i];
            var elid = thisObj.m_fieldIds[13] + fr.m_zonePair + "-" + fr.m_ruleNo;
            var chk = document.getElementById(elid);

            if(chk != null)
                enabled = (!chk.checked || !enabled) ? false : true;
        }

        var chkAll = document.getElementById(thisObj.m_enabledchkId);
        chkAll.checked = enabled;
    }

    this.f_loadZonePairs = function()
    {
        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            if(evt != undefined && evt.m_objName == 'UTM_eventObj')
            {
                thisObj.m_levelRecs = evt.m_value;
                thisObj.m_zonePairs = ["Any"];
                if(evt.m_value != null && evt.m_value.length > 0)
                {
                    var combo = document.getElementById(thisObj.m_headercbbId);

                    for(var i=0; i<evt.m_value.length; i++)
                    {
                        var newOpt = document.createElement('option')
                        var dir = evt.m_value[i].m_direction;
                        newOpt.text = dir;
                        newOpt.value = dir;
                        try
                        {
                            combo.add(newOpt, null);
                        }
                        catch(ex)
                        {
                            combo.add(newOpt);   // for IE
                        }
                        thisObj.m_zonePairs.push(dir);
                    }
                }

                thisObj.f_loadVMData(thisObj.m_levelRec.m_direction);
            }
        };

        g_utils.f_cursorWait();
        this.m_busLayer.f_getFirewallSecurityLevel('ALL', cb);
    }

    this.f_loadVMData = function(zonePair)
    {
        thisObj.m_updateFields = [];

        thisObj.m_cb = function(evt)
        {
            g_utils.f_cursorDefault();

            if(evt != undefined && evt.m_objName == 'UTM_eventObj')
            {
                if(evt.m_value != null)
                {
                    if(fireRec.m_zonePair != "Any")
                    {
                        thisObj.m_fireRecs = evt.m_value;
                        thisObj.f_removeDivChildren(thisObj.m_gridBody);
                    }
                    else
                    {
                        var newArr = thisObj.m_fireRecs.concat(evt.m_value);
                        thisObj.m_fireRecs = newArr;

                        thisObj.f_getZoneAny(thisObj.m_cb);
                    }

                    thisObj.f_populateTable(evt.m_value, fireRec.m_zonePair);
                }

                thisObj.f_onOffEnabledAllChkBox();
            }

            if(thisObj.m_resyncNextRuleNo > 0)
            {
                thisObj.f_handleAddNewFirewallCustomRow(thisObj.m_resyncNextRuleNo+"");
                thisObj.m_resyncNextRuleNo = -1;
            }
        };

        thisObj.m_zpIndex = 1;  // start from the show rules combo index 1
                                // index 0 is 'Any' which we want to skip.
        thisObj.m_fireRecs = [];
        var ruleOp = document.getElementById(thisObj.m_headercbbId);
        var fireRec = new UTM_fireRecord(null, zonePair);
        if(zonePair == null && ruleOp != null)
            fireRec = thisObj.f_createFireRecord(null);
        else
            thisObj.f_setComboBoxOptionName(zonePair);

        ////////////////////////////////////////////
        // if rule option is 'any', get all rules
        if(fireRec.m_zonePair == "Any")
        {
            thisObj.f_getZoneAny(thisObj.m_cb);
            thisObj.f_removeDivChildren(thisObj.m_gridBody);
            thisObj.f_enabledDisableButton(thisObj.m_btnAddId, false);
            thisObj.f_enabledDisableButton(thisObj.m_btnResetId, false);
        }
        else
        {
            g_utils.f_cursorWait();
            thisObj.f_enabledDisableButton(thisObj.m_btnAddId, true);
            thisObj.f_enabledDisableButton(thisObj.m_btnResetId, true);
            thisObj.m_busLayer.f_getFirewallSecurityCustomize(fireRec, thisObj.m_cb);
        }
    };

    this.f_stopLoadVMData = function()
    {
        var cb = function()
        {

        }

        thisObj.m_busLayer.f_cancelFirewallCustomizeRule("customize-firewall", cb);
    }

    this.f_getZoneAny = function(cb)
    {
        if(thisObj.m_zpIndex < thisObj.m_zonePairs.length)
        {
            g_utils.f_cursorWait();
            var fr = new UTM_fireRecord(null, thisObj.m_zonePairs[thisObj.m_zpIndex++]);
            thisObj.m_busLayer.f_getFirewallSecurityCustomize(fr, cb);
        }
    }

    this.f_populateTable = function(records, zonePair)
    {
        for(var i=0; i<records.length; i++)
        {
            if(zonePair != "Any")
                thisObj.f_addRecordIntoTable(records[i], i+1, false);
            else
                thisObj.f_addReadOnlyRecIntoTable(records[i], i+1);
        }
    }

    this.f_addReadOnlyRecIntoTable = function(fireRec, rowNo)
    {
        var c = "<div align=center>";
        var chkImg = fireRec.m_log == 'Yes' ? "images/check.gif" : "images/uncheck.gif";
        var log = c + thisObj.f_renderImage(chkImg, "f_fwCustomNotUse",
                  g_lang.m_fireCustLogEnabled) + "</div>";
        chkImg = fireRec.m_enabled == 'Yes' ? "images/check.gif" : "images/uncheck.gif";
        var enable = c + thisObj.f_renderImage(chkImg, "f_fwCustomNotUse",
                    g_lang.m_fireCustEnableEnabled) + "</div>";
        var del = c + thisObj.f_renderImage("images/en/ico_delete_disabled.gif",
              "f_fwCustomNotUse", g_lang.m_fireCustDeleteNotAllow) + "</div>";

        var dport = fireRec.m_destPort;
        dport = dport.length > 15 ? dport.substring(0, 15) : dport;

        var order = thisObj.f_createOrderDiv(fireRec, true);

        ///////////////////////////////////
        // add fields into grid view
        var div = thisObj.f_createGridRow(thisObj.m_colModel,
                    [thisObj.f_createSimpleDiv(rowNo, 'center'),
                     thisObj.f_createSimpleDiv(fireRec.m_direction, 'center'),
                     thisObj.f_createSimpleDiv(fireRec.m_appService, 'center'),
                     thisObj.f_createSimpleDiv(fireRec.m_protocol, 'center'),
                     thisObj.f_createSimpleDiv(fireRec.m_srcIpAddr, 'center'),
                     thisObj.f_createSimpleDiv(fireRec.m_srcMaskIpAddr, 'center'),
                     thisObj.f_createSimpleDiv(fireRec.m_srcPort, 'center'),
                     thisObj.f_createSimpleDiv(fireRec.m_destIpAddr, 'center'),
                     thisObj.f_createSimpleDiv(fireRec.m_destMaskIpAddr, 'center'),
                     thisObj.f_createSimpleDiv(dport, 'center'),
                     thisObj.f_createSimpleDiv(fireRec.m_action, 'center'),
                     log, order, enable, del], null, null, true);
        thisObj.f_addRowIntoGridTable(thisObj.m_gridBody, div, true);
        //thisObj.m_gridBody.appendChild(div);
    }

    this.f_addRecordIntoTable = function(fireRec, rowNo, orderReadonly)
    {
        var c = "<div align=center>";
        var zpRule = fireRec.m_zonePair + "-" + fireRec.m_ruleNo;
        var action = ["accept", "reject"]
        var readonly = fireRec.m_appService.indexOf("Others") >= 0 ? false :true;

        var app = thisObj.f_renderCombobox(thisObj.m_fwObj.m_services, fireRec.m_appService, 90,
                            thisObj.m_fieldIds[2]+zpRule,
                            ["f_fwCustomizeOnCbbBlur('" + thisObj.m_fieldIds[2]+
                            zpRule + "')", thisObj.m_fwObj.m_ports]);
        var pro = thisObj.f_renderCombobox(thisObj.m_protocol, fireRec.m_protocol, 60,
                            thisObj.m_fieldIds[3]+zpRule,
                            ["f_fwCustomizeOnCbbBlur('" + thisObj.m_fieldIds[3]+
                            zpRule + "')"]);
        var sip = thisObj.f_renderTextField(thisObj.m_fieldIds[4]+zpRule,
                            fireRec.m_srcIpAddr, '', 105,
                            ["f_fwCustomOnTFBlur('" + thisObj.m_fieldIds[4]+
                            zpRule + "')"], false);
        var smip = thisObj.f_renderTextField(thisObj.m_fieldIds[5]+zpRule,
                            fireRec.m_srcMaskIpAddr, '', 105,
                            ["f_fwCustomOnTFBlur('" + thisObj.m_fieldIds[5]+
                            zpRule + "')"], false);
        var sport = thisObj.f_renderTextField(thisObj.m_fieldIds[6]+zpRule,
                            fireRec.m_srcPort, fireRec.m_srcPort, 80,
                            ["f_fwCustomOnTFBlur('" + thisObj.m_fieldIds[6]+
                            zpRule + "')"], false);
        var dip = thisObj.f_renderTextField(thisObj.m_fieldIds[7]+zpRule,
                            fireRec.m_destIpAddr, '', 105,
                            ["f_fwCustomOnTFBlur('" + thisObj.m_fieldIds[7]+
                            zpRule + "')"], false);
        var dmip = thisObj.f_renderTextField(thisObj.m_fieldIds[8]+zpRule,
                            fireRec.m_destMaskIpAddr, '', 105,
                            ["f_fwCustomOnTFBlur('" + thisObj.m_fieldIds[8]+
                            zpRule + "')"], false);
        var dport = thisObj.f_renderTextField(thisObj.m_fieldIds[9]+zpRule,
                            fireRec.m_destPort, fireRec.m_destPort, 80,
                            ["f_fwCustomOnTFBlur('" + thisObj.m_fieldIds[9]+
                            zpRule + "')"], readonly);
        var act = thisObj.f_renderCombobox(action, fireRec.m_action, 80,
                            thisObj.m_fieldIds[10]+zpRule,
                            ["f_fwCustomizeOnCbbBlur('" + thisObj.m_fieldIds[10]+
                            zpRule + "')"]);
        var log = c + thisObj.f_renderCheckbox(fireRec.m_log,
                  thisObj.m_fieldIds[11]+zpRule,
                  "f_fwCustomizeOnChkBlur('"+thisObj.m_fieldIds[11]+zpRule+"')",
                  "") + "</div>";
        var enable = c + thisObj.f_renderCheckbox(
                  fireRec.m_enabled, thisObj.m_fieldIds[13]+zpRule,
                  "f_fwCustomizeOnChkBlur('"+thisObj.m_fieldIds[13]+zpRule+"')",
                  "") + "</div>";

        var del = "<div align=center width=45>" + thisObj.f_renderButton(
                  "delete", true, "f_fireCustomDeleteHandler(" + fireRec.m_ruleNo +
                  ")", g_lang.m_tooltip_delete) + "</div";

        var order = thisObj.f_createOrderDiv(fireRec, orderReadonly);

        ///////////////////////////////////
        // add fields into grid view
        var div = thisObj.f_createGridRow(thisObj.m_colModel,
                    [rowNo, fireRec.m_direction, app, pro, sip, smip,
                     sport, dip, dmip, dport, act, log, order, enable, del],
                    null, null, true);
        thisObj.f_addRowIntoGridTable(thisObj.m_gridBody, div, true);
        //thisObj.m_gridBody.appendChild(div);

        if(fireRec.m_appService.indexOf("Others") < 0)
        {
            thisObj.f_enableComboboxSelection(thisObj.m_fieldIds[3]+zpRule,
                    [fireRec.m_protocol], true);
        }
    };

    this.f_createOrderDiv = function(rec, readonly)
    {
        var upDis = !readonly ? !rec.m_first : !readonly;
        var dnDis = !readonly ? !rec.m_last : !readonly;
        var up = thisObj.f_renderButton("ArrowUp", upDis,
                  "f_fireCustomArrowUpHandler('"+rec.m_ruleNo+"')",
                  g_lang.m_fireCustOrderUpTip);
        var dn = thisObj.f_renderButton("ArrowDown", dnDis,
                  "f_fireCustomArrowDownHandler('" + rec.m_ruleNo + "')",
                  g_lang.m_fireCustOrderDnTip);

        return "<div align=center>" + dn + "&nbsp;&nbsp;&nbsp;" + up + "</div>";
    }

    this.f_handleOrderCustomRow = function(ruleNo, order)
    {
        var cb = function(evt)
        {
            if(evt != null && evt.m_errCode == 0)
            {
                thisObj.f_loadVMData();
                thisObj.f_enabledActionButtons(true);
            }
        }

        var recs = thisObj.m_fireRecs;
        var rec = null;
        for(var i=0; i<recs.length; i++)
        {
            rec = recs[i];

            if(rec.m_ruleNo == ruleNo)
                break;

            rec = null;
        }

        if(rec != null)
            thisObj.m_busLayer.f_setFirewallCustomizeOrder(rec, order, cb);
    }

    this.f_handleAddNewFirewallCustomRow = function(ruleNo)
    {
        if(ruleNo.indexOf("resync") >= 0)
        {
            var resync = ruleNo.split("-");
            thisObj.m_resyncNextRuleNo = Number(resync[1]);
            thisObj.f_loadVMData();
        }
        else
        {
            var fireRec = thisObj.f_createFireRecord(ruleNo);
            thisObj.m_fireRecs.push(fireRec);
            thisObj.f_addRecordIntoTable(fireRec, thisObj.m_fireRecs.length, true);
            thisObj.f_setRuleDefaultValues(fireRec);
        }
    };

    this.f_init = function()
    {
        this.m_colModel = this.f_createColumns();
        this.m_gridHeader = this.f_createGridHeader(this.m_colModel, "f_fwCustomNotUse");
        this.m_gridBody = this.f_createGridView(this.m_colModel, false, true);
        this.f_loadZonePairs();

        var btns = [['Add', "f_fireCustomAddHandler()",
                    g_lang.m_fireCustAddTip, this.m_btnAddId],
                    ['Reset', "f_fireCustomResetHandler()",
                    g_lang.m_fireCustResetTip, this.m_btnResetId],
                    ['Apply', "f_fireCustomSaveHandler()",
                    g_lang.m_fireCustSaveTip, this.m_btnSaveId],
                    ['Cancel', "f_fireCustomCancelHandler()",
                    g_lang.m_fireCustCancelTip, this.m_btnCancelId],
                    ['Back', "f_fireCustomBackHandler()",
                    g_lang.m_fireCustBackTip, this.m_btnBackId]];
        this.m_buttons = this.f_createButtons(btns);

        this.m_grid = this.f_initGridDiv([this.m_gridHeader, this.m_gridBody])

        window.setTimeout(function()
        {
            thisObj.f_enabledActionButtons(false);
        }, 100);

        return [this.f_headerText(), this.f_headerCombo(), this.f_subHeaderText(),
                this.m_grid, this.m_buttons];
    };

    this.f_initGridDiv = function(children)
    {
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.display = 'block';
        div.style.border = '1px solid #CCC';
        div.style.backgroundColor = 'white';
        div.style.overflow = 'auto';
        div.style.height = "300";
        div.style.width = "795px";

        for(var i=0; i<children.length; i++)
            div.appendChild(children[i]);

        return div;
    };

    this.f_setRuleDefaultValues = function(fireRec)
    {
        //thisObj.f_sendSetCommand(fireRec, "log", "Yes");

        //var sendAction = function()
        //{
        thisObj.f_sendSetCommand(fireRec, "action", "accept");
        //}

        var sendEnabled = function()
        {
            thisObj.f_sendSetCommand(fireRec, "enable", "Yes");
            //window.setTimeout(sendAction, 500);
        };

        window.setTimeout(sendEnabled, 500);
    };

    this.f_headerText = function()
    {
        return this.f_createGeneralDiv("<br>");
    };

    this.f_subHeaderText = function()
    {
        return this.f_createGeneralDiv("<br><br><b>" + g_lang.m_fireCustSubHeader+":</b><br><br>");
    };

    this.f_headerCombo = function()
    {
        var combo = this.f_renderCombobox(thisObj.m_zonePairs,
                    this.m_zonePairs[1], 180,
                    thisObj.m_headercbbId, ["f_onwfCustomizeHeaderCombo()",
                    this.m_zonePairs]);

        return this.f_createGeneralDiv("<b>" + g_lang.m_fireCustRuleOption +
                ":&nbsp;&nbsp;&nbsp;</b>" + combo);
    };

    this.f_enabledActionButtons = function(enabled)
    {
        thisObj.m_isDirty = enabled;
        thisObj.f_enabledDisableButton(thisObj.m_btnSaveId, enabled);
        thisObj.f_enabledDisableButton(thisObj.m_btnCancelId, enabled);
    };

    this.f_handleIPAddressOnBlur = function(tfeid, cidr)
    {
        var tf = document.getElementById(tfeid);
        var ip = tf.value;

        ///////////////////////////////
        // validate ip address
        if(!g_utils.f_validateIP(ip))
        {
            g_utils.f_popupMessage(g_lang.m_invalidIpAddr + " : " + ip, "error",
                          g_lang.m_ipaddrTitle, true);
            tf.focus();
            return;
        }

        ////////////////////////////////////////////
        // check netmask textfield
        var fIds = tfeid.split("-");
        var newCidr = cidr;
        var fId = "";
        var fName = "";
        if(fIds[0]+"-" == thisObj.m_fieldIds[4])
        {
            fId = 5;
            fName = "saddr";
        }
        else
        {
            fId = 8;
            fName = "daddr";
        }

        var profixId = fIds[1] + "-" + fIds[2];
        if(cidr == null)
        {
            var snm = document.getElementById(thisObj.m_fieldIds[fId]+profixId);
            if(g_utils.f_validateNetmask(snm.value))
            {
                newCidr = g_utils.f_convertNetmaskToCIDR(snm.value);
                var fireRec = thisObj.f_createFireRecord([fIds[2]]);
                thisObj.f_sendSetCommand(fireRec, fName, ip+"/"+newCidr);
            }
        }
        else
        {
            var fireRec = thisObj.f_createFireRecord(fIds[2]);
            thisObj.f_sendSetCommand(fireRec, fName, ip+"/"+newCidr);
        }
    }

    this.f_handleNetMaskOnBlur = function(tfeid)
    {
        var tf = document.getElementById(tfeid);
        var cidr = null;

        if(g_utils.f_validateNetmask(tf.value))
            cidr = g_utils.f_convertNetmaskToCIDR(tf.value);
        else
        {
            g_utils.f_popupMessage(g_lang.m_invalidIpAddr + " : " + ip, "error",
                          g_lang.m_ipaddrTitle, true);
            tf.focus();
            return;
        }

        ////////////////////////////////////////////
        // check ip address textfield
        var fIds = tfeid.split("-");
        var fId = (fIds[0]+"-" == thisObj.m_fieldIds[5]) ? fId = 4: fId = 7;
        this.f_handleIPAddressOnBlur(this.m_fieldIds[fId]+fIds[1]+"-"+fIds[2], cidr);

        return;
    };

    this.f_handleTFOnBlur = function(tfeid)
    {
        var tf = document.getElementById(tfeid);
        var val = tf.value;
        var fName = tfeid.split("Id-");

        if(fName[0] != null)
        {
            var rNo = tfeid.split("-");
            var rec = thisObj.f_createFireRecord(rNo[2])
            thisObj.f_sendSetCommand(rec, fName[0], val);
            thisObj.f_enabledActionButtons(true);
        }
    }

    this.f_chkOnSelected = function(chkid)
    {
        var chk = document.getElementById(chkid);
        var rNo = chkid.split("-");
        var fireRec = thisObj.f_createFireRecord(rNo[2]);

        /////////////////////////
        // log column
        if(chkid.indexOf(thisObj.m_fieldIds[11]) >= 0)
        {
            thisObj.f_sendSetCommand(fireRec, "log", chk.checked ? "Yes":"No");
        }
        ////////////////////////
        // enabled column
        else if(chkid.indexOf(thisObj.m_fieldIds[13]) >= 0)
        {
            thisObj.f_sendSetCommand(fireRec, "enable", chk.checked ? "Yes":"No");
        }
        /////////////////////////
        // enabled all enable columns
        else if(chkid == thisObj.m_enabledchkId)
        {
            var reload = false;

            var cb = function()
            {
                if(sends.length > 0)
                {
                    var sRC = sends.pop();
                    thisObj.f_sendSetCommand(sRC, "enable", sRC.m_enabled, cb);
                    reload = true;
                }
                else if(reload)
                    thisObj.f_loadVMData();
            }

            var sends = [];
            for(var i=0; i<thisObj.m_fireRecs.length; i++)
            {
                var fr = thisObj.m_fireRecs[i];
                var elid = thisObj.m_fieldIds[13] + fr.m_zonePair + "-" + fr.m_ruleNo;
                var c = document.getElementById(elid);

                if(chk.checked != c.checked)
                {
                    fr.m_enabled = chk.checked ? "Yes" : "No";
                    sends.push(fr);
                }
            }

            cb();
        }
    };

    /**
     * handle application field changaed. populate protocol and dest port
     * fields if application selection is not 'others'
     * 
     * @param fireRec - record
     * @param cbb - application checkbox object
     * @param rNo - rule number id
     * @param cbeid - application element id
     */
    this.f_handleApplicationChanged = function(fireRec, cbb, rNo, cbeid)
    {
        var proId = thisObj.m_fieldIds[3]+rNo[1]+"-"+rNo[2];
        var dport = document.getElementById(thisObj.m_fieldIds[9]+rNo[1]+"-"+rNo[2]);
        var proto = document.getElementById(proId);

        fireRec.m_appService = cbb.value;
        thisObj.f_sendSetCommand(fireRec, "application", cbb.value);

        var sendDPort = function(fireRec)
        {
            thisObj.f_enableTextField(dport, true);
            var app = fireRec.m_appService;

            if(app.indexOf("UNIK") >= 0)
            {
                thisObj.f_enableComboboxSelection(proId, ["udp", "ip"], true);
            }
            else if(app.indexOf("IPSec") >= 0)
            {
                thisObj.f_enableComboboxSelection(proId, ["tcp","udp","ip"], true);
            }
            else if(app.indexOf("Others") < 0)
            {
                ////////////////////////////////////
                // set protocol per appService
                var proVal = thisObj.m_fwObj.f_getProtocol(fireRec);
                proto.value = proVal;
                fireRec.m_protocol = proto.value;
                dport.value = thisObj.m_fwObj.f_getPortNumber(fireRec);

                thisObj.f_sendSetCommand(fireRec, "dport", dport.value);

                var sendproto = function(fr, val)
                {
                    if(val != null)
                        thisObj.f_sendSetCommand(fr, "protocol", val);
                }

                window.setTimeout(function(){sendproto(fireRec, proVal)}, 800);

                thisObj.f_enableTextField(dport, false);
                thisObj.f_enableComboboxSelection(proId, [fireRec.m_protocol], true);
            }
            else
                thisObj.f_enableComboboxSelection(proId, [], false);
        }

        window.setTimeout(function(){sendDPort(fireRec)}, 800);
    }

    this.f_handleShowRuleChanged = function()
    {
        var cb = function()
        {

        };

        if(!thisObj.m_isDirty)
        {
            thisObj.m_busLayer.f_cancelFirewallCustomizeRule("customize-firewall", cb);
            thisObj.f_enabledActionButtons(false);
            thisObj.f_loadVMData();
        }
        else
        {
            g_utils.f_popupMessage(g_lang.m_confModify,
                'confirm', "Firewall Customize", true,
                "f_fireCustomShowRuleConfirm(this)");
        }
    }

    this.f_cbOnSelected = function(cbeid)
    {
        var cbb = document.getElementById(cbeid);
        var rNo = cbeid.split("-");
        var fireRec = thisObj.f_createFireRecord(rNo[2]);

        /////////////////////////////
        // show rule from cbb
        if(cbeid.indexOf(thisObj.m_headercbbId) >= 0)
        {
            this.f_handleShowRuleChanged();
        }
        /*
        else if(cbeid.indexOf(thisObj.m_fieldIds[1]) >= 0)
        {
            var zonePair = cbb.value;
            var ruleNo = thisObj.f_getTheNextRuleNo(zonePair);
            while(thisObj.f_isRuleNoTaken(zonePair, ruleNo))
            {
                ruleNo += 10;
            }
            fireRec.m_ruleNo = ruleNo;
            fireRec.m_zonePair = zonePair;
            thisObj.f_setRuleDefaultValues(fireRec);
        }*/
        ///////////////////////////////
        // application/service cbb changed
        else if(cbeid.indexOf(thisObj.m_fieldIds[2]) >= 0)
        {
            thisObj.f_handleApplicationChanged(fireRec, cbb, rNo, cbeid);
        }
        /////////////////////////////
        // protocol cbb changed
        else if(cbeid.indexOf(thisObj.m_fieldIds[3]) >= 0)
        {
            var dport = document.getElementById(thisObj.m_fieldIds[9]+rNo[1]+"-"+rNo[2]);
            var service = document.getElementById(thisObj.m_fieldIds[2]+rNo[1]+"-"+rNo[2]);

            var senddport = function(fr, val)
            {
                if(val != null)
                    thisObj.f_sendSetCommand(fr, "dport", val);
            }

            fireRec.m_protocol = cbb.value;
            fireRec.m_appService = service.value;
            thisObj.f_sendSetCommand(fireRec, "protocol", cbb.value);

            dport.value = thisObj.m_fwObj.f_getPortNumber(fireRec);
            window.setTimeout(function(){senddport(fireRec, dport.value)}, 100);

        }
        ////////////////////////////////////////
        // action cbb changed
        else if(cbeid.indexOf(thisObj.m_fieldIds[10]) >= 0)
        {
            var act = document.getElementById(thisObj.m_fieldIds[10]+rNo[1]+"-"+rNo[2]);
            thisObj.f_sendSetCommand(fireRec, "action", act.value);
        }
    };

    this.f_setComboBoxOptionName = function(zonepair)
    {
        var ruleOp = document.getElementById(thisObj.m_headercbbId);
        ruleOp.value = zonepair;
    }

    this.f_getComboBoxOptionName = function(cbb)
    {
        return cbb.value;
    };

    this.f_handleAddAction = function()
    {
        var cb = function(evt)
        {
            if(evt != undefined && evt.m_objName == 'UTM_eventObj')
            {
                if(evt.m_value != null)
                    thisObj.f_handleAddNewFirewallCustomRow(evt.m_value.m_ruleNo);
            }
        }

        if(thisObj.m_fireRecs.length >= 999) // over the limit of 999 rules per zone-pair
        {
            g_utils.f_popupMessage(g_lang.m_fireCustLimitation,
                                  'ok', g_lang.m_fireCustTitle, true);
        }
        else
        {
            ////////////////////////////////////////////
            // get the next rule num from server.
            var rc = thisObj.f_createFireRecord(null);
            thisObj.m_resyncNextRuleNo = -1;
            thisObj.m_busLayer.f_getFirewallZoneMgmtNextRuleNo(rc.m_zonePair, cb);
        }
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
        thisObj.m_busLayer.f_saveFirewallCustomizeRule("customize-firewall", cb);
    };

    this.f_handleResetAction = function()
    {
        var cb = function(evt)
        {
            thisObj.f_loadVMData();
            //thisObj.f_handleSaveAction();
        };

        g_utils.f_cursorWait();
        thisObj.m_busLayer.f_resetFirewallCustomizeRule(thisObj.f_createFireRecord("all"),cb);
    };

    this.f_handleCancelAction = function(doNotReload)
    {
        var cb = function(evt)
        {
            if(doNotReload == null || !doNotReload)
                thisObj.f_loadVMData();
        };

        g_utils.f_cursorWait();
        thisObj.f_enabledActionButtons(false);
        thisObj.m_busLayer.f_cancelFirewallCustomizeRule("customize-firewall", cb);
    };

    this.f_handleDeleteRule = function(ruleNo)
    {
        var cb = function(evt)
        {
            thisObj.f_loadVMData();
            thisObj.f_enabledActionButtons(true);
        };

        g_utils.f_cursorWait();
        var fireRec = thisObj.f_createFireRecord(ruleNo);
        thisObj.m_busLayer.f_deleteFirewallCustomizeRule(fireRec, cb);
    }
}
UTM_extend(UTM_confFireCustom, UTM_confBaseObj);

function f_fireCustomAddHandler()
{
    g_configPanelObj.m_activeObj.f_handleAddAction();
}

function f_fireCustomSaveHandler()
{
    g_configPanelObj.m_activeObj.f_handleSaveAction();
}

function f_fireCustomCancelHandler()
{
    g_configPanelObj.m_activeObj.f_handleCancelAction();
}

function f_fireCustomResetConfirm()
{
    g_configPanelObj.m_activeObj.f_handleResetAction();
}
function f_fireCustomResetHandler()
{
    var ruleOp = document.getElementById("fwCustomHeaderCombo_id");

    if(ruleOp.value != "Any")
    {
        g_utils.f_popupMessage(g_lang.m_fireResetConfirm,
                'confirm', g_lang.m_fireCustResetConfirmHeader, true,
                "f_fireCustomResetConfirm()");
    }
    else
        alert("Please select a Zone Direction from the Combobox 'Show rules only from:' to be reset ");
}

function f_fireCustomDeleteHandler(ruleNo)
{
    g_configPanelObj.m_activeObj.f_handleDeleteRule(ruleNo);
}

function f_fireCustomBackConfirm(e)
{
    if(e.getAttribute('id')== 'ft_popup_message_apply')
    {
        f_fireCustomCancelHandler();
        g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_FW_ID);
    }
}

function f_fireCustomBackHandler()
{
    if(g_configPanelObj.m_activeObj.m_isDirty)
        g_utils.f_popupMessage(g_lang.m_confModify,
                'confirm', "Firewall Customize", true,
                "f_fireCustomBackConfirm(this)");
    else
        g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_FW_ID);
}

function f_fireCustomArrowUpHandler(ruleNo)
{
    g_configPanelObj.m_activeObj.f_handleOrderCustomRow(ruleNo, "up");
}

function f_fireCustomArrowDownHandler(ruleNo)
{
g_configPanelObj.m_activeObj.f_handleOrderCustomRow(ruleNo, "down");
}

function f_fwCustomOnTFBlur(tfeid)
{
    var aObj = g_configPanelObj.m_activeObj;

    // ip address text fields
    if(tfeid.indexOf(aObj.m_fieldIds[4]) >= 0 ||
        tfeid.indexOf(aObj.m_fieldIds[7]) >= 0)
        aObj.f_handleIPAddressOnBlur(tfeid, null);
    // net mask text fields
    else if(tfeid.indexOf(aObj.m_fieldIds[5]) >= 0 ||
        tfeid.indexOf(aObj.m_fieldIds[8]) >= 0)
        aObj.f_handleNetMaskOnBlur(tfeid);
    else
        aObj.f_handleTFOnBlur(tfeid);
}

function f_fireCustomShowRuleConfirm(e)
{
    if(e.getAttribute('id')== 'ft_popup_message_apply')
    {
        var aObj = g_configPanelObj.m_activeObj;
        aObj.m_isDirty = false;
        aObj.f_handleShowRuleChanged();
    }
}
function f_fwCustomizeOnCbbBlur(cbeId)
{
    g_configPanelObj.m_activeObj.f_cbOnSelected(cbeId);
}

function f_fwCustomizeOnChkBlur(chkid)
{
    g_configPanelObj.m_activeObj.f_chkOnSelected(chkid);
}

function f_onwfCustomizeHeaderCombo()
{
    g_configPanelObj.m_activeObj.f_cbOnSelected('fwCustomHeaderCombo_id');
}

function f_fwCustomNotUse()
{

}