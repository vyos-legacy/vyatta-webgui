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
    {
        alert('eq');
        return xmlstr;
    }
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

function f_sendCLICommand(cmds, treeObj)
{
    f_sendConfigCLICommand(cmds, treeObj);
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

    var tree = treeObj.m_tree;
    var sendCommandCliCb = function(options, success, response)
    {
        var xmlRoot = response.responseXML.documentElement;
        var q = Ext.DomQuery;
        var errmsg = 'Unknown error';

        var isSuccess = f_parseResponseError(xmlRoot);
        if(!isSuccess[0])
        {
            f_hideSendWaitMessage();
            f_promptErrorMessage('Changing configuration...', isSuccess[1]);
            return;
        }

        f_hideSendWaitMessage();

        var selNode = tree.getSelectionModel().getSelectedNode();
        var selPath = selNode.getPath('text');
        var selText = selNode.text;

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
                        var nnode = thisTree.getSelectionModel().getSelectedNode();
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
                }
                n.attributes.configured = 'set';
                n = n.parentNode;
            }

            var p = node.parentNode;
            var handler = function(narg)
            {
                  tree.selectPath(selPath, 'text', function(success,sel)
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