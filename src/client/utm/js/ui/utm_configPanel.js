/*
 Document   : utm_configPanel.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: The configuration panel on the right side of the main panel
 */
function UTM_configPanel()
{
    /////////////////////////////////////
    // properties
    var thisObj = this;
    this.m_parent = undefined;
    this.m_selectedItem = undefined;
    this.m_container = undefined; //the configuration panel
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
        thisObj.m_parent_container = document.getElementById(VYA.UTM_CONST.DOM_MAIN_PANEL_OA_CONTAINER_ID);
        //Obtain a reference to the div tag: 'ft_container' in the html.
        thisObj.m_container = document.getElementById(VYA.UTM_CONST.DOM_3_CONFIG_PANEL_ID);
        thisObj.m_title = document.getElementById(VYA.UTM_CONST.DOM_3_CONFIG_PANEL_TITLE_ID);
        thisObj.m_container.parentNode.removeChild(thisObj.m_container);
        //initialize the dynamic sub menu
        thisObj.f_initDynSubMenu();
    }

    this.f_initDynSubMenu = function()
    {
        var dynMenu = document.getElementById(VYA.UTM_CONST.DOM_DYN_SUB_MENU_ID);
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
				thisObj.m_container.removeChild(thisObj.m_activeCmp);
			} catch (e) {
				; //this is ok for now because the empty component doesn't get put to the 'ft_container' by config based object.
			}
        }		
	}
	
    this.f_getComponent = function(id, obj)
    {
		thisObj.f_removePrev();
		
        switch (id) {
            case VYA.UTM_CONST.DOM_3_NAV_SUB_DASHBOARD_ID:
            break;
            case VYA.UTM_CONST.DOM_3_NAV_SUB_ZONE_ID:
            case VYA.UTM_CONST.DOM_3_NAV_SUB_FW_ID:
            case VYA.UTM_CONST.DOM_3_NAV_SUB_EASY_IDP_ID:
            case VYA.UTM_CONST.DOM_3_NAV_SUB_EXPERT_IDP_ID:
            case VYA.UTM_CONST.DOM_3_NAV_SUB_AVS_ID:
            case VYA.UTM_CONST.DOM_3_NAV_SUB_APS_ID:
            case VYA.UTM_CONST.DOM_3_NAV_SUB_EASY_WEBF_ID:
            case VYA.UTM_CONST.DOM_3_NAV_SUB_EXPERT_WEBF_ID:
            case VYA.UTM_CONST.DOM_3_NAV_SUB_IMP2P_ID:
            case VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_OVERVIEW_ID:
                var dbcb = function(){

                }
                thisObj.m_selectObj = new UTM_confVPNOverview('VPNOverview', dbcb, g_busObj);
                return thisObj.m_selectObj.f_getConfigurationPage();
            case VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_S2S_ID:
            case VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_REMOTE_ID:
            case VYA.UTM_CONST.DOM_3_NAV_SUB_LOG_ID:
                return (new UTM_confEmptyComponent()).f_getConfigurationPage();
        }        
    }

    this.f_render = function(component)
    {
        //thisObj.f_removePrev();
        thisObj.m_selectCmp = component;
        thisObj.m_activeCmp = component;
        thisObj.m_activeObj = thisObj.m_selectObj;
    }

}

function UTM_confEmptyComponent()
{
    var thisObj = this;

    this.f_distructor = function(){ }	
	this.f_loadVMData = function() { }
	this.f_stopVMData = function() { }
	this.f_onUnload = function() { }	
	
	this.f_getConfigurationPage =  function() 
	{
        var div = document.createElement('div');
        div.style.display = 'block';
        div.style.background = '#FFCC99';
        div.style.color = '#000000';
        div.style.fontFamily = 'Arial, san serif';
        div.style.fontSize = '20px';
        div.style.width = "100%";
        div.style.height = "400";
        var text = document.createElement('h1');
        text.innerHTML = 'Under Construction';
        div.appendChild(text);
		
		document.getElementById(VYA.UTM_CONST.DOM_3_CONFIG_PANEL_ID).appendChild(div);
		
        return div;		
	}
}