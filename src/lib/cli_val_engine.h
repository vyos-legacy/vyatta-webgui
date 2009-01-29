
/************************************************************************

 Module: cli
 
 **** License ****
 This program is free software; you can redistribute it and/or modify
 it under the terms of the GNU General Public License version 2 as
 published by the Free Software Foundation.

 This program is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 General Public License for more details.

 A copy of the GNU General Public License is available as
 `/usr/share/common-licenses/GPL' in the Debian GNU/Linux distribution
 or on the World Wide Web at `http://www.gnu.org/copyleft/gpl.html'.
 You can also obtain it by writing to the Free Software Foundation,
 Free Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston,
 MA 02110-1301, USA.
 
 This code was originally developed by Vyatta, Inc.
 Portions created by Vyatta are Copyright (C) 2007 Vyatta, Inc.
 All Rights Reserved.
 
 Author: Oleg Moskalenko
 Date: 2007
 Description: "new" cli handler for the reference variables
 
 **** End License ****

*************************************************************************/ 

#if !defined(__CLI_VAL_ENGINE__)
#define __CLI_VAL_ENGINE__

#include "cli_path_utils.h"
#include "cli_val.h"

/*******************
 * Type definitions
 *
 *******************/

typedef enum {

  CLIND_CMD_UNKNOWN=0,               /* ??? */
  CLIND_CMD_PARENT,                  /* .. */
  CLIND_CMD_SELF_NAME,               /* . */
  CLIND_CMD_CHILD,                   /* <name> */
  CLIND_CMD_NEIGHBOR,                /* ../<name> */
  CLIND_CMD_VALUE,                   /* @ */
  CLIND_CMD_PARENT_VALUE,            /* ../@ */
  CLIND_CMD_MULTI_VALUE              /* @@ */

} clind_cmd_type;

typedef struct {

  clind_cmd_type type;
  char value[1025];

} clind_cmd;

typedef struct {

  vtw_type_e val_type;
  char* value;

} clind_val;  

/********************************
 * Main command-handling method:
 *
 ********************************/

int clind_config_engine_apply_command_path(clind_path_ref cfg_path,
					   clind_path_ref tmpl_path,
					   clind_path_ref cmd_path,
					   int check_existence,
					   clind_val *res,
					   const char* root_cfg_path,
					   const char* root_tmpl_path,
					   int return_value_file_name);




#endif /* __CLI_VAL_ENGINE__*/
