/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


v_panelObject = Ext.extend(Ext.util.Observable,
{
    ////////////////////////////////////////////////////////////////////////////
    // local data memeber
    // m_bodyPanel    -- the body panel
    // m_mainPanel
    // m_topPanel
    // m_leftPanel
    // m_dataPanel
    // m_objName
    // m_frameHeight
    // m_frameWidth
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    f_updateTopPanel: function(newDataPanel)
    {
        while(this.m_topPanel.items != undefined &&
              this.m_topPanel.items.getCount() > 0)
              this.m_topPanel.remove(this.m_topPanel.items.itemAt(0));

        this.m_topPanel.add(newDataPanel);
        this.m_topPanel.doLayout();
    },

    f_updateLeftPanel: function(newDataPanel)
    {
        while(this.m_leftPanel.items != undefined &&
              this.m_leftPanel.items.getCount() > 0)
              this.m_leftPanel.remove(this.m_leftPanel.items.itemAt(0));

        this.m_leftPanel.add(newDataPanel);
        this.m_leftPanel.doLayout();
    },

    f_updateDataPanel: function(panels)
    {
        if(this.m_dataPanel != undefined && this.m_dataPanel.innerPanel != undefined)
        {
            var iPanel = this.m_dataPanel.innerPanel;
            while(iPanel.items != undefined && iPanel.items.getCount() > 0)
                iPanel.remove(iPanel.items.itemAt(0));

            for(var i=0; i<panels.length; i++)
                iPanel.add(panels[i]);

            iPanel.doLayout();
            this.f_resizePanels(this.m_bodyPanel);
        }
    },
    f_updateDataPanelLabel: function(topLabelString)
    {
        var str = "<div class='vHeaderLabel'>" + topLabelString + "</div>";
        var el = document.getElementById('v_label');

        if(el != undefined)
            el.innerHTML = str;
    },

    f_getDataPanel: function()
    {
        return this.m_dataPanel.innerPanel;
    },

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    f_resizePanels: function(panel)
    {
        if(panel != undefined)
        {
            this.m_bodyPanel = panel;
            var h = panel.getInnerHeight();
            var w = panel.getInnerWidth();

            this.m_mainPanel.setSize(w, h);
            this.m_leftPanel.parentPanel.setSize(w-2, h-this.m_topHeight-2);
            this.m_leftPanel.setSize(this.m_leftWidth, h-this.m_topHeight-5);
            this.m_dataPanel.setSize(w-this.m_leftWidth-3, h-this.m_topHeight);
            this.m_dataPanel.innerPanel.setSize(w-this.m_leftWidth-25, h-this.m_topHeight);
            this.f_resizeDataPanelChildren(w);
        }
    },

    f_resizeDataPanelChildren: function(w)
    {
        var inner = this.m_dataPanel.innerPanel;
        if(inner.items != undefined)
        {
            for(var i=0; i<inner.items.getCount(); i++)
            {
                var child = inner.items.itemAt(i);

                if(child != undefined)
                {
                    if(child.fixHeight == undefined)
                        child.setSize(w-this.m_leftWidth-43, 180);
                    else
                        child.setSize(w-this.m_leftWidth-43, child.fixHeight);
                }
            }
        }
    },


    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    f_createMainPanel: function(panelName, forLoginPanel)
    {
        if(forLoginPanel != undefined && forLoginPanel)
        {
            this.m_leftWidth = 0;
            this.m_topHeight = 0;
        }
        else
        {
            this.m_leftWidth = 200;
            this.m_topHeight = 45;
        }

        /////////////////////////////////////////////
        // create open appliance panel
        var tPanel = this.f_createTopPanel(panelName);
        var lPanel = this.f_createLeftPanel(panelName);
        var dPanel = this.f_createDataPanel(panelName);

        ///////////////////////////////////////////////
        // this panel contain the vpanel and wPanel
        var ipanel = new Ext.Panel(
        {
            layout: 'column'
            ,border: false
            ,width: 600
            ,height: 200
            ,split: true
            ,items: [lPanel, dPanel]
        });

        var panel = new Ext.Panel(
        {
            border: false
            ,split: true
            ,height: 300
            ,width: 800
            ,bodyStyle: 'padding: 0px 15px 5px 5px'
            ,items: [ tPanel, ipanel ]
        });


        lPanel.parentPanel = ipanel;
        dPanel.parentPanel = ipanel;

        this.m_mainPanel = panel;
        this.m_topPanel = tPanel;
        this.m_leftPanel = lPanel;
        this.m_dataPanel = dPanel;

        var f_resizeChildPanels = function()
        {
        }

        this.f_addPanelResizeListener(panel, f_resizeChildPanels);

        return panel;
    },

    f_addPanelResizeListener: function(resizePanel, callback)
    {
        resizePanel.on({'bodyresize':
        {
            fn: function(p, w, h)
            {
                callback.call();
            }
        }
        });
    },

    ////////////////////////////////////////////////////////////////////////////
    f_createTopPanel: function(panelName)
    {
        var panel = new Ext.Panel(
        {
            autoWidth: true
            ,height: this.m_topHeight
            ,boder: false
            ,bodyBorder: false
            ,bodyStyle: 'padding: 2px'
        });

        return panel;
    },

    ////////////////////////////////////////////////////////////////////////////
    f_createLeftPanel: function(panelName)
    {
        var vertPanel = new Ext.Panel(
        {
            border: false
            ,width: this.m_leftWidth
            ,height: 100
            ,autoScroll: false
            ,defaults: { autoScroll: false }
        });

        return vertPanel;
    },

    ////////////////////////////////////////////////////////////////////////////
    f_createDataPanel: function(panelName)
    {
        var innerPanel = new Ext.Panel(
        {
            border: false
            ,split: true
            ,defaults: {autoScroll: true}
            ,bodyStyle: 'padding: 0px 0px 0px 0px'
            ,width: 500
            ,height: 250
        });
        innerPanel.setSize(500, 250);

        var showBorder = (panelName == 'login') ? undefined : 'v-panel-body';
        var datapanel = new Ext.Panel(
        {
            id: Ext.id()
            ,border: false
            ,bodyStyle: 'padding: 3px 0px 0px 15px'
            ,cls: showBorder
            ,defaults: {autoScroll: true}
            ,items: [innerPanel ]
        });
        datapanel.innerPanel = innerPanel;

        return datapanel;
    },

    f_createDataPanelNoteMessage: function()
    {
        var msg = '<font color=red><b>* Note: </b></font>' +
                    '<font size=1 color=blue>Please click on the desired ' +
                    'cell to enter new value.</font>';

        var label = new MyLabel(
        {
            border: false
            ,height: 32
            ,width: 400
            ,html: msg
            ,bodyStyle: 'padding: 10px 0px 10px 10px'
        });

        return label
    },

    f_createEditorGridPanel: function(opObject, store, columns, plugins, 
                        expandColName, headerTitle)
    {
        var gridView = new Ext.grid.GridView(
        {
            id: Ext.id()
            ,enableRowBody: false
            ,forceFit: true
            ,borderWidth: 0
        });
        //gridView.scrollOffset = 0;

        var grid = new Ext.grid.EditorGridPanel(
        {
            store: store
            ,title: headerTitle
            //,columns: columns
            ,cm: columns
            ,stripeRows: false
            ,autoExpandColumn:expandColName
            ,height: 130
            ,width: 600
            ,border: true
            ,bodyBorder: true
            ,viewConfig: { forceFit: true, borderWidth: 0 }
            ,view: gridView
            ,plugins: plugins
            ,clicksToEdit:1
            ,defaults: { autoScroll: true }
        });
        opObject.grid = grid;
        grid.gridView = gridView;
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
    },

    f_createGridPanel: function(store, columns, plugins, expandColName,
                      buttons, headerTitle)
    {
        var gridView = new Ext.grid.GridView(
        {
            enableRowBody: false
            ,forceFit: true
            //,borderWidth: 0
        });
        //gridView.scrollOffset = 0;

        var grid = new Ext.grid.GridPanel(
        {
            store: store
            ,title: headerTitle
            ,cm: columns
            ,stripeRows: false
            ,autoExpandColumn: expandColName
            ,border: true
            ,height: 130
            ,maxHeight: 200
            ,autoWidth: true
            ,bodyBorder: true
            ,viewConfig: { forceFit: true, enableRowBody: false }
            ,view: gridView
            ,plugins: plugins
            ,enableColumnHide: true
            ,enableHideMenu: false
            ,defaults: { autoScroll: true }
            ,buttons: buttons
            ,buttonAlign: 'right'
        });
        grid.isGrid = true;

        return grid;
    }
});

