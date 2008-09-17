v_opPanelObject = Ext.extend(v_panelObject,
{
    ////////////////////////////////////////////////////////////////////////////
    // local data memeber
    // m_name
    // m_tabName
    // m_parentContainer
    // m_selTopAnchorName
    // m_selLeftAnchorName
    // m_dashboardData
    // m_restartData
    // m_isDashboard
    // m_selGridRow
    // m_selGridCol
    ////////////////////////////////////////////////////////////////////////////


    constructor: function(parentContainer, name)
    {
        this.m_name = name;
        this.m_tabName = 'OpenAppliance';
        this.m_parentContainer = parentContainer;
        this.m_dashboardData = [ ' ', 'op', 'up', '10', '10', '1.2', '1.3'];
        this.m_restartData = new Array();
        this.m_userDBData = new Array();
        this.m_monitorHwDBData = new Array();
        g_opPanelObject = this;

        //v_loginPanelObject.suprclass.constructor.apply(this, arguments);
    },


    ///////////////////////////////////////////////////
    // Open Appliance Anchor data .....
    f_getOApplianceAnchorData: function()
    {
        return [ 'VM', 'User', 'Monitoring', 'Backup'];
    },
    /////////////////////////////////////////////////////
    // VM Anchor data ....
    f_getVMAnchorData: function()
    {
        return [ 'VM Dashboard', 'Deploy VM Software',
                  'Restart'];
    },
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
    f_getVMDeploySoftwareColHeader: function(htmlBase)
    {
        if(htmlBase == undefined || !htmlBase)
            return [' ', 'VM', 'Status', 'Current Version',
                    'Available Version', 'Deployment Schedule Date',
                    'Deployment Schedule Time'];
        else
            return [' ',
                "<p align='center'><b>VM<br></b></p>",
                "<p align='center'><b>Deployment<br>Status</b></p>",
                "<p align='center'><b>Current<br>Version</b></p>",
                "<p align='center'><b>Available<br>Version</b></p>",
                "<p align='center'><b>Deployment<br>Schedule Date</b></p>",
                "<p align='center'><b>Deployment<br>Schedule Time</b></p>"];
    },
    f_getVMRestartColHeader: function(htmlBase)
    {
        if(htmlBase == undefined || !htmlBase)
            return ['VM', 'Status', 'CPU', 'RAM', 'Desk Space',
                    'Current Version', 'Update Version', 'Deployment Schedule'];
        else
            return ["<p align='center'><b>VM<br></b>&nbsp;</p>",
                    "<p align='center'><b>Status<br>&nbsp;</b></p>",
                    "<p align='center'><b><br>&nbsp;</b></p>",
                    "<p align='center'><b><br>&nbsp;</b></p>",
                    "<p align='center'><b><br>&nbsp;</b></p>"];
    },
    f_getUserColHeaderNames: function(htmlBase)
    {
        if(htmlBase == undefined || !htmlBase)
            return [' ', 'Firstname', 'Lastname', 'Username', 'Password'];
        else
            return [ "<p align='center'><b>&nbsp;<br>&nbsp;</b></p>",
                    "<p align='center'><b>Firstname<br></b></p>",
                    "<p align='center'><b>Lastname<br></b></p>",
                    "<p align='center'><b>Username<br></b></p>",
                    "<p align='center'><b>Password<br></b></p>"
                    ];
    },

    ////////////////////////////////////////////////////////////////////////////
    f_getMonitoringAnchorData: function()
    {
        return [ 'Hardware', 'Network', 'Software' ];
    },
    f_getUserAnchorData: function()
    {
        return [ 'User' ];
    },

    ////////////////////////////////////////////////////////////////////////////
    f_getOpTopPanelData: function()
    {
        var links = this.f_getOApplianceAnchorData();
        var str = "<nobr><div id='header'>";
        var selIndex = 0;

        for(var i=0; i<links.length; i++)
        {
            var myId = this.m_tabName + links[i];
            
            if(this.m_selTopAnchorName == links[i])
            {
                str += "<a class='on' id='id_" + myId + "_link' href='#top' onclick=" +
                    "f_onClickAnchor('" + links[i] + "')>" +
                    "<img src='images/carre.gif'/>&nbsp;&nbsp;<font color='#FF6600'>" +
                    "<b>" + links[i] + "</b></font>" +
                    "</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                selIndex = i;
            }
            else
            {
                str += "<a class='on' id='id_" + myId + "_link' href='#top' onclick=" +
                    "f_onClickAnchor('" + links[i] + "')>" +
                    "<img src='images/carre.gif'/>&nbsp;&nbsp;" + links[i] +
                    "</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
            }
            
        }
        str += "</div></nobr>";

        var el = document.getElementById('nav');

        if(el == undefined)
        {
            Ext.getBody().createChild({tag:'div', id:'nav', html: str});
            el = document.getElementById('nav');
        }

        el.innerHTML = str;

        var comp = new Ext.Panel(
        {
            id: Ext.id()
            ,border: false
            ,bodyStyle: 'padding: 0px 10px 0px 10px'
            ,contentEl: el
        });
        comp.doLayout();

        return comp;
    },

    ////////////////////////////////////////////////////////////////////////////
    f_getVMLeftPanelData: function(anchorLinkData)
    {
        var links = anchorLinkData == undefined ? this.f_getVMAnchorData() :
                                      anchorLinkData;

        var selIndex = 0;
        var str = "<div id='leftMenu'>" +
              "<ul id='openAppliance' style='display:block'>";

        if(links != 'empty')
        {
            for(var i=0; i<links.length; i++)
            {
                var anchorId = f_replace(links[i], ' ', '_');
                var myId = this.m_tabName + anchorId;

                if(this.m_selLeftAnchorName == links[i])
                {
                    str +=
                        "<li><a class='on' id='id_" + myId + "_link' href='#' onclick=" +
                        "f_onClickAnchor('" + anchorId + "')>" + links[i] +
                        "</a></li>";
                    selIndex = i;
                }
                else
                    str +=
                        "<li><a class='off' id='id_" + myId + "_link' href='#' onclick=" +
                        "f_onClickAnchor('" + anchorId + "')>" + links[i] +
                        "</a></li>";
            }
        }
        else
            selIndex = 999;

        str += '</ul><div id="helpMenu" style="display:block">' +
                '<a target = "_blank" href="#" onfocus="this.blur();" ' +
                'class="linkhelp" onclick="f_loadHelp();return false;">' +
                '<img src="images/img_help.gif" alt="Help" title="Help"></a></div></div>';

        Ext.getBody().createChild(
                            {tag:'div', id:'id_vmAnchor_' + selIndex, html: str});

        str = "id_vmAnchor_" + selIndex;

        var comp = new Ext.Panel(
        {
            id: Ext.id()
            ,border: false
            ,bodyStyle: 'padding: 0px 10px 0px 0px'
            ,contentEl: str
        });

        return comp;
    },


    ////////////////////////////////////////////////////////////////////////////
    f_updateMainPanel: function(anchorId)
    {
        if(this.m_mainPanel == undefined)
            this.m_mainPanel = this.f_createMainPanel(this.m_tabName);

        this.f_processDataPanel(anchorId);
        this.f_updateTopPanel(this.f_getOpTopPanelData());
        this.f_updateLeftPanel(this.f_getVMLeftPanelData());

        this.m_mainPanel.doLayout();
    },

    f_getMainPanel: function(anchorId)
    {
        this.f_updateMainPanel(anchorId == undefined ? 'VM' : anchorId);

        return this.m_mainPanel;
    },

    f_processDataPanel: function(anchorId)
    {
        /////////////////////////////////////////////
        // find out if the anchor is horz anchor or
        // vert anchor
        var workingPanelTitle = null;
        var isHorzAnchor = false;
        this.m_selTopAnchorName = 'VM';
        for(var i=0; i<this.f_getOApplianceAnchorData().length; i++)
        {
            ///////////////////////////////////////////
            // if match, anchorId is fall in horz anchor
            if(anchorId == this.f_getOApplianceAnchorData()[i])
            {
                isHorzAnchor = true;
                this.m_selTopAnchorName = anchorId;
                break;
            }
        }

        if(isHorzAnchor)
        {
            workingPanelTitle = anchorId;

            switch(this.m_selTopAnchorName)
            {
                case 'VM':
                default:
                    workingPanelTitle = 'VM > VM Dashboard';
                    this.m_isDashboard = true;
                    this.m_selLeftAnchorName = this.f_getVMAnchorData()[0];
                    f_getVMDashboard_RestartDataFromServer(this);
                    this.f_updateLeftPanel(this.f_getVMLeftPanelData());
                    break;
                case 'User':
                    workingPanelTitle = 'Users';
                    f_getUserDataFromServer(this);
                    this.m_selLeftAnchorName = this.f_getUserAnchorData()[0];
                    this.f_updateLeftPanel(this.f_getVMLeftPanelData(
                                            this.f_getUserAnchorData()));
                    break;
                case 'Monitoring':
                    workingPanelTitle = 'Monitoring > Hardware';
                    f_getMonitoringHardwareDataFromServer(this);
                    this.m_selLeftAnchorName = this.f_getMonitoringAnchorData()[0];
                    this.f_updateLeftPanel(this.f_getVMLeftPanelData(
                                              this.f_getMonitoringAnchorData()));
                    break;
                case 'Backup':
                    this.m_selLeftAnchorName = 'empty';
                    this.f_updateLeftPanel(this.f_getVMLeftPanelData('empty'));
                    break;
            }

            this.f_updateDataPanelLabel(workingPanelTitle);
        }
        else  // user select anchor on left panel
        {
            workingPanelTitle = this.m_selTopAnchorName + ' > ';

            switch(anchorId)
            {
                case 'VM_Dashboard':
                    this.m_isDashboard = true;
                    this.m_selLeftAnchorName = this.f_getVMAnchorData()[0];
                    f_getVMDashboard_RestartDataFromServer(this);
                    workingPanelTitle += 'VM Dashboard';
                    break;
                case 'Deploy_VM_Software':
                    this.m_selLeftAnchorName = this.f_getVMAnchorData()[1];
                    f_populateVMDeploySoftwarePanel(this);
                    workingPanelTitle += 'Deploy VM Software';
                    break;
                case 'Restart':
                    workingPanelTitle += 'Restart';
                    this.m_isDashboard = false;
                    this.m_selLeftAnchorName = this.f_getVMAnchorData()[2];
                    f_getVMDashboard_RestartDataFromServer(this);
                    break;
                case 'Hardware':
                    f_getMonitoringHardwareDataFromServer(this);
                    workingPanelTitle += 'Hardware';
                    break;
                case 'Network':
                    workingPanelTitle += 'Network';
                    break;
                case 'Software':
                    workingPanelTitle += 'Software';
                    break;
                case 'User':
                    workingPanelTitle = 'Users';
                    f_getUserDataFromServer(this);
                    this.m_selLeftAnchorName = this.f_getUserAnchorData()[0];
                    this.f_updateLeftPanel(this.f_getVMLeftPanelData(
                                            this.f_getUserAnchorData()));
                    break;
            }

            this.f_updateDataPanelLabel(workingPanelTitle);
        }
    }

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
});

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function f_sendServerCommand(checkLogin, xmlSend, callback, showWait)
{
    if(checkLogin)
    {
        if(!f_isUserLogin(true))
        {
            window.location = 'ft_main.html';
            return;
        }
    }

    var xmlStr = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
               + "<vyatta>" +
               xmlSend + "</vyatta>\n";

    if(showWait == undefined || showWait == true)
        g_sendCommandWait = Ext.MessageBox.wait('Wait for Server Response ...',
                                              'Post Request to Server');

    /* send request */
    var conn = new Ext.data.Connection({});
    conn.request(
    {
        url: '/cgi-bin/webgui-oa', method: 'POST',
        xmlData: xmlStr,
        callback: callback
    });
}

function f_parseVMDashboarData(vm)
{
    var q = Ext.DomQuery;
    var vmName = vm.getAttribute('name');

    var status = q.selectValue('status', vm);
    status = status == undefined ? 'unknown' : status;

    var cpu = q.selectNode('cpu', vm).getAttribute('util');
    cpu = cpu == undefined ? 0 : cpu;

    var mem = q.selectNode('mem', vm);
    var memTotal = mem.getAttribute('total');
    var memFree = mem.getAttribute('free');

    var disk = q.selectNode('disk', vm);
    var diskTotal = disk.getAttribute('total');
    var diskFree = disk.getAttribute('free');

    ///////////////////////////////////////
    // get current and available versions
    var versions = q.selectNode('version', vm);
    var verCur = q.selectNumber('current', versions)
    var disVerCur = q.selectValue('current', versions);
                  //Ext.num(q.selectValue('current', versions), 0);
    var verAvails = q.select('avail', versions);
    var vAvails = [ ];
    var updateAvail = '';
    for(var j=0; j<verAvails.length; j++)
    {
        vAvails[j] = q.selectNumber('avail:nth(' + (j+1) + ')', versions);
        updateAvail = (vAvails[j] > verCur) ? 'updateAval_yes' : 'updateAval_no';
    }

    return [ vmName, status, cpu, f_findPercentage(memTotal, memFree),
              f_findPercentage(diskTotal, diskFree), disVerCur, updateAvail, 'down',
              memTotal, memFree, diskTotal, diskFree];
}

function f_populateVMRestartPanel(opObject)
{
    var cm = new Ext.grid.ColumnModel(
    [
        {id: 'vm', header: 'VM', width: 120, sortable: true, dataIndex: 'vm'},
        {header: 'Status', width: 55, sortable: false, renderer: f_renderGridImage,
                dataIndex: 'status', fixed: true},
        {header: ' ', width: 110, sortable: false, renderer: f_renderGridButton,
                dataIndex: 'restart'},
        {header: ' ', width: 110, sortable: false, renderer: f_renderGridButton,
                dataIndex: 'stop'},
        {header: ' ', width: 110, sortable: false, renderer: f_renderGridButton,
                dataIndex: 'start'}
    ]);
    var store = new Ext.data.SimpleStore(
    {
        fields: [
            { name: 'vm' },
            { name: 'status' },
            { name: 'restart' },
            { name: 'stop' },
            { name: 'start' }
        ]
    });
    store.loadData(opObject.m_restartData);

    ////////////////////////////////////////////////////
    // add main grid into working panel
    var gPanels = f_createEditorGridPanel(opObject, store, cm, undefined, 'vm');
    
    ///////////////////////////////////////////////
    // add WM System log into working panel
    var lPanel = f_createLogPanel('VM System Log',
          'The status of VM Restart will display here....');
    gPanels[gPanels.length] = lPanel;
    opObject.f_updateDataPanel(gPanels);

    //////////////////////////////////////////////
    // enhance header
    var grid = gPanels[0];
    var header = opObject.f_getVMRestartColHeader(true);
    for(var i=0; i<header.length; i++)
        grid.getView().getHeaderCell(i).innerHTML = header[i];
}

function f_parseVMRestartData(vm)
{
    var q = Ext.DomQuery;

    var vmName = vm.getAttribute('name');

    var status = q.selectValue('status', vm);
    status = status == undefined ? 'unknown' : status;

    return [ vmName, status, 'Restart', 'Stop', 'Start' ];
}

function f_parseUserData(vm)
{
    var user = vm.getAttribute('user');
    var last = vm.getAttribute('last');
    var first = vm.getAttribute('first');

    return [ false, first, last, user, '*****', 'list' ];
}

function f_parseMonitoringHardwareData(hardware)
{
    var q = Ext.DomQuery;

    var nic = f_parseHardwareStatus(q.selectValue('nic', hardware));
    var disk = f_parseHardwareStatus(q.selectValue('disk', hardware));
    var cpu = f_parseHardwareStatus(q.selectValue('cpu', hardware));
    var fan = f_parseHardwareStatus(q.selectValue('fan', hardware));

    return [ ['NIC', nic], ['Disk', disk], ['CPU', cpu], ['Fan', fan]];
}
function f_parseHardwareStatus(hw)
{
    if(hw == undefined || hw == 'unknown')
        return 'unknown';
    else if(hw == 'bad')
        return 'down';
    else
        return 'up';
}

function f_getVMDashboard_RestartDataFromServer(opObject)
{
    var dbData = new Array();
    var stData = new Array();
    var thisObj = opObject;

    var serverCommandCb = function(options, success, response)
    {
        var xmlRoot = response.responseXML.documentElement;
        var q = Ext.DomQuery;

        var isSuccess = f_parseResponseError(xmlRoot);
        if(!isSuccess[0])
        {
            f_promptErrorMessage('Load VM Dashboard', isSuccess[1]);
            f_hideSendWaitMessage();

            return;
        }

        var vmNodes = q.select('vm', xmlRoot);

        for(var i=0; i<vmNodes.length; i++)
        {
            dbData[i] = f_parseVMDashboarData(vmNodes[i]);
            stData[i] = f_parseVMRestartData(vmNodes[i]);
        }

        thisObj.m_dashboardData = dbData;
        thisObj.m_restartData = stData;

        if(thisObj.m_isDashboard)
            f_populateVMDashboardPanel(thisObj);
        else
            f_populateVMRestartPanel(thisObj);

        f_hideSendWaitMessage();
    }

    var sid = f_getUserLoginedID();
    var xmlstr = "<vmstatus><id>" + sid + "</id>\n"
               + "</vmstatus>";

    f_sendServerCommand(false, xmlstr, serverCommandCb);
}

function f_populateVMDashboardPanel(opObject)
{
    var cm = new Ext.grid.ColumnModel(
    [
        {header: 'VM', width: 120, sortable: true, dataIndex: 'vm',
                style: 'padding:10px 0px 0px 5px'},
        {header: 'Status', width: 50, sortable: false, renderer: f_renderGridImage,
                dataIndex: 'status', fixed: false, align: 'center'},
        {header: 'CPU', width: 100, sortable: false, renderer: f_renderProgressBarChange,
                dataIndex: 'cpu', align: 'center'},
        {header: 'RAM', width: 100, sortable: false, renderer: f_renderProgressBarChange,
                dataIndex: 'ram', align: 'center'},
        {header: 'Disk Space', width: 100, sortable: false, renderer: f_renderProgressBarChange,
                dataIndex: 'diskSpace', align: 'center'},
        {header: 'Current Version', width: 60, sortable: false,
                dataIndex: 'current', fixed: false, align: 'center'},
        {header: 'Available Version', width: 60, sortable: false,
                dataIndex: 'available', fixed: false, align: 'center',
                renderer: f_renderGridImage},
        {header: 'Deployment Scheduled', width: 76, sortable: false, align: 'center',
                dataIndex: 'deployment', fixed: false, renderer: f_renderGridImage},
        {header: 'memTotal', hidden:true, dataIndex:'memTotal'},
        {header: 'memFree', hidden:true, dataIndex:'memFree'},
        {header: 'diskTotal', hidden:true, dataIndex:'diskTotal'},
        {header: 'diskFree', hidden:true, dataIndex:'diskFree'}
    ]);
    var store = new Ext.data.SimpleStore(
    {
        fields: [
            { name: 'vm' },
            { name: 'status' },
            { name: 'cpu' },
            { name: 'ram' },
            { name: 'diskSpace' },
            { name: 'current' },
            { name: 'available' },
            { name: 'deployment'},
            { name: 'memTotal' },
            { name: 'memFree' },
            { name: 'diskTotal' },
            { name: 'diskFree'}
        ]
    });
    store.loadData(opObject.m_dashboardData);

    var addVM = new Ext.Button(
    {
        text: 'Add New VM'
        ,handler: function(btn, e) { alert('will link to Orange site.'); }
    });

    var removeVM = new Ext.Button(
    {
        text: 'Remove VM'
        ,handler: function(btn, e) { alert('will link to Orange site.'); }
    });
    var buttons = [ addVM, removeVM ];

    ///////////////////////////////////////////////////////
    // add grid into working panel
    var grid = f_createGridPanel(store, cm, undefined, 'vm', buttons);
    var gPanel = new Ext.Panel(
    {
        border: false
        ,autoWidth: true
        ,autoHeight: true
        ,items: [grid]
    });
    var panels = [gPanel];
    opObject.f_updateDataPanel(panels);

    //////////////////////////////////////////////
    // enhance header
    var header = opObject.f_getVMDashboardColHeader(true);
    for(var i=0; i<header.length; i++)
        grid.getView().getHeaderCell(i).innerHTML = header[i];
}

function f_getUserDataFromServer(opObject)
{
    var dbData = new Array();
    var thisObject =  opObject;

    var serverCommandCb = function(options, success, response)
    {
        var xmlRoot = response.responseXML.documentElement;
        var q = Ext.DomQuery;

        var isSuccess = f_parseResponseError(xmlRoot);
        if(!isSuccess[0])
        {
            f_promptErrorMessage('Load User', isSuccess[1]);
            f_hideSendWaitMessage();
            return;
        }

        var vmUserNodes = q.select('vmuser', xmlRoot);

        for(var i=0; i<vmUserNodes.length; i++)
            dbData[i] = f_parseUserData(vmUserNodes[i]);

        thisObject.m_userDBData = dbData;
        f_populateUserPanel(thisObject);

        f_hideSendWaitMessage();
    }


    var sid = f_getUserLoginedID();
    var xmlstr = "<vmuser op='list'><id>" + sid + "</id>\n"
    + "</vmuser>";

    f_sendServerCommand(false, xmlstr, serverCommandCb);
}
function f_populateVMDeploySoftwarePanel(opObject)
{
    var thisObject = opObject;
    var fm = Ext.form;

    var checkColumn = new Vyatta_grid_CheckColumn(
    {
        header: " ",
        dataIndex: 'checker',
        width: 20
    });

    var userStore = new Ext.data.SimpleStore( {
fields: [ 'userId', 'userName' ],
data: [[1, 2], [3, 4]]
} );

    var cb = new Ext.form.ComboBox(
    {
        store: userStore
        ,mode: 'local'
        ,displayField: 'userName'
        ,valueField: 'userId'
        ,typeAhead: true
        ,triggerAction: 'all'
        ,lazyRender:true
        ,listClass: 'x-combo-list-small'
        ,listeners: { expand: function(obj) { cb = obj;
cb.reset(); userStore.removeAll(); userStore.loadData([['a','b'],['c','d']]);          }}
    });

    function formatDate(value)
    {
        return value ? value.dateFormat('M d, Y') : '';
    }

    var cm = new Ext.grid.ColumnModel([
        checkColumn,
        {header: 'VM', width: 60, menuDisabled: true, fixed: true,
            sortable: false, dataIndex: 'vm', align:'left'},
        {header: 'Deployment Status', width: 110, sortable: false, fixed: true,
            menuDisabled: true, dataIndex: 'status', align:'center'},
        {header: 'Current Version', width: 80, sortable: false, fixed: true,
            menuDisabled: true, dataIndex: 'currentVersion', align:'center'},
        {header: 'Available Version', menuDisabled: true, width: 90, sortable: false,
            dataIndex: 'availableVersion', fixed: true,
            align:'center',
            renderer: f_renderGridComboBox,
            editor: cb},
        {header: 'Deployment Schedule', width: 100, menuDisabled: true, sortable: false,
            dataIndex: 'deployScheduleDate',
            align:'center',
            type: 'date',
            dateFormat: 'd/m/y',
            renderer: f_renderGridDataField,
            editor: new fm.DateField(
            {
                format: 'd/m/y'
                ,minValue: '01/01/06'
                //disabledDays: [0, 6 ],
                //disabledDaysText: 'Plants are not available on the weekends'
            })
        },
        {header: 'Deployment Schedule', width: 90, menuDisabled: true, sortable: false,
            dataIndex: 'deployScheduleTime',
            align:'center',
            type: 'date',
            dateFormat: 'm/d/y',
            renderer: f_renderGridDataField,
            editor: new fm.TimeField(
            {
                increment: 15
                ,allowBlank: true
            })
        }
    ]);

    var store = new Ext.data.SimpleStore(
    {
        fields: [
            { name: 'checker', type: 'bool' },
            { name: 'vm' },
            { name: 'status' },
            { name: 'currentVersion' },
            { name: 'availableVersion' },
            { name: 'deployScheduleDate' },
            { name: 'deployScheduleTime' }
        ]
    });

    var data = [
        [ true, 'O. Appliance', 'status', '1.2', '1.5', 'now', 'now']
        ,[ false, 'Telephony', 'status', '1.2', '1.5', 'now', 'now']
        ,[ true, 'Security', 'status', '1.2', '1.5', 'now', 'now']
        ,[ false, '3rd Parties', 'status', '1.2', '1.5', 'now', 'now']
    ];

    store.loadData(data);
    var gPanel = f_createEditorGridPanel(thisObject, store, cm, checkColumn, 'vm');
    var bPanel = f_createDeployButtonPanel(thisObject);
    gPanel[gPanel.length] = bPanel;

    var grid = gPanel[0];
var gv = grid.getView();

    grid.on({"cellclick":{fn: f_onGridCellClick }});

    thisObject.f_updateDataPanel(gPanel);

    var header = thisObject.f_getVMDeploySoftwareColHeader(true);
    for(var i=1; i<header.length; i++)
        grid.getView().getHeaderCell(i).innerHTML = header[i];
}
function f_populateUserPanel(opObject)
{
    var thisObject = opObject;

    var enableDisableUserButtons = function(opObj)
    {
        var g = opObj.grid;

        if(g != undefined)
        {
            var buttonPanel = opObj.buttonPanel;
            if(buttonPanel != undefined && buttonPanel.buttons.length == 3)
            {
                buttonPanel.buttons[1].disable();
                buttonPanel.buttons[2].disable();

                g.store.each(function(record)
                {
                    if(record.get('checker'))
                    {
                        buttonPanel.buttons[1].enable();
                        buttonPanel.buttons[2].enable();
                        return;
                    }
                });
            }
        }
    }

    var CheckColumnOnMousePress = function()
    {
        enableDisableUserButtons(thisObject);
    }

    var addCallback = function()
    {
        var values = {};
        values['checker'] = true;
        values['first'] = 'Enter firstname';
        values['last'] = 'Enter lastname';
        values['user'] = 'Enter username';
        values['password'] = 'Enter password';
        values['action'] = 'add'

        var record = new Ext.data.Record(values);
        thisObject.store.add(record);

        enableDisableUserButtons(thisObject)
    }
    thisObject.addCallback = addCallback;

    var deleteCallback = function(btn)
    {
        if(btn == 'yes')
        {
            var deleteRecs = [ ];

            store.each(function(record)
            {
                if(record.get('checker'))
                {
                    if(record.get('user') == 'admin')
                    {
                        Ext.Msg.alert('Delete User', 'admin user cannot be deleted.')
                        return;
                    }

                    var sid = f_getUserLoginedID();
                    var xmlstr = "<vmuser op='delete' user='" +
                                  record.get('user') +
                                  "' last='" + record.get('last') +
                                  "' first='" + record.get('first') +
                                  "' password='" + record.get('password') +
                                  "'> <id>" + sid + "</id>"  +
                                  "</vmuser>";

                    deleteRecs.push(xmlstr);
                    //store.remove(record);
                }
            });

            var numOfSent = deleteRecs.length;
            var serverCommandCb = function(options, success, response)
            {
                numOfSent--;

                /////////////////////////////////////////////
                // if we received all the command callback
                // then refresh the user screen.
                if(numOfSent == 0)
                    f_onClickAnchor('User');
            }

            //////////////////////////////////////////////
            // ready to send commands to server
            while(deleteRecs.length > 0)
                f_sendServerCommand(true, deleteRecs.pop(), serverCommandCb, false);

            CheckColumnOnMousePress();
        }
    };
    thisObject.deleteCallback = deleteCallback;

    var saveCallback = function()
    {
        grid.store.each(function(record)
        {
            if(record.get('action') == 'add')
            {
                var serverCommandCb = function(options, success, response)
                {
                    f_onClickAnchor('User');
                }

                var sid = f_getUserLoginedID();
                var xmlstr = "<vmuser op='add' user='" +
                              record.get('user') +
                              "' last='" + record.get('last') +
                              "' first='" + record.get('first') +
                              "' password='" + record.get('password') +
                              "'> <id>" + sid + "</id>"  +
                              "</vmuser>";

                f_sendServerCommand(true, xmlstr, serverCommandCb, false);
                return;
            }
        });
    }
    thisObject.saveCallback = saveCallback;


    var checkColumn = new Vyatta_grid_CheckColumn(
    {
        header: " "
        ,dataIndex: 'checker'
        ,width: 25
        ,fixed: true
        ,sortable: false
        ,callback: CheckColumnOnMousePress
    });

/*/
    var comboBox = new Ext.form.ComboBox(
    {
        typeAhead: true
        ,displayField: 'first'
        ,mode: 'local'
        ,triggerAction: 'all'
        //,transform: 'userPrivilege'
        ,lazyRender: true
    });
    */
    var cm = new Ext.grid.ColumnModel(
        [
        checkColumn,
        {
            header: '<p align=center><b>Firstname<br>&nbsp;</b></p>',
            id: 'first',
            width: 110,
            sortable: false,
            dataIndex: 'first',
            fixed: true,
            //type: 'string',
            renderer: f_renderGridTextField,
            editor: f_createUserTextField(true)
        },
        {
            header: '<p align=center><b>Lastname<br>&nbsp;</b></p>',
            width: 110,
            sortable: false,
            dataIndex: 'last',
            //type: 'string',
            renderer: f_renderGridTextField,
            editor: f_createUserTextField(true)
        },
        {
            header: '<p align=center><b>Username<br>&nbsp;</b></p>',
            width: 110,
            sortable: false,
            dataIndex: 'user',
            //type: 'string',
            renderer: f_renderGridTextField,
            editor: f_createUserTextField(true)
        },
        {
            header: '<p align=center><b>Password<br>&nbsp;</b></p>',
            width: 110,
            sortable: false,
            dataIndex: 'password',
            //type: 'string',
            renderer: f_renderGridTextField,
            editor: f_createUserTextField(false)
        },
        {header: 'action', hidden:true, dataIndex:'action' }
        ]);

    var store = new Ext.data.SimpleStore(
    {
        fields:
        [
            { name: 'checker', type: 'bool' },
            { name: 'first' },
            { name: 'last' },
            { name: 'user'},
            { name: 'password'},
            { name: 'action'}
        ]
    });
    store.loadData(thisObject.m_userDBData);

    ///////////////////////////////////////////////////////
    // add user panel grid into working panel
    var panels = f_createEditorGridPanel(thisObject, store, cm, checkColumn, 'user');
    thisObject.store = store;
    var buttonPanel = f_createUserButtonsPanel(thisObject);
    thisObject.buttonPanel = buttonPanel;
    panels[panels.length] = buttonPanel;


    //////////////////////////////////////////////
    // enhance header
    var grid = panels[0];

    var headers = thisObject.f_getUserColHeaderNames(true);
    //for(var i=1; i<headers.length-1; i++)
      //  alert(grid.getView().getHeaderCell(0));
      //  grid.getView().getHeaderCell(i).innerHTML = headers[i];

    thisObject.f_updateDataPanel(panels);
}


function f_getMonitoringHardwareDataFromServer(opObject)
{
    var dbData = new Array();
    var thisObject = opObject;

    var serverCommandCb = function(options, success, response)
    {
        var xmlRoot = response.responseXML.documentElement;
        var q = Ext.DomQuery;

        var isSuccess = f_parseResponseError(xmlRoot);
        if(!isSuccess[0])
        {
            f_promptErrorMessage('Load Monitoring Hardware', isSuccess[1]);
            f_hideSendWaitMessage();
            return;
        }

        var hwNodes = q.select('hw', xmlRoot);
        //for(var i=0; i<hwNodes.length; i++)
            dbData = f_parseMonitoringHardwareData(hwNodes[0]);

        thisObject.m_monitorHwDBData = dbData;
        f_populateMonitoringHardwarePanel(thisObject);

        f_hideSendWaitMessage();
    }

    var sid = f_getUserLoginedID();
    var xmlstr = "<vmstatus><id>" + sid + "</id>\n"
    + "</vmstatus>";

    f_sendServerCommand(false, xmlstr, serverCommandCb);
}

function f_populateMonitoringHardwarePanel(opObject)
{
    var cm = new Ext.grid.ColumnModel([
    {
        id: 'component',
        header: 'Component',
        width: 120,
        sortable: true,
        dataIndex: 'component',
        style: 'padding:10px 0px 0px 5px'
    },
    {
        header: 'Status',
        width: 70,
        sortable: false,
        renderer: f_renderGridImage,
        dataIndex: 'status',
        fixed: true,
        align: 'center'
    },
    ]);

    var store = new Ext.data.SimpleStore(
    {
        fields: [
        {
            name: 'component'
        },
        {
            name: 'status'
        },
        ]
    });
    store.loadData(opObject.m_monitorHwDBData);


    ////////////////////////////////////////////////////
    // add grid into working panel
    var grid = f_createGridPanel(store, cm, undefined, 'component');
    opObject.f_updateDataPanel(new Array(grid));

    //////////////////////////////////////////////
    // enhance header
    grid.getView().getHeaderCell(0).innerHTML =
                      "<p align='center'><b>Component<br>&nbsp;</b></p>";
    grid.getView().getHeaderCell(1).innerHTML =
                      "<p align='center'><b>Status<br>&nbsp;</b></p>";
}

function f_renderGridImage(val, metaData, record, rIndex, cIndex)
{
    var str = undefined;
    var title = 'Status:';
    var tip = '';

    switch(val)
    {
        case 'updateAval_yes':
            str = String.format("<span align='center'><img src='images/statusUp.ico' /></span>");
            tip = '"<font color=green>Update version is available</font>"';
            title = 'Update&nbsp;Version:'
            break;
        case 'updateAval_no':
            str = String.format("<span align='center'><img src='images/statusDown.ico' /></span>");
            tip = '"<font color=red>Update version is not available</font>"';
            title = 'Update&nbsp;Version:'
            break;
        case 'up':
            str = String.format("<span align='center'><img src='images/statusUp.ico' /></span>");
            tip = '"The value is <font color=green><b>Up</b></font>"';
            break;
        case 'down':
            str = String.format("<span align='center'><img src='images/statusDown.ico' /></span>");
            tip = '"The value is <font color=red><b>Down</b></font>"';
            break;
        default:
            str = String.format("<span align='center'><img src='images/statusUnknown.ico' /></span>");
            tip = '"The value is <font color=yellow><b>Unknow</b></font>"';
    }

    metaData.attr = 'ext:qtitle=' + title + ' ext:qtip=' + tip;

    return str;
}

function f_renderProgressBarChange(val, metaData, record, rowIndex, colIndex)
{
    var contentId = Ext.id();

    //alert(Ext.urlEncode(record));
    var tTitle = "";
    var tTip = "tips";

    switch(colIndex)
    {
        case 2:
            tTitle = "CPU&nbsp;Used:";
            tTip = 'CPU&nbsp;Used=&nbsp;' + record.get('cpu');
            break;
        case 3:
            tTitle = "RAM&nbsp;Used:";
            tTip = 'Total=&nbsp;' + record.get('memTotal') +
                    ',&nbsp;Free=&nbsp;' + record.get('memFree');
            break;
        case 4:
            tTitle = "Disk&nbsp;Space&nbsp;Used:";
            tTip = 'Total=&nbsp;' + record.get('diskTotal') +
                    ',&nbsp;Free=&nbsp;' + record.get('diskFree');
            break;
    }
    metaData.attr = 'ext:qtitle=' + tTitle + ' ext:qtip=' + tTip;

    f_createGridProgressBar.defer(1, this, [val, contentId, metaData,
            record, rowIndex, colIndex]);

    return String.format("<span align='center' id=" + contentId + "></span>");
}

function f_createGridPanel(store, columns, plugins, expandColName, buttons)
{
    var gridView = new Ext.grid.GridView(
    {
        enableRowBody: false
        ,forceFit: true
    });
    gridView.scrollOffset = 0;

    var grid = new Ext.grid.GridPanel(
    {
        store: store
        ,cm: columns
        ,stripeRows: false
        ,autoExpandColumn: expandColName
        ,border: true
        //,height: 220
        ,maxHeight: 220
        ,autoHeight: true
        //,minWidth: 400
        //,width: 600
        ,autoWidth: true
        ,bodyBorder: true
        //,bodyStyle: 'padding: 0px 10px 10px 0px'
        //,viewConfig: { forceFit: true, enableRowBody: false }
        ,view: gridView
        ,plugins: plugins
        //,frame: true
        ,enableColumnHide: true
        ,enableHdMenu: false
        ,defaults: { autoScroll: true }

        // inline buttons
        ,buttons: buttons
        ,buttonAlign: 'right'
    });
    grid.isGrid = true;


    return grid;
}

function f_createEditorGridPanel(opObject, store, columns, plugins, expandColName)
{
    var gridView = new Ext.grid.GridView(
    {
        id: Ext.id()
        ,enableRowBody: false
        ,forceFit: true
        ,borderWidth: 0
    });
    gridView.scrollOffset = 0;

    var grid = new Ext.grid.EditorGridPanel(
    {
        store: store
        //,columns: columns
        ,cm: columns
        ,stripeRows: false
        ,autoExpandColumn:expandColName
        ,autoHeight: true
        ,maxHeight: 220
        //,autoWidth: true
        ,width: 600
        ,border: true
        ,bodyBorder: true
//        ,bodyStyle: 'padding: 0px 10px 8px 0px'
        ,viewConfig: { forceFit: true, borderWidth: 0 }
        ,view: gridView
        ,plugins: plugins
        ,clicksToEdit:1
        ,defaults: { autoScroll: true }
    });
    opObject.grid = grid;
    //grid.gridView = gridView;
    grid.isGrid = true;

    grid.on(
    {
        "cellclick":
        {
            fn: function(grid, rowIndex, columnIndex, e)
            {
                opObject.m_selGridRow = rowIndex;
                opObject.m_selGridCol = columnIndex;

                if(store.getCount() > 6)
                    gridView.scrollOffset = 15;
                else
                    gridView.scrollOffset = 0;

                grid.doLayout();
            }
        }
    });

    return [ grid, f_createDataPanelNoteMessage() ];
}

function f_createDataPanelNoteMessage()
{
    var msg = '<font color=red><b>* Note: </b></font>' +
    '<font size=1 color=blue>Please click on the desired ' +
    'cell to enter new value.</font>';

    var label = new MyLabel(
    {
        id: 'label_id_node_msg'
        ,border: false
        ,height: 32
        ,width: 400
        ,html: msg
        ,bodyStyle: 'padding: 10px 0px 10px 10px'
    });

    return label
}

function f_createLogPanel(title, logText)
{

    var label = new MyLabel(
    {
        id: 'label_id_' + title
        ,border: false
        ,height: 32
        ,width: 400
        ,cls: 'vHeaderLogLabel'
        ,html: title
        ,bodyStyle: 'padding: 10px 10px 10px 0px'
    });

    var dataPanel = g_opPanelObject.f_getDataPanel();
    var w = dataPanel.getInnerWidth();

    var textArea = new Ext.form.TextArea(
    {
        id: 'textArea_id_' + title
        ,height: 78
        ,scroll: true
        ,width: (w-30)  //560
        ,value: logText
        ,bodyStyle: 'padding: 10px 10px 10px 0px'
    });

    var panel = new Ext.Panel(
    {
        id: 'logPanel_id' + title
        ,layout: 'ux.row'
        ,border: false
        ,bodyStyle: 'padding: 20px 10px 10px 0px'
        ,items: [ label, textArea ]
    });

    return panel;
}

function f_createGridProgressBar(val, contentId, metaData, record, rowIndex, colIndex)
{
    var tTitle = "";
    var tTip = "tips";
    switch(colIndex)
    {
        case 3:
            tTitle = "<u>RAM&nbsp;Usaged:</u>";
                //"<p><b><u>RAM&nbsp;Usaged:</u></b></p>";
            break;
    }

    metaData.attr = 'ext:qtitle=' + tTitle + ' ext:qtip=' + tTip;

    var pBar = new Ext.ProgressBar(
    {
        width: 70
        ,text: val + "%"
        ,value: (val/100)
    });

    pBar.render(document.body, contentId);
}


function f_createGridVMRestartButton(val, contentId, record, rIndex, cIndex)
{
    var disable = true;
    var hide = false;
    var status = record.get('status');
    var vm = record.get('vm');
    var xmlStatement = '';

    switch(val)
    {
        case 'Restart':
            if(status == V_STATUS_UP) disable = false;
            xmlStatement = vm + ' restart';
            break;
        case 'Stop':
            if(status == V_STATUS_UP) disable = false;
            xmlStatement = vm + ' stop';
            hide = rIndex == 0 ? true : false;
            break;
        case 'Start':
            if(status == V_STATUS_DOWN) disable = false;
            xmlStatement = vm + ' start';
            hide = rIndex == 0 ? true : false;
            break;
    }

    var serverCommandCb = function(options, success, response)
    {
        var xmlRoot = response.responseXML.documentElement;
        var q = Ext.DomQuery;
        var errmsg = 'Unknown error';
        var isSuccess = true;

        var isSuccess = f_parseResponseError(xmlRoot);
        if(!isSuccess[0])
        {
            f_promptErrorMessage('Load Restart', isSuccess[1]);
            f_hideSendWaitMessage();

            return;
        }

        f_onClickAnchor(g_opPanelObject.f_getVMAnchorData()[3])
        f_hideSendWaitMessage();
    }

    var button = new Ext.Button(
    {
        text: val
        ,disabled: disable
        ,hidden: hide
        ,width: 100
        ,
        handler: function(btn, e)
        {

            var xmlstr = "<command><id>" + f_getUserLoginedID() +
            "</id><statement>/opt/vyatta/sbin/vyatta-vmop.pl " +
            xmlStatement + "</statement></command>";

            f_sendServerCommand(false, xmlstr, serverCommandCb);
        }
    });

    button.render(document.body, contentId);
}

function f_renderGridButton(val, p, record, rowIndex, colIndex)
{
    if(val != 'blank')
    {
        var contentId = Ext.id();

        f_createGridVMRestartButton.defer(1, this, [val, contentId, record, rowIndex, colIndex]);
        return String.format("<p align='center'>" +
            "<span id='" + contentId + "'></span></p>");
    }

    return "";
}

function f_renderGridDataField(val, metadata, record, rowIndex, colIndex)
{
    metadata = 'ext:qtitle="Date" ext:qtip=' +
      '"Click on this <font color=#FF6600><b>cell</b></font> to select new date"';

    return val;
}

function f_renderGridComboBox(val, metaData, record, rowIndex, colIndex)
{
    switch(colIndex)
    {
        case 1:

    }

    metaData.attr =
        'ext:qtip="Click on this <font color=#FF6600><b>cell</b></font> to select new value"' +
        'ext:qtitle=' + val;

    return val;
}

function f_renderGridTextField(val, metadata, record, rowIndex, colIndex)
{
    if(rowIndex == 0)
    {
        switch(colIndex)
        {
            case 1:
                val = ''
                break;
            case 2:
                val = ''
                break;
        }
    }

    if(colIndex == 4 && val != 'Enter password')
        val = '******';

    metadata.attr =
    'ext:qtip="Click on this <font color=#FF6600><b>cell</b></font> enter new value"' +
    'ext:qtitle=' + val;

    return val;
}

function f_createUserTextField(disableRowZero)
{
    var tf = new Ext.form.TextField(
    {
        listeners: {
            beforeshow: function()
            {
                if(g_opPanelObject.m_selGridRow == 0 && disableRowZero)
                    this.disable();
                else
                    this.enable();
            },
            keyup: function()
            {

            }
        }
    });

    return tf;
}

function f_createDeployButtonPanel(opObject)
{
    var dButton = new Ext.Button(
    {
        text: 'Deploy Selected'
        ,handle: function() {}
    });

    var cButton = new Ext.Button(
    {
        text: 'Cancel Selected'
        ,handle: function() {}
    });

    var panel = new Ext.Panel(
    {
        border: false
        ,buttons: [dButton, cButton]
    });

    return panel;
}
function f_createUserButtonsPanel(opObject)
{
    var thisObject = opObject;

    var saveChanged = new Ext.Button(
    {
        text: 'Save Changes'
        ,disabled: true
        ,handler: thisObject.saveCallback
    });

    var deleteSelected = new Ext.Button(
    {
        text: 'Delete Selected'
        ,disabled: true
        ,handler: function(btn, e)
        {
            f_yesNoMessageBox('Delete User',
                'Are you sure you wish to delete the selected users?',
                thisObject.deleteCallback);
        }
    });

    var addUser = new Ext.Button(
    {
        text: 'Add User'
        ,handler: thisObject.addCallback
    });

    var bPanel = new Ext.Panel(
    {
        border: false
        ,bodyBorder: false
        ,bodyStyle: 'padding: 0px 50px 0px 10px'
        //,layout: 'column'
        ,buttons: [ addUser, deleteSelected, saveChanged ]
    });

    return bPanel;
}

function f_onGridCellClick(grid, rowIndex, columnIndex, e)
{
    //var cb = grid.getColumnModel().getCellEditor(columnIndex, rowIndex);
    //alert(cb.getValue());G362
}

function f_loadHelp()
{
    alert('Need link for help');
}

function f_onClickAnchor(anchorId)
{
    g_opPanelObject.f_updateMainPanel(anchorId);
}