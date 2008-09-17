/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


v_panelsManager = Ext.extend(Ext.util.Observable,
{
    /////////////////////////////////////////////////
    // member variables
    // m_panel    --> array type of panel object

    f_initPanels: function(systemBaseObj, panelObj)
    {
        var tabArray = new Array();
        var tabNames = systemBaseObj.f_getSystemTabNames();

        for(var i=0; i<tabNames.length+1 /* plus 1 for the login panel */; i++)
            tabArray[i] = panelObj.f_createMainPanel(tabNames[i]);

        systemBaseObj.f_setSystemTabPanels(tabArray);
    },


    f_manageThisPanel: function(panel)
    {
        if(this.m_panels == undefined)
            this.m_panel = new Array();

        this.m_panel[this.m_panel.length] = panel;
    },

    f_getPanelByIndex: function(panelIndex)
    {
        return this.m_panel[panelIndex];
    },

    f_getPanelByName: function(panelName)
    {
        for(var i=0; i<this.m_panel.length; i++)
        {
            if(this.m_panel.m_name != undefined && this.m_panel.m_name == panelName)
                return this.m_panel;
        }

        return undefined;
    }
});