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
                        "actId-", "logId-", "enableId-"];
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
        return this.f_getPanelDiv(this.f_init());
    }

    this.f_createColumns = function()
    {
        var cols = [];
        this.f_colorGridBackgroundRow(true);

        var chkbox = 'Enabled<br>Yes/No<br><br>' + thisObj.f_renderCheckbox("no",
                      thisObj.m_enabledchkId, "f_fwCustomizeOnChkBlur('" +
                      thisObj.m_enabledchkId+"')", 'Click here to enable/disable all');

        //cols[0] = this.f_createColumn("Rule<br>Number", 65, 'combo', '3', false, 'center');
        cols[0] = this.f_createColumn(g_lang.m_fireCustDirection, 100, 'text', '6', false, 'center');
        cols[1] = this.f_createColumn(g_lang.m_fireCustAppService, 100, 'combo', '3', false, 'center');
        cols[2] = this.f_createColumn(g_lang.m_fireCustProtocol, 70, 'combo', '3', false, 'center');
        cols[3] = this.f_createColumn(g_lang.m_fireCustSrcIpAddr, 115, 'textField', '3', false, 'center');
        cols[4] = this.f_createColumn(g_lang.m_fireCustSrcMaskIpAddr, 115, 'textField', '3', false, 'center');
        cols[5] = this.f_createColumn(g_lang.m_fireCustSrcPort, 90, 'textField', '3', false, 'center');
        cols[6] = this.f_createColumn(g_lang.m_fireCustDestIpAddr, 115, 'textField', '3', false, 'center');
        cols[7] = this.f_createColumn(g_lang.m_fireCustDestMaskIpAddr, 115, 'textField', '3', false, 'center');
        cols[8] = this.f_createColumn(g_lang.m_fireCustDestPort, 90, 'textField', '3', false, 'center');
        cols[9] = this.f_createColumn(g_lang.m_fireCustAction, 90, 'combo', '3', false, 'center');
        cols[10] = this.f_createColumn("Log", 55, 'checkbox', '3', false, 'center');
        //cols[11] = this.f_createColumn(g_lang.m_fireCustOrder, 80, 'combo', '3', false, 'center');
        cols[11] = this.f_createColumn(chkbox, 55, 'checkbox', '3', false, 'center');
        cols[12] = this.f_createColumn(g_lang.m_fireCustDelete, 55, 'combo', '3', false, 'center');

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
            var elid = thisObj.m_fieldIds[12] + fr.m_zonePair + "-" + fr.m_ruleNo;
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
                    var inner = "";

                    for(var i=0; i<evt.m_value.length; i++)
                    {
                        var dir = evt.m_value[i].m_direction;
                        thisObj.m_zonePairs.push(dir);
                        inner += "<option value='" + dir + "' name='" + dir +
                                  "'>" + dir + "</option>";
                    }

                    combo.innerHTML += inner;
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

                    thisObj.populateTable(evt.m_value, fireRec.m_zonePair);
                }

                thisObj.f_onOffEnabledAllChkBox();
            }

            if(fireRec.m_zonePair != "Any")
                thisObj.f_adjustGridHeight();
        };

        thisObj.m_zpIndex = 1;
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
        thisObj.m_busLayer.f_cancelFirewallCustomizeRule(null);
    }

    this.f_getZoneAny = function(cb)
    {
        if(thisObj.m_zpIndex < thisObj.m_zonePairs.length)
        {
            g_utils.f_cursorWait();
            var fr = new UTM_fireRecord(null, thisObj.m_zonePairs[thisObj.m_zpIndex++]);
            thisObj.m_busLayer.f_getFirewallSecurityCustomize(fr, cb);
        }
        else
            thisObj.f_adjustGridHeight();
    }

    this.f_adjustGridHeight = function()
    {
        var counter = thisObj.m_fireRecs != null ? thisObj.m_fireRecs.length : 0;
        var h = counter * 30 + 105;

        // the minimum height of grid is 160
        if(counter < 2)
            h = 168;

        thisObj.m_grid.style.height = h+"px";
        thisObj.f_resetTableRowCounter(0);
        window.setTimeout(function(){thisObj.f_resize();}, 20);
    }

    this.populateTable = function(records, zonePair)
    {
        for(var i=0; i<records.length; i++)
        {
            if(zonePair != "Any")
                thisObj.f_addRecordIntoTable(records[i]);
            else
                thisObj.f_addReadOnlyRecIntoTable(records[i]);
        }
    }

    this.f_addReadOnlyRecIntoTable = function(fireRec)
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

        ///////////////////////////////////
        // add fields into grid view
        var div = thisObj.f_createGridRow(thisObj.m_colModel,
                    [fireRec.m_direction, fireRec.m_appService, fireRec.m_protocol,
                     fireRec.m_srcIpAddr, fireRec.m_srcMaskIpAddr,
                     fireRec.m_srcPort, fireRec.m_destIpAddr, fireRec.m_destMaskIpAddr,
                     dport, fireRec.m_action, log, enable, del]);
        thisObj.m_gridBody.appendChild(div);
    }

    this.f_addRecordIntoTable = function(fireRec)
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
                  fireRec.m_enabled, thisObj.m_fieldIds[12]+zpRule,
                  "f_fwCustomizeOnChkBlur('"+thisObj.m_fieldIds[12]+zpRule+"')",
                  "") + "</div>";

        //var up = thisObj.f_renderButton("ArrowUp",
          //        ruleNo == 10 ? false:true, "f_fireCustomArrowUpHandler('"+
            //      ruleNo + "')", '');
        //var dn = thisObj.f_renderButton("ArrowDown", true,
          //        "f_fireCustomArrowDownHandler('" + ruleNo + "')", '');
        //var order = "<div align=center>" + up + "&nbsp;&nbsp;&nbsp;" + dn + "</div>";
        var del = "<div align=center>" + thisObj.f_renderButton(
                  "delete", true, "f_fireCustomDeleteHandler(" + fireRec.m_ruleNo +
                  ")", "") + "</div";

        ///////////////////////////////////
        // add fields into grid view
        var div = thisObj.f_createGridRow(thisObj.m_colModel,
                    [fireRec.m_direction, app, pro, sip, smip, sport, dip, dmip, dport,
                    act, log, enable, del]);
        thisObj.m_gridBody.appendChild(div);

        if(fireRec.m_appService.indexOf("Others") < 0)
        {
            thisObj.f_enableComboboxSelection(thisObj.m_fieldIds[3]+zpRule,
                    [fireRec.m_protocol], true);
        }
    };


    this.f_handleAddFirewallCustomRow = function(ruleNo)
    {
        var fireRec = thisObj.f_createFireRecord(ruleNo);
        thisObj.m_fireRecs.push(fireRec);
        thisObj.f_addRecordIntoTable(fireRec);
        thisObj.f_setRuleDefaultValues(fireRec);
        thisObj.f_adjustGridHeight();
    };

    this.f_init = function()
    {
        this.m_colModel = this.f_createColumns();
        this.m_gridHeader = this.f_createGridHeader(this.m_colModel, "f_fwCustomNotUse");
        this.m_gridBody = this.f_createGridView(this.m_colModel, false);
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
            thisObj.f_adjustGridHeight();
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
        thisObj.f_sendSetCommand(fireRec, "log", "Yes");

        var sendAction = function()
        {
            thisObj.f_sendSetCommand(fireRec, "action", "accept");
        }

        var sendEnabled = function()
        {
            thisObj.f_sendSetCommand(fireRec, "enable", "Yes");
            window.setTimeout(sendAction, 500);
        };

        window.setTimeout(sendEnabled, 500);
    };

    this.f_getTheNextRuleNo = function(zonePair)
    {
        var fireRec = thisObj.m_fireRecs[thisObj.m_fireRecs.length-1];
        if(fireRec == null)
            return 1;
        else
            return Number(fireRec.m_ruleNo) + 1;
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
            alert("invalid ip address : " + ip);
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
                var fireRec = thisObj.f_createFireRecord(profixId);
                thisObj.f_sendSetCommand(fireRec, fName, ip+"/"+newCidr);
            }
        }
        else
        {
            var fireRec = thisObj.f_createFireRecord(profixId);
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
            alert('netmask invalidate');
            return;
        }

        ////////////////////////////////////////////
        // check ip address textfield
        var fIds = tfeid.split("-");
        var fId = (fIds[0]+"-" == thisObj.m_fieldIds[5]) ? fId = 4: fId = 7;
        this.f_handleIPAddressOnBlur(this.m_fieldIds[fId]+fIds[1]+"-"+fIds[2], cidr);

        return;
    };

    this.f_chkOnSelected = function(chkid)
    {
        var chk = document.getElementById(chkid);
        var rNo = chkid.split("-");
        var fireRec = thisObj.f_createFireRecord(rNo[2]);

        /////////////////////////
        // log column
        if(chkid.indexOf(thisObj.m_fieldIds[11]) >= 0)
        {
            thisObj.f_sendSetCommand(fireRec, "log",
                    chk.checked ? "Yes":"No");
        }
        ////////////////////////
        // enabled column
        else if(chkid.indexOf(thisObj.m_fieldIds[12]) >= 0)
        {
            thisObj.f_sendSetCommand(fireRec, "enable",
                    chk.checked ? "Yes":"No");
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
                var elid = thisObj.m_fieldIds[12] + fr.m_zonePair + "-" + fr.m_ruleNo;
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
            if(fireRec.m_appService.indexOf("Others") < 0)
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

                window.setTimeout(function(){sendproto(fireRec, proVal)}, 100);

                thisObj.f_enableTextField(dport, false);
                thisObj.f_enableComboboxSelection(proId, [fireRec.m_protocol], true);
            }
            else
            {
                thisObj.f_enableTextField(dport, true);
                thisObj.f_enableComboboxSelection(proId, [], false);
            }
        }

        window.setTimeout(function(){sendDPort(fireRec)}, 100);
    }

    this.f_handleShowRuleChanged = function()
    {
        if(!thisObj.m_isDirty)
        {
            thisObj.m_busLayer.f_cancelFirewallCustomizeRule(null);
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
        for(var i=0; i<cbb.options.length; i++)
        {
            if(cbb.options[i].selected)
            {
                var attr = cbb.options[i].attributes;

                for(var j=0; j<attr.length; j++)
                {
                    if(attr[j].nodeName == 'name')
                        return attr[j].nodeValue;
                }
            }
        }

        return '';
    };

    this.f_handleAddAction = function()
    {
        var cb = function(evt)
        {
            if(evt != undefined && evt.m_objName == 'UTM_eventObj')
            {
                if(evt.m_value != null)
                {
                    //thisObj.f_handleAddFirewallCustomRow(thisObj.f_getTheNextRuleNo(null));
                    thisObj.f_handleAddFirewallCustomRow(evt.m_value.m_ruleNo);
                }
            }
        }

        ////////////////////////////////////////////
        // get the next rule num from server.
        var rc = thisObj.f_createFireRecord(null);
        thisObj.m_busLayer.f_getFirewallZoneMgmtNextRuleNo(rc.m_zonePair, cb);
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

    this.f_handleCancelAction = function()
    {
        var cb = function(evt)
        {
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
    alert('arrow up ' + ruleNo);
}

function f_fireCustomArrowDownHandler(ruleNo)
{
    alert('arrow down ' + ruleNo);
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