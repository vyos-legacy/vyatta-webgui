/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

VYATTA_compNodeUI = Ext.extend(Ext.tree.TreeNodeUI,
{
    getNodeStyle: function(node)
    {
        if(node.attributes.configured == undefined)
            return ' class="v-node-nocfg" style="color:black;"';
        else if(node.attributes.configured == 'active')
            return ' class="v-node-active" style="color:black;"';
        else if(node.attributes.configured == 'set'  ||
                node.attributes.configured == 'active_plus')
            return ' class="v-node-set" style="color:black;"';
        else if(node.attributes.configured == 'delete')
            return ' class="v-node-delete" style="color:black;"';

        return '';
    },

    getNodeStyleImage: function(node)
    {
        if(node.getOwnerTree().m_parent.m_treeMode == 'operation')
            return "";

        return getNodeStyleImage(node, true);
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
        var styleImg = ""; //this.getNodeStyleImage(n);
        styleImg = styleImg == '' ? V_EMPTY_FLAG : styleImg;
        var buf =
        [
          '<li class="x-tree-node"><div ext:tree-node-id="', n.id,
          '" class="x-tree-node-el x-tree-node-leaf x-unselectable ', a.cls,
          '" unselectable="on">',
          '<span class="x-tree-node-indent">', styleImg, this.indentMarkup,
          "</span>",
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
          n.text,
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
    }
});


VYATTA_components_tree = Ext.extend(Ext.util.Observable,
{
    constructor: function(tabName)
    {
        this.m_thisObj = this;
        this.m_treeMode = tabName;
    },

    ///////////////////////////////////////////////////////////////////////////
    //
    f_createComponentPanel: function(parent)
    {
        this.m_parent = parent;
        this.f_createTree(parent);
    },

    f_createTree: function(parent)
    {
        //////////////////////////////////////////////////////////
        // create tree loader
        this.m_treeLoader = new VYATTA_hierTreeLoader(
        {
            clearOnLoad: false
            ,requestMethod: 'POST'
            ,dataUrl: '/cgi-bin/webgui-wrap'
            ,uiProviders:
            {
                'node': VYATTA_compNodeUI
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
            this.initTreeListeners(this.m_tree, this.f_onConfigTreeNodeClick);
        }
        else// if(this.m_treeMode == V_TREE_ID_oper)
        {
            this.m_tree.setRootNode(this.f_getOperationRootNode());
            this.initTreeListeners(this.m_tree, this.f_handleNodeOperClick);
        }

        //this.m_tree.getRootNode().expand(false, false);
    },

    f_getConfigRootNode: function()
    {
        var root = new Ext.tree.AsyncTreeNode(
        {
            text: 'Configuration'
            ,draggable:false // disable root node dragging
            ,cls: 'v-node-active'
            ,id:'rootNodeCompConfig'
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
            ,id:'operNodeCompConfig'
        });

        return root;
    },

    initTreeListeners: function(tree, nodeClickHandler)
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

        tree.on('click', nodeClickHandler);
    },

    f_onConfigTreeNodeClick: function(node, e)
    {

    },

    f_handleNodeOperClick: function(node, e)
    {

    }
});

