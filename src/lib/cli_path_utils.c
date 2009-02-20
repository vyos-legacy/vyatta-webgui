
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

#include "cli_path_utils.h"
#include "cli_val.h"

/*********************
 * Data definitions 
 *
 *********************/

typedef char* clind_dir_name;

/**
 * Definition of the path structure to hold all path-like information: 
 */

struct _clind_path_impl {

  int absolute;
  int path_len;
  char* path_string;
  clind_dir_name* path;

};

/******************************
 * Path utils. We use them 
 * to manipulate the path-like 
 * structures.
 *
 ******************************/

static void clind_reset_path_string(clind_path_impl* obj) {

  char* newpath=NULL;

  if(obj->path_len<1) {

    newpath=strdup("");

  } else {
    
    int i=0;
    
    if(!obj->absolute || (strlen(obj->path[0])>0 && ((char*)(obj->path[0]))[0]=='/')) {
      newpath=strdup(obj->path[0]);
    } else {
      newpath=(char*)malloc(strlen(obj->path[0])+1+1);
      newpath[0]='/';
      strcpy(newpath+1,(char*)(obj->path[0]));
    }
    
    for(i=1;i<obj->path_len;i++) {
      newpath=(char*)realloc(newpath,strlen(newpath)+1+strlen(obj->path[i])+1);
      strcpy(newpath+strlen(newpath),"/");
      strcpy(newpath+strlen(newpath),obj->path[i]);
    }
  }

  if(obj->path_string==NULL) {
    obj->path_string=newpath;
  } else {
    obj->path_string=(char*)realloc(obj->path_string,strlen(newpath)+1);
    strcpy(obj->path_string,newpath);
    free(newpath);
  }
}

clind_path_ref clind_path_construct(const char* path) {

  if(!path) return NULL;
  else {

    const char* delim="/ \t";

    clind_path_impl *obj = (clind_path_impl*)malloc(sizeof(clind_path_impl));
    char* tokpath=strdup(path);
    char* token=strtok(tokpath,delim);

    obj->path_len=0;
    obj->path_string=strdup("");
    obj->path=NULL;

    while(token) {
      clind_path_push((clind_path_ref)obj,token);
      token=strtok(NULL,delim);
    }

    free(tokpath);

    obj->absolute=(*path=='/');

    clind_reset_path_string(obj);

    return (clind_path_ref)obj;
  }
}

void clind_path_destruct(clind_path_ref* path) {

  if(path && *path) {

    clind_path_impl* obj = (clind_path_impl*)(*path);

    if(obj->path_string) {
      free(obj->path_string);
      obj->path_string=NULL;
    }

    if(obj->path) {
      while(obj->path_len>0) {
	char* dir_name = (char*)(obj->path[obj->path_len-1]);
	if(dir_name) {
	  free(dir_name);
	}
	obj->path_len--;
      }
      free(obj->path);
      obj->path=0;
    }

    *path=0;
  }
}

clind_path_ref clind_path_clone(const clind_path_ref path) {

  clind_path_ref ret=NULL;
  if(path) {

    clind_path_impl* obj = (clind_path_impl*)path;

    ret = clind_path_construct(obj->path_string);

    if(ret) {

      ((clind_path_impl*)ret)->absolute=obj->absolute;

      clind_reset_path_string((clind_path_impl*)ret);
    }
  }

  return ret;
}

int clind_path_get_size(clind_path_ref path) {
  if(path) {
    clind_path_impl* obj = (clind_path_impl*)path;
    return obj->path_len;
  }
  return 0;
}

const char* clind_path_get_path_string(clind_path_ref path) {
  if(path) {
    clind_path_impl* obj = (clind_path_impl*)path;
    if(obj->path_string) {
      return obj->path_string;
    }
  }
  return "";
}

int clind_path_is_absolute(clind_path_ref path) {
  if(path) {
    clind_path_impl* obj = (clind_path_impl*)path;
    return obj->absolute;
  }
  return 0;
}

void clind_path_push(clind_path_ref path,const char* dir) {

  if(path && dir && *dir) {

    clind_path_impl* obj = (clind_path_impl*)path;
    int absolute=(*dir=='/');

    while(*dir && *dir=='/') dir++;

    if(obj->path_len<=0) {

      obj->path_len=1;
      obj->absolute=absolute;

      if(obj->path) {
	free(obj->path);
      }

      obj->path=(clind_dir_name*)malloc(sizeof(clind_dir_name));
      obj->path[0]=(clind_dir_name)strdup(dir);

    } else {

      obj->path_len++;

      obj->path=(clind_dir_name*)realloc(obj->path,
					 sizeof(clind_dir_name)*(obj->path_len));
      obj->path[obj->path_len-1]=strdup(dir);
    }

    clind_reset_path_string(obj);
  }
}

char* clind_path_pop_string(clind_path_ref path) {

  char* ret=NULL;

  if(path) {

    clind_path_impl* obj = (clind_path_impl*)path;

    if(obj->path_len<=0) {
      return ret;
    }

    obj->path_len--;

    if(obj->path) {
      if(obj->path[obj->path_len]) {
	ret = obj->path[obj->path_len];
	obj->path[obj->path_len]=NULL;
      }
    }

    if(obj->path_len<1) {
      obj->absolute=0;
    }

    clind_reset_path_string(obj);
  }

  return ret;
}

int clind_path_pop(clind_path_ref path) {

  int ret=-1;

  char* ps = clind_path_pop_string(path);

  if(ps) {
    free(ps);
    ret=0;
  }

  return ret;
}

const char* clind_path_last_string(clind_path_ref path) {

  char* ret=NULL;

  if(path) {
    clind_path_impl* obj = (clind_path_impl*)path;
    if(obj->path && obj->path_len>0) {
      ret=obj->path[obj->path_len-1];
    }
  }

  return ret;
}

void clind_path_unshift(clind_path_ref path,const char* dir) {

  if(path && dir && *dir) {

    clind_path_impl* obj = (clind_path_impl*)path;

    int absolute=(*dir=='/');

    while(*dir && *dir=='/') dir++;

    if(obj->path_len<=0) {

      clind_path_push(path,dir);

    } else {

      obj->path_len++;

      obj->path=(clind_dir_name*)realloc(obj->path,
					 sizeof(clind_dir_name)*(obj->path_len));
      memmove((char*)(obj->path)+sizeof(clind_dir_name),(char*)(obj->path),
	      sizeof(clind_dir_name)*(obj->path_len-1));
      obj->path[0]=strdup(dir);

    }

    obj->absolute=absolute;

    clind_reset_path_string(obj);
  }
}

const char* clind_path_get_string(clind_path_ref path,int index) {

  const char* ret=NULL;

  if(path) {
    clind_path_impl* obj = (clind_path_impl*)path;
    if(obj->path && obj->path_len>index) {
      ret=obj->path[index];
    }
  }

  return ret;
}

const char* clind_path_first_string(clind_path_ref path) {
  return clind_path_get_string(path,0);
}

char* clind_path_shift_string(clind_path_ref path) {

  char* ret=NULL;

  if(path) {

    clind_path_impl* obj = (clind_path_impl*)path;

    if(obj->path_len<=0) {
      return ret;
    }

    obj->path_len--;

    if(obj->path) {
      if(obj->path[0]) {
	ret = obj->path[0];
	obj->path[0]=NULL;
      }

      memmove((char*)(obj->path),(char*)(obj->path)+sizeof(clind_dir_name),
	      sizeof(clind_dir_name)*obj->path_len);
    }

    obj->absolute=0;

    clind_reset_path_string(obj);
  }

  return ret;
}

int clind_path_shift(clind_path_ref path) {

  int ret=-1;

  char* ps = clind_path_shift_string(path);

  if(ps) {
    free(ps);
    ret=0;
  }

  return ret;
}

void clind_path_debug_print(clind_path_ref path) {

  if(path) {

    int i=0;
    clind_path_impl* obj = (clind_path_impl*)path;

    if(obj->path_string) {
      printf("obj->path_string=%s, obj->path_len=%d,obj->absolute=%d\n",
	     obj->path_string,obj->path_len,obj->absolute);
    } else {
      printf("obj->path_string=NULL, obj->path_len=%d,obj->absolute=%d\n",
	     obj->path_len,obj->absolute);
    }

    if(obj->path) {
      for(i=0;i<obj->path_len;i++) {
	if(obj->path[i]) {
	  printf("  obj->path[%d]=%s\n",i,obj->path[i]);
	} else {
	  printf("  obj->path[%d]=NULL\n",i);
	}
      }
    } else {
      printf("  obj->path=NULL\n");
    }
  }
}

int clind_file_exists(const char* dir,const char* file) {

  int ret=0;

  if(file) {

    char* fname=strdup(file);
    struct stat    statbuf;

    if(dir) {
      free(fname);
      fname=(char*)malloc(strlen(dir)+1+strlen(file)+1);
      strcpy(fname,dir);
      strcpy(fname+strlen(fname),"/");
      strcpy(fname+strlen(fname),file);
    }

    if (lstat(fname, &statbuf) == 0) {
      ret=1;
    }

    free(fname);
  }

  return ret;
}

char *clind_unescape(const char *name)
{
  const char *cp;
  char *rcp, *ret;
  char len;
  
  for(cp=name, len=0;*cp;++cp, ++len)
    if(*cp=='%')
      cp +=2;
  rcp = ret = malloc(len+1);
  for(cp=name, len=0;*cp;++cp, ++rcp)
    if(*cp=='%') {
      ++cp;
      if (*cp >='a' && *cp<='f')
	*rcp = (*cp-'a'+10)*16;
      else if (*cp >='A' && *cp<='F')
	*rcp = (*cp-'A'+10)*16;
      else if (*cp >='0' && *cp<='9')
	*rcp = (*cp-'0')*16;
      else {
	bye("Bad escape in |%s|\n", name);
      }
      ++cp;
      if (*cp >='a' && *cp<='f')
	*rcp += (*cp-'a'+10);
      else if (*cp >='A' && *cp<='F')
	*rcp += (*cp-'A'+10);
      else if (*cp >='0' && *cp<='9')
	*rcp += (*cp-'0');
      else {
	bye("Bad escape in |%s|\n", name);
      }
    }else
      *rcp = *cp;
  *rcp = 0;
  return ret;
}

char* clind_quote(const char* s) {

  char* ret=NULL;
  if(s) {
    int i=0;
    int len=strlen(s);
    int sz=0;
    char SQ='\'';

    ret=(char*)malloc(1+5*len+1+1+10);
    ret[sz++]=SQ;
    
    for(i=0;i<len;i++) {
      if(s[i]==SQ) {
	ret[sz++]=SQ;/*'\''*/
	ret[sz++]='\\';
	ret[sz++]=SQ;
	ret[sz++]=SQ;
      } else {
	ret[sz++]=s[i];
      }
    }

    ret[sz++]=SQ;
    ret[sz]=0;
  }
  return ret;
}

      
