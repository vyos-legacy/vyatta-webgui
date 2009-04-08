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
    }
    
    this.f_reset = function()
    {
        while (thisObj.m_container.childNodes[0]) {
			//alert(thisObj.m_container.childNodes[0].nodeName);
            thisObj.m_container.removeChild(thisObj.m_container.childNodes[0]);
        }
    }
    
    this.f_show = function(vmId, urlPath)
    {
        //alert('ft_tabPanel.f_show: vmId: ' + vmId + ' urlPath: ' + urlPath);
        thisObj.f_reset();
        
        if (vmId == VYA.FT_CONST.OA_ID) {
            thisObj.f_showOApanel();
        } else {
            thisObj.f_showVm(vmId, urlPath);
        }
    }
    
    this.f_selectPage = function(id, subId)
    {
        thisObj.m_mainPanel.f_selectPage(id, subId);
    }
    
    this.f_showOApanel = function()
    {
        thisObj.m_container.appendChild(thisObj.m_mainPanel.f_getMainPanel());
        thisObj.m_mainPanel.f_show();
        if (g_roleManagerObj.f_isUser()) {
            //alert('is regular user');
            thisObj.m_mainPanel.f_selectMenuItem(VYA.FT_CONST.DOM_2_NAV_MYPROFILE_ID);
        } else {
            //alert('other user');
            thisObj.m_mainPanel.f_selectMenuItem(VYA.FT_CONST.DOM_2_NAV_APP_ID);
        }
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
		//alert('setIframeHeight called');
		var defaultSize = screen.height - 200;
		var iframeName = 'main_ifrm';
        var iframeWin = window.frames[iframeName];/*window.frames[iframeName]*/;
        var iframeEl = document.getElementById ? document.getElementById(iframeName) : document.all ? document.all[iframeName] : null;
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
    }
	/*
	this.f_resizeFrame = function() 
	{
		alert('f_resizeFrame called');
        var defaultSize = screen.height - 200;		
		var f = document.getElementById('main_ifrm');	
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
        var url = urlPath;
        var ifr = document.createElement('iframe');
        ifr.setAttribute('id', 'main_ifrm');
        ifr.setAttribute('border', 0);
        ifr.setAttribute('frameBorder', '0');
        ifr.style.width = '100%';
        //ifr.style.height = screen.height;
        ifr.setAttribute('height', screen.height-40);
        thisObj.m_container.appendChild(ifr);
		ifr = document.getElementById('main_ifrm');		
        g_xbObj.f_xbAttachEventListener(ifr, 'load', thisObj.f_setIframeHeight, true);
		//ifr.onload = thisObj.f_resizeFrame;				
        //ifr.onload = "f_setIframeHeight('main_ifrm')";
        ifr.setAttribute('src', url);
    }
    
}
