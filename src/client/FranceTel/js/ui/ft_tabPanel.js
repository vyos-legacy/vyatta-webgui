/*
 Document   : ft_tabPanel.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: The tab panel of the main frame
 */
function FT_tabPanel()
{
    /////////////////////////////////////
    // properties
    var thisObj = this;
    this.m_container = undefined;
    this.m_mainPanel = undefined;
    this.threadId = undefined;
	this.m_selectedId = undefined;
	this.m_stopAutoResize = false;
	
    ///////////////////////////////////////
    // functions    
    /*
     * Initialization function
     */
    this.f_init = function()
    {
    
        thisObj.m_container = document.getElementById(VYA.FT_CONST.DOM_MAIN_PANEL_ID); //'tab_content'
        thisObj.m_container.style.width = VYA.DYN_STYLE.APP_WIDTH;
        thisObj.m_mainPanel = new FT_mainPanel();
        thisObj.m_mainPanel.f_init();
		/*
		alert('isIE: ' + g_xbObj.m_isIE + ' isChrome: ' + g_xbObj.m_isChrome + ' isSafari: ' + 
		      g_xbObj.m_isSafari + ' isGecko: ' + g_xbObj.m_isGecko + ' isOpera: ' + g_xbObj.m_isOpera);
		*/
		thisObj.threadId = setInterval(thisObj.f_scrollRemove, 500);
    }
    
	this.f_stopPolling = function()
	{
		if (thisObj.m_selectedId) {
			if (thisObj.m_selectedId == VYA.FT_CONST.OA_ID) {
				//stop the polling thread
				thisObj.m_mainPanel.f_stopPolling();
			}
		}		
	}
	
    this.f_reset = function()
    {
		if (thisObj.m_selectedId) {
			if (thisObj.m_selectedId == VYA.FT_CONST.OA_ID) {
				//stop the polling thread
				thisObj.m_mainPanel.f_stopPolling();
			}
		}
        while (thisObj.m_container.childNodes[0]) {
			//alert(thisObj.m_container.childNodes[0].nodeName);
            thisObj.m_container.removeChild(thisObj.m_container.childNodes[0]);
        }
    }
    	
    this.f_show = function(vmId, urlPath)
    {
        //alert('ft_tabPanel.f_show: vmId: ' + vmId + ' urlPath: ' + urlPath);
        thisObj.f_reset();
        thisObj.m_selectedId = vmId;
		
        if (vmId == VYA.FT_CONST.OA_ID) {
            thisObj.f_showOApanel();
        } else {
            thisObj.f_showVm(vmId, urlPath);
        }
    }
    
	/*
    this.f_saveCurrentPage = function()
	{
		g_cookie.f_set(g_consObj.V_COOKIES_VM_PATH, thisObj.m_selectedId, g_cookie.m_userNameExpire);					
	    thisObj.m_mainPanel.f_saveCurrentPage();		
	}
    */
	
    this.f_selectDefaultPage = function(vmId)
    {
        thisObj.m_mainPanel.f_selectDefaultPage(vmId);
    }	
	
    this.f_selectPage = function(id, subId)
    {
        thisObj.m_mainPanel.f_selectPage(id, subId);
    }
    
	this.f_stopAutoResize = function(state)
	{
		thisObj.m_stopAutoResize = state;
	}
	
    this.f_showOApanel = function()
    {
		thisObj.f_stopAutoResize(true);
        thisObj.m_container.appendChild(thisObj.m_mainPanel.f_getMainPanel());
        thisObj.m_mainPanel.f_show();
    }
    
    this.f_getDocHeight = function(doc)
    {
        var docHt = 0, sh, oh;
        if (doc.height) 
            docHt = doc.height;
        else if (doc.body) {
            if (doc.body.scrollHeight) 
                docHt = sh = doc.body.scrollHeight;
            if (doc.body.offsetHeight) 
                docHt = oh = doc.body.offsetHeight;
            if (sh && oh) 
                docHt = Math.max(sh, oh);
        }
        return docHt;
    }
    
    this.f_setIframeHeight = function()
    {
		var iframeName = 'mainFrame';		
		var iframeEl = document.getElementById ? document.getElementById(iframeName) : document.all ? document.all[iframeName] : null;
		var defaultSize = screen.height - 200;
		
		try {
			//alert('setIframeHeight called');
			var iframeWin = window.frames[iframeName];/*window.frames[iframeName]*/
			if (!iframeWin) {
				iframeWin = iframeEl.contentWindow; /* for firefox */
			}
			if (iframeEl && iframeWin) {
				iframeEl.style.height = "auto"; // helps resize (for some) if new doc shorter than previous
				var docHt = thisObj.f_getDocHeight(iframeWin.document);
				//alert('docHt: ' + docHt);
				// need to add to height to be sure it will all show
				if (docHt) {
					if (docHt > 150) {
						iframeEl.style.height = docHt + 30 + "px";
					} else {
						iframeEl.style.height = defaultSize + "px";
					}
				} else {
					iframeEl.style.height = defaultSize + "px";
				}
			} else {
				iframeEl.style.height = defaultSize + "px";
			}
		//console.log('set ifrm height to: ' + iframeEl.style.height);			
		} catch (e) {
			iframeEl.style.height = defaultSize + "px"; //catch the 'Permission denied' exception when the user has links to cross domain site.
		}				
    }
	/*
	this.f_resizeFrame = function() 
	{
		alert('f_resizeFrame called');
        var defaultSize = screen.height - 200;		
		var f = document.getElementById('mainFrame');	
		var w = f.contentWindow;
		//window.frames[f.id];
		if (!w) {
			alert('f.contentWindow is null');
			w = window.frames[1];
		}
		var h = thisObj.f_getDocHeight(w.document);
		alert('frame height: ' + h);
		if (h > 10) {
			f.height = h + 30;
		} 
		if (h < 20) {
			f.height = defaultSize;
		}			
	}
    */
    this.f_showVm = function(vmId, urlPath)
    {
		thisObj.f_stopAutoResize(false);		
 
	    var url= g_cookie.f_get(vmId + '_' + g_consObj.V_COOKIES_LOC, g_consObj.V_NOT_FOUND);
		if (url == g_consObj.V_NOT_FOUND) {
			url = urlPath;
		}
		if ((vmId == 'utm') || (vmId=='netconf')) {
			url = urlPath;
		}
		
        var ifr = document.createElement('iframe');
        ifr.setAttribute('id', 'mainFrame');
		ifr.setAttribute('name', 'mainFrame');
        ifr.setAttribute('border', 0);
        ifr.setAttribute('frameBorder', '0');
        ifr.style.width = '100%';
		ifr.style.overflowX = 'hidden';
        //ifr.style.height = screen.height;
        //ifr.setAttribute('height', screen.height-40);
        thisObj.m_container.appendChild(ifr);
		ifr = document.getElementById('mainFrame');		
        //g_xbObj.f_xbAttachEventListener(ifr, 'load', thisObj.f_setIframeHeight, true);
		//ifr.onload = thisObj.f_resizeFrame;				
        //ifr.onload = "f_setIframeHeight('mainFrame')";
        ifr.setAttribute('src', url);		
    }
	
	this.f_saveDomUlocation = function(vmId) 
	{
		if ((vmId == VYA.FT_CONST.OA_ID) || (vmId == 'utm') || (vmId == 'netconf')) {
			return;
		}
		var ifr = document.getElementById('mainFrame');
		if (ifr) {
			var d = ifr.contentWindow.document;
			if (d) {
				g_cookie.f_set(vmId + '_' + g_consObj.V_COOKIES_LOC, d.location, g_cookie.m_userNameExpire);
			}
		}
	}
		
	this.f_adjustIframeHeight = function()
	{
		var t = (new Date()).getSeconds();
		
		g_utils.f_debug('ft_tabPanel.f_adjustIframeHeight: ' + t);
		
		var ifr = document.getElementById('mainFrame');
		//ifr.style.height = "auto";		
		var iframeWin = window.frames['mainFrame'];/*window.frames[iframeName]*/		
		if (!iframeWin) {
			iframeWin = ifr.contentWindow; /* for firefox */
		}
		d = iframeWin.document;
		if (!d) { 
		    //this is the case when we switching between different tabs on firefox
			//somehow window.frames['mainFrame'] will return a reference to the top window
			//instead of the frame window.
            d = ifr.contentWindow.document;
		}
		if (thisObj.m_stopAutoResize) {
			g_utils.f_debug('Inner iframe is in waiting state.  So return from here.');
			return;
		} 
		var r = (d.compatMode == 'BackCompat') ? d.body : d.documentElement;
		
		var isVS = r.scrollHeight > r.clientHeight;
		
		if (g_devConfig.m_debug) {
			g_utils.f_debug('t=' + t + ' r.scrollHeight: ' + r.scrollHeight + ' r.clientHeight: ' + r.clientHeight +
			' r.offsetHeight: ' +
			r.offsetHeight +
			' d.body.oh: ' +
			d.body.offsetHeight +
			' d.body.sh: ' +
			d.body.scrollHeight +
			' d.body.ch: ' +
			d.body.clientHeight +
			' d.de.oh: ' +
			d.documentElement.offsetHeight +
			' d.de.sh: ' +
			d.documentElement.scrollHeight +
			' d.de.ch: ' +
			d.documentElement.clientHeight +
			' isVS=' +
			isVS);
		}
		
        if (isVS) {
			ifr.height = (r.scrollHeight + 30) + 'px';
        } else {		
		    if (g_xbObj.m_isIE) {
                if (r.scrollHeight - d.body.offsetHeight > 30) {
                    ifr.height = (d.body.offsetHeight + 30) + 'px';
                }
            } else if (g_xbObj.m_isSafari || g_xbObj.m_isChrome) {				
                if (r.clientHeight - r.scrollHeight > 30) {
                    ifr.height = (r.scrollHeight + 30) + 'px';
                }
            } else if (g_xbObj.m_isOpera) {
                ;
            } else {
                if (r.clientHeight - r.offsetHeight > 30) {
                    ifr.height = (r.offsetHeight + 30) + 'px';
                }
            }							
		} 
	}
	
	this.f_scrollRemove = function()
	{
		try {
			var ifr = document.getElementById('mainFrame');
			if (ifr) {
			    thisObj.f_adjustIframeHeight();
			}
		} catch (e) { 
		    //console.log('f_scrollRemove exception:' + e)
		}
	}
    
	this.f_resizeChildIframe = function(h)
	{
		/*
		var ifr = document.getElementById('mainFrame');
		if (ifr) {
			ifr.style.height = h + 'px';
		}
		*/
	}
}
