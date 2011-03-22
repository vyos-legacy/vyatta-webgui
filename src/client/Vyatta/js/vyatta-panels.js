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
        //this.m_viewerValues = ['Key Components', 'Completed Hierarchical']

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
            ////////////////////////////////
            // handle help tip button state
            if(f_needToggleHelpButton(this.m_helpTipButton))
                f_handleHelpButtonClick(this, this.m_helpTipButton, false);

            this.m_treeObj.f_setThisTreeObj(this.m_treeObj);

            //////////////////////////////////
            // end background segment process.
            g_cliCmdObj.m_segmentId = 'segment_end';
            f_resetOperButton(this.m_treeObj.m_runButton);

            this.m_parentPanel.show();
            this.f_resizePanels();
        }
        else
            this.m_parentPanel.hide();
    },

/*
    f_showLeftPanel: function(f)
    {
        if(f.getValue() == 'Completed Hierarchical')
        {
            this.m_treeObj.m_tree.show();
            this.f_resizePanels();
            this.m_compTreeObj.m_tree.hide();
        }
        else if(f.getValue() == 'Key Components')
        {
            if(this.m_leftPanel.items.getCount() == 1)
            {
                this.m_leftPanel.add(this.m_compTreeObj.m_tree);
                this.m_leftPanel.doLayout();
            }
            this.m_treeObj.m_tree.hide();
            this.m_compTreeObj.m_tree.show();
            this.f_resizePanels();
        }
    },*/

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
        if(this.m_container != undefined && this.m_topPanel != undefined)
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
        var ePanel = this.m_editorPanel;

        this.m_dataPanel.setSize(w-lp.width, h);

        if(ePanel != undefined)
        {
            ePanel.setSize(w-lp.width-20, h);

            if(ePanel.items != undefined && ePanel.items.itemAt(0) != undefined)
                ePanel.items.itemAt(0).setSize(w-lp.width-25, h-5);

            //////////////////////////////////////
            // oper text output panel
            if(ePanel.m_opTextArea != undefined)
                ePanel.m_opTextArea.setSize(w-lp.width-30,
                    h-ePanel.m_opTextArea.m_heightOffset);
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
            ,height: 30
            ,boder: false
            ,bodyBorder: false
            ,bodyStyle: 'padding: 2px'
            ,cls: 'v-panel-with-background-color'
            ,items: items
        });
        topPanel.height = 30;
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
        this.m_editorPanel.m_isDirty = false;
    },

    f_cleanEditorPanel: function()
    {
        var ep = this.m_editorPanel;
        ep.m_opTextArea = null;

        while(ep.items != undefined && ep.items.getCount() > 0)
        {
            var old = ep.items.itemAt(0);
            ep.remove(old);
            delete old;
        }

        ep.doLayout();
    },

    f_resetEditorPanel: function()
    {
        var ep = this.m_editorPanel;
        if(ep.items != undefined)
        {
            var ef = ep.items.itemAt(0);

            if(ef != undefined && ef.items != undefined)
            {
                var len = ef.items.getCount();

                ///////////////////////////////
                // walk the form editor.
                for(var i=0; i<len; i++)
                {
                    var f = ef.items.itemAt(i);
                    if(f.items != undefined && f.items.item(V_IF_INDEX_DIRTY) != undefined)
                        f.items.item(V_IF_INDEX_DIRTY).f_hide();
                }
            }
        }

        return
    },

    f_getEditorTitle: function()
    {
        if(this.f_getEditorItemCount() > 0)
        {
            var ef = this.m_editorPanel.m_formPanel;
            return ef.m_title;
        }

        return '';
    },

    f_getEditorItemCount: function()
    {
        var ep = this.m_editorPanel;

        if(ep != undefined && ep.items != undefined && ep.items.getCount() > 0)
        {
            var eFormPanel = ep.items.itemAt(0);

            return eFormPanel.items != undefined ? eFormPanel.items.getCount():0;
        }

        return 0;
    },

    ////////////////////////////////////////////////////////////////////////////
    f_initTree: function()
    {
        /////////////////////////////////////////////////
        // init hierachical tree object
        this.m_treeObj = new VYATTA_tree(this.m_tabName);
        this.m_treeObj.f_createTree(this);
        this.m_treeObj.m_tree.show();

        //////////////////////////////////
        // init component tree obj
        this.m_compTreeObj = new VYATTA_components_tree(this.m_tabName);
        this.m_compTreeObj.f_createTree(this);
    },

    f_onTreeRenderer: function(tree)
    {
        f_updateToolbarButtons(tree);
    }
});

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function f_createFieldDirtyIndicatorPanel(node)
{
    var img = getNodeStyleImage(node, false);
    var html = img.length < 1 ? V_HIDE_DIRTY_FLAG : img;

    var p = new Ext.Panel(
    {
        id: "id_dirty_" + node.text,
        border: false
        ,bodyBorder: true
        ,width: 18
        ,height: 22
        ,html: html
        ,cls: 'vLabel_dirtyField'
    });

    p.f_show = function(isError)
    {
        var html = p.el.dom.innerHTML;

        if(!isError)
            html = f_replace(html, 'empty', 'statusUnknown');
        else
            html =  f_replace(html, 'empty', 'statusDown');

        p.el.dom.innerHTML = html;
    }

    p.f_hide = function()
    {
        var html = p.el.dom.innerHTML;

        html = f_replace(html, 'statusUnknown', 'empty');
        html =  f_replace(html, 'statusDown', 'empty');

        p.el.dom.innerHTML = html;
    }

    return p;
}

function f_setFormDirty(treeObj, isDirty)
{
    treeObj.m_parent.m_editorPanel.m_isDirty = isDirty;

    var btn = treeObj.m_parent.m_editorPanel.m_formPanel.m_subBtn[0];
    if(btn != null && btn.enable != null)
    {
        if(isDirty)
            btn.enable();
        else
            btn.disable();
    }
}

function f_handleFieldTab(field)
{
    if(field.m_nextFd != undefined && field.m_nextFd.getXType() == 'editorgrid')
        field.m_nextFd.startEditing(0,0);
}
function f_createNumberField(treeObj, value, node, help, width, callback, mode)
{
    var oldVal = value != undefined ? value : node.attributes.defaultVal;
    var label = node.text;

    var onBlurHandler = function()
    {
        callback(field);
    }
    var field = new Ext.form.NumberField(
    {
        width: width,
        height:22,
        allowNegative: false,
        allowDecimals: false,
        maxValue: (Math.pow(2, 32) - 1),
        maskRe: /^\d+$/,
        value: oldVal,
        enableKeyEvents: true
        ,onBlur: mode == undefined ? onBlurHandler : undefined
        ,invalidClass: ""
    });
    field.on('focus', function(f){ f_handleGridLostFocus(f, false); });
    field.getOriginalValue = function()
    { return oldVal == undefined ? "" : oldVal; };
    field.setOriginalValue = function(val)
    { oldVal = val; }

    if(callback != undefined)
    {
        var keyupPressHandler = function(field, e)
        {
            f_setFormDirty(treeObj, true);
            //if(e.getKey() == 9)
              //  f_handleFieldTab(field);

            if(e.getKey() == 13)
                f_prepareConfFormCommandSend(treeObj);
        }
        field.on('keydown', keyupPressHandler);
    }

    help = node.attributes.type != undefined ? help+
                  " ("+node.attributes.type+")" : help;

    var p = new Ext.Panel(
    {
        layout: 'column'
        ,border: false
        ,style: 'padding:5px'
        ,width: 800
        ,items: [ f_createLabel(label, V_LABEL_LABEL, node.attributes.mandatory),
                  field,
                  f_createFieldDirtyIndicatorPanel(node), f_createLabel(help
                  , V_LABEL_HELP) ]
    });
    p.m_node = node;
    p.m_parentNode = node.parentNode;
    node.m_inputPanel = p;

    return p;
}

///////////////////////////////////////////////////
// When grid row has focus, user clicks on text field.
// the focus jumps back to the grid instead of the
// field user clicked. This function gives the focus
// back the clicked field. It's not a very clear method
// but it works.
var g_focusFd = undefined;  // field current has focus
function f_handleGridLostFocus(focus, isFromGrid)
{
    if(!Ext.isIE)
    {
        if(!isFromGrid)
        {
            g_focusFd = focus;
            g_focusFd.m_isGrid = false;
        }
        else if(g_focusFd != undefined && g_focusFd.m_isGrid != undefined &&
                !g_focusFd.m_isGrid)
                g_focusFd.focus(false,10);
    }
    else if(!isFromGrid)
            focus.focus(false, 100);
}
function f_createTextField(treeObj, value, labelStr, helpStr, width, callback, node, mode)
{
    var oldVal = value != undefined ? value : node.attributes.defaultVal;
    var onBlurHandler = function() { callback(field); }

    var field = new Ext.form.TextField(
    {
        labelSeparator: ''
        ,width: width
        ,height:22
        ,value: oldVal
        ,enableKeyEvents: true
        ,onBlur: mode == 'confMode' ? onBlurHandler : undefined
    });
    field.on('focus', function(f){ f_handleGridLostFocus(f, false); });
    field.m_mode = mode;
    field.getOriginalValue = function(){ return oldVal == undefined ? "" : oldVal; };
    field.setOriginalValue = function(val){ oldVal = val; }

    if(callback != undefined)
    {
        var keyupPressHandler = function(field, e)
        {
            f_setFormDirty(treeObj, true);
            
            if(e.getKey() == 9)
                f_handleFieldTab(field);

            if(e.getKey() == 13 && mode == 'opMode')
                callback.call();
            else if(e.getKey() == 13 && mode == 'confMode')
                f_prepareConfFormCommandSend(treeObj);
        }
        field.on('keydown', keyupPressHandler);
    }

    if(node != null)
        helpStr = node.attributes.type != undefined ? helpStr+
        " ("+node.attributes.type+")" : helpStr;

    var p = new Ext.Panel(
    {
        layout: 'column'
        ,border: false
        ,style: 'padding:5px'
        ,width: 800
        ,items: [ f_createLabel(labelStr, V_LABEL_LABEL, node.attributes.mandatory),
                    field,
                    f_createFieldDirtyIndicatorPanel(node),
                    f_createLabel(helpStr, V_LABEL_HELP) ]
    });

    if(node != null)
    {
        p.m_node = node;
        p.m_parentNode = node.parentNode;
        node.m_inputPanel = p;
    }

    return p;
}

function f_createCombobox(values, ival, emptyText, labelStr, width, helpStr,
                            isEditable, callback, node, treeObj)
{
    var oldiVal = ival != undefined ? ival : node.attributes.defaultVal;

    if(labelStr == 'inbound-interface' || labelStr == 'outbound-interface')
        isEditable = true;

    var field = new Ext.form.ComboBox(
    {
        id: this.m_tabName,
        mode: 'local',
        store: values,
        displayField: 'value',
        emptyText: '',
        labelSeparator: '',
        editable: isEditable,
        triggerAction: 'all',
        selectOnFocus: true,
        width: width,
        value: oldiVal,
        hideParent: true
    });
    field.getOriginalValue = function() { return oldiVal == undefined ? "" : oldiVal; };
    field.setOriginalValue = function(val) { oldiVal = val; }

    var onCollapseHandler = function()
    {
        f_setFormDirty(treeObj, true);
        callback(field);
    }
    var onKeyHandler = function(f, e)
    {
        if(e.getKey() == 9)
            f_handleFieldTab(f);

        if(e.getKey() == 13)
            f_prepareConfFormCommandSend(treeObj);
    }
    if(callback != undefined)
        field.on('collapse', onCollapseHandler);

    field.on('specialkey', onKeyHandler);

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
    fPanel.m_fd = field;

    var p = new Ext.Panel(
    {
        layout: 'column'
        ,border: false
        ,style: 'padding:5px'
        ,width: 800
        ,items: [ f_createLabel(labelStr, V_LABEL_LABEL, node.attributes.mandatory),
                  fPanel, f_createFieldDirtyIndicatorPanel(node),
                  f_createLabel(helpStr, V_LABEL_HELP) ]
    });
    p.m_node = node;
    p.m_parentNode = node.parentNode;
    node.m_inputPanel = p;

    return p;
}

function f_getValueForCheckbox(value)
{
    return (value != undefined && (value == 'enable' || value == 'true')) ?
                true : false;
}

function f_createGridCheckColumn(callback)
{
    var cl = new Vyatta_grid_CheckColumn(
    {
        header: " "
        ,dataIndex: 'checker'
        ,width: 20
        ,fixed: true
        ,sortable: false
        ,menuDisabled: true
        ,callback: callback
    });

    return cl;
}

function f_createCheckbox(value, node, helpStr, width, callback, treeObj)
{
    var cliVal = value != undefined ? value : node.attributes.defaultVal;
    var labelStr = node.text;
    var chkOrigVal = f_getValueForCheckbox(cliVal);

    var onClickHandler = function()
    {
        field.setValue(!field.getValue());
        f_setFormDirty(treeObj, true);
        callback(field);
    }
    var field = new Ext.form.Checkbox(
    {
        style: 'anchor: 0%, text-align:right, padding:20px'
        ,checked: chkOrigVal
        ,onClick: onClickHandler
        ,bodyStyle: 'padding:0px 0px 3px 0px'
    });
    field.getOriginalValue = function() { return chkOrigVal };
    field.setOriginalValue = function(val) { chkOrigVal = val; }
    
    var wrapPanel = new Ext.Panel(
    {
        border: false
        ,cls: 'v-bg-white'
        ,bodyStyle: 'padding:0px 2px 2px 3px'
        ,items:[field]
        ,width: 18
        ,height: 22
    });
    field.m_wp = wrapPanel;

    //////////////////////////////////////////////
    // need this panel to align the help labels
    var fPanel = new Ext.Panel(
    {
        width: width+1
        ,border: false
        ,bodyStyle: 'padding:0px 1px 3px 0px'
        ,items: [wrapPanel]
    });
    fPanel.m_fd = field;

    var p = new Ext.Panel(
    {
        layout: 'column'
        ,border: false
        ,style: 'padding:5px'
        ,width: 830
        ,items: [ f_createLabel(labelStr, V_LABEL_LABEL, node.attributes.mandatory), fPanel,
                  f_createFieldDirtyIndicatorPanel(node),
                  f_createLabel(helpStr, V_LABEL_HELP) ]
    });
    p.m_node = node;
    p.m_parentNode = node.parentNode;
    node.m_inputPanel = p;

    return p;
}

function f_isPanelEmpty(panel, mode)
{
    if(panel.items != undefined && panel.items.getCount() > 0)
        return false;
    else
        return true;
}

function f_handleHelpButtonClick(panel, helpbutton, saveCookie)
{
    if(saveCookie)
        f_toggleHelpTips(helpbutton);
    else
        f_updateHelpButtonIcon(helpbutton)

    if(panel == undefined || panel.m_editorPanel == undefined ||
        panel.m_editorPanel.items == undefined) return;

    var fPanel = panel.m_editorPanel.items.itemAt(0);
    var hState = f_getHelpTipsState();
    for(var i=0; i<fPanel.items.getCount(); i++)
    {
        var rPanel = fPanel.items.itemAt(i);
        if(rPanel == undefined) return;

        if(rPanel.m_helpLabel != undefined)
        {
            if(hState == V_HELP_OFF)
                rPanel.m_helpLabel.show();
            else
                rPanel.m_helpLabel.hide();
        }
        else
        {
            var helpLabel = rPanel.items == undefined ? undefined :
                            rPanel.items.itemAt(panel.m_helpIndex);
            if(helpLabel != undefined)
            {
                if(hState == V_HELP_OFF)
                    helpLabel.show();
                else
                    helpLabel.hide();
            }
        }
    }
}

function f_createComboBox(values, selVal, editable, label)
{
    return new Ext.form.ComboBox(
    {
        mode: 'local',
        animCollapse: true,
        blankText: 'This field cannot be blank',
        store: values,
        displayField: 'name',
        fieldLabel: label,
        editable: editable,
        triggerAction: 'all',
        selectOnFocus: true,
        height: 23,
        width: 150,
        hideLabel: false,
        hideTrigger: false,
        hideParent: false,
        value: values[selVal]
    });
}
function f_createTopPanelViewPanel(thisObj)
{
    //var onCollapseHandler = function(f)
    //{
      //  thisObj.f_showLeftPanel(f);
    //}

    thisObj.m_collapseBtn = f_createToolbarButton('v_collapse_button',
                'collapse', thisObj.m_treeObj, 'Collapose all tree nodes');

    //var field = f_createComboBox(thisObj.m_viewerValues, 1, false, "View");
    //field.on('collapse', onCollapseHandler);
    var toolbar = new Ext.Toolbar(
    {
        border: false
        ,cls: 'v-border-less'
        ,items: [ thisObj.m_collapseBtn ] //'View: ', field]
    });

    return new Ext.Panel(
    {
        height: 28
        ,width: 192
        ,maxWidth: 250
        ,boder: false
        ,bodyBorder: false
        ,collapsible: false
        ,cls: 'v-border-less'
        ,tbar: toolbar
    });
}

function f_createToolbar(panelObj)
{
    var helpButtonHandler = function()
    {
        f_handleHelpButtonClick(panelObj, helpTipButton, true)
    }
    var helpTipButton = f_createHelpTipsButton(helpButtonHandler);
    panelObj.m_helpTipButton = helpTipButton;

    var toolBar = panelObj.m_tabName == V_TREE_ID_config ?
        [ '->',
          helpTipButton,
          '-',
          panelObj.m_viewBtn = f_createToolbarButton('v_view_button',
                'view', panelObj.m_treeObj, 'Display the current system configuration file.'),
          panelObj.m_loadBtn = f_createToolbarButton('v_load_button',
                'load', panelObj.m_treeObj, 'Load a saved configuration file.'),
          panelObj.m_mergeBtn = f_createToolbarButton('v_merge_button',
                'merge', panelObj.m_treeObj, 'Merge configuration file.'),
          panelObj.m_saveBtn = f_createToolbarButton('v_save_button',
                'save', panelObj.m_treeObj, 'Save current configuration to file.'),
          '-',
          panelObj.m_discardBtn = f_createToolbarButton('v_discard_button',
                              'discard', panelObj.m_treeObj,
                              'Discard configuration changes that were made since the last load or commit.'),
          panelObj.m_commitBtn = f_createToolbarButton('v_commit_button',
                                'commit', panelObj.m_treeObj,
                                'Commit (makes active) configuration changes that were made since the last load or commit.')
        ] :
        [ '->',
          helpTipButton
        ];

    return new Ext.Panel(
    {
        margins: '5 5 5 5'
        ,bodyStyle: 'padding:10px 2% 0px 2%'
        ,cls: 'v-border-less'
        ,collapsible: false
        ,border: false
        ,bodyBorder: false
        ,tbar: toolBar
    });
}

function f_createToolbarButton(iconCls, cmdName, treeObj, tooltip)
{
    var supportCmd = [];
    var sendCmd = cmdName;

    return new Ext.Button(
    {
        text: ' '
        ,iconCls: iconCls
        ,id: cmdName
        ,tooltip: tooltip
        ,handler: function()
        {
            if(cmdName == 'save' || cmdName == 'load' || cmdName == 'merge')
            {
                supportCmd[0] = "show files '";
                supportCmd[1] = cmdName;
                supportCmd[2] = undefined;
                if(cmdName == 'save')
                {
                    supportCmd[1] = cmdName;
                    sendCmd = supportCmd[0] + V_CONFIG_DIR + "'";
                }
                else if(cmdName == 'load')
                {
                    supportCmd[1] = cmdName;
                    sendCmd = supportCmd[0] + V_CONFIG_DIR + "'";
                }
                else if(cmdName == 'merge')
                {
                    supportCmd[1] = cmdName;
                    sendCmd = supportCmd[0] + V_CONFIG_DIR + "'"
                }

                f_sendOperationCliCommand(null, null, false, sendCmd,
                                          true, undefined, treeObj, supportCmd);
            }
            else if(cmdName == 'collapse')
                treeObj.m_tree.collapseAll();
            else
            {
                if(cmdName == 'view')
                    sendCmd = 'show session';

                if(cmdName == 'discard')
                {
                    if(treeObj.m_isCommitAvailable)
                    {
                        var button = this;
                        var discardCb = function(btn)
                        {
                            if(btn == 'yes')
                                f_sendCLICommand(button, [sendCmd], treeObj);
                        }
                        f_yesNoMessageBox('Discard',
                          'Are you sure you wish to discard all the new configuration?',
                          discardCb);
                    }
                }
                else
                    f_sendCLICommand(this, [sendCmd], treeObj);
            }
        }
    });
}

function f_showConfigurationViewDialog(configData)
{
    var val = f_replace(configData, "\n", "<br/>");
    val = f_replace(val, ' ', "&nbsp;");

    var dialog = new Ext.Window(
    {
        title: 'Configuration View'
        ,reset_on_hide: true
        ,height: 380
        ,width: 600
        ,autoScroll: true
        ,html:'<font face="monospace">' + val + '</font>'
    });

    dialog.show();
}

function f_getFileChooserDialogInput(sRadio, comb, tf)
{
    var selVal = comb.lastQuery == undefined || comb.lastQuery == "" ?
                  comb.getValue() : comb.lastQuery;
    var radio = sRadio.items.items[0];

    if(radio.getValue() && selVal != 'select filename')
        return " '" + V_CONFIG_DIR + selVal + "' ";
    else if(!radio.getValue() && tf.getValue().length > 0)
        return " '" + tf.getValue() + "'";
    else
        return "";
}

function f_createFileChooserRadio(labelTxt, checked, height, cb)
{
    var sRadio =
    {
        xtype: 'radio',
        name: 'mode',
        checked: checked,
        boxLabel: ' ',
        hideLabel: true,
        labelSeparator: ''
        ,listeners: { check: cb }
    };
    var sLabel = new Ext.form.Label(
    {
        html: labelTxt
        ,cls: 'vlabel_left2'
        ,position: 'fixed'
        ,width: 380
        ,height: height
    });

    var p =  new Ext.Panel(
    {
        border: false
        ,layout: 'column'
        ,cls: 'v-bg-white'
        ,bodyStyle: 'padding:0px 2px 2px 3px'
        ,items:[sRadio, sLabel]
    });

    p.m_radio = sRadio;
    return p;
}

function f_showFileChooserDialog(command, values, treeObj)
{
    ///////////////////////////////////
    // parse values
    var val = ['select filename'];
    if(values != undefined)
    {
        var l = values.split("\n");
        for(var i=0; i<l.length; i++)
        {
            if(l[i].indexOf('-r') >= 0)
            {
                var w = l[i].split(' ');
                val.push(w[w.length-1]);
            }
        }
    }

    var cb = function(btn)
    {
        var cmd = f_getFileChooserDialogInput(sRadio, comb, txtField);
        cmd = command + cmd;

        if(btn == undefined || btn == 'yes')
        {
            f_sendConfigCLICommand([cmd], treeObj);
            dialog.hide();
        }
    }

    var okButton = new Ext.Button(
    {
        text: 'OK'
        ,minWidth: 70
        ,handler: function()
        {
            var cmd = f_getFileChooserDialogInput(sRadio, comb, txtField);
            if(cmd != "")
            {
                if(command == 'load')
                    f_yesNoMessageBox('Re-load Configuration',
                          'Are you sure you wish to load the selected ' +
                          'configuration file: ' + cmd + '?', cb);
                else
                    cb.call(null, null, ['save'], true);
            }
            else
            {
                f_promptErrorMessage(command + " configuration",
                        "Please select or enter a configuration filename.",
                        Ext.MessageBox.ERROR);
            }
        }
    });

    var cancelButton = new Ext.Button(
    {
        text: 'Cancel'
        ,minWidth: 70
        ,handler: function() { dialog.hide(); }
    })

    var editable = true;
    var title = 'Select or enter a configuration filename to be ';
    var dlgTitle= ' Configuration File';
    var items = [];
    var txtField = undefined;
    var sLabelTxt = 'Select a configure filename to be ';
    var rLabelTxt = 'Enter a remote configure filename ';
    var spaces = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
    if(command == 'load')
    {
        editable = false;
        title += 'loaded';
        dlgTitle = 'Load' + dlgTitle;
        sLabelTxt += 'loaded from a Vyatta default directory' +
            '<br>(/opt/vyatta/etc/config/).<br>&nbsp;'
        rLabelTxt += '&nbsp;for loading via http, scp, ftp, tftp, etc..' +
                    '<br>(i.e. tftp://172.16.117.1/dut1-config.boot<br>'+
                    'i.e. /any-dir/home/etc/config/config.boot).<br>&nbsp;'
    }
    else if(command == 'merge')
    {
        editable = false;
        title += 'merged';
        dlgTitle = 'Merge' + dlgTitle;
        sLabelTxt += 'merged from system config file' +
            '<br>(/opt/vyatta/etc/config/).<br>&nbsp;'
        rLabelTxt += '&nbsp;for merging from local machine or rmote machine via http, scp, ftp, tftp, etc..' +
                    '<br>(i.e. tftp://172.16.117.1/dut1-config.boot<br>'+
                    'i.e. /any-dir/home/etc/config/config.boot).<br>&nbsp;'
    }
    else
    {
        dlgTitle = 'Save' + dlgTitle;
        title += 'saved';
        sLabelTxt += 'to saved to a Vyatta default directory' +
            '<br>(/opt/vyatta/etc/config/).<br>&nbsp;'
        rLabelTxt += '&nbsp;save via http, scp, ftp, tftp, etc..' +
                    '<br>(i.e. tftp://172.16.117.1/dut1-config.boot<br>'+
                    'i.e. /any-dir/home/etc/config/config.boot).<br>&nbsp;'
    }

    var sRadioCb = function(sThis, isChecked)
    {
        if(isChecked)
        {
            comb.enable();
            comb.focus(false);
        }
        else
            comb.disable();
    }

    var sRadio = f_createFileChooserRadio(sLabelTxt, true, 45, sRadioCb);
    var comb = f_createComboBox(val, 0, editable, spaces + 'Filename');
    var line = new Ext.form.Label(
    {
        html: '<br><hr>'
        ,cls: 'vlabel_left2'
        ,position: 'fixed'
    });

    var rRadioCb = function(rThis, isCheck)
    {
        if(isCheck)
        {
            txtField.enable();
            txtField.focus(true);
        }
        else
            txtField.disable()
    }
    var rRadio = f_createFileChooserRadio(rLabelTxt, false, 55, rRadioCb);
    txtField = new Ext.form.TextField(
    {
      fieldLabel: spaces + 'Filename'
      ,labelAlign: 'left'
      ,name: 'remote'
      ,labelSeparator: ':'
      ,width: 285
      ,inputType: 'text'
      ,enableKeyEvents: true
      ,allowBlank:true
      ,disabled: true
    });
    
    items = [sRadio, comb, line, rRadio, txtField];
    
    var loginFormPanel = new Ext.form.FormPanel(
    {
        labelWidth: 100
        ,frame:false
        ,border: false
        ,title: title
        ,bodyStyle:'padding:10px 10px 5px 10px'
        ,width: 440
        ,monitorValid: true
        ,items: items
        ,buttons: [okButton, cancelButton]
    });

    var dialog = new Ext.Window(
    {
        title: dlgTitle
        ,reset_on_hide: true
        ,height: 308
        ,width: 455
        ,autoScroll: true
        ,items: [loginFormPanel]
    });

    dialog.show();
    sRadioCb(null, true);
}

function f_updateToolbarButtons(tree)
{
    var m = tree.m_parent;

    if(m.m_commitBtn != undefined)
        tree.m_parent.m_commitBtn.setIconClass(tree.m_isCommitAvailable ?
                        'v_commit_button' :
                        'v_commit_button_no x-toolbar x-item-disabled');

    if(m.m_discardBtn != undefined)
        tree.m_parent.m_discardBtn.setIconClass(tree.m_isCommitAvailable ?
                        'v_discard_button' :
                        'v_discard_button_no x-toolbar x-item-disabled');

    if(m.m_undoBtn != undefined)
        tree.m_parent.m_undoBtn.setIconClass(tree.m_isCommitAvailable ?
                        'v_undo_button' : 'v_undo_button_no');

    if(m.m_redoBtn != undefined)
        tree.m_parent.m_redoBtn.setIconClass(tree.m_isCommitAvailable ?
                        'v_redo_button' : 'v_redo_button_no');
}

function f_sendCLICommand(button, cmds, treeObj)
{
    if(button.iconCls.indexOf('_no') > 0)
        return;

    f_sendConfigCLICommand(cmds, treeObj, undefined, undefined);
}

function f_handleToolbarViewCmdResponse(responseTxt)
{
    f_showConfigurationViewDialog(responseTxt);
}

function f_addConfiSetButton(treeObj, node, editorPanel)
{
    var ePanel = editorPanel;
    var eForm = ePanel.m_formPanel;

    if(eForm.m_subBtn == null && eForm.items != undefined &&
        eForm.items.getCount() > 1)
    {
        var btn = f_createConfSubButton(treeObj)
        f_addField2Panel(ePanel, btn, node, V_TREE_ID_config);
        eForm.m_subBtn = btn.m_buttons;
    }

    if(eForm.m_count == 0 && eForm.items != undefined)
    {
        eForm.doLayout();
        f_linkFormField(eForm);
        eForm.m_count = eForm.items.getCount();
    }
}
//////////////////////////////////////////////////////////////////
// if fields are already in panel, update it and return false. else
// do nothing and return true
function f_updateFieldValues2Panel(editorPanel, fields, node, mode)
{
    if(editorPanel == undefined || f_isPanelEmpty(editorPanel, mode) ||
            fields == undefined)
        return true;

    var eFormPanel = editorPanel.m_formPanel;

    if(eFormPanel == undefined || eFormPanel.items == undefined) return true;
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

            //////////////////////////////
            // if true, we updating the button fields
            if(fields.m_buttons != undefined && f.m_buttons != undefined)
                return false;   // button fields already exist.

            ///////////////////////////////////////////////////////
            // if the below statement is true, the fields already
            // exist.
            if(label != undefined && label.getXType() == 'label' &&
                label.html == cLabel.html)
                return false;
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

function f_addField2Panel(editorPanel, fields, node, mode)
{
    ////////////////////////////////////////////////////
    // let find out if the fields are already existed
    // in editor. If they are, then update the values,
    // else add them to editor panel.
    if(!f_updateFieldValues2Panel(editorPanel, fields, node, mode)) return;

    if(editorPanel != undefined && fields != undefined &&
        !f_isPanelEmpty(editorPanel, mode))
    {
        var eFormPanel = editorPanel.m_formPanel;

        ///////////////////////////////////////////////
        // all button should add right after the title
        if(fields.items != undefined &&
                fields.items.item(V_IF_INDEX_LABEL) != undefined &&
                fields.items.item(V_IF_INDEX_LABEL).getXType() == 'button')
            eFormPanel.insert(1, fields);
        else
            eFormPanel.add(fields);

        if(fields != undefined && fields.items != undefined)
        {
            ///////////////////////////////////////
            // set focus field
            var ifield = fields.items.itemAt(V_IF_INDEX_INPUT);
            if(ifield != undefined)
            {
                var type = ifield.getXType();
                if(type == 'panel')
                {
                    ifield = ifield.m_fd;
                    type = ifield.getXType();
                }

                if(mode == V_TREE_ID_config || mode == V_TREE_ID_oper)
                {
                    if(eFormPanel.items.getCount() == 2)
                    {
                        ifield.focus(true, 500);
                        //ifield.el.dom.focus()
                        ifield.tabIndex = eFormPanel.m_fdIndex++;
                    }
                }

                if(eFormPanel.items.getCount() > 2)
                    ifield.tabIndex = eFormPanel.m_fdIndex++;
            }
            fields.m_form = eFormPanel;
        }
    }
    else  // editor panel is empty. create a form and add fields into it
    {
        var dummy = new Ext.form.Label(
        {
            html: '&nbsp;'
            ,position: 'fixed'
        });
        var items = mode == V_TREE_ID_oper ? null : [dummy];

        var form = new Ext.form.FormPanel(
        {
            fieldLabel: node != undefined ? node.text : undefined
            ,autoScroll: true
            ,autoHeight: false
            ,bodyBorder: false
            ,align: 'center'
            ,tbar: fields
            ,cls: 'v-panel-tbar'
            ,items: items
        });
        form.m_subBtn = null;
        form.m_count = 0;
        form.dummy = dummy;
        form.m_title = fields.m_title;
        form.m_fdIndex = 0;

        editorPanel.add(form);
        editorPanel.m_formPanel = form;
        form.setSize(editorPanel.getSize().width, editorPanel.getSize().height-7);
    }

    if(f_getHelpTipsState() == V_HELP_ON)
    {
        if(fields.m_helpLabel != undefined)
            fields.m_helpLabel.hide();
        else if(fields.items != undefined)
        {
          var helpLabel = fields.items.itemAt(V_IF_INDEX_TIP);
          if(helpLabel != undefined)
            helpLabel.hide();
        }
    }
}

function f_linkFormField(form)
{
    if(form.items == undefined) return;

    for(var i=1; i<form.items.getCount(); i++)
    {
        if(form.items.itemAt(i).items != undefined)
        {
            var fd = form.items.itemAt(i).items.itemAt(V_IF_INDEX_INPUT);
            if(fd != undefined)
            {
                var nextFd = form.items.itemAt(i+1);
                if(nextFd != undefined && nextFd.items != undefined)
                {
                    nextFd = nextFd.items.itemAt(V_IF_INDEX_INPUT);
                    if(nextFd != undefined)
                        fd.m_nextFd = nextFd;
                }
            }
        }
    }
}

function f_isEditGridDirty(gridStore)
{
    if(gridStore.m_isChecker)
        return gridStore.m_checkerDirty;
    
    for(var i = 0; i < gridStore.getCount(); i++)
    {
        var rec = gridStore.getAt(i);
        if(rec.dirty)
            return true;
    }

    return false;
}
function f_getEditGridValues(gridStore, getFrom)
{
    var ret = [ ];
    getFrom = getFrom == undefined ? 0 : getFrom;
    for(var i=getFrom; i<gridStore.getCount(); i++)
    {
        var rec = gridStore.getAt(i);
        var val = gridStore.getAt(i).get('value');
        if(val.length > 0 && !rec.error)
            ret.push(val);
    }

    return ret;
}
function f_getEditGridCheckerValues(fp)
{
    var gridStore = fp.m_store;
    var node = fp.m_node;

    var ret = [ ];
    for (var i = 0; i < gridStore.getCount(); i++)
    {
        var rec = gridStore.getAt(i);
        var val = gridStore.getAt(i).get('value');
        var checker = gridStore.getAt(i).get('checker');
        if(val.length > 0 && !rec.error)
        {
            var attrs = node.attributes;
            var add = true;

            /////////////////////////////
            // get modified values only
            if(attrs.values != undefined)
            {
                for(var j=0; j<attrs.values.length; j++)
                {
                    //////////////////////////////////
                    // value to be deleted
                    if(val == attrs.values[j] && !checker)
                    {
                        //if(!f_isEditGridValueNewAdded(node.attributes.enums, attrs.values[i]))
                        {
                            ret.push([val, checker]);
                            break;
                        }
                    }
                    /////////////////////////
                    // value not changed
                    else if(val == attrs.values[j] && checker)
                    {
                        add = false;
                        break;
                    }
                }
            }

            //////////////////////////
            // new values
            if(checker && add)
                ret.push([val, checker]);
        }
    }

    return ret;
}

function f_isEditGridValueCheck(val, values)
{
    for(var i=0; i<values.length; i++)
    {
        if(values[i] == val) return true;
    }
    
    return false;
}
function f_isEditGridValueNewAdded(enumVal, val)
{
    var isNew = true;

    /////////////////////////////////////////
    // is enum is empty val is new added
    if(enumVal == null || enumVal.length == 0)
        return isNew;

    for(var i=0; i<enumVal.length; i++)
    {
        if(enumVal[i] == val)
            isNew = false;
    }

    return isNew;
}
function f_createEditGrid(values, enumValues, gridStore, record, node,
                          helpLabel, width, callback, treeObj)
{
    //////////////////////////////////////////////////////
    // remove the enum values from user.
    var label = node.text;
    gridStore.m_isChecker = enumValues.length == 0 ? false : true;
    gridStore.m_checkerDirty = false;

    if(enumValues.length > 0)
    {   // check values
        for(var i=0; i < enumValues.length; i++)
        {
            if(enumValues[i] == '*' && node.text == 'address') continue;
            
            var chk = f_isEditGridValueCheck(enumValues[i], values)
            var v = new record({ value: enumValues[i],  checker: chk });
            gridStore.add(v);
        }

        // values checked but have not commit
        for(var i=0; i < values.length; i++)
        {
            if(f_isEditGridValueNewAdded(enumValues, values[i]))
            {
                var v = new record({ value: values[i], checker: true});
                gridStore.add(v);
            }
        }
    }
    else    // none check values
    {
        for(var i=0; i < values.length; i++)
        {
            var v = new record({ value: values[i], checker: false});
            gridStore.add(v);
        }
    }

    var count = gridStore.getCount();
    for(var i=0; i<50-count; i++) gridStore.loadData([ '' ], true);

    var CheckColumnOnMousePress = function()
    {
        gridStore.m_checkerDirty = true;
        f_setFormDirty(treeObj, true);
    }
    var checkColumn = f_createGridCheckColumn(CheckColumnOnMousePress);

    var tId = null;
    var setField = function()
    {
        window.clearTimeout(tId);
        f_prepareConfFormCommandSend(treeObj);
    }
    if(callback != undefined)
    {
        var keypressHandler = function(e)
        {
            if(e.getKey() == 13)
                tId = window.setTimeout(setField, 100);
            if(e.getKey() == 9)
            {
                grid.m_textField.m_nextFd.focus(false, 10);
                return false;
            }
            
            f_setFormDirty(treeObj, true);
        }
    }
    var tf = new Ext.form.TextField(
    {
        //disabled : gridStore.m_isChecker,
        listeners:
        {
            render: function(c)
            {
                c.getEl().on({
                keydown: keypressHandler
                ,scope: c
                });
            }
        }
    });
    tf.on('blur', function(f) { f_handleGridLostFocus(f, true); });
    var ctf =
    {
        id: 'value',
        header: 'Value',
        width: width-20,
        sortable: false,
        dataIndex: 'value',
        editor: tf
    };
    var columns = [];
    if(gridStore.m_isChecker) columns.push(checkColumn);
    columns.push(ctf);
    
    var gv = new VYATTA_gridview();
    var sm = new Ext.grid.RowSelectionModel({ singleSelect: true });
    var grid = new Ext.grid.EditorGridPanel(
    {
        store: gridStore,
        tooltip: 'Click on Add button to add value.\nOr Delete button to delete value',
        border: true,
        autoScroll: true,
        clicksToEdit: 1,
        enableHdMenu: false,
        width: width,
        height: 180,
        sm: sm,
        stripeRows: true,
        view: gv,
        plugins: checkColumn,
        columns:columns
    });
    //grid.on('afteredit', callback);
    grid.m_textField = tf;

    helpLabel = node.attributes.type != undefined ? helpLabel+
                  " ("+node.attributes.type+")" : helpLabel;

    var p = new Ext.Panel(
    {
        layout: 'column'
        ,border: false
        ,style: 'padding:5px'
        ,width: 800
        ,items: [ f_createLabel(label, V_LABEL_LABEL, node.attributes.mandatory), grid,
                f_createFieldDirtyIndicatorPanel(node),
                f_createLabel(helpLabel, V_LABEL_HELP) ]
    });
    p.m_node = node;
    p.m_parentNode = node.parentNode;
    node.m_inputPanel = p;

    return p;
}

function f_createConfEditorTitle(treeObj, node, btnPanel)
{
    var titleName = '';

    if(node != null)
    {
        var arrow = ' ';
        var n = node;

        while(n != undefined)
        {
            if(n.text != 'Configuration')
            {
                titleName =  n.text + arrow + titleName;
                if(Ext.isIE)
                    arrow = '&nbsp;&rarr;&nbsp;';
                else
                    arrow = '&nbsp;&rArr;&nbsp;';
            }
            n = n.parentNode;
        }
    }

    var btns = [];
    //if(f_okToAddActivateBtn(treeObj, node))
    //    btns.push(f_createConfButton(treeObj, node, 'Activate'));
    //if(f_okToAddDeactivateBtn(treeObj, node))
    //    btns.push(f_createConfButton(treeObj, node, 'Deactivate'));
    if(btnPanel != undefined) btns.push(btnPanel[0]);
    if(btns.length == 0) btns = undefined;
    
    var title  = new Ext.Panel(
    {
        html: '<div valian="center" id="v-header-font"><b>' +
                  titleName + '</b></div>'
        ,position: 'fixed'
        ,cls: 'v-border-less'
        ,border: false
        ,bodyStyle: 'padding: 10px 5px 5px 5px'
    });
    var items = btnPanel != null ? [title, "->", btns] : [title];
    items.m_title = titleName;

    return items;
}

function f_okToAddActivateBtn(treeObj, node)
{
    var ok = false;

    switch(node.attributes.configured)
    {
        case 'set':
        case 'active':
        case 'active_plus':
        case 'error':
            ok = true;

            var dis = node.attributes.disable;
            if(dis == undefined || dis.indexOf('enable') >= 0)// || dis.indexOf("_local") > 0)
                ok = false;
            else
            {
                ///////////////////////////////////////
                // if its ancestor initiated the deactivation,
                // it shouldn't allow to activate itself
                var n = node.parentNode;
                while(n != undefined)
                {
                    if(n.attributes != undefined && n.attributes.disable != null &&
                        (n.attributes.disable == 'disable' ||
                        n.attributes.disable.indexOf('_local') > 0))
                    {
                        ok = false;
                        break;
                    }
                    n = n.parentNode;
                }
            }
    }

    return ok;
}

function f_okToAddDeactivateBtn(treeObj, node)
{
    var ok = false;

    switch(node.attributes.configured)
    {
        case 'set':
        case 'active':
        case 'active_plus':
        case 'error':
            ok = true;

            var dis = node.attributes.disable;
            if(dis != undefined && dis.indexOf('disable') >= 0)// ||
                //(dis != undefined && dis.indexOf("_local") > 0))
                ok = false;
            else
            {
                ///////////////////////////////////////
                // if its ancestor initiated the activation,
                // it shouldn't allow to deactivate itself
                var n = node.parentNode;
                while(n != undefined)
                {
                    if(n.attributes.disable != undefined &&
                        (n.attributes.disable.indexOf("_local") > 0))
                    {
                        ok = false;
                        break;
                    }
                    n = n.parentNode;
                }
            }
    }

    return ok;
}

function f_createOperEditorTitle(title)
{
    var panel = new Ext.Panel(
    {
        title: title
        ,height: 0
    });
    panel.m_title = title;

    return panel;
}

function f_createConfSubButton(treeObj)
{
    var buttons = [];
    var btn_id = Ext.id();

    buttons[0] = new Ext.Button(
    {
        id: btn_id
        ,disabled: true
        ,text: 'Set'
        ,tooltip: 'Set modified fields'
        ,height: 20
        ,minWidth: 60
        ,handler: function()
        {
            if(f_prepareConfFormCommandSend(treeObj))
                f_setFormDirty(treeObj, false);
        }
    });

    var bPanel = new Ext.Panel(
    {
        buttons: buttons
        ,bodyStyle: 'padding: 0px'
        ,border: false
        ,height: 0
        ,buttonAlign: 'right',
        width: 70
    });

    var panel = new Ext.Panel(
    {
        buttons: [bPanel]
        ,border: false
        ,bodyStyle: 'padding: 0px'
        ,height: 0
        ,width: 480
    });
    panel.m_buttons = buttons;
    panel.m_isSubmitBtn = true;

    return panel;
}

function f_createConfButton(treeObj, node, btnText, title)
{
    var button;
    var btn_id = Ext.id();
    var cmd = '';
    var isDelete = false;
    var iconCls = 'v-delete-button';

    if(btnText == 'Delete')
        cmd = 'delete ';
    else if(btnText == 'Create')
    {
        cmd = 'set ';
        isDelete = true;
        iconCls = 'v-create-button';
    }
    else if(btnText == 'Activate')
    {
        cmd = 'activate ';
        iconCls = 'v-activate-button';
    }
    else if(btnText == 'Deactivate')
    {
        cmd = 'deactivate ';
        iconCls = 'v-deactivate-button';
    }

    button = new Ext.Button(
    {
        id: btn_id
        ,overCls: 'v-tb-btn-over'
        ,text: ''
        ,iconCls: iconCls
        ,tooltip: btnText + ' <b>"' + node.text + '"</b> configuration node'
        ,handler: function()
        {
            if(node.text == 'https' && cmd == 'delete ')
            {
                var cb = function send(btn)
                {
                    if(btn == 'yes')
                        f_sendConfigCLICommand([cmd + treeObj.f_getNodePathStr(node) ],
                                    treeObj, node, isDelete);
                };

                f_yesNoMessageBox('Delete',
                    'Delete this node will disable the Web-GUI. Are you sure you wish to continue?', cb);
            }
            else
                f_sendConfigCLICommand([cmd + treeObj.f_getNodePathStr(node) ],
                                    treeObj, node, isDelete);

            if(node.text == 'reboot')
            {
                if(node.parentNode != undefined && node.parentNode.text != 'show')
                    return;
            }
        }
    });
    button.on('mouseover', function(){});
    button.m_buttons = [ button ];
    button.indexTab = 0;

    return [button];
}

function f_handleOperBtnClick(button, node, treeObj)
{
    if(button.text == 'Stop')
    {
        button.setText('Run');
        button.el.dom.className = V_STOP_CSS;
        g_cliCmdObj.m_segmentId = 'segment_end';
        button.m_pauseBtn.setText('Pause');
        button.m_pauseBtn.hide();
    }
    else
    {
        var cb = function send(btn)
        {
            if(btn == 'yes')
            {
                g_cookie.f_set(V_COOKIES_ISLOGIN, 'reboot', g_cookie.m_userNameExpire);
                f_sendOperationCliCommand(node, treeObj, false,
                                          undefined, true, undefined,
                                          treeObj, undefined);
                window.location.reload(false);
            }
        };

        if(node.text == 'reboot')
        {
            if(node.parentNode != undefined &&
                    node.parentNode.text != 'show')
            {
                f_yesNoMessageBox('Reboot Operational',
                    'Are you sure you wish to reboot the system?', cb);
                return;
            }
        }

        f_sendOperationCliCommand(node, treeObj, false,
                                          undefined, true, undefined,
                                          treeObj, button);
    }
}

function f_resetOperButton(btn)
{
    if(btn != null)
    {
        btn.setText('Run');
        btn.el.dom.className = V_STOP_CSS;
        btn.m_pauseBtn.setText('Pause');
        btn.m_pauseBtn.hide();
    }
}

function f_createOperButton(treeObj, node, btnText, title)
{
    g_cliCmdObj.m_segPause = false;
    
    var buttons = [ ];
    var btn_id = Ext.id();

    if(Ext.isIE)
        title = f_replace(title, '&rarr;&nbsp;', '');
    else
        title = f_replace(title, '&rArr;&nbsp;', '');
    title = f_replace(title, 'Configuration&nbsp;', '');
    buttons[0] = new Ext.Button(
    {
        id: btn_id
        ,text: btnText
        ,cls: V_STOP_CSS
        ,tooltip: btnText + ' ' + title
        ,minWidth: 58
        ,width:60
        ,minHeight: 22
        ,height: 22
        ,handler: function()
        {
            f_handleOperBtnClick(this, node, treeObj)
        }
    });

    if(treeObj != undefined && treeObj.m_treeMode == V_TREE_ID_oper)
    {
        buttons[1] = new Ext.Button(
        {
            id: btn_id + 'pause'
            ,text: 'Pause'
            ,tooltip: "Pause and resume continue respond data."
            ,minWidth: 65
            ,width:68
            ,height: 22
            ,handler: function()
            {
                if(this.text == 'Pause')
                {
                    buttons[0].el.dom.className = V_PAUSE_CSS;
                    this.setText('Resume');
                    g_cliCmdObj.m_segPause = true;
                }
                else
                {
                    buttons[0].el.dom.className = V_WAIT_CSS;
                    this.setText('Pause');
                    g_cliCmdObj.m_segPause = false;
                }
            }
        });
        buttons[1].hide();
        buttons[0].m_pauseBtn = buttons[1];
        buttons[2] = f_createLabel(node.attributes.help, V_LABEL_HELP);
    }

    var bPanel = new Ext.Panel(
    {
        buttons: buttons
        ,bodyStyle: 'padding: 0px'
        ,border: false
        ,buttonAlign: 'left',
        height: 0
    });

    var panel = new Ext.Panel(
    {
        items: bPanel
        ,border: false
        ,bodyStyle: 'padding: 1px 2px 5px 8px'
        ,height: 65
        ,cls: 'v_panel_button_right'
        ,html: '<b>&nbsp;&nbsp;' + btnText + '</b> - ' + title + '<br><hr class="hr-editor">'
    });

    panel.m_pauseBtn = buttons[1];
    panel.m_helpLabel = buttons[2];
    treeObj.m_runButton = buttons[0];
    return panel;
}

function f_createLabel(value, labelFor, isMandatory)
{
    var lAlign = 'label_center';
    var width = 200;

    if(labelFor == V_LABEL_HELP)
    {
        if(value == undefined)
            value = "";
        else
        {
            value = f_replace(value, '<', '&#60;');
            value = f_replace(value, '>', '&#62;');
            lAlign = 'vlabel_left';
            width = 250;
        }
    }
    else if(labelFor == V_LABEL_LABEL)
    {
        var val = isMandatory != null && isMandatory == 'true' ?
                    value + ': <img title="required field" src="images/ico_required.PNG"/> '
                    : value + ': ';
        lAlign = 'vlabel_right';
        width = 200;
        value = val;
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
    var el = document.createElement("div");
    el.id = 'id_op_txt_output'+Ext.id();
    var id = 'id_op_output' + Ext.id();
    el.innerHTML = '<pre id="' + id + '"><font face="courier new">'+values+'</font></pre>';

    var pPanel = new Ext.Panel(
    {
        border: true
        ,style: 'padding:5px'
        ,autoWidth: true
        ,height: height
        ,autoScroll: true
        ,contentEl: el
    });
    pPanel.m_outputId = id;

    return pPanel
}

function f_handleConfFieldOffFocus(field)
{
    if(field == undefined || field.getXType == undefined) return;

    var fType = field.getXType();
    if(fType == 'textfield' || fType == 'numberfield' || fType == 'combo')
    {
        var cn = field.el.dom.className;
        cn = f_replace(cn, 'v-textfield-unsubmit', '');
        cn = f_replace(cn, 'v-textfield-submit', '');

        if(field.getOriginalValue() != field.getValue())
            field.el.dom.className = cn + ' v-textfield-unsubmit';
        else
            field.el.dom.className = cn + ' v-textfield-submit';
    }
    else if(fType == 'checkbox')
    {
        var cn = field.m_wp.el.dom.className;
        if(field.getOriginalValue() != field.getValue())
            cn = f_replace(cn, 'v-bg-white', 'v-bg-yellow');
        else
            cn = f_replace(cn, 'v-bg-yellow', 'v-bg-white');
        field.m_wp.el.dom.className = cn;
    }
}

function f_handleFormIndicators(node, parentNode)
{
    if(node == undefined || node.m_inputPanel == undefined) return;

    ///////////////////////////////////////
    // handle commit error buffer to sure if node is clear from the buffer
    f_updateCommitErrors(node, parentNode);

    var fd = node.m_inputPanel.items.itemAt(V_IF_INDEX_INPUT);
    var type = fd.getXType();
    if(type == 'panel')
    {
        fd = fd.m_fd;
        type = fd.getXType();
    }

    /////////////////////////
    // handle field indicator
    var panelFlag = f_getNodeIndicatorFlag(node, true, parentNode);
    panelFlag = panelFlag == V_EMPTY_FLAG ? V_DIRTY_FLAG : panelFlag;
    switch(type)
    {
        case 'textfield':
        case 'numberfield':
        case 'combo':
            if(fd.el == undefined) break;
            var cn = fd.el.dom.className;
            fd.el.dom.className = f_replace(cn, 'v-textfield-unsubmit', '');

            if(node.attributes.value != undefined)
            {
                if(fd.getValue() == node.attributes.value)
                    panelFlag = V_EMPTY_FLAG;
            }
            else if(fd.getValue() != undefined && fd.getValue().length == 0)
                panelFlag = V_EMPTY_FLAG;
            break;
        case 'editorgrid':
            f_setGridViewClear(fd);
            break;
        case 'checkbox':
            var cn = fd.m_wp.el.dom.className;
            cn = f_replace(cn, 'v-bg-yellow', 'v-bg-white');
            fd.m_wp.el.dom.className = cn;
            fd.setOriginalValue(fd.getValue());
    }

    //////////////////////////
    // handle panel indicator
    var error = node.m_inputPanel.items.itemAt(V_IF_INDEX_DIRTY);
    f_updateDirtyIndicatorPanel(error, panelFlag);
}

function f_handleFieldError(node)
{
    if(node == undefined || node.m_inputPanel == undefined) return;

    var inputField = node.m_inputPanel.items.itemAt(V_IF_INDEX_INPUT);
    var type = inputField.getXType();

    if(type == 'editorgrid')
        f_setGridViewError(inputField);

    var error = node.m_inputPanel.items.itemAt(V_IF_INDEX_DIRTY);
    f_updateDirtyIndicatorPanel(error, V_ERROR_FLAG);
}

function f_updateDirtyIndicatorPanel(field, errType)
{
    if(field.el != undefined)
    {
        var html = field.el.dom.innerHTML;

        if(errType.indexOf('statusDown') > 0)
            html = f_createFlagIndicator(html, 'statusDown', V_ERROR_TITLE);
        else if(errType.indexOf('statusUnknown') > 0)
            html = f_createFlagIndicator(html, 'statusUnknown', V_DF_TITLE);
        else if(errType.indexOf('statusPlus') > 0)
            html = f_createFlagIndicator(html, 'statusPlus', V_DF_TITLE_ADD);
        else if(errType.indexOf('statusMinus') > 0)
            html = f_createFlagIndicator(html, 'statusMinus', V_DF_TITLE_DEL);
        else if(errType.indexOf('statusAddDeact') > 0)
            html = f_createFlagIndicator(html, 'statusAddDeact', V_DF_TITLE_ADD_DEACT);
        else if(errType.indexOf('statusAddAct') > 0)
            html = f_createFlagIndicator(html, 'statusAddAct', V_DF_TITLE_ADD_ACT);
        else
            html = f_createFlagIndicator(html, 'empty', V_EMPTY_TITLE);
        
        field.el.dom.innerHTML = html;
    }
}

function f_createFlagIndicator(html, flag, title)
{
    if(html.indexOf('empty') > 0 && flag != 'empty')
    {
        html = f_replace(html, 'empty', flag);
        html = html.replace(V_EMPTY_TITLE, title);
    }
    else if(html.indexOf('statusUnknown') > 0 && flag != 'statusUnknown')
    {
        html = f_replace(html, 'statusUnknown', flag);
        html = html.replace(V_DF_TITLE, title);
    }
    else if(html.indexOf('statusPlus') > 0 && flag != 'statusPlus')
    {
        html = f_replace(html, 'statusPlus', flag);
        html = html.replace(V_DF_TITLE_ADD, title);
    }
    else if(html.indexOf('statusMinus') > 0 && flag != 'statusMinus')
    {
        html = f_replace(html, 'statusMinus', flag);
        html = html.replace(V_DF_TITLE_DEL, title);
    }
    else if(html.indexOf('statusDown') > 0 && flag != 'statusDown')
    {
        html = f_replace(html, 'statusDown', flag);
        html = html.replace(V_ERROR_TITLE, title);
    }
    else if(html.indexOf('statusAddDeact') > 0 && flag != 'statusAddDeact')
    {
        html = f_replace(html, 'statusAddDeact', flag);
        html = html.replace(V_DF_TITLE_ADD_DEACT, title);
    }
    else if(html.indexOf('statusAddAct') > 0 && flag != 'statusAddAct')
    {
        html = f_replace(html, 'statusAddAct');
        html = html.replace(V_DF_TITLE_ADD_ACT, title);
    }

    return html;
}
