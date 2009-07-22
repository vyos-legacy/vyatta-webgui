/**
 * @author loi
 */
/*
 Document   : utm_confContainerObj.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description: Container base class
 */
function UTM_confContainerObj(name, callback, busLayer)
{
	var thisObjName = 'FT_confContainerObj';
	this.m_config = undefined;
	this.m_id = undefined;
	this.m_div = undefined;
	this.m_busLayer = undefined;
	this.m_name = undefined;
	this.m_containerCb = undefined;
	this.m_children = undefined;
	this.m_loadVmDataQueue = new Array();	
	var thisObj = this;
	
	
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
		this.m_busLayer = busLayer;
		this.m_name = name;
		this.m_containerCb = callback;
	}
	this.privateConstructor(name, callback, busLayer);
	
	this.f_distructor = function()
	{
	    for (var i=0; i < this.m_children.length; i++) {
			this.m_children[i].f_distructor();
		}
	}

    this.f_setId = function(id) {
		this.m_id = id;
	}
		
	/**
	 * Accept an array of children.  Each child should comply with utm_confContainerChild interface.
	 * The utm_confContainerChild interface dictates the following APIs:
	 *    a. f_getContentPane(): return the div that hold the internal layout.
	 *    b. f_loadVMData(): implement the loading VM Data
	 *    c. f_stopLoadVMData(): stop the loading of VM data.
	 *    d. f_attachEventListener(): attach any extra event listener
	 *    e. f_detachEventListener(): detach any extra event listener
	 *    f. f_resize() --> this API for now has NO-OP implementation at the parent level.
	 *    g. f_reflow() --> this API for now has NO-OP implementation at the parent level.
	 * @param {Object} children
	 */
	this.f_setChildren = function(children)
	{
		this.m_children = children;
	}
	
	/*
	 * Abstract function to be override by sub class.
	 * The sub class should implement the following:
	 *    a. Initialize the children array.
	 *    b. Calling f_setChildren.
	 *    c. Calling f_getPage.
	 */
	this.f_getConfigurationPage = function() { }
	
	this.f_createEmptyDiv = function() 
	{
        var div = document.createElement('div');
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.overflow = 'visible';		
        div.style.paddingBottom = '5px';
        div.innerHTML = '<br/>';
        return div;		
	}
	
	this.f_getPage = function() 
	{
        var div = document.createElement('div');
        div.setAttribute('id', 'utm_confpanel_');
        div.setAttribute('align', 'left');
    
        /////////////////////////////////////////
        // set inner styling of the div tag
        div.style.pixelLeft = 0;
		div.style.paddingLeft = 30;		
        div.style.backgroundColor = 'white';
        div.style.display = 'block';
        div.style.height = 'auto';
				
        for (var i = 0; i < this.m_children.length; i++) {
			div.appendChild(this.m_children[i].f_getContentPane());
			if (i < this.m_children.length - 1) {
				div.appendChild(this.f_createEmptyDiv());
			}
		}
         		
        document.getElementById('ft_container').appendChild(div);
		document.getElementById('ft_container').style.height = 'auto';
        this.m_div = div;
		
		for (var i = 0; i < this.m_children.length; i++) {
			this.m_children[i].f_attachEventListener();
		}
		for (var i = 0; i < this.m_children.length; i++) {
			this.m_loadVmDataQueue.push(this.m_children[i]);
			//this.m_children[i].f_loadVMData(div);
		}
				
		this.f_loadVMDataCb();
				
        return this.m_div;			
	}
	
	this.f_loadVMDataCb = function()
	{
		if (this.m_loadVmDataQueue.length > 0) {
			var child = this.m_loadVmDataQueue.shift();
			child.f_loadVMData(this.m_div, this);
		}
		
	}
	
	this.f_stopLoadVMData = function() 
	{
		this.m_loadVmDataQueue.splice(0);
		for (var i=0; i < this.m_children.length; i++) {
			this.m_children[i].f_stopLoadVMData();
		}
	}
	 
	this.f_handleClick = function(childId, sourceId, userData) {}
	this.f_handleKeyEvent = function(childId, sourceId, eventType, userData) {}
	this.f_handleColumnSorting = function(childId, column) {}
}