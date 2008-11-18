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

    var l_clear = clear;

    //////////////////////////////////////////////////////////////
    // operaction command callback
    var opCmdCb = function(options, success, response)
    {
        var xmlRoot = response.responseXML.documentElement;
        var q = Ext.DomQuery;

        var isSuccess = f_parseResponseError(xmlRoot);
        f_hideSendWaitMessage();
        callbackObj.f_updateOperCmdResponse(headerStr, isSuccess[1], l_clear);
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
    var cmdSent = cmds;
    if(sid == 'NOTFOUND')
      // no sid. do nothing.
      return;

    f_resetLoginTimer();
    g_sendCommandWait = Ext.MessageBox.wait('Changing configuration...',
                                              'Configuration');

    var tree = treeObj.m_tree;
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
        var q = Ext.DomQuery;

        var isSuccess = f_parseResponseError(xmlRoot);
        if(!isSuccess[0])
        {
            f_promptErrorMessage('Changing configuration...', isSuccess[1]);
            return;
        }

        var selNode = tree.getSelectionModel().getSelectedNode();
        if(selNode == undefined)
            selNode = tree.getRootNode();
        var selPath = selNode.getPath('text');

        if(node == undefined)
        {
            var p = tree.root;

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

            var handler = function(narg)
            {
                tree.expandPath(selPath, 'text', ehandler);
                narg.un('expand', handler);
            }

            if(cmds.indexOf('discard') >= 0)
            {
                p.reload();
                treeObj.m_parent.f_cleanEditorPanel();
                return;
            }
            else if(cmds.indexOf('commit') >= 0)
                selNode.reload();

            p.on('expand', handler);
            p.collapse();
            p.expand();
        }
        else if(node.parentNode != undefined)
        {
            if(isCreate)
            {
                /*
                 * successfully created a node. now need to propagate the
                 * "configured" status up the tree (since we only reload the
                 * parent node, which only updates all siblings of the newly
                 * created node).
                 */
                var n = node.parentNode;
                while (n != undefined)
                {
                    if ((n.attributes.configured == 'active')
                                  || (n.attributes.configured == 'set'))
                        // already set. we're done.
                        break;

                    n.attributes.configured = 'set';
                    n = n.parentNode;
                }
            }
            else if(cmds[0].indexOf("delete", 0) >= 0)
            {
                treeObj.m_cmd = cmds[0].substring(0, 6);
            }

            ////////////////////////////////////////////////
            // since simple expand the parendNode.expand()
            // doesnot refresh/rendereer parentNode's parents,
            // we need to refresh from the root, then after
            // the reload we expand the m_selNode node.
            treeObj.m_selNodePath = selPath;//node.parentNode;
            tree.getRootNode().reload();
        }
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
