/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

VYATTA_LoginObject = Ext.extend(VYATTA_panels,
{
    ////////////////////////////////////////////////////////////////////////////
    constructor: function(parentContainer, name)
    {
        this.m_parentContainer = parentContainer;
        this.m_name = name;
    },

    f_initDataType: function()
    {
        this.f_initPanelDataType(this.m_parentContainer, this.m_name);
    },

    f_initLoginPanel: function()
    {
        this.f_initLayout(this.m_parentContainer, V_TREE_ID_login);
        
        /*
         * login form with input components
         */
        var userField = f_createLoginUserNameField();
        var passField = f_createLoginPasswordField();
        
        var loginButton = new Ext.Button(
        {
          text: ' '
          ,iconCls: 'v_login_in'
          ,minWidth: 100
          ,disabled: true
          ,handler: function() { f_loginHandler(
                  'main.html', '/cgi-bin/webgui-wrap', userField, passField); }
        })

        var f_validateInputs = function()
        {
            if(userField.isDirty() && passField.isDirty())
                return true;

            return false;
        }

        var onKeyPressHandler = function(field, e)
        {
            f_LoginKeyPressHandler(field, e, 'main.html', '/cgi-bin/webgui-wrap',
                      userField, passField, loginButton);
        }

        userField.on('keyup', onKeyPressHandler);
        passField.on('keyup', onKeyPressHandler);

        var loginFormPanel = new Ext.form.FormPanel(
        {
            labelWidth: 75 // label settings here cascade unless overridden
            ,frame:false
            ,border: false
            ,title: 'Please Enter User Name and Password to Login'
            //,layoutConfig: Ext.layout.FormLayout
            ,bodyStyle:'padding:10px 10px 5px 10px'
            ,width: 350
            //,defaults: {width: 230}
            ,defaultType: 'textfield'
            ,monitorValid: true
            ,items: [userField, passField]
            ,buttons: [loginButton]
        });


        userField.focus(false, 1000);
        
        this.m_editorPanel.add(loginFormPanel);
        this.m_editorPanel.doLayout();
    }
});

