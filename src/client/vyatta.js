Ext.onReady(function(){
    var cookieP = new Ext.state.CookieProvider({
      expires: new Date(new Date().getTime() + (15 * 60 * 1000))
    });
    Ext.state.Manager.setProvider(cookieP);
      
    var sid = cookieP.get('id', 'NOTFOUND');
    var authCb = function(options, success, response) {
      var xmlRoot = response.responseXML.documentElement;
      var q = Ext.DomQuery;
      var id = q.selectValue('id', xmlRoot, 'NOTFOUND');
      cookieP.set('id', id);
      sid = id;
    }
    if (sid == 'NOTFOUND') {
      var xmlstr = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                   + "<vyatta><auth><user>vyatta</user>\n"
                   + "<pswd>vyatta</pswd></auth></vyatta>\n";
      var conn = new Ext.data.Connection({});
      conn.request({
        url: '/cgi-bin/webgui-wrap', method: 'POST',
        xmlData: xmlstr,
        callback: authCb
      });
    }

    var editor = new Ext.Panel({
      title: 'Edit',
      height: 580,
      width: 435,
      x: 455,
      y: 10,
      bodyStyle: 'padding:10px',
      border: true,
      collapsible: false,
      tbar: [
        new Ext.Button({
          text: 'Commit',
          handler: function(){
            sendCommandCli([ 'commit' ], null);
          }
        }),
        new Ext.Button({
          text: 'Discard',
          handler: function(){
            sendCommandCli([ 'discard' ], null);
          }
        })
      ]
    });

    var jsonGenNode = function(node, nn) {
      var str = "{text:'" + nn + "'";
      var q = Ext.DomQuery;
      var nLeaf = q.selectNode('terminal', node);
      if (nLeaf != undefined) {
        str += ",leaf:true";
        var nvals = q.select('value', nLeaf);
        if (nvals.length > 0) {
          var vstr = '';
          for (var i = 0; i < nvals.length; i++) {
            if (vstr != '') {
              vstr += ',';
            }
            var cfgd = q.selectValue('configured', nvals[i], 'NONE');
            if (cfgd == 'active' || cfgd == 'set') {
              vstr += "'" + nvals[i].getAttribute('name') + "'";
            }
          }
          str += ",values:[ " + vstr + " ]";
        }
      }
      var nType = q.selectNode('type', node);
      if (nType != undefined) {
        str += ",type:'" + nType.getAttribute('name') + "'";
      }
      var nMulti = q.selectNode('multi', node);
      if (nMulti != undefined) {
        str += ",multi:true";
      }
      var tHelp = q.selectValue('help', node);
      if (tHelp != undefined) {
        tHelp = tHelp.replace(/'/g, "\\'", 'g');
        str += ",help:'" + tHelp + "'";
      }
      var tConfig = q.selectValue('configured', node);
      if (tConfig != undefined) {
        str += ",configured:'" + tConfig + "'";
      }
      var nenums = q.selectNode('enum', node);
      if (nenums != undefined) {
        var enums = q.select('match', nenums);
        var vstr = '';
        for (var i = 1; i <= enums.length; i++) {
          if (vstr != '') {
            vstr += ',';
          }
          vstr += "'" + q.selectValue('match:nth(' + i + ')', nenums) + "'";
        }
        str += ",enums:[ " + vstr + " ]";
      }
      str += "}";
      return str;
    }

    MyTreeLoader = Ext.extend(Ext.tree.TreeLoader, {
      requestData: function(node, callback) {
        if(this.fireEvent("beforeload", this, node, callback) !== false){
            var xmlstr = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                         + "<vyatta><configuration><id>" + sid + "</id>\n"
                         + "<node>" + this.baseParams.nodepath + "</node>\n"
                         + "</configuration></vyatta>\n";
            this.transId = Ext.Ajax.request({
                method:this.requestMethod,
                url: this.dataUrl||this.url,
                success: this.handleResponse,
                failure: this.handleFailure,
                scope: this,
                argument: {callback: callback, node: node},
                //params: this.baseParams
                xmlData: xmlstr
            });
        }else{
            // if the load is cancelled, make sure we notify
            // the node that we are done
            if(typeof callback == "function"){
                callback();
            }
        }
      },
      processResponse: function(response, node, callback) {
        var xmlRoot = response.responseXML.documentElement;
        var q = Ext.DomQuery;
        var nodes = q.select('node', xmlRoot);
        if (nodes.length == 0) {
          response.responseText
            = '[ ]';
          return MyTreeLoader.superclass.processResponse.apply(this,
                                                               arguments);
        }
        var str = '';
        for (var i = 0; i < nodes.length; i++) {
          if (str != '') {
            str += ',';
          }
          str += jsonGenNode(nodes[i], nodes[i].getAttribute('name'));
        }
        response.responseText = '[' + str + ']';
        MyTreeLoader.superclass.processResponse.apply(this, arguments);
      }
    });

    var tree = new Ext.tree.TreePanel({
        height: 580,
        width: 435,
        x: 10,
        y: 10,
        border: true,
        autoScroll: true,
        title: 'Browse',
        pathSeparator: ' ',
       
        loader: new MyTreeLoader({
            clearOnLoad: true,
            requestMethod: 'POST',
            dataUrl: '/cgi-bin/webgui-wrap'
            /*
            uiProviders:{
                'col': Ext.tree.ColumnNodeUI
            }
            */
        }),

        root: new Ext.tree.AsyncTreeNode({
          id: 'root',
          text: 'Configuration'
        })
    });

    var clearEditor = function() {
      if (editor.items != undefined) {
        while (editor.items.getCount() > 0) {
          editor.remove(editor.items.itemAt(0));
        }
      }
      editor.getValFunc = null;
      editor.setValFunc = null;
      editor.getValsFunc = null;
    }
    
    var leafSingleTxtHandler = function(node) {
      var ival = undefined;
      if (node.attributes.values != undefined) {
        ival = node.attributes.values[0];
      }
      var field = new Ext.form.TextField({
        labelSeparator: '',
        width: 300,
        value: ival,
        fieldLabel: node.text
      });
      var fieldP = new Ext.Panel({
        layout: 'form',
        border: false,
        items: [ field ]
      });
      editor.add(fieldP);

      editor.getValFunc = function() {
        return field.getValue();
      }
      editor.setValFunc = function(val) {
        return field.setValue(val);
      }
    }

    var leafSingleU32Handler = function(node) {
      var ival = undefined;
      if (node.attributes.values != undefined) {
        ival = node.attributes.values[0];
      }
      var field = new Ext.form.NumberField({
        labelSeparator: '',
        width: 300,
        allowNegative: false,
        allowDecimals: false,
        maxValue: (Math.pow(2, 32) - 1),
        maskRe: /^\d+$/,
        value: ival,
        fieldLabel: node.text
      });
      var fieldP = new Ext.Panel({
        layout: 'form',
        border: false,
        items: [ field ]
      });
      editor.add(fieldP);

      editor.getValFunc = function() {
        return field.getValue();
      }
      editor.setValFunc = function(val) {
        return field.setValue(val);
      }
    }

    var filterWildcard = function(arr) {
      var wc = false;
      var narr = [ ];
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] == '*') {
          wc = true;
        } else {
          narr[narr.length] = arr[i];
        }
      }
      if (wc) {
        return narr;
      } else {
        return undefined;
      }
    }

    var leafSingleEnumHandler = function(node, values) {
      var ival = undefined;
      if (node.attributes.values != undefined) {
        ival = node.attributes.values[0];
      }
      var narr = filterWildcard(values);
      var isEditable = false;
      if (narr != undefined) {
        isEditable = true;
        values = narr;
      }
      var field = new Ext.form.ComboBox({
        mode: 'local',
        store: values,
        displayField: 'value',
        emptyText: 'Select a valid value...',
        labelSeparator: '',
        editable: isEditable,
        triggerAction: 'all',
        selectOnFocus: true,
        width: 300,
        value: ival,
        fieldLabel: node.text
      });
      var fieldP = new Ext.Panel({
        layout: 'form',
        border: false,
        items: [ field ]
      });
      editor.add(fieldP);

      editor.getValFunc = function() {
        return field.getValue();
      }
      editor.setValFunc = function(val) {
        return field.setValue(val);
      }
    }

    var leafSingleBoolHandler = function(node) {
      leafSingleEnumHandler(node, [ 'true', 'false' ]);
    }

    var getNodePathStr = function(node) {
      var str = node.getPath('text');
      var newstr = str.replace(/^ Configuration /, '');
      return newstr;
    }
    
    var getConfigPathStr = function(node) {
      var str = node.getPath('text');
      var newstr = str.replace(/^ Configuration /, '');
      return newstr;
    }

    var sendCommandWait = null;

    var sendCommandCli = function(cmds, node, isCreate) {
      sendCommandWait = Ext.MessageBox.wait('Changing configuration...',
                                            'Configuration');
      
      var sendCommandCliCb = function(options, success, response) {
        var xmlRoot = response.responseXML.documentElement;
        var q = Ext.DomQuery;
        var errmsg = 'Unknown error';
        var success = true;
        var err = q.selectNode('error', xmlRoot);
        if (err == undefined) {
          success = false;
        } else {
          var code = q.selectValue('code', err, 'UNKNOWN');
          if (code == 'UNKNOWN') {
            success = false;
          } else if (code != 0) {
            success = false;
            var msg = q.selectValue('msg', err, 'UNKNOWN');
            if (msg != 'UNKNOWN') {
              errmsg = msg;
            }
          }
        }

        if (sendCommandWait != null) {
          sendCommandWait.hide();
        }
        if (success) {
          var selNode = tree.getSelectionModel().getSelectedNode();
          var selPath = selNode.getPath('text');
          var selText = selNode.text;
          clearEditor();
          if (node == undefined) {
            var p = tree.root;
            var ehandler = function(success, last){
              if (last.getPath('text') != selPath) {
                // we were at leaf. "last" is parent.
                tree.selectPath(selPath, 'text', function(success,sel){
                  var nnode = tree.getSelectionModel().getSelectedNode();
                  nodeClickHandler(nnode, null);
                });
              } else {
                tree.selectPath(selPath, 'text');
                nodeClickHandler(last, null);
              }
            }
            var handler = function(narg){
              tree.expandPath(selPath, 'text', ehandler);
              narg.un('expand', handler); 
            }
            p.on('expand', handler);
            p.collapse();
            p.expand();
          } else if (node.parentNode != undefined) {
            if (isCreate) {
              /*
               * successfully created a node. now need to propagate the
               * "configured" status up the tree (since we only reload the
               * parent node, which only updates all siblings of the newly
               * created node).
               */
              var n = node.parentNode;
              while (n != undefined) {
                if ((n.attributes.configured == 'active')
                    || (n.attributes.configured == 'set')) {
                  // already set. we're done.
                  break;
                }
                n.attributes.configured = 'set';
                n = n.parentNode;
              }
            }
            var p = node.parentNode;
            var handler = function(narg){
              tree.selectPath(selPath, 'text');
              var nnode = narg.findChild('text', selText);
              nodeClickHandler(nnode, null);
              narg.un('expand', handler); 
            }
            p.on('expand', handler);
            p.collapse();
            p.expand();
          }
        } else {
          Ext.MessageBox.alert('Configuration',
                               "Changing configuration failed:\n"
                               + errmsg);
        }
      }
      var xmlstr = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                   + "<vyatta><command><id>" + sid + "</id>\n";
      for (var i = 0; i < cmds.length; i++) {
        xmlstr += "<statement>" + cmds[i] + "</statement>\n";
      }
      xmlstr += "</command></vyatta>\n";
      var conn = new Ext.data.Connection({});
      conn.request({
        url: '/cgi-bin/webgui-wrap', method: 'POST',
        xmlData: xmlstr,
        callback: sendCommandCliCb
      });
    }
    
    var leafSingleHandler = function(node) {
      if (node.attributes.enums != undefined) {
        leafSingleEnumHandler(node, node.attributes.enums);
      } else if (node.attributes.type == undefined) {
        // type-less node
      } else if (node.attributes.type == 'bool') {
        leafSingleBoolHandler(node);
      } else if (node.attributes.type == 'u32') {
        leafSingleU32Handler(node);
      } else { //if (node.attributes.type == 'text') {
        // XXX treat everything else as text for now
        leafSingleTxtHandler(node);
      }
     
      // help string
      if (node.attributes.help != undefined) {
        var label = new Ext.form.Label({
          text: node.attributes.help
        });
        editor.add(label);
      }

      /*
       * buttons:
       *   create:
       *     ! configured ||
       *     configured-deleted
       *   delete:
       *     configured-added ||
       *     configured-active
       *   update:
       *     configured-added ||
       *     configured-active
       * 
       * state:
       *   ! configured: "create"
       *   configured-active typed: "delete", "update"
       *   configured-active typeless: "delete"
       *   configured-added: "delete", "update"
       *   configured-deleted: "create"
       */
      if (node.attributes.configured == undefined
          || node.attributes.configured == 'delete') {
        // not configured or deleted
        editor.add(new Ext.Button({
          text: 'Create',
          handler: function() {
            if (node.attributes.type == undefined) {
              // typeless
              sendCommandCli([ 'set ' + getConfigPathStr(node) ], node,
                             true);
            } else if (editor.getValFunc != undefined) {
              sendCommandCli([ 'set ' + getConfigPathStr(node)
                               + " '" + editor.getValFunc() + "'"
                             ], node, true);
            }
          }
        }));
      } else {
        // active or set
        if (node.attributes.type != undefined) {
          // only add Update button if typed
          editor.add(new Ext.Button({
            text: 'Update',
            handler: function() {
              if (node.attributes.type == undefined) {
                // typeless
                sendCommandCli([ 'set ' + getConfigPathStr(node) ], node);
              } else if (editor.getValFunc != undefined) {
                sendCommandCli([ 'set ' + getConfigPathStr(node)
                                 + " '" + editor.getValFunc() + "'"
                               ], node);
              }
            }
          }));
        }
        editor.add(new Ext.Button({
          text: 'Delete',
          handler: function() {
            sendCommandCli([ 'delete ' + getConfigPathStr(node) ], node);
          }
        }));
      }
      editor.doLayout();
    }

    var leafMultiTxtHandler = function(node) {
      var vala = [ ];
      var gridStore = new Ext.data.SimpleStore({
        fields: [
          { name: 'value' }
        ]
      });
      gridStore.loadData(vala);
      if (node.attributes.values != undefined) {
        vala = node.attributes.values;
      }
      
      var GridT = Ext.data.Record.create([
        { name: 'value' }
      ]);

      var grid = new Ext.grid.EditorGridPanel({
        store: gridStore,
        border: true,
        autoScroll: true,
        clicksToEdit: 1,
        frame: true,
        width: 320,
        height: 200,
        sm: new Ext.grid.RowSelectionModel({ singleSelect: true }),
        stripeRows: true,
        columns: [
          { id: 'value',
            header: 'Value',
            width: 300,
            sortable: false,
            dataIndex: 'value',
            editor: new Ext.form.TextField({ })
          }
        ],
        buttons: [
          new Ext.Button({
            text: 'Add',
            handler: function() {
              gridStore.loadData([ '' ], true);
            }
          }),
          new Ext.Button({
            text: 'Delete',
            handler: function() {
              var smod = grid.getSelectionModel();
              if (!smod.hasSelection()) {
                Ext.MessageBox.Alert('Delete value', 'No value selected.');
                return;
              }
              gridStore.remove(smod.getSelected());
            }
          })
        ],
        title: node.text
      });
      for (var i = 0; i < vala.length; i++) {
        var v = new GridT({ value: vala[i] });
        gridStore.add(v);
      }
      editor.add(grid);
      
      editor.getValsFunc = function() {
        var ret = [ ];
        for (var i = 0; i < gridStore.getCount(); i++) {
          ret[i] = gridStore.getAt(i).get('value');
        }
        return ret;
      }
    }

    var leafMultiU32Handler = function(node) {
      var vala = [ ];
      var gridStore = new Ext.data.SimpleStore({
        fields: [
          { name: 'value' }
        ]
      });
      gridStore.loadData(vala);
      if (node.attributes.values != undefined) {
        vala = node.attributes.values;
      }
      
      var GridT = Ext.data.Record.create([
        { name: 'value' }
      ]);

      var grid = new Ext.grid.EditorGridPanel({
        store: gridStore,
        border: true,
        autoScroll: true,
        clicksToEdit: 1,
        frame: true,
        width: 320,
        height: 200,
        sm: new Ext.grid.RowSelectionModel({ singleSelect: true }),
        stripeRows: true,
        columns: [
          { id: 'value',
            header: 'Value',
            width: 300,
            sortable: false,
            dataIndex: 'value',
            editor: new Ext.form.NumberField({
              allowNegative: false,
              allowDecimals: false,
              maxValue: (Math.pow(2, 32) - 1),
              maskRe: /^\d+$/
            })
          }
        ],
        buttons: [
          new Ext.Button({
            text: 'Add',
            handler: function() {
              gridStore.loadData([ '' ], true);
            }
          }),
          new Ext.Button({
            text: 'Delete',
            handler: function() {
              var smod = grid.getSelectionModel();
              if (!smod.hasSelection()) {
                Ext.MessageBox.Alert('Delete value', 'No value selected.');
                return;
              }
              gridStore.remove(smod.getSelected());
            }
          })
        ],
        title: node.text
      });
      for (var i = 0; i < vala.length; i++) {
        var v = new GridT({ value: vala[i] });
        gridStore.add(v);
      }
      editor.add(grid);
      
      editor.getValsFunc = function() {
        var ret = [ ];
        for (var i = 0; i < gridStore.getCount(); i++) {
          ret[i] = gridStore.getAt(i).get('value');
        }
        return ret;
      }
    }

    var leafMultiEnumHandler = function(node, values) {
      var vala = [ ];
      var gridStore = new Ext.data.SimpleStore({
        fields: [
          { name: 'value' }
        ]
      });
      gridStore.loadData(vala);
      if (node.attributes.values != undefined) {
        vala = node.attributes.values;
      }
      
      var GridT = Ext.data.Record.create([
        { name: 'value' }
      ]);
      
      var narr = filterWildcard(values);
      var doValidate = true;
      if (narr != undefined) {
        doValidate = false;
        values = narr;
      }

      var grid = new Ext.grid.EditorGridPanel({
        store: gridStore,
        border: true,
        autoScroll: true,
        clicksToEdit: 1,
        frame: true,
        width: 320,
        height: 200,
        sm: new Ext.grid.RowSelectionModel({ singleSelect: true }),
        stripeRows: true,
        columns: [
          { id: 'value',
            header: 'Value',
            width: 300,
            sortable: false,
            dataIndex: 'value',
            editor: new Ext.form.TextField({
              validator: function(cval) {
                if (!doValidate) {
                  return true;
                }
                for (var i = 0; i < values.length; i++) {
                  if (cval == values[i]) {
                    return true;
                  }
                }
                return false;
              }
            })
          }
        ],
        buttons: [
          new Ext.Button({
            text: 'Add',
            handler: function() {
              gridStore.loadData([ '' ], true);
            }
          }),
          new Ext.Button({
            text: 'Delete',
            handler: function() {
              var smod = grid.getSelectionModel();
              if (!smod.hasSelection()) {
                Ext.MessageBox.Alert('Delete value', 'No value selected.');
                return;
              }
              gridStore.remove(smod.getSelected());
            }
          })
        ],
        title: node.text
      });
      for (var i = 0; i < vala.length; i++) {
        var v = new GridT({ value: vala[i] });
        gridStore.add(v);
      }
      editor.add(grid);

      /* XXX combo */
      /*
      var vala = [ ];
      var gridStore = new Ext.data.SimpleStore({
        fields: [
          { name: 'value' }
        ]
      });
      gridStore.loadData(vala);
      if (node.attributes.values != undefined) {
        vala = node.attributes.values;
      }
      
      var comboStore = new Ext.data.SimpleStore({
        fields: [
          { name: 'value' }
        ],
        data: values
      });

      var GridT = Ext.data.Record.create([
        { name: 'value' }
      ]);

      var grid = new Ext.grid.EditorGridPanel({
        store: gridStore,
        border: true,
        autoScroll: true,
        clicksToEdit: 1,
        width: 320,
        height: 200,
        sm: new Ext.grid.RowSelectionModel({ singleSelect: true }),
        stripeRows: true,
        columns: [
          { id: 'value',
            header: 'Value',
            dataIndex: 'value',
            width: 300,
            sortable: false,
            editor: new Ext.form.ComboBox({
              mode: 'local',
              store: comboStore,
              width: 250,
              displayField: 'value',
              emptyText: 'Select a valid value...',
              editable: false,
              triggerAction: 'all',
              selectOnFocus: true
            })
          }
        ],
        buttons: [
          new Ext.Button({
            text: 'Add',
            handler: function() {
              var v = new GridT({ value: values[0] });
              gridStore.add(v);
            }
          })
        ],
        title: node.text
      });
      editor.add(grid);
      */

      editor.getValsFunc = function() {
        var ret = [ ];
        for (var i = 0; i < gridStore.getCount(); i++) {
          ret[i] = gridStore.getAt(i).get('value');
        }
        return ret;
      }
    }

    var leafMultiHandler = function(node) {
      if (node.attributes.enums != undefined) {
        leafMultiEnumHandler(node, node.attributes.enums);
      } else if (node.attributes.type == 'u32') {
        leafMultiU32Handler(node);
      } else { //if (node.attributes.type == 'text') {
        // XXX treat everything else as text for now
        leafMultiTxtHandler(node);
      }
     
      // help string
      if (node.attributes.help != undefined) {
        var label = new Ext.form.Label({
          text: node.attributes.help
        });
        editor.add(label);
      }

      /*
       *   ! configured: "create"
       *   configured-active: "delete", "update" (multi must be typed)
       *   configured-added: "delete", "update"
       *   configured-deleted: "create"
       */
      if (node.attributes.configured == undefined
          || node.attributes.configured == 'delete') {
        // not configured or deleted
        editor.add(new Ext.Button({
          text: 'Create',
          handler: function() {
            if (editor.getValsFunc != undefined) {
              var varr = [ ];
              var values = editor.getValsFunc();
              for (var i = 0; i < values.length; i++) {
                varr[i + 1] = 'set ' + getConfigPathStr(node)
                              + " '" + values[i] + "'";
              }
              sendCommandCli(varr, node, true);
            }
          }
        }));
      } else {
        // active or set
        editor.add(new Ext.Button({
          text: 'Update',
          handler: function() {
            if (editor.getValsFunc != undefined) {
              var varr = [ 'delete ' + getConfigPathStr(node) ];
              var values = editor.getValsFunc();
              for (var i = 0; i < values.length; i++) {
                varr[i + 1] = 'set ' + getConfigPathStr(node)
                              + " '" + values[i] + "'";
              }
              sendCommandCli(varr, node);
            }
          }
        }));
        editor.add(new Ext.Button({
          text: 'Delete',
          handler: function() {
            sendCommandCli([ 'delete ' + getConfigPathStr(node) ], node);
          }
        }));
      }
      editor.doLayout();
    }

    tree.getLoader().on('beforeload',
      function(loader, node) {
        var str = node.getPath('text');
        var path = str.replace(/^ Configuration/, '');
        loader.baseParams.nodepath = path;
      }
    );
    tree.on('beforeexpandnode',
      function(node, deep, anim) {
        node.reload();
      }
    );
    tree.on('beforecollapsenode',
      function(node, deep, anim) {
        node.collapseChildNodes(true);
      }
    );

    var interHandler = function(node) {
      // do nothing for root
      if (getNodePathStr(node) == ' Configuration') {
        return;
      }
      
      // TODO: allow configuring all children in edit panel
 
      // help string
      if (node.attributes.help != undefined) {
        var label = new Ext.form.Label({
          text: node.attributes.help
        });
        editor.add(label);
      }

      /*
       *   ! configured: "create"
       *   configured-active: "delete"
       *   configured-added: "delete"
       *   configured-deleted: "create"
       */
      if (node.attributes.configured == undefined
          || node.attributes.configured == 'delete') {
        // not configured or deleted
        editor.add(new Ext.Button({
          text: 'Create',
          handler: function() {
            sendCommandCli([ 'set ' + getConfigPathStr(node) ], node, true);
          }
        }));
      } else {
        // active or set
        editor.add(new Ext.Button({
          text: 'Delete',
          handler: function() {
            sendCommandCli([ 'delete ' + getConfigPathStr(node) ], node);
          }
        }));
      }
      editor.doLayout();
    }

    var interMultiHandler = function(node) {
      /*
       *   all: "add" field
       *   configured-active: "delete"
       *   configured-added: "delete"
       */
      var field = new Ext.form.TextField({
        labelSeparator: '',
        width: 300,
        fieldLabel: 'Add child node'
      });
      var fieldP = new Ext.Panel({
        layout: 'form',
        border: false,
        items: [ field ]
      });
      editor.add(fieldP);
      
      // help string
      if (node.attributes.help != undefined) {
        var label = new Ext.form.Label({
          text: node.attributes.help
        });
        editor.add(label);
      }

      editor.add(new Ext.Button({
        text: 'Add',
        handler: function() {
          sendCommandCli([ 'set ' + getConfigPathStr(node)
                           + " '" + field.getValue() + "'"
                         ], node);
        }
      }));

      if (node.attributes.configured != undefined
          && node.attributes.configured != 'delete') {
        editor.add(new Ext.Button({
          text: 'Delete',
          handler: function() {
            sendCommandCli([ 'delete ' + getConfigPathStr(node) ], node);
          }
        }));
      }
      editor.doLayout();
    }

    var nodeClickHandler = function(node, e) {
      clearEditor();
      if (node.leaf) {
        if (node.attributes.multi == undefined || !node.attributes.multi) {
          leafSingleHandler(node);
        } else {
          leafMultiHandler(node);
        }
      } else {
        // non-leaf
        node.expand();
        if (node.attributes.multi == undefined || !node.attributes.multi) {
          interHandler(node);
        } else {
          interMultiHandler(node);
        }
      }
    }

    tree.on('click', nodeClickHandler);

    var topPanel = new Ext.Panel({
      el: 'config',
      title: 'Vyatta Web GUI',
      width: 900,
      height: 630,
      collapsible: false,
      layout: 'absolute',
      items: [ tree, editor ]
    });

    topPanel.render();
});
