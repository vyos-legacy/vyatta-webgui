/*
 Document   : ft_crossBrowser.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: The cross browser utilities
 */
function FT_crossBrowser()
{
    /////////////////////////////////////
    // properties
    var thisObj = this;
    this.m_isIE = false;
    this.m_isGecko = false;
    this.m_isOpera = false;
    this.m_isKDE = false;
    this.m_isIE5mac = false;
    this.m_isSafari = false;
    this.m_browserVer = undefined;
    this.m_domReadyCb = undefined;
    
    ///////////////////////////////////////
    // functions
    this.f_xbIdentifyBrowser = function()
    {
        var agent = navigator.userAgent.toLowerCase();
        
        if (typeof navigator.vendor != "undefined" &&
        navigator.vendor == "KDE" &&
        typeof window.sidebar != "undefined") {
            thisObj.m_isKDE = true;
            return true;
        } else if (typeof window.opera != "undefined") {
            var version = parseFloat(agent.replace(/.*opera[\/ ]([^ $]+).*/, "$1"));
            
            if (version >= 7) {
                thisObj.m_browserVer = "7+";
                thisObj.m_isOpera = true;
            } else if (version >= 5) {
                thisObj.m_browserVer = "5+";
                thisObj.m_isOpera = true;
            }
            return false;
        } else if (typeof document.all != "undefined") {
            if (typeof document.getElementById != "undefined") {
                thisObj.m_isIE = true;
                var browser = agent.replace(/.*ms(ie[\/ ][^ $]+).*/, "$1").replace(/ /, "");
                
                if (typeof document.uniqueID != "undefined") {
                    if (browser.indexOf("5.5") != -1) {
                        thisObj.m_browserVer = browser.replace(/(.*5\.5).*/, "$1");
                    } else {
                        thisObj.m_browserVer = browser.replace(/(.*)\..*/, "$1");
                    }
                } else {
                    thisObj.m_browserVer = "ie5mac";
                }
                return true;
            }
            return false;
        } else if (typeof document.getElementById != "undefined") {
            if (navigator.vendor.indexOf("Apple Computer, Inc.") != -1) {
                thisObj.m_isSafari = true;
                if (typeof window.XMLHttpRequest != "undefined") {
                
                    thisObj.m_browserVer = "1.2";
                }
                thisObj.m_browserVer = "1";
                return true;
            } else if (agent.indexOf("gecko") != -1) {
                thisObj.m_isGecko = true;
                return true;
            }
        }
        return false;
    }
    
    this.f_xbIdentifyOS = function()
    {
        var agent = navigator.userAgent.toLowerCase();
        
        if (agent.indexOf("win") != -1) {
            return "win";
        } else if (agent.indexOf("mac") != -1) {
            return "mac";
        } else {
            return "unix";
        }
        
        return false;
    }
    
    this.f_xbDetectQuirksMode = function()
    {
        if (typeof document.compatMode != "undefined" &&
        /CSS.Compat/.test(document.compatMode)) {
            return false;
        }
        
        return true;
    }
    
    this.f_xbOnDomReady = function(cb_func)
    {
        thisObj.m_domReadyCb = cb_func;
        thisObj.f_xbInit();
    }
    
    this.f_xbProcessDomReady = function()
    {
		if (thisObj.m_isSafari) {
			clearInterval(docReadyProcId);
		}
        if (thisObj.m_domReadyCb != undefined) {
            thisObj.m_domReadyCb();
        }
    }
    
    this.f_xbInit = function()
    {
        if (thisObj.m_isGecko || thisObj.m_isOpera) {
            document.addEventListener("DOMContentLoaded", thisObj.f_xbProcessDomReady, false);
            return;
        } else if (thisObj.m_isIE) {
            document.write("<s" + 'cript id="ie-deferred-loader" defer="defer" src="/' + '/:"></s' + "cript>");
            var defer = document.getElementById("ie-deferred-loader");
            defer.onreadystatechange = function()
            {
                if (this.readyState == "complete") {
                    thisObj.f_xbProcessDomReady();
                }
            };
        } else if (thisObj.m_isSafari) {
            docReadyProcId = setInterval(function()
            {
                var rs = document.readyState;
                if ((rs == "loaded") || (rs == "complete")) {
                    thisObj.f_xbProcessDomReady();
                }
            }, 10);
        }
        //no matter what, make sure it fires on load
        //E.on(window, "load", thisObj.f_xbProcessDomReady);
        /**   
        
         
        
         * TODO: find away to fire this event to handle the case where we attached the event, but the
        
         
        
         * dom is already loaded, so we will never get the event again.
        
         
        
         */
        
    }
    
	/*
	 * target: which element is receiving the event
	 * eventType: which type of event
	 * functionRef: the event handler function
	 * capture: true: capturing phase (outer -> inner), false: bubble up phase (inner -> outer)
	 */
    this.f_xbAttachEventListener = function(target, eventType, functionRef, capture)
    {
        if (typeof target.addEventListener != "undefined") {
            target.addEventListener(eventType, functionRef, capture);
        } else if (typeof target.attachEvent != "undefined") {
            var functionString = eventType + functionRef;
            target["e" + functionString] = functionRef;
            
            target[functionString] = function(event)
            {
                if (typeof event == "undefined") {
                    event = window.event;
                }
                target["e" + functionString](event);
            };
            
            target.attachEvent("on" + eventType, target[functionString]);
        } else {
            eventType = "on" + eventType;
            
            if (typeof target[eventType] == "function") {
                var oldListener = target[eventType];
                
                target[eventType] = function()
                {
                    oldListener();
                    
                    return functionRef();
                }
            } else {
                target[eventType] = functionRef;
            }
        }
    }
    
    this.f_xbDetachEventListener = function(target, eventType, functionRef, capture)
    {
        if (typeof target.removeEventListener != "undefined") {
            target.removeEventListener(eventType, functionRef, capture)
        } else if (typeof target.detachEvent != "undefined") {
            var functionString = eventType + functionRef;
            
            target.detachEvent("on" + eventType, target[functionString]);
            
            target["e" + functionString] = null;
            target[functionString] = null;
        } else {
            target["on" + eventType] = null;
        }
    }
    
    this.f_xbStopDefaultAction = function(event)
    {
        event.returnValue = false;
        
        if (typeof event.preventDefault != "undefined") {
            event.preventDefault();
        }
    }
    
    this.f_xbGetEventTarget = function(event)
    {
        var targetElement = null;
        
        if (typeof event.target != "undefined") {
            targetElement = event.target;
        } else {
            targetElement = event.srcElement;
        }
        
        while (targetElement.nodeType == 3 &&
        targetElement.parentNode != null) {
            targetElement = targetElement.parentNode;
        }
        
        return targetElement;
    }
    
    this.f_xbID = function(id)
    {
        if (document.getElementById(id) || (!document.getElementById(id) && document.getElementsByName(id).length == 0)) // IF   An ID attribute is assigned
        // OR   No ID attribute is assigned but using IE and Opera
        //          (which will find the NAME attribute value using getElementById)
        // OR   No element has this ID or NAME attribute value
        //          (used internally by the script)
        // THEN Return the required element.
        {
            return document.getElementById(id);
        } else {
            if (document.getElementsByName(id).length == 1) // IF   No ID attribute is assigned
            // AND  Using a standards-based browser
            // AND  Only one element has the NAME attribute set to the value
            // THEN Return the required element (using the NAME attribute value).
            {
                return document.getElementsByName(id)[0];
            } else {
                if (document.getElementsByName(id).length > 1) { // IF   No ID attribute is assigned
                    // AND  using a standards-based browser
                    // AND  more than one element has the NAME attribute set to the value
                    // THEN alert developer to fix the fault.
                    alert('ft_crossBrowser' +
                    ' \nCannot uniquely identify element named: ' +
                    id +
                    '.\nMore than one identical NAME attribute defined' +
                    '.\nSolution: Assign the required element a unique ID attribute value.');
                }
            }
        }
    }
    
	/**
	 * This function set the class attribute of an element.
	 * @param {Object} e
	 * @param {Object} className
	 */
	this.f_xbSetClassAttribute = function(e, className)
	{
		if (g_xbObj.m_isIE) {
			e.className = className;
		} else {
		    e.setAttribute('class', className);			
		}
	}
    
}

///////////////////////////////////////////////
// new FT_crossBrowser object
g_xbObj = new FT_crossBrowser();
g_xbObj.f_xbIdentifyBrowser();

