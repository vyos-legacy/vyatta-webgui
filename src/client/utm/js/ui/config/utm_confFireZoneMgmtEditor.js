/*
    Document   : utm_confFireZoneMgmtEditor.js
    Created on : May 25, 2009, 06:21:31 PM
    Author     : Kevin.Choi
    Description:
*/

/**
 * Firewall zone management editor panel screen
 */

function UTM_confFireZoneMgmtEditor(name, callback, busLayer, zoneRec)
{
    var thisObj = this;
    this.m_isDirty = false;
    this.m_zoneRec = zoneRec;
    this.m_availZoneRec = new UTM_fwZoneRecord("dummy");

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     * @param zoneRec = zone management record
     */
    this.constructor = function(name, callback, busLayer, zoneRec)
    {
        this.privateConstructor(name, callback, busLayer);
    }
    this.privateConstructor = function(name, callback, busLayer)
    {
        UTM_confFireZoneMgmtEditor.superclass.constructor(name, callback, busLayer);
    }
    this.privateConstructor(name, callback, busLayer);

    this.f_getConfigurationPage = function()
    {
        var children = new Array();
        children.push(this.f_getForm());

        return this.f_getPage(children);
    }

    this.f_populateData = function()
    {
        var cb = function(avt)
        {
            while(avt != null && avt.length > 0)
            {
                var rc = avt.pop();
                thisObj.m_availZoneRec.m_memAvailable = rc.m_memAvailable;
                thisObj.f_populateList("fwZoneMgmtEditorAvailId",
                                        thisObj.m_availZoneRec.m_memAvailable);
            }
        }

        if(thisObj.m_zoneRec != null)
        {
            var zr = thisObj.m_zoneRec;

            var name = document.getElementById("fwZoneMgmtEditorZoneNameId");
            if(name != null)
                name.value = zr.m_name;

            var desc = document.getElementById("fwZoneMgmtEditorDescId");
            if(desc != null)
                desc.value = zr.m_description;

            thisObj.f_populateList("fwZoneMgmtEditorIncludeId", thisObj.m_zoneRec.m_members);
        }

        thisObj.m_busLayer.f_getFirewallZoneMemberAvailable(thisObj.m_zoneRec, cb);
        thisObj.f_resize();
    }

    this.f_populateList = function(elId, data)
    {
        var sel = document.getElementById(elId);
        if(sel != null)
        {
            while(sel.length > 0)
                sel.remove(0);

            for(var i=0; i<data.length; i++)
            {
                var newOpt = document.createElement('option')
                newOpt.text = data[i];
                newOpt.value = data[i];
                try
                {
                    sel.add(newOpt, null);
                }
                catch(ex)
                {
                    sel.add(newOpt);   // for IE
                }
            }
        }
    }

    this.f_init = function()
    {
        var defObj = new UTM_confFormDefObj('fwZoneMgmtEditorId', '500', new Array(),
        [
            {
                id: 'fwZoneMgmtEditorBackButtonId',
                text: 'back',
                tooltip: g_lang.m_tooltip_back,
                align: 'left',
                onclick: this.f_handleClick
            },
            {
                id: 'fwZoneMgmtEditorCancelButtonId',
                align: 'right',
                text: 'Cancel',
                tooltip: g_lang.m_tooltip_cancel,
                onclick: this.f_handleClick
            },
            {
                id: 'fwZoneMgmtEditorApplyButtonId',
		align: 'right',
                text: 'Apply',
		tooltip: g_lang.m_tooltip_apply,
                onclick: this.f_handleClick
            }
        ]);

        defObj.f_addInput('fwZoneMgmtEditorZoneNameId', '70', g_lang.m_fireZMZoneName);
        defObj.f_addInput('fwZoneMgmtEditorDescId', '70', g_lang.m_fireZMDesc);
        defObj.f_addEmptySpace('spacerId','2');
        defObj.f_addHtml('fwZoneMgmtEditorMemId', this.f_createZoneMemberDiv(),
                          g_lang.m_fireZMMember);

        window.setTimeout(function(){thisObj.f_populateData();}, 100);

        this.f_setConfig(defObj);
    }

    this.f_createZoneMemberDiv = function()
    {
        var table = "<div><table><thead><tr><td width=163><b>" + g_lang.m_fireZMMemIncluded +
                    ":</b></td><td width=40>&nbsp;</td><td width=163><b>" +
                    g_lang.m_fireZMMemAvail + ":</b></td></tr>" +

                    "<tr><td width=163 rowspan=4>" + thisObj.f_createZoneMemberListBox(
                    "fwZoneMgmtEditorIncludeId", "f_fwZoneMgmtEditorIncludeOnChanged()",
                    "f_fwZoneMgmtEditorIncludeOnDblClick()",
                    g_lang.m_fireZMMemIncTip) + "</td>" +

                    "<td rowspan= 1 width=40 align=center>" +
                    thisObj.f_createZoneMemberButton("fwZoneMgmtIncButtonId",
                    "images/prev.gif", "f_onFwzmAdd()", "Add zone member") +
                    "<br><br>" + thisObj.f_createZoneMemberButton("fwZoneMgmtAvailButtonId",
                    "images/next.gif", "f_onFwzmRemove()", "Remove zone member") +
                    "</td>" +

                    "<td rowspan=4 width=163>" + thisObj.f_createZoneMemberListBox(
                    "fwZoneMgmtEditorAvailId", "f_fwZoneMgmtEditorAvailOnChanged()",
                    "f_fwZoneMgmtEditorAvailOnDblClick()",
                    g_lang.m_fireZMMemAvailTip) + "</td>" +

                    "</tr></table></div>";

        return table;
    }

    this.f_createZoneMemberButton = function(elid, image, onclick, tip)
    {
        return "<input type=image title='" + tip + "' id=" + elid +
                " onclick='" + onclick + "' src=" + image + ">";
    }

    this.f_createZoneMemberListBox = function(elid, onchange, ondbclick, tip)
    {
        return "<select id=" + elid + " size=8 style='width:161px;' multiple " +
               "ondblclick=" + ondbclick + " onchange=" + onchange + 
               " title='" + tip + "'></select>";
    }

    this.f_exchangeListBoxData = function(from, to)
    {
        var elFrom = document.getElementById(from);
        var elTo = document.getElementById(to);

        for(var i=0; i<elFrom.length; i++)
        {
            if(elFrom.options[i].selected)
            {
                var newOpt = document.createElement('option')
                newOpt.text = elFrom.options[i].text;
                newOpt.value = elFrom.options[i].value;
                try
                {
                    elTo.add(newOpt, null);
                }
                catch(ex)
                {
                    elTo.add(newOpt);   // for IE
                }

                elFrom.remove(i);
            }
        }
    }

    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined)
        {
            var id = target.getAttribute('id');

            if (id == 'fwZoneMgmtEditorApplyButtonId')
            {
                if (!thisObj.f_validate())
                {
                    return false;
		}
		thisObj.f_apply();
            }
            else if (id == 'fwZoneMgmtEditorCancelButtonId')
            { //cancel clicked
                thisObj.f_populateData();
            }
            else if (id == 'fwZoneMgmtEditorBackButtonId')
            {
                g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_ZONE_ID);
            }
        }
    }
}
UTM_extend(UTM_confFireZoneMgmtEditor, UTM_confFormObj);

function f_onFwzmAdd()
{
    g_configPanelObj.m_activeObj.f_exchangeListBoxData("fwZoneMgmtEditorAvailId",
          "fwZoneMgmtEditorIncludeId");
}

function f_onFwzmRemove()
{
    g_configPanelObj.m_activeObj.f_exchangeListBoxData("fwZoneMgmtEditorIncludeId",
          "fwZoneMgmtEditorAvailId");
}

function f_fwZoneMgmtEditorIncludeOnChanged()
{
}

function f_fwZoneMgmtEditorIncludeOnDblClick()
{
    g_configPanelObj.m_activeObj.f_exchangeListBoxData("fwZoneMgmtEditorIncludeId",
          "fwZoneMgmtEditorAvailId");
}

function f_fwZoneMgmtEditorAvailOnChanged()
{

}

function f_fwZoneMgmtEditorAvailOnDblClick()
{
    g_configPanelObj.m_activeObj.f_exchangeListBoxData("fwZoneMgmtEditorAvailId",
          "fwZoneMgmtEditorIncludeId");
}