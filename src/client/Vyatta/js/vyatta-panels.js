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

function f_createNumberField(value, node, help, width, callback, mode)
{
    var oldVal = value != undefined ? value : node.attributes.defaultVal;
    var label = node.text;

    var field = new Ext.form.NumberField(
    {
        width: width,
        height:22,
        allowNegative: false,
        allowDecimals: false,
        maxValue: (Math.pow(2, 32) - 1),
        maskRe: /^\d+$/,
        value: oldVal,
        //onChange: keyupPressHandler//function(e, n, o){ },
        enableKeyEvents: true
        ,onBlur: mode == undefined ? callback : undefined
    });
    field.getOriginalValue = function()
    { return oldVal == undefined ? "" : oldVal; };
    field.setOriginalValue = function(val)
    { oldVal = val; }

    if(callback != undefined)
    {
        var keyupPressHandler = function(field, e)
        {
            f_enterKeyPressHandler(field, e, callback);
        }
        field.on('keyDown', keyupPressHandler);
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

    return p;
}

function f_createTextField(value, labelStr, helpStr, width, callback, node, mode)
{
    var oldVal = value != undefined ? value : node.attributes.defaultVal;
    var field = new Ext.form.TextField(
    {
        labelSeparator: ''
        ,width: width
        ,height:22
        ,value: oldVal
        ,enableKeyEvents: true
        ,onBlur: mode == undefined ? callback : undefined
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
            f_enterKeyPressHandler(field, e, callback);
        }
        field.on('keyup', keyupPressHandler);
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
                            isEditable, callback, node)
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

    if(callback != undefined)
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
    var oldVal = value != undefined ? value : node.attributes.defaultVal;
    var labelStr = node.text;
    var chk = f_getValueForCheckbox(oldVal);

    var field = new Ext.form.Checkbox(
    {
        style: 'anchor: 0%, text-align:right, padding:20px'
        ,checked: chk
        ,onClick: callback
    });
    field.getOriginalValue = function()
    { return !field.getValue() };
    field.setOriginalValue = function(val)
    { oldVal = val; }

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
        ,width: 830
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

function f_handleHelpButtonClick(panel, helpbutton, saveCookie)
{
    if(saveCookie)
        f_toggleHelpTips(helpbutton);
    else
        f_updateHelpButtonIcon(helpbutton)

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
        margins: '5 5 5 0'
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
                        'v_commit_button' : 'v_commit_button_no');

    if(m.m_discardBtn != undefined)
        tree.m_parent.m_discardBtn.setIconClass(tree.m_isCommitAvailable ?
                        'v_discard_button' : 'v_discard_button_no');

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

//////////////////////////////////////////////////////////////////
// if fields are already in panel, update it and return false. else
// do nothing and return true
function f_updateFieldValues2Panel(editorPanel, fields, node)
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
            // exist. Update the dirty flag and values if neccessary
            if(label != undefined && label.getXType() == 'label' &&
                label.html == cLabel.html)
            {
                ////////////////////////////////////////
                // handle field dirty indicator
                var nodeVals = node.attributes.values;
                if(node.attributes.configured == 'set' ||
                    node.attributes.configured_ == 'active_plus')
                {
                    if(getNodeStyleImage(node, false).length > 1)
                    {
                        var dField = f.items.item(V_IF_INDEX_DIRTY);
                        f_updateDirtyIndicatorPanel(dField, false);
                        dField.f_show();
                    }

                    ///////////////////////////////////////////
                    // update input field value
                    var updateF = f.items.itemAt(V_IF_INDEX_INPUT);
                    if(updateF.items != undefined)
                    {
                        var input = updateF.items.itemAt(0);
                        
                        if(input.getXType() == 'checkbox')
                        {
                            var newVal = nodeVals[1] != undefined?nodeVals[1]:
                                nodeVals[0];
                            input.setValue(f_getValueForCheckbox(newVal));
                        }
                    }
                    else if(updateF.getXType() == 'numberfield' ||
                        updateF.getXType() == 'textfield')
                    {
                        updateF.setValue(nodeVals);
                    }
                }
                else if(node.attributes.configured == 'active')
                {
                    var updateF = f.items.itemAt(V_IF_INDEX_INPUT);
                    if(updateF.items != undefined)
                    {
                        var input = updateF.items.itemAt(0);

                        if(input.getXType() == 'checkbox')
                        {
                            var newVal = nodeVals[1] != undefined?nodeVals[1]:
                                nodeVals[0];
                            input.setValue(f_getValueForCheckbox(newVal));
                        }
                    }
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

function f_addField2Panel(editorPanel, fields, node, row)
{
    ////////////////////////////////////////////////////
    // let find out if the fields are already existed
    // in editor. If they are, then update the values,
    // else add them to editor panel.
    if(!f_updateFieldValues2Panel(editorPanel, fields, node)) return;

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
    else  // editor panel is empty. create a form and add fields into it
    {
        var fieldP = new Ext.form.FormPanel(
        {
            fieldLabel: node != undefined ? node.text : undefined
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

function f_createEditorTitle(node, title)
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
                arrow = '&nbsp;&rArr;&nbsp;';
            }
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

    title = f_replace(title, '&rArr;', '');
    title = f_replace(title, 'Configuration&nbsp;', '');
    buttons[0] = new Ext.Button(
    {
        id: btn_id
        ,text: btnText
        ,tooltip: btnText + ' ' + title
        ,handler: function()
        {
            f_sendConfigCLICommand([cmd + treeObj.f_getNodePathStr(node) ],
                                    treeObj, node, isDelete);
        }
    });

    return new Ext.Panel(
    {
        items: buttons
        ,border: false
        ,bodyStyle: 'padding: 6px 2px 10px 8px'
        ,height: 55
        ,html: '<b>' + btnText + '</b> - ' + title + 
                '&nbsp;&nbsp;&nbsp;'+ //V_DIRTY_FLAG +
                '<br><hr class="hr-editor">'
                 
    });
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

function f_createOperButton(treeObj, node, btnText, title)
{
    var buttons = [ ];
    var btn_id = Ext.id();

    title = f_replace(title, '&rArr;', '');
    title = f_replace(title, 'Configuration&nbsp;', '');
    title = f_replace(title, '<', '&#60;');
    title = f_replace(title, '>', '&#62;');
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
                }
                else
                {
                    this.setText('Pause');
                    g_cliCmdObj.m_segPause = false;
                }
            }
        });
        buttons[1].hide();
        buttons[0].m_pauseBtn = buttons[1];
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
    treeObj.m_runButton = buttons[0];
    return panel;
}

function f_createLabel(value, labelFor)
{
    var lAlign = 'label_center';
    var width = 200;

    if(labelFor == V_LABEL_HELP)
    {
        value = f_replace(value, '<', '&#60;');
        value = f_replace(value, '>', '&#62;');
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
        //,html: '<pre><font face="courier new">' + values + '</font></pre>'  // monospace
        ,contentEl: el
    });
}

function f_handleInputFieldError(node)
{
    if(node == undefined || node.m_inputPanel == undefined) return;

    var inputField = node.m_inputPanel.items.itemAt(V_IF_INDEX_INPUT);
    var type = inputField.getXType();

    if(type == 'editorgrid')
        f_setGridViewError(inputField);

    var error = node.m_inputPanel.items.itemAt(V_IF_INDEX_DIRTY);
    f_updateDirtyIndicatorPanel(error, true);
}

function f_updateDirtyIndicatorPanel(field, isError)
{
    if(field.el != undefined)
    {
        var html = field.el.dom.innerHTML;
        if(isError)
        {
            if(html.indexOf('empty') > 0)
                html = f_replace(html, 'empty', 'statusDown');
            else
                html = f_replace(html, 'statusUnknown', 'statusDown');
        }
        else
        {
            if(html.indexOf('empty') > 0)
                html =  f_replace(html, 'empty', 'statusUnknown');
            else
                html =  f_replace(html, 'statusDown', 'statusUnknown');
        }

        field.el.dom.innerHTML = html;
    }
}

function f_enterKeyPressHandler(field, e, callback)
{
    //////////////////////////////////////////////////
    // check for ENTER key to trigger the 'login'
    // button
    if(e.getKey() == 13)
        callback.call();
}