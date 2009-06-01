/*
    Document   : utm_confFireZoneMgmtEditor.js
    Created on : May 25, 2009, 06:21:31 PM
    Author     : Kevin.Choi
    Description:
*/

/**
 * Firewall zone management editor panel screen
 */

function UTM_confFireZoneMgmtEditor(name, callback, busLayer)
{
    var thisObj = this;
    this.m_isDirty = false;

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
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

    this.f_init = function()
    {
        var defObj = new UTM_confFormDefObj('fwZoneMgmtEditorId', '500', new Array(),
        [
            {
                id: 'fwZoneMgmtEditorApplyButtonId',
		align: 'left',
                text: 'Apply',
		tooltip: g_lang.m_tooltip_apply,
                onclick: this.f_handleClick
            },
            {
                id: 'fwZoneMgmtEditorCancelButtonId', align: 'left',
                text: 'Cancel',
                tooltip: g_lang.m_tooltip_cancel,
                onclick: this.f_handleClick
            }
        ]);

        defObj.f_addInput('fwZoneMgmtEditorZoneNameId', '70', g_lang.m_fireZMZoneName);
        defObj.f_addInput('fwZoneMgmtEditorDescId', '70', g_lang.m_fireZMDesc);
        defObj.f_addEmptySpace('conf_vpn_s2se_basic_spacer','2');
        defObj.f_addHtml(
                    'fwZoneMgmtEditorMemId', this.f_createZoneMemberDiv(),
                    g_lang.m_fireZMMember
                    );

        window.setTimeout(function(){thisObj.f_resize();}, 100);

        this.f_setConfig(defObj);
    }

    this.f_createZoneMemberDiv = function()
    {
        var table = "<div><table><thead><tr><td width=162><b>" + g_lang.m_fireZMMemIncluded +
                    ":</b></td><td width=40>&nbsp;</td><td width=162><b>" +
                    g_lang.m_fireZMMemAvail + ":</b></td></tr>" +

                    "<tr><td width=162 rowspan=4>" +
                    "<select size=8 style='width:160px;' multiple>" +
                    "<option width=160 value=testing>testing</option></select></td>"+

                    "<td rowspan= 1 width=40 align=center><a href=# "+
                    "onclick=f_onFwzmAdd() title='Add zone memeber'>" +
                    "<<</a><br><br><a href=# onclick=f_onFwzmRemove() " +
                    "title='Remove zone member'>>></a></td>" +

                    "<td rowspan=4 width=162><select size=8 multiple style='width:160px;'>" +
                    "<option width=160 value=testing>testing</option></select></td>"+

                    "</tr></table></div>";

        return table;
    }
}
UTM_extend(UTM_confFireZoneMgmtEditor, UTM_confFormObj);