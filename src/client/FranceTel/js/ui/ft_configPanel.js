/*
 Document   : ft_configPanel.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: The configuration panel on the right side of the main panel
 */
function FT_configPanel(){
    /////////////////////////////////////
    // properties
    var thisObj = this;
    this.m_parent = undefined;
    this.m_selectedItem = undefined;
    this.m_container = undefined;
    this.m_parent_container = undefined;
    this.m_currentDesc = undefined;
    this.m_title = undefined;
    this.m_activeCmp = undefined;
    
    ///////////////////////////////////////
    // functions
    /**
     * A initialization method
     */
    this.f_init = function(p){
        thisObj.m_parent = p;
        thisObj.m_parent_container = document.getElementById(VYA.FT_CONST.DOM_MAIN_PANEL_OA_CONTAINER_ID);
        
        var queryId = VYA.FT_CONST.DOM_3_CONFIG_PANEL_ID;
        //Obtain a reference to the div tag in the html.
        thisObj.m_container = document.getElementById(queryId);
        thisObj.m_title = document.getElementById(VYA.FT_CONST.DOM_3_CONFIG_PANEL_TITLE_ID);
        thisObj.m_container.parentNode.removeChild(thisObj.m_container);
    }
    
    this.f_show = function(id, desc){
        thisObj.m_currentDesc = desc;
        thisObj.m_title.innerHTML = thisObj.m_currentDesc;
        thisObj.m_selectedItem = id;
        thisObj.m_container.style.display = 'block';
        thisObj.m_parent_container.appendChild(thisObj.m_container);
        //		thisObj.f_render(thisObj.f_createEmptyComponent());
        var cmp = thisObj.f_getComponent(id);
        if (cmp == null) {
            cmp = thisObj.f_createEmptyComponent();
        }
        thisObj.f_render(cmp);
    }
    
    this.f_getComponent = function(id){
        switch (id) {
            case VYA.FT_CONST.DOM_3_NAV_SUB_DASHBOARD_ID:
                var dbcb = function(){
                
                }
                //var db = new FT_confDashboard('db', dbcb, g_busObj);
                var db = new FT_confHwMonitor('db', dbcb, g_busObj);
                return db.f_getConfigurationPage();
            case VYA.FT_CONST.DOM_3_NAV_SUB_UPDATE_ID:
                var dbcb = function(){
                
                }
                var db = new FT_confDashboard('db', dbcb, g_busObj);
                return db.f_getConfigurationPage();
            case VYA.FT_CONST.DOM_3_NAV_SUB_RESTART_ID:
                var dbcb = function(){

                }
                var db = new FT_confRestart('db', dbcb, g_busObj);
                return db.f_getConfigurationPage();
            case VYA.FT_CONST.DOM_3_NAV_SUB_SUBCRIBE_ID:
            case VYA.FT_CONST.DOM_3_NAV_SUB_USER_ID:
            case VYA.FT_CONST.DOM_3_NAV_SUB_USER_RIGHT_ID:
            case VYA.FT_CONST.DOM_3_NAV_SUB_HARDWARE_ID:
                var dbcb = function(){

                }
                var db = new FT_confHwMonitor('db', dbcb, g_busObj);
                return db.f_getConfigurationPage();
            case VYA.FT_CONST.DOM_3_NAV_SUB_NETWORK_ID:
            case VYA.FT_CONST.DOM_3_NAV_SUB_BACKUP_ID:
            case VYA.FT_CONST.DOM_3_NAV_SUB_RESTORE_ID:
            case VYA.FT_CONST.DOM_3_NAV_SUB_EMAIL_SRV_ID:
            case VYA.FT_CONST.DOM_3_NAV_SUB_TIME_SRV_ID:
            case VYA.FT_CONST.DOM_3_NAV_SUB_USER_DIR_ID:
            case VYA.FT_CONST.DOM_3_NAV_SUB_BLB_ID:
            case VYA.FT_CONST.DOM_3_NAV_SUB_3_PARTY_ID:
            case VYA.FT_CONST.DOM_3_NAV_SUB_PASSWORD_ID:
            case VYA.FT_CONST.DOM_3_NAV_SUB_MYPROFILE_ID:
                return thisObj.f_createEmptyComponent();
        }
        return thisObj.f_createEmptyComponent();
    }
    
    this.f_createEmptyComponent = function(){
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
    
    this.f_render = function(component){
        if (thisObj.m_activeCmp != undefined) {
            thisObj.m_container.removeChild(thisObj.m_activeCmp);
        }
        thisObj.m_activeCmp = component;
        thisObj.m_container.appendChild(thisObj.m_activeCmp);
    }
    
}
