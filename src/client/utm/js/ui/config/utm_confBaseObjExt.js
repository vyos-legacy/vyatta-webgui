/*
 Document   : utm_confBaseObjExt.js
 Created on : Apr 01, 2009, 11:21:31 AM
 Author     : Loi.Vo
 Description:
 */
function UTM_confBaseObjExt(name, callback, busLayer)
{
	var thisObj = this;
	this.thisObjName = 'UTM_confBaseObjExt';
	
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
		UTM_confBaseObjExt.superclass.constructor(name, callback, busLayer);
		thisObj.m_rowHeight = 28;
	}
	this.privateConstructor(name, callback, busLayer);
	
	this.f_headerText = function()
	{
		return this.f_createGeneralDiv(g_lang.m_vpnOverviewHeader + "<br><br>");
	}
	
    this.f_addButtonLeft = function(bt)
    {
        var html = '';
		if ((bt[5] != undefined)&&(bt[5]!=null)&&(bt[5]=='left')) {
			html += '<div title="' + bt[2] + '" style="float:left">';
			html += this.f_addButton(bt, 'left');
            html += '</div>';			
		}		
		return html;
    }
    
    this.f_addButtonRight = function(bt)
    {
        var html = '';
		if ((bt[5] != undefined)&&(bt[5]!=null)&&(bt[5]=='right')) {
            html += '<div title="' + bt[2] + '" style="float:right">';			
			html += this.f_addButton(bt, 'right');
			html += '</div>';
		}
		return html; 
    }
    
    this.f_addButton = function(bt, align)
    {
		var html ='';		
		
        html = html + '<input type="image" id="' + bt[3] + '" class="v_button_' + align +'"' +
		       ' src="' + bt[4] + '" name="' + bt[0] + '" value="' + bt[0] + '" onclick="' +
			   bt[1] + '">';
		return html;
    }
	
    /**
     * create a div for push buttons.
     * @param buttons - is an array of array contains button name and onclick
     *                  callback.
     *                  [ [name, callback, tooltip, element id, img_src, align],
     *                    [btn2, callback, tooltip, element id, img_src, align],
     *                  []...]
     */
    this.f_createLRButtons = function(buttons, width)
    {
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.height = '40px';
		div.style.width = width;

        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0" width="100%">';
        innerHtml += '<tbody><tr height="22"><td>';
		innerHtml += '<div class="v_button_container">';

        for (var i=0; i < buttons.length; i++) {
			innerHtml += this.f_addButtonLeft(buttons[i]);
		}
		
		for (var i=0; i < buttons.length; i++) {
			innerHtml += this.f_addButtonRight(buttons[i]);
		}

        innerHtml += '<div style="clear:both"></div></div></td></tr></tbody></table>';
        div.innerHTML = innerHtml;

        return div;		
    }	
	
    this.f_createInnerButtons = function(buttons, width)
	{
        var div = this.f_createButtons(buttons);
		div.style.width = width;
        div.style.borderLeft = '1px solid #CCC';
        div.style.borderRight = '1px solid #CCC';
        div.style.borderBottom = '1px solid #CCC';	
		return div;	
	}	
	
    this.f_resize = function(padding)
    {
		//console.log('utm_confBaseObjExt.f_resize: table height: ' + thisObj.m_tableRowCounter * thisObj.m_rowHeight);
        if (this.m_id != g_configPanelObj.m_selectedItem ||
		this.m_div == undefined) {
			//to avoid the race condition between callback from server, and user click event.
			return;
		}
        var h = 0;
        for (var i = 0; this.m_div.childNodes[i]; i++) {
			//console.log('child.offsetHeight: ' + this.m_div.childNodes[i].offsetHeight);
            h += this.m_div.childNodes[i].offsetHeight;
        }

        if (padding) {
            h += padding;
        }
        //console.log('f_resize to: ' + h);
        this.m_div.style.height = h + 'px';
        document.getElementById('ft_container').style.height = h + 'px';
        this.f_reflow();
        g_utmMainPanel.f_requestResize();			
    }	
	
}

UTM_extend(UTM_confBaseObjExt, UTM_confBaseObj);
