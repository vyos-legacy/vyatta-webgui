/*
 Document   : ft_siteMap.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: The main screen of the open appliance web application
 */
function FT_siteMap()
{
	/////////////////////////////////////
	// properties
	var thisObj = this;
	this.m_vmList = undefined;
	this.m_div = undefined;
	
	///////////////////////////////////////
	// functions
	/**
	 * A initialization method
	 */
	this.f_init = function(vmList)
	{
		thisObj.m_vmList = vmList;
		thisObj.m_div = thisObj.f_createDiv();		
		thisObj.f_checkRole();
		thisObj.f_addVmLink();
		var div = document.getElementById('sitemap_div');		
		div.parentNode.removeChild(div);	
		div.style.display = 'block';	
		thisObj.m_div.appendChild(div);
	}
	
	this.f_createDiv = function()
	{
        var div = document.createElement('div');
        div.setAttribute('id', 'ft_popup_div');
		div.style.width = '560px';		      
		div.style.backgroundColor = 'white';	
        div.style.display = 'block';		
        div.style.overflow = 'visible';
        div.style.font = 'normal 10pt arial';
        div.style.borderTop = '2px solid #CCC';
        div.style.borderLeft = '2px solid #CCC';
        div.style.borderBottom = '2px solid #000';
        div.style.borderRight = '2px solid #000';	
        div.style.padding = '15px';	
		div.style.margin = '20px auto';
		
		return div;
	}
	
	this.f_addVmLink = function()
	{
		var ul = document.getElementById('sitemap_vmlink_ul');
		var oa = document.getElementById('sitemap_vmlink_oa');
		ul.removeChild(oa);
		for (var i=0; i < thisObj.m_vmList.length; i++) {
			var vm = thisObj.m_vmList[i];
			if (vm.m_name == VYA.FT_CONST.OA_ID) {
				continue;
			}
			var li = document.createElement('li');
			g_xbObj.f_xbSetClassAttribute(li,'sitemap_vmlink');
			li.innerHTML = '<a href="#" onclick="f_siteMapClickHandler(\'sitemap_vmlink_' +
			    vm.m_name + '\')"><img border="0" src="' + g_lang.m_imageDir +'puce_link.gif">&nbsp;<span class="bold12">' +
				vm.m_displayName + '</span></a>';
			ul.appendChild(li);
		}
		ul.appendChild(oa);
	}
	
	this.f_checkRole = function()
	{
		if (g_roleManagerObj.f_isAdmin()) {
			thisObj.f_hideConfig();
		} else if (g_roleManagerObj.f_isUser()) {
			thisObj.f_showOnlyMyProfile();
			thisObj.m_div.style.width = '300px';
		}
	}
	
	this.f_hideConfig = function()
	{
		var oa = document.getElementById('sitemap_vmlink_oa');
	    var config = document.getElementById('sitemap_sm_config');
		oa.removeChild(config);	
	}
	
	this.f_showOnlyMyProfile = function()
	{
		var oa = document.getElementById('sitemap_vmlink_oa');
		var ids = new Array('sitemap_sm_applications', 'sitemap_sm_users',
		                    'sitemap_sm_monitoring', 'sitemap_sm_backup', 'sitemap_sm_config');
        for (var i=0; i < ids.length; i++) {
			var e = document.getElementById(ids[i]);
			oa.removeChild(e);
		}							
	}
	
	this.f_show = function()
	{
		var el = document.getElementById('ft_modal_popup_message');
		el.style.visibility = "visible";			
		el.appendChild(thisObj.m_div);
	}
	
	this.f_hide = function()
	{
		var el = document.getElementById('ft_modal_popup_message');
		el.style.visibility = "hidden";			
        el.removeChild(thisObj.m_div);		
	}
	
	
	
	this.f_handleClick = function(id, subId)
	{
		thisObj.f_hide();
		var index = id.indexOf('sitemap_vmlink_');
		if (index != -1) {
			id = id.substring(15,id.length);
			var path = g_mainFrameObj.f_getUrlPath(id);
			g_mainFrameObj.f_selectVm(id, path);
		} else if (id == 'closeButton') {
		    return;
		} else { //OA panel clicked, and a sub link is selected.
			g_mainFrameObj.f_selectVm(VYA.FT_CONST.OA_ID, '#');
			g_mainFrameObj.f_selectPage(id, subId);
		} 
	}
}

function f_siteMapClickHandler(id, subId)
{
	g_mainFrameObj.m_siteMap.f_handleClick(id, subId);
}

function f_siteMapClick()
{
	if(!g_busObj.f_isLogin()) {
		return;
	}
	g_mainFrameObj.m_siteMap.f_show();
}
