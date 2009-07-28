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
		return this.f_createGeneralDiv("<br><br>");
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
        //div.style.position = 'relative';
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
		div.style.paddingTop = '10px';
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
	
    this.f_createCenterButtons = function(buttons, width)
    {
        var div = document.createElement('div');
        //div.style.position = 'relative';
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
		div.style.paddingTop = '10px';
        div.style.height = '40px';
		div.style.width = width;
        div.setAttribute('align', 'center');

        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">';
        innerHtml += '<tbody><tr height="22">';

        for (var i=0; i < buttons.length; i++) {
			innerHtml += this.f_addButtonCenter(buttons[i]);
		}

        innerHtml += '</tr></tbody></table>';
        div.innerHTML = innerHtml;

        return div;		
    }		
	
    this.f_addButtonCenter = function(bt)
    {
        var html = '';

        html += '<td><div title="' + bt[2] + '" style="padding-left: 10px;" >';					
        html += html + '<input type="image" id="' + bt[3] + '"' +
		       ' src="' + bt[4] + '" name="' + bt[0] + '" value="' + bt[0] + '" onclick="' +
			   bt[1] + '">';
		html += '</div></td>';
			   
		return html;
    }	
	
    this.f_createInnerButtons = function(buttons, width)
	{
        var div = this.f_createButtons(buttons);
		div.style.width = width;
        div.style.borderLeft = '1px solid #CCC';
        div.style.borderRight = '1px solid #CCC';
        div.style.borderBottom = '1px solid #CCC';
		div.setAttribute('align', '');	
		return div;	
	}	
	
    this.f_resize = function(padding)
    {
		//console.log('utm_confBaseObj.f_resize called');
		if ((this.m_id == null) || (g_configPanelObj.m_selectedItem == null) || (this.m_div == undefined)) {
			//console.log('utm_confBaseObj.f_resize: get out since m_id, m_selectedItem, m_div is not defined');
			return;
		} else if ((this.m_id.indexOf(g_configPanelObj.m_selectedItem) == -1) ||
		(this.m_id.length != g_configPanelObj.m_selectedItem.length)) {
			//if (this.m_id != g_configPanelObj.m_selectedItem ||
			//this.m_div == undefined)
			//to avoid the race condition between callback from server, and user click event.
			//console.log('utm_configBaseObj.f_resize: this.m_id: ' + this.m_id + ' g_configPanelObj.m_selecteditem:' +
			//g_configPanelObj.m_selectedItem);
			return;
		}
        var h = 0;
        for (var i = 0; this.m_div.childNodes[i]; i++) {
			//console.log('utm_confBaseObj.f.resize: ' + i);
            h += this.m_div.childNodes[i].offsetHeight;
        }		

        if (padding) {
            h += padding;
        }
        g_utils.f_debug('utm_confBaseObjExt.f_resize: h=' + h, true);		
        //console.log('f_resize to: ' + h);
		/*
        this.m_div.style.height = h + 'px';
        document.getElementById('ft_container').style.height = h + 'px';
        this.f_reflow();
        g_utmMainPanel.f_requestResize();		
        */	
    }	
		
    /**
     * @param val - check or un-check the checkbox
     * @param elId - this element id
     * @param cb = callback
     * @param tooltip - tooltip for this checkbox
     * @param cbHiddenArray: an array of objects having the value, and id properties.
     *            value: has either 'checked' or ''
     *            id: the id to be assigned to the hidden checkbox.
     */
    //this.f_renderSmartCheckbox = function(val, elId, cb, tooltip, hiddenElId, hiddenElVal, readonly)
    this.f_renderSmartCheckbox = function(val, elId, cb, tooltip, readonly, cbHiddenArray)
    {
		var ro = '';
        var checked = val == 'yes' ? 'checked' : '';
        tooltip = tooltip == undefined ? "" : tooltip;
		
		if (readonly != null) {
			if (readonly==true) {
				ro = ' disabled style="color:#CCC;"';
			}
		} 		
		
        var html = '<input id="' + elId + '" type="checkbox" ' + checked +
        ' title="' +
        tooltip +
        '" onclick="' +
        cb +
        '"' + ro +'/>';
		for (var i=0; i < cbHiddenArray.length; i++) {
			html += '<input style="display:none" id="' + cbHiddenArray[i].id + '" type="checkbox" ' + cbHiddenArray[i].value + '/>';
		}
		
		return html;
    }
	
    /**
     * @param cbArray: an array of object, that has value, and id properties.
     *      value: has either checked or ''.
     *      id: the id to be assigned to checkbox.
     *      hidden: true or false
     *      cb: callback
     *      tooltip: tooltip
     *      readonly: true or false
     */
    this.f_renderCheckboxArray = function(cbArray)
    {
		var html = '';
		for (var i=0; i < cbArray.length; i++) {
			if (cbArray[i].hidden) {
				html += '<input style="display:none" id="' + cbArray[i].id + '" type="checkbox" ' + cbArray[i].value + '/>';
				//html += '<input id="' + cbArray[i].id + '" type="checkbox" ' + cbArray[i].value + '/>';				
			} else {
				var tooltip = (cbArray[i].tooltip==undefined)? "" : cbArray[i].tooltip;
				var readonly = (cbArray[i].readonly!=undefined) && (cbArray[i].readonly!=null) && (cbArray[i].readonly==true);
				var ro = (readonly==true)? ' disabled style="color:#CCC;"' : '';
				html += '<input id="' + cbArray[i].id + '" type="checkbox" ' + cbArray[i].value + ' title="' + tooltip + 
				        '" onclick="' + cbArray[i].cb + '" ' + ro + '/>';
			}
		}
        return html;
    }	
	
	this.f_createHtmlDiv = function(html, width)
    {
        var div = document.createElement('div');
        //div.style.position = 'relative';
		div.style.height = 'auto';
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.overflow = 'visible'

        if (width != null) {
			div.style.width = width;
		}

        var innerHtml = '<table width="100%" cellspacing="0" cellpadding="0" border="0">';
        innerHtml += '<tbody><tr><td>' +
        '<div>' +
        html +
        '</div>' +
        '</td></tr></tbody></table>';

        div.innerHTML = innerHtml;

        return div;
    }
	
    this.f_createListItem = function(item)
    {
        return ('<li style="list-style-type:square;list-style-image: url(images/puce_squar.gif);">' + item + '</li>');
    }	
	
}

UTM_extend(UTM_confBaseObjExt, UTM_confBaseObj);
