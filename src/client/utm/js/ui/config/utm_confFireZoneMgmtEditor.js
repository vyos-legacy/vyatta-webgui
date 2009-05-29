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
                id: 'fwZoneMgmtEditorCancelButtonId', align: 'center',
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

        defObj.f_addInput('fwZoneMgmtEditorZoneNameId', '150', g_lang.m_fireZMZoneName);
        defObj.f_addInput('fwZoneMgmtEditorDescId', '150', g_lang.m_fireZMDescription);

        this.f_setConfig(defObj);
    }
}
UTM_extend(UTM_confFireZoneMgmtEditor, UTM_confFormObj);