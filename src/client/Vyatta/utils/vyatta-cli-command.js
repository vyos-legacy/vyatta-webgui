/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
function f_sendOperationCliCommand(node, callbackObj, clear, prevXMLStr)
{
    var sid = f_getUserLoginedID();
    if(sid == 'NOTFOUND')
        // no sid. do nothing.
        return undefined;

    var narr = [ ];
    var n = node;

    while(n.text != 'Operation')
    {
        if(n.text == '&lt;value&gt;')
            narr.push(n.getValFunc());
        else
            narr.push(n.text);

        n = n.parentNode;
    }

    var sendStr = '';
    var headerStr = '';
    while(narr.length > 0)
    {
        var c = narr.pop();
        sendStr += (c + ' ');

        if(headerStr.length > 1)
            headerStr += '&rArr;';
        headerStr += c;
    }

    //////////////////////////////////////////////////////////////
    // operaction command callback
    var opCmdCb = function(options, success, response)
    {
        f_hideSendWaitMessage();
        if(response.responseXML == null) return;

        var xmlRoot = response.responseXML.documentElement;
        var isSuccess = f_parseResponseError(xmlRoot);
        callbackObj.f_updateOperCmdResponse(headerStr, isSuccess[1], clear);
    }   // end oper cmd callback

    /* send request */
    var xmlstr = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
               + "<vyatta><command><id>" + sid + "</id>\n"
               + "<statement>" + sendStr + "</statement>\n"
               + "</command></vyatta>\n";

    //////////////////////////////////////////////////////////////////
    // avoid to send a duplicate command again
    if(prevXMLStr != undefined && prevXMLStr == xmlstr)
        return xmlstr;

    f_resetLoginTimer();
    g_sendCommandWait = Ext.MessageBox.wait('Running operational command...',
                                  'Operation');

    var conn = new Ext.data.Connection({});
    conn.request(
    {
        url: '/cgi-bin/webgui-wrap',
        method: 'POST',
        xmlData: xmlstr,
        callback: opCmdCb
    });

    return xmlstr;
}

function f_sendConfigCLICommand(cmds, treeObj, node, isCreate)
{
    var sid = f_getUserLoginedID();
    if(sid == 'NOTFOUND')
        // no sid. do nothing.
        return;

    f_resetLoginTimer();
    g_sendCommandWait = Ext.MessageBox.wait('Changing configuration...',
                                              'Configuration');

    var sendCommandCliCb = function(options, success, response)
    {
        f_hideSendWaitMessage();

        if(response.responseXML == undefined)
        {
            alert('Request timed out!\n\n' +
                  'Wait for response from server has time-out. ' +
                   'Please refrsh GUI and try again later.');
            return;
        }

        var xmlRoot = response.responseXML.documentElement;
        var isSuccess = f_parseResponseError(xmlRoot);
        if(!isSuccess[0])
        {
            f_promptErrorMessage('Changing configuration...', isSuccess[1]);
            return;
        }

        var tree = treeObj.m_tree;
        var selNode = tree.getSelectionModel().getSelectedNode();
        if(selNode == undefined)
            selNode = tree.getRootNode();
        var selPath = selNode.getPath('text');

        if(node == undefined)
            f_handleNodeExpansion(treeObj, selNode, selPath, cmds);
        else if(node.parentNode != undefined || selNode.parentNode != undefined)
            f_handleParentNodeExpansion(treeObj, node, selNode, selPath, cmds, isCreate);
    }

    var xmlstr = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                   + "<vyatta><command><id>" + sid + "</id>\n";

    for (var i = 0; i < cmds.length; i++)
        xmlstr += "<statement>" + cmds[i] + "</statement>\n";
    xmlstr += "</command></vyatta>\n";

    var conn = new Ext.data.Connection({});
    conn.request(
    {
        url: '/cgi-bin/webgui-wrap',
        method: 'POST',
        xmlData: xmlstr,
        callback: sendCommandCliCb
    });
}

function f_handleNodeExpansion(treeObj, selNode, selPath, cmds)
{
    var tree = treeObj.m_tree;
    var p = tree.root;

    //////////////////////////////////////////////////
    // check for the command we sent.
    if(cmds[0].indexOf('discard') >= 0)
    {
        p.reload();
        treeObj.m_parent.f_cleanEditorPanel();
        return;
    }
    else if(cmds[0].indexOf('commit') >= 0)
    {
        f_handlePropagateParentNodes(selNode);
        treeObj.m_selNodePath = selPath;//node.parentNode;
        tree.getRootNode().reload();
        return;
    }

    //////////////////////////////////////////////
    // expand handler
    var ehandler = function(success, last)
    {
        if(last.getPath('text') != selPath)
        {
            // we were at leaf. "last" is parent.
            tree.selectPath(selPath, 'text', function(success,sel)
            {
                var nnode = treeObj.m_tree.getSelectionModel().getSelectedNode();
                treeObj.f_HandleNodeConfigClick(nnode, null, undefined, treeObj);
            });
        }
        else
        {
            tree.selectPath(selPath, 'text');
            treeObj.f_HandleNodeConfigClick(last, null, undefined, treeObj);
        }
    }

    //////////////////////////////////////////////////////
    // expand node
    var handler = function(narg)
    {
        tree.expandPath(selPath, 'text', ehandler);
        narg.un('expand', handler);
    }
    p.on('expand', handler);
    p.collapse();
    p.expand();
}

function f_handleParentNodeExpansion(treeObj, node, selNode, selPath, cmds, isCreate)
{
    if(node.parentNode == undefined)
        node.parentNode = selNode;

    var tree = treeObj.m_tree;
    treeObj.m_selNodePath = selPath;
    var p = node.parentNode;

    if(isCreate)
    {
        /*
         * successfully created a node. now need to propagate the
         * "configured" status up the tree (since we only reload the
         * parent node, which only updates all siblings of the newly
         * created node).
         */
        f_handlePropagateParentNodes(node);

        ////////////////////////////////////////////////////////
        // if spath == scmd, creation is from push button, else
        // creation is from input fields.
        var spath = selPath.replace('Configuration', '');
        var scmd = cmds[0].replace('set', '');
        spath = f_replace(spath, ' ', '');
        scmd = f_replace(scmd, ' ', '');
        if(spath == scmd)
            p = node;
    }
    else if(cmds[0].indexOf("delete", 0) >= 0)
    {
        treeObj.m_cmd = cmds[0].substring(0, 6);

        ///////////////////////////////////////////
        // the selected node should have been
        // deleted. set the new selected node here.
        var sm = tree.getSelectionModel();
        sm.select(selNode.parentNode);
        treeObj.m_selNodePath = sm.getSelectedNode().getPath('text');
        
        var nnode = sm.getSelectedNode();
        nnode.reload();
        //nnode.collapse();
        //nnode.expand();
        //treeObj.f_HandleNodeConfigClick(nnode, null, undefined, treeObj);
        return;
    }
    
    var handler = function(narg)
    {
        tree.selectPath(selPath, 'text', function(success, sel)
        {
            var nnode = tree.getSelectionModel().getSelectedNode();
            treeObj.f_HandleNodeConfigClick(nnode, null, undefined, treeObj);
        });

        narg.un('expand', handler);
    }

    p.on('expand', handler);
    p.collapse();
    p.expand();
}
function f_handlePropagateParentNodes(node)
{
    var n = node;
    while (n != undefined)
    {
        /////////////////////////////////////////////
        // mark node as dirty.
        if(n.ui.anchor != undefined)
        {
            var inner = n.ui.anchor.innerHTML;
            if(inner.indexOf(V_DIRTY_FLAG) < 0 &&
                n.attributes.configured != 'set')
            {
                inner = inner.replace(n.text, V_DIRTY_FLAG+n.text);
                inner = inner.replace('="v-node-nocfg"', '="v-node-set"');
                n.ui.anchor.innerHTML = inner;
            }
        }

        n.attributes.configured = 'set';
        n = n.parentNode;
    }
}