/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


VYATTA_panels = Ext.extend(Ext.util.Observable,
{
    ///////////////////////////////////////////////////////////////////////////
    // data members....
    // m_tabName = status/diagnostics/configuration/operation
    // m_topPanel
    // m_leftPanel
    // m_datePanel
    // m_editorPanel
    // m_parentPanel
    // m_container
    // m_treeObj
    f_initPanelDataType: function(parentContainer, tabName)
    {
        this.m_helpIndex = 3;
        this.m_container = parentContainer;
        this.m_tabName = tabName;
        this.m_viewerValues = [ 'Key Components', 'Completed Hierarchical']
    },

    ////////////////////////////////////////////////////////////////////////////
    f_initLayout: function()
    {
        if(this.m_tabName != V_TREE_ID_login)
            this.f_initTree();

        this.m_topPanel = this.f_createTopPanel();
        this.m_leftPanel = this.f_createLeftPanel();
        this.m_dataPanel = this.f_createDataPanel();

        ///////////////////////////////////////////////
        // this panel contain the lpanel and dPanel
        var ipanel = new Ext.Panel(
        {
            layout: 'column'
            ,border: false
            ,autoHeight: true
            ,width: 1000
            ,split: true
            ,items: [this.m_leftPanel, this.m_dataPanel]
        });

        this.m_parentPanel = new Ext.Panel(
        {
            border: false
            ,split: true
            ,autoHeight: true
            ,autoWidth: true
            ,items: [ this.m_topPanel, ipanel ]
        });
        this.m_parentPanel.iPanel = ipanel;


        this.m_container.add(this.m_parentPanel);
        this.f_updatePanels();
        this.m_container.doLayout(true);

/*/
        var resizePanels = function(comp)
        {
            comp.childPanel.f_resizePanels();
        }

        this.m_container.childPanel = this;
        this.m_container.on( {'resize':
        {
            fn: function() {resizePanels(this)}}
        });
        */
    },

    f_showPanel: function(show)
    {
        //var c = this.m_container;

//        while(c.items.getCount() > 0)
  //          c.items.remove(c.items.itemAt(0));

        if(show)
        {
            this.m_treeObj.f_setThisTreeObj(this.m_treeObj);
            this.m_parentPanel.show();
            this.f_resizePanels();
            //this.m_parentPanel.doLayout();
        }
        else
        {
            this.m_parentPanel.hide();
        }
        //c.doLayout(true);
    },

    f_updatePanels: function()
    {
        this.f_resizePanels();
        this.m_topPanel.doLayout();
        this.m_leftPanel.doLayout();
        this.m_dataPanel.doLayout();
    },

    f_updateLeftPanel: function(childPanel)
    {
        var lp = this.m_leftPanel;

        if(lp.items != undefined && lp.items.getCount() > 0)
            lp.remove(lp.items.itemAt(0));

        lp.add(childPanel);
        lp.doLayout();
    },

    f_resizePanels: function()
    {
        if(this.m_container != undefined)
        {
            var h = this.m_container.getSize().height-this.m_topPanel.height;
            var w = this.m_container.getSize().width;
            this.m_topPanel.width = w;

            this.m_topPanel.setSize(w, this.m_topPanel.height);
            this.f_resizeLeftPanel(w, h);
            this.f_resizeDataPanel(w, h);
            this.m_parentPanel.iPanel.setSize(w, h - this.m_topPanel.height);
        }
    },

    f_resizeLeftPanel: function(w, h)
    {
        var lp = this.m_leftPanel;

        lp.setSize(lp.width, h);

        if(this.m_treeObj != undefined)
            this.m_treeObj.f_resizeTreePanel(lp.width, h);
    },

    f_resizeDataPanel: function(w, h)
    {
        var lp = this.m_leftPanel;

        this.m_dataPanel.setSize(w-lp.width, h);
        this.m_editorPanel.setSize(w-lp.width-20, h);

        if(this.m_editorPanel.items != undefined &&
            this.m_editorPanel.items.getCount() > 0)
        {
            var fPanel = this.m_editorPanel.items.itemAt(0);
            fPanel.setSize(w-lp.width-21, h-7);
        }
    },

    ////////////////////////////////////////////////////////////////////////////
    f_createTopPanel: function()
    {
        var cbpanel = f_createTopPanelViewPanel(this);
        this.m_toolbar = f_createToolbar(this);
        var items = this.m_tabName == V_TREE_ID_login ? null :
                    [ cbpanel, this.m_toolbar ];

        var topPanel = new Ext.Panel(
        {
            autoWidth: true
            ,layout: 'column'
            ,height: 26
            ,width: 195
            ,boder: false
            ,bodyBorder: false
            ,bodyStyle: 'padding: 2px'
            ,cls: 'v-panel-with-background-color'
            ,items: items
        });
        topPanel.height = 26;

        var tp = this.m_toolbar;
        var resizePanels = function(comp)
        {
            tp.setSize(comp.getSize().width - 38 - 170);
        }

        topPanel.on( {'resize':
        {
            fn: function() {resizePanels(this)}}
        });

        return topPanel;
    },

    ////////////////////////////////////////////////////////////////////////////
    f_createLeftPanel: function()
    {
        var tree = this.m_treeObj != undefined ? this.m_treeObj.m_tree : null;

        var vertPanel = new Ext.Panel(
        {
            cls: 'v-panel-with-background-color'
            ,border: false
            ,width: 250
            ,height: 100
            ,autoScroll: false
            ,defaults: { autoScroll: true }
            ,bodyStyle: 'padding: 10px 2px 10px 8px'
            ,items: tree
        });
        vertPanel.width = 250;

        return vertPanel;
    },

    ////////////////////////////////////////////////////////////////////////////
    f_createDataPanel: function()
    {
        this.f_createEditorPanel();
        this.m_editorPanel.setSize(500, 250);

        //var showBorder = (panelName == 'login') ? undefined : 'v-data-panel-body';
        var datapanel = new Ext.Panel(
        {
            border: false
            ,bodyStyle: 'padding: 3px 0px 0px 15px'
            ,cls: 'v-data-panel-body'
            ,defaults: {autoScroll: true}
            ,items: [this.m_editorPanel ]
        });

        return datapanel;
    },

    f_createEditorPanel: function()
    {
        this.m_editorPanel = new Ext.Panel(
        {
            margins: '5 5 5 0'
            ,border: false
            ,cls: 'v-border-less'
            ,collapsible: false
        });
    },

    f_cleanEditorPanel: function()
    {
        var ep = this.m_editorPanel;

        while(ep != undefined && ep.items != undefined && ep.items.getCount() > 0)
        {
            var old = ep.items.itemAt(0);
            ep.remove(old);
            delete old;
        }
    },

    f_getTextAreaFieldByHeaderName: function(headerName)
    {
        var fp = this.m_editorPanel.items.itemAt(0);

        if(fp != undefined)
        {
            for(var i=0; i<fp.items.getCount() > 0; i++)
            {
                var fd = fp.items.itemAt(i);
                if(fd.getXType() == 'panel' && headerName.indexOf(fd.title) > -1)
                {
                    fd = fd.items.itemAt(0);
                    if(fd.getXType() == 'textarea')
                        return fd;
                }
            }
        }

        return undefined;
    },

    ////////////////////////////////////////////////////////////////////////////
    f_initTree: function()
    {
        /////////////////////////////////////////////////
        // init tree object
        this.m_treeObj = new VYATTA_tree(this.m_tabName);
        this.m_treeObj.f_createTree(this);
        this.m_treeObj.m_tree.show();
    }


});

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function f_createFieldDirtyIndicatorPanel(node)
{
    var img = getNodeStyleImage(node);

    var dirtyPanel = new Ext.Panel(
    {
        border: false
        ,width: 18
        ,bodyStyle: 'padding: 3px 2px, 1px, 3px'
        ,html: img
    });

    return dirtyPanel;
}

function f_createNumberField(value, node, help, width, callback)
{
    var label = node.text;

    var keyupPressHandler = function(field, e)
    {
        f_enterKeyPressHandler(field, e, callback);
    }

    var field = new Ext.form.NumberField(
    {
        width: width,
        allowNegative: false,
        allowDecimals: false,
        maxValue: (Math.pow(2, 32) - 1),
        maskRe: /^\d+$/,
        value: value,
        onChange: keyupPressHandler//function(e, n, o){ alert('onChange num ' + e.getKey()); },
        ,onBlur: callback
    });

    field.on('keyDown', keyupPressHandler);

    var colLayout = new Ext.Panel(
    {
        layout: 'column'
        ,border: false
        ,style: 'padding:5px'
        ,width: 800
        ,items: [ f_createLabel(label, V_LABEL_LABEL),
                  field,
                  f_createFieldDirtyIndicatorPanel(node), f_createLabel(help +
                  '. <font color=red><small>'+
                  'Goto next input field or press ENTER to submit</small></font>'
                  , V_LABEL_HELP) ]
    });


    return colLayout;
}

function f_createTextField(value, labelStr, helpStr, width, callback, node)
{
    var field = new Ext.form.TextField(
    {
        labelSeparator: ''
        ,width: width
        ,value: value
        ,enableKeyEvents: true
        ,onBlur: callback
    });

    var keyupPressHandler = function(field, e)
    {
        f_enterKeyPressHandler(field, e, callback);
    }

    field.on('keyup', keyupPressHandler);

    var colLayout = new Ext.Panel(
    {
        layout: 'column'
        ,border: false
        ,style: 'padding:5px'
        ,width: 800
        ,items: [ f_createLabel(labelStr, V_LABEL_LABEL),
                    field,
                    f_createFieldDirtyIndicatorPanel(node),
                    f_createLabel(helpStr + '. <font color=red><small>' +
                    'Goto next input field or press ENTER to submit</small></font>'
                    , V_LABEL_HELP) ]
    });

    return colLayout;
}

function f_createCombobox(values, ival, emptyText, labelStr, width, helpStr,
                            isEditable, callback, node)
{
      var field = new Ext.form.ComboBox(
      {
          mode: 'local',
          store: values,
          displayField: 'value',
          emptyText: emptyText,
          labelSeparator: '',
          editable: isEditable,
          triggerAction: 'all',
          selectOnFocus: true,
          width: width,
          value: ival,
          hideParent: true
      });

      field.on('collapse', callback);

      ////////////////////////////////////////
      // for some reasons, a combo box must
      // another contains in before it can
      // be put in the 'column' layout panel.
      // if directly put in a column panel,
      // the drop down does not work properly
      var fPanel = new Ext.Panel(
      {
          width: width+1
          ,border: false
          ,items: [field]
      });

      var colLayout = new Ext.Panel(
      {
          layout: 'column'
          ,border: false
          ,style: 'padding:5px'
          ,width: 800
          ,items: [ f_createLabel(labelStr, V_LABEL_LABEL),
                    fPanel, f_createFieldDirtyIndicatorPanel(node),
                    f_createLabel(helpStr, V_LABEL_HELP) ]
      });

      return colLayout;
}

function f_createCheckbox(value, node, helpStr, width, callback)
{
    var labelStr = node.text;

    var field = new Ext.form.Checkbox(
    {
        style: 'anchor: 0%, text-align:right, padding:20px'
        ,checked: false
        ,onClick: callback
    });

    if(value != undefined && (value == 'enable' || value == 'true'))
        field.setValue(true);
    else if(value != undefined && (value == 'diable' || value == 'false'))
        field.setValue(false);

    //////////////////////////////////////////////
    // need this panel to align the help labels
    var fPanel = new Ext.Panel(
    {
        width: width+1
        ,border: false
        ,items: [field]
    });

    var colLayout = new Ext.Panel(
    {
        layout: 'column'
        ,border: false
        ,style: 'padding:5px'
        ,width: 800
        ,items: [ f_createLabel(labelStr, V_LABEL_LABEL), fPanel,
                  f_createFieldDirtyIndicatorPanel(node),
                  f_createLabel(helpStr, V_LABEL_HELP) ]
    });

    return colLayout;
}

function f_isPanelEmpty(panel)
{
    if(panel.items != undefined && panel.items.getCount() > 0)
        return false;
    else
        return true;
}

function f_handleHelpButton(panel, helpbutton)
{
    f_toggleHelpTips(helpbutton);

    if(panel == undefined || panel.m_editorPanel == undefined ||
        panel.m_editorPanel.items == undefined) return;

    var fPanel = panel.m_editorPanel.items.itemAt(0);
    for(var i=0; i<fPanel.items.getCount(); i++)
    {
        var rPanel = fPanel.items.itemAt(i);
        if(rPanel == undefined) return;

        var helpLabel = rPanel.items.itemAt(panel.m_helpIndex);
        if(helpLabel != undefined)
        {
            if(f_getHelpTipsState() == V_HELP_OFF)
                helpLabel.show();
            else
                helpLabel.hide();
        }
    }
}

function f_createTopPanelViewPanel(thisObj)
{
    var label = new Ext.form.Label(
    {
        text: 'View:'
        ,cls: 'vlabel_right'
        ,width: 38
        ,boder: false
        ,position: 'fixed'
    });

    var field = new Ext.form.ComboBox(
    {
        mode: 'local',
        emptyText: 'Select a target to back',
        fieldLabel: 'View:',
        store: thisObj.m_viewerValues,
        displayField: 'value',
        labelSeparator: '',
        editable: false,
        triggerAction: 'all',
        selectOnFocus: true,
        height: 23,
        width: 150,
        value: thisObj.m_viewerValues[0],
        hideParent: true
    });
    var onCollapseCallback = function()
    {

    };
    field.on('collapse', onCollapseCallback);

    var cbpanel = new Ext.Panel(
    {
        autoWidth: true
        ,layout: 'column'
        ,height: 28
        ,width: 192
        ,maxWidth: 192
        ,boder: false
        ,bodyBorder: false
        ,bodyStyle: 'padding: 2px'
        ,cls: 'v-panel-with-background-color'
        ,items: [ label, field ]
    });

    return cbpanel;
}

function f_createToolbar(panel)
{
    var f_helpButtonHandler = function()
    {
        f_handleHelpButton(panel, m_helpTipButton)
    }
    var m_helpTipButton = f_createHelpTipsButton(f_helpButtonHandler);

    var ePanel = new Ext.Panel(
    {
        margins: '5 5 5 0'
        ,bodyStyle: 'padding:10px 2% 0px 2%'
        ,cls: 'v-border-less'
        ,collapsible: false
        ,border: false
        ,bodyBorder: false
        ,tbar:
        [ '->',
          m_helpTipButton,
          '-',
          new Ext.Action(
          {
              text: 'View'
              ,border: false
              ,handler: function() {f_sendCLICommand(['view'], panel.m_treeObj);}
          }),
          new Ext.Action(
          {
              text: 'Load'
              ,border: false
              ,handler: function() {f_sendCLICommand(['load'], panel.m_treeObj);}
          }),
          new Ext.Action(
          {
              text: 'Save'
              ,handler: function() {f_sendCLICommand(['save'], panel.m_treeObj);}
          }),
          '-',

          new Ext.Action(
          {
              text: 'Undo'
              ,handler: function() {f_sendCLICommand(['undo']);}
          }),
          new Ext.Action(
          {
              text: 'Redo'
              ,handler: function() {f_sendCLICommand(['redo']);}
          }),
          '-',

          new Ext.Action(
          {
            text: 'Discard',
            handler: function(){f_sendCLICommand(['discard'], panel.m_treeObj);}
          }),
          new Ext.Action(
          {
            text: 'Commit'
            ,handler: function() {f_sendCLICommand(['commit'], panel.m_treeObj);}
          }),
        ]
    })

    return ePanel;
}

function f_addField2Panel(editorPanel, fields, labelTxt)
{
    if(editorPanel != undefined && fields != undefined &&
        !f_isPanelEmpty(editorPanel))
    {
        var eFormPanel = editorPanel.items.itemAt(0);
        eFormPanel.add(fields);
        eFormPanel.doLayout();
    }
    else
    {
        var fieldP = new Ext.form.FormPanel(
        {
            fieldLabel: labelTxt
            ,autoScroll: true
            ,autoHeight: false
            ,bodyBorder: false
            ,align: 'center'
            ,items: fields
        });

        editorPanel.add(fieldP);
        fieldP.setSize(editorPanel.getSize().width, editorPanel.getSize().height-7);
    }

    if(f_getHelpTipsState() == V_HELP_ON)
    {
        if(fields.items != undefined)
        {
          var helpLabel = fields.items.itemAt(2);
          if(helpLabel != undefined)
            helpLabel.hide();
        }
    }
}

function f_getEditGridValues(gridStore)
{
    var ret = [ ];
    var jj = 0;
    for (var i = 0; i < gridStore.getCount(); i++)
    {
        var val = gridStore.getAt(i).get('value');
        if(val.length > 0)
            ret[jj++] = val;
    }

    return ret;
}

function f_createEditGrid(values, gridStore, record, node, helpLabel, width, callback)
{
    var label = node.text;

    for(var i=0; i < values.length; i++)
    {
        var v = new record({ value: values[i] });
        gridStore.add(v);
    }

    var count = gridStore.getCount();
    for(var i=0; i<50-count; i++)
        gridStore.loadData([ '' ], true);

    var grid = new Ext.grid.EditorGridPanel(
    {
        store: gridStore,
        tooltip: 'Click on Add button to add value.\nOr Delete button to delete value',
        border: true,
        autoScroll: true,
        clicksToEdit: 1,
        width: width,
        height: 200,
        sm: new Ext.grid.RowSelectionModel({ singleSelect: true }),
        stripeRows: true,
        columns:
        [
          { id: 'value',
            header: 'Value',
            width: width-20,
            sortable: false,
            dataIndex: 'value',
            editor: new Ext.form.TextField({ })
          }
        ]
    });
    grid.on('afteredit', callback );

    var colLayout = new Ext.Panel(
    {
        layout: 'column'
        ,border: false
        ,style: 'padding:5px'
        ,width: 800
        ,items: [ f_createLabel(label, V_LABEL_LABEL), grid,
                f_createFieldDirtyIndicatorPanel(node),
                f_createLabel(helpLabel, V_LABEL_HELP) ]
    });

    return colLayout
}

function f_createLabel(value, labelFor)
{
    var lAlign = 'label_center';
    var width = 200;

    if(labelFor == V_LABEL_HELP)
    {
        lAlign = 'vlabel_left';
        width = 250;
        value = value + '.';
    }
    else if(labelFor == V_LABEL_LABEL)
    {
        lAlign = 'vlabel_right';
        width = 200;
        value = value + ': ';
    }

    var label = new Ext.form.Label(
    {
        html: value
        ,cls: lAlign
        ,position: 'fixed'
        ,width: width
    });

    return label
}

function f_createTextAreaField(headerTitle, values, width, height)
{
    var field = new Ext.form.TextArea(
    {
        mode: 'local'
        ,border: false
        ,width: width  //600,
        ,height: height // 500
        ,style: 'font-family:monospace'
        ,value: values
    });

    var colLayout = new Ext.Panel(
    {
        layout: 'ux.row'
        ,title: headerTitle
        ,border: true
        ,style: 'padding:5px'
        ,width: width+2
        ,autoScroll: false
        ,items: [ field ]
    });

    return colLayout;
}

function f_enterKeyPressHandler(field, e, callback)
{
    //////////////////////////////////////////////////
    // check for ENTER key to trigger the 'login'
    // button
    if(e.getKey() == 13)
        callback.call();
}