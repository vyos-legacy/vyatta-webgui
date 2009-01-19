/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

function f_sendOperationCliCommand(node, callbackObj, clear, prevXMLStr, 
                                    forceSend, segmentId, treeObj, wildCard)
{
    var narr = [ ];
    var n = node;
    var sendStr = '';
    var headerStr = '';

    if(n != undefined)
    {
        /////////////////////////////////////////////////
        // construct a sent command by on the given node
        while(n.text != 'Operation')
        {
            if(n.text == '&lt;value&gt;')
            {
                if(n.getValFunc != undefined)
                {
                    var val = n.getValFunc();
                    if(forceSend && (val == "'Select a valuid value...'" ||
                        val == "''"))
                    {
                        f_promptErrorMessage('Input Error!',
                                            'Please enter a valid value.');
                        return "";
                    }

                    if(!forceSend || (val == "'Select a valuid value...'" ||
                            val == "''"))
                        return "";  // nothing to send.

                    narr.push(val);
                }
                else if(!forceSend)
                    return "";  // nothing to send
                else
                    narr.push("<Value>");
            }
            else
                narr.push(n.text);

            n = n.parentNode;
        }

        while(narr.length > 0)
        {
            var c = narr.pop();
            sendStr += (c + ' ');

            if(headerStr.length > 1)
                headerStr += '&nbsp;&rArr;&nbsp;';
            headerStr += c;
        }
        
        g_cliCmdObj.m_node = node;
        if(segmentId != undefined)
            sendStr = segmentId;
        else
            g_cliCmdObj.m_sendCmdWait = Ext.MessageBox.wait(
                            'Running operational command...', 'Operation');
        g_cliCmdObj.m_cb = callbackObj;
        g_cliCmdObj.m_segmentId = undefined;
    }
    else
        sendStr = prevXMLStr;


    //////////////////////////////////////////////////////////////
    // operaction command callback
    var opCmdCb = function(options, success, response)
    {
        f_hideSendWaitMessage();
        if(!f_isResponseOK(response))
            return;

        var xmlRoot = response.responseXML.documentElement;
        var isSuccess = f_parseResponseError(xmlRoot);
        g_cliCmdObj.m_segmentId = (isSuccess[2] != undefined)?isSuccess[2]:null;

        if(sendStr == 'reboot ')
            isSuccess[1] = 'System is rebooting. Please wait for reboot to complete\n'+
                            'then refresh the browser to log in again.';
        /////////////////////////////////////
        // handle the 'Load' toolbar command
        else if(sendStr.indexOf("show files ") >= 0)
        {
            f_showFileChooserDialog(wildCard, isSuccess[1], treeObj);
            return;
        }

        //////////////////////////////////////////////////////////
        // update editor view
        callbackObj.f_updateOperCmdResponse(headerStr,
                    isSuccess[1], clear);
    }
    

    /* send request */
    var xmlstr = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
               + "<vyatta><command><id>" + f_getUserLoginedID() + "</id>\n"
               + "<statement mode='op'>" + sendStr + "</statement>\n"
               + "</command></vyatta>\n";

    //////////////////////////////////////////////////////////////////
    // avoid to send a duplicate command again
    if(prevXMLStr != undefined && prevXMLStr == xmlstr)
        return xmlstr;

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
    g_cliCmdObj.m_sendCmdWait = Ext.MessageBox.wait('Changing configuration...',
                                                      'Configuration');

    var tObj = treeObj;
    var sendCommandCliCb = function(options, success, response)
    {
        f_hideSendWaitMessage();
        if(!f_isResponseOK(response))
            return;

        var xmlRoot = response.responseXML.documentElement;
        var isSuccess = f_parseResponseError(xmlRoot);
        if(!isSuccess[0])
        {
            var err = f_replace(isSuccess[1], "\r\n", "<br>");
            f_promptErrorMessage('Changing configuration...', err);
            
            /////////////////////////////////
            // handle input error
            f_handleInputFieldError(node);

            return;
        }

        var tree = tObj.m_tree;
        var selNode = tree.getSelectionModel().getSelectedNode();
        if(selNode == undefined)
            selNode = tree.getRootNode();
        var selPath = selNode.getPath('text');

        /////////////////////////////////////
        if(cmds[0].indexOf('save') >= 0)
        {
            f_promptErrorMessage('Save configuration', isSuccess[1],
                                  Ext.MessageBox.INFO);
        }
        else if(cmds[0].indexOf('discard') >= 0)
        {
            tree.root.reload();
            tObj.m_parent.f_cleanEditorPanel();
        }
        else if(cmds[0].indexOf('commit') >= 0)
        {
            tObj.m_parent.f_resetEditorPanel();
            f_handlePropagateParentNodes(selNode);
            tObj.m_selNodePath = selPath;//node.parentNode;
            tree.getRootNode().reload();
        }
        /////////////////////////////////////
        // handle the 'View' toolbar command
        else if(cmds[0] == 'show session')
        {
            f_handleToolbarViewCmdResponse(isSuccess[1]);
        }
        else
        {
            if(node == undefined)
                f_handleNodeExpansion(tObj, selNode, selPath, cmds);
            else if(node.parentNode != undefined || selNode.parentNode != undefined)
                f_handleParentNodeExpansion(tObj, node, selNode, selPath, cmds, isCreate);
        }
    }

    var xmlstr = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                   + "<vyatta><command><id>" + f_getUserLoginedID() + "</id>\n";

    for(var i = 0; i < cmds.length; i++)
        xmlstr += "<statement mode='conf'>" + cmds[i] + "</statement>\n";
    xmlstr += "</command></vyatta>\n";

    g_cliCmdObj.m_segmentId = undefined;
    var conn = new Ext.data.Connection({});
    conn.request(
    {
        url: '/cgi-bin/webgui-wrap',
        method: 'POST',
        xmlData: xmlstr,
        callback: sendCommandCliCb
    });
}

function f_isResponseOK(response)
{
    var msg = 'Please refersh GUI and try again later.';
    var ret = false;

    if(response.responseXML == undefined ||
            response.status == 408 /* request timeout */)
        f_promptErrorMessage('Request timeout!',
              'Request to the service failed in the time allowed by the server. ' +
              msg);
    else if(response.status == 500)
          f_promptErrorMessage('Internal Server Error!',
              'Server had a problem either getting data or parsing the results. ' +
              msg);
    else if(response.status == 503)
        f_promptErrorMessage('Service Unavailable!',
              'Web service had a temporary overload and count not process the request. ' +
              msg);
    else if(response.status == 200)
        ret = true;
    else
        f_promptErrorMessage('Service Unavailable!', 'Unkown error. ' + msg);

    return ret;
}

function f_handleNodeExpansion(treeObj, selNode, selPath, cmds)
{
    var tree = treeObj.m_tree;

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
    var p = tree.root;
    var handler = function(narg)
    {
        tree.expandPath(selPath, 'text', ehandler);
        narg.un('expand', handler);
    }
    p.collapse();
    p.on('expand', handler);
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
        treeObj.m_isCommitAvailable = true;

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

    if(!f_isExpandableNode(p))
        treeObj.m_parent.f_onTreeRenderer(treeObj);

    if(p.expanded)
        p.collapse();

    p.on('expand', handler);
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
                if(inner.indexOf("images/statusUnknown.gif") < 0)
                    inner = inner.replace(n.text, V_DIRTY_FLAG+n.text);

                inner = inner.replace('="v-node-nocfg"', '="v-node-set"');
                n.ui.anchor.innerHTML = inner;
            }
        }

        n.attributes.configured = 'set';
        n = n.parentNode;
    }
}

function f_parseResponseError(xmlRoot)
{
    var success = true;
    var q = Ext.DomQuery;
    var err = q.selectNode('error', xmlRoot);
    var msg = '', code = 0, segment = undefined;

    if(err != undefined)
    {
        code = q.selectValue('code', err, 'UNKNOWN');
        msg = q.selectValue('msg', err, 'UNKNOWN');

        //////////////////////////////////////////////
        // selectValue only can return up to 4096 char
        if(msg.length >= 4096 && xmlRoot.textContent != undefined)
            msg = xmlRoot.textContent;

        var msgNode = q.selectNode('msg', err);
        segment = msgNode.getAttribute('segment');

        if(code == 'UNKNOWN' || code != 0)
            success = false;
        else if(msg == 'UNKNOWN')
            msg = '';

        if(code == 3) // server timeout
        {
            f_promptUserNotLoginMessage();
            if(f_isAutoLogin())
                f_autoLogin();
            else
                f_userLogout(true, g_baseSystem.m_homePage);
        }
    }

    return [ success, msg, segment ];
}

function f_startSegmentCommand()
{
    Ext.TaskMgr.start(
    {
        run: function()
        {
            if(g_cliCmdObj.m_segmentId != undefined)// &&
                //g_cliCmdObj.m_segmentId != g_cliCmdObj.m_prevSegId)
            {
                g_cliCmdObj.m_prevSegId = g_cliCmdObj.m_segmentId;
                f_sendOperationCliCommand(g_cliCmdObj.m_node, g_cliCmdObj.m_cb,
                                    false, undefined, true,
                                    g_cliCmdObj.m_segmentId);
            }
        }
        ,interval: 5500
    });
}