/*
 Document   : ft_primaryNavigation.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: The primary navigation bar in the main frame
 */
function FT_primaryNavigation()
{
    /////////////////////////////////////
    // properties
    var thisObj = this;
    this.m_parent = undefined; /* reference to mainframe */
    this.m_vmList = undefined;
    this.m_selectedVm = undefined;
    this.m_lastVm = undefined;
    
    ///////////////////////////////////////
    // functions
    /**
     * A initialization method
     */
    this.f_init = function(p, vmList)
    {
    
        thisObj.m_vmList = vmList;
        thisObj.m_parent = p;
        
        if (thisObj.m_vmList != undefined) {
            for (i = 0; i < thisObj.m_vmList.length; i++) {
                if (i == (thisObj.m_vmList.length - 1)) {
                    thisObj.m_lastVm = thisObj.m_vmList[i].m_name;
                }
                thisObj.f_addVm(thisObj.m_vmList[i].m_name, thisObj.m_vmList[i].m_displayName, 
				    thisObj.f_buildUrlPath(thisObj.m_vmList[i]));
				if (thisObj.m_vmList[i].m_name == 'utm') {
					this.f_addNetConf(thisObj.m_vmList[i]);
				}
            }
        }
        thisObj.f_selectVm(VYA.FT_CONST.OA_ID);
    }
	
	this.f_addNetConf = function(vm)
	{ 
		var vmName = 'netconf';
		var vmDispName = g_lang.m_networkConfig;
		var vmRec = new FT_vmRecObj(vmName, vmDispName);
		vmRec.m_guiUri = vm.m_guiUri;
		thisObj.m_vmList.push(vmRec);
	}
    
    this.f_buildUrlPath = function(vm)
    {
        //return (window.location.protocol + '//' + vm.m_ip + ':' + vm.m_guiPort  + vm.m_guiUri);
		/*
		if (vm.m_name == 'utm') {
			return 'UTM/utm_main_en.html';
		}
		*/
		var lang = g_utils.f_getLanguage();
		if (lang == g_consObj.V_NOT_FOUND) {
			lang = g_consObj.V_LANG_EN;
		}
		if (g_devConfig.m_debug) {
			if (vm.m_name == 'utm') {
				return vm.m_guiUri + g_devConfig.m_utmPathSuffix;
			} else if (vm.m_name == 'netconf') {
				return vm.m_guiUri + g_devConfig.m_utmPathSuffix + 'utm_netconf_' + lang + '.html';
			}
		} else {
			if (vm.m_name == 'netconf') {
				return vm.m_guiUri + 'utm_netconf_' + lang + '.html';
			}
		}
		
		return vm.m_guiUri;
    }
    
    this.f_getUrlPath = function(vmId, vmURL)
    {
        if (vmId == VYA.FT_CONST.OA_ID) {
            return '#';
        } else {
            return vmURL;
        }
    }
    
    /*
     * Add this VM to the primary navigation bar
     */
    this.f_addVm = function(vmId, vmDisplay, vmURL)
    {
        //alert('addVm: vmId: ' + vmId + ' vmDisplay: ' + vmDisplay + ' vmURL: ' + vmURL);
        var p = document.getElementById(VYA.FT_CONST.DOM_MAIN_FRM_NAV_BAR_ID);
        var newVM = document.createElement('th');
        newVM.setAttribute('id', vmId);
        newVM.setAttribute("class", 'VYA.FT_CONST.DOM_MAIN_FRM_NAV_BAR_CLS');
        newVM.setAttribute("urlPath", thisObj.f_getUrlPath(vmId, vmURL));
        newVM.appendChild(document.createTextNode(vmDisplay));
        newVM.style.width = VYA.DYN_STYLE.PRI_NAV_ITEM_WIDTH;
        newVM.style.height = '40px';
        newVM.style.border = VYA.DYN_STYLE.PRI_NAV_ITEM_BORDER;
        newVM.style.fontWeight = VYA.DYN_STYLE.PRI_NAV_ITEM_FONT_WEIGHT;
        newVM.style.textAlign = VYA.DYN_STYLE.PRI_NAV_ITEM_TEXT_ALIGN;
        newVM.style.backgroundImage = VYA.DYN_STYLE.PRI_NAV_ITEM_BG_IMG;
        p.appendChild(newVM);
        g_xbObj.f_xbAttachEventListener(newVM, 'click', thisObj.f_handleClick, true);
        g_xbObj.f_xbAttachEventListener(newVM, 'mouseover', thisObj.f_handleMouseover, true);
        g_xbObj.f_xbAttachEventListener(newVM, 'mouseout', thisObj.f_handleMouseout, true);
    }
    
    /*
     * Return the current selected VM
     */
    this.f_getSelectedVm = function()
    {
        return thisObj.m_selectedVm;
    }
    
    /*
     * Set the selection to this VM
     */
    this.f_selectVm = function(vmId, urlPath)
    {
        //alert('select vm: ' + vmId + ' url: ' + urlPath);
        thisObj.m_selectedVm = vmId;
        thisObj.f_highlightSelectedVm(thisObj.m_selectedVm);
        thisObj.m_parent.f_showVm(thisObj.m_selectedVm, urlPath);
    }
    
    /*
     * Highlight the currently selected VM in the primary navigation bar
     */
    this.f_highlightSelectedVm = function(vmId)
    {
        var bar = document.getElementById(VYA.FT_CONST.DOM_MAIN_FRM_NAV_BAR_ID);
        for (var i = 0; bar.childNodes[i]; i++) {
            id = f_elemGetAttribute(bar.childNodes[i], 'id');
            if ((id != undefined) && (id != null)) {
                if (vmId != id) {
                    bar.childNodes[i].style.color = VYA.DYN_STYLE.PRI_NAV_NOT_ACT_ITEM_COLOR;
                    bar.childNodes[i].style.borderBottom = VYA.DYN_STYLE.PRI_NAV_NOT_ACT_ITEM_BORDER_BOTTOM;
                    bar.childNodes[i].style.borderTop = VYA.DYN_STYLE.PRI_NAV_NOT_ACT_ITEM_BORDER_TOP;
                    bar.childNodes[i].style.borderLeft = VYA.DYN_STYLE.PRI_NAV_NOT_ACT_ITEM_BORDER_LEFT;
                    bar.childNodes[i].style.backgroundImage = VYA.DYN_STYLE.PRI_NAV_NOT_ACT_ITEM_BG_IMG;
                } else {
                    bar.childNodes[i].style.color = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_COLOR;
                    bar.childNodes[i].style.borderBottom = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BORDER_BOTTOM;
                    bar.childNodes[i].style.borderTop = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BORDER_TOP;
                    bar.childNodes[i].style.borderLeft = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BORDER_LEFT;
                    bar.childNodes[i].style.backgroundImage = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BG_IMG;
                    bar.childNodes[i].style.background = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BG;
                }
                if (id == thisObj.m_lastVm) {
                    //draw a right border for the last VM.
                    bar.childNodes[i].style.borderRight = VYA.DYN_STYLE.PRI_NAV_LAST_ITEM_BORDER_RIGHT;
                }
            }
        }
    }
    
    /*
     * Mouseover handler for the primary navigation bar items.
     */
    this.f_handleMouseover = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        target.style.color = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_COLOR;
        target.style.backgroundImage = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BG_IMG;
        target.style.background = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BG;
        target.style.borderBottom = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BORDER_BOTTOM;
        target.style.borderTop = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BORDER_TOP;
        target.style.borderLeft = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BORDER_LEFT;
    }
    
    /*
     * Mouseout handler for the primary navigation bar items.
     */
    this.f_handleMouseout = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        var vmId = target.getAttribute('id');
		//console.log('f_handleMouseout: vmId:' + vmId + ' id: ' + id + ' thisObj.m_selectedVm: ' + thisObj.m_selectedVm +  ' lastVm: ' + thisObj.m_lastVm);
        if (vmId != thisObj.m_selectedVm) {
            target.style.color = VYA.DYN_STYLE.PRI_NAV_NOT_ACT_ITEM_COLOR;
            target.style.borderBottom = VYA.DYN_STYLE.PRI_NAV_NOT_ACT_ITEM_BORDER_BOTTOM;
            target.style.borderTop = VYA.DYN_STYLE.PRI_NAV_NOT_ACT_ITEM_BORDER_TOP;
            target.style.borderLeft = VYA.DYN_STYLE.PRI_NAV_NOT_ACT_ITEM_BORDER_LEFT;
            target.style.backgroundImage = VYA.DYN_STYLE.PRI_NAV_NOT_ACT_ITEM_BG_IMG;
        } else {
            target.style.color = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_COLOR;
            target.style.borderBottom = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BORDER_BOTTOM;
            target.style.background = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BG;
            target.style.borderTop = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BORDER_TOP;
            target.style.borderLeft = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BORDER_LEFT;
            target.style.backgroundImage = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BG_IMG;
        }
        if (vmId == thisObj.m_lastVm) {
            //draw a right border for the last VM.
            target.style.borderRight = VYA.DYN_STYLE.PRI_NAV_LAST_ITEM_BORDER_RIGHT;
        }
    }
    
    /*
     * Mouseclick handler for the primary navigation bar item
     */
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            //Get the id of the tab being clicked.
            //var vmId = target.innerHTML.trim();
			var vmId = target.getAttribute('id');
            if (vmId == thisObj.m_selectedVm) {
                return false;
            }
            var urlPath = target.getAttribute('urlPath');
            thisObj.f_selectVm(vmId, urlPath);
        }
    }
}
