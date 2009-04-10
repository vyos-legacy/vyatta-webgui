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
    this.m_container = undefined; //the configuration panel - the config_panel div, which contains the  title, and the ft_container
    this.m_ft_container = undefined; //the ft_container div.
    this.m_parent_container = undefined; //the OA container which includes left menu + config panel
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
        //Obtain a reference to the div tag: 'ft_container' in the html.
        thisObj.m_container = document.getElementById(VYA.FT_CONST.DOM_3_CONFIG_PANEL_ID);    //config_panel
		thisObj.m_ft_container = document.getElementById(VYA.FT_CONST.DOM_3_FT_CONTAINER_ID); //ft_container
        thisObj.m_title = document.getElementById(VYA.FT_CONST.DOM_3_CONFIG_PANEL_TITLE_ID);
        thisObj.m_container.parentNode.removeChild(thisObj.m_container);
		thisObj.m_ft_container.parentNode.removeChild(thisObj.m_ft_container);
        //initialize the dynamic sub menu
        thisObj.f_initDynSubMenu();
    }

    this.f_initDynSubMenu = function()
    {
        var dynMenu = document.getElementById(VYA.FT_CONST.DOM_DYN_SUB_MENU_ID);
        dynMenu.parentNode.removeChild(dynMenu);

		var menus = dynMenu.getElementsByTagName('UL');
        thisObj.m_dynSubMenu = new FT_lookupTable();
		for (var k = 0; k < menus.length; k++) {
			var aMenu = menus[k]; //Get to the UL portion.
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
			thisObj.m_activeObj.f_distructor();
            thisObj.m_activeObj.f_stopLoadVMData();
        }
    }

    this.f_showPage = function(id, obj)
    {
        //Lookup the id2desc in the hidden link first
        var desc = thisObj.m_dynSubMenu.f_get(id);
        if (desc == undefined) {
            //Lookup the id2desc from the regular link
            desc = thisObj.m_parent.m_3navMenu.f_getDescById(id);
        }
        if (desc != undefined) {
            thisObj.f_show(id, desc, obj);
        } else {
            alert('cannot find description for id: ' + id);
        }
    }

    this.f_show = function(id, desc, obj)
    {
//		if (id == thisObj.m_selectedItem) {
//			//if the menu item selected is the same as the currently active item, do nothing.
//			alert('select same page, do nothing');
//			return;
//		}
        thisObj.f_stopPolling();
        thisObj.f_showHeader(id, desc);

        var cmp = thisObj.f_getComponent(id, obj);
        if (cmp == null) {
            cmp = thisObj.f_createEmptyComponent();
        }
        thisObj.f_render(cmp);
    }
    this.f_removePrev = function() 
	{
        if (thisObj.m_activeCmp != undefined) {
			try {
				thisObj.m_container.removeChild(thisObj.m_ft_container);				
				thisObj.m_ft_container.removeChild(thisObj.m_activeCmp);
			} catch (e) {
				; //this is ok for now because the empty component doesn't get put to the 'ft_container' by config based object.
			}
        }		
	}
	
	this.f_addFTcontainer = function()
	{
		thisObj.m_container.appendChild(thisObj.m_ft_container);	
		thisObj.f_showFTcontainer();	
	}
	
	this.f_showFTcontainer = function()
	{
		thisObj.m_ft_container.style.display = 'block';
	}
	
	this.f_redrawFTcontainer = function()
	{
		thisObj.m_ft_container.style.display = 'none';
		thisObj.m_ft_container.style.display = 'block';
	}
	
    this.f_getComponent = function(id, obj)
    {
		thisObj.f_removePrev();
		thisObj.f_addFTcontainer();
        switch (id) {
            case VYA.FT_CONST.DOM_3_NAV_SUB_DASHBOARD_ID:
                var dbcb = function(){

                }
                thisObj.m_selectObj = new FT_confDashboard('Dashboard', dbcb, g_busObj);
	            thisObj.m_selectObj.f_setId(id);
                return thisObj.m_selectObj.f_getConfigurationPage();

            case VYA.FT_CONST.DOM_3_NAV_SUB_UPDATE_ID:
                var dbcb = function(){

                }
                thisObj.m_selectObj = new FT_confVMUpdates('Update', dbcb, g_busObj);
	            thisObj.m_selectObj.f_setId(id);				
                return thisObj.m_selectObj.f_getConfigurationPage();

            case VYA.FT_CONST.DOM_3_NAV_SUB_RESTORE_UPDATE_ID:
                var mpCb = function(){
                }
                thisObj.m_selectObj = new FT_confRestoreUpdate('Restore', mpCb, g_busObj);
	            thisObj.m_selectObj.f_setId(id);				
                thisObj.m_selectObj.f_init(obj);
                return thisObj.m_selectObj.f_getConfigurationPage();

            case VYA.FT_CONST.DOM_3_NAV_SUB_SCHED_UPDATE_ID:
                var mpCb = function(){
                }
                thisObj.m_selectObj = new FT_confSchedUpdate('Update', mpCb, g_busObj);
	            thisObj.m_selectObj.f_setId(id);				
                thisObj.m_selectObj.f_init(obj);
                return thisObj.m_selectObj.f_getConfigurationPage();

            case VYA.FT_CONST.DOM_3_NAV_SUB_RESTART_ID:
                var dbcb = function(){

                }
                thisObj.m_selectObj = new FT_confRestart('Restart', dbcb, g_busObj);
	            thisObj.m_selectObj.f_setId(id);				
                return thisObj.m_selectObj.f_getConfigurationPage();

            case VYA.FT_CONST.DOM_3_NAV_SUB_SUBCRIBE_ID:
                var mpCb = function(){
                }
                thisObj.m_selectObj = new FT_confSubscribe('Subscription', mpCb, g_busObj);
	            thisObj.m_selectObj.f_setId(id);				
                thisObj.m_selectObj.f_init();
                return thisObj.m_selectObj.f_getConfigurationPage();

            case VYA.FT_CONST.DOM_3_NAV_SUB_USER_ID:
                var dbcb = function(){

                }
                thisObj.m_selectObj = new FT_confUserList('db', dbcb, g_busObj);
	            thisObj.m_selectObj.f_setId(id);				
                return thisObj.m_selectObj.f_getConfigurationPage();
            case VYA.FT_CONST.DOM_3_NAV_SUB_USER_RIGHT_ID:
                var dbcb = function(){

                }
                thisObj.m_selectObj = new FT_confUserRight('UserRight', dbcb, g_busObj);
	            thisObj.m_selectObj.f_setId(id);				
                return thisObj.m_selectObj.f_getConfigurationPage();

            case VYA.FT_CONST.DOM_3_NAV_SUB_HARDWARE_ID:
                var hwCb = function(){
                }
                thisObj.m_selectObj = new FT_confHwMonitor('Hardware Monitor', hwCb, g_busObj);
	            thisObj.m_selectObj.f_setId(id);				
                return thisObj.m_selectObj.f_getConfigurationPage();

            case VYA.FT_CONST.DOM_3_NAV_SUB_NETWORK_ID:
			    break;
            case VYA.FT_CONST.DOM_3_NAV_SUB_BACKUP_ID:
                var dbcb = function(){

                }
                thisObj.m_selectObj = new FT_confBackup('Backup', dbcb, g_busObj);
	            thisObj.m_selectObj.f_setId(id);				
                return thisObj.m_selectObj.f_getConfigurationPage();

            case VYA.FT_CONST.DOM_3_NAV_SUB_RESTORE_ID:
                 var dbcb = function(){

                }
                thisObj.m_selectObj = new FT_confRestore('Restore', dbcb, g_busObj);
	            thisObj.m_selectObj.f_setId(id);				
                return thisObj.m_selectObj.f_getConfigurationPage();

            case VYA.FT_CONST.DOM_3_NAV_SUB_RESTORE_DESC_ID:
                var dbcb = function(){

                }
                thisObj.m_selectObj = new FT_confRestoreDesc('RestoreDesc', dbcb, g_busObj);
	            thisObj.m_selectObj.f_setId(id);				
                return thisObj.m_selectObj.f_getConfigurationPage(obj);

            case VYA.FT_CONST.DOM_3_NAV_SUB_EMAIL_SRV_ID:
                var mpCb = function(){
                }
                thisObj.m_selectObj = new FT_confEmailServer('Email Server', mpCb, g_busObj);
	            thisObj.m_selectObj.f_setId(id);				
                thisObj.m_selectObj.f_init();
                return thisObj.m_selectObj.f_getConfigurationPage();

            case VYA.FT_CONST.DOM_3_NAV_SUB_TIME_SRV_ID:
                var mpCb = function(){
                }
                thisObj.m_selectObj = new FT_confTimeServer('Time Server', mpCb, g_busObj);
	            thisObj.m_selectObj.f_setId(id);				
                thisObj.m_selectObj.f_init();
                return thisObj.m_selectObj.f_getConfigurationPage();

            case VYA.FT_CONST.DOM_3_NAV_SUB_USER_DIR_ID:
                var mpCb = function(){
                }
                thisObj.m_selectObj = new FT_confLDAPserver('LDAP Server', mpCb, g_busObj);
	            thisObj.m_selectObj.f_setId(id);				
                thisObj.m_selectObj.f_init();
                return thisObj.m_selectObj.f_getConfigurationPage();

            case VYA.FT_CONST.DOM_3_NAV_SUB_BLB_ID:
                var mpCb = function(){
                }
                thisObj.m_selectObj = new FT_confBLB('BLB Association', mpCb, g_busObj);
	            thisObj.m_selectObj.f_setId(id);				
                thisObj.m_selectObj.f_init();
                return thisObj.m_selectObj.f_getConfigurationPage();

			case VYA.FT_CONST.DOM_3_NAV_SUB_BLB_CHECK_ID:
                var mpCb = function(){
                }
                thisObj.m_selectObj = new FT_confBLBcheck('BLB credentials check', mpCb, g_busObj);
	            thisObj.m_selectObj.f_setId(id);				
                thisObj.m_selectObj.f_init();
                return thisObj.m_selectObj.f_getConfigurationPage();

            case VYA.FT_CONST.DOM_3_NAV_SUB_PASSWORD_ID:
                var mpCb = function(){
                }
                thisObj.m_selectObj = new FT_confPassword('Password Policy', mpCb, g_busObj);
	            thisObj.m_selectObj.f_setId(id);				
                thisObj.m_selectObj.f_init();
                return thisObj.m_selectObj.f_getConfigurationPage();

            case VYA.FT_CONST.DOM_3_NAV_SUB_MYPROFILE_ID:
                var mpCb = function(){
                }
                thisObj.m_selectObj = new FT_confMyProfile('My Profile', mpCb, g_busObj);
	            thisObj.m_selectObj.f_setId(id);				
                thisObj.m_selectObj.f_init();
                var cmp = thisObj.m_selectObj.f_getConfigurationPage();
				//thisObj.m_selectObj.f_redraw(cmp);
                return cmp;
            case VYA.FT_CONST.DOM_3_NAV_SUB_USER_ADD_ID:
                var mpCb = function(){
                }
                thisObj.m_selectObj = new FT_confUserAdd('Add user', mpCb, g_busObj);
	            thisObj.m_selectObj.f_setId(id);				
                thisObj.m_selectObj.f_init();
                return thisObj.m_selectObj.f_getConfigurationPage();

            case VYA.FT_CONST.DOM_3_NAV_SUB_USER_UPDATE_ID:
                var mpCb = function(){
                }
                thisObj.m_selectObj = new FT_confUserUpdate('Update user', mpCb, g_busObj);
	            thisObj.m_selectObj.f_setId(id);				
                thisObj.m_selectObj.f_init(obj);
                return thisObj.m_selectObj.f_getConfigurationPage();
        }
        return (new FT_confEmptyComponent()).f_getConfigurationPage();
    }

    this.f_render = function(component)
    {
        thisObj.m_selectCmp = component;
        thisObj.m_activeCmp = component;
        thisObj.m_activeObj = thisObj.m_selectObj;
		//thisObj.f_showFTcontainer();
    }

}
