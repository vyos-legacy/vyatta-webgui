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
            ////////////////////////////////
            // handle help tip button state
            if(f_needToggleHelpButton(this.m_helpTipButton))
                f_handleHelpButtonClick(this, this.m_helpTipButton, false);

            this.m_treeObj.f_setThisTreeObj(this.m_treeObj);

            //////////////////////////////////
            // end background segment process.
            g_cliCmdObj.m_segmentId = 'tabChanged';
            f_resetOperButton(this.m_treeObj.m_runButton);

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
            var ep = this.m_editorPanel;
            var eFormPanel = ep.items.itemAt(0);
            return eFormPanel.items.itemAt(0).m_title;
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
        // init tree object
        this.m_treeObj = new VYATTA_tree(this.m_tabName);
        this.m_treeObj.f_createTree(this);
        this.m_treeObj.m_tree.show();
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
        border: false
        ,bodyBorder: true
        ,width: 18
        ,height: 22
        ,html: html
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
    field.getOriginalValue = function()
    { return oldVal == undefined ? "" : oldVal; };
    field.setOriginalValue = function(val)
    { oldVal = val; }

    if(callback != undefined)
    {
        var keyupPressHandler = function(field, e)
        {
            if(e.getKey() == 9)
                f_handleFieldTab(field);

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
        ,items: [ f_createLabel(label, V_LABEL_LABEL),
                  field,
                  f_createFieldDirtyIndicatorPanel(node), f_createLabel(help
                  , V_LABEL_HELP) ]
    });
    p.m_node = node;
    node.m_inputPanel = p;

    return p;
}

function f_createTextField(treeObj, value, labelStr, helpStr, width, callback, node, mode)
{
    var oldVal = value != undefined ? value : node.attributes.defaultVal;

    var onBlurHandler = function()
    {
        callback(field);
    }

    var field = new Ext.form.TextField(
    {
        labelSeparator: ''
        ,width: width
        ,height:22
        ,value: oldVal
        ,enableKeyEvents: true
        ,onBlur: mode == 'confMode' ? onBlurHandler : undefined
    });
    field.m_mode = mode;
    field.getOriginalValue = function()
    { return oldVal == undefined ? "" : oldVal; };
    field.setOriginalValue = function(val)
    { oldVal = val; }

    if(callback != undefined)
    {
        var keyupPressHandler = function(field, e)
        {
            if(e.getKey() == 9)
                f_handleFieldTab(field);

            if(e.getKey() == 13 && mode == 'opMode')
                callback.call();
            else if(e.getKey() == 13 && mode == 'confMode')
                f_prepareConfFormCommandSend(treeObj);
        }
        field.on('keydown', keyupPressHandler);
    }

    helpStr = node.attributes.type != undefined ? helpStr+
                  " ("+node.attributes.type+")" : helpStr;

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
                            isEditable, callback, node, treeObj)
{
    var oldiVal = ival != undefined ? ival : node.attributes.defaultVal;
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
        value: oldiVal,
        hideParent: true
    });
    field.getOriginalValue = function()
    { return oldiVal == undefined ? "" : oldiVal; };
    field.setOriginalValue = function(val)
    { oldiVal = val; }

    var onCollapseHandler = function()
    {
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

    field.on('keydown', onKeyHandler);

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
        ,items: [ f_createLabel(labelStr, V_LABEL_LABEL),
                  fPanel, f_createFieldDirtyIndicatorPanel(node),
                  f_createLabel(helpStr, V_LABEL_HELP) ]
    });
    p.m_node = node;
    node.m_inputPanel = p;

    return p;
}

function f_getValueForCheckbox(value)
{
    return (value != undefined && (value == 'enable' || value == 'true')) ?
                true : false;
}
function f_createCheckbox(value, node, helpStr, width, callback)
{
    var oldVal = value != undefined ? value : node.attributes.defaultVal;
    var labelStr = node.text;
    var chk = f_getValueForCheckbox(oldVal);

    var onClickHandler = function()
    {
        field.setValue(!field.getValue());

        if(field.getValue() == f_getValueForCheckbox(oldVal))
            field.reset();

        callback(field);
    }
    var field = new Ext.form.Checkbox(
    {
        style: 'anchor: 0%, text-align:right, padding:20px'
        ,checked: chk
        ,onClick: onClickHandler
        ,bodyStyle: 'padding:0px 0px 3px 0px'
    });
    field.getOriginalValue = function()
    { return chk };
    field.setOriginalValue = function(val)
    { oldVal = val; }

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
        ,items: [ f_createLabel(labelStr, V_LABEL_LABEL), fPanel,
                  f_createFieldDirtyIndicatorPanel(node),
                  f_createLabel(helpStr, V_LABEL_HELP) ]
    });
    p.m_node = node;
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
    var field = f_createComboBox(thisObj.m_viewerValues, 1, false, "View");

    return new Ext.Panel(
    {
        //autoWidth: true
        height: 28
        ,width: 192
        ,maxWidth: 250
        ,boder: false
        ,bodyBorder: false
        ,collapsible: false
        ,cls: 'v-panel-with-background-color'
        ,html: '&nbsp;'
        //,tbar: [ 'View: ', field ]
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
                'view', panelObj.m_treeObj, 'Show configuration file'),
          panelObj.m_loadBtn = f_createToolbarButton('v_load_button',
                'load', panelObj.m_treeObj, 'Reload system'),
          panelObj.m_saveBtn = f_createToolbarButton('v_save_button',
                'save', panelObj.m_treeObj, 'Save configuration to file'),
          '-',
          //panelObj.m_undoBtn = f_createToolbarButton('v_undo_button', 'undo', panelObj.m_treeObj),
          //panelObj.m_redoBtn = f_createToolbarButton('v_redo_button', 'redo', panelObj.m_treeObj),
          //'-',
          panelObj.m_discardBtn = f_createToolbarButton('v_discard_button',
                              'discard', panelObj.m_treeObj,
                              'Discard changed'),
          panelObj.m_commitBtn = f_createToolbarButton('v_commit_button',
                                'commit', panelObj.m_treeObj,
                                'Commit changed')
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
            if(cmdName == 'save' || cmdName == 'load')
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
                else if(cmdName == 'view')
                    sendCmd = 'show configuration';

                f_sendOperationCliCommand(null, null, false, sendCmd,
                                          true, undefined, treeObj, supportCmd);
            }
            else
            {
                if(cmdName == 'view')
                    sendCmd = 'show session';

                /*/
                var discardCb = function(btn)
                {
                    if(btn == 'yes')
                        f_sendCLICommand(button, ['discard'], treeObj);
                }
                if(cmdName == 'discard')
                {
                    f_yesNoMessageBox('Discard',
                      'Are you sure you wish to discard all the new configuration?',
                      discardCb);
                    return;
                }*/

                f_sendCLICommand(this, [sendCmd], treeObj);
            }
        }
    });
}

function f_showConfigurationViewDialog(configData)
{
    var val = f_replace(configData, "\n", "<br>");
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

function f_showFileChooserDialog(command, values, treeObj)
{
    ///////////////////////////////////
    // parse values
    var val = [];
    if(values != undefined)
    {
        var l = values.split("\n");
        var j=0;
        for(var i=0; i<l.length; i++)
        {
            if(l[i].indexOf('rw') >= 0)
            {
                var w = l[i].split(' ');
                val[j++] = w[w.length-1];
            }
        }
    }

    var cb = function(btn)
    {
        var selVal = comb.lastQuery == undefined || comb.lastQuery == "" ?
                      comb.getValue() : comb.lastQuery;
        var cmd = command + " '" + V_CONFIG_DIR + selVal + "'";

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
            if(command == 'load')
                f_yesNoMessageBox('Re-load Configuration',
                      'Are you sure you wish to load the selected ' +
                      'configuration file: ' + comb.getValue() + '?', cb);
            else
                cb.call(null, null, ['save'], true);
        }
    });

    var cancelButton = new Ext.Button(
    {
        text: 'Cancel'
        ,minWidth: 70
        ,handler: function() { dialog.hide(); }
    })

    var editable = false;
    var title = 'Select a configuraton filename to reload';
    var dlgTitle = 'Reload Configuration';
    if(command == 'save')
    {
        editable = true;
        title = 'Select or enter a new configuration filename'
        dlgTitle = 'Save Configuration';
    }
    var comb = f_createComboBox(val, 0, editable, 'Filename');
    var loginFormPanel = new Ext.form.FormPanel(
    {
        labelWidth: 100
        ,frame:false
        ,border: false
        ,title: title
        ,bodyStyle:'padding:10px 10px 5px 10px'
        ,width: 390
        ,monitorValid: true
        ,items: [comb]
        ,buttons: [okButton, cancelButton]
    });

    var dialog = new Ext.Window(
    {
        title: dlgTitle
        ,reset_on_hide: true
        ,height: 150
        ,width: 405
        ,autoScroll: true
        ,items: [loginFormPanel]
    });

    dialog.show();
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

    if(!eForm.m_subBtnAdd && eForm.items.getCount() > 1)
    {
        f_addField2Panel(ePanel,
                  f_createConfSubButton(treeObj), node, V_TREE_ID_config);
        eForm.m_subBtnAdd = true;
    }

    eForm.doLayout();
    f_linkFormField(eForm);
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
            // exist. Update the dirty flag and values if neccessary
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

                if(mode == V_TREE_ID_config)
                {
                    if(eFormPanel.items.getCount() == 2)
                    {
                        ifield.focus(true, 500);
                        ifield.tabIndex = 0;
                    }
                }
                else if(mode == V_TREE_ID_oper)
                {
                    if(eFormPanel.items.getCount() == 3)
                    {
                        ifield.focus(true, 500);
                        ifield.tabIndex = 0;
                    }
                }
            }
        }
    }
    else  // editor panel is empty. create a form and add fields into it
    {
        var form = new Ext.form.FormPanel(
        {
            fieldLabel: node != undefined ? node.text : undefined
            ,autoScroll: true
            ,autoHeight: false
            ,bodyBorder: false
            ,align: 'center'
            ,items: fields
        });
        form.m_subBtnAdd = false;
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
    for (var i = 0; i < gridStore.getCount(); i++)
    {
        var rec = gridStore.getAt(i);
        if(rec.dirty)
            return true;
    }

    return false;
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

function f_createEditGrid(values, gridStore, record, node, 
                          helpLabel, width, callback, treeObj)
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

    if(callback != undefined)
    {
        var keypressHandler = function(e)
        {
            if(e.getKey() == 13)
                f_prepareConfFormCommandSend(treeObj);
        }
    }
    var tf = new Ext.form.TextField(
    {
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
        columns:
        [
          { id: 'value',
            header: 'Value',
            width: width-20,
            sortable: false,
            dataIndex: 'value',
            editor: tf
          }
        ]
    });
    grid.on('afteredit', callback);
    grid.m_textField = tf;

    helpLabel = node.attributes.type != undefined ? helpLabel+
                  " ("+node.attributes.type+")" : helpLabel;

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

function f_createConfEditorTitle(node, btnPanel)
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

    var title  = new Ext.Panel(
    {
        html: '<div valian="center"><b>' + titleName + '</b></div>'
        ,position: 'fixed'
        ,cls: 'v-border-less'
        ,border: false
        ,bodyStyle: 'padding: 15px 5px 5px 5px'
    });
    var items = btnPanel != null ? [title, btnPanel] : [title];

    var panel = new Ext.Panel(
    {
        layout: 'column'
        ,items: items
        ,height: 45
        ,cls: 'v-border-bottom'
        ,border: false
    });
    panel.m_title = titleName;

    var onResize = function()
    {
    }
    panel.on('resize', onResize);
    return panel;
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
    var buttons = [ ];
    var btn_id = Ext.id();

    buttons[0] = new Ext.Button(
    {
        id: btn_id
        ,text: 'Set'
        ,tooltip: 'Set configuration'
        ,height: 20
        ,minWidth: 75
        ,handler: function()
        {
            f_prepareConfFormCommandSend(treeObj);
        }
    });

    var bPanel = new Ext.Panel(
    {
        buttons: buttons
        ,bodyStyle: 'padding: 0px'
        ,border: false
        ,height: 0
        ,buttonAlign: 'right'
    });

    var panel = new Ext.Panel(
    {
        buttons: [bPanel]
        ,border: false
        ,bodyStyle: 'padding: 0px'
        ,height: 0
        ,width: 550
    });
    panel.m_buttons = buttons;
    panel.m_isSubmitBtn = true;

    return panel;
}

function f_createConfButton(treeObj, node, btnText, title)
{
    var buttons = [ ];
    var btn_id = Ext.id();
    var cmd = '';
    var isDelete = false;

    if(btnText == 'Delete')
        cmd = 'delete ';
    else if(btnText == 'Create')
    {
        cmd = 'set ';
        isDelete = true;
    }

    if(Ext.isIE)
    {
        title = f_replace(title, '&rarr;&nbsp;', '');
    }
    else
        title = f_replace(title, '&rArr;&nbsp;', '');
    title = f_replace(title, 'Configuration&nbsp;', '');

    buttons[0] = new Ext.Button(
    {
        id: btn_id
        ,text: btnText
        ,tooltip: btnText + ' ' + title
        ,height: 20
        ,handler: function()
        {
            f_sendConfigCLICommand([cmd + treeObj.f_getNodePathStr(node) ],
                                    treeObj, node, isDelete);
        }
    });

    var bPanel = new Ext.Panel(
    {
        buttons: buttons
        ,bodyStyle: 'padding: 0px'
        ,border: false
        ,height: 0
        ,buttonAlign: 'right'
        ,autoWidth: true
    });

    var panel = new Ext.Panel(
    {
        tbar: bPanel
        ,border: false
        ,bodyStyle: 'padding: 0px'
        ,height: 0
        ,width: 60
        ,minWidth: 40
        ,cls: 'v-panel-float-right'
    });
    panel.m_buttons = buttons;

    return panel;
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
                f_sendOperationCliCommand(node, treeObj, false,
                                          undefined, true, undefined,
                                          treeObj, undefined);
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
        ,minWidth: 52
        ,width:55
        ,height: 20
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
            ,height: 20
            ,handler: function()
            {
                if(this.text == 'Pause')
                {
                    this.setText('Resume');
                    g_cliCmdObj.m_segPause = true;
                    buttons[0].el.dom.className = V_PAUSE_CSS;
                }
                else
                {
                    this.setText('Pause');
                    g_cliCmdObj.m_segPause = false;
                    buttons[0].el.dom.className = V_WAIT_CSS;
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
        ,buttonAlign: 'left'
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

function f_createLabel(value, labelFor)
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
            value = value + '.';
        }
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
    var el = document.createElement("div");
    el.id = 'id_op_txt_output'+Ext.id();
    el.innerHTML = '<pre id="id_op_output"><font face="courier new">'+values+'</font></pre>';

    return new Ext.Panel(
    {
        border: true
        ,style: 'padding:5px'
        ,autoWidth: true
        ,height: height
        ,autoScroll: true
        ,contentEl: el
    });
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
    else if(fType == 'editorgrid')
    {
        var view = field.getView();
        var row = view.m_row;
        var rec = field.getAt(row);
        if(rec.dirty)
            view.addRowClass(row, "v-textfield-unsubmit");
        else
            view.addRowClass(row, "v-textfield-submit");
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

function f_handleFormIndicators(node)
{
    if(node == undefined || node.m_inputPanel == undefined) return;

    var fd = node.m_inputPanel.items.itemAt(V_IF_INDEX_INPUT);
    var type = fd.getXType();
    if(type == 'panel')
    {
        fd = fd.m_fd;
        type = fd.getXType();
    }

    /////////////////////////
    // handle field indicator
    switch(type)
    {
        case 'textfield':
        case 'numberfield':
        case 'combo':
            var cn = fd.el.dom.className;
            fd.el.dom.className = f_replace(cn, 'v-textfield-unsubmit', '');
            break;
        case 'editorgrid':
            f_setGridViewClear(fd);
            break;
        case 'checkbox':
            var cn = fd.m_wp.el.dom.className;
            cn = f_replace(cn, 'v-bg-yellow', 'v-bg-white');
            fd.m_wp.el.dom.className = cn;
            break;
    }

    //////////////////////////
    // handle panel indicator
    var error = node.m_inputPanel.items.itemAt(V_IF_INDEX_DIRTY);
    f_updateDirtyIndicatorPanel(error, V_DIRTY_FLAG);
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
    var err = V_ERROR_FLAG;
    if(errType.indexOf('statusDown') > 0)
        err = 'error';
    else if(errType.indexOf('statusUnknown') > 0)
        err = 'mod';
    else if(errType.indexOf('statusPlus') > 0)
        err = 'add';
    else if(errType.indexOf('statusMinus') > 0)
        err = 'del';

    if(field.el != undefined)
    {
        var html = field.el.dom.innerHTML;
        switch(err)
        {
            case 'error':
                html = f_createFlagIndicator(html, 'statusDown');
                break;
            case 'mod':
                html = f_createFlagIndicator(html, 'statusUnknown');
                break;
            case 'add':
                html = f_createFlagIndicator(html, 'statusPlus');
                break;
            case 'del':
                html = f_createFlagIndicator(html, 'statusMinus');
        }

        field.el.dom.innerHTML = html;
    }
}

function f_createFlagIndicator(html, flag)
{
    if(html.indexOf('empty') > 0 && flag != 'empty')
        html = f_replace(html, 'empty', flag);
    else if(html.indexOf('statusUnknown') > 0 && flag != 'statusUnknown')
        html = f_replace(html, 'statusUnknown', flag);
    else if(html.indexOf('statusPlus') > 0 && flag != 'statusPlus')
        html = f_replace(html, 'statusPlus', flag);
    else if(html.indexOf('statusMinus') > 0 && flag != 'statusMinus')
        html = f_replace(html, 'statusMinus', flag);
    else if(html.indexOf('statusDown') > 0 && flag != 'statusDown')
        html = f_replace(html, 'statusDown', flag);

    return html;
}
