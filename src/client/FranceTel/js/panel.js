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
    // m_centerPanel
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
        if(this.m_centerPanel != undefined &&
            this.m_centerPanel.dataPanel != undefined)
        {
            while(this.m_centerPanel.dataPanel.items &&
                this.m_centerPanel.dataPanel.items.getCount() > 0)
                this.m_centerPanel.dataPanel.remove(
                    this.m_centerPanel.dataPanel.items.itemAt(0));

            if(this.m_centerPanel.dataPanel.el != undefined)
                this.f_resizeGridPanel(this.m_centerPanel.dataPanel.getInnerWidth());

            for(var i=0; i<panels.length; i++)
                this.m_centerPanel.dataPanel.add(panels[i]);

            this.f_resizePanels(this.m_bodyPanel);
            this.m_centerPanel.dataPanel.doLayout();
        }
    },
    f_updateDataPanelLabel: function(topLabelString, leftLeftString)
    {
        var str = String.format(topLabelString);
        this.m_centerPanel.lable.setText(str);

    },

    f_getDataPanel: function()
    {
        return this.m_centerPanel.dataPanel;
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
            this.m_centerPanel.setSize(w-this.m_leftWidth-5, h-this.m_topHeight);
            this.m_centerPanel.dataPanel.setSize(w-this.m_leftWidth-70, h-this.m_topHeight-40);
            this.f_resizeGridPanel(w);
        }
    },

    f_resizeGridPanel: function(w)
    {
        if(this.m_centerPanel.dataPanel.items != undefined &&
                this.m_centerPanel.dataPanel.items.getCount() > 0)
        {
            var p = this.m_centerPanel.dataPanel.items.itemAt(0);

            if(p != undefined && p.isGrid != undefined)
                p.setSize(w-this.m_leftWidth-70-20, 220);
        }
    },


    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    f_createMainPanel: function(panelName)
    {
        /////////////////////////////////////////////
        // create open appliance panel
        var hPanel = this.f_createTopPanel(panelName);
        var vPanel = this.f_createLeftPanel(panelName);
        var cPanel = this.f_createCenterPanel(panelName);

        ///////////////////////////////////////////////
        // this panel contain the vpanel and wPanel
        var ipanel = new Ext.Panel(
        {
            layout: 'column'
            ,border: false
            ,width: 600
            ,height: 200
            ,split: true
            ,items: [vPanel, cPanel]
        });

        var panel = new Ext.Panel(
        {
            border: false
            ,split: true
            ,height: 300
            ,width: 800
            ,bodyStyle: 'padding: 0px 15px 5px 5px'
            ,items: [ hPanel, ipanel ]
        });
        

        vPanel.parentPanel = ipanel;
        cPanel.parentPanel = ipanel;

        this.m_mainPanel = panel;
        this.m_topPanel = hPanel;
        this.m_leftPanel = vPanel;
        this.m_centerPanel = cPanel;

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
        this.m_topHeight = 45;

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
        this.m_leftWidth = 200;

        var vertPanel = new Ext.Panel(
        {
            border: false
            ,width: this.m_leftWidth
            ,height: 100
            ,autoScroll: false
        });

        return vertPanel;
    },

    ////////////////////////////////////////////////////////////////////////////
    f_createCenterPanel: function(panelName)
    {
        var title = panelName == undefined ? ' ' : panelName;

        var lable = new MyLabel(
        {
            border: false
            ,bodyStyle: 'padding: 10px 0px 0px 0px'
            ,height: 33
            ,width: 500
            ,cls: 'vHeaderLabel'
            ,html: title
        });

        var lablePanel = new Ext.Panel(
        {
            border: false
            ,autoWidth: true
            ,height: 35
            ,bodyStyle: 'padding: 0px 0px 0px 0px'
            ,items: lable
        });

        var dummy = new Ext.Panel(
        {
            id: Ext.id()
        });

        var dataPanel = new Ext.Panel(
        {
            border: false
            ,split: true
            ,defaults: {autoScroll: true}
            ,bodyStyle: 'padding: 0px 0px 0px 0px'
            ,width: 500
            ,height: 250
            ,items: [dummy]
        });
        dataPanel.setSize(500, 250);

        var cpanel = new Ext.Panel(
        {
            id: Ext.id()
            //,layout: 'ux.row'
            ,border: true
            ,bodyStyle: 'padding: 3px 0px 0px 15px'
            ,defaults: {autoScroll: true}
            ,items: [ lablePanel, dataPanel ]
        });
        cpanel.dataPanel = dataPanel;
        cpanel.lable = lable;

        dataPanel.grace = 'Grace is my future wife';
        return cpanel;
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
    }
});
