/*
 Document   : ft_confFormObj.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description: Base class for all configuration panel that uses form layout
 */
FT_confFormObj = Ext.extend(FT_confBaseObj, {
    thisObjName: 'FT_confFormObj',
    m_config: undefined,
    
    
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    constructor: function(name, callback, busLayer)
    {
        FT_confFormObj.superclass.constructor(name, callback, busLayer);
    },
    
    /*
     * This should be called from the sub class to initialize the fields.
     */
    f_setConfig: function(config)
    {
        this.m_config = config;
    },
    
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
    f_getConfigurationPage: function()
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
    },
    
    f_doLayout: function()
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
    },
    
    f_attachEventListener: function()
    {
        for (var i = 0; i < this.m_config.buttons.length; i++) {
            var id = this.m_config.buttons[i].id;
            var b = document.getElementById(id);
            g_xbObj.f_xbAttachEventListener(b, 'click', this.m_config.buttons[i].onclick, true);
        }
    },
    
    f_detachEventListener: function()
    {
        for (var i = 0; i < this.m_config.buttons.length; i++) {
            var id = this.m_config.buttons[i].id;
            var b = document.getElementById(id);
            g_xbObj.f_xbAttachEventListener(b, 'click', this.m_config.buttons[i].onclick, true);
        }
    },
    
    f_onUnload: function()
    {
        f_detachEventListener();
    },
    
    f_loadVMData: function(element)
    {
    },
    
    f_stopLoadVMData: function()
    {
    }
    
});
