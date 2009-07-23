/**
 * @author loi
 */
/*
 Document   : utm_confNwLAN.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description: LAN interface configuration
 */
function UTM_confNwLAN(name, callback, busLayer)
{
	var thisObjName = 'UTM_confNwLAN';
	var thisObj = this;
	this.m_lanItf = undefined;
	this.m_lanDhcp = undefined;
	this.m_lanIp = undefined;
	this.m_ifName = undefined;
		
	/**
	 * @param name - name of configuration screens.
	 * @param callback - a container callback
	 * @param busLayer - business object
	 */
	this.constructor = function(name, callback, busLayer)
	{
		this.privateConstructor(name, callback, busLayer);
	}
	
	this.privateConstructor = function(name, callback, busLayer)
	{
		UTM_confNwLAN.superclass.constructor(name, callback, busLayer);
	}
	this.privateConstructor(name, callback, busLayer);
	
	this.f_setIfName = function(ifName)
	{
		this.m_ifName = ifName;
	}
	
	this.f_getConfigurationPage = function() 
	{
		var c = new Array();		
		this.m_lanItf = new UTM_confNwLANitf('UTM_confNwLANitf', thisObj.m_containerCb, thisObj.m_busLayer);	
		this.m_lanItf.f_setIfName(this.m_ifName);	
		this.m_lanItf.f_setParent(thisObj);
		c.push(this.m_lanItf);
		
		if ((thisObj.m_ifName == 'LAN') || (thisObj.m_ifName == 'LAN2')) {
			this.m_lanDhcp = new UTM_confNwLANdhcp('UTM_confNwLANdhcp', thisObj.m_containerCb, thisObj.m_busLayer);
			this.m_lanDhcp.f_setIfName(this.m_ifName);
			this.m_lanDhcp.f_setParent(thisObj);
			this.m_lanIp = new UTM_confNwLANip('UTM_confNwLANip', thisObj.m_containerCb, thisObj.m_busLayer);
			this.m_lanIp.f_setIfName(this.m_ifName);
			this.m_lanIp.f_setParent(thisObj);
			c.push(this.m_lanDhcp);
			c.push(this.m_lanIp);
		}
		
		thisObj.f_setChildren(c);
		
		return thisObj.f_getPage();
	}
	
	this.f_reloadChildren = function(children)
	{
		if ((children == undefined) || (children == null)) {
			return;
		}
		
		for (var i = 0; i < this.m_children.length; i++) {
			for (var j = 0; j < children.length; j++) {
				if ((children[j].indexOf(this.m_children[i].m_objectId)) >= 0) {
					this.m_loadVmDataQueue.push(this.m_children[i]);
					break;
				}
			}
		}	
		this.m_reload = true;			
		this.f_loadVMDataCb();
	}
		
	this.f_isLanIPconfigured = function()
	{
		var lanIp = this.f_getLanIp().trim();
		var lanMask = this.f_getLanNetmask() + ' ';
		return ( (lanIp.length > 0) && (lanMask.trim().length > 0) );		
	}	
	
	this.f_validateLanCompatible = function()
	{
		var error = '';
		if ((this.m_lanDhcp != undefined) && (this.m_lanDhcp != null)) {
			error += this.m_lanDhcp.f_validateLanCompatible();
		}
		if ((this.m_lanIp != undefined) && (this.m_lanIp != null)) {
			error += this.m_lanIp.f_validateLanCompatible();
		}
		return error;
	}
	
	this.f_alertUser = function() 
	{
		if ((this.m_lanDhcp != undefined) && (this.m_lanDhcp != null) &&
		(this.m_lanIp != undefined) &&
		(this.m_lanIp != null)) {
			if ((this.m_lanDhcp.f_alertCheckRequired()) && (this.m_lanIp.f_alertCheckRequired())) {
				return true;
			}
		}
		return false;
	}	
	
	this.f_getLanIp = function()
	{
	    return thisObj.m_lanItf.f_getLanIp();	
	}

    this.f_getLanNetmask = function()
	{
		var mask =  thisObj.m_lanItf.f_getLanNetmask() + ' ';
		return mask.trim();
	}
	
	this.f_handleClick = function(childId, sourceId, userData)
	{
		if (childId == 'conf_lan_ip') {
			thisObj.m_lanIp.f_handleClick(sourceId, userData);
		} else if (childId == 'conf_lan_itf') {
			thisObj.m_lanItf.f_handleClickById(sourceId, userData);
		}
	}    

	this.f_handleKeyEvent = function(childId, sourceId, eventType, userData) 
	{
		if (childId == 'conf_lan_ip') {
			thisObj.m_lanIp.f_handleKeyEvent(sourceId, eventType, userData);
		}
	}
	
	this.f_handleColumnSorting = function(childId, column) 
	{
		if (childId == 'conf_lan_ip') {
			thisObj.m_lanIp.f_handleColumnSorting(column);
		}		
	}	
}
UTM_extend(UTM_confNwLAN, UTM_confContainerObj);
	