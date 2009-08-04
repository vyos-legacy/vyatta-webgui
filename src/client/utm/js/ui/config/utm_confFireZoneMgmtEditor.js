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
    this.m_btnCancelId = "fwZoneMgmtEditorCancelButtonId";
    this.m_btnApplyId = "fwZoneMgmtEditorApplyButtonId";
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
        this.m_isDirty = false;

        return this.f_getPage(children);
    }

    this.f_enableButtons = function(enable)
    {
        thisObj.f_enabledDisableButton(thisObj.m_btnCancelId, enable);
            thisObj.f_enabledDisableButton(thisObj.m_btnApplyId, enable);
    }
    this.f_populateData = function()
    {
        var cb = function(avt)
        {
            g_utils.f_cursorDefault();
            if(avt != null && avt.m_value.length > 0)
            {
                var rec = avt.m_value[0];
                thisObj.m_availZoneRec.m_memAvailable = rec.m_memAvailable;
                thisObj.f_populateList("fwZoneMgmtEditorAvailId",
                                        thisObj.m_availZoneRec.m_memAvailable);
            }

            thisObj.f_enableButtons(false);
        }

        if(thisObj.m_zoneRec != null)
        {
            var zr = thisObj.m_zoneRec;

            var name = document.getElementById("fwZoneMgmtEditorZoneNameId");
            if(name != null)
                name.value = zr.m_name + " zone";

            var desc = document.getElementById("fwZoneMgmtEditorDescId");
            if(desc != null)
                desc.value = zr.m_description;

            thisObj.f_populateList("fwZoneMgmtEditorIncludeId", thisObj.m_zoneRec.m_members);

            ///////////////////////////////
            // set read only field
            var tf = document.getElementById('fwZoneMgmtEditorZoneNameId')
            tf.readOnly = true;
            tf.style.backgroundColor = '#efefef';
        }

        g_utils.f_cursorWait();
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
                id: this.m_btnCancelId,
                align: 'right',
                text: 'Cancel',
                tooltip: g_lang.m_tooltip_cancel,
                onclick: this.f_handleClick
            },
            {
                id: this.m_btnApplyId,
		align: 'right',
                text: 'Apply',
		tooltip: g_lang.m_tooltip_apply,
                onclick: this.f_handleClick
            }
        ]);

        defObj.f_addInput('fwZoneMgmtEditorZoneNameId', '70', g_lang.m_fireZMZoneName, null);
        defObj.f_addInput('fwZoneMgmtEditorDescId', '70', g_lang.m_fireZMDesc, "f_zmDescpOnblur()");
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
                    "images/prev_disabled.gif", "f_onFwzmAdd()", "Add zone member") +
                    "<br><br>" + thisObj.f_createZoneMemberButton("fwZoneMgmtAvailButtonId",
                    "images/next_disabled.gif", "f_onFwzmRemove()", "Remove zone member") +
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
        var newOpt = null;

        for(var i=0; i<elFrom.length; i++)
        {
            if(elFrom.options[i].selected)
            {
                newOpt = document.createElement('option')
                newOpt.text = elFrom.options[i].text;
                newOpt.value = elFrom.options[i].value;

                ////////////////////////////////////////////////////////////////
                // remove the empty item from list. Only happen in FireFox, when
                // create a new empty list, FF add an empty item if list is empty.
                if(elTo.length == 1 && elTo.options[0].value.length < 1)
                    elTo.remove(0);

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

        ////////////////////////////////////////////
        // send server cmd
        var rec = new UTM_fwZoneRecord(thisObj.m_zoneRec.m_name);
        var cb = function(evt)
        {
            // check for server error here...

            thisObj.m_isDirty = true;
            thisObj.f_enableButtons(true);
        }
        if(from == "fwZoneMgmtEditorIncludeId" && newOpt != null)
        {
            thisObj.m_busLayer.f_setFirewallZoneMgmtInterface(rec,
                      "remove-interface-from-zone", newOpt.value, cb);
        }
        else if(to == "fwZoneMgmtEditorIncludeId" && newOpt != null)
        {
            thisObj.m_busLayer.f_setFirewallZoneMgmtInterface(rec,
                      "add-interface-to-zone", newOpt.value, cb);
        }
    }

    this.f_enableDisableListButtons = function()
    {
        var inc = document.getElementById("fwZoneMgmtEditorIncludeId");
        var enable = inc.selectedIndex == -1 ? false : true;
        thisObj.f_enabledDisableButton("fwZoneMgmtAvailButtonId", enable);

        var avl = document.getElementById("fwZoneMgmtEditorAvailId");
        enable = avl.selectedIndex == -1 ? false : true;
        thisObj.f_enabledDisableButton("fwZoneMgmtIncButtonId", enable);
    }

    this.f_handleApply = function()
    {
        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            thisObj.m_isDirty = false;
            thisObj.f_enableButtons(false);
        }

        g_utils.f_cursorWait();
        thisObj.m_busLayer.f_saveFirewallZoneMgmt("zone-mgmt", cb);
    }

    this.f_handleDescriptionChanged = function()
    {
        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            thisObj.m_isDirty = true;
            thisObj.f_enableButtons(true);
        }

        g_utils.f_cursorWait();
        var name = document.getElementById("fwZoneMgmtEditorZoneNameId");
        var desc = document.getElementById("fwZoneMgmtEditorDescId");
        var rec = new UTM_fwZoneRecord(name.value);
        rec.m_description = desc.value;
        thisObj.m_busLayer.f_setFirewallZoneMgmtDescription(rec, cb);
    }

    this.f_handleCancelZoneMgmt = function(isblur)
    {
        var cb = function()
        {
            if(!isblur)
            {
                thisObj.m_isDirty = false;
                thisObj.f_populateData();
            }
        }

        thisObj.m_busLayer.f_cancelFireallZoneMgmt("zone-mgmt", cb);
    }

    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined)
        {
            var id = target.getAttribute('id');

            if (id == thisObj.m_btnApplyId)
            {
		thisObj.f_handleApply();
            }
            else if (id == thisObj.m_btnCancelId)
            { //cancel clicked
                thisObj.f_handleCancelZoneMgmt(false);
            }
            else if (id == 'fwZoneMgmtEditorBackButtonId')
            {
                if(thisObj.m_isDirty)
                    g_utils.f_popupMessage(g_lang.m_remindSaveChange,
                    'confirm', "Firewall Customize", true,
                    "f_fireZoneMgmtBackConfirm(this)");
                else
                    g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_ZONE_ID);
            }
        }
    }

    this.f_changed = function()
    {
        var el = document.getElementById("fwZoneMgmtEditorApplyButtonId");

        if(el != null && !el.disabled)
            return true;

        return false;
    }
}
UTM_extend(UTM_confFireZoneMgmtEditor, UTM_confFormObj);

function f_onFwzmAdd()
{
    g_configPanelObj.m_activeObj.f_exchangeListBoxData("fwZoneMgmtEditorAvailId",
          "fwZoneMgmtEditorIncludeId");
    g_configPanelObj.m_activeObj.f_enableDisableListButtons();
}

function f_onFwzmRemove()
{
    g_configPanelObj.m_activeObj.f_exchangeListBoxData("fwZoneMgmtEditorIncludeId",
          "fwZoneMgmtEditorAvailId");
    g_configPanelObj.m_activeObj.f_enableDisableListButtons();
}

function f_fwZoneMgmtEditorIncludeOnChanged()
{
    g_configPanelObj.m_activeObj.f_enableDisableListButtons();
}

function f_fwZoneMgmtEditorIncludeOnDblClick()
{
    g_configPanelObj.m_activeObj.f_exchangeListBoxData("fwZoneMgmtEditorIncludeId",
          "fwZoneMgmtEditorAvailId");
    g_configPanelObj.m_activeObj.f_enableDisableListButtons();
}

function f_fwZoneMgmtEditorAvailOnChanged()
{
    g_configPanelObj.m_activeObj.f_enableDisableListButtons();
}

function f_fwZoneMgmtEditorAvailOnDblClick()
{
    g_configPanelObj.m_activeObj.f_exchangeListBoxData("fwZoneMgmtEditorAvailId",
          "fwZoneMgmtEditorIncludeId");
    g_configPanelObj.m_activeObj.f_enableDisableListButtons();
}

function f_fireZoneMgmtBackConfirm(e)
{
    if(e.getAttribute('id')== 'ft_popup_message_apply')
    {
        g_configPanelObj.m_activeObj.f_handleCancelZoneMgmt(true);
        g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_ZONE_ID);
    }
}

function f_zmDescpOnblur()
{
    g_configPanelObj.m_activeObj.f_handleDescriptionChanged();
}