/*
    Document   : utm_confFireCustom.js
    Created on : May 05, 2009, 11:21:31 AM
    Author     : Kevin.Choi
    Description:
*/

/**
 * Firewall Customized configuration panel screen
 */
function UTM_confFireCustom(name, callback, busLayer)
{
    var thisObj = this;
    this.m_fireRecs = null;
    this.thisObjName = 'UTM_confFireCustom';
    this.m_nextRuleNo = null;
    this.m_ruleZoneOptions = ["Any", "DMZ to LAN traffic", "DMZ to WAN ..", "LAN to DMZ ..",
                      "LAN to WAN ..", "WAN to DMZ ..", "WAN to LAN .."];
    this.m_ruleZoneOptName = ["Any", "DMZ_to_LAN", "DMZ_to_WAN", "LAN_to_DMZ",
                      "LAN_to_WAN", "WAN_to_DMZ", "WAN_to_LAN"];
    this.m_fieldIds = ["rulenoId_", "dirId_", "appId_", "proId_", "sipId_", "smipId_",
                        "sportId_", "dipId_", "dmipId_", "dportId_",
                        "actId_", "logId_", "enableId_"];

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
        this.f_colorGridBackgroundRow(true);

        var chkbox = 'Enabled<br><br>' + thisObj.f_renderCheckbox('no',
                      'firewallCustomEnable', 'f_firewallCustomEnableChkboxCb',
                      'tooltip');
        var chkbox2 = g_lang.m_fireCustLog + '<br>Yes/No<br><br>' + thisObj.f_renderCheckbox('no',
                      'firewallCustomLog', 'f_firewallCustomLogChkboxCb',
                      'tooltip');

        //cols[0] = this.f_createColumn("Rule<br>Number", 65, 'combo', '3', false, 'center');
        cols[0] = this.f_createColumn(g_lang.m_fireCustDirection, 95, 'text', '6', false, 'center');
        cols[1] = this.f_createColumn(g_lang.m_fireCustAppService, 100, 'combo', '3', false, 'center');
        cols[2] = this.f_createColumn(g_lang.m_fireCustProtocol, 70, 'combo', '3', false, 'center');
        cols[3] = this.f_createColumn(g_lang.m_fireCustSrcIpAddr, 115, 'textField', '3', false, 'center');
        cols[4] = this.f_createColumn(g_lang.m_fireCustSrcMaskIpAddr, 115, 'textField', '3', false, 'center');
        cols[5] = this.f_createColumn(g_lang.m_fireCustSrcPort, 90, 'textField', '3', false, 'center');
        cols[6] = this.f_createColumn(g_lang.m_fireCustDestIpAddr, 115, 'textField', '3', false, 'center');
        cols[7] = this.f_createColumn(g_lang.m_fireCustDestMaskIpAddr, 115, 'textField', '3', false, 'center');
        cols[8] = this.f_createColumn(g_lang.m_fireCustDestPort, 90, 'textField', '3', false, 'center');
        cols[9] = this.f_createColumn(g_lang.m_fireCustAction, 90, 'combo', '3', false, 'center');
        cols[10] = this.f_createColumn(chkbox2, 55, 'checkbox', '3', false, 'center');
        cols[11] = this.f_createColumn(g_lang.m_fireCustOrder, 80, 'combo', '3', false, 'center');
        cols[12] = this.f_createColumn(chkbox, 55, 'checkbox', '3', false, 'center');
        cols[13] = this.f_createColumn(g_lang.m_fireCustDelete, 55, 'combo', '3', false, 'center');

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
            alert(evt.m_value);
        }

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
                if(evt.m_value != null)
                {
                    thisObj.m_fireRecs = evt.m_value;
                    for(var i=0; i<evt.m_value.length; i++)
                        thisObj.f_addFirewallIntoRow(evt.m_value[i]);
                }
            }

            var mainPanel = document.getElementById("utm_confpanel_");
            if(mainPanel != null)
                mainPanel.style.height = 460+'px';
        };

        g_utils.f_cursorWait();

        var ruleOp = document.getElementById('fwCustomHeaderCombo_id');
        var fireRec = new UTM_fireRecord(null, "LAN_to_WAN");
        if(ruleOp != null)
            fireRec = thisObj.f_createFireRecord(null);
        thisObj.m_busLayer.f_getFirewallSecurityCustomize(fireRec, cb);
    };

    this.f_addFirewallIntoRow = function(fireRec)
    {
        var ruleNo = fireRec.m_ruleNo;
        var services = ["DNS-UDP", "DNS-TCP", "HTTP", "HTTPS", "FTP_DATA",
                        "FTP", "POP3", "SMTP", "SMTP-Auth", "TFTP", "POP3S",
                        "IMAP", "NTP", "NNTP", "SNMP", "Telnet", "SSH",
                        "L2TP", "Traceroute", "IPSec", "UNIK", "H323 host call - TCP",
                        "H323 host call - UDP", "SIP-TCP", "SIP-UDP",
                        "ICA-TCP", "ICA-UDP", "Others"];
        var servName = ["53", "53", "80", "443", "20", "21", "110", "25", "587",
                        "69", "995", "143", "119", "199", "161-162", "23", "22",
                        "1701", "32769-65535", "22", "500, 4500", "500, 4500",
                        "1720", "1718, 1719", "5060", "5060", "1494", "1494", ""];
        var proto = ["tcp", "udp", "tcp/udp", "icmp", "ipsec (ESP)", "vrrp"];
        var action = ["accept", "reject"]
        var options = ["Any", "DMZ to LAN traffic", "DMZ to WAN ..", "LAN to DMZ ..",
                      "LAN to WAN ..", "WAN to DMZ ..", "WAN to LAN .."];

        //var rNo = thisObj.f_renderTextField(thisObj.m_fieldIds[0]+ruleNo, '', '', 55,
        //          ["f_fwCustomOnTFBlur('" + thisObj.m_fieldIds[0]+ruleNo + "')"]);
        var app = thisObj.f_renderCombobox(services, fireRec.m_appService, 90,
                            thisObj.m_fieldIds[2]+ruleNo,
                            ["f_fwCustomOnCbbBlur('" + thisObj.m_fieldIds[2]+
                            ruleNo + "')", servName]);
        var pro = thisObj.f_renderCombobox(proto, fireRec.m_protocol, 60,
                            thisObj.m_fieldIds[3]+ruleNo,
                            ["f_fwCustomOnCbbBlur('" + thisObj.m_fieldIds[3]+
                            ruleNo + "')"]);
        var sip = thisObj.f_renderTextField(thisObj.m_fieldIds[4]+ruleNo,
                            fireRec.m_srcIpAddr, '', 105,
                            ["f_fwCustomOnTFBlur('" + thisObj.m_fieldIds[4]+
                            ruleNo + "')"], false);
        var smip = thisObj.f_renderTextField(thisObj.m_fieldIds[5]+ruleNo,
                            fireRec.m_srcMaskIpAddr, '', 105,
                            ["f_fwCustomOnTFBlur('" + thisObj.m_fieldIds[5]+
                            ruleNo + "')"], false);
        var sport = thisObj.f_renderTextField(thisObj.m_fieldIds[6]+ruleNo,
                            fireRec.m_srcPort, '', 80,
                            null, false);
        var dip = thisObj.f_renderTextField(thisObj.m_fieldIds[7]+ruleNo,
                            fireRec.m_destIpAddr, '', 105,
                            ["f_fwCustomOnTFBlur('" + thisObj.m_fieldIds[7]+
                            ruleNo + "')"], false);
        var dmip = thisObj.f_renderTextField(thisObj.m_fieldIds[8]+ruleNo,
                            fireRec.m_destMaskIpAddr, '', 105,
                            ["f_fwCustomOnTFBlur('" + thisObj.m_fieldIds[8]+
                            ruleNo + "')"], false);
        var dport = thisObj.f_renderTextField(thisObj.m_fieldIds[9]+ruleNo,
                            fireRec.m_destPort, '', 80, null, false);
        var act = thisObj.f_renderCombobox(action, fireRec.m_action, 80,
                            thisObj.m_fieldIds[10]+ruleNo,
                            ["f_fwCustomizeOnCbbBlur('" + thisObj.m_fieldIds[10]+
                            ruleNo + "')"]);
        var log = "<div align=center>" + thisObj.f_renderCheckbox(fireRec.m_log,
                  thisObj.m_fieldIds[11]+ruleNo, "", "") + "</div>";
        var enable = "<div align=center>" + thisObj.f_renderCheckbox(
                  fireRec.m_enabled, thisObj.m_fieldIds[12]+ruleNo, "", "") + "</div>";

        var up = thisObj.f_renderButton("ArrowUp",
                  ruleNo == 10 ? false:true, "f_fireCustomArrowUpHandler('"+
                  ruleNo + "')", '');
        var dn = thisObj.f_renderButton("ArrowDown", true,
                  "f_fireCustomArrowDownHandler('" + ruleNo + "')", '');
        var order = "<div align=center>" + up + "&nbsp;&nbsp;&nbsp;" + dn + "</div>";
        var del = "<div align=center>" + thisObj.f_renderButton(
                  "delete", true, "f_fireCustomDeleteHandler(" + ruleNo +
                  ")", "") + "</div";

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
            thisObj.m_nextRuleNo = Number(fr.m_ruleNo) + 10;
        }
        else
            thisObj.m_nextRuleNo += 10;

        return thisObj.m_nextRuleNo;
    }

    this.f_performSaveRules = function()
    {
        for(var i=0; i<thisObj.m_nextRuleNo; i++)
        {
            var fn = thisObj.m_fieldIds[0]+i;
            var f1 = document.getElementById(fn);
            if(f1 != null)
            {
                alert(f1.value + " : " + i);
            }
        }
    };

    this.f_handleAddFirewallCustomRow = function(ruleNo, ruleOp)
    {
        var services = ["DNS-UDP", "DNS-TCP", "HTTP", "HTTPS", "FTP_DATA",
                        "FTP", "POP3", "SMTP", "SMTP-Auth", "TFTP", "POP3S",
                        "IMAP", "NTP", "NNTP", "SNMP", "Telnet", "SSH",
                        "L2TP", "Traceroute", "IPSec", "UNIK", "H323 host call - TCP",
                        "H323 host call - UDP", "SIP-TCP", "SIP-UDP",
                        "ICA-TCP", "ICA-UDP", "Others"];
        var servName = ["53", "53", "80", "443", "20", "21", "110", "25", "587",
                        "69", "995", "143", "119", "199", "161-162", "23", "22",
                        "1701", "32769-65535", "22", "500, 4500", "500, 4500",
                        "1720", "1718, 1719", "5060", "5060", "1494", "1494", ""];
        var proto = ["TCP", "UDP", "TCP/UDP", "ICMP", "IPSec (ESP)", "VRRP"];
        var action = ["Accept", "Reject"]
        var options = ["Any", "DMZ to LAN traffic", "DMZ to WAN ..", "LAN to DMZ ..",
                      "LAN to WAN ..", "WAN to DMZ ..", "WAN to LAN .."];

        //var rNo = thisObj.f_renderTextField(thisObj.m_fieldIds[0]+ruleNo, '', '', 55,
        //          ["f_fwCustomOnTFBlur('" + thisObj.m_fieldIds[0]+ruleNo + "')"]);
        var app = thisObj.f_renderCombobox(services, "DNS-UDP", 90,
                            thisObj.m_fieldIds[2]+ruleNo,
                            ["f_fwCustomOnCbbBlur('" + thisObj.m_fieldIds[2]+
                            ruleNo + "')", servName]);
        var pro = thisObj.f_renderCombobox(proto, "Any", 60,
                            thisObj.m_fieldIds[3]+ruleNo,
                            ["f_fwCustomOnCbbBlur('" + thisObj.m_fieldIds[3]+
                            ruleNo + "')"]);
        var sip = thisObj.f_renderTextField(thisObj.m_fieldIds[4]+ruleNo,
                            '255.255.255.254', '', 105,
                            ["f_fwCustomOnTFBlur('" + thisObj.m_fieldIds[4]+
                            ruleNo + "')"], false);
        var smip = thisObj.f_renderTextField(thisObj.m_fieldIds[5]+ruleNo,
                            '255.255.128.0', '', 105,
                            ["f_fwCustomOnTFBlur('" + thisObj.m_fieldIds[5]+
                            ruleNo + "')"], false);
        var sport = thisObj.f_renderTextField(thisObj.m_fieldIds[6]+ruleNo, '255', '', 80,
                            null, false);
        var dip = thisObj.f_renderTextField(thisObj.m_fieldIds[7]+ruleNo,
                            '255.255.255.253', '', 105,
                            ["f_fwCustomOnTFBlur('" + thisObj.m_fieldIds[7]+
                            ruleNo + "')"], false);
        var dmip = thisObj.f_renderTextField(thisObj.m_fieldIds[8]+ruleNo,
                            '255.255.255.128', '', 105,
                            ["f_fwCustomOnTFBlur('" + thisObj.m_fieldIds[8]+
                            ruleNo + "')"], false);
        var dport = thisObj.f_renderTextField(thisObj.m_fieldIds[9]+ruleNo, '255',
                            '', 80, null, false);
        var act = thisObj.f_renderCombobox(action, "Any", 80,
                            thisObj.m_fieldIds[10]+ruleNo,
                            ["f_fwCustomizeOnCbbBlur('" + thisObj.m_fieldIds[10]+
                            ruleNo + "')"]);
        var log = "<div align=center>" + thisObj.f_renderCheckbox(
                  'no', thisObj.m_fieldIds[11]+ruleNo, "", "") + "</div>";
        var enable = "<div align=center>" + thisObj.f_renderCheckbox(
                  'no', thisObj.m_fieldIds[12]+ruleNo, "", "") + "</div>";

        var up = thisObj.f_renderButton("ArrowUp",
                  ruleNo == 10 ? false:true, "f_fireCustomArrowUpHandler('"+
                  ruleNo + "')", '');
        var dn = thisObj.f_renderButton("ArrowDown", true,
                  "f_fireCustomArrowDownHandler('" + ruleNo + "')", '');
        var order = "<div align=center>" + up + "&nbsp;&nbsp;&nbsp;" + dn + "</div>";
        var del = "<div align=center>" + thisObj.f_renderButton(
                  "delete", true, "f_fireCustomDeleteHandler(" + ruleNo +
                  ")", "") + "</div";

        ///////////////////////////////////
        // add fields into grid view
        var div = thisObj.f_createGridRow(thisObj.m_colModel,
                    [ruleOp.value, app, pro, sip, smip, sport, dip, dmip, dport,
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
        this.f_loadVMData();

        var btns = [['Add', "f_fireCustomAddHandler()", "", this.m_btnAddId],
                    ['Save', "f_fireCustomSaveHandler()", "", this.m_btnSaveId],
                    ['Reset', "f_fireCustomResetHandler()", "", this.m_btnRestId],
                    ['Cancel', "f_fireCustomCancelHandler()", "", this.m_btnCancelId],
                    ['Back', "f_fireCustomBackHandler()", "", this.m_btnBackId]];
        this.m_buttons = this.f_createButtons(btns);

        var grid = this.f_initGridDiv([this.m_gridHeader, this.m_gridBody])

        //window.setTimeout("f_fireCustomAddHandler()", 100);

        return [this.f_headerText(), this.f_headerCombo(), this.f_subHeaderText(),
                grid, this.m_buttons];
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

    this.f_headerText = function()
    {
        return this.f_createGeneralDiv(g_lang.m_fireLevelHeader+"<br><br>");
    };

    this.f_subHeaderText = function()
    {
        return this.f_createGeneralDiv("<br><br><b>" + g_lang.m_fireCustSubHeader+":</b><br><br>");
    };

    this.f_headerCombo = function()
    {
        var combo = this.f_renderCombobox(thisObj.m_ruleZoneOptions,
                    this.m_ruleZoneOptions[4], 180,
                    'fwCustomHeaderCombo_id', ['f_onwfCustomHeaderCombo()',
                    this.m_ruleZoneOptName]);

        return this.f_createGeneralDiv("<b>" + g_lang.m_fireCustRuleOption +
                ":&nbsp;&nbsp;&nbsp;</b>" + combo);
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
        var fIds = tfeid.split("_");
        var newCidr = cidr;
        if(cidr == null)
        {
            var fId = "";
            var fName = "";
            if(fIds[0]+"_" == thisObj.m_fieldIds[4])
            {
                fId = 5;
                fName = "saddr";
            }
            else
            {
                fId = 8;
                fName = "daddr";
            }

            var snm = document.getElementById(thisObj.m_fieldIds[fId]+fIds[1]);
            if(g_utils.f_validateNetmask(snm.value))
            {
                newCidr = g_utils.f_convertNetmaskToCIDR(snm.value);
                var fireRec = thisObj.f_createFireRecord(fIds[1]);
                thisObj.f_sendSetCommand(fireRec, fName, ip+"/"+newCidr);
            }
        }
        else
        {
            var fireRec = thisObj.f_createFireRecord(fIds[1]);
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
        var fIds = tfeid.split("_");
        var fId = (fIds[0]+"_" == thisObj.m_fieldIds[5]) ? fId = 4: fId = 7;
        this.f_handleIPAddressOnBlur(this.m_fieldIds[fId]+fIds[1], cidr);

        return;
    };

    this.f_cbOnRuleOptionSelected = function(cbeid)
    {
        var cbb = document.getElementById(cbeid);
        var opName = thisObj.f_getComboBoxOptionName(cbb);

        if(opName == 'Any')
        {

        }

        //this.m_busLayer
    };

    this.f_cbOnSelected = function(cbeid)
    {
        var cbb = document.getElementById(cbeid);

        if(cbeid.indexOf(thisObj.m_fieldIds[2]) >= 0)
        {
            var rNo = cbeid.split("_");
            var val = thisObj.f_getComboBoxOptionName(cbb);

            var src = document.getElementById(thisObj.m_fieldIds[6]+rNo[1]);
            var dest = document.getElementById(thisObj.m_fieldIds[9]+rNo[1]);

            src.value = val;
            dest.value = val;
        }
    };

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

    this.f_handleResetAction = function()
    {
        alert('testing')
    };

    this.f_handleCancelAction = function()
    {

    };
}
UTM_extend(UTM_confFireCustom, UTM_confBaseObj);

function f_fireCustomAddHandler()
{
    var aObj = g_configPanelObj.m_activeObj;
    var ruleOp = document.getElementById('fwCustomHeaderCombo_id');

    aObj.f_handleAddFirewallCustomRow(aObj.f_getTheNextRuleNo(), ruleOp);
    var mainPanel = document.getElementById("utm_confpanel_");
    if(mainPanel != null)
    {
        mainPanel.style.height = 460+'px';

    }
}

function f_fireCustomSaveHandler()
{
    g_configPanelObj.m_activeObj.f_performSaveRules();
}

function f_fireCustomCancelHandler()
{
    g_configPanelObj.m_activeObj.f_handleCancelAction();
}

function f_fireCustomResetHandler()
{
    g_configPanelObj.m_activeObj.f_handleResetAction();
}

function f_fireCustomBackHandler()
{
    g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_FW_ID);
}
function f_fireCustomDeleteHandler(ruleNo)
{
    alert('delete ' + ruleNo + ruleNo.toString(2));
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

function f_fwCustomOnCbbBlur(cbeId)
{
    g_configPanelObj.m_activeObj.f_cbOnSelected(cbeId);
}

function f_onwfCustomHeaderCombo()
{
    g_configPanelObj.m_activeObj.f_cbOnSelected('fwCustomHeaderCombo_id');
}