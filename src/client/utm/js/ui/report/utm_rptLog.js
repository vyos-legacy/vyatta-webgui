/**
 * @author loi
 */
/*
 Document   : utm_rptLog.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description: log base class
 */
function UTM_rptLog(name, busLayer)
{
    var thisObjName = 'UTM_rptLog';
    this.m_id = undefined;
    this.m_div = undefined;
    this.m_busLayer = undefined;
    this.m_name = undefined;
    this.m_top = undefined;
	this.m_nodeList = undefined;
    this.m_children = new Array();
    var thisObj = this;
    
    
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, busLayer)
    {
        this.privateConstructor(name, busLayer);
    }
    
    this.privateConstructor = function(name, busLayer)
    {
        this.m_busLayer = busLayer;
        this.m_name = name;
    }
    this.privateConstructor(name, busLayer);
    
    this.f_distructor = function()
    {
        for (var i = 0; i < this.m_children.length; i++) {
            this.m_children[i].f_distructor();
        }
    }
    
    this.f_setId = function(id) 
	{
		this.m_id = id;
	}	
	
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
        
	this.f_getConfigurationPage = function()
	{
		this.f_init();
		return this.f_getPage();		
	}
	
    this.f_getPage = function()
    {
        var div = document.createElement('div');
        div.setAttribute('align', 'left');
        /////////////////////////////////////////
        // set inner styling of the div tag
        div.style.pixelLeft = 0;
        div.style.paddingLeft = '0px';
        div.style.backgroundColor = 'white';
        div.style.display = 'block';
        div.style.height = 'auto';
        		
        for (var i = 0; i < this.m_children.length; i++) {
			div.appendChild(this.m_children[i].f_getPage());
			if (i < this.m_children.length - 1) {
				div.appendChild(this.f_createEmptyDiv());
			}
		}		

        document.getElementById('ft_container').appendChild(div);
		document.getElementById('ft_container').style.height = 'auto';
        this.m_div = div;
             
		this.f_attachEventListener();	 
			    
        return this.m_div;
    }
    
    this.f_attachEventListener = function()
    {
		for (var i=0; i < this.m_children.length; i++) {
			if (this.m_children[i].f_attachEventListener != undefined) {
				this.m_children[i].f_attachEventListener();
			}
		}
    }
    
    this.f_detachEventListener = function()
    {
		for (var i=0; i < this.m_children.length; i++) {
			if (this.m_children[i].f_attachEventListener != undefined) {
				this.m_children[i].f_detachEventListener();
			}
		}
    }

    this.f_changed = function()
    {
        return false;
    }
	
	//Abstract function.  To be overriden by sub classes.
	this.f_loadVMData = function() {}	
	this.f_stopLoadVMData = function() {}
    this.f_init = function() { }	//this function initializes the children array, and any other parameters.
}

function UTM_rptListPanel(listId, listName, hrefs)
{
	this.m_ids = undefined;	
	this.m_name = undefined;
	this.m_hrefs = undefined;
	this.m_div = undefined;
	this.m_title = undefined;
    var thisObj = this;
	
    this.constructor = function(listId, listName, hrefs)
    {
        this.privateConstructor(listId, listName, hrefs);
    }
    
    this.privateConstructor = function(listId, listName, hrefs)
    {
        this.m_ids = listId;
        this.m_name = listName;
		this.m_hrefs = hrefs;
    }
    this.privateConstructor(listId, listName, hrefs);
    
	this.f_distructor = function() {}
	
	this.f_setTitle = function(title) 
	{
		this.m_title = title;
	}
	
	this.f_getPage = function()
	{
        var div = document.createElement('div');
        div.setAttribute('align', 'left');
        /////////////////////////////////////////
        // set inner styling of the div tag
        div.style.pixelLeft = 0;
        div.style.paddingLeft = '30px';
        div.style.backgroundColor = 'white';
        div.style.display = 'block';
        div.style.height = 'auto';

        var html = '<ul>';
		var spanStyle = 'margin-left: -10px;';
		
	    if (g_xbObj.m_isIE || g_xbObj.m_isOpera) {
			div.style.paddingLeft = '20px';
			spanStyle = 'margin-left: 0px;';
		} 		
		if (this.m_title != undefined) {
			html = '<span style="' + spanStyle + '">' + this.m_title + '<br/><br/></span>' + html; 
		}
		for (var i=0; i < this.m_ids.length; i++) {
			html += this.f_createListItem(this.m_ids[i], this.m_name[i], this.m_hrefs[i]);
		}        
		div.innerHTML = html;

        this.m_div = div;
        
        return this.m_div;		
	}
	
    this.f_getTop = function()
	{
		return this.m_hrefs[0];
	}
	
    this.f_createListItem = function(id, text, link)
    {	
	    if (g_xbObj.m_isIE || g_xbObj.m_isOpera) {
			return ('<li id="' + id + '" class="tree-icon"><a style="text-decoration:underline;color:black;outline-style:none;font-weight:bold;" href="' +
			link +
			'"><img border="0" style="padding-right:5px;" src="images/puce_squar.gif">' +
			text +
			'</a></li>');
		} else {
			return ('<li id="' + id + '" style="list-style-type:square;list-style-image: url(' + g_utils.f_getRootDir() + 'images/puce_squar.gif);">' +
			'<a style="text-decoration:underline;color:black;outline-style:none;font-weight:bold;" href="' +
			link +
			'">' +
			text +
			'</a>' +
			'</li>');
		}

    }		
}
