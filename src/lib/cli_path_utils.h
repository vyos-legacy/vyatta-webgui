
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
 Description: "new" cli path-handling utilities
 
 **** End License ****

*************************************************************************/ 

#if !defined(__CLI_PATH_UTILS__)
#define __CLI_PATH_UTILS__

/*******************
 * Type definitions
 *
 *******************/

typedef struct _clind_path_impl clind_path_impl;
typedef clind_path_impl* clind_path_ref;

/************************
 * Path utils
 *
 ************************/

clind_path_ref clind_path_construct(const char* path);
void clind_path_destruct(clind_path_ref* path);
clind_path_ref clind_path_clone(const clind_path_ref path);

int clind_path_get_size(clind_path_ref path);
const char* clind_path_get_path_string(clind_path_ref path);
void clind_path_debug_print(clind_path_ref path);
int clind_path_is_absolute(clind_path_ref path);

int clind_path_pop(clind_path_ref path);
char* clind_path_pop_string(clind_path_ref path);
const char* clind_path_last_string(clind_path_ref path);
void clind_path_push(clind_path_ref path,const char* dir);

int clind_path_shift(clind_path_ref path);
char* clind_path_shift_string(clind_path_ref path);
const char* clind_path_get_string(clind_path_ref path,int index);
const char* clind_path_first_string(clind_path_ref path);
void clind_path_unshift(clind_path_ref path,const char* dir);

int clind_file_exists(const char* dir,const char* file);

char *clind_unescape(const char *name);
char* clind_quote(const char* s);

#endif /* __CLI_PATH_UTILS__ */
