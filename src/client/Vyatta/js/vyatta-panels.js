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
    constructor: function(parentContainer, name)
    {
        this.m_container = parentContainer;
        this.m_tabName = name;
    },

    f_initPanelDataType: function(parentContainer, tabName)
    {
        this.m_helpIndex = 3;
        this.m_viewerValues = [ 'Key Components', 'Completed Hierarchical']

        if(parentContainer != undefined)
            this.m_container = parentContainer;

        if(tabName != undefined)
            this.m_tabName = tabName;
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
            ,items: [this.m_topPanel, ipanel ]
        });
        this.m_parentPanel.iPanel = ipanel;

        this.m_container.add(this.m_parentPanel);
        this.f_updatePanels();
        this.m_container.doLayout();
    },

    f_showPanel: function(show)
    {
        if(show)
        {
            this.m_treeObj.f_setThisTreeObj(this.m_treeObj);
            this.m_parentPanel.show();
            this.f_resizePanels();
        }
        else
            this.m_parentPanel.hide();
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
            ,boder: false
            ,bodyBorder: false
            ,bodyStyle: 'padding: 2px'
            ,cls: 'v-panel-with-background-color'
            ,items: items
        });
        topPanel.height = 26;
        topPanel.cbpanel = cbpanel;

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
        return new Ext.Panel(
        {
            border: false
            ,bodyStyle: 'padding: 3px 0px 0px 15px'
            ,cls: 'v-data-panel-body'
            ,defaults: {autoScroll: true}
            ,items: [this.m_editorPanel ]
        });
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
        this.m_editorPanel.m_treeObj = this.m_treeObj;
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

    f_getEditorTitle: function()
    {
        if(this.f_getEditorItemCount() > 0)
        {
            var ep = this.m_editorPanel;
            var eFormPanel = ep.items.itemAt(0);
            return eFormPanel.items.itemAt(0).title;
        }

        return '';
    },

    f_getEditorItemCount: function()
    {
        var ep = this.m_editorPanel;

        if(ep != undefined && ep.items != undefined && ep.items.getCount() > 0)
        {
            var eFormPanel = ep.items.itemAt(0);
            return eFormPanel.items.getCount();
        }

        return 0;
    },

    f_getEditorTitleCompByHeaderName: function(headerName)
    {
        if(this.m_editorPanel.items != undefined)
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
    },

    f_onTreeRenderer: function(tree)
    {
        return;

        f_updateToolbarButtons(tree);
    }
});

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function f_createFieldDirtyIndicatorPanel(node)
{
    var p = new Ext.Panel(
    {
        border: false
        ,bodyBorder: true
        ,width: 20
        ,height: 22
        ,html: V_DIRTY_FLAG
    });

    var img = getNodeStyleImage(node);
    if(img.length > 0) p.show(); else p.hide();

    return p;
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

    var p = new Ext.Panel(
    {
        layout: 'column'
        ,border: false
        ,style: 'padding:5px'
        ,width: 800
        ,items: [ f_createLabel(label, V_LABEL_LABEL),
                  field,
                  f_createFieldDirtyIndicatorPanel(node), f_createLabel(help
                  , V_LABEL_HELP) ]
    });
    p.m_node = node;

    return p;
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

    var p = new Ext.Panel(
    {
        layout: 'column'
        ,border: false
        ,style: 'padding:5px'
        ,width: 800
        ,items: [ f_createLabel(labelStr, V_LABEL_LABEL),
                    field,
                    f_createFieldDirtyIndicatorPanel(node),
                    f_createLabel(helpStr, V_LABEL_HELP) ]
    });
    p.m_node = node;
    node.m_inputPanel = p;

    return p;
}

function f_createCombobox(values, ival, emptyText, labelStr, width, helpStr,
                            isEditable, callback, node)
{
      var field = new Ext.form.ComboBox(
      {
          id: this.m_tabName,
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

      var p = new Ext.Panel(
      {
          layout: 'column'
          ,border: false
          ,style: 'padding:5px'
          ,width: 800
          ,items: [ f_createLabel(labelStr, V_LABEL_LABEL),
                    fPanel, f_createFieldDirtyIndicatorPanel(node),
                    f_createLabel(helpStr, V_LABEL_HELP) ]
      });
      p.m_node = node;

      return p;
}

function f_getValueForCheckbox(value)
{
    return (value != undefined && (value == 'enable' || value == 'true')) ?
                true : false;
}
function f_createCheckbox(value, node, helpStr, width, callback)
{
    var labelStr = node.text;
    var chk = f_getValueForCheckbox(value);

    var field = new Ext.form.Checkbox(
    {
        style: 'anchor: 0%, text-align:right, padding:20px'
        ,checked: chk
        ,onClick: callback
    });

    //////////////////////////////////////////////
    // need this panel to align the help labels
    var fPanel = new Ext.Panel(
    {
        width: width+1
        ,border: false
        ,items: [field]
    });

    var p = new Ext.Panel(
    {
        layout: 'column'
        ,border: false
        ,style: 'padding:5px'
        ,width: 800
        ,items: [ f_createLabel(labelStr, V_LABEL_LABEL), fPanel,
                  f_createFieldDirtyIndicatorPanel(node),
                  f_createLabel(helpStr, V_LABEL_HELP) ]
    });
    p.m_node = node;

    return p;
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

        var helpLabel = rPanel.items == undefined ? undefined :
                        rPanel.items.itemAt(panel.m_helpIndex);
        if(helpLabel != undefined)
        {
            if(f_getHelpTipsState() == V_HELP_OFF)
                helpLabel.show();
            else
                helpLabel.hide();
        }
    }
}

function f_createComboBox(thisObj)
{
    return new Ext.form.ComboBox(
    {
        mode: 'local',
        store: thisObj.m_viewerValues,
        displayField: 'value',
        editable: false,
        triggerAction: 'all',
        selectOnFocus: true,
        height: 23,
        width: 150,
        hideLabel: false,
        hideTrigger: false,
        hideParent: false,
        value: thisObj.m_viewerValues[1]
    });
}
function f_createTopPanelViewPanel(thisObj)
{
    var field = f_createComboBox(thisObj);
    return new Ext.Panel(
    {
        autoWidth: true
        ,height: 28
        ,width: 192
        ,maxWidth: 200
        ,boder: false
        ,bodyBorder: false
        ,collapsible: false
        ,cls: 'v-panel-with-background-color'
        //,cls: 'v-border-less'
        ,tbar: [ 'View: ', field ]
    });
}

function f_createToolbar(panel)
{
    var f_helpButtonHandler = function()
    {
        f_handleHelpButton(panel, m_helpTipButton)
    }
    var m_helpTipButton = f_createHelpTipsButton(f_helpButtonHandler);

    return new Ext.Panel(
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
          panel.m_viewBtn = f_createToolbarButton('v_view_button', 'view', panel.m_panelObj),
          panel.m_loadBtn = f_createToolbarButton('v_load_button', 'load', panel.m_panelObj),
          panel.m_saveBtn = f_createToolbarButton('v_save_button', 'save', panel.m_treeObj),
          '-',
          panel.m_undoBtn = f_createToolbarButton('v_undo_button', 'undo', panel.m_treeObj),
          panel.m_redoBtn = f_createToolbarButton('v_redo_button', 'redo', panel.m_treeObj),
          '-',
          panel.m_discardBtn = f_createToolbarButton('v_discard_button',
                              'discard', panel.m_treeObj),
          panel.m_commitBtn = f_createToolbarButton('v_commit_button',
                                'commit', panel.m_treeObj)
        ]
    });
}

function f_createToolbarButton(iconCls, cmdName, treeObj)
{
    return new Ext.Action(
    {
        text: ' '
        ,iconCls: iconCls
        ,handler: function() 
        {
            if(cmdName == 'save')
            {
                f_getUploadDialog().show();
                return;
            }

            f_sendCLICommand(this, [cmdName], treeObj);
        }
    });
}
function f_updateToolbarButtons(tree)
{
    tree.m_parent.m_commitBtn.setIconClass(tree.m_isCommitAvailable ?
                    'v_commit_button' : 'v_commit_button_no');
    tree.m_parent.m_discardBtn.setIconClass(tree.m_isCommitAvailable ?
                    'v_discard_button' : 'v_discard_button_no');
    tree.m_parent.m_undoBtn.setIconClass(tree.m_isCommitAvailable ?
                    'v_undo_button' : 'v_undo_button_no');
    tree.m_parent.m_redoBtn.setIconClass(tree.m_isCommitAvailable ?
                    'v_redo_button' : 'v_redo_button_no');
}

function f_sendCLICommand(button, cmds, treeObj)
{
    if(button.iconCls.indexOf('_no') > 0)
        return;

    f_sendConfigCLICommand(cmds, treeObj);
}

//////////////////////////////////////////////////////////////////
// if fields are already in panel, update it and return false. else
// do nothing and return true
function f_updateFieldValues2Panel(editorPanel, fields, labelTxt)
{
    if(editorPanel == undefined || f_isPanelEmpty(editorPanel) || fields == undefined)
        return true;

    var eFormPanel = editorPanel.items.itemAt(0);

    if(eFormPanel.items == undefined) return true;
    var len = eFormPanel.items.getCount();

    ///////////////////////////////
    // walk the form editor.
    for(var i=0; i<len; i++)
    {
        var f = eFormPanel.items.itemAt(i);
        if(f.items != undefined && fields.items != undefined)
        {
            var label = f.items.itemAt(V_IF_INDEX_LABEL);
            var cLabel = fields.items.itemAt(V_IF_INDEX_LABEL);

            ///////////////////////////////////////////////////////
            // if the below statement is true, the fields already
            // exist. Update the dirty flag if neccessary
            if(label != undefined && label.getXType() == 'label' &&
                label.html == cLabel.html)
            {
                var setField = editorPanel.m_treeObj.m_setField;

                ////////////////////////////////////////
                // handle field dirty indicator
                if(getNodeStyleImage(fields.m_node).length > 0 ||
                    (setField != undefined &&
                    setField.items.itemAt(V_IF_INDEX_LABEL).html == label.html))
                {
                    f.items.item(V_IF_INDEX_DIRTY).show();

                    ///////////////////////////////////////////
                    // update checkbox renderer. only for checkbox component
                    if(f.items.itemAt(V_IF_INDEX_INPUT).items != undefined)
                    {
                        var chk = f.items.itemAt(V_IF_INDEX_INPUT).items.itemAt(0);
                        if(chk.getXType() == 'checkbox')
                        {
                            chk.setValue(f_getValueForCheckbox(
                                  fields.m_node.attributes.values[0]));
                        }
                    }
                    f_updateDirtyIndicatorPanel(f.items.item(V_IF_INDEX_DIRTY), false);
                }

                return false;
            }
            ///////////////////////////////////////
            // if true, let handle the button issue
            else if(label != undefined && label.getXType() == 'button')
            {
                if(label.text == cLabel.text)
                    return false;
                else if(cLabel.text != undefined)
                {
                    eFormPanel.remove(f);
                    eFormPanel.insert(i, fields);
                }
            }
        }
    }

    return true;
}

function f_addField2Panel(editorPanel, fields, labelTxt)
{
    ////////////////////////////////////////////////////
    // let find out if the fields are already existed
    // in editor. If they are, then update the values,
    // else add them to editor panel.
    if(!f_updateFieldValues2Panel(editorPanel, fields, labelTxt)) return;

    if(editorPanel != undefined && fields != undefined &&
        !f_isPanelEmpty(editorPanel))
    {
        var eFormPanel = editorPanel.items.itemAt(0);

        ///////////////////////////////////////////////
        // all button should add right after the title
        if(fields.items != undefined &&
                fields.items.item(V_IF_INDEX_LABEL) != undefined &&
                fields.items.item(V_IF_INDEX_LABEL).getXType() == 'button')
            eFormPanel.insert(1, fields);
        else
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
          var helpLabel = fields.items.itemAt(V_IF_INDEX_TIP);
          if(helpLabel != undefined)
            helpLabel.hide();
        }
    }
}

function f_insertField2Panel(editorPanel, fields, labelTxt, index, check4Exist)
{
    if(!check4Exist)
        editorPanel.insert(index, fields);
    else
    {
        var f = editorPanel.items.itemAt(0);
        if(f.getXType() == 'panel' && f.title != undefined &&
            fields.title != undefined)
            f.title = fields.title;
        else
            editorPanel.insert(index, fields);
    }
}

function f_getEditGridValues(gridStore)
{
    var ret = [ ];
    var jj = 0;
    for (var i = 0; i < gridStore.getCount(); i++)
    {
        var rec = gridStore.getAt(i);
        var val = gridStore.getAt(i).get('value');
        if(val.length > 0 && rec.error != true)
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

    var gv = new VYATTA_gridview();
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
        view: gv,
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

    var p = new Ext.Panel(
    {
        layout: 'column'
        ,border: false
        ,style: 'padding:5px'
        ,width: 800
        ,items: [ f_createLabel(label, V_LABEL_LABEL), grid,
                f_createFieldDirtyIndicatorPanel(node),
                f_createLabel(helpLabel, V_LABEL_HELP) ]
    });
    p.m_node = node;
    node.m_inputPanel = p;

    return p;
}

function f_createEditorTitle(node, title)
{
    var titleName = '';

    if(node != null)
    {
        var arrow = ' ';
        var n = node;

        while(n != undefined)
        {
            titleName =  n.text + arrow + titleName;
            arrow = '&nbsp;&rArr;&nbsp;';
            n = n.parentNode;
        }
    }
    else
        titleName = title;

    return new Ext.Panel(
    {
        title: titleName
        ,height: 0
    });
}

function f_createButton(treeObj, node, btnText, title)
{
    var buttons = [ ];
    var btn_id = Ext.id();
    var cmd = btnText;
    var isDelete = false;

    if(btnText == 'Delete')
        cmd = 'delete ';
    else if(btnText == 'Create')
    {
        cmd = 'set ';
        isDelete = true;
    }

    title = f_replace(title, '&rArr;', '');
    title = f_replace(title, 'Configuration&nbsp;', '');
    buttons[buttons.length] = new Ext.Button(
    {
        id: btn_id
        ,text: btnText
        ,tooltip: btnText + ' ' + title
        ,handler: function()
        {
            f_sendConfigCLICommand(
                [cmd + treeObj.f_getNodePathStr(node) ], treeObj, node, isDelete);
        }
    });

    return new Ext.Panel(
    {
        items: buttons
        ,border: false
        ,bodyStyle: 'padding: 6px 2px 10px 8px'
        ,height: 55
        ,html: '<b>' + btnText + '</b> - ' + title + '<br><hr class="hr-editor">'
    });
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

    return new Ext.form.Label(
    {
        html: value
        ,cls: lAlign
        ,position: 'fixed'
        ,width: width
    });
}

function f_createTextAreaField(values, width, height)
{
    var val = f_replace(values, "\n", "<br>");
    var val = f_replace(val, ' ', "&nbsp;");
    var border = val.length > 0 ? true : false;

    return new Ext.Panel(
    {
        border: border
        ,style: 'padding:5px'
        ,autoWidth: true
        ,height: height
        ,autoScroll: true
        ,html: val
    });
}

function f_handleInputFieldError(node)
{
    if(node == undefined || node.m_inputPanel == undefined) return;

    var inputField = node.m_inputPanel.items.itemAt(V_IF_INDEX_INPUT);
    var type = inputField.getXType();

    if(type == 'editorgrid')
        f_setGridViewError(inputField);
    else if(type == 'textfield')
        f_handleTextFieldInputError(inputField);

    var error = node.m_inputPanel.items.itemAt(V_IF_INDEX_DIRTY);
    f_updateDirtyIndicatorPanel(error, true);
}

function f_updateDirtyIndicatorPanel(field, isError)
{
    var html = field.el.dom.innerHTML;
    if(isError)
        html = f_replace(html, 'statusUnknown', 'statusDown');
    else
        html =  f_replace(html, 'statusDown', 'statusUnknown');

    field.el.dom.innerHTML = html;
    field.show();
}

function f_handleTextFieldInputError(inputField)
{

}

function f_enterKeyPressHandler(field, e, callback)
{
    //////////////////////////////////////////////////
    // check for ENTER key to trigger the 'login'
    // button
    if(e.getKey() == 13)
        callback.call();
}