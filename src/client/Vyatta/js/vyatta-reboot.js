/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

VYATTA_RebootObject = Ext.extend(VYATTA_panels,
{
    ////////////////////////////////////////////////////////////////////////////
    constructor: function(parentContainer, name)
    {
        this.m_parentContainer = parentContainer;
        this.m_name = name;
    },

    f_initDataType: function()
    {
        this.f_initPanelDataType(this.m_parentContainer, this.m_name);
    },

    f_initRebootPanel: function()
    {
        this.f_initLayout(this.m_parentContainer, V_TREE_ID_login);

        var message = 'System is now rebooting and the web-GUI service is no ' +
                      'longer applicable. Please contact system administrator ' +
                      'to enable the web-GUI service again. Then refresh the ' +
                      'browser to log in again.';

        var panel = new Ext.Panel(
        {
            border: false
            ,bodyStyle:'padding:10px 10px 5px 10px'
            ,width: 550
            ,defaultType: 'textfield'
            ,monitorValid: true
            ,html: '<div valian="center" id="v-header-font">' +
                  message + '</div>'
        });

        this.m_editorPanel.add(panel);
        this.m_editorPanel.doLayout();
    }
});

