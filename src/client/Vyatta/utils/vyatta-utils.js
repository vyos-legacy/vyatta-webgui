/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 * Vyatta utils
 */

MyLabel = Ext.extend(Ext.form.Label,
{
    setText: function(t)
    {
        this.text = t;
        if(this.rendered)
            this.el.update(t);
    }
});

/*******************************************************************************
 * set new login expire time
 *******************************************************************************/
function f_resetLoginTimer()
{
    var exp = g_cookie.m_loginTimeExpire;
    g_cookie.f_set(V_COOKIES_LOGIN_TIMER, exp, exp);
}
////////////////////////////////////////////////////////////////////////////////
// return true if user is still login, else reture false;
// updateLoginTimer - true - will update the login timer
//                    false - will not update login timer
// promptMsg - true - will prompt login timeout message.
//             false - will not prompt login timeout message
function f_isUserLogined(updateLoginTimer, promptMsg)
{
    var loginTimer = g_cookie.f_get(V_COOKIES_LOGIN_TIMER);

    if(loginTimer == V_NOT_FOUND)
    {
        if(promptMsg != undefined && promptMsg)
            f_promptUserNotLoginMessage(null);

        return false;
    }
    else
    {
        f_resetLoginTimer();
        return true;
    }
}

function f_saveUserLoginName(name)
{
    g_cookie.f_set(V_COOKIES_USER_NAME, name,
                                g_cookie.m_userNameExpire);
}

function f_getUserLoginName()
{
    return g_cookie.f_get(V_COOKIES_USER_NAME);
}

function f_saveUserLoginId(id)
{
    g_cookie.f_set(V_COOKIES_USER_ID, id, g_cookie.m_loginTimeExpire);
}

function f_getUserLoginedID(cookieP /* cookieP is optional */)
{
    return g_cookie.f_get(V_COOKIES_USER_ID);
}

function f_userLogout(isRedirectToHomePage, toPage)
{
    g_cookie.f_remove(V_COOKIES_LOGIN_TIMER);
    g_cookie.f_remove(V_COOKIES_USER_ID);

    if(isRedirectToHomePage != undefined && isRedirectToHomePage)
    {
        if(navigator.userAgent.indexOf('Chrome') > 0)
            location.reload(true);
    }
}

/***************************************************************************
 * login hander for button action and server callback
 **************************************************************************/
function f_loginHandler(urlLocation, urlPost, uField, pField)
{
      var userField = uField;
      var pwField = pField;

      var f_authCb = function(options, success, response)
      {
          if(response.responseXML != undefined)
          {
              var xmlRoot = response.responseXML.documentElement;
              var q = Ext.DomQuery;
              var id = q.selectValue(V_COOKIES_USER_ID, xmlRoot, V_NOT_FOUND);

              f_saveUserLoginId(id);
              f_saveUserLoginName(userField.getValue());

              if(id == V_NOT_FOUND)
              {
                  f_promptErrorMessage('Login Failed',
                    'Invalid User Name and/or Password. Please try again.');
              }
              else
              {
                  f_resetLoginTimer();
                  window.location = urlLocation;
              }
          }
      }

      var xmlstr = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                   + '<vyatta><auth><user>'
                   + userField.getValue()
                   + "</user>\n"
                   + '<pswd><![CDATA['
                   + pwField.getValue()
                   + "]]></pswd></auth></vyatta>\n";

      var conn = new Ext.data.Connection({});
      conn.request(
      {
        url: urlPost,       //'/cgi-bin/webgui-wrap',
        method: 'POST',
        xmlData: xmlstr,
        callback: f_authCb
      });
}

var f_isLoginFieldsDirty = function(uField, pField)
{
    if(uField.isDirty() && pField.isDirty())
        return true;
}

var f_LoginKeyPressHandler = function(field, e, urlLocation, urlPost,
                              userField, pwField, lButton)
{
    //////////////////////////////////////////////////
    // check for ENTER key to trigger the 'login'
    // button
    if(e.getKey() == 13 && f_isLoginFieldsDirty(userField, pwField))
        f_loginHandler(urlLocation, urlPost, userField, pwField);

    ////////////////////////////////////////
    // enable the 'login' button if both
    // user and password field are dirty.
    f_isLoginFieldsDirty(userField, pwField) ? lButton.enable() :
                         lButton.disable();
}

////////////////////////////////////////////////////////////////////////////////
// Help session related....
function f_createHelpTipsButton(callback)
{
    var helpButton = new Ext.Button(
    {
        handler: callback
        ,text: ' '
    });

    f_updateHelpButtonIcon(helpButton);
    return helpButton;
}

function f_isUserTextValid(val)
{
    for(var i=0; i<val.length; i++)
    {
        var v = val.charCodeAt(i);

        if((v > String.charCodeAt(0) && v < String.charCodeAt(9)) ||
            (v >= String.charCodeAt('a') && v <= String.charCodeAt('z')) ||
            (v >= String.charCodeAt('A') && v <= String.charCodeAt('Z')) ||
            (v == '-' || v == '_'))
            continue;
        else
            return false;
    }

    return true;
}

function f_filterPassword(val, isCreate)
{
    var xml = val;

    if(isCreate)
    {
        xml = f_converXMLSpecialChar(val, "&", "&amp;")
        xml = f_converXMLSpecialChar(xml, "'", "&apos;");
        xml = f_converXMLSpecialChar(xml, ">", "&gt;");
    }
    
    xml = f_converXMLSpecialChar(xml, "<", "&lt;");

    return xml
}

function f_convertXMLSpecialCharacters(val)
{
    var xml = f_converXMLSpecialChar(val, "&", "&amp;")
    xml = f_converXMLSpecialChar(xml, "'", "&apos;");
    xml = f_converXMLSpecialChar(xml, ">", "&gt;");
    xml = f_converXMLSpecialChar(xml, "<", "&lt;");

    return xml;
}

function f_converXMLSpecialChar(val, o, n)
{
    var xml = val;

    var pos=-1;
    var newPos = 0;
    while((newPos = xml.indexOf(o)) > pos)
    {
        xml = xml.replace(o, n);
        pos = newPos;
    }

    return xml;
}

function f_createLoginUserNameField(username)
{
    var fl = username != undefined ? username : 'User name:';

    return new Ext.form.TextField(
    {
      id: 'id_userField'
      ,fieldLabel: fl
      ,labelAlign: 'left'
      ,name: 'userName'
      ,labelSeparator: ''
      ,width: 180
      ,inputType: 'text'
      ,enableKeyEvents: true
      ,allowBlank:false
      ,blankText: 'Please enter User Name'
    });
}

function f_createLoginPasswordField(pw)
{
    var fl = pw != undefined ? pw : 'Password:'
    return new Ext.form.TextField(
    {
        fieldLabel: fl
        ,labelAlign: 'left'
        ,name: 'password'
        ,labelSeparator: ''
        ,width: 180
        ,inputType: 'password'
        ,enableKeyEvents: true
        ,allowBlank:false
        ,blankText: 'Please enter Password'
    });
}


function f_toggleHelpTips(helpButton)
{
    var help = f_getHelpTipsState();

    g_cookie.f_set(V_COOKIES_HELP_TIP_STATE,
                    help==V_HELP_ON?V_HELP_OFF:V_HELP_ON, g_cookie.m_helpExpire);
    f_updateHelpButtonIcon(helpButton)
}

function f_updateHelpButtonIcon(hButton)
{
    var help = f_getHelpTipsState();

    if(hButton != undefined)
        hButton.setIconClass(help==V_HELP_OFF?"v_help_button_hide":"v_help_button_show");
}

function f_getHelpTipsState()
{
    var help = g_cookie.f_get(V_COOKIES_HELP_TIP_STATE);

    return (help == V_NOT_FOUND) ? V_HELP_ON : help;
}

function f_needToggleHelpButton(hButton)
{
    var hState = f_getHelpTipsState();
    var curHState = (hButton.iconCls == "v_help_button_show") ?
              V_HELP_ON : V_HELP_OFF;

    return hState == curHState ? false : true;
}
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// clock ticking every second
var m_clock = new Ext.Toolbar.TextItem('Server Clock goes here');
function f_clockTicking()
{
    //Ext.fly(clock.getEl().parentNode).addClass('x-status-text-panel').createChild({cls:'spacer'});

    // Kick off the clock timer that updates the clock el every second:
    Ext.TaskMgr.start(
    {
        run: function()
        {
            Ext.fly(m_clock.getEl()).update(new
                        Date().format('j-n-y g:i:s A'));
        }
        ,interval: 1000
    });

    new Ext.ToolTip(
    {
        target: 'v_footer_clock'
        ,html: 'This is a <font color="#ff6600">server</font> clock'
    });
}

////////////////////////////////////////////////////////////////////////////////
//
function f_onResize(parentPanel, childPanel, adjW, adjH)
{
    if(parentPanel != undefined && childPanel != undefined)
    {
        childPanel.setHeight(parentPanel.getInnerHeight()+adjH);
        childPanel.setWidth(parentPanel.getInnerWidth()+adjW);
    }
}

////////////////////////////////////////////////////////////////////////////////
//
function f_createToolTip(targetId, htmlText)
{
    var styleStr =
        "{ width: 100px; text-align:center; padding: 5px 0; border:1px dotted #99bbe8;" +
        " background:#dfe8f6; color: #15428b; cursor:default; margin:10px; " +
        "font:bold 11px tahoma,arial,sans-serif; float:left; }";

    var tt = new Ext.ToolTip(
    {
        target: targetId
        ,html: htmlText
        ,style: styleStr
    })

    return tt;
}

function f_createEmptyPanel(html)
{
    return new Ext.Panel(
    {
        border: false
        ,html: html
    });
}

////////////////////////////////////////////////////////////////////////////////
// Error Message Box
function f_promptErrorMessage(title, msgText)
{
    Ext.Msg.show(
    {
      title: title
      ,msg: msgText
      ,buttons: Ext.Msg.OK
      ,handler: function() { f_hideSendWaitMessage();}
      ,icon: Ext.MessageBox.ERROR
      ,modal: true
    });
}

function f_promptWaitMessage(msgText, title)
{
    var cls = 'tf_wait_message';

    return Ext.MessageBox.wait(msgText, title,
    {
        text: 'processing...'
        ,frame: false
        ,cls: cls
    });
}
////////////////////////////////////////////////////////////////////////////////
//
function f_promptUserNotLoginMessage(callbackFn)
{
    alert('Session Time Out \n\n' +
        'For security reasons, your session is no longer active.' +
        '\nPlease re-login again.');
}


////////////////////////////////////////////////////////////////////////////////
// info Message Box
function f_promptInfoMessage(title, msgText, callbackFn)
{
    Ext.Msg.show(
    {
        title: title
        ,msg: msgText
        ,buttons: Ext.Msg.OK
        ,icon: Ext.MessageBox.INFO
        ,modal: true
        //,fn: function() { callbackFn }
    });
}

function f_yesNoMessageBox(title, msgText, callback)
{
    Ext.MessageBox.show(
    {
        title: title
        ,msg: msgText
        ,buttons: Ext.MessageBox.YESNO
        ,fn: callback
        ,icon: Ext.MessageBox.QUESTION
    });
}

function f_replace(str, expOld, expNew)
{
    if(str != undefined && str.search != undefined)
    {
        while(str.search(expOld) > -1)
            str = str.replace(expOld, expNew);
    }

    return str;
}

function f_getUploadDialog()
{
    var dialog = new Ext.Window(
    {
        url: 'upload',
        title: 'Save Configuration File',
        reset_on_hide: true,
        allow_close_on_upload: true,
        upload_autostart: false,
        base_params:
        {
            reqaction: 'uploadfile', resptype: 'json'},
            permitted_extensions: ['xml']
        }
    );

      //dialog.on('uploadsuccess', onUploadSuccess);
      //dialog.on('uploadsuccess', onUploadSuccess);
      //dialog.on('filetest', checkFileCount);
      //dialog.on('resetqueue', function(){fileCount=0;});
      //dialog.on('fileremove', function(){fileCount--} )

    return dialog;
}

function f_commitSingleStoreField(store, record, dataIndex, iindex)
{
    if(store.colHeaders != undefined)
    {
        var modifiedNames = [];
        var modifiedVals = [];
        var j=0;
        var colHeaders = store.colHeaders;

        ////////////////////////////////////////////
        // save user's input data
        for(var i=0; i<colHeaders.length; i++)
        {
            var index = colHeaders[i].toLowerCase().replace(' ', '');

            if(record.modified[index] != undefined)
            {
                modifiedNames[j] = index;
                modifiedVals[j++] = record.modified[index];
            }
        }

        ////////////////////////////////
        // commit it
        record.commit(false);

        ////////////////////////////////////////
        // then, replace the user's input
        record = store.getAt(iindex);
        for(i=0; i<modifiedVals.length; i++)
        {
            var saveVal = record.data[modifiedNames[i]];
            record.set(modifiedNames[i], modifiedVals[i]);
            record.set(modifiedNames[i], saveVal);
        }
    }
}

function f_hideSendWaitMessage()
{
    if(g_cliCmdObj.m_sendCmdWait != null)
        g_cliCmdObj.m_sendCmdWait.hide();
}