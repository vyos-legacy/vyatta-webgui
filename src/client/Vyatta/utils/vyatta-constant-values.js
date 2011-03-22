/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

//////////////////////////////////////////////
// cookies property name
V_NOT_FOUND = 'NOTFOUND';
V_COOKIES_USER_NAME = 'userName';
V_COOKIES_USER_ID = 'id';
V_COOKIES_ISLOGIN = 'isLogin';      // yes/no/reboot/

//////////////////////////////////////////////
// cookies value
V_COOKIES_HELP_TIP_STATE = 'helpOnOff';
V_HELP_ON = 'helpOn';
V_HELP_OFF = 'helpOff';

///////////////////////////////////////////
// tree
V_TREE_ID_login = 'login';
V_TREE_ID_status = 'status';
V_TREE_ID_diag = 'diagnostics';
V_TREE_ID_config = 'configuration';
V_TREE_ID_config_data = "configDataMode"
V_TREE_ID_oper = 'operation'

///////////////////////////////////////////
// tree loader
V_TREE_LOAD_MODE_config = 'root_configuration';
V_TREE_LOAD_MODE_oper = 'root_operation';
V_TREE_LOAD_MODE_child = 'childNode';

V_LABEL_HELP = 'help';
V_LABEL_LABEL = 'label';


/////////////////////////////////////////////////
//
V_PAYLOAD_SIZE = 1120;
V_STATUS_UP = 'up';
V_STATUS_DOWN = 'down';
V_STATUS_UNKNOWN = 'unknown';

V_PREX_1 = 'The node has beeen ';
V_PROX_1 = ' but has not yet been committed."';

V_WAIT_CSS = 'x-btn-wrap x-btn x-btn-text-icon v_wait_image';
V_PAUSE_CSS = 'x-btn-wrap x-btn x-btn-text-icon v_pause_image';
V_STOP_CSS = 'x-btn-wrap x-btn x-btn-text';
V_IMG_ERR = "images/statusDown.gif";
V_IMG_DIRTY = "images/statusUnknown.gif";
V_IMG_DIRTY_DEL = "images/statusMinus.gif";
V_IMG_DIRTY_ADD = "images/statusPlus.gif";
V_IMG_DIRTY_ACT = "images/statusAct.gif";
V_IMG_DIRTY_DEACT = "images/statusDeact.gif";
V_IMG_DIRTY_ADD_ACT = "images/statusAddAct.gif";
V_IMG_DIRTY_ADD_DEACT = "images/statusAddDeact.gif";
V_IMG_DIRTY_DEL_ACT = "images/statusDelAct.gif";
V_IMG_DIRTY_DEL_DEACT = "images/statusDelDect.gif";
V_IMG_EMPTY = "images/empty.gif";

V_EMPTY_TITLE = 'title=""';
V_ERROR_TITLE = 'title="set configuration error"';
V_DF_TITLE = 'title="' + V_PREX_1 + 'modified' + V_PROX_1;
V_DF_TITLE_DEL = 'title="' + V_PREX_1 + 'deleted' + V_PROX_1;
V_DF_TITLE_ADD = 'title="' + V_PREX_1 + 'created' + V_PROX_1;
V_DF_TITLE_ACT = 'title="' + V_PREX_1 + 'activated' + V_PROX_1;
V_DF_TITLE_DEACT = 'title="' + V_PREX_1 + 'deactivated' + V_PROX_1;
V_DF_TITLE_ADD_ACT = 'title="' + V_PREX_1 + 'created and activated' + V_PROX_1;
V_DF_TITLE_ADD_DEACT = 'title="' + V_PREX_1 + 'created and deactivated' + V_PROX_1;
V_DF_TITLE_DEL_ACT = 'title="' + V_PREX_1 + 'deleted and activated' + V_PROX_1;
V_DF_TITLE_DEL_DEACT = 'title="' + V_PREX_1 + 'deleted and deactivated' + V_PROX_1;

V_DIRTY_FLAG = '<img ' + V_DF_TITLE + ' src="images/statusUnknown.gif" />';
V_DIRTY_FLAG_DEL = '<img ' + V_DF_TITLE_DEL + ' src="images/statusMinus.gif" />';
V_DIRTY_FLAG_ADD = '<img ' + V_DF_TITLE_ADD + ' src="images/statusPlus.gif" />';
V_DIRTY_FLAG_ACT = '<img ' + V_DF_TITLE_ACT + ' src="images/statusAct.gif" />';
V_DIRTY_FLAG_DEACT = '<img ' + V_DF_TITLE_DEACT + ' src="images/statusDeact.gif" />';
V_DIRTY_FLAG_ADD_ACT = '<img ' + V_DF_TITLE_ADD_ACT + ' created and activated" src="'+V_IMG_DIRTY_ADD_ACT+'" />';
V_DIRTY_FLAG_ADD_DEACT = '<img ' + V_DF_TITLE_ADD_DEACT + ' src="images/statusAddDeact.gif" />';
V_DIRTY_FLAG_DEL_ACT = '<img ' + V_DF_TITLE_DEL_ACT + ' src="'+V_IMG_DIRTY_DEL_ACT+'" />';
V_DIRTY_FLAG_DEL_DEACT = '<img ' + V_DF_TITLE_DEL_DEACT + ' src="images/statusDelDeact.gif" />';
V_EMPTY_FLAG = '<img ' + V_EMPTY_TITLE + ' src="images/empty.gif" width="13"/>';
V_HIDE_DIRTY_FLAG = '<img ' + V_EMPTY_TITLE + ' src="images/empty.gif" />';
V_ERROR_FLAG = '<img ' + V_ERROR_TITLE + ' src="images/statusDown.gif" />'


//////////////////////////////////////////
// editor inner field index
V_IF_INDEX_LABEL = 0;   // input label
V_IF_INDEX_INPUT = 1;   // input field
V_IF_INDEX_DIRTY = 2;   // dirty indicator
V_IF_INDEX_TIP = 3;     // tip

V_CONFIG_DIR = "/opt/vyatta/etc/config/";
