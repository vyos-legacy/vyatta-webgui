/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

///////////////////////////////////////////////////////////////////////////////
//
VyattaNodeUI = Ext.extend(Ext.tree.TreeNodeUI,
{
    getNodeStyle: function(node)
    {
        if(node.attributes.configured == undefined)
            return ' class="v-node-nocfg" style="color:black;"';
        else if(node.attributes.configured == 'active')
            return ' class="v-node-active" style="color:black;"';
        else if(node.attributes.configured == 'set')
            return ' class="v-node-set" style="color:black;"';
        else if(node.attributes.configured == 'delete')
            return ' class="v-node-delete" style="color:black;"';

        return '';
    },

    getNodeStyleImage: function(node)
    {
        return getNodeStyleImage(node);
    },

    renderElements: function(n, a, targetNode, bulkRender)
    {
        ////////////////////////////////////////////////////
        // tree display only parent node.
        if(n.leaf)
        {
            //VyattaNodeUI.superclass.apply(arguments);
            n.ui.rendered = false;
            return;
        }
        
        this.indentMarkup = n.parentNode ? n.parentNode.ui.getChildIndent() : '';
        var cb = typeof a.checked == 'boolean';
        var href = a.href ? a.href : Ext.isGecko ? "" : "#";
        var styleStr = this.getNodeStyle(n);
        var styleImg = this.getNodeStyleImage(n);
        var buf =
        [
          '<li class="x-tree-node"><div ext:tree-node-id="', n.id,
          '" class="x-tree-node-el x-tree-node-leaf x-unselectable ', a.cls,
          '" unselectable="on">',
          '<span class="x-tree-node-indent">', this.indentMarkup, "</span>",
          '<img src="', this.emptyIcon, '" class="x-tree-ec-icon x-tree-elbow" />',
          '<img src="', a.icon || this.emptyIcon, '" class="x-tree-node-icon',
          (a.icon ? " x-tree-node-inline-icon" : ""),
          (a.iconCls ? " "+a.iconCls : ""),'" unselectable="on" />',
          cb ? ('<input class="x-tree-node-cb" type="checkbox" '
                + (a.checked ? 'checked="checked" />' : '/>')) : '',
          '<a hidefocus="on" class="x-tree-node-anchor" href="', href,
          '" tabIndex="1" ',
          a.hrefTarget ? ' target="'+a.hrefTarget+'"' : "",
          '><span unselectable="on"' + styleStr + '>',
          styleImg, n.text,
          "</span></a></div>",
          '<ul class="x-tree-node-ct" style="display:none;"></ul>', "</li>"
        ].join('');

        var nel;
        if(bulkRender !== true && n.nextSibling
           && (nel = n.nextSibling.ui.getEl()))
            this.wrap = Ext.DomHelper.insertHtml("beforeBegin", nel, buf);
        else
            this.wrap = Ext.DomHelper.insertHtml("beforeEnd", targetNode, buf);

        this.elNode = this.wrap.childNodes[0];
        this.ctNode = this.wrap.childNodes[1];
        var cs = this.elNode.childNodes;
        this.indentNode = cs[0];
        this.ecNode = cs[1];
        this.iconNode = cs[2];
        var index = 3;

        if(cb)
        {
          this.checkbox = cs[3];
          // fix for IE6
          this.checkbox.defaultChecked = this.checkbox.checked;
          index++;
        }

        this.anchor = cs[index];
        this.textNode = cs[index].firstChild;
        n.getOwnerTree().m_parent.f_onRenderer(this);
    }
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
MyTreeLoader = Ext.extend(Ext.tree.TreeLoader,
{
    m_tree: undefined,

    requestData: function(node, callback)
    {
        //////////////////////////////////////
        // if user is not login prompt message
        if(!f_isLogined(true, true))
        {
          // no sid. do nothing.
          if(typeof callback == "function")
              callback();

          return;
        }

        if(this.fireEvent("beforeload", this, node, callback) !== false)
        {
            var cstr = "<vyatta><configuration><id>";

            switch(this.g_loadMode)
            {
                case V_TREE_ID_config_data:
                    cstr = "<vyatta><configuration mode='data'><id>";
                  break;
                case V_TREE_ID_oper:
                  cstr = "<vyatta><configuration mode='op'><id>";
                  break;
            }

            var xmlstr = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                       + cstr + f_getUserLoginedID() + "</id>\n"
                       + "<node>" + this.baseParams.nodepath + "</node>\n"
                       + "</configuration></vyatta>\n";


            this.transId = Ext.Ajax.request(
            {
                method:this.requestMethod,
                url: this.dataUrl||this.url,
                success: this.handleResponse,
                failure: this.handleFailure,
                scope: this,
                argument: {callback: callback, node: node},
                //params: this.baseParams
                xmlData: xmlstr
            });

        }
        else
        {
            // if the load is cancelled, make sure we notify
            // the node that we are done
            if(typeof callback == "function")
                callback();
        }
    },

    processResponse: function(response, node, callback)
    {
        var xmlRoot = response.responseXML.documentElement;
        var q = Ext.DomQuery;

        var nodes = q.select('node', xmlRoot);
        if (nodes.length == 0)
        {
            response.responseText = '[ ]';
            return MyTreeLoader.superclass.processResponse.apply(this, arguments);
        }

        var str = '';
        for(var i = 0; i < nodes.length; i++)
        {
            if (str != '')
                str += ',';

            str += this.f_jsonGenNode(nodes[i], nodes[i].getAttribute('name'));
        }

        switch(this.g_loadMode)
        {
            case V_TREE_ID_config:
            {
                response.responseText = '[' + str + ']';
                //rootNode = node.getOwnerTree().getRootNode();
                //rootNode.setText('Configuration');

                return MyTreeLoader.superclass.processResponse.apply(this, arguments);
            }
            case V_TREE_ID_oper:
            {
                var rootNode = node.getOwnerTree().getRootNode();
                rootNode.setText('Operation');
                response.responseText = '[' + str + ']';
                return MyTreeLoader.superclass.processResponse.apply(this, arguments);
            }
        }
    },

    f_jsonGenNode: function(node, nn)
    {
      if(nn == 'node.tag')
          nn = '&lt;value&gt;';

        var str = "{text:'" + nn + "',uiProvider:'node'";
        var q = Ext.DomQuery;
        var nLeaf = q.selectNode('terminal', node);

        if(nLeaf != undefined)
        {
            str += ",leaf:true";
            var nvals = q.select('value', nLeaf);
            if (nvals.length > 0)
            {
                var vstr = '';
                for (var i = 0; i < nvals.length; i++)
                {
                    var cfgd = q.selectValue('configured', nvals[i], 'NONE');
                    if (cfgd == 'active' || cfgd == 'set')
                    {
                        if (vstr != '')
                            vstr += ',';

                        vstr += "'" + nvals[i].getAttribute('name') + "'";
                    }
                }
                str += ",values:[ " + vstr + " ]";
            }
        }

        var nType = q.selectNode('type', node);
        if (nType != undefined)
            str += ",type:'" + nType.getAttribute('name') + "'";

        var nMulti = q.selectNode('multi', node);
        if (nMulti != undefined)
            str += ",multi:true";

        var tHelp = q.selectValue('help', node);
        if (tHelp != undefined)
        {
            tHelp = tHelp.replace(/'/g, "\\'", 'g');
            str += ",help:'" + tHelp + "'";
        }

        var tConfig = q.selectValue('configured', node);
        if (tConfig != undefined)
            str += ",configured:'" + tConfig + "'";

        var nenums = q.selectNode('enum', node);
        if (nenums != undefined)
        {
            var enums = q.select('match', nenums);
            var vstr = '';
            for (var i = 1; i <= enums.length; i++)
            {
                if (vstr != '')
                    vstr += ',';

                vstr += "'" + q.selectValue('match:nth(' + i + ')', nenums) + "'";
            }

            str += ",enums:[ " + vstr + " ]";
        }
        str += "}";

        return str;
    }
});

/*******************************************************************************
 ///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
 *******************************************************************************/
VYATTA_tree = Ext.extend(Ext.util.Observable,
{
    ////////////////////////////////////////////////////////////////////////////
    // local var members....
    // m_parent = an object whose create it.... vyatta-panel
    // m_tree
    // m_treePanel
    // m_treeMode = V_TREE_ID_config/ V_TREE_ID_oper
    // m_treeLoader
    ////////////////////////////////////////////////////////////////////////////
    constructor: function(tabName)
    {
        this.m_treeMode = tabName;
    },

    m_isCommitAvailable : false,

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    f_setThisTreeObj: function(thisObj)
    {
        m_thisObj = thisObj;
    },

    f_createTree: function(parent)
    {
        m_thisObj = this;
        this.m_parent = parent;

        //////////////////////////////////////////////////////////
        // create tree loader
        this.m_treeLoader = new MyTreeLoader(
        {
            clearOnLoad: true
            ,requestMethod: 'POST'
            ,dataUrl: '/cgi-bin/webgui-wrap'
            ,uiProviders:
            {
                'node': VyattaNodeUI
            }
        });
        this.m_treeLoader.g_loadMode = parent.m_tabName;
        this.m_treeLoader.m_tree = this;

        ///////////////////////////////////////////////
        // create tree, then set tree root node
        this.m_tree = new Ext.tree.TreePanel(
        {
            bodyBorder: false
            ,border: false
            ,animate: true
            ,cls: 'vborder_less'
            ,pathSeparator: ' '
            ,rootVisible: false
            ,defaults: {autoScroll:true, bodyBorder:false}
            ,loader: this.m_treeLoader
        });
        new Ext.tree.TreeSorter(this.m_tree, {folderSort: true});
        this.m_tree.m_parent = this;

        /////////////////////////////////////////////
        // create tree panel
        this.m_treePanel = new Ext.Panel(
        {
            defaults: { autoScroll:true }
            ,items: this.m_Tree
            ,cls: 'v_tree'
        });

        ///////////////////////////////////////////////////////
        // set tree root node
        if(this.m_treeMode == V_TREE_ID_config)
        {
            this.m_tree.setRootNode(this.f_getConfigRootNode());
            this.initTreeListeners(this.m_tree, this.f_HandleNodeConfigClick, 
                  this.f_handleSelectedNodeExpand);
        }
        else// if(this.m_treeMode == V_TREE_ID_oper)
        {
            this.m_tree.setRootNode(this.f_getOperationRootNode());
            this.initTreeListeners(this.m_tree, this.f_handleNodeOperClick, 
                  this.f_handleSelectedNodeExpand);
        }

        this.m_tree.getRootNode().expand(false, false);
    },

    /////////////////////////////////////////////////////////////
    //
    f_handleSelectedNodeExpand: function()
    {
        if(this.m_parent.m_selNodePath != undefined)
        {
            var treeObj = this.m_parent;
            var len = treeObj.m_selNodePath.length;
            var snode = treeObj.m_selNodePath.substr(1, len);
            snode = snode.split(" ");
            var node = treeObj.m_tree.getRootNode().firstChild;

            ////////////////////////////////////////////////
            // find the selected node by given the path
            for(var i=0; i<snode.length; i++)
            {
                if(snode[i] == 'Configuration' || snode[i] == 'Operation')
                    continue;

                while(node != undefined)
                {
                    if(node.text == snode[i])
                        break;

                    node = node.nextSibling;
                }

                ////////////////////////////////////////
                // drill down to next level
                if(i+1 < snode.length)
                {
                    node.expand();
                    var cNode = node.firstChild;

                    /////////////////////////////////////////////
                    // get cNode from server if it's not defined
                    if(cNode == undefined)
                    {
                        var isUserClick = false;

                        /////////////////////////////////////
                        // cNode could be deleted. if this is
                        // the case, get its parent instead
                        if(treeObj.m_cmd != undefined && treeObj.m_cmd == 'delete')
                        {
                            cNode = node;
                            isUserClick = true;
                        }

                        treeObj.f_handleExpandNode(cNode, treeObj, isUserClick);
                        return;
                    }

                    node = cNode;
                }
            }

            ///////////////////////////////////////
            // reset the select node path
            treeObj.m_selNodePath = undefined;

            ////////////////////////////////////
            // if select node found, expand it
            treeObj.f_handleExpandNode(node, treeObj, true);
        }
    },

    f_handleExpandNode: function(node, treeObj, handleClick)
    {
        if(treeObj.m_cmd != undefined && treeObj.m_cmd == 'delete')
        {
            treeObj.m_cmd = undefined;
            treeObj.m_parent.f_cleanEditorPanel();
        }

        if(node != undefined)
        {
            var handler = function(narg)
            {
                if(handleClick)
                {
                    treeObj.m_tree.getSelectionModel().select(node);
                    node.ensureVisible();
                    
                    treeObj.f_HandleNodeConfigClick(node, null, undefined);
                }

                narg.un('expand', handler);
            }

            node.on('expand', handler);
            node.expand();
        }
    },

    f_resizeTreePanel: function(w, h)
    {
        this.m_treePanel.setSize(w-10, h-10);
        this.m_tree.setSize(w-10, h-10);
    },

    f_getNodePathStr: function(node)
    {
        if(node.ownerTree == null)
            node.ownerTree = this.m_tree;

        var str = node.getPath('text');
        str = str.replace(/^ Configuration /, '');

        return str;
    },

    f_getConfigRootNode: function()
    {
        var root = new Ext.tree.AsyncTreeNode(
        {
            text: 'Configuration'
            ,draggable:false // disable root node dragging
            ,cls: 'v-node-active'
            ,id:'rootNodeConfig'
        });

        return root;
    },

    f_getOperationRootNode: function()
    {
        var root = new Ext.tree.AsyncTreeNode(
        {
            text: 'Operation'
            ,draggable:false // disable root node dragging
            ,cls: 'v-node-active'
            ,id:'operNodeConfig'
        });

        return root;
    },

    f_onRenderer: function(treeNodeUI)
    {
        //////////////////////////////////////////////////////
        // walk through tree to set Commit flag. if any node's
        // attribute had sent down to server, this flag is set
        var child = this.m_tree.getRootNode().firstChild;
        this.m_isCommitAvailable = false;
        while(child != undefined)
        {
            if(child.attributes.configured == 'set')
            {
                this.m_isCommitAvailable = true;
                break;
            }
            child = child.nextSibling;
        }

        ////////////////////////////////////////////////////////
        // let the working panels know.
        if(m_thisObj.m_parent != undefined)
            m_thisObj.m_parent.f_onTreeRenderer(m_thisObj);
    },

    initTreeListeners: function(tree, nodeClickHandler, nodeLoadedHandler)
    {
        tree.getLoader().on('beforeload', function(loader, node)
        {
            var str = node.getPath('text');
            var path = '';

            switch(loader.g_loadMode)
            {
                case V_TREE_ID_config:
                  path = str.replace(/^ Configuration/, '');
                  loader.baseParams.nodepath = path;
                  break;
                case V_TREE_ID_oper:
                  path = str.replace(/^ Operation/, '');
                  path = path.replace('&lt;value&gt;', 'node.tag', 'g');
                  loader.baseParams.nodepath = path;
                  break;
            }
        });

        tree.on('beforeexpandnode', function(node, deep, anim)
        {
            ///////////////////////////////////////////
            // avoid to reload again on root configuration.
            if(node.getPath('text') != ' Configuration' &&
                                    node.getPath('text') != ' Operation')
            {
                    node.reload();
            }
        });

        tree.on('beforecollapsenode', function(node, deep, anim)
        {
            node.collapseChildNodes(true);
        });

        tree.on('click', nodeClickHandler);

        tree.on('load', nodeLoadedHandler);
    },

    ////////////////////////////////////////////////////////////////////////////
    // node click handler for configuration tree
    f_HandleNodeConfigClick: function(node, e, dontClear)
    {
        var titlePanel = '';
        if(!f_isLogined(true, true))
        {
            window.location = g_baseSystem.m_homePage;
            return;
        }

        if(m_thisObj.m_parent.m_editorPanel == undefined)
            m_thisObj.m_parent.f_createEditorPanel();

        if(dontClear == undefined || !dontClear)
        {
            titlePanel = f_createEditorTitle(node);

            ////////////////////////////////////////////////////
            // do not clear editor if in the same node
            if(m_thisObj.m_parent.f_getEditorTitle() != titlePanel.title)
            {
                m_thisObj.m_parent.f_cleanEditorPanel();
                f_addField2Panel(m_thisObj.m_parent.m_editorPanel, titlePanel,
                              node.text);
            }
            m_thisObj.f_handleButton(node, titlePanel.title);
        }

        if(node.leaf)
        {
            if(node.attributes.multi == undefined || !node.attributes.multi)
                m_thisObj.f_leafSingleHandler(node);
            else
                m_thisObj.f_leafMultiHandler(node);
        }
        else
        {
            // non-leaf
            node.expand(false, true, function(n)
            {
                if (n.attributes.multi == undefined || !n.attributes.multi)
                {
                    // a second chance to add button for case all the child nodes
                    // has not retrieve from server yet.
                    if(m_thisObj.m_parent.f_getEditorItemCount() < 2)
                        m_thisObj.f_handleButton(n, titlePanel.title);

                    m_thisObj.f_interHandler(n);
                }
                else
                    m_thisObj.f_interMultiHandler(n);
            });
        }
    },

    f_interHandler: function(node)
    {
        // do nothing for root
        if(m_thisObj.f_getNodePathStr(node) == ' Configuration')
            return;

        // allow configuring all children in edit panel
        var cnodes = node.childNodes;
        for (var i = 0; i < cnodes.length; i++)
        {
            var cnode = cnodes[i];
            if(cnode.leaf)
                m_thisObj.f_HandleNodeConfigClick(cnode, null, true);
        }

        // help string
        if (node.attributes.help != undefined)
        {
            var label = new Ext.form.Label(
            {
                text: node.attributes.help
            });
        }

        m_thisObj.m_parent.m_editorPanel.doLayout();
    },

    f_interMultiHandler: function(node)
    {
        /*
         *   all: "add" field
         *   configured-active: "delete"
         *   configured-added: "delete"
         */
        var nodePath = m_thisObj.f_getNodePathStr(node);
        var cNode = node;
        var callback = function()
        {
            m_thisObj.m_setField = node.getValFieldFunc();
            f_sendConfigCLICommand([ 'set ' + nodePath
                             + " " + dField.getValue() ], m_thisObj, cNode, true);
        }

        var field = f_createTextField(undefined, 'Create ' + node.text + ' value',
                      node.attributes.help, 250, callback, node);
        f_addField2Panel(m_thisObj.m_parent.m_editorPanel, field, node.text);
        node.getValFieldFunc = function()
        {
            return field;
        }
        var dField = field.items.itemAt(V_IF_INDEX_INPUT);

        node.getValFunc = function()
        {
            return dField.getValue();
        }

        m_thisObj.m_parent.m_editorPanel.doLayout();
    },

    f_leafSingleHandler: function(node)
    {
        // help string
        var helpStr = node.attributes.help;
        var nodePath = m_thisObj.f_getNodePathStr(node);
        var cNode = node;

        var onBlur = function()
        {
            var val = cNode.getValFunc();
            var cmdAction = (val == undefined ||
                            val.length == 0) ?
                                'delete ' : 'set ';
            m_thisObj.m_setField = node.getValFieldFunc();

            if(cNode.attributes.type == undefined)
                // typeless
                f_sendConfigCLICommand([ cmdAction + nodePath],
                              m_thisObj, cNode,
                              cmdAction == 'delete'?false:true);
            else if(cNode.getValFunc != undefined)
                f_sendConfigCLICommand([ cmdAction + nodePath + " " + val ],
                              m_thisObj, cNode, cmdAction == 'delete'?false:true);
        }

        if (node.attributes.enums != undefined)
            m_thisObj.f_leafSingleEnumHandler(node, node.attributes.enums, helpStr, onBlur);
        else if (node.attributes.type == undefined)
        {
            // type-less node
            // XXX needs a handler
        }
        else if (node.attributes.type == 'bool')
            m_thisObj.f_leafSingleBoolHandler(node, helpStr, onBlur);
        else if (node.attributes.type == 'u32')
            m_thisObj.f_leafSingleU32Handler(node, helpStr, onBlur);
        else
            //if (node.attributes.type == 'text') {
            // XXX treat everything else as text for now
            m_thisObj.f_leafSingleTxtHandler(node, helpStr, onBlur);

        m_thisObj.m_parent.m_editorPanel.doLayout();
    },

    f_leafMultiHandler: function(node)
    {
        //////////////////////////////
        // help string
        var hlabel = node.attributes.help;
        var nodePath = m_thisObj.f_getNodePathStr(node);

        var onBlur = function()
        {
            if(node.getValsFunc != undefined)
            {
                var varr = [ ];

                ////////////////////////////////////////////
                // make sure delete prev node before set
                //if(node.valuesCount != undefined && node.valuesCount > 0)
                varr = [ 'delete ' + nodePath ];

                var values = node.getValsFunc();
                var jj = (varr.length != undefined) ? varr.length : 0;

                for(var i=0; i<values.length; i++)
                    varr[i+jj] = 'set ' + nodePath + " " + values[i];

                f_sendConfigCLICommand(varr, m_thisObj, node, true);
            }
        }

        if(node.attributes.enums != undefined)
            m_thisObj.f_leafMultiEnumHandler(node, node.attributes.enums, hlabel, onBlur);
        else if(node.attributes.type == 'u32')
            m_thisObj.f_leafMultiU32Handler(node, hlabel, onBlur);
        else
            //if (node.attributes.type == 'text') {
            // XXX treat everything else as text for now
            m_thisObj.f_leafMultiTxtHandler(node, hlabel, onBlur);

        m_thisObj.m_parent.m_editorPanel.doLayout();
    },

    ////////////////////////////////////////////////////////////////////////////
    //
    f_leafSingleTxtHandler: function(node, hlabel, callback)
    {
        var ival = undefined;

        if(node.attributes.values != undefined)
            ival = node.attributes.values[0];

        var field = f_createTextField(ival, node.text, hlabel, 250, callback, node);
        node.getValFieldFunc = function()
        {
            return field;
        }
        f_addField2Panel(m_thisObj.m_parent.m_editorPanel, field, node.txt);


        var vfield = field.items.itemAt(V_IF_INDEX_INPUT);
        node.getValFunc = function()
        {
            return vfield.getValue();
        }
    },

    f_leafSingleEnumHandler: function(node, values, helpStr, callback)
    {
        var ival = undefined;
        if (node.attributes.values != undefined)
            ival = node.attributes.values[0];

        var narr = filterWildcard(values);
        var isEditable = false;
        if (narr != undefined)
        {
            isEditable = true;
            values = narr;
        }

        var field1 = undefined;
        var isCheckbox = undefined;

        if(values.length == 2 && (values[0] == 'enable' || values[0] == 'disable'))
        {
            isCheckbox = true;
            field1 = f_createCheckbox(ival, node, helpStr, 250, callback);
        }
        else
        {
            isCheckbox = false;
            field1 = f_createCombobox(values, ival,
                      'Select a valid value...', node.text, 250,
                      helpStr, isEditable, callback, node);
            //field2 = f_createCombobox(values, ival,
              //        'Select a valid value...', node.text, 250,
                //      helpStr, isEditable, callback);
        }

        node.getValFieldFunc = function()
        {
            return field1;
        }
        f_addField2Panel(m_thisObj.m_parent.m_editorPanel, field1, node.txt);

        node.getValFunc = function()
        {
            var val =  field1.items.itemAt(V_IF_INDEX_INPUT).items.itemAt(0).getValue();
            if(isCheckbox)
                return (val != undefined && val) ? 'disable' : 'enable';
            else
                return (val != undefined) ? val : '';
        }
    },

    f_leafMultiEnumHandler: function(node, values, hlabel, callback)
    {
        var vala = [ ];
        var gridStore = new Ext.data.SimpleStore(
        {
            fields: [{ name: 'value' }]
        });

        gridStore.loadData(vala);
        if(node.attributes.values != undefined)
            vala = node.attributes.values;

        var GridT = Ext.data.Record.create([{ name: 'value' }]);
        var narr = filterWildcard(values);
        var doValidate = true;
        if(narr != undefined)
        {
            doValidate = false;
            values = narr;
        }

        var grid = f_createEditGrid(vala, gridStore, GridT, node, hlabel, 250, callback);
        node.getValFieldFunc = function()
        {
            return grid;
        }

        f_addField2Panel(m_thisObj.m_parent.m_editorPanel, grid, node.txt);

        node.getValsFunc = function()
        {
            return f_getEditGridValues(gridStore);
        }
    },

    f_leafMultiU32Handler:  function(node, hlabel, callback)
    {
        var vala = [ ];
        var gridStore = new Ext.data.SimpleStore(
        {
            fields: [ { name: 'value' } ]
        });

        gridStore.loadData(vala);
        if (node.attributes.values != undefined)
            vala = node.attributes.values;

        var GridT = Ext.data.Record.create([{ name: 'value' }]);
        var grid = f_createEditGrid(vala, gridStore, GridT, node, hlabel, 250, callback);
        node.getValFieldFunc = function()
        {
            return grid;
        }

        f_addField2Panel(m_thisObj.m_parent.m_editorPanel, grid, node.txt);

        node.getValsFunc = function()
        {
            return f_getEditGridValues(gridStore);
        }
    },

    f_leafMultiTxtHandler: function(node, hlabel, callback)
    {
        var vala = [ ];
        var gridStore = new Ext.data.SimpleStore(
        {
            fields: [ { name: 'value' } ]
        });

        gridStore.loadData(vala);
        if(node.attributes.values != undefined)
            vala = node.attributes.values;

        node.valuesCount = vala.length;

        var GridT = Ext.data.Record.create(
        [
            { name: 'value' }
        ]);

        var grid = f_createEditGrid(vala, gridStore, GridT, node, hlabel, 250, callback);
        node.getValFieldFunc = function()
        {
            return grid;
        }
        f_addField2Panel(m_thisObj.m_parent.m_editorPanel, grid, node.txt);

        node.getValsFunc = function()
        {
            return f_getEditGridValues(gridStore);
        }
    },

    f_leafSingleU32Handler: function(node, hlabel, callback)
    {
        var ival = undefined;

        if (node.attributes.values != undefined)
            ival = node.attributes.values[0];

        var field = f_createNumberField(ival, node, hlabel, 250, callback);
        node.getValFieldFunc = function()
        {
            return field;
        }
        f_addField2Panel(m_thisObj.m_parent.m_editorPanel, field, node.txt);

        var vfield = field.items.itemAt(V_IF_INDEX_INPUT);
        node.getValFunc = function()
        {
            return vfield.getValue();
        }
    },

    f_leafSingleBoolHandler: function(node, hlabel, callback)
    {
        m_thisObj.f_leafSingleEnumHandler(node, [ 'true', 'false' ], hlabel, callback);
    },

    ////////////////////////////////////////////////////////////////////////////
    // node click handler for operation tree
    f_handleNodeOperClick: function(node, e)
    {
        if(!f_isLogined(true, true))
        {
            window.location = g_baseSystem.m_homePage;
            return;
        }

        var vPanel = m_thisObj.m_parent;

        if(vPanel.m_editorPanel == undefined)
            vPanel.f_createEditorPanel();

        vPanel.f_cleanEditorPanel();

        /////////////////////////////////////////
        // on input field blur callback function
        var inputFieldOnBlur = function()
        {
            m_thisObj.m_prevXMLStr = f_sendOperationCliCommand(node,
                                      m_thisObj, true, m_thisObj.m_prevXMLStr);
        }

        ///////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////
        var str = node.getPath('text');
        var path = str.replace(/^ Operation/, '');
        path = path.replace('&lt;value&gt;', '<value>', 'g');
        var labelStr = path;

        var nodeArray = [ ];
        var labelArray = [ ];
        var nNode = node;
        while(nNode.text != 'Operation')
        {
            if (nNode.text == '&lt;value&gt;')
            {
                nodeArray.push(nNode);
                nNode = nNode.parentNode;
                continue;
            }

            labelArray.push(nNode.text);
            nNode = nNode.parentNode;
        }

        labelStr = '';
        while(labelArray.length > 0)
        {
            var c = labelArray.pop();
            if(labelStr.length > 1)
                labelStr += ' ';

            labelStr += c;
        }

        var field = null;
        while(nodeArray.length > 0)
        {
            nNode = nodeArray.pop();
            var helpStr = undefined;

            if(nNode.attributes.help != undefined)
                helpStr = nNode.attributes.help;

            if(nNode.attributes.enums != undefined)
            {
                var values = nNode.attributes.enums;

                /* TODO: backend needs to return proper enums */
                /*var wild = filterWildcard(values);
                  var isEditable = false;
                  if (wild != undefined) {
                    isEditable = true;
                    values = wild;
                  }*/

                field = f_createCombobox(values,
                            'Select a valuid value...', undefined,
                            labelStr, 250,
                            helpStr, true, 
                            inputFieldOnBlur, nNode);

                f_addField2Panel(vPanel.m_editorPanel, field, labelStr);

                field = field.items.itemAt(V_IF_INDEX_INPUT).items.itemAt(0);
            }
            else
            {
                field = f_createTextField('', labelStr, helpStr,
                                          250, inputFieldOnBlur, node);
                f_addField2Panel(vPanel.m_editorPanel, field, helpStr);

                field = field.items.itemAt(V_IF_INDEX_INPUT);
            }

            nNode.getValFieldFunc = function()
            {
                return field;
            }
            nNode.getValFunc = function()
            {
                if(field.getValue() != undefined)
                    return field.getValue();
                else
                    return null;
            }
        }

        f_sendOperationCliCommand(node, m_thisObj);
    },

    f_updateOperCmdResponse: function(headerStr, values, clear)
    {
        var tf = m_thisObj.m_parent.f_getEditorTitleCompByHeaderName(headerStr);

        if(tf != undefined)
        {
            headerStr = headerStr.replace('&rArr;', ' ');

            tf.setValue(tf.getValue() + '\n* ' +
                headerStr + ': ' + values);
        }
        else
        {
            var ePanel = m_thisObj.m_parent.m_editorPanel;

            ///////////////////////////////////////
            // create and add editor title header
            var hPanel = f_createEditorTitle(null, headerStr);
            f_addField2Panel(ePanel, hPanel, undefined);

            var mlbl = f_createTextAreaField(values, 500, 200);
            f_addField2Panel(ePanel, mlbl, undefined);
            
            ePanel.doLayout();
        }
    },

    f_handleButton: function(node, title)
    {
        if(node.attributes.configured != undefined &&
            (node.attributes.configured == 'add' ||
            node.attributes.configured == 'active' ||
            node.attributes.configured == 'set'))
        {
            f_addField2Panel(m_thisObj.m_parent.m_editorPanel,
                  f_createButton(m_thisObj, node, 'Delete', title), 'Delete Node');
        }
        else if((node.attributes.configured == undefined ||
                node.attributes.configured == 'delete') &&
                node.attributes.type == undefined)
        {
            /////////////////////////////////////////////////////////
            // add 'create' button if and only if node type is not
            // define and has no leaf child.
            var hasLeaf = node.hasChildNodes() && node.firstChild == null ?
                          true : false;

            if(node.hasChildNodes())
            {
                var n = node.firstChild;
                while(n != undefined)
                {
                    if(n.leaf)
                    {
                        hasLeaf = true;
                        break;
                    }
                    n = n.nextSibling;
                }
            }

            if(!hasLeaf)
                f_addField2Panel(m_thisObj.m_parent.m_editorPanel,
                                f_createButton(m_thisObj, node, 'Create',
                                title), 'Create Node');
        }
    }
});

function filterWildcard(arr)
{
    var wc = false;
    var narr = [ ];

    for(var i = 0; i < arr.length; i++)
    {
        if(arr[i] == '*')
            wc = true;
        else
            narr[narr.length] = arr[i];
    }

    return wc ? narr : undefined;
}

function getNodeStyleImage(node)
{
    if(node == undefined) return '';

    switch(node.attributes.configured)
    {
        case 'set':
        case 'delete':
        case 'activeplus':
            return V_DIRTY_FLAG;
        case 'active':
        default:
            return '';
    }
}
