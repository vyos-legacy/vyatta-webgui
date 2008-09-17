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
        tabNames = [ 'Business LiveBox settings',
                    'Open Appliance settings', 'UTM configuration',
                    'PBX configuration', '3rd Parties Applications'];
        systemTabIconsOff = [ 'tabnav_blb_off',
                            'tabnav_oa_off',
                            'tabnav_utm_off',
                            'tabnav_pbx_off',
                            'tabnav_3pa_off'
                         ];
        systemTabIconsOn = [ 'tabnav_blb_off',
                            'tabnav_oa_off',
                            'tabnav_utm_off',
                            'tabnav_pbx_off',
                            'tabnav_3pa_off'
                         ]

        //////////////////////////////////////////////////////
        //an array of panels object belong to specific tab
        systemTabObjects = new Array();
    },

    ///////////////////////////////////
    //
    f_getHeaderPanel: function()
    {
        return m_headerPanel;
    },
    f_setHeaderPanel: function(hp)
    {
        m_headerPanel = hp;
    },
    f_getBodyPanel: function()
    {
        return m_bodyPanel;
    },
    f_setBodyPanel: function(cp)
    {
        m_bodyPanel = cp;
    },
    f_getSystemTabNames: function()
    {
        return tabNames;
    },
    f_getSystemTabIcons: function(isOff)
    {
        if(isOff)
            return systemTabIconsOff;
        else
            return systemTabIconsOn;
    },


    ///////////////////////////////////////////
    //
    f_getSystemTabPanels: function()
    {
        return systemTabObjects;
    },
    f_getSystemTabPanel: function(tabName)
    {
        switch(tabName)
        {
            case 'op':
            case 'Open Appliance settings':
                return systemTabObjects[1];
            default:
                return systemTabObjects[5];   // the login tab panel
        }
    },
    f_setSystemTabPanels: function(tabObjects)
    {
        systemTabObjects = tabObjects;
    }

});

////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// Open Appliance data object
DATA_OpenAppliance = Ext.extend(Ext.util.Observable,
{
    f_initDataType: function()
    {
        gridSelRow = 0;
        gridSelCol = 0;

        dashboard = new Array();
        vmDeploySoftware = new Array();
        restart = new Array();
        user = new Array();
        monitoringHardware = new Array();

        selectedOApplianceAnchor = 'VM';
    },

    f_getGridSelectedRowIndex: function()
    {
        return gridSelRow;
    },

    f_setGridSelectedRowIndex: function(selRowIndex)
    {
        gridSelRow = selRowIndex;
    },
    f_getGridSelectedColIndex: function()
    {
        return gridSelCol;
    },

    f_setGridSelectedColIndex: function(selColIndex)
    {
        gridSelCol = selColIndex;
    },

    ///////////////////////////////////////////////////
    // Open Appliance Anchor data .....
    f_getOApplianceAnchorData: function()
    {
        return [ 'VM', 'LAN', 'User', 'Monitoring', 'Backup'];
    },

    /////////////////////////////////////////////////////
    // VM Anchor data ....
    f_getVMAnchorData: function()
    {
        return [ 'VM_Dashboard', 'Deploy_VM_Software', 'Licensing',
                  'Restart', 'Install_new_VM'];
    },

    /////////////////////////////////////////////////////
    // VM Anchor data ....
    f_getMonitoringAnchorData: function()
    {
        return [ 'Hardware', 'Network', 'Software' ];
    },

    /////////////////////////////////////////////////////
    // Open Appliance ....
    f_getSelectedOApplianceAnchor: function()
    {
        return selectedOApplianceAnchor;
    },
    f_setSelectedOApplianceAnchor: function(selectedAnchor)
    {
        selectedOApplianceAnchor = selectedAnchor;
    },

    ////////////////////////////////////////////////////////
    // dashboard data ....
    f_getVMDashboardColHeader: function(htmlBase)
    {
        if(htmlBase == undefined || !htmlBase)
            return ['VM', 'Status', 'CPU', 'RAM', 'Desk Space',
                    'Current Version', 'Update Version', 'Deployment Schedule'];
        else
            return ["<p align='center'><b>VM<br></b></p>",
                    "<p align='center'><b>Status<br></b></p>",
                    "<p align='center'><b>CPU<br></b></p>",
                    "<p align='center'><b>RAM<br></b></p>",
                    "<p align='center'><b>Desk Space<br></b></p>",
                    "<p align='center'><b>Current<br>Version</b></p>",
                    "<p align='center'><b>Update<br>Version</b></p>",
                    "<p align='center'><b>Deployment<br>Schedule</b></p>"];
    },
    f_getDashboardData: function()
    {
        //////////////////////////////////////////
        // dashboard is array type: array [ [] ]
        return dashboard;
    },
    f_setDashboardData: function(db)
    {
        dashboard = db;
    },

    ////////////////////////////////////////////////////////
    // VM deploy VM Software data ....
    f_getVMDeploySoftwareColHeader: function(htmlBase)
    {
        if(htmlBase == undefined || !htmlBase)
            return [' ', 'VM', 'Current Version',
                    'Available Version', 'Deployment Schedule'];
        else
            return [' ',
                "<p align='center'><b>VM<br></b></p>",
                "<p align='center'><b>Current<br>Version</b></p>",
                "<p align='center'><b>Available<br>Version</b></p>",
                "<p align='center'><b>Deployment Schedule<br></b></p>"];
    },
    f_getVMDeploySoftwareData: function()
    {
        //////////////////////////////////////////
        // dashboard is array type: array [ [] ]
        return vmDeploySoftware;
    },
    f_setVMDeploySoftwareData: function(db)
    {
        vmDeploySoftware = db;
    },

    //////////////////////////////////////////////////
    // restart data ...
    f_getRestartData: function()
    {
        //////////////////////////////////////////
        // dashboard is array type: array [ [] ]
        return restart;
    },
    f_setRestartData: function(rs)
    {
        restart = rs;
    },

    //////////////////////////////////////////////////
    // user data ...
    f_getUserColHeaderNames: function(htmlBase)
    {
        if(htmlBase == undefined || !htmlBase)
            return [' ', 'Firstname', 'Lastname', 'Username', 'Password'];
        else
            return [ "<p align='center'><b&nbsp;<br>&nbsp;</b></p>",
                    "<p align='center'><b>Firstname<br></b></p>",
                    "<p align='center'><b>Lastname<br></b></p>",
                    //"<p align='center'><b>Privilege<br></b></p>",
                    "<p align='center'><b>Username<br></b></p>",
                    "<p align='center'><b>Password<br></b></p>"
                    ];
    },
    f_getUserData: function()
    {
        return [ [false, '', '', 'admin', 'pppp'],
            [false, 'John', 'Doo', 'sdoo', 'pw'],
            [false, 'John6', 'Doo', 'sdoo', 'pw',],
            [false, 'John5', 'Doo', 'sdoo', 'pw']
            /*/
            [false, 'John4', 'Doo', 'read only', 'sdoo', 'pw',],
            [false, 'John3', 'Doo', 'read/write', 'sdoo', 'pw',],
            [false, 'John2', 'Doo', 'read only', 'sdoo', 'pw',],
          [false, 'Paul', 'Dupont', 'read only', 'pdupont', 'pppp']*/];

        //////////////////////////////////////////
        // is array type: array [ [] ]
        return user;
    },
    f_setUserData: function(u)
    {
        user = u;
    },


    //////////////////////////////////////////////////
    // monitoring hardware data ...
    f_getMonitoringHardwareData: function()
    {
        //////////////////////////////////////////
        // is array type: array [ [] ]
        //return monitoringHardware;

        return [ ['Network Card', 'up'], ['Hard Disk', 'up'],
            ['Fan', 'down'], ['CPU Temperature', 'up']];
    },
    f_setMonitoringHardwareData: function(mHardware)
    {
        monitoringHardware = mHardware;
    },

    //////////////////////////////////////////////////
    //
    f_isOpenApplianceVM: function(tabName)
    {
        return tabName == 'Open Appliance settings' ? true : false;
    },
    f_getOpenApplianceVMName: function()
    {
        return 'Open Appliance settings';
    }
});

DATAOpenApplianceWorking = Ext.extend(Ext.util.Observable,
{

});
