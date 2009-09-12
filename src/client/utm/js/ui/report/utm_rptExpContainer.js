/**
 * @author loi
 */
/*
 Document   : utm_rptExpContainer.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description: Expandable container base class
 */
function UTM_rptExpContainer(name, busLayer, refresh, owner)
{
    var thisObjName = 'UTM_rptExpContainer';
    this.m_id = undefined;
    this.m_div = undefined;
    this.m_busLayer = undefined;
    this.m_name = undefined;
    this.m_top = undefined;
    this.m_refresh = undefined;
	this.m_children = new Array();
    this.m_text = undefined;
	this.m_owner = undefined;
    var thisObj = this;
    
    
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, busLayer, refresh, owner)
    {
        this.privateConstructor(name, busLayer, refresh, owner);
    }
    
    this.privateConstructor = function(name, busLayer, refresh, owner)
    {
        this.m_busLayer = busLayer;
        this.m_name = name;
		this.m_refresh = refresh;
		this.m_owner = owner;
    }
    this.privateConstructor(name, busLayer, refresh, owner);
    
	this.f_setOwner = function(owner) 
	{
	    this.m_owner = owner;	
	}
		
    this.f_distructor = function()
    {
        for (var i = 0; i < this.m_children.length; i++) {
            this.m_children[i].f_distructor();
        }
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
        
	this.f_createExpandablePanel = function()
	{
        var div = document.createElement('div');
        div.style.backgroundColor = 'white';
        div.style.paddingLeft = '0px';	
		div.style.margin = '0';
        div.style.display = 'block';
        div.style.height = 'auto';
        //div.style.border = '1px solid green';
		
        var html = '<ul class="no-border">' +
        '<div id="' +
        this.m_id +
        '" class="tree-item" style="margin:0; padding:0;">';
        if ((this.m_refresh != undefined) && (this.m_refresh == true)) {
            html += '<div id="op_' + this.m_id + '" class="float-right" style="display:none">' +
            '<a href="' +
            this.m_top +
            '" class="no-decoration">' + g_lang.m_log_top + '</a>&nbsp;<a href="#" class="no-decoration"><img id="refresh_' +
            this.m_id +
            '" src="images/refresh16.png">&nbsp;'+ g_lang.m_log_refresh + '</a>' +
            '</div>'
        }
        html += '<li id="li_' + this.m_id + '" class="tree-icon">' +
        '<a id="a_' +
        this.m_id +
        '" href="#" style="text-decoration:none;color:#FF5500;paddingLeft:0px;outline-style:none;"><img id="img_' +
        this.m_id +
        '" border="0" src="images/plus.gif">&nbsp;' +
        this.m_text +
        '</a></li>';
        html += '<input style="display:none" id="cb_' + this.m_id + '" type="checkbox" title="' + this.m_text + '">';
        html += '</div></ul>';
        
        div.innerHTML = html;	
		
		return div;	
	}
	
    this.f_getPage = function()
    {
        var div = document.createElement('div');
        div.setAttribute('align', 'left');
        /////////////////////////////////////////
        // set inner styling of the div tag
        div.style.paddingLeft = '15px';
		div.style.margin = '0';
        div.style.backgroundColor = 'white';
        div.style.display = 'block';
        div.style.height = 'auto';
		//div.style.border = '1px solid red';
        
		this.f_init();		
		div.appendChild(this.f_createExpandablePanel());       
		 
        this.m_div = div;
		this.f_addChildren();
        
        return this.m_div;
    }
    
    this.f_attachEventListener = function()
    {
        var a = ['a_', 'refresh_'];
        
        for (var i = 0; i < a.length; i++) {
            var id = a[i] + this.m_id;
            var el = document.getElementById(id);
            g_xbObj.f_xbAttachEventListener(el, 'click', this.f_handleClick, true);
        }
    }
    
    this.f_detachEventListener = function()
    {
        var a = ['a_', 'refresh_'];
        
        for (var i = 0; i < a.length; i++) {
            var id = a[i] + this.m_id;
            var el = document.getElementById(id);
            g_xbObj.f_xbDetachEventListener(el, 'click', this.f_handleClick, true);
        }
    }
    
	this.f_refresh = function() 
	{
		var id = 'cb_' + this.m_id;
		var cb = document.getElementById(id);
		if (cb != null) {
			if (cb.checked){
				this.f_loadVMData();
			}
		}
	}
	
	this.f_refreshChildren = function()
	{
		for (var i=0; i < this.m_children.length; i++) {
			this.m_children[i].f_refresh();
		}
	}
	
    this.f_initInner = function(topLink, id, text)
    {
        this.m_top = topLink;
        this.m_id = id;
        this.m_text = text;
    }	
	
	this.f_showRefresh = function(sid, bShow)
	{
		if (this.m_refresh) {
			var p = document.getElementById('op_' + sid);
			if (bShow) {
				p.style.display = "";
			} else {
				p.style.display = "none";
			}
		} 
	}		
		
	this.f_expand = function() 
	{
		for (var i=0; i < this.m_children.length; i++) {
			this.m_children[i].f_show();
		}
	}
	
	this.f_collapse = function()
	{
		for (var i=0; i < this.m_children.length; i++) {
			this.m_children[i].f_hide();
		}
	}
	
	this.f_addChild = function(child)
	{
		this.m_children.push(child);
		var page = child.f_getPage();
		this.m_div.appendChild(page);
	}
	
	this.f_removeChild = function(child)
	{
		var i = this.m_children.indexOf(child);
		if (i >=0) {
			this.m_children.splice(i,1);
		}
		var id = child.f_getId();
		var el = document.getElementById(id);
		if (el != null) {
			this.m_div.removeChild(el);
		}
	}
	
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = f_elemGetAttribute(target, 'id');
            var sid = '';
			if (id.indexOf('refresh_') != -1) {
				thisObj.f_refreshChildren();
			} else if (id.indexOf('img_') != -1) {
                sid = id.substring(4, id.length);
            } else {
                sid = id.substring(2, id.length);
            }
            var cb = document.getElementById('cb_' + sid);
            var img = document.getElementById('img_' + sid);
            if (cb) {
                if (cb.checked) {
                    cb.checked = false;
                    img.setAttribute('src', 'images/plus.gif');
                    thisObj.f_showRefresh(sid, false);		
					thisObj.f_collapse();			
                    //removeDiv(sid);
                } else {
                    cb.checked = true;
                    img.setAttribute('src', 'images/minus.gif');
                    thisObj.f_showRefresh(sid, true);		
					thisObj.f_expand();			
                    //addDiv(sid);
                }
            }
        }
        return false;
    }
    	
	//Abstract function.  To be overriden by sub classes.
	this.f_loadVMData = function() {}	
	this.f_addChildren = function() 
	{
		this.m_owner.f_addChildren();
    }
	this.f_init = function() 
	{
		this.m_owner.f_init(); 
	}
	
}
