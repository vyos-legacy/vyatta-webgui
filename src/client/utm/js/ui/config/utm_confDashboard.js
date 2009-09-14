/*
    Document   : utm_confDashboard.js
    Created on : Sep 08, 2009, 11:21:31 AM
    Author     : Kevin.Choi
    Description:
*/

/**
 * Firewall Customized configuration panel screen
 */
function UTM_confDashboard(name, callback, busLayer)
{
    var thisObj = this;
    this.FW = 0; this.VPN = 1; this.IP = 2; this.WEB = 3; // panel index
    this.m_panels = [];

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        UTM_confDashboard.superclass.constructor(name, callback, busLayer);
    }
    this.constructor(name, callback, busLayer);

    this.f_getConfigurationPage = function()
    {
        var div = this.f_getPanelDiv(this.f_init());
	thisObj.f_resize();

	return div;
    }

    this.f_initChildPanels = function()
    {
        var tr = null;
        for(var i=0; i<4; i++)
        {
            var p = thisObj.m_panels[i];
            var TR = document.getElementById(p.m_divId+"_tr");
            tr = TR == null ? tr : TR;

            p.f_adjustHeight(tr.clientHeight);

            var td = document.getElementById(p.m_divId+"_td");
            td.appendChild(p.m_div);

            p.f_initPanel();
            p.f_loadVMData();
        }
    }

    this.f_init = function()
    {
        this.f_initPanelObjs();

        var div = this.f_createEmptyDiv(null);
        div = this.f_dbLayout(div);

        var cb = function()
        {
            thisObj.f_initChildPanels();
        }

        window.setTimeout(cb, 10);
        return [div];
    }

    this.f_initPanelObjs = function()
    {
        this.m_panels.push(new UTM_confDbFirewall(thisObj));
        this.m_panels.push(new UTM_confDbVPN(thisObj));
        this.m_panels.push(new UTM_confDbIntrusionPrev(thisObj));
        this.m_panels.push(new UTM_confDbWebFiltering(thisObj));

        for(var i=0; i<4; i++)
            this.m_panels[i].f_createDivPanel();
    }

    this.f_dbLayout = function(div)
    {
        var fw = this.m_panels[0];
        var vpn = this.m_panels[1];
        var ip = this.m_panels[2];
        var web = this.m_panels[3];

        var html = "<table width='100%' border=0; cellspacing=10; cellpadding=0><tbody>" +
                  "<tr id='" + fw.m_divId + "_tr' valign='top' height=300>" +
                  "<td id='" + fw.m_divId + "_td' width='50%';></td>" +
                  "<td id='" + vpn.m_divId + "_td' valign='top' width='50%'></td>" +
                  "</tr><tr id='" + ip.m_divId + "_tr' height=200>" +
                  "<td id='" + ip.m_divId + "_td' valign='top' width='50%'></td>" +
                  "<td id='" + web.m_divId + "_td' valign='top' width='50%'></td>" +
                  "</tr></tbody></table>";
        div.innerHTML = html;

        return div;
    }
}
UTM_extend(UTM_confDashboard, UTM_confBaseObj);

////////////////////////////////////////////////////////////////////////////////
// Dashboard child base class
function UTM_confDbBase(parent)
{
    var thisObj = this;
    this.m_parent = null;
    this.m_indent = "&nbsp;&nbsp;";

    this.constructor = function(parent)
    {
        this.m_parent = parent;
    }
    this.constructor(parent);

    this.f_getDivPanel = function()
    {
        return this.m_div;
    }

    this.f_createDivPanel = function()
    {
        return this.f_init();
    }

    this.f_init = function()
    {
        /////////////////////////////////////////////////
        // create panel with title
        var div = this.m_parent.f_createTitleDiv(this.m_title, this.m_titleWidth);
        div.setAttribute("id", this.m_divId);

        this.m_div = div;
        return div;
    }

    this.f_adjustHeight = function(height)
    {
        this.f_getDivPanel().style.height = height + "px";
    }
}
UTM_extend(UTM_confDbBase, UTM_confBaseObj);

////////////////////////////////////////////////////////////////////////////////
// UTM_confDbFirewall class
function UTM_confDbFirewall(parent)
{
    var thisObj = this;
    this.m_colModel = null;
    this.m_tableHeader = null;
    this.m_divId = 'utmDashboard_firewallId';
    this.m_title = 'firewall';
    this.m_pfTitle = "&nbsp;&nbsp;&bull; LAN to WAN Security Profile: ";
    this.m_titleWidth = 50;


    UTM_confDbFirewall.superclass.constructor(parent);

    this.f_loadVMData = function()
    {
        var cb = function(evt)
        {
            var recs = [];

            for(var i=0; i<5; i++)
            {
                var rec = i<3?new UTM_dbFirewallRec('ssh', i, "10.1.16."+i, i+1, "09/09/2009"):
                          new UTM_dbFirewallRec();
                recs.push(rec);
            }

            thisObj.f_populateProfile("customize");
            thisObj.f_populateTable(recs);
        }

        window.setTimeout(cb, 100);
    }

    this.f_initColumnModel = function()
    {
        var cols = [];

        cols[0] = this.f_createColumn("#", 25, 'text', '6', false);
        cols[1] = this.f_createColumn("service", 70, 'text', '0', false);
        cols[2] = this.f_createColumn("rule<br>number", 55, 'text', '0', false);
        cols[3] = this.f_createColumn("IP<br>protocol",72, 'text', '0', false);
        cols[4] = this.f_createColumn("number<br>of<br>blocks", 50, 'text', '0', false);
        cols[5] = this.f_createColumn("date of<br>last<br>block", 75, 'text', '0', false);

        return cols;
    }

    this.f_initPanel = function()
    {
        var profile = "<div id='" + this.m_divId + "_profile'>" + this.m_pfTitle +
                      "<b>customized</b></div>";
        var panelHd = this.m_parent.f_createGeneralDiv(profile + this.m_indent +
                        "&bull; top 5 blocked services:");
        this.m_div.appendChild(panelHd);
        this.f_initTable();
    }

    this.f_initTable = function()
    {
        this.m_parent.f_enableTableIndex(true);
        this.m_parent.f_colorGridBackgroundRow(true);
        
        this.m_colModel = this.f_initColumnModel();
        this.m_tableHeader = this.m_parent.f_createGridHeader(this.m_colModel);
        this.m_tableBody = this.m_parent.f_createGridView(this.m_colModel, false);
        
        var tDiv = this.m_parent.f_createEmptyDiv();
        tDiv.style.marginTop = "15px";
        tDiv.setAttribute('align', 'center');
        tDiv.appendChild(this.m_tableHeader);
        tDiv.appendChild(this.m_tableBody);

        this.m_div.appendChild(tDiv);
    }

    this.f_populateProfile = function(profile)
    {
        var el = document.getElementById(this.m_divId+"_profile");
        el.innerHTML = this.m_pfTitle + "<b>" + profile + "</b>";
    }

    this.f_populateTable = function(recs)
    {
        this.m_parent.f_removeDivChildren(this.m_tableBody);

        for(var i=0; i<recs.length; i++)
        {
            var rec = recs[i];

            ///////////////////////////////////
            // add fields into grid view
            var div = thisObj.f_createGridRow(thisObj.m_colModel,
                  [thisObj.f_createSimpleDiv(rec.m_service, 'center'),
                  thisObj.f_createSimpleDiv(rec.m_ruleNo, 'center'),
                  thisObj.f_createSimpleDiv(rec.m_protocol, 'center'),
                  thisObj.f_createSimpleDiv(rec.m_numBlocks, 'center'),
                  thisObj.f_createSimpleDiv(rec.m_lastBlockDate, 'center')]);

            thisObj.m_tableBody.appendChild(div);
        }
    }

}
UTM_extend(UTM_confDbFirewall, UTM_confDbBase);

////////////////////////////////////////////////////////////////////////////////
// UTM_confDbVPN class
function UTM_confDbVPN(parent)
{
    var thisObj = this;
    this.m_divId = 'utmDashboard_vpnId';
    this.m_title = 'VPN';
    this.m_titleWidth = 30;

    UTM_confDbVPN.superclass.constructor.apply(parent);

    this.f_loadVMData = function()
    {
        var cb = function(evt)
        {
            var rec = new UTM_dbVPNRec("activated", 10, 2, "deactivated", 9, 6);
            thisObj.f_populateVPN(rec);
        }

        window.setTimeout(cb, 100);
    }

    this.f_initPanel = function()
    {
        var profile = "<div id='" + this.m_divId + "_profile'>" + this.m_pfTitle + "</div>";
        var panelHd = this.m_parent.f_createGeneralDiv(profile);
        this.m_div.appendChild(panelHd);
    }

    this.f_populateVPN = function(rec)
    {
        var el = document.getElementById(this.m_divId + "_profile");

        el.innerHTML = "<table><tr><td colspan=2>" +
                this.m_indent + "&bull; site to site: <b>" + rec.m_s2s + "</b></td></tr>" +
                "<tr><td width='50'></td><td>" +
                this.m_indent + "&bull; site to site connections configured: " +
                rec.m_s2sConfigured + "</td></tr><tr><td></td><td>" +
                this.m_indent + "&bull; <font color=orange>"+
                "site to site connections up and running: " + rec.m_s2sUp +
                "</font></td><tr><td colspan=2>&nbsp;</td></tr><tr><td colspan=2>" +
                this.m_indent + "&bull; remote user: <b>" + rec.m_remoteUser +
                "</b></td><tr><td width='50'></td><td>" +
                this.m_indent + "&bull; number of remote users configured: " +
                rec.m_ruConfigured + "</td></tr><tr><td></td><td>" +
                this.m_indent + "&bull; <font color=orange>"+
                "number of remote users connected: " +
                rec.m_ruConnected + "</font></td>";
    }
}
UTM_extend(UTM_confDbVPN, UTM_confDbBase);

////////////////////////////////////////////////////////////////////////////////
// UTM_confDbIntrusionPrev class
function UTM_confDbIntrusionPrev(parent)
{
    var thisObj = this;
    this.m_divId = 'utmDashboard_intrusionPrevId';
    this.m_title = 'intrusion prevention';
    this.m_titleWidth = 122;

    UTM_confDbIntrusionPrev.superclass.constructor(parent);

    this.f_loadVMData = function()
    {
        var cb = function(evt)
        {
            thisObj.f_populateIP();
        }

        window.setTimeout(cb, 100);
    }

    this.f_initPanel = function()
    {
        var profile = "<div id='" + this.m_divId + "_profile'>" + this.m_pfTitle + "</div>";
        var panelHd = this.m_parent.f_createGeneralDiv(profile);
        this.m_div.appendChild(panelHd);
    }

    this.f_populateIP = function(rec)
    {
        var el = document.getElementById(this.m_divId + "_profile");

        el.innerHTML = this.m_indent + "&bull; site to site: <b>activated</b>";
    }
}
UTM_extend(UTM_confDbIntrusionPrev, UTM_confDbBase);

////////////////////////////////////////////////////////////////////////////////
// UTM_confDbWebFiltering class
function UTM_confDbWebFiltering(parent)
{
    var thisObj = this;
    this.m_divId = 'utmDashboard_webFilteringId';
    this.m_title = 'web filtering';
    this.m_titleWidth = 78;

    UTM_confDbWebFiltering.superclass.constructor(parent);

    this.f_loadVMData = function()
    {
        var cb = function(evt)
        {
            thisObj.f_populateWeb();
        }

        window.setTimeout(cb, 100);
    }

    this.f_initPanel = function()
    {
        var profile = "<div id='" + this.m_divId + "_profile'>" + this.m_pfTitle + "</div>";
        var panelHd = this.m_parent.f_createGeneralDiv(profile);
        this.m_div.appendChild(panelHd);
    }

    this.f_populateWeb = function(rec)
    {
        var el = document.getElementById(this.m_divId + "_profile");

        el.innerHTML = this.m_indent + "&bull; site to site: <b>activated</b>";
    }
}
UTM_extend(UTM_confDbWebFiltering, UTM_confDbBase);