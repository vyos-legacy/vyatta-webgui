/*
 Document   : utm_confFormObj.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description: Base class for all configuration panel that uses form layout
 */
function UTM_confFormObj(name, callback, busLayer)
{
    var thisObjName = 'FT_confFormObj';
    this.m_config = undefined;
	this.m_div = undefined;
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
        UTM_confFormObj.superclass.constructor(name, callback, busLayer);
    }	
    this.privateConstructor(name, callback, busLayer);
    
    this.f_distructor = function()
    {
        this.f_detachEventListener();
        UTM_confFormObj.superclass.f_distructor();
    }
    
    /*
     * This should be called from the sub class to initialize the fields.
     */
    this.f_setConfig = function(config)
    {
        this.m_config = config;
    }
    
    /**
     * Set up configuration page, taking config object to initialize the page.
     * @param {Object} config
     * The config object should have the following:
     *     {
     *         id: 'the div id',
     *         items: [
     *             {
     *                 v_type: label, text, password, empty
     *                 v_padding: vertical padding
     *                 padding: horizontal left padding
     *                 id: the id field of this component
     *                 onclick: click handler for this field
     *                 font_weight: bold, normal
     *                 text: applicable to v_type of label or button
     *                 size: applicable to v_type of input
     *                 v_new_row: true, false
     *             }, ...
     *         ],
     *         buttons: [
     *             {
     *                 id: the id field of this component
     *                 text: button caption
     *                 onclick: onclick handler
     *                 size: size of the button, default to
     *             }
     *         ]
     *     }
     */	
    this.f_getForm = function()
    {
        var div = document.createElement('div');
        div.setAttribute('id', this.m_config.id);
        //div.setAttribute('align', 'left');
        //div.setAttribute('class', 'conf_html_base_cls');
        /////////////////////////////////////////
        // set inner styling of the div tag
        //div.style.position = 'absolute';
        //div.style.pixelLeft = 0;
		//div.style.paddingLeft = 30;
        div.style.backgroundColor = 'white';
        div.style.display = 'block';

        //div.innerHTML = FT_confMyProfile.m_html.innerHTML;
        div.innerHTML = this.f_doLayout();
        //alert('form generated html: ' + div.innerHTML);

        return div;
    }
    
	this.f_getPage = function(children)
	{
        var div = document.createElement('div');
        div.setAttribute('id', 'utm_confpanel_');
        div.setAttribute('align', 'left');
    
        /////////////////////////////////////////
        // set inner styling of the div tag
        //div.style.position = 'absolute';
        div.style.pixelLeft = 0;
		div.style.paddingLeft = 30;		
        div.style.backgroundColor = 'white';
        div.style.display = 'block';

        for(var i=0; i<children.length; i++)
            div.appendChild(children[i]);
		
        document.getElementById('ft_container').appendChild(div);
        this.m_div = div;
        this.f_attachEventListener();
        this.f_loadVMData(div);
				
        return this.m_div;		
	}
	
    this.f_createGeneralDiv = function(text)
    {
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.overflow = 'visible';		

        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">';
        innerHtml += '<tbody><tr><td>' +
                      '<div><p>' + text + '</p>' +
                      '</td></tr></tbody></table>';

        div.innerHTML = innerHtml;

        return div;
    }	
	
    this.f_addButtonLeft = function(configButton)
    {
		var tooltip = '';
		if ((configButton.tooltip != undefined) && (configButton.tooltip != null)) {
			tooltip = configButton.tooltip;
		}
        var html = '<div style="float:left" title="' + tooltip + '">';
		if (this.f_checkValue(configButton.align, 'left')) {
			html += this.f_addButton(configButton, 'left');
		}
		html += '</div>';
		return html;
    }
    
    this.f_addButtonRight = function(configButton)
    {
		var tooltip = '';
		if ((configButton.tooltip != undefined) && (configButton.tooltip != null)) {
			tooltip = configButton.tooltip;
		}		
        var html = '<div style="float:right" title="' + tooltip + '">';
		if (this.f_checkValue(configButton.align, 'right')) {
			html += this.f_addButton(configButton, 'right');
		}
		html += '</div>';
		return html;    
    }
    
    this.f_addButton = function(configButton, alignment)
    {
		var html ='';		
        html = html + '<input type="image" id="' + configButton.id + '" class="v_button_' + alignment +'"';
				
        var imgSrc = 'images/bt_apply.gif';
        switch (configButton.text.trim().toLowerCase()) {
            case 'apply':
                imgSrc = g_lang.m_imageDir + 'bt_apply.gif';
                break;
            case 'update':
                imgSrc = g_lang.m_imageDir + 'bt_update.gif';
                break;
            case 'cancel':
                imgSrc = g_lang.m_imageDir + 'bt_cancel.gif';
                break;
            case 'ok':
                imgSrc = g_lang.m_imageDir + 'bt_ok.gif';
                break;
            case 'backup':
                imgSrc = g_lang.m_imageDir + 'bt_backup.gif';
                break;
            case 'restore':
                imgSrc = g_lang.m_imageDir + 'bt_restore.gif';
            case 'back':
                imgSrc = g_lang.m_imageDir + 'bt_back.png';				
            default:
                break;
        }
        html = html + ' src="' + imgSrc + '">';
		return html;
    }
    
    this.f_createButtons = function()
    {
        var html = '';
        if (this.m_config.buttons != undefined) {
            html = html + '<div class="v_button_container"><br/>';
            for (var i = 0; i < this.m_config.buttons.length; i++) {
                html += this.f_addButtonLeft(this.m_config.buttons[i]);
            }
            for (var i = 0; i < this.m_config.buttons.length; i++) {
                html += this.f_addButtonRight(this.m_config.buttons[i]);
            }		
			html += '<div style="clear:both"></div>';	
            html += '</div>';
        }
        return html;
    }
    
    this.f_checkCondition = function(exp)
    {
        if ((exp != undefined) && (exp != null) && (exp == 'true')) {
            return true;
        }
        return false;
    }
    
    this.f_checkValue = function(exp, value)
    {
        if ((exp != undefined) && (exp == value)) {
            return true;
        }
        return false;
    }
    
    this.f_getConfigItemCls = function(configItem)
    {
        var iclass = 'v_form_input';
		if ((!configItem.no_left_margin) || (configItem.no_left_margin == null)) {
			return iclass;
		}
        if (this.f_checkCondition(configItem.no_left_margin)) {
            iclass = 'v_form_input_no_left_margin';
        }
        return iclass;
    }
    
    this.f_configLabel = function(configItem)
    {
        var html = '';
        html = html + '<label id=' + '"' + configItem.id;
        if (this.f_checkValue(configItem.font_weight, 'bold')) {
            if (this.f_checkCondition(configItem.v_new_row)) {
                html = html + '" class="v_label_bold"';
            } else {
                html = html + '" class="v_label_bold_right"';
            }
        } else {
            if (this.f_checkCondition(configItem.v_new_row)) {
                html = html + '" class="v_label"';
            } else {
                html = html + '" class="v_label_right"';
            }
        }
        return html;
    }
    
    this.f_configPassword = function(configItem, input_class)
    {
        var html = '';
        html = html + '<input type="password" id="' + configItem.id + '" class="' + input_class + '"';
        if (this.f_checkCondition(configItem.readonly)) {
            html = html + ' readonly style="background-color: #EFEFEF;"';
        }
        return html;
    }
    
    this.f_configTextfield = function(configItem, input_class)
    {
        var html = '';
        html = html + '<input type="text" id="' + configItem.id + '" class="' + input_class + '"';
        if (this.f_checkCondition(configItem.readonly)) {
            html = html + ' readonly style="background-color: #EFEFEF;"';
        }
        return html;
    }
    
    this.f_configColspan = function(configItem)
    {
        var html = '';
        if ((configItem.colspan != undefined)) {
            html = html + '<td colspan="' + configItem.colspan + '"';
        } else {
            html = html + '<td';
        }
        return html;
    }
    
    this.f_configColAlign = function(configItem)
    {
        var html = '';
        if ((configItem.align != undefined)) {
            html = html + ' align="' + configItem.align + '"';
        } 
        return html;
    }	
	
    this.f_configPadding = function(configItem)
    {
        var html = '';
        if ((configItem.padding != undefined)) {
            html = html + ' style="padding-left: ' + configItem.padding + ';">';
        } else {
            html = html + '>';
        }
        return html;
    }
    
    this.f_configString = function(configItem)
    {
        var html = '';
        html += configItem.text;
        return html;
    }
		
    this.f_configVType = function(configItem, input_class)
    {
        var html = '';
        var enclosing = '';
        switch (configItem.v_type) {
            case 'label':
                enclosing = '</label>';
                html += this.f_configLabel(configItem);
                break;
            case 'password':
                html += this.f_configPassword(configItem, input_class);
                break;
            case 'text':
                html += this.f_configTextfield(configItem, input_class)
                break;
            case 'empty':
                html += '<div id="' + configItem.id + '"><br/></div';
                break;
            case 'html':
                break;
        }
        if (configItem.v_type != 'html') {
            if (configItem.size != undefined) {
                html = html + ' size="' + configItem.size + '"'
            }
            html += '>';
        }
        if (configItem.text != undefined) {
            html += configItem.text;
            if (this.f_checkCondition(configItem.require)) {
                html = html + '</label><label style="color: #FF5500; font-weight: bold; font-size:14px;padding-left: 20px; text-align:right;">*';
            }
        }
        html += enclosing;
        
        return html;
    }
    
    this.f_doLayout = function()
    {
        if (this.m_config == undefined) {
            return;
        }
        var html = '<form id="' + this.m_config.id + '_form" onsubmit="return false;" class="v_form" border="0" style="width:' +
        this.m_config.width +
        'px;"><br/><br/>';
		
		if (!this.f_checkCondition(this.m_config.nofieldset)) {
			if (g_xbObj.m_isIE == true) {
				html += '<fieldset>';
			} else {
				html += '<div style="width:' + this.m_config.width + 'px; border: 1px solid #CCC; -moz-border-radius: 5px; -webkit-border-radius: 5px;">';
			}
			html += '<div style="padding:10px 5px 10px 5px;">';
		}
		
        html += '<table border="0" style="width:' + (this.m_config.width-10) + 'px; padding: 10px 5px 10px 5px;">';
        
        for (var i = 0; i < this.m_config.items.length; i++) {
			if (this.m_config.items[i].v_type == 'string') {
				//alert('before: ' + html);
				html += this.f_configString(this.m_config.items[i]);
				//alert('after: ' + html);
				continue;
			}
            var input_class = this.f_getConfigItemCls(this.m_config.items[i]);
            if (this.f_checkCondition(this.m_config.items[i].v_new_row)) {
                html += '<tr>';
            }
            html += this.f_configColspan(this.m_config.items[i]);
            html += this.f_configColAlign(this.m_config.items[i]);			
            html += this.f_configPadding(this.m_config.items[i]);
            html += this.f_configVType(this.m_config.items[i], input_class);
            
            if (this.m_config.items[i].v_padding != undefined) {
                html = html + '<br><br>';
            }
            
            html = html + '</td>';
            
            if (this.f_checkCondition(this.m_config.items[i].v_end_row)) {
                html = html + '</tr>';
            }
        }
        
        html += '</table></div>';		
        if (g_xbObj.m_isIE == true) {
            html += '</fieldset>';
        } else {
            html += '</div>';
        }
        html += this.f_createButtons();
        html += '</form>';
        html = html + '<br/><br/>';
        
        return html;
    }
    
    this.f_createListItem = function(item)
    {
        return ('<li style="list-style-type:square;list-style-image: url(images/puce_squar.gif);">' + item + '</li>');
    }
    
    this.f_checkEmpty = function(field, message, err)
    {
        if (field.value.trim().length <= 0) {
            return (err + thisObj.f_createListItem(message));
        } else {
            return err;
        }
    }
    
    this.f_attachEventListener = function()
    {
        for (var i = 0; i < this.m_config.buttons.length; i++) {
            var id = this.m_config.buttons[i].id;
            var b = document.getElementById(id);
            g_xbObj.f_xbAttachEventListener(b, 'click', this.m_config.buttons[i].onclick, false);
        }
    }
    
    this.f_detachEventListener = function()
    {
        for (var i = 0; i < this.m_config.buttons.length; i++) {
            var id = this.m_config.buttons[i].id;
            var b = document.getElementById(id);
            g_xbObj.f_xbDetachEventListener(b, 'click', this.m_config.buttons[i].onclick, false);
        }
    }
    
    this.f_onUnload = function()
    {
        this.f_detachEventListener();
    }
    
    this.f_loadVMData = function(element)
    {
    }
    
    this.f_stopLoadVMData = function()
    {
    }

	this.f_hideTableRow = function(id, hide)
	{
		//alert('f_hideTableRow.id: ' + id);
		var el = document.getElementById(id);
		var p = el.parentNode;				
		while (p) {
			if (p.nodeName.toUpperCase() == 'TR') {
				if (hide==true) {
					p.style.display = 'none';
				} else {
					p.style.display = '';
				}
				break;
			}
			p = p.parentNode;
		}
	}    
	
    this.f_getHeight = function()
	{
		var h = 0;
		for (var i=0; this.m_div.childNodes[i]; i++) {
			h += this.m_div.childNodes[i].offsetHeight;
		}
		return h;		
	}	
	
    this.f_resize = function(padding)
    {
		 /*
		 if (this.m_id !=  g_configPanelObj.m_selectedItem) {
			 return;
		 }
		 */		
		 var h = this.f_getHeight();
		 var ft = document.getElementById('ft_container');
		 if (padding) {
		 	h += padding;
		 } 
         ft.style.height = h + 'px';
         this.f_reflow();
		 g_utmMainPanel.f_requestResize();			 
    }
		
    this.f_handleClick = function(e)
	{
	}	

    //////////////////////////////////////////////////////////////////////////////////
    //// Combobox convenience functions
    //////////////////////////////////////////////////////////////////////////////////	
	this.f_getComboBoxSelectedValue = function(cb)
	{
		var i = cb.selectedIndex;
		return cb.options[i].value;
	}
	
	this.f_getComboBoxSelectedName = function(cb)
	{
		var i = cb.selectedIndex;
		return cb.options[i].text;
	}	
	
	this.f_setComboBoxSelectionByValue = function(cb, value)
	{
		for (var i=0; i < cb.options.length; i++) {
		    if (cb.options[i].value == value) {
				cb.options[i].selected = true;
			} else {
				cb.options[i].selected = false;
			}	
		}
	}
	
	this.f_setComboBoxSelectionByName = function(cb, name)
	{
		for (var i=0; i < cb.options.length; i++) {
		    if (cb.options[i].text == name) {
				cb.options[i].selected = true;
			} else {
				cb.options[i].selected = false;
			}	
		}
	}	
	
    //////////////////////////////////////////////////////////////////////////////////
    //// form validation
    //////////////////////////////////////////////////////////////////////////////////
    this.f_checkDate = function(date)
    {
        dateRegex = /([1-9]|0[1-9]|1[012])[-\/.]([1-9]|0[1-9]|[12][0-9]|3[01])[-\/.](20)\d\d/;
        if (!date.match(dateRegex)) {
            return false;
        }
        return true;
    }
    
    this.f_checkHour = function(hour)
    {
        hourRegex = /^(0[1-9]|1[012]|[1-9])$/;
        if (!hour.match(hourRegex)) {
            return false;
        }
        return true;
    }
    
    this.f_checkMinute = function(minute)
    {
        minuteRegex = /^([0-9]|[0-5][0-9])$/;
        if (!minute.match(minuteRegex)) {
            return false;
        }
        return true;
    }
    
    this.f_checkEmail = function(email)
    {
        emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (!email.match(emailRegex)) {
            return false;
        }
        return true;
    }
    
    this.f_checkIP = function(ip)
    {
        ipRegex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;
        if (!ip.match(ipRegex)) {
            return false;
        }
        return true;
    }
    
    this.f_checkHostname = function(hostname)
    {
        hnRegex = /^[a-zA-Z0-9.-]+$/;
        if (!hostname.match(hnRegex)) {
            return false;
        }
        return true;
    }	
}

UTM_extend(UTM_confFormObj, UTM_confBaseObj);

EMPTY_ROW = { v_type: 'empty', v_new_row: 'true',v_end_row: 'true'};
