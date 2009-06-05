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
    this.m_fwObj = busLayer.f_getFWObject();
    this.m_btnAddId = "nwNatPatAddId";
    this.m_btnSaveId = "nwNatPatSaveId";
    this.m_btnCancelId = "nwNatPatCancelId";
    this.m_btnBackId = "nwNatPatBackId";
    this.m_npRecs = [];
    this.m_ruleZoneOptName = [/*"Any",*/ "DMZ_to_LAN", "DMZ_to_WAN", "LAN_to_DMZ",
                      "LAN_to_WAN", "WAN_to_DMZ", "WAN_to_LAN"];
    this.m_fieldIds = ["rulenoId-", "appId-", "dportId-", "iportId-", "proId-",
                        "iipId-"];
    this.m_protocol = ["any", "tcp", "udp", "icmp", "ipsec", "vrrp", " "];

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
        this.f_colorGridBackgroundRow(true);

        cols[0] = this.f_createColumn(g_lang.m_fireCustAppService, 150, 'combo', '3', false, 'center');
        cols[1] = this.f_createColumn(g_lang.m_fireCustDestPort, 100, 'textField', '3', false, 'center');
        cols[2] = this.f_createColumn(g_lang.m_fireCustInternPort, 100, 'textField', '3', false, 'center');
        cols[3] = this.f_createColumn(g_lang.m_fireCustProtocol, 90, 'combo', '3', false, 'center');
        cols[4] = this.f_createColumn(g_lang.m_fireCustInternIpAddr, 180, 'textField', '3', false, 'center');
        cols[5] = this.f_createColumn(g_lang.m_fireCustDelete, 70, 'combo', '3', false, 'center');

        return cols;
    }

    this.f_createFireRecord = function(ruleNo)
    {
        return new UTM_nwNatPatRecord(ruleNo, zonePair);
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
                        thisObj.f_addDataIntoRow(evt.m_value[i]);
                }
            }

            thisObj.f_adjustGridHeight();
        };

        //g_utils.f_cursorWait();
    };

    this.f_stopLoadVMData = function()
    {
        //thisObj.m_busLayer.f_cancelFirewallCustomizeRule(null);
    }

    this.f_adjustGridHeight = function()
    {
        var counter = thisObj.m_npRecs != null ? thisObj.m_npRecs.length : 0;
        var h = counter * 30 + 105;

        // the minimum height of grid is 160
        if(counter < 2)
            h = 168;

        thisObj.m_grid.style.height = h+"px";
        thisObj.f_resetTableRowCounter(0);

        window.setTimeout(function(){thisObj.f_resize();}, 10);
    }
    this.f_addDataIntoRow = function(fireRec)
    {
        var zpRule = fireRec.m_zonePair + "-" + fireRec.m_ruleNo;
        var action = ["accept", "reject"]

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
                            zpRule + "')"], false);
        var del = "<div align=center>" + thisObj.f_renderButton(
                  "delete", true, "f_fireCustomDeleteHandler(" + fireRec.m_ruleNo +
                  ")", "") + "</div";

        ///////////////////////////////////
        // add fields into grid view
        var div = thisObj.f_createGridRow(thisObj.m_colModel,
                    [app, pro, sip, sport, dip, dmip, dport, del]);
        thisObj.m_gridBody.appendChild(div);
    };

    this.f_handleAddFirewallCustomRow = function(ruleNo)
    {
        var fireRec = thisObj.f_createFireRecord(ruleNo);
        thisObj.m_npRecs.push(fireRec);
        thisObj.f_addFirewallIntoRow(fireRec);
        thisObj.f_adjustGridHeight();
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

        this.m_grid = this.f_initGridDiv([this.m_gridHeader, this.m_gridBody])

        window.setTimeout(function()
        {
            thisObj.f_adjustGridHeight();
            thisObj.f_enabledActionButtons(false);
        }, 100);

        return [this.f_headerText(), this.m_grid, this.m_buttons];
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
        div.style.width = "690px";

        for(var i=0; i<children.length; i++)
            div.appendChild(children[i]);

        return div;
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
    };

    this.f_cbOnSelected = function(cbeid)
    {
        var cbb = document.getElementById(cbeid);
        var rNo = cbeid.split("-");
        var fireRec = thisObj.f_createFireRecord(rNo[2]);

        ///////////////////////////////
        // application/service cbb changed
        if(cbeid.indexOf(thisObj.m_fieldIds[2]) >= 0)
        {
            var dport = document.getElementById(thisObj.m_fieldIds[9]+rNo[1]+"-"+rNo[2]);
            var proto = document.getElementById(thisObj.m_fieldIds[3]+rNo[1]+"-"+rNo[2]);

            fireRec.m_appService = cbb.value;

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

    this.f_handleAddAction = function()
    {
        //thisObj.f_handleAddFirewallCustomRow(thisObj.f_getTheNextRuleNo(null));
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
        thisObj.m_busLayer.f_saveFirewallCustomizeRule(cb);
    };

    this.f_handleCancelAction = function()
    {
        var cb = function(evt)
        {
            thisObj.f_loadVMData();
        };

        g_utils.f_cursorWait();
        thisObj.f_enabledActionButtons(false);
        thisObj.m_busLayer.f_cancelFirewallCustomizeRule(cb);
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
UTM_extend(UTM_confNwNatPat, UTM_confBaseObj);

function f_f_nwNatPatAddHandler()
{
    g_configPanelObj.m_activeObj.f_handleAddAction();
}

function f_f_nwNatPatSaveHandler()
{
    g_configPanelObj.m_activeObj.f_handleSaveAction();
}

function f_f_nwNatPatCancelHandler()
{
    g_configPanelObj.m_activeObj.f_handleCancelAction();
}

function f_f_nwNatPatDeleteConfirm(ruleNo)
{
    g_configPanelObj.m_activeObj.f_handleDeleteRule(ruleNo);
}
function f_f_nwNatPatDeleteHandler(ruleNo)
{
    g_utils.f_popupMessage(g_lang.m_fireDeleteConfirm,
                'confirm', g_lang.m_fireCustDeleteConfirmHeader, true,
                "f_f_nwNatPatDeleteConfirm('" + ruleNo + "')");
}

function f_f_nwNatPatOnTFBlur(tfeid)
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

function f_f_nwNatPatOnCbbBlur(cbeId)
{
    g_configPanelObj.m_activeObj.f_cbOnSelected(cbeId);
}

function f_f_nwNatPatNotUse()
{

}