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
	
	this.f_getConfigurationPage = function() 
	{
		this.m_lanItf = new UTM_confNwLANitf('UTM_confNwLANitf', thisObj.m_containerCb, thisObj.m_busLayer);
		this.m_lanDhcp = new UTM_confNwLANdhcp('UTM_confNwLANdhcp', thisObj.m_containerCb, thisObj.m_busLayer);
		this.m_lanIp = new UTM_confNwLANip('UTM_confNwLANip', thisObj.m_containerCb, thisObj.m_busLayer);
		var c = new Array();
		c.push(this.m_lanItf);
		c.push(this.m_lanDhcp);
		c.push(this.m_lanIp);
		thisObj.f_setChildren(c);
		
		return thisObj.f_getPage();
	}

	this.f_handleClick = function(childId, sourceId, userData)
	{
		if (childId == 'conf_lan_ip') {
			thisObj.m_lanIp.f_handleClick(sourceId, userData);
		}
	}    

	this.f_handleKeyEvent = function(childId, sourceId, eventType, userData) 
	{
		if (childId == 'conf_lan_ip') {
			thisObj.m_lanIp.f_handleKeyEvent(sourceId, eventType, userData);
		}
	}
}
UTM_extend(UTM_confNwLAN, UTM_confContainerObj);
	