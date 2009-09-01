/*
 Document   : utm_confFormDefObj.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description: Form definition object.
 */
function UTM_confFormDefObj(_id, _width, _items, _buttons)
{
	this.id = _id;
	this.width = _width;
	this.items = _items;
	this.buttons = _buttons;
	var thisObj = this;
	
	this.f_addItem = function(item) 
	{
		thisObj.items.push(item);
	}	
	this.f_addButton = function(button) 
	{
		thisObj.buttons.push(button);
	}
    ////-------- convenience functions.
    this.f_addString = function(_id, _text)
	{
		thisObj.f_addItem(thisObj.f_createString(_id, _text));
	}	
    this.f_addLabel = function(_id, _text, _endRow, required)
	{
		thisObj.f_addItem(thisObj.f_createLabel(_id, _text, 'true', _endRow, undefined, 'left', undefined, required));
	}	
	this.f_addLabelBold = function(_id, _text, _endRow) 
	{
		thisObj.f_addItem(thisObj.f_createLabel(_id, _text, 'true', _endRow, 'bold', 'left', undefined));		
	}
    this.f_addDivider = function(_id, _colspan)
	{
		thisObj.f_addItem(thisObj.f_createDivider(_id, _colspan));
	}
	this.f_addEmptySpace = function(_id, _colspan)
	{
		thisObj.f_addItem(thisObj.f_createEmptySpace(_id, _colspan));
	}
	this.f_addInput = function(_id, _size, _label, _onblur, required)
	{
		if ((_label != undefined) && (_label != null)) {
			thisObj.f_addLabel(_id + '_label', _label, 'false', required);
		}
		thisObj.f_addItem(thisObj.f_createInput(_id, 'false', 'true', 'right', undefined, undefined, _size, _onblur));
	}
	this.f_addInputWithPadding = function(_id, _size, _label, _onblur, _padding, required)
	{
		if ((_label != undefined) && (_label != null)) {
			var labelCtrl = thisObj.f_createLabelWithPadding(_id + '_label', _label, 'true', 'false', undefined, 'left', undefined, _padding, required);
			thisObj.f_addItem(labelCtrl);
		}
		thisObj.f_addItem(thisObj.f_createInput(_id, 'false', 'true', 'right', undefined, undefined, _size, _onblur));
	}	
	this.f_addPassword = function(_id, _size, _label, required) 
	{
		if ((_label != undefined) && (_label != null)) {
			thisObj.f_addLabel(_id + '_label', _label, 'false', required);
		}		
		thisObj.f_addItem(thisObj.f_createPassword(_id, 'false', 'true', 'right', undefined, undefined, _size));
	}	
	this.f_addHtml = function(_id, _text, _label, required) 
	{
		if ((_label != undefined) && (_label != null)) {
			thisObj.f_addLabel(_id + '_label', _label, 'false', required);
		}		
		thisObj.f_addItem(thisObj.f_createHtml(_id, _text,'false', 'true', 'right', undefined, undefined, undefined));
	}

	////------- advanced layout functions	
    this.f_createString = function(_id, _text) 
	{
		return new UTM_formItemObj('string', _id, _text, undefined, undefined, undefined, undefined,
		                           undefined, undefined, undefined, undefined);
	}	
    this.f_createLabel = function(_id, _text, _newRow, _endRow, _fontWeight, _align, _colspan, required) 
	{
		return new UTM_formItemObj('label', _id, _text, _newRow, _endRow, _fontWeight, _align,
		                           _colspan, undefined, undefined, undefined, undefined, required);
	}
    this.f_createLabelWithPadding = function(_id, _text, _newRow, _endRow, _fontWeight, _align, _colspan, _padding, required) 
	{
		return new UTM_formItemObj('label', _id, _text, _newRow, _endRow, _fontWeight, _align,
		                           _colspan, _padding, undefined, undefined, undefined, required);
	}	
	this.f_createDivider = function(_id, _colspan) 
	{
		return new UTM_formItemObj('html', _id, '<div id="' + _id + '" class="liner"></div>','true','true',undefined, undefined,
		                           _colspan, undefined, undefined, undefined);       
	}
	this.f_createEmptySpace = function(_id, _colspan) 
	{
		return new UTM_formItemObj('empty', _id, undefined,'true','true',undefined, undefined,
		                           _colspan, undefined, undefined, undefined);   		
	}
	this.f_createInput = function(_id, _newRow, _endRow, _align, _colspan, _padding, _size, _onblur)
	{
		return new UTM_formItemObj('text', _id, undefined, _newRow, _endRow, undefined, _align,
		                           _colspan, _padding, _size, undefined, _onblur);
	}
	this.f_createPassword = function(_id, _newRow, _endRow, _align, _colspan, _padding, _size) 
	{
		return new UTM_formItemObj('password', _id, undefined, _newRow, _endRow, undefined, _align,
		                           _colspan, _padding, _size, undefined);
	}	
	this.f_createHtml = function(_id, _text, _newRow, _endRow, _align, _colspan, _padding, _size) 
	{
		return new UTM_formItemObj('html', _id, _text, _newRow, _endRow, undefined, _align,
		                           _colspan, _padding, _size, undefined);		
	}
	
	this.f_createButton = function(_id, _text, _align, _clickHandler) 
	{
		return new UTM_formButtonObj(_id, _text, _align, _clickHandler);
	}
}


function UTM_formItemObj(_type, _id, _text, _newRow, _endRow, _fontWeight, _align, 
                         _colspan, _padding, _size, _no_left_margin, _on_blur, _required)
{
    this.v_type = _type;
	this.id = _id;
	this.text = _text;
	this.v_new_row = _newRow;
	this.v_end_row = _endRow;
	this.font_weight = _fontWeight;
	this.align = _align;
	this.colspan = _colspan;
	this.padding = _padding;
	this.size = _size;
	this.no_left_margin = _no_left_margin;
    this.on_blur = _on_blur;
	this.require = _required;
}

function UTM_formButtonObj(_id, _text, _align, _clickHandler)
{
    this.id = _id;
	this.text = _text;
	this.align = _align;
	this.onclick = _clickHandler;
}