/*
 Document   : ft_configPanel.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: The configuration panel on the right side of the main panel
 */
function FT_configPanel()
{
    /////////////////////////////////////
    // properties
    var thisObj = this;
    this.m_parent = undefined;
    this.m_selectedItem = undefined;
    this.m_container = undefined; //the configuration panel
    this.m_parent_container = undefined; //the OA container which includes left menu + config panel
    this.m_configTempHolder = undefined; //temporary 'ft_container' div
    this.m_currentDesc = undefined;//current description text
    this.m_title = undefined; //the title container for the header
    this.m_activeCmp = undefined; //the component currently active (displayed)
    this.m_activeObj = undefined; //the object that its component is currently active.
    this.m_selectCmp = undefined; //the component being selected (but not yet displayed)
    this.m_selectObj = undefined; //the object that its component is being selected
    this.m_dynSubMenu = undefined; //the dynamic inner sub menu (class=dyn_sub_menu) for user add/ user update
    ///////////////////////////////////////
    // functions
    /**
     * A initialization method
     */
    this.f_init = function(p)
    {
        thisObj.m_parent = p;
        thisObj.m_parent_container = document.getElementById(VYA.FT_CONST.DOM_MAIN_PANEL_OA_CONTAINER_ID);
        thisObj.m_configTempHolder = document.getElementById('ft_container');
        //Obtain a reference to the div tag in the html.
        thisObj.m_container = document.getElementById(VYA.FT_CONST.DOM_3_CONFIG_PANEL_ID);
        thisObj.m_title = document.getElementById(VYA.FT_CONST.DOM_3_CONFIG_PANEL_TITLE_ID);
        thisObj.m_container.parentNode.removeChild(thisObj.m_container);
        //initialize the dynamic sub menu 
        thisObj.f_initDynSubMenu();
    }
    
    this.f_initDynSubMenu = function()
    {
        var aMenu = document.getElementById(VYA.FT_CONST.DOM_DYN_SUB_MENU_ID);
        aMenu.parentNode.removeChild(aMenu);
        aMenu = f_elemGetFirstChildByNodeName(aMenu, 'UL'); //Get to the UL portion.	
        thisObj.m_dynSubMenu = new FT_lookupTable();
        //now go through the LI entries, and find out the id, desc from the HREF, 
        //and add the id, desc to the lookup
        for (var i = 0; aMenu.childNodes[i]; i++) { //This is @ LI node
            var sid = f_elemGetAttribute(aMenu.childNodes[i], 'id');
            if ((sid != undefined) && (sid != null)) {
                var nodeHref = f_elemGetFirstChildByNodeName(aMenu.childNodes[i], 'A');
                if (nodeHref != null) {
                    var desc = nodeHref.getAttribute('desc');
                    thisObj.m_dynSubMenu.f_put(sid, desc);
                }
            }
        }
    }
    
    this.f_showHeader = function(id, desc)
    {
        thisObj.m_currentDesc = desc;
        thisObj.m_title.innerHTML = thisObj.m_currentDesc;
        thisObj.m_selectedItem = id;
        thisObj.m_container.style.display = 'block';
        thisObj.m_parent_container.appendChild(thisObj.m_container);
    }
    
    this.f_stopPolling = function()
    {
        if (thisObj.m_activeObj != undefined) {
            thisObj.m_activeObj.f_stopLoadVMData();
        }
    }
    
    this.f_showPage = function(id)
    {
        //Lookup the id2desc in the hidden link first
        var desc = thisObj.m_dynSubMenu.f_get(id);
        if (desc == undefined) {
            //Lookup the id2desc from the regular link
            desc = thisObj.m_parent.m_3navMenu.f_getDescById(id);
        }
        if (desc != undefined) {
            thisObj.f_show(id, desc);
        } else {
            alert('cannot find description for id: ' + id);
        }
    }
    
    this.f_show = function(id, desc)
    {
        thisObj.f_stopPolling();
        thisObj.f_showHeader(id, desc);
        
        var cmp = thisObj.f_getComponent(id);
        if (cmp == null) {
            cmp = thisObj.f_createEmptyComponent();
        }
        thisObj.f_render(cmp);
    }
    
    this.f_getComponent = function(id)
    {
        switch (id) {
        
            case VYA.FT_CONST.DOM_3_NAV_SUB_DASHBOARD_ID:
                var dbcb = function(){
                
                }
                thisObj.m_selectObj = new FT_confDashboard('db', dbcb, g_busObj);
                return thisObj.m_selectObj.f_getConfigurationPage();
                
            case VYA.FT_CONST.DOM_3_NAV_SUB_UPDATE_ID:
                var dbcb = function(){
                
                }
                thisObj.m_selectObj = new FT_confVMUpdates('db', dbcb, g_busObj);
                return thisObj.m_selectObj.f_getConfigurationPage();
               
            case VYA.FT_CONST.DOM_3_NAV_SUB_RESTART_ID:
                var dbcb = function(){
                
                }
                thisObj.m_selectObj = new FT_confRestart('db', dbcb, g_busObj);
                return thisObj.m_selectObj.f_getConfigurationPage();
                
            case VYA.FT_CONST.DOM_3_NAV_SUB_SUBCRIBE_ID:
                
            case VYA.FT_CONST.DOM_3_NAV_SUB_USER_ID:
                var dbcb = function(){
                
                }
                thisObj.m_selectObj = new FT_confUserList('db', dbcb, g_busObj);
                return thisObj.m_selectObj.f_getConfigurationPage();
                
                
            case VYA.FT_CONST.DOM_3_NAV_SUB_USER_RIGHT_ID:
                
            case VYA.FT_CONST.DOM_3_NAV_SUB_HARDWARE_ID:
                var hwCb = function(){
                }
                thisObj.m_selectObj = new FT_confHwMonitor('Hardware Monitor', hwCb, g_busObj);
                return thisObj.m_selectObj.f_getConfigurationPage();
                
            case VYA.FT_CONST.DOM_3_NAV_SUB_NETWORK_ID:
            case VYA.FT_CONST.DOM_3_NAV_SUB_BACKUP_ID:
                var dbcb = function(){

                }
                var db = new FT_confBackup('db', dbcb, g_busObj);
                return db.f_getConfigurationPage();			
			
            case VYA.FT_CONST.DOM_3_NAV_SUB_RESTORE_ID:
                return thisObj.f_createEmptyComponent();
                
            case VYA.FT_CONST.DOM_3_NAV_SUB_EMAIL_SRV_ID:
                var mpCb = function(){
                }
                thisObj.m_selectObj = new FT_confEmailServer('Email Server', mpCb, g_busObj);
                thisObj.m_selectObj.f_init();
                return thisObj.m_selectObj.f_getConfigurationPage();
                
            case VYA.FT_CONST.DOM_3_NAV_SUB_TIME_SRV_ID:
                var mpCb = function(){
                }
                thisObj.m_selectObj = new FT_confTimeServer('Time Server', mpCb, g_busObj);
                thisObj.m_selectObj.f_init();
                return thisObj.m_selectObj.f_getConfigurationPage();
                
            case VYA.FT_CONST.DOM_3_NAV_SUB_USER_DIR_ID:
                var mpCb = function(){
                }
                thisObj.m_selectObj = new FT_confLDAPserver('LDAP Server', mpCb, g_busObj);
                thisObj.m_selectObj.f_init();
                return thisObj.m_selectObj.f_getConfigurationPage();
                
            case VYA.FT_CONST.DOM_3_NAV_SUB_BLB_ID:
                var mpCb = function(){
                }
                thisObj.m_selectObj = new FT_confBLB('BLB Association', mpCb, g_busObj);
                thisObj.m_selectObj.f_init();
                return thisObj.m_selectObj.f_getConfigurationPage();
                
            case VYA.FT_CONST.DOM_3_NAV_SUB_PASSWORD_ID:
                var mpCb = function(){
                }
                thisObj.m_selectObj = new FT_confPassword('Password Policy', mpCb, g_busObj);
                thisObj.m_selectObj.f_init();
                return thisObj.m_selectObj.f_getConfigurationPage();
                
            case VYA.FT_CONST.DOM_3_NAV_SUB_MYPROFILE_ID:
                var mpCb = function(){
                }
                thisObj.m_selectObj = new FT_confMyProfile('My Profile', mpCb, g_busObj);
                thisObj.m_selectObj.f_init();
                return thisObj.m_selectObj.f_getConfigurationPage();
                
            case VYA.FT_CONST.DOM_3_NAV_SUB_USER_ADD_ID:
                var mpCb = function(){
                }
                thisObj.m_selectObj = new FT_confUserAdd('Add user', mpCb, g_busObj);
                thisObj.m_selectObj.f_init();
                return thisObj.m_selectObj.f_getConfigurationPage();
                
            case VYA.FT_CONST.DOM_3_NAV_SUB_USER_UPDATE_ID:
                var mpCb = function(){
                }
                thisObj.m_selectObj = new FT_confUserUpdate('Update user', mpCb, g_busObj);
                thisObj.m_selectObj.f_init();
                return thisObj.m_selectObj.f_getConfigurationPage();
        }
        return thisObj.f_createEmptyComponent();
    }
    
    this.f_createEmptyComponent = function()
    {
        thisObj.m_selectObj = undefined;
        var div = document.createElement('div');
        div.style.display = 'block';
        div.style.background = '#FFCC99';
        div.style.color = '#000000';
        div.style.fontFamily = 'Arial, san serif';
        div.style.fontSize = '20px';
        div.style.width = "100%";
        div.style.height = "400";
        var text = document.createElement('h1');
        text.innerHTML = 'Not Implemented';
        div.appendChild(text);
        return div;
    }
    
    this.f_load = function(component)
    {
        if (thisObj.m_selectObj != undefined) {
            thisObj.m_configTempHolder.removeChild(component);
        }
        thisObj.m_container.appendChild(component);
    }
    
    this.f_render = function(component)
    {
        if (thisObj.m_activeCmp != undefined) {
            thisObj.m_container.removeChild(thisObj.m_activeCmp);
        }
        thisObj.m_selectCmp = component;
        thisObj.f_load(thisObj.m_selectCmp);
        thisObj.m_activeCmp = component;
        thisObj.m_activeObj = thisObj.m_selectObj;
        
    }
    
}
