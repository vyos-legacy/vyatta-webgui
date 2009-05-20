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
    this.thisObjName = 'UTM_confFireCustom';
    this.m_nextRuleNo = 10;
    this.m_fieldIds = ["rule_no_id", "blk_id", "app_id", "pro_id", "sip_id", "smip_id",
                        "sport_id", "dip_id", "dmip_id", "dport_id",
                        "act_id", "log_id", "enable_id"];

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
        var chkbox2 = g_lang.m_fireCustLog + '<br><br>' + thisObj.f_renderCheckbox('no',
                      'firewallCustomLog', 'f_firewallCustomLogChkboxCb',
                      'tooltip');

        //cols[0] = this.f_createColumn("Rule<br>Number", 65, 'combo', '3', false, 'center');
        cols[0] = this.f_createColumn("   ", 100, 'text', '6', false, 'left');
        cols[1] = this.f_createColumn(g_lang.m_fireCustAppService, 100, 'combo', '3', false, 'center');
        cols[2] = this.f_createColumn(g_lang.m_fireCustProtocol, 70, 'combo', '3', false, 'center');
        cols[3] = this.f_createColumn(g_lang.m_fireCustSrcIpAddr, 115, 'combo', '3', false, 'center');
        cols[4] = this.f_createColumn(g_lang.m_fireCustSrcMaskIpAddr, 115, 'combo', '3', false, 'center');
        cols[5] = this.f_createColumn(g_lang.m_fireCustSrcPort, 90, 'combo', '3', false, 'center');
        cols[6] = this.f_createColumn(g_lang.m_fireCustDestIpAddr, 115, 'combo', '3', false, 'center');
        cols[7] = this.f_createColumn(g_lang.m_fireCustDestMaskIpAddr, 115, 'combo', '3', false, 'center');
        cols[8] = this.f_createColumn(g_lang.m_fireCustDestPort, 90, 'combo', '3', false, 'center');
        cols[9] = this.f_createColumn(g_lang.m_fireCustAction, 90, 'combo', '3', false, 'center');
        cols[10] = this.f_createColumn(chkbox2, 55, 'checkbox', '3', false, 'center');
        cols[11] = this.f_createColumn(g_lang.m_fireCustOrder, 80, 'combo', '3', false, 'center');
        cols[12] = this.f_createColumn(chkbox, 55, 'checkbox', '3', false, 'center');
        cols[13] = this.f_createColumn(g_lang.m_fireCustDelete, 55, 'combo', '3', false, 'center');

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

            }

            var mainPanel = document.getElementById("utm_confpanel_");
            if(mainPanel != null)
                mainPanel.style.height = 460+'px';
        };

        //g_utils.f_cursorWait();
    };

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

    this.f_handleAddFirewallCustomRow = function(ruleNo)
    {
        var services = ["DNS-UDP", "DNS-TCP", "HTTP", "HTTPS", "FTP_DATA",
                        "FTP", "POP3", "SMTP", "SMTP-Auth", "TFTP", "POP3S",
                        "IMAP", "NTP", "NNTP", "SNMP", "Telnet", "SSH",
                        "L2TP", "Traceroute", "IPSec", "UNIK", "H323 host call - TCP",
                        "H323 host call - UDP", "SIP-TCP", "SIP-UDP",
                        "ICA-TCP", "ICA-UDP"];
        var proto = ["TCP", "UDP", "ICMP", "IPSec (ESP)", "VRRP"];
        var options = ["Any", "DMZ to LAN traffic", "DMZ to WAN ..", "LAN to DMZ ..",
                      "LAN to WAN ..", "WAN to DMZ ..", "WAN to LAN .."];

        //var rNo = thisObj.f_renderTextField(thisObj.m_fieldIds[0]+ruleNo, '', '', 55,
        //          ["f_fwCustomOnTFBlur('" + thisObj.m_fieldIds[0]+ruleNo + "')"]);
        var app = thisObj.f_renderCombobox(services, "DNS-UDP", 90,
                            thisObj.m_fieldIds[2]+ruleNo);
        var pro = thisObj.f_renderCombobox(proto, "Any", 60,
                            thisObj.m_fieldIds[3]+ruleNo);
        var sip = thisObj.f_renderTextField(thisObj.m_fieldIds[4]+ruleNo,
                            '255.255.255.255', '', 105,
                            ["f_fwCustomOnTFBlur('" + thisObj.m_fieldIds[4]+
                            ruleNo + "')"]);
        var smip = thisObj.f_renderTextField(thisObj.m_fieldIds[5]+ruleNo,
                            '100.000.100.100', '', 105,
                            ["f_fwCustomOnTFBlur('" + thisObj.m_fieldIds[5]+
                            ruleNo + "')"]);
        var sport = thisObj.f_renderTextField(thisObj.m_fieldIds[6]+ruleNo, '255', '', 80);
        var dip = thisObj.f_renderTextField(thisObj.m_fieldIds[7]+ruleNo, 
                            '255.255.255.255', '', 105,
                            ["f_fwCustomOnTFBlur('" + thisObj.m_fieldIds[7]+
                            ruleNo + "')"]);
        var dmip = thisObj.f_renderTextField(thisObj.m_fieldIds[8]+ruleNo,
                            '100.000.100.100', '', 105,
                            ["f_fwCustomOnTFBlur('" + thisObj.m_fieldIds[8]+
                            ruleNo + "')"]);
        var dport = thisObj.f_renderTextField(thisObj.m_fieldIds[9]+ruleNo, '255', '', 80);
        var act = thisObj.f_renderCombobox(proto, "Any", 80,
                            thisObj.m_fieldIds[10]+ruleNo);
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
                    ['LAN-WAN', app, pro, sip, smip, sport, dip, dmip, dport,
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
                    ['Cancel', "f_fireCustomCancelHandler()", "", this.m_btnCancelId]];
        this.m_buttons = this.f_createButtons(btns);

        var grid = this.f_initGridDiv([this.m_gridHeader, this.m_gridBody])

        window.setTimeout("f_fireCustomAddHandler()", 100);

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
        var options = ["Any", "DMZ to LAN traffic", "DMZ to WAN ..", "LAN to DMZ ..",
                      "LAN to WAN ..", "WAN to DMZ ..", "WAN to LAN .."];
        var combo = this.f_renderCombobox(options, "Any", 180);

        return this.f_createGeneralDiv("<b>Can't read what it is:&nbsp;&nbsp;</b>" +
                    combo);
    };

    this.f_validateIPAddress = function(ip)
    {
        if(!g_utils.f_validateIP(ip))
        {
            alert("invalid ip address : " + ip);
        }
    };

    this.f_validateNetmask = function(nm)
    {
        if(g_utils.f_validateNetmask(nm))
        {
            var cidr = g_utils.f_convertNetmaskToCIRD(nm);

            alert("cidr " + cidr);
        }
        else
            alert('netmask invalidate');
    }

    this.f_tfOnBlur = function(tfeid)
    {
        var tf = document.getElementById(tfeid);

        if(tfeid.indexOf(thisObj.m_fieldIds[4]) >= 0 ||
            tfeid.indexOf(thisObj.m_fieldIds[7]) >= 0)
            thisObj.f_validateIPAddress(tf.value);
        else if(tfeid.indexOf(thisObj.m_fieldIds[5]) >= 0 ||
            tfeid.indexOf(thisObj.m_fieldIds[8]) >= 0)
            thisObj.f_validateNetmask(tf.value);

    };
}
UTM_extend(UTM_confFireCustom, UTM_confBaseObj);

function f_fireCustomAddHandler()
{
    var aObj = g_configPanelObj.m_activeObj;

    aObj.f_handleAddFirewallCustomRow(aObj.m_nextRuleNo++);
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

function f_fwCustomOnTFBlur(tfeId)
{
    g_configPanelObj.m_activeObj.f_tfOnBlur(tfeId);
}