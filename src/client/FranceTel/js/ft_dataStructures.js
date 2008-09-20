/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
/*
 * File name: ft_dataStructures.js
 */

////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//  FT Base System data Structure
DATA_FTBaseSystem = Ext.extend(Ext.util.Observable,
{
    f_initDataType: function()
    {
        ///////////////////////////////////////////////////////
        //
        m_headerPanel = undefined;
        m_footerPanel = undefined;
        m_bodyPanel = undefined;
        m_tabNames = [ 'Business LiveBox settings',
                    'Open Appliance settings', 'UTM configuration',
                    'PBX configuration', '3rd Parties Applications'];
        m_selTab = m_tabNames[1];

        //////////////////////////////////////////////////////
        //an array of panels object belong to specific tab
        systemTabObjects = new Array();
    },

    ///////////////////////////////////
    //
    f_getSystemTabNames: function()
    {
        return m_tabNames;
    },
    

    ///////////////////////////////////////////
    //
    
    f_setSystemTabPanels: function(tabObjects)
    {
        systemTabObjects = tabObjects;
    },

    ///////////////////////////////////////////////////
    // Tabs data
    /**
     * if tabIndex is provided, return that specific tab.
     * else return all tabs in an array form.
     */
    f_getTabsData: function(tabIndex /*optional*/)
    {
        tabs = [ [m_tabNames[0], 'tabnav_blb_'],
                  [m_tabNames[1], 'tabnav_oa_'],
                  [m_tabNames[2], 'tabnav_utm_'],
                  [m_tabNames[3], 'tabnav_pbx_'],
                  [m_tabNames[4], 'tabnav_3pa_']];

        if(tabIndex == undefined)
            return tabs;
        else
            return tabs[tabIndex];
    }
});
