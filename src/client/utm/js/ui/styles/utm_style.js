/*
 Document   : utm_style.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: This is the dynamic style object.  
              The properties are used to style the elements at runtime
 */
if (typeof VYA == 'undefined') {
    VYA = {};
}

VYA.DYN_STYLE = {

	/////////// APPLICATION //////////////////////////////////
	//
	// General	
	APP_WIDTH : '980', 
	
	
	/////////// PRIMARY NAVIGATION //////////////////////////////////
	//
	// General
	PRI_NAV_ITEM_WIDTH : '120px',
//	PRI_NAV_ITEM_BORDER : '1px solid #CCC',	
	PRI_NAV_ITEM_BORDER : 'none',
	PRI_NAV_LAST_ITEM_BORDER_RIGHT : '1px solid #CCC',	
	PRI_NAV_ITEM_FONT_WEIGHT : 'bold',
	PRI_NAV_ITEM_TEXT_ALIGN : 'center',
//	PRI_NAV_ITEM_BG_IMG : 'url("images/tab_nav_base.PNG")',
	PRI_NAV_ITEM_BG_IMG : 'url("images/nav_end.PNG")',	
	LINER_THIN : '1px solid #DEDEDE',
	//
	// Active
	PRI_NAV_ACT_ITEM_BG_IMG : 'none',
	PRI_NAV_ACT_ITEM_COLOR : '#FF6600',
	PRI_NAV_ACT_ITEM_BORDER_BOTTOM : '0px solid #CCC',
	PRI_NAV_ACT_ITEM_BORDER_TOP : '1px solid #CCC',	
	PRI_NAV_ACT_ITEM_BORDER_LEFT : '1px solid #CCC',		
	PRI_NAV_ACT_ITEM_BG : '#FFFFFF',	
	//
	// Inactive
//	PRI_NAV_NOT_ACT_ITEM_BG_IMG : 'url("images/tab_nav_base.PNG")',
	PRI_NAV_NOT_ACT_ITEM_BG_IMG : 'url("images/nav_end.PNG")',	
	PRI_NAV_NOT_ACT_ITEM_COLOR : '#000000',
	PRI_NAV_NOT_ACT_ITEM_BORDER_BOTTOM : '0px solid #FFFFFF',
	PRI_NAV_NOT_ACT_ITEM_BORDER_TOP : '0px solid #FFFFFF',	
	PRI_NAV_NOT_ACT_ITEM_BORDER_LEFT : '0px solid #FFFFFF',		
	
	/////////// SECONDARY NAVIGATION ////////////////////////////////
	//
	// Active 
	SEC_NAV_ACT_ITEM_COLOR : '#FF5500',
	SEC_NAV_ACT_ITEM_FONT_WEIGHT : 'bold',	 
	//
	// Inactive
	SEC_NAV_NOT_ACT_ITEM_COLOR : '#000000',
	SEC_NAV_NOT_ACT_ITEM_FONT_WEIGHT : 'normal',
	//
	// hover
	SEC_NAV_HOVER_ITEM_COLOR : '#000000',
	SEC_NAV_HOVER_ITEM_FONT_WEIGHT : 'normal',	
	
	/////////// THIRD NAVIGATION ////////////////////////////////
	//
	// General
	THIRD_NAV_MARGIN_TOP : '1em',
	//
	// Active 
    THIRD_NAV_ACT_ITEM_COLOR : '#FF5500',
	THIRD_NAV_ACT_ITEM_FONT_WEIGHT : 'bold',
	THIRD_NAV_ACT_ITEM_IMG_SRC : 'images/fleche_on.gif',
	//
	// Inactive 
    THIRD_NAV_NOT_ACT_ITEM_COLOR : '#000000',
	THIRD_NAV_NOT_ACT_ITEM_FONT_WEIGHT : 'normal',
	THIRD_NAV_NOT_ACT_ITEM_IMG_SRC : 'images/fleche_off.gif'	
	
}
