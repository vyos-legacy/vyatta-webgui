/*
 Document   : ft_confFormObj.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description: Base class for all configuration panel that uses form layout
 */
function FT_confFormObj(name, callback, busLayer) {
    var thisObjName = 'FT_confFormObj';
    this.m_config = undefined;
	var thisObj = this;
    this.m_div = undefined;
    
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
        FT_confFormObj.superclass.constructor(name, callback, busLayer);
    }	
	this.privateConstructor(name, callback, busLayer);
	
    this.f_distructor = function()
    {
        this.f_detachEventListener();
        FT_confFormObj.superclass.f_distructor();
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
    this.f_getConfigurationPage = function()
    {
        var div = document.createElement('div');
        div.setAttribute('id', this.m_config.id);
        div.setAttribute('align', 'center');
        div.setAttribute('class', 'conf_html_base_cls');
        /////////////////////////////////////////
        // set inner styling of the div tag
        //div.style.position = 'absolute';
        div.style.pixelLeft = 0;
        div.style.backgroundColor = 'white';
        
        //div.innerHTML = FT_confMyProfile.m_html.innerHTML;
        div.innerHTML = this.f_doLayout();
        //alert('form generated html: ' + div.innerHTML);
        div.style.display = 'block';
        
        document.getElementById('ft_container').appendChild(div);
        
        this.f_attachEventListener();
        this.f_loadVMData(div);
        this.m_div = div;
		this.f_resize(20);
        return div;
    }

    this.f_resize = function(padding)
    {
		 if (this.m_id !=  g_configPanelObj.m_selectedItem) {
			 return;
		 }		
		 var h = this.m_div.offsetHeight;
		 //var id = f_elemGetAttribute(this.m_div, 'id');
		 var ft = document.getElementById('ft_container');
		 //console.log('div id: ' + id + ' div.height: ' + h + ' ft.height.before: ' + ft.style.height);
		 if (padding) {
		 	h += padding;
		 } 
         ft.style.height = h + 'px';
		 //console.log('ft.height.after: ' + ft.style.height);
		 //alert('ft_container height: ' + document.getElementById('ft_container').style.height);
         this.f_reflow();
    }
	
	
    this.f_createButtons = function()
    {
        var html = '';
        if (this.m_config.buttons != undefined) {
            html = html + '<div class="v_button_container"><br/>';
			html += html + '<table cellspacing="0" cellpadding="0" border="0"><tbody><tr>';
            for (var i = 0; i < this.m_config.buttons.length; i++) {
				var tooltip = '';
				if ((this.m_config.buttons[i].tooltip != undefined) && 
				    (this.m_config.buttons[i].tooltip != null)) {
						tooltip = this.m_config.buttons[i].tooltip;
				}
				
                html = html + '<td><div title="' + tooltip + '"><input type="image" id="' + this.m_config.buttons[i].id + '" class="v_button"';
                var imgSrc = g_lang.m_imageDir + '/bt_apply.gif';
                switch (this.m_config.buttons[i].text.trim().toLowerCase()) {
                    case 'apply':
                        imgSrc = g_lang.m_imageDir + '/bt_apply.gif';
                        break;
                    case 'update':
                        imgSrc =  g_lang.m_imageDir  + '/bt_update.gif';
                        break;
                    case 'cancel':
                        imgSrc =  g_lang.m_imageDir  + '/bt_cancel.gif';
                        break;
                    case 'ok':
                        imgSrc =  g_lang.m_imageDir  + '/bt_ok.gif';
                        break;
                    case 'backup':
                        imgSrc =  g_lang.m_imageDir  + '/bt_backup.gif';
                        break;
                    case 'restore':
                        imgSrc =  g_lang.m_imageDir  + '/bt_restore.gif';
                    default:
                        break;
                }
                html = html + ' src="' + imgSrc + '"></div></td>';
            }
			html += '</tr></tbody></table>';
            html = html + '</div>';
        }
        return html;
    }
    
    this.f_checkCondition = function(exp)
    {
        if ((exp != undefined) && (exp == 'true')) {
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
                html += '<br';
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
        var html = '<form id="' + this.m_config.id + '_form" onsubmit="return false;" class="v_form" border="0"><br/><br/>';
        html += '<table border="0" align="center">';
        
        for (var i = 0; i < this.m_config.items.length; i++) {
            var input_class = this.f_getConfigItemCls(this.m_config.items[i]);
            if (this.f_checkCondition(this.m_config.items[i].v_new_row)) {
                html += '<tr>';
            }
            html += this.f_configColspan(this.m_config.items[i]);
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
        
        html += '</table>';
        html += this.f_createButtons();
        html += '</form>';
        html = html + '<br/><br/>';
        
        return html;
    }
    
	this.f_createListItem = function (item)
	{
		return ('<li style="list-style-type:square;list-style-image: url(' + g_utils.f_getHomePage() + '/' + g_lang.m_imageDir + 'puce_squar.gif);">' + item + '</li>');
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
            g_xbObj.f_xbAttachEventListener(b, 'click', this.m_config.buttons[i].onclick, true);			
        }
    }
    
    this.f_detachEventListener = function()
    {
        for (var i = 0; i < this.m_config.buttons.length; i++) {
            var id = this.m_config.buttons[i].id;
            var b = document.getElementById(id);
            g_xbObj.f_xbDetachEventListener(b, 'click', this.m_config.buttons[i].onclick, true);				
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
		hourRegex =/^(0[1-9]|1[012]|[1-9])$/;
		if (!hour.match(hourRegex)) {			
			return false;
		}
		return true;		
	}
	
	this.f_checkMinute = function(minute)
	{
		minuteRegex =/^([0-9]|[0-5][0-9])$/;
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

	this.f_checkHostname= function(hostname)
	{
		hnRegex = /^[a-zA-Z0-9.-]+$/;
		if (!hostname.match(hnRegex)) {			
			return false;
		}
		return true;			
	}	
	
	this.f_checkUsername= function(username)
	{
		hnRegex = /^[a-zA-Z0-9]+$/;
		if (!username.match(hnRegex)) {			
			return false;
		}
		return true;			
	}	
	
}

FT_extend(FT_confFormObj, FT_confBaseObj);

FT_EMPTY_ROW = { v_type: 'empty', v_new_row: 'true', v_end_row: 'true'};

function FT_confEmptyComponent()
{
    var thisObj = this;

    this.f_distructor = function(){ }	
	this.f_loadVMData = function() { }
	this.f_stopVMData = function() { }
	this.f_onUnload = function() { }	
	
	this.f_getConfigurationPage =  function() 
	{
        thisObj.m_selectObj = undefined;
        var div = document.createElement('div');
        div.style.display = 'block';
        div.style.background = '#FFCC99';
        div.style.color = '#000000';
        div.style.fontFamily = 'Arial, san serif';
        div.style.fontSize = '20px';
        div.style.width = "100%";
        div.style.height = "400";
        var text = document.createElement('h1');
        text.innerHTML = 'Not Implemented';
        div.appendChild(text);
        return div;		
	}

}
