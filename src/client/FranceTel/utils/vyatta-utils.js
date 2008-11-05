/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 *
 * FT utils
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



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Vyatta cookie provider. the cookie stays in the system for 30 days.
m_cookieP = undefined;
function f_getCookieProvider()
{
    if(m_cookieP == undefined)
    {
      m_cookieP = new Ext.state.CookieProvider(
      {
          domain: document.domain
          ,expires: new Date(new Date().getTime() + (5 * 60 * 60 * 1000))
          //,secure: true
      });

      Ext.state.Manager.setProvider(m_cookieP);
    }

    return m_cookieP;
}

/*******************************************************************************
 * return a new login timer counter
 *******************************************************************************/
function f_resetLoginTimer()
{
    var timer = new Date(new Date().getTime() + (15 * 60 * 1000));
    var cookie = f_getCookieProvider();
    cookie.set(V_COOKIES_LOGIN_TIMER, timer);

    return timer;
}
////////////////////////////////////////////////////////////////////////////////
// return true if user is still login, else reture false;
// updateLoginTimer - true - will update the login timer
//                    false - will not update login timer
// promptMsg - true - will prompt login timeout message.
//             false - will not prompt login timeout message
function f_isUserLogined(updateLoginTimer, promptMsg)
{
    var cookie = f_getCookieProvider();
    var loginTimer = cookie.get(V_COOKIES_LOGIN_TIMER, V_NOT_FOUND);

    var curTime = new Date().getTime();
    if(loginTimer == V_NOT_FOUND || loginTimer.valueOf() < curTime)
    {
        if(promptMsg != undefined && promptMsg)
            f_promptUserNotLoginMessage(null);

        return false;
    }
    else
    {
        if(updateLoginTimer != undefined && updateLoginTimer)
            f_resetLoginTimer();

        return true;
    }
}

function f_saveUserLoginName(name)
{
    var cookie = f_getCookieProvider();
    cookie.set(V_COOKIES_USER_NAME, name);
}

function f_getUserLoginName()
{
    var cookie = f_getCookieProvider();
    return cookie.get(V_COOKIES_USER_NAME, V_NOT_FOUND);
}

function f_saveUserLoginId(id)
{
    var cookie = f_getCookieProvider();
    cookie.set(V_COOKIES_USER_ID, id);
}

function f_getUserLoginedID(cookieP /* cookieP is optional */)
{
    if(cookieP == undefined)
        return f_getCookieProvider().get(V_COOKIES_USER_ID, V_NOT_FOUND);

    return cookieP.get(V_COOKIES_USER_ID, V_NOT_FOUND);
}

function f_userLogout(isRedirectToHomePage, toPage)
{
    var cookieP = f_getCookieProvider();

    cookieP.set(V_COOKIES_LOGIN_TIMER, V_NOT_FOUND);
    cookieP.set(V_COOKIES_USER_ID, V_NOT_FOUND);

    if(isRedirectToHomePage != undefined && isRedirectToHomePage)
        window.location = toPage;
}

/***************************************************************************
 * login hander for button action and server callback
 **************************************************************************/
function f_loginHandler(urlLocation, urlPost, uField, pField)
{
      var userField = uField;
      var pwField = pField;

      //m_statusBar.showBusy();
      var f_authCb = function(options, success, response)
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

var f_clearEditor = function(editor)
{
    if(editor == undefined) return;

    editor.opVal = undefined;

    if(editor.items != undefined)
    {
        while(editor.items.getCount() > 0)
            editor.remove(editor.items.itemAt(0));
    }
}

////////////////////////////////////////////////////////////////////////////////
// Help session related....
function f_isUserTextValid(val)
{
    for(var i=0; i<val.length; i++)
    {
        var v = val.charCodeAt(i);

        if((v > String.charCodeAt(0) && v < String.charCodeAt(9)) ||
            (v >= String.charCodeAt('a') && v <= String.charCodeAt('z')) ||
            (v >= String.charCodeAt('A') && v <= String.charCodeAt('Z')) ||
            (v == '-' || v == '_'))
        {
            continue;
        }
        else
            return false;
    }

    return true;
}

function f_isPasswordValid(val)
{

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

    var userField = new Ext.form.TextField(
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
      //,tabIndex: 0
    });

    return userField;
}

function f_createLoginPasswordField(pw)
{
    var fl = pw != undefined ? pw : 'Password:'
    passField = new Ext.form.TextField(
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

    return passField;
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// clock ticking every second
var m_clock = new Ext.Toolbar.TextItem('Server Date/Time goes here');
m_clock.m_serverTime = null;
function f_clockTicking(sDate)
{
    //Ext.fly(clock.getEl().parentNode).addClass('x-status-text-panel').createChild({cls:'spacer'});
    var secTime = new Date().getTime();
    if(sDate != undefined && sDate instanceof Date)
         secTime = sDate.getTime();

    // Kick off the clock timer that updates the clock el every second:
    Ext.TaskMgr.start(
    {
        run: function()
        {
            secTime += 1000;
            Ext.fly(m_clock.getEl()).update(new
                            Date(secTime).format('j-n-y g:i:s A'));
        }
        ,interval: 1000
    });

    new Ext.ToolTip(
    {
        target: 'footer_clock'
        ,html: 'This is a <font color="#ff6600">server</font> clock'
    });
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
    });
}

function f_promptWaitMessage(msgText, title)
{
    /*
    var cls = 'tf_wait_message';

    return Ext.MessageBox.wait(msgText, title,
    {
        text: 'Loading...'
        ,frame: false
        ,cls: cls
    });
    */

    var panel = new Ext.Panel(
    {
        html: "<font size=2><b>" + msgText + "...</b></font>"
        ,border: false
        ,height: 30
        ,bodyStyle: 'padding: 5px'
        ,cls : 'tf_wait_message_panel'
    });

    var myLoadBar = new Ext.ProgressBar(
    {
	text	: "Loading ...",
        cls     : 'tf_wait_message'
    });

    g_sendCommandWait = new Ext.Window(
    {
        closable	: false,
        collapsible	: false,
        draggable	: false,
        resizable	: false,
        autoDestroy	: true,
        frame           : false,
        border          : true,
        bodyBorder      : true,
        renderTo	: document.body,
        //layout		: "fit",
        width		: 250,
        height		: 68,
        plain		: true,
        modal		: true,
        bodyStyle       : 'padding: 10px',
        items		: [ panel, myLoadBar ],
        cls             : 'tf_wait_message',
        listeners	:
        {
            "hide"	: function ()
            {
                if(myLoadBar.rendered && myLoadBar.isWaiting()) myLoadBar.reset();
            },
            "show"	: function ()
            {
                if(myLoadBar.rendered && !myLoadBar.isWaiting())
                {
                    myLoadBar.wait(
                    {
                            interval	: 50,
                            duration	: 59000,
                            increment	: 100
                    });
                }
            }
        }
    });

    //Ext.get(document.body).mask();
    g_sendCommandWait.show();
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
  if(callbackFn == undefined)
  {
    Ext.Msg.show(
    {
      title: title
      ,msg: msgText
      ,buttons: Ext.Msg.OK
      ,icon: Ext.MessageBox.INFO
      ,modal: true
    });
  }
  else
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
}

function f_yesNoMessageBox(title, msgText, callback)
{
    Ext.MessageBox.show(
    {
        title: title
        ,msg: msgText
        ,buttons: Ext.MessageBox.YESNO
        ,fn: function(button)
        {
            if(button == 'yes')
                callback.call();
        }
        ,icon: Ext.MessageBox.QUESTION
    });
}

function f_parseResponseError(xmlRoot, wantMsg)
{
    var success = true;
    var errmsg = '';
    var q = Ext.DomQuery;
    var err = q.selectNode('error', xmlRoot);

    if(err != undefined)
    {
        var code = q.selectValue('code', err, 'UNKNOWN');

        if(code == 'UNKNOWN')
        {
            success = false;
            errmsg = "Unknown";
        }
        else if(wantMsg != undefined || code != 0)
        {
            success = false;
            var msg = q.selectValue('msg', err, 'UNKNOWN');

            if(msg != 'UNKNOWN')
                errmsg = msg;
        }
    }

    return [ success, errmsg ];
}

function f_findPercentage(total, free)
{
    if(total == 0 && free == 0) return 0;
    if(free <= 0) return 100;

    var p = 100 - Math.round((free/total) * 100);

    return p < 0 ? 0 : p;
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
        for(var i=0; i<modifiedVals.length; i++)
        {
            var saveVal = record.data[modifiedNames[i]];
            record.set(modifiedNames[i], modifiedVals[i]);
            record.set(modifiedNames[i], saveVal);
        }
    }
}

function f_replaceAll(string, oldExp, newExp)
{
    var str = string;

    while(str.indexOf(oldExp) >= 0)
        str = str.replace(oldExp, newExp);

    return str;
}

g_sendCommandWait = null;
function f_hideSendWaitMessage()
{
    if(g_sendCommandWait != null)
        g_sendCommandWait.hide();
}