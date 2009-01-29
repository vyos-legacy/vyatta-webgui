
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

#if !defined(_GNU_SOURCE)
#define _GNU_SOURCE
#endif

#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <assert.h>
#include <ctype.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <sys/wait.h>
#include <unistd.h>
#include <dirent.h>
#include <limits.h>
#include <stdarg.h>
#include <regex.h>
#include <dirent.h>

#include <string.h>

#include "cli_val_engine.h"


static int is_multi_node(clind_path_ref tmpl_path);

/*********************
 * Data definitions 
 *
 *********************/

/**
 * Special file names: 
 */
#define VALUE_FILE ("node.val")
#define NODE_TAG ("node.tag")
#define NODE_DEF ("node.def")

/**
 * "Command" definition (element of a variable path): 
 */

typedef struct {
  clind_cmd_type cmd_type;
  const char* text[10];
} cmd_parse_definition;

/**
 * Structure to hold information about possible command entries: 
 */

static cmd_parse_definition cmd_parse_definitions[] = {
  { CLIND_CMD_PARENT_VALUE, {"..","@",NULL } },
  { CLIND_CMD_NEIGHBOR,     {"..","*",NULL } },
  { CLIND_CMD_PARENT,       {"..",NULL } },
  { CLIND_CMD_PARENT,       {".","..",NULL } },
  { CLIND_CMD_CHILD,        {".","*",NULL } },
  { CLIND_CMD_VALUE,        {".","@",NULL } },
  { CLIND_CMD_SELF_NAME,    {".",NULL } },
  { CLIND_CMD_VALUE,        {"@",NULL } },
  { CLIND_CMD_MULTI_VALUE,  {"@@",NULL } },
  { CLIND_CMD_CHILD,        {"*",NULL } },
  { CLIND_CMD_UNKNOWN,      {NULL} }
};

/************************
 * Cmd utils forward declarations
 *
 ************************/

static int clind_path_shift_cmd(clind_path_ref path,clind_cmd *cmd);

/******************************
 * Variable evaluation engine *
 *                            *
 ******************************/

/**
 * For a given config path, return the 'value' of the path.
 * If the path ends with "node.val", then return the file content.
 * If not, then return the last path element.
 * If path is empty, or the file is empty, or the file does not exist,
 * then return NULL.
 * The user of this function is responsible for the memory deallocation.
 */

static char** clind_get_current_value(clind_path_ref cfg_path, 
				      clind_path_ref tmpl_path,
				      int check_existence,
				      vtw_type_e *val_type,
				      const char* root_tmpl_path,
				      int return_value_file_name,
				      int multi_value,
				      int *ret_size) {
  
  char** ret=NULL;
  int value_ref = 0;
  *ret_size=0;


  if (check_existence) {
    if (is_multi_node(tmpl_path)) {
      check_existence = FALSE;
    }
  }

  DPRINT("get_current_value cfg[%s] tmpl[%s] chkexist=%d\n",
         clind_path_get_path_string(cfg_path),
         clind_path_get_path_string(tmpl_path),
         check_existence);
  if(val_type) *val_type=TEXT_TYPE;
  
  if(cfg_path && (clind_path_get_size(cfg_path)>0)) {
    
    clind_path_ref tmpl_path_clone = clind_path_clone(tmpl_path);

    const char* cfg_path_string = clind_path_get_path_string(cfg_path);
    const char* cfg_end = clind_path_last_string(cfg_path);
    const char* tmpl_path_string = clind_path_get_path_string(tmpl_path_clone);
    const char* tmpl_end = clind_path_last_string(tmpl_path_clone);

    /*
    printf("%s:111.111:%s:%s:%s:%s:%d\n",__FUNCTION__,
	   cfg_path_string,
	   cfg_end,
	   tmpl_path_string,
	   tmpl_end,
	   multi_value);
    */

    if(cfg_path_string && cfg_end) {

      if(strcmp(cfg_end,VALUE_FILE)==0) {

	/* Value reference: */
        value_ref = 1;

	if(return_value_file_name) {
	  
	  ret=(char**)realloc(ret,sizeof(char*)*1);
	  ret[0]=strdup(cfg_path_string);
	  *ret_size=1;

	} else {

	  FILE* f = fopen(cfg_path_string,"r");
	  if(f) {
	    char buffer[8193];
	    if(multi_value) {
	      while(fgets(buffer, sizeof(buffer)-1,f)) {
		int len=strlen(buffer);
		while(len>0 && (buffer[len-1]==10 || buffer[len-1]==13)) {
		  buffer[len-1]=0;
		  len--;
		}
		if(len>0) {
		  ret=(char**)realloc(ret,sizeof(char*)*(*ret_size+1));
		  ret[*ret_size]=strdup(buffer);
		  *ret_size+=1;
		}
	      }
	    } else {
	      int sz = fread(buffer, 1, sizeof(buffer)-1, f);
	      if(sz>0) {
		int len=0;
		buffer[sz]=0;
		len=strlen(buffer);
		while(len>0 && (buffer[len-1]==10 || buffer[len-1]==13)) {
		  buffer[len-1]=0;
		  len--;
		}
		ret=(char**)malloc(sizeof(char*)*1);
		ret[0]=strdup(buffer);
		*ret_size=1;
	      }
	    }
	    fclose(f);
	  }
	}

      } else if(return_value_file_name) {

	ret=(char**)realloc(ret,sizeof(char*)*1);
	ret[0]=(char*)malloc(strlen(cfg_path_string)+1+strlen(VALUE_FILE)+1);
	strcpy(ret[0],cfg_path_string);
	strcpy(ret[0]+strlen(ret[0]),"/");
	strcpy(ret[0]+strlen(ret[0]),VALUE_FILE);
	*ret_size=1;
	
      } else {

	struct stat    statbuf;

	/* Directory reference: */

	if(!check_existence || (lstat(cfg_path_string, &statbuf) == 0)) {
	  ret=(char**)realloc(ret,sizeof(char*)*1);
	  ret[0]=clind_unescape(cfg_end);
	  *ret_size=1;
	} else {
          /* we are checking existence, and it doesn't exist */
          /* return empty string */
	  ret = (char**) realloc(ret, (sizeof(char *) * 1));
	  ret[0] = malloc(1);
          ret[0][0] = 0;
          *ret_size = 1;
        }
      }
	
      if(ret) {  
	if(tmpl_end && (strcmp(tmpl_end,NODE_TAG)==0)) {
          /* since it's a tag, it should be treated as a value */
          value_ref = 1;
	  clind_path_pop(tmpl_path_clone);
	  tmpl_path_string = clind_path_get_path_string(tmpl_path_clone);
	  tmpl_end = clind_path_last_string(tmpl_path_clone);
	}
      }
	  
      if(ret && tmpl_path_string && value_ref && !return_value_file_name) {
	  
	vtw_def def;
	struct stat    statbuf;
	int fn_node_def_size=strlen(tmpl_path_string)+1+strlen(NODE_DEF)+1;
	char* fn_node_def=(char*)malloc(fn_node_def_size);

	memset(&def, 0, sizeof(def));

	fn_node_def[0]=0;

	if(*tmpl_path_string!='/' && root_tmpl_path) {
	  fn_node_def_size+=strlen(root_tmpl_path+1);
	  fn_node_def=(char*)realloc(fn_node_def,fn_node_def_size);
	  strcpy(fn_node_def+strlen(fn_node_def),root_tmpl_path);
	  strcpy(fn_node_def+strlen(fn_node_def),"/");
	}

	strcpy(fn_node_def+strlen(fn_node_def),tmpl_path_string);
	strcpy(fn_node_def+strlen(fn_node_def),"/");
	strcpy(fn_node_def+strlen(fn_node_def),NODE_DEF);

	if ((lstat(fn_node_def, &statbuf) == 0)&&
	    (parse_def(&def, fn_node_def, TRUE)==0)) {

	  if(def.def_type != ERROR_TYPE) {

	    int status=0;
	    valstruct res;
	    int i=0;
	    
	    memset(&res,0,sizeof(res));
	    
	    for(i=0;i<*ret_size;i++) {
	      
	      if(ret[i]) {
		
		/* return the value in the correct type */
		status = char2val(&def, ret[i], &res);
		
		if(status==0) {
		  
		  if(val_type) *val_type=res.val_type;
		  
		  if(res.free_me && res.val) {
		    free(ret[i]);
		    ret[i]=res.val;
		  }
		} else {
		  /* Bad value ? */
		}
	      }
	    }
	  }

	} else {
	  
	  while(*ret_size>0) {
	    if(ret[*ret_size-1]) {
	      free(ret[*ret_size-1]);
	    }
	    *ret_size-=1;
	  }
	  free(ret);
	  ret=NULL;
	  
	}

	free(fn_node_def);
      }
    }

    clind_path_destruct(&tmpl_path_clone);
  }

  return ret;
}

/**
 * Return TRUE if current node is a multi-node value
 */
static int is_multi_node(clind_path_ref tmpl_path) {

  int ret=0;

  if(tmpl_path) {

    const char* t_end = clind_path_last_string(tmpl_path);

    if(t_end && (strcmp(t_end,NODE_TAG)==0)) {
      ret=1;
    }
  }

  return ret;
}

/**
 * Return TRUE if current node is node.def
 */
static int is_node_def(clind_path_ref tmpl_path) {

  int ret=0;

  if(tmpl_path) {

    const char* t_end = clind_path_last_string(tmpl_path);

    if(t_end && (strcmp(t_end,NODE_DEF)==0)) {
      ret=1;
    }
  }

  return ret;
}

/**
 * Apply a single command to the configuration path.
 * cfg_path - absolute configuration path,
 * tmpl_path - logical template path,
 * cmd - single reference command from the variable path.
 * The result is the array of "derived" paths.
 * result_len output parameter contains the array size.
 */

static clind_path_ref* clind_config_engine_apply_command(clind_path_ref cfg_path,
							 clind_path_ref tmpl_path,
							 clind_cmd *cmd,
							 int *result_len) {
  clind_path_ref* ret=NULL;

  DPRINT("eng_apply_cmd cfg=[%s] tmpl=[%s] type=%d\n",
         clind_path_get_path_string(cfg_path),
         clind_path_get_path_string(tmpl_path), cmd->type);
  if(cfg_path && tmpl_path && result_len && cmd) {
    
    /*
    printf("%s:111.111:%s:%s:%d\n",__FUNCTION__,
	   clind_path_get_path_string(cfg_path),
	   clind_path_get_path_string(tmpl_path),
	   cmd->type);
    */

    switch (cmd->type) {

    case CLIND_CMD_PARENT:

      {
	*result_len=1;
	ret=(clind_path_ref*)(malloc(*result_len * sizeof(clind_path_ref)));
	cfg_path = clind_path_clone(cfg_path);
	ret[0]=cfg_path;
	
	if(is_multi_node(tmpl_path)) {
	  clind_path_pop(cfg_path);
	  clind_path_pop(tmpl_path);
	} else if(is_node_def(tmpl_path)) {
	  clind_path_pop(tmpl_path);
	}
	
	clind_path_pop(cfg_path);
	clind_path_pop(tmpl_path);
	
	if(is_multi_node(tmpl_path)) {
	  clind_path_pop(cfg_path);
	  clind_path_pop(tmpl_path);
	}
      }
 
      break;

    case CLIND_CMD_SELF_NAME:

      {
	*result_len=1;
	ret=(clind_path_ref*)(malloc(*result_len * sizeof(clind_path_ref)));
	cfg_path = clind_path_clone(cfg_path);
	ret[0]=cfg_path;

	if(is_multi_node(tmpl_path)) {
	  clind_path_pop(cfg_path);
	  clind_path_pop(tmpl_path);
	} else if(is_node_def(tmpl_path)) {
	  clind_path_pop(tmpl_path);
	}
      }

      break;

    case CLIND_CMD_CHILD:

      {
	*result_len=1;
	ret=(clind_path_ref*)(malloc(*result_len * sizeof(clind_path_ref)));
	cfg_path = clind_path_clone(cfg_path);
	ret[0]=cfg_path;
	
	clind_path_push(cfg_path,cmd->value);
	clind_path_push(tmpl_path,cmd->value);
      }
      break;

    case CLIND_CMD_NEIGHBOR:

      {
	*result_len=1;
	ret=(clind_path_ref*)(malloc(*result_len * sizeof(clind_path_ref)));
	cfg_path = clind_path_clone(cfg_path);
	ret[0]=cfg_path;

	if(is_multi_node(tmpl_path)) {
	  clind_path_pop(cfg_path);
	  clind_path_pop(tmpl_path);
	} else if(is_node_def(tmpl_path)) {
	  clind_path_pop(tmpl_path);
	}
	
	clind_path_pop(cfg_path);
	clind_path_pop(tmpl_path);
	
	clind_path_push(cfg_path,cmd->value);
	clind_path_push(tmpl_path,cmd->value);
      }

      break;

    case CLIND_CMD_VALUE:

      {
	const char* t_path_string = clind_path_get_path_string(tmpl_path);
	const char* t_end = clind_path_last_string(tmpl_path);
	const char* c_end = clind_path_last_string(cfg_path);

	*result_len=1;
	ret=(clind_path_ref*)(malloc(*result_len * sizeof(clind_path_ref)));
	cfg_path = clind_path_clone(cfg_path);
	ret[0]=cfg_path;

	if(t_end && (strcmp(t_end,NODE_TAG)==0)) {
	  /* do nothing, we are there already */
	} else if(t_path_string && clind_file_exists(t_path_string,NODE_TAG)) {
	  clind_path_push(tmpl_path,NODE_TAG);
	} else if(c_end && (strcmp(c_end,VALUE_FILE)==0)) {
	  /* do nothing, we are there already */
	} else {
	  clind_path_push(cfg_path,VALUE_FILE);
	}
      }

      break;

    case CLIND_CMD_PARENT_VALUE:

      {
	*result_len=1;
	ret=(clind_path_ref*)(malloc(*result_len * sizeof(clind_path_ref)));
	cfg_path = clind_path_clone(cfg_path);
	ret[0]=cfg_path;

	if(is_multi_node(tmpl_path)) {
	  clind_path_pop(cfg_path);
	  clind_path_pop(tmpl_path);
	} else if(is_node_def(tmpl_path)) {
	  clind_path_pop(tmpl_path);
	}
	
	clind_path_pop(cfg_path);
	clind_path_pop(tmpl_path);
      }

      break;

    case CLIND_CMD_MULTI_VALUE:

      {
	const char* cfg_path_string = NULL;

	if(is_multi_node(tmpl_path)) {
	  clind_path_pop(cfg_path);
	  clind_path_pop(tmpl_path);
	} else if(is_node_def(tmpl_path)) {
	  clind_path_pop(tmpl_path);
	}

	cfg_path_string = clind_path_get_path_string(cfg_path);

	if(cfg_path_string) {

	  const char* c_end = clind_path_last_string(cfg_path);

	  if(c_end && (strcmp(c_end,VALUE_FILE)==0)) {

	    *result_len=1;
	    ret=(clind_path_ref*)(malloc(*result_len * sizeof(clind_path_ref)));
	    cfg_path = clind_path_clone(cfg_path);
	    ret[0]=cfg_path;

	  } else if(clind_file_exists(cfg_path_string,VALUE_FILE)) {

	    *result_len=1;
	    ret=(clind_path_ref*)(malloc(*result_len * sizeof(clind_path_ref)));
	    cfg_path = clind_path_clone(cfg_path);
	    ret[0]=cfg_path;

	    clind_path_push(cfg_path,VALUE_FILE);

	  } else {
	  
	    DIR* dir=NULL;

	    dir = opendir(cfg_path_string);

	    if(dir) {
	      
	      *result_len=0;
	      
	      ret=(clind_path_ref*)(malloc(*result_len * sizeof(clind_path_ref)));
	      
	      do {
		struct dirent *de = readdir(dir);
		
		if(!de) break;
		else if(de->d_name[0] && de->d_name[0]!='.') {
		  clind_path_ref cfg_path_1 = clind_path_clone(cfg_path);
		  clind_path_push(cfg_path_1,de->d_name);
		  (*result_len)++;
		  ret=(clind_path_ref*)(realloc(ret,*result_len * sizeof(clind_path_ref)));
		  ret[*result_len-1]=cfg_path_1;
		}
	      } while(1);
	      
	      clind_path_push(tmpl_path,NODE_TAG);
	    
	      closedir(dir);
	    }
	  }
	}
      }
      break;

    default:
      ;
    }
  }

  return ret;
}

/**
 * cfg_path - absolute configuration path,
 * tmpl_path - logical template path,
 * cmd_path - variable command path.
 */

int clind_config_engine_apply_command_path(clind_path_ref cfg_path_orig,
					   clind_path_ref tmpl_path_orig,
					   clind_path_ref cmd_path,
					   int check_existence,
					   clind_val* res,
					   const char* root_cfg_path,
					   const char* root_tmpl_path,
					   int return_value_file_name) {

  int ret=-1;
  
  /*
  printf("%s:111.111:cfg_path=%s,tmpl_path=%s,cmd_path=%s,rtp=%s\n",__FUNCTION__,
	 clind_path_get_path_string(cfg_path_orig),
	 clind_path_get_path_string(tmpl_path_orig),
	 clind_path_get_path_string(cmd_path),
	 root_tmpl_path);
  */
  DPRINT("eng_apply_cmd_path cfg=[%s] tmpl=[%s] cmd=[%s] "
         "rcfg=[%s] rtmpl=[%s]\n",
         clind_path_get_path_string(cfg_path_orig),
         clind_path_get_path_string(tmpl_path_orig),
         clind_path_get_path_string(cmd_path),
         root_cfg_path, root_tmpl_path);

  if(cfg_path_orig && tmpl_path_orig && cmd_path && res) {

    /* Command to be processed: */
    clind_cmd cmd;

    /* Array of configuration pointers. Initially, contains only one 
       element - cfg_path. */
    clind_path_ref* config_paths=
      (clind_path_ref*)malloc(sizeof(clind_path_ref)*1);

    /* Size of the array (initially - just one): */
    int config_paths_size=1;

    /* Clone the input paths to preserve the input objects intact: */
    clind_path_ref tmpl_path=NULL;
    clind_path_ref cfg_path=NULL;

    if(clind_path_is_absolute(cmd_path)) {
      tmpl_path=clind_path_construct(root_tmpl_path);
      if(!tmpl_path) {
	return -1;
      }
      cfg_path=clind_path_construct(root_cfg_path);
      if(!cfg_path) {
	return -1;
      }
    } else {
      cfg_path=clind_path_clone(cfg_path_orig);
      tmpl_path=clind_path_clone(tmpl_path_orig);
    }

    res->value=NULL;
    res->val_type=TEXT_TYPE;

    /* Set the initial array content: */
    config_paths[0]=cfg_path;

    /* Apply the commands one-by-one: */
    while(clind_path_get_size(cmd_path)>0 && 
	  (clind_path_shift_cmd(cmd_path,&cmd)==0)) {

      int i=0;

      /* Temporary array to keep the config paths for the next 
	 command application: */
      clind_path_ref* new_config_paths=NULL;
      int new_config_paths_size=0;

      /* This path contains the template path at the beginning
	 of the cycle: */
      clind_path_ref tmpl_path_curr=clind_path_clone(tmpl_path);

      for (i=0;i<config_paths_size;i++) {

	int size=0;

	clind_path_ref* new_config_paths_1=NULL;

	if(i==0) {
	  new_config_paths_1=
	    clind_config_engine_apply_command(config_paths[i],
					      tmpl_path,
					      &cmd,
					      &size);
	} else {
	  clind_path_ref tmpl_path_curr_clone=clind_path_clone(tmpl_path_curr);
	  new_config_paths_1=
	    clind_config_engine_apply_command(config_paths[i],
					      tmpl_path_curr_clone,
					      &cmd,
					      &size);
	  clind_path_destruct(&tmpl_path_curr_clone);
	}

	if(new_config_paths_1) {

	  int j=0;

	  for(j=0;j<size;j++) {
	    if(new_config_paths_1[j]) {
	      new_config_paths_size++;
	      new_config_paths=
		(clind_path_ref*)realloc(new_config_paths,
					  sizeof(clind_path_ref)*
					  new_config_paths_size);
	      new_config_paths[new_config_paths_size-1]=new_config_paths_1[j];
	    }
	  }

	  free(new_config_paths_1);
	}

	clind_path_destruct(&(config_paths[i]));
      }

      free(config_paths);
      config_paths=new_config_paths;
      config_paths_size=new_config_paths_size;
      clind_path_destruct(&tmpl_path_curr);
    }

    if(config_paths) {
      
      char** sarr=NULL;
      int sarrlen=0;
	  
      vtw_type_e val_type=TEXT_TYPE;
      
      int i=0;

      for(i=0;i<config_paths_size;i++) {

	if(config_paths[i]) {

	  int vallen=0;
	  char** valarr=clind_get_current_value(config_paths[i],
						tmpl_path,
						check_existence,
						&val_type,
						root_tmpl_path,
						return_value_file_name,
						/*Last command: */
						(cmd.type==CLIND_CMD_MULTI_VALUE),
						&vallen);

	  clind_path_destruct(&config_paths[i]);

	  if(valarr) {
	    
	    int k=0;
   
            /* set the type */
            res->val_type = val_type;

	    for(k=0;k<vallen;k++) {

	      char* s=valarr[k];

	      if(s) {

		/* search if we already have it: */
		int j=0;
		for(j=0;j<sarrlen;j++) {
		  if(!strcmp(sarr[j],s)) {
		    break;
		  }
		}
	    
		if(j<sarrlen) {
		  free(s);
		} else {
		  sarrlen++;
		  sarr=(char**)realloc(sarr,sizeof(char*)*sarrlen);
		  sarr[sarrlen-1]=s;
		}
	      }
	    }
	    free(valarr);
	  }
	}
      }

      free(config_paths);

      if(sarr) {
	
	ret=0;

	if(sarrlen==1) {

	  res->value=sarr[0];

	} else {
	
	  for(i=0;i<sarrlen;i++) {
	  
	    if(sarr[i]) {

	      char* s = clind_quote(sarr[i]);
	      
	      free(sarr[i]);
	      sarr[i]=NULL;
	  
	      if(s) {
	    
		if(!res->value) {

		  res->value=s;
		  
		} else if(res->value[0]==0) {
		  
		  free(res->value);
		  res->value=s;
		  
		} else {
		  
		  res->value=(char*)realloc(res->value,
					    strlen(res->value)+1+strlen(s)+1);
		  
		  strcpy(res->value+strlen(res->value)," ");
		  strcpy(res->value+strlen(res->value),s);
		  
		  free(s);
		}
	      }
	    }
	  }
	}
	free(sarr);
      }
    }

    clind_path_destruct(&cmd_path);
    clind_path_destruct(&cfg_path);
    clind_path_destruct(&tmpl_path);
  }

  return ret;
}

/******************************
 * Cmd utils. 
 *
 ******************************/

static int clind_path_shift_cmd(clind_path_ref path,clind_cmd *cmd) {

  int ret=-1;

  if(cmd) {
    
    cmd->type = CLIND_CMD_UNKNOWN;
    cmd->value[0]=0;

    if(path && clind_path_get_size(path)>0) {
      
      int i=0;
      int done=0;
      
      while(cmd_parse_definitions[i].text!=NULL && cmd_parse_definitions[i].text[0]!=NULL) {

	int j=0;

	while(cmd_parse_definitions[i].text[j]) {
	  const char* str = clind_path_get_string(path,j);
	  if(str) {
	    if(!strcmp(cmd_parse_definitions[i].text[j],"*")) {
	      if(*str!='.' && *str!='@') {
		j++;
		strncpy(cmd->value,str,sizeof(cmd->value)-1);
		continue;
	      }
	    } else if(!strcmp(cmd_parse_definitions[i].text[j],str)) {
	      j++;
	      strncpy(cmd->value,str,sizeof(cmd->value)-1);
	      continue;
	    }
	  }
	  j=0;
	  break;
	}
	
	if(j<1) {
	  i++;
	  continue;
	} else {
	  done=1;
	}
	
	cmd->type = cmd_parse_definitions[i].cmd_type;
	
	while(j) {
	  clind_path_shift(path);
	  j--;
	}
	
	break;
      }
      
      if(done) {
	ret=0;
      }
    }
  }

  return ret;
}

