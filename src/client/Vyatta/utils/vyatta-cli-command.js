/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * currently use to get host name after the login.
 */

function f_sendSpecialCliCommand(cmd, segmentId, cb)
{
    var opCmdCb = function(options, success, response)
    {
        if(!f_isResponseOK(response))
            return;

        var xmlRoot = response.responseXML.documentElement;
        var isSuccess = f_parseServerCallback(xmlRoot, V_TREE_ID_oper);
        var localSegmentId = (isSuccess[2] != undefined)?isSuccess[2]:null;

        // segment is not end, continue to send
        if(localSegmentId.indexOf('_end') < 0)
        {
            if(cmd.indexOf('host name') > 0 && isSuccess[1].length > 1)
            {
                g_baseSystem.m_hostname = isSuccess[1];
                f_updateHostname();
                return;
            }

            f_sendSpecialCliCommand(cmd, localSegmentId, cb);
        }
    }

    /* send request */
    var xmlstr = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
               + "<vyatta><command><id>" + f_getUserLoginedID()
               + "</id>\n"
               + "<statement mode='op'>"
               + (segmentId == undefined? cmd : segmentId)
               + "</statement>\n"
               + "</command></vyatta>\n";

    var conn = new Ext.data.Connection({});
    conn.request(
    {
        url: '/cgi-bin/webgui-wrap',
        method: 'POST',
        xmlData: xmlstr,
        callback: opCmdCb
    });
}

/**
 * All commands under Operation tab are used this function to send op mode
 * command and handle the respond.
 */
function f_sendOperationCliCommand(node, callbackObj, clear, prevXMLStr,
                                    forceSend, segmentId, treeObj, wildCard)
{
    var narr = [ ];
    var n = node;
    var sendStr = '';
    var headerStr = '';

    if(n != undefined)  // function invoke by user's action
    {
        /////////////////////////////////////////////////
        // construct a sent command base on the given node
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
            {
                if(Ext.isIE)
                    headerStr += '&nbsp;&rarr;&nbsp;';
                else
                    headerStr += '&nbsp;&rArr;&nbsp;';
            }
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
    else if(segmentId != undefined) // function  invokes from background
    {
        sendStr = segmentId
        g_cliCmdObj.m_cb = callbackObj;
        g_cliCmdObj.m_segmentId = undefined;
    }
    else
    {
        sendStr = prevXMLStr;
        g_cliCmdObj.m_sendCmdWait = Ext.MessageBox.wait(
                            'Processing', 'Command');
    }

    //////////////////////////////////////////////////////////////
    // operaction command callback
    var opCmdCb = function(options, success, response)
    {
        if(!f_isResponseOK(response))
        {
            f_hideSendWaitMessage();
            return;
        }

        // ingore respond. process either stop by click on 'stop' button
        // or click on tab
        if(g_cliCmdObj.m_segmentId == 'segment_end') return;

        var xmlRoot = response.responseXML.documentElement;
        var isSuccess = f_parseServerCallback(xmlRoot, V_TREE_ID_oper);
        var sId = (isSuccess[2] != undefined)?isSuccess[2]:null;
        g_cliCmdObj.m_segmentId = sId;

        // handle reboot command
        if(sendStr == 'reboot ')
            isSuccess[1] = 'System is rebooting. Please wait for reboot to complete\n'+
                            'then refresh the browser to log in again.';

        if(sId != undefined)
        {
            if(wildCard != undefined && wildCard[0] != undefined &&
                wildCard[0].indexOf('show files ') >= 0)
            {
                g_cliCmdObj.m_wildCard = wildCard;
                g_cliCmdObj.m_node = null;
                g_cliCmdObj.m_treeObj = treeObj;

                if(sId.indexOf('_end') >= 0)
                {
                    f_hideSendWaitMessage();
                    f_showFileChooserDialog(wildCard[1], g_cliCmdObj.m_wildCard[2], treeObj);
                }
                else if(g_cliCmdObj.m_wildCard[2] == undefined)
                    g_cliCmdObj.m_wildCard[2] = isSuccess[1];
                else
                    g_cliCmdObj.m_wildCard[2] += isSuccess[1] + "\n";

                return;
            }
            else if(isSuccess[0] && sId.indexOf('_end') < 0)
            {
                if(!g_cliCmdObj.m_segPause)
                {
                    if(wildCard != undefined && typeof wildCard.setText == 'function')
                    {
                        wildCard.el.dom.className = V_WAIT_CSS;
                        wildCard.setText('Stop');
                    }
                }
                g_cliCmdObj.m_wildCard = wildCard;
            }
            else if(sId.indexOf('_end') >= 0 &&
                g_cliCmdObj.m_wildCard != undefined &&
                g_cliCmdObj.m_wildCard.text != undefined)
            {
                if(wildCard != undefined && typeof wildCard.setText == 'function')
                    f_resetOperButton(g_cliCmdObj.m_wildCard);
            }
        }
        else
        {   // login session maybe timeout
            f_promptUserNotLoginMessage();
            f_userLogout(true, g_baseSystem.m_homePage);
            return;
        }


        //////////////////////////////////////////////////////////
        // update editor view
        callbackObj.f_updateOperCmdResponse(headerStr,
                    isSuccess[1], clear);

        f_hideSendWaitMessage();
    }

    var sid = f_getUserLoginedID();
    f_saveUserLoginId(sid);

    /* send request */
    var xmlstr = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
               + "<vyatta><command><id>" + sid + "</id>\n"
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

function f_saveConfFormCommandSentError(treeObj, response)
{
    if(!f_isResponseOK(response))
            return;

    var xmlRoot = response.responseXML.documentElement;
    var isSuccess = f_parseServerCallback(xmlRoot, V_TREE_ID_config);
    if(!isSuccess[0])
    {
        var err = [f_replace(isSuccess[1], "\r\n", "")+"<br>", treeObj.m_fdIndexSent-1];
        g_cliCmdObj.m_errors[g_cliCmdObj.m_errors.length] = err;
    }
}

function f_handleConfFormCommandDone(treeObj, node)
{
    if(treeObj.m_numSent > 0)
    {
        f_hideSendWaitMessage();
        treeObj.m_isCommitAvailable = true;

        var tree = treeObj.m_tree;

        var onReloadHandler = function()
        {
            node.attributes.configured = 'set';
            treeObj.f_HandleNodeConfigClick(node, null, undefined);

            //////////////////////////////////////////////
            // load it's childnode if is multi node is set
            if(node.attributes.multi != undefined)
                f_loadChildNode(treeObj, node);

            f_handlePropagateParentNodes(node);
            treeObj.m_isCommitAvailable = true;
            treeObj.m_parent.f_onTreeRenderer(treeObj);
            tree.un('load', onReloadHandler);
        }
        tree.on('load', onReloadHandler);
        node.reload();

        for(var i=0; i<g_cliCmdObj.m_fdSent.length; i++)
            f_handleFormIndicators(g_cliCmdObj.m_fdSent[i].m_node,
                                    g_cliCmdObj.m_fdSent[i].m_parentNode);

        ///////////////////////////////////////////
        // handler errors to display flag indicators & prompt user a err dialog
        if(g_cliCmdObj.m_errors.length > 0)
        {
            var err="";
            var form = treeObj.m_parent.m_editorPanel.m_formPanel;
            for(var i=0; i<g_cliCmdObj.m_errors.length; i++)
            {
                err += g_cliCmdObj.m_errors[i][0];
                var fp = form.items.item(g_cliCmdObj.m_errors[i][1]);
                f_handleFieldError(fp.m_node);
            }
            f_promptErrorMessage('Changing configuration...', err);
        }
    }
}

function f_prepareConfFormCommandSend(treeObj)
{
    treeObj.m_fdIndexSent = 1;
    treeObj.m_numSent = 0;
    g_cliCmdObj.m_errors = [];
    g_cliCmdObj.m_fdSent = [];

    f_sendConfFormCommand(treeObj);
}

// DO NOT call this function before call f_prepareConfFormCommandSend()
function f_sendConfFormCommand(treeObj)
{
    var confCmdCb = function(options, success, response)
    {
        f_saveConfFormCommandSentError(treeObj, response);

        if(selNode.attributes.multi != undefined)
            selNode.reload();

        f_sendConfFormCommand(treeObj);
    }

    var form = treeObj.m_parent.m_editorPanel.m_formPanel;
    var fp = form.items.item(treeObj.m_fdIndexSent++);
    var selNode = treeObj.m_tree.getSelectionModel().getSelectedNode();
    var selPath = selNode.getPath('text').replace(' Configuration', '');

    /////////////////////////////
    // done sending
    if(fp.m_isSubmitBtn)
    {
        f_handleConfFormCommandDone(treeObj, selNode);
        return;
    }

    var label = fp.items.item(V_IF_INDEX_LABEL);
    var fd = fp.items.item(V_IF_INDEX_INPUT);
    var type = fd.getXType();
    if(type == 'panel')
    {
        fd = fd.m_fd;
        type = fd.getXType();
    }
    var value = '';
    if(selNode.attributes.multi != undefined)
        label = '';
    else
      label = label.html.replace(":", " ");

    label = label.replace(' <img title="required field" src="images/ico_required.PNG"/>', "");
    
    ///////////////////////////////////////
    // get field values
    var cmds = [ ];
    switch(type)
    {
        case 'textfield':
            value = fd.getValue();
            value = (value != undefined && value.indexOf != null &&
                        value.indexOf(" ") > 0) ? "'"+value+"'" : value;
            treeObj.m_fdSentVal = value;

            /////////////////////////////////////
            // skip this node
            if(fd.getOriginalValue() == value)
            {
                f_sendConfFormCommand(treeObj);
                return;
            }

            if(value.length == 0)
                cmds = ['delete' + selPath + ' ' + label + value];
            else
                cmds = ['set' + selPath + ' ' + label + value];

            fd.setOriginalValue(value);
            break;
        case 'numberfield':
        case 'combo':
            value = fd.getValue();
            treeObj.m_fdSentVal = value;

            /////////////////////////////////////
            // skip this node
            if(fd.getOriginalValue() == value)
            {
                f_sendConfFormCommand(treeObj);
                return;
            }

            if(value.length == 0)
                cmds = ['delete' + selPath + ' ' + label + value];
            else
                cmds = ['set' + selPath + ' ' + label + value];

            fd.setOriginalValue(value);
            break;
        case 'editorgrid':
            if(!f_isEditGridDirty(fp.m_store))
            {
                f_sendConfFormCommand(treeObj);
                return;
            }
            if(fp.m_store.m_isChecker)
            {
                value = f_getEditGridCheckerValues(fp);

                for(var i=0; i<value.length; i++)
                {
                    var innerVal = value[i];

                    if(innerVal[1])
                        cmds.push('set ' + selPath + " " + label + innerVal[0]);
                    else
                        cmds.push('delete ' + selPath + ' ' + label + innerVal[0])
                }
            }
            else
            {
                value = f_getEditGridValues(fp.m_store);

                ////////////////////////////////////////////
                // make sure delete prev node before set
                cmds = [ 'delete ' + selPath + ' ' + label];

                for(var i=0; i<value.length; i++)
                    cmds.push('set ' + selPath + " " + label + value[i]);
            }
            break;
        case 'checkbox':
            value =  fd.getValue();

            /////////////////////////////////////
            // skip this node
            if(fd.getOriginalValue() == value)
            {
                f_sendConfFormCommand(treeObj);
                return;
            }

            value = value != undefined && value ? 'enable':'disable';
            cmds = ['set' + selPath + ' ' + label + value];
            break;
    }

    var sid = f_getUserLoginedID();
    f_saveUserLoginId(sid);

    ///////////////////////////////////
    // construction cmd xml string
    var xmlstr = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                   + "<vyatta><command><id>" + sid + "</id>\n";

    for(var i = 0; i < cmds.length; i++)
        xmlstr += "<statement mode='conf'>" + cmds[i] + "</statement>\n";
    xmlstr += "</command></vyatta>\n";

    // show wait msg once only
    if(treeObj.m_numSent == 0)
        g_cliCmdObj.m_sendCmdWait = Ext.MessageBox.wait('Changing configuration...',
                                              'Configuration');

    g_cliCmdObj.m_fdSent[g_cliCmdObj.m_fdSent.length] = fp;
    g_cliCmdObj.m_segmentId = undefined;
    treeObj.m_numSent++;

    var conn = new Ext.data.Connection({});
    conn.request(
    {
        url: '/cgi-bin/webgui-wrap',
        method: 'POST',
        xmlData: xmlstr,
        callback: confCmdCb
    });
}

function f_sendConfigCLICommand(cmds, treeObj, node, isCreate)
{
    var msg = 'Configuration...';
    if(cmds[0].indexOf('set ') >= 0 || cmds[0].indexOf('delete ') >= 0 ||
        cmds[0].indexOf('discard') >= 0 || cmds[0].indexOf('commit') >= 0)
        msg = 'Changing configuration...';

    ///////////////////////////////
    // clear commit error buffer
    if(cmds[0].indexOf('commit') >= 0) g_cliCmdObj.m_commitErrs = [];

    g_cliCmdObj.m_sendCmdWait = Ext.MessageBox.wait(msg, 'Configuration');

    var tObj = treeObj;
    var sendCommandCliCb = function(options, success, response)
    {
        f_hideSendWaitMessage();
        if(!f_isResponseOK(response))
            return;

        var xmlRoot = response.responseXML.documentElement;
        var isSuccess = cmds[0] == 'show session' ?
                f_parseServerCallback(xmlRoot, V_TREE_ID_oper):
                f_parseServerCallback(xmlRoot, V_TREE_ID_config);
        if(!isSuccess[0])
        {
            var err = f_replace(isSuccess[1], "\r\n", "<br>");
            f_promptErrorMessage('Changing configuration...', err);

            /////////////////////////////////
            // handle input error
            f_handleFieldError(node);

            ///////////////////////////////////////////
            // if commit error, flag error for tree
            if(cmds[0].indexOf('commit') < 0)
                return;
        }

        var tree = tObj.m_tree;
        var selNode = tree.getSelectionModel().getSelectedNode();
        if(selNode == undefined)
            selNode = tree.getRootNode();
        var selPath = selNode.getPath('text');


        /////////////////////////////////////
        if(cmds[0].indexOf('load') == 0)
        {
            tree.root.reload();
            tObj.m_parent.f_cleanEditorPanel();
        }
        if(cmds[0].indexOf('save') >= 0)
        {
            f_promptErrorMessage('Save configuration', isSuccess[1],
                                  Ext.MessageBox.INFO);
        }
        else if(cmds[0].indexOf('discard') >= 0)
        {
            g_cliCmdObj.m_commitErrs = [];
            var onReloadHandler = function()
            {
                tObj.m_parent.f_cleanEditorPanel();
                f_handleNodeExpansion(tObj, selNode, selPath, cmds[0]);
                tree.un('load', onReloadHandler);
            }
            tree.on('load', onReloadHandler);
            tree.root.reload();
            f_handlePropagateParentNodes(selNode);
        }
        else if(cmds[0].indexOf('commit') >= 0)
        {
            var onReloadHandler = function()
            {
                tObj.m_parent.f_cleanEditorPanel();
                f_handleNodeExpansion(tObj, selNode, selPath, cmds[0]);
                tree.un('load', onReloadHandler);
                f_handlePropagateParentNodes(selNode);
            }
            tObj.m_parent.f_resetEditorPanel();
            tObj.m_selNodePath = selPath;//node.parentNode;
            tree.on('load', onReloadHandler);
            tree.getRootNode().reload();
        }
        /////////////////////////////////////
        // handle the 'View' toolbar command
        else if(cmds[0] == 'show session')
        {
            f_handleToolbarViewCmdResponse(isSuccess[1]);
            return;
        }
        else  // other things else
        {
            if(node != null && node.parentNode != null && selNode.parentNode != null)
                f_handleParentNodeExpansion(tObj, node, selNode, selPath, cmds, isCreate);
        }
    } // end of callback

    var sid = f_getUserLoginedID();
    f_saveUserLoginId(sid);
    if(node != undefined)
        f_updateCommitErrors(node, node.parentNode);
    var xmlstr = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                   + "<vyatta><command><id>" + sid + "</id>\n";

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
    if(!f_isLogined()) return true;

    var msg = 'Please refresh GUI and try again later.';
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

function f_handleNodeExpansion2(treeObj, selPath, node, doNotClear)
{
    var tree = treeObj.m_tree;

    ////////////////////////////////////////////////////////
    // refresh the editor panel on the selectioned node
    var handler = function(narg)
    {
        tree.selectPath(selPath, 'text', function(success, sel)
        {
            var nnode = tree.getSelectionModel().getSelectedNode();
            treeObj.f_HandleNodeConfigClick(nnode, null, false);
        });

        narg.un('expand', handler);
    }

    if(!f_isExpandableNode(node))
        treeObj.m_parent.f_onTreeRenderer(treeObj);

    if(node.expanded)
        node.collapse();
    node.on('expand', handler);
    node.expand();
}

function f_loadChildNode(treeObj, node)
{
    var tree = treeObj.m_tree;
    var selNode = node;

    var onReloadChildHandler = function()
    {
        tree.selectPath(selNode.getPath('text'), 'text', function(success, sel)
        {
            var nnode = treeObj.m_tree.getSelectionModel().getSelectedNode();
            treeObj.f_HandleNodeConfigClick(nnode, null, undefined);
        });
        tree.un('load', onReloadChildHandler);
    }

    var onReloadHandler = function()
    {
        if(node.hasChildNodes())
        {
            var n = node.firstChild;
            while(n != undefined)
            {
                if(n.text == treeObj.m_fdSentVal)
                {
                    tree.on('load', onReloadChildHandler);
                    selNode = n;
                    n.reload();
                    break;
                }
                n = n.nextSibling;
            }
        }
        tree.un('load', onReloadHandler);
    }

    tree.on('load', onReloadHandler);
    node.reload();
}
function f_handleNodeExpansion(treeObj, selNode, selPath, cmds)
{
    var tree = treeObj.m_tree;

    //////////////////////////////////////////////
    // expand handler
    var ehandler = function(success, last)
    {
        var lSelPath = last.getPath('text');

        if(lSelPath != selPath)
        {
            if(cmds == 'discard')
            {
                tree.selectPath(lSelPath, 'text');
                treeObj.m_selNodePath = lSelPath;
                selPath = lSelPath;
            }

            // we were at leaf. "last" is parent.
            tree.selectPath(selPath, 'text', function(success, sel)
            {
                var nnode = treeObj.m_tree.getSelectionModel().getSelectedNode();
                treeObj.f_HandleNodeConfigClick(nnode, null, undefined);
            });
        }
        else
        {
            tree.selectPath(selPath, 'text');
            treeObj.f_HandleNodeConfigClick(last, null, undefined);
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
    var doNotClear = false;
    treeObj.m_isCommitAvailable = true;

    if(isCreate)
    {
        ////////////////////////////////////////////////
        // if 'node' has not fresh from server, we flag
        // it as 'set' here to sync with server
        //if(node.attributes.configured == undefined)
        node.attributes.configured = 'set'

        /*
         * new we need to walk up the tree to flag the yellow cir.
         * Anything below the parent node automatically took care
         * by the server.
         */
        f_handlePropagateParentNodes(node);
        if(selNode != undefined && typeof selNode.reload == 'function')
            selNode.reload();

        p = node;
        selNode = p;
        selPath = p.getPath('text');
        treeObj.m_parent.f_cleanEditorPanel();
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
        
        if(nnode.attributes != undefined)
            nnode.attributes.configured = 'active_plus';

        // if selected node is root, select the selNode
        if(nnode.text.indexOf('Configuration') >= 0)
        {
            var sPath = selPath;
            
            var handleReload = function()
            {
                tree.selectPath(sPath, 'text', function(success, sel)
                {
                    var nnode = tree.getSelectionModel().getSelectedNode();
                    treeObj.f_HandleNodeConfigClick(nnode, null, false);
                });
                tree.un('load', handleReload);
            }
            tree.on('load', handleReload);
        }

        selPath = nnode.getPath('text');
        nnode.reload();
        f_handlePropagateParentNodes(nnode);
        treeObj.m_parent.f_onTreeRenderer(treeObj);
    }

    f_handleNodeExpansion2(treeObj, selPath, p, doNotClear);
}

function f_handlePropagateParentNodes(node)
{
    var n = node;

    while(n != undefined)
    {
        /////////////////////////////////////////////
        // mark node as dirty.
        if(n.ui.elNode != undefined)
        {
            var inner = n.ui.elNode.innerHTML;

            if(inner.indexOf(V_DIRTY_FLAG) < 0)
            {
                var flag = V_IMG_EMPTY;
                switch(getNodeStyleImage(n, true))
                {
                    case V_DIRTY_FLAG_ADD:
                        flag = V_IMG_DIRTY_ADD;
                        break;
                    case V_DIRTY_FLAG_DEL:
                        flag = V_IMG_DIRTY_DEL;
                        break;
                    case V_DIRTY_FLAG:
                        flag = V_IMG_DIRTY;
                        break;
                    case V_ERROR_FLAG:
                        flag = V_IMG_ERR;
                        break;
                }
                f_setNodeFlag(n, flag);
            }
        }

        var prev = n;
        n.attributes.configured = 'set';
        n = n.parentNode;

        ////////////////////////////////////////////////
        // if child is dirty, flag parent as dirty as well.
        if(n != undefined && n.attributes.configured != undefined &&
            n.attributes.configured == 'active')
            n.attributes.configured = 'active_plus';
        else if(n != undefined && n.attributes.configured == undefined)
            n.attributes.configured = 'set';
    }
}

function f_parseServerCallback(xmlRoot, treeMode /* conf, operator */)
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
        if(Ext.isGecko3 && msg.length >= 3096 && xmlRoot.textContent != undefined)
        {
            //////////////////////////
            // somehow the textContent some returns addition chars.
            // so the following code are to strip them out.
            var f5 = msg.substr(0, 5);
            msg = xmlRoot.textContent;

            var s5 = msg.substr(0, 5);
            var i=0;
            while(f5 != s5)
            {
                s5 = msg.substr(++i, 5);
                if(i > 5) // ensure to escape loop
                {
                    i=0; break;
                }
            }
            // strip out the i extra chars.
            msg = msg.substr(i, msg.length-i);
        }

        var msgNode = q.selectNode('msg', err);
        segment = msgNode.getAttribute('segment');

        switch(code)
        {
            default:
            case "6": // input error
                success = false;
                f_parseCommitErrors(msg);
                msg = f_replace(msg, "\r\n", "<br>");
                break;
            case "0":
                success = true;
                if(msg.length > 7 && treeMode == V_TREE_ID_config)
                    f_promptInfoMessage("Warning", msg);
                break;
            case "3":
                if(f_isAutoLogin())
                    f_autoLogin();
                else
                {
                    // if user had logined, prompt them a session timeout msg
                    // then log them out.
                    if(f_isUserLogined())
                    {
                        f_promptUserNotLoginMessage();
                        f_userLogout(true, g_baseSystem.m_homePage);
                    }
                }
                break;
            case "4":  //permission level is not valid
                msg = 'operator permission';
                success = true;
                break;
            case "9":
                success = false;
                f_parseCommitErrors(msg);
                msg = "Additional configuration information is required:\r\n" + msg;

        }

        if(msg == 'UNKNOWN')
            msg = '';
    }

    return [ success, msg, segment];
}

function f_parseCommitErrors(err)
{
    var reg = "\r\n";
    var errs = '';
    if(Ext.isIE)
    {
        errs = f_replace(errs, "\r", "");
        reg = "\n";
    }
    errs = err.split(reg);
    g_cliCmdObj.m_commitErrs = [];

    for(var i=0; i<errs.length; i++)
        g_cliCmdObj.m_commitErrs[i] = errs[i].split("/");
}

function f_updateCommitErrors(node, parentNode)
{
    var errs = g_cliCmdObj.m_commitErrs;

    if(errs != null)
    {
        for(var i=0; i<errs.length; i++)
        {
            var err = errs[i];
            for(var j=0; j<err.length; j++)
                if(node != null && node.text == err[j] && // match leaf node
                  (parentNode != null && parentNode.text == err[j-1])) // match parent node
                {
                    if(Ext.isIE)
                        g_cliCmdObj.m_commitErrs[i] = "";
                    else
                        g_cliCmdObj.m_commitErrs[i] = [];

                    return;
                }
        }
    }
}

function f_isCommitError(node)
{
    var cErrs = g_cliCmdObj.m_commitErrs;
    if(cErrs != undefined)
    {
        for(var i=0; i<cErrs.length; i++)
        {
            var errs = cErrs[i];
            for(var j=0; j<errs.length; j++)
            {
                if(errs[j] == node.text)
                {
                    ////////////////////////
                    // if node is top level
                    if(j == 0 || j == 1)
                        return true;

                    ////////////////////////////
                    // if node is not top level,
                    // more check to makesure its
                    // a node we expected.
                    if(node.parentNode != null)
                        if(node.parentNode.text == errs[j-1])
                            return true;
                }
            }
        }
    }

    return false;
}

function f_startSegmentCommand()
{
    g_cliCmdObj.m_segPause = false;

    Ext.TaskMgr.start(
    {
        run: function()
        {
            if(g_cliCmdObj.m_segmentId != undefined &&
                    (g_cliCmdObj.m_segmentId.indexOf("_end") >= 0 ||
                    g_cliCmdObj.m_segmentId == 'segment_end'))
            {
                g_cliCmdObj.m_segmentId = undefined;  // end this segment run
                g_cliCmdObj.m_segPause = false;
            }

            if(g_cliCmdObj.m_segmentId != undefined &&
                !g_cliCmdObj.m_segPause)
            {
                f_sendOperationCliCommand(g_cliCmdObj.m_node, g_cliCmdObj.m_cb,
                                    false, undefined, true,
                                    g_cliCmdObj.m_segmentId,
                                    g_cliCmdObj.m_treeObj,
                                    g_cliCmdObj.m_wildCard);
            }
        }
        ,interval: 1500
    });
}