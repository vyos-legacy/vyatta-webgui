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
        var selectionVmId = thisObj.f_getVmSelectionPath();
		var selectionVmPath = null;
		        
        if (thisObj.m_vmList != undefined) {
            for (i = 0; i < thisObj.m_vmList.length; i++) {
                if (i == (thisObj.m_vmList.length - 1)) {
                    thisObj.m_lastVm = thisObj.m_vmList[i].m_name;
                }
				if (selectionVmId == thisObj.m_vmList[i].m_name) {
					selectionVmPath = thisObj.m_vmList[i].m_guiUri;
				}
                thisObj.f_addVm(thisObj.m_vmList[i].m_name, thisObj.m_vmList[i].m_displayName, 
				    thisObj.m_vmList[i].m_guiUri);
            }
        }
		thisObj.f_selectVm(selectionVmId, selectionVmPath);
		thisObj.m_parent.f_selectDefaultPage(thisObj.m_selectedVm);
	
    }
    
    this.f_getVmSelectionPath = function() {	
	    var id = g_cookie.f_get(g_consObj.V_COOKIES_VM_PATH, g_consObj.V_NOT_FOUND);
		if (id==g_consObj.V_NOT_FOUND) {
			id = VYA.FT_CONST.OA_ID;
		} /* else {
			g_cookie.f_set(g_consObj.V_COOKIES_VM_PATH, g_consObj.V_NOT_FOUND, g_cookie.m_userNameExpire);			
		} */	
		return id;		
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
	 * Remove this VM from the primary navigation bar
	 */
	this.f_removeVm = function(vmId)
	{
		var removeVm = document.getElementById(vmId);
		if (removeVm != null) {
            g_xbObj.f_xbDetachEventListener(removeVm, 'click', thisObj.f_handleClick, true);
            g_xbObj.f_xbDetachEventListener(removeVm, 'mouseover', thisObj.f_handleMouseover, true);
            g_xbObj.f_xbDetachEventListener(removeVm, 'mouseout', thisObj.f_handleMouseout, true);		
			var p = document.getElementById(VYA.FT_CONST.DOM_MAIN_FRM_NAV_BAR_ID);
			p.removeChild(removeVm);
            return true; 
		}
		return false;
	}
	
	this.f_removeBlb = function()
	{
		var removed = thisObj.f_removeVm('blb');
		if (removed) {
			for (var i =0; i < thisObj.m_vmList.length; i++) {
				if (thisObj.m_vmList[i].m_name == 'blb') {
					thisObj.m_vmList.splice(i,1);
					break;
				}
			}			
		}
	}
	
	this.f_addBlb = function()
	{
		var found = false;
		for (var i=0; i < thisObj.m_vmList.length; i++) {
			if (thisObj.m_vmList[i].m_name == 'blb') {
				found = true;
			}
		}
		if (!found) {
			var vm = new FT_vmRecObj('blb', g_lang.m_tnBLB);
			vm.m_guiUri = "/webconf/openappliance_index.html";
			thisObj.m_vmList.unshift(vm);
			thisObj.f_addBlb2VmTab(vm);
		}			
	}
	
    this.f_addBlb2VmTab = function(blb)
    {
        //alert('addVm: vmId: ' + vmId + ' vmDisplay: ' + vmDisplay + ' vmURL: ' + vmURL);
        var p = document.getElementById(VYA.FT_CONST.DOM_MAIN_FRM_NAV_BAR_ID);
        var newVM = document.createElement('th');
        newVM.setAttribute('id', blb.m_name);
        newVM.setAttribute("class", 'VYA.FT_CONST.DOM_MAIN_FRM_NAV_BAR_CLS');
        newVM.setAttribute("urlPath", blb.m_guiUri);
        newVM.appendChild(document.createTextNode(blb.m_displayName));
        newVM.style.width = VYA.DYN_STYLE.PRI_NAV_ITEM_WIDTH;
        newVM.style.height = '40px';
        newVM.style.border = VYA.DYN_STYLE.PRI_NAV_ITEM_BORDER;
        newVM.style.fontWeight = VYA.DYN_STYLE.PRI_NAV_ITEM_FONT_WEIGHT;
        newVM.style.textAlign = VYA.DYN_STYLE.PRI_NAV_ITEM_TEXT_ALIGN;
        newVM.style.backgroundImage = VYA.DYN_STYLE.PRI_NAV_ITEM_BG_IMG;
		var oaVm = document.getElementById('openapp');
		if (oaVm) {
			p.insertBefore(newVM, oaVm);
			g_xbObj.f_xbAttachEventListener(newVM, 'click', thisObj.f_handleClick, true);
			g_xbObj.f_xbAttachEventListener(newVM, 'mouseover', thisObj.f_handleMouseover, true);
			g_xbObj.f_xbAttachEventListener(newVM, 'mouseout', thisObj.f_handleMouseout, true);
		}
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
		    g_cookie.f_set(g_consObj.V_COOKIES_VM_PATH, vmId, g_cookie.m_userNameExpire);	
			thisObj.m_parent.f_saveDomUlocation(thisObj.m_selectedVm);							
            thisObj.f_selectVm(vmId, urlPath);
			thisObj.m_parent.f_selectDefaultPage(thisObj.m_selectedVm);
        }
    }
}
