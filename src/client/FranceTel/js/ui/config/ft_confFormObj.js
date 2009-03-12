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
    
    
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confFormObj.superclass.constructor(name, callback, busLayer);
    }
    
	this.constructor(name, callback, busLayer);
	
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
        
        return div;
    }
    
    this.f_doLayout = function()
    {
        if (this.m_config == undefined) {
            return;
        }
        var html = '<form id="' + this.m_config.id + '_form" class="v_form" border="0"><br/><br/>' +
        '<table border="0" align="center">';
        for (var i = 0; i < this.m_config.items.length; i++) {
            if ((this.m_config.items[i].v_new_row != undefined) &&
            (this.m_config.items[i].v_new_row == 'true')) {
                html = html + '<tr>';
            }
			
			if ((this.m_config.items[i].padding != undefined)) {
				html = html + '<td style="padding-left: ' + this.m_config.items[i].padding + ';">';
			} else {
                html = html + '<td>';
			}
            
            var enclosing = '';
            
            switch (this.m_config.items[i].v_type) {
                case 'label':
                    enclosing = '</label>';
                    html = html + '<label id=' + '"' + this.m_config.items[i].id;
                    if ((this.m_config.items[i].font_weight != undefined) && (this.m_config.items[i].font_weight == 'bold')) {
                        if ((this.m_config.items[i].v_new_row != undefined) &&
                        (this.m_config.items[i].v_new_row == 'true')) {
                            html = html + '" class="v_label_bold"';
                        } else {
                            html = html + '" class="v_label_bold_right"';
                        }
                    } else {
                        if ((this.m_config.items[i].v_new_row != undefined) &&
                        (this.m_config.items[i].v_new_row == 'true')) {
                            html = html + '" class="v_label"';
                        } else {
                            html = html + '" class="v_label_right"';
                        }
                    }
                    break;
                case 'password':
                    html = html + '<input type="password" id="' + this.m_config.items[i].id + '" class="v_form_input"';
                    break;
                case 'text':
                    html = html + '<input type="text" id="' + this.m_config.items[i].id + '" class="v_form_input"';
                    break;
                case 'empty':
                    html = html + '<br';
                    break;
                case 'html':
                    break;
            }
            
            if (this.m_config.items[i].v_type != 'html') {
                if (this.m_config.items[i].size != undefined) {
                    html = html + ' size="' + this.m_config.items[i].size + '"'
                }
                
                html = html + '>';
            }
            if (this.m_config.items[i].text != undefined) {
                html = html + this.m_config.items[i].text;
				if ((this.m_config.items[i].require != undefined) && 
				    (this.m_config.items[i].require == 'true')) {
				    html = html + '</label><label style="color: #FF5500; font-weight: bold; font-size:14px;padding-left: 20px; text-align:right;">*';
				}
            }
            
            html = html + enclosing;
            
            if (this.m_config.items[i].v_padding != undefined) {
                html = html + '<br><br>';
            }
            
            html = html + '</td>';
            
            if ((this.m_config.items[i].v_end_row != undefined) &&
            (this.m_config.items[i].v_end_row == 'true')) {
                html = html + '</tr>';
            }
        }
        html = html + '</table>';
        if (this.m_config.buttons != undefined) {
            html = html + '<div class="v_button_container"><br/><br/>';
            for (var i = 0; i < this.m_config.buttons.length; i++) {
                html = html + '<button id="' + this.m_config.buttons[i].id + '" type="button" class="v_button"';
                if (this.m_config.buttons[i].size != undefined) {
                    html = html + ' size="' + this.m_config_buttons[i].size + '">';
                } else {
                    html = html + '">';
                }
                html = html + this.m_config.buttons[i].text + '</button>';
            }
            html = html + '</div>';
        }
        html = html + '<br/><br/>';
        
        return html;
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
	
}

FT_extend(FT_confFormObj, FT_confBaseObj);

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
