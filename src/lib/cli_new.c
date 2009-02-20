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
#include "cli_val.h"
#include "cli_parse.h"
#include <regex.h>
#include <errno.h>
#include <time.h>
#include <utime.h>

#include "cli_objects.h"
#include "cli_val_engine.h"

/* Defines: */

#define EXE_STRING_DELTA 512
#define PATH_DELTA 1000
#define ENDS_ALLOC 20
/* mcd vs. ccd location
   change when m_root changed */
#define PATH_CM_LOCATION 25

#define VAR_REF_MARKER "$VAR("
#define VAR_REF_MARKER_LEN 5

/* Global vars: */
vtw_path m_path, t_path;

/* Local vars: */
static vtw_node *vtw_free_nodes; /* linked via left */
static char val_name[] = VAL_NAME;
static int cond1[TOP_COND] ={5, 0,-1,-1, 0, 1, 0, 0};
static int cond2[TOP_COND] ={5, 0, 1,-1,-1, 1, 1, 0};
static char const *cond_formats[DOMAIN_TYPE] = 
  {
    0, 
    "%u",                         /* INT_TYPE     */
    "%u.%u.%u.%u",                /* IPV4_TYPE    */ 
    "%u.%u.%u.%u/%u",             /* IPV4NET_TYPE */ 
    "%x:%x:%x:%x:%x:%x:%x:%x",    /* IPV6NET      */ 
    "%x:%x:%x:%x:%x:%x:%x:%x/%u", /* IPV6NET_TYPE */ 
    "%x:%x:%x:%x:%x:%x"           /* MACADDR_TYPE */
  };

static int cond_format_lens[DOMAIN_TYPE] = 
  {
     0, 
     1, /* INT_TYPE     */
     4, /* IPV4_TYPE    */ 
     5, /* IPV4NET_TYPE */ 
    16, /* IPV6_TYPE    */ 
    17, /* IPV6NET_TYPE */ 
     6  /* MACADDR_TYPE */
  };

static int cli_val_len;
static char *cli_val_ptr;

static char *exe_string;
static int exe_string_len;
static int node_cnt;
static int free_node_cnt;
static boolean in_validate_val;
static valstruct validate_value_val;  /* value being validated 
					 to be used as $(@) */

/* Local function declarations: */

static int check_comp(vtw_node *cur);
static boolean check_syn_func(vtw_node *cur,const char* func,int line);
#define check_syn(cur) check_syn_func((cur),__FUNCTION__,__LINE__)
void copy_path(vtw_path *to, vtw_path *from);
static int eval_va(valstruct *res, vtw_node *node);
static int expand_string(char *p);
static void free_node(vtw_node *node);
static void free_node_tree(vtw_node *node);
static void free_reuse_list(void);
void free_path(vtw_path *path);
static void free_string(char *str);
static vtw_node * get_node(void);
void subtract_values(char **lhs, const char *rhs);


static void scan_ipv6(char *val, unsigned int *parts);

static int set_reference_environment(const char* var_reference,
				     clind_path_ref *n_cfg_path,
				     clind_path_ref *n_tmpl_path,
				     clind_path_ref *n_cmd_path,
				     int active);

/*************************************************
     GLOBAL FUNCTIONS
***************************************************/

char *cli_operation_name = NULL;

/* it is executed as "eval `my_set` in order to be able to 
   modify BASH env
   therefore, all error will be reported as
   printf("echo \"bla-bla-bla%s\";", sptr)
   note very important ';' as the end of the format
*/
void bye(const char *msg, ...)
{
  va_list ap;
            
  fprintf(out_stream, "%s failed\n",
          (cli_operation_name) ? cli_operation_name : "Operation");

  if (is_silent_msg())
    exit(-1);
  va_start(ap, msg);
  if (is_echo())
    printf("echo \"");
  vprintf(msg, ap);
  printf(is_echo()? "\";":"\n");
  va_end(ap);

  exit(-1);
}

/* msg:
   print message, preceeded by "echo " if global
   flag echo set.  This flag is used by program
   which are executed as eval `command` in order to
   modify BASH env
*/
void print_msg(const char *msg, ...)
{
  va_list ap;

  if (is_silent_msg())
    return;
  va_start(ap, msg);
  if (is_echo())
    printf("echo \"");
  vprintf(msg, ap);
  printf(is_echo()? "\";":"\n");
  va_end(ap);
}

int mkdir_p(const char *path)
{
  if (mkdir(path, 0777) == 0)
    return 0;

  if (errno != ENOENT)
    return -1;

  char *tmp = strdup(path);
  if (tmp == NULL) {
    errno = ENOMEM;
    return -1;
  }

  char *slash = strrchr(tmp, '/');
  if (slash == NULL)
    return -1;
  *slash = '\0';

  /* recurse to make missing piece of path */
  int ret = mkdir_p(tmp);
  if (ret == 0)
    ret = mkdir(path, 0777);

  free(tmp);
  return ret;
}

void touch_dir(const char *dp) 
{
  struct stat    statbuf;

  if (lstat(dp, &statbuf) < 0) {
    if (errno != ENOENT) 
      bye("can't access directory: %s (%s)", dp, strerror(errno));

    if (mkdir_p(dp) < 0)
      bye("can't make directory: %s (%s)", dp, strerror(errno));
  } else {
    if(!S_ISDIR(statbuf.st_mode))
      bye("directory %s expected, found file", dp);
    utime(dp, NULL);
  }
}

/*****************************************************
  add_val:
    verify that the types are the same;
    if first valstruct is single value, convert it 
    into multivalue;
    add the value of second to the list of first;
*****************************************************/
void add_val(valstruct *first, valstruct *second)
{
  assert (first->free_me && second->free_me);
  assert(second->cnt == 0);
  if (first->val_type != second->val_type) {
    printf("Different types\n\n");
  } else {
    if (first->cnt%MULTI_ALLOC == 0) {
      /* convert into multivalue */
      first->vals = my_realloc(first->vals, (first->cnt + MULTI_ALLOC) *
			    sizeof(char *), "add_value");
      if (first->cnt == 0) { /* single value - convert */
	first->vals[0] = first->val;
	first->cnt = 1;
	first->val = NULL;
      }
    }
    second->free_me = FALSE; /* we took its string */
    first->vals[first->cnt] = second->val;
    ++first->cnt;
  }
}
/*****************************************************
  append - append node to the tail of list
*****************************************************/
void append(vtw_list *l, vtw_node *n, int aux)
{
  vtw_node *lnode;
  lnode = make_node(LIST_OP, n, NULL);
  lnode->vtw_node_aux = aux;
  if(l->vtw_list_tail) {
    assert(l->vtw_list_tail->vtw_node_right == NULL);
    l->vtw_list_tail->vtw_node_right = lnode;
  } else {
    assert(l->vtw_list_head == NULL);
    l->vtw_list_head = lnode;
  }
  l->vtw_list_tail = lnode;
}

void dt(vtw_sorted *srtp)
{
  int i;
  for (i=0; i<srtp->num; ++i)
    printf("%d %s\n", i, (char *)(srtp->ptrs[i]));
}


void di(vtw_sorted *srtp)
{
  int i;
  for (i=0; i<srtp->num; ++i)
    printf("%u %u\n", i, *(unsigned int *)(srtp->ptrs[i]));
}

#define LOCK_FILE "/opt/vyatta/config/.lock"
#define COMMIT_CMD "/opt/vyatta/sbin/my_commit"

static void
release_config_lock()
{
  unlink(LOCK_FILE);
  /* error ignored */
}

/* try to clean up orphaned lock file. return -1 if failed */
static int
try_lock_cleanup()
{
  char buf[128];
  char proc[128];
  FILE *f = NULL;
  int ret = -1;
  struct stat statb;

  do {
    /* get the proc entry */ 
    if ((f = fopen(LOCK_FILE, "r")) == NULL) {
      break;
    }
    if (fgets(proc, 128, f) == NULL) {
      break;
    }
    /* read the proc entry */
    if (stat(proc, &statb) == -1) {
      if (errno == ENOENT) {
        /* proc entry doesn't exist. can clean up the lock now */
        ret = 0;
        break;
      }
    }
    fclose(f);
    if ((f = fopen(proc, "r")) == NULL) {
      /* can't open proc entry. assume we can't clean up */
      break;
    }
    if (fgets(buf, 128, f) == NULL) {
      /* can't read proc entry. assume we can't clean up */
      break;
    }
    /* check if the process is commit */
    if (strcmp(buf, COMMIT_CMD) == 0) {
      /* it is commit. can't clean up */
      break;
    }
    /* can clean up the lock */
    ret = 0;
  } while (0);
  if (f) {
    fclose(f);
  }
  if (ret == 0) {
    unlink(LOCK_FILE);
    if (stat(LOCK_FILE, &statb) != -1 || errno != ENOENT) {
      /* proc entry still exists. cleanup failed */
      ret = -1;
    }
  }
  return ret;
}

static int
create_lock_file(int try_cleanup)
{
  int fd = -1;
  int i = 0;
  struct timespec req;

#define LOCK_WAIT_TIME 2
#define LOCK_NUM_RETRIES 5
  req.tv_sec = LOCK_WAIT_TIME;
  req.tv_nsec = 0;
  fd = open(LOCK_FILE, O_WRONLY | O_CREAT | O_EXCL, 0660);
  if (fd == -1) {
    for (i = 0; i < LOCK_NUM_RETRIES; i++) {
      nanosleep(&req, NULL);
      fd = open(LOCK_FILE, O_WRONLY | O_CREAT | O_EXCL, 0660);
      if (fd >= 0) {
        break;
      }
    }
  }
  if (fd == -1 && try_cleanup) {
    if (try_lock_cleanup() != -1) {
      /* cleanup succeeded */
      fd = create_lock_file(0);
    }
  }
  return fd; 
}

int
get_config_lock()
{
  int fd = -1;
  FILE *lfile = NULL;
  int ret = -1;

  do {
    /* create lock file */
    fd = create_lock_file(1);
    if (fd == -1) {
      break;
    }

    /* write pid into lock file */
    if ((lfile = fdopen(fd, "w")) == NULL) {
      break;
    }
    if (fprintf(lfile, "/proc/%u/cmdline", getpid()) < 0) {
      break;
    }
    /* fclose also closes fd */
    if (fclose(lfile) != 0) {
      break;
    }
    /* clean up on exit */
    if (atexit(release_config_lock) != 0) {
      break;
    }
    ret = 0;
  } while (0);
 
  if (ret == -1) {
    if (lfile) {
      fclose(lfile);
    } else if (fd != -1) {
      close(fd);
    }
    release_config_lock();
  }
  return ret;
}

void internal_error(int line, const char *file)
{
  printf("\n\nInternal Error at line %d in %s\n", line, file);
  exit (-1);
}

/*************************************************
 vtw_sort: 
   create sorted structure for the value,
   allocates ptrs and parts in this structure
*/
void vtw_sort(valstruct *valp, vtw_sorted *sortp)
{
  int i;
  const char * format;
  unsigned int *parts;
  vtw_type_e type = valp->val_type;
  char *cp;

  sortp->num = valp->cnt?valp->cnt : 1; 
#ifdef CLI_DEBUG
  printf("vtw_sort type=%d num=%d\n", type, sortp->num); 
  for (i = 0; i < sortp->num; i++) {
    printf("  [%s]\n", (valp->cnt) ? valp->vals[i] : valp->val);
  }
#endif
  sortp->ptrs =  my_malloc(sortp->num * sizeof(void *), "sort_ptrs");
  sortp->partnum = (type < DOMAIN_TYPE) ? cond_format_lens[type] : 0;
  if (sortp->partnum) {
    sortp->parts = my_malloc(sortp->partnum * sortp->num * sizeof(void *), 
			     "sort_parts");
  }else{
    sortp->parts = NULL;
  }
  switch (type){
  case IPV6_TYPE:
  case IPV6NET_TYPE:
    for (i = 0; i < sortp->num; ++i) {
      parts = sortp->parts + i * sortp->partnum;
      scan_ipv6(valp->cnt?valp->vals[i]:valp->val, parts);
      sortp->ptrs[i] = parts;
    }
    break;
  case IPV4_TYPE:
  case IPV4NET_TYPE:
  case MACADDR_TYPE:
  case INT_TYPE:
    format = cond_formats[valp->val_type];
    for (i = 0; i < sortp->num; ++i) {
      cp = valp->cnt?valp->vals[i]:valp->val;
      parts = sortp->parts + i * sortp->partnum;
      switch (sortp->partnum) {
      case 1: 
	(void) sscanf(cp, format, parts);
	break;
      case 2: 
	(void) sscanf(cp, format, parts, parts+1);
	break;
      case 3: 
	(void) sscanf(cp, format, parts, parts+1, parts+2);
	break;
      case 4: 
	(void) sscanf(cp, format, parts, parts+1, parts+2,
		      parts+3);
	break;
      case 5: 
	(void) sscanf(cp, format, parts, parts+1, parts+2,
		      parts+3, parts+4);
	break;
      case 6: 
	(void) sscanf(cp, format, parts, parts+1, parts+2,
		      parts+3, parts+4, parts+5);
	break;
      }
      sortp->ptrs[i] = parts;
    }
    break;
  case TEXT_TYPE:
  case BOOL_TYPE:
    for (i = 0; i < sortp->num; ++i) {
      sortp->ptrs[i] = valp->cnt?valp->vals[i]:valp->val;
    }
    break;
  default:
    bye("Unknown value in switch on line %d\n", __LINE__);
  }
  if (sortp->num < 2) 
    return;
#ifdef CLI_DEBUG
  if (sortp->parts) {
    int i, j;
    printf("sortp parts:\n");
    for (i = 0; i < sortp->num; i++) {
      printf("  ");
      unsigned int *parts = (unsigned int *) sortp->ptrs[i];
      for (j = 0; j < sortp->partnum; j++) {
        printf("%u ", parts[j]);
      }
      printf("\n");
    }
  }
#endif
  /* the following sort throws away the input ordering. */
  /* NOT doing this for now */
#if 0
  /* now do a heap sort */
  /* build heap */
  /* from left to right, we start with the heap of only one (first) element*/
  for (i = 2; i <= sortp->num; ++i)
  {
    cur  = i;
    do {
      curp = sortp->ptrs[cur - 1];
      par  = cur >> 1;
      parp = sortp->ptrs[par - 1];
      if (sortp->partnum){
	for(partnum = 0; partnum < sortp->partnum; ++partnum) {
	  if (*((unsigned int *)curp + partnum)>
	      *((unsigned int *)parp + partnum)){
		  res = 1;
		  break;
	  }
	  if (*((unsigned int *)curp + partnum)<
	      *((unsigned int *)parp + partnum)){
		  res = -1;
		  break;
	  }
	  res = 0;
	}
      }else{
	res = strcmp((char *)curp, (char *) parp);
      }
      if (res <= 0) 
	break;
      /* swap them */
      sortp->ptrs[cur - 1] = parp;
      sortp->ptrs[par - 1] = curp;
      
    } while ((cur = par) != 1);
  }
  /* convert heap into sorted array */
  unsorted = sortp->num; /* sortp->num must be >= 2 */
  while (TRUE) {
    void *tp;
    /* root to the sorted part */
    tp = sortp->ptrs[0];
    sortp->ptrs[0] = sortp->ptrs[--unsorted];
    sortp->ptrs[unsorted] = tp;
    if (unsorted == 1) 
      break;
    /* push down the new root */
    par = 1;
    while(TRUE) {
      left = par << 1; /* left child */
      if (left > unsorted) 
	break; /* no children */
      else {
	if (left == unsorted) {
	  /* only left child */
	  child  = left;
	} else {
	  /* both children */
	  right  = left+1;
	  leftp = sortp->ptrs[left - 1];
	  rightp = sortp->ptrs[right - 1];
	  /* find larger child */
	  if (sortp->partnum){
	    for(partnum = 0; partnum < sortp->partnum; ++partnum) {
	      if (*((unsigned int *)leftp + partnum) > 
		  *((unsigned int *)rightp + partnum)) {
		res = 1;
		break;
	      }
	      if (*((unsigned int *)leftp + partnum) < 
		  *((unsigned int *)rightp + partnum)) {
		res = -1;
		break;
	      }
	      res = 0;
	    }
	  }else{
	    res = strcmp((char *)leftp, (char *) rightp);
	  }
	  if (res >= 0) {
	    child  = left; /* left is larger or same*/
	  } else {
	    child  = right;
	  }
	}
	/* compare parent and larger child */
	parp = sortp->ptrs[par - 1];
	childp  = sortp->ptrs[child - 1];
	if (sortp->partnum){
	  for(partnum = 0; partnum < sortp->partnum; ++partnum) {
	    if (*((unsigned int *)parp + partnum) >
		*((unsigned int *)childp + partnum)){
	      res = 1;
	      break;
	    }
	    if (*((unsigned int *)parp + partnum) <
		*((unsigned int *)childp + partnum)){
	      res = -1;
	      break;
	    }
	    res = 0;
	  }
	}else{
	  res = strcmp((char *)parp, (char *) childp);
	}
	if (res >= 0) {
	  /* done with percolating down, parent larger than child */
	  break;
	}
	/* child greater, exchage and continue */
	sortp->ptrs[par - 1] = childp;
	sortp->ptrs[child - 1] = parp;
	par = child;
      }
    }
  }
#endif
}

/* returns FALSE if execution returns non-null,
   returns TRUE if every excution returns NULL
*/
boolean execute_list(vtw_node *cur, vtw_def *def) 
{
  boolean ret;
  int status;
  set_in_exec(TRUE);
  status = char2val(def, get_at_string(), &validate_value_val);  
  if (status) return FALSE;
  ret = check_syn(cur);
  free_val(&validate_value_val);
  set_in_exec(FALSE);
  return ret;
}

  
/*****************************************************
  make_node - create a node with oper, left, and right
*****************************************************/
vtw_node * make_node(vtw_oper_e oper, vtw_node *left, 
		     vtw_node *right)
{
  vtw_node *ret ;
  ret = get_node();
  ret->vtw_node_oper = oper;
  ret->vtw_node_left = left;
  ret->vtw_node_right = right;
  ret->vtw_node_string = NULL;
  ret->vtw_node_aux = 0;
  return ret;
}
vtw_node *make_str_node0(char *str, vtw_oper_e op)
{
  vtw_node *ret;
  ret = make_node(op, NULL, NULL);
  ret->vtw_node_string = str;
  ret->vtw_node_type = TEXT_TYPE;
  return ret;
}
/*****************************************************
  make_str_node - create a VAL_OP node with str
*****************************************************/
vtw_node *make_str_node(char *str)
{
  return make_str_node0(str, VAL_OP);
}
/*****************************************************
  make_var_node - create a VAR_OP node with str
*****************************************************/
vtw_node *make_var_node(char *str)
{
  return make_str_node0(str, VAR_OP);
}
/*****************************************************
  make_val_node - create a VAl_OP node with str
*****************************************************/
vtw_node *make_val_node(valstruct *val)
{
  vtw_node *ret;
  assert(val->free_me);
  ret = make_node(VAL_OP, NULL, NULL);
  ret->vtw_node_val = *val;
  val->free_me = FALSE;
  return ret;
}
valstruct str2val(char *cp)
{
  valstruct ret;
  memset(&ret, 0, sizeof(ret));
  ret.val_type = TEXT_TYPE;
  ret.val = cp;
  ret.free_me = TRUE;
  return ret;
}
/****************************************************
       STATIC FUNCTIONS
****************************************************/

/**************************************************
  char2val:
    convert string into valstruct verifying the type
    according to def
****************************************************/
int char2val(vtw_def *def, char *value, valstruct *valp)
{
  int token;
  char *endp, *cp;
  int linecnt, cnt;
  int my_type = def->def_type;
  boolean first = TRUE;

  memset(valp, 0, sizeof (*valp));

  if (my_type == ERROR_TYPE) {
    my_type = TEXT_TYPE;
  }

  if (my_type != TEXT_TYPE && my_type != ERROR_TYPE) {
    cli_val_len = strlen(value);
    cli_val_ptr = value;
    while(1) {
      token = yy_cli_val_lex();
      if (token != VALUE) {
	if (first || token){
	  if (def->def_type_help){
	    set_at_string(value);
	    (void)expand_string(def->def_type_help);
            fprintf(out_stream, "%s\n", exe_string);
	  } else {
	    print_msg("Wrong type of value in %s, "
		       "need %s\n", 
		       m_path.path_buf + m_path.print_offset, 
		       type_to_name(my_type)); 
            fprintf(out_stream, "\"%s\" is not a valid value of type \"%s\"\n",
                    value, type_to_name(my_type));
	  }
	  return -1;
	}
	return 0;
      }
      if (my_type != get_cli_value_ptr()->val_type) {
	if (def->def_type_help){
	  set_at_string(value);
	  (void)expand_string(def->def_type_help);
          fprintf(out_stream, "%s\n", exe_string);
	} else {
	  print_msg("Wrong type of value in %s, "
		     "need %s\n", 
		     m_path.path_buf + m_path.print_offset,
		     type_to_name(my_type));
          fprintf(out_stream, "\"%s\" is not a valid value of type \"%s\"\n",
                  value, type_to_name(my_type));
	}
	my_free(get_cli_value_ptr()->val);
	if (first)
	  return -1;
	return 0;
      }
      if (first) {
	*valp = *get_cli_value_ptr();
	get_cli_value_ptr()->free_me = FALSE;
	first = FALSE;
      } else {
	if (def->multi)
	  add_val(valp, get_cli_value_ptr());
	else {
	  print_msg("Unexpected multivalue in %s\n", m_path.path);
	  free_val(get_cli_value_ptr());
	}
      }
      token = yy_cli_val_lex();
      if (!token) 
	return 0;
      if (token != EOL) {
	fprintf(out_stream, "\"%s\" is not a valid value\n", value);
	print_msg("Badly formed value in %s\n", 
		  m_path.path + m_path.print_offset);
	if (token == VALUE)
	  my_free(get_cli_value_ptr()->val);
	return -1;
      }
    }
    return 0;
  }
  valp->val_type = TEXT_TYPE;
  valp->free_me = TRUE;
  /* count lines */
  linecnt = 0;
  for (cp = value; *cp; ++cp)
    if (*cp == '\n')
      ++linecnt;
  if (cp != value && cp[-1] != '\n')
    ++linecnt;  /* last non empty non \n terminated string */
  if (linecnt == 0)  /* one empty non terminated string */
    linecnt = 1;
  if (linecnt == 1) {
    valp->val=my_strdup(value, "char2val 1");
    /*truncate '\n' etc */
    endp = strchr(valp->val, '\n');
    if (endp)
      *endp = 0;
  } else {
    valp->cnt = linecnt;
    cnt = (linecnt + MULTI_ALLOC - 1) / MULTI_ALLOC;
    cnt *= MULTI_ALLOC;
    valp->vals = my_malloc(cnt * sizeof(char *), "char2val 2");
    for(cp = value, cnt = 0; cnt < linecnt; ++cnt) {
      endp = strchr(cp, '\n');
      if (endp) 
	*endp = 0;
      valp->vals[cnt]=my_strdup(cp, "char2val 3");
      if (endp) {
	*endp = '\n';
	cp = endp + 1;
      } else {
	/* non '\n' terinated string, must be last line, we are done */
	++cnt;
	assert(cnt == linecnt);
	break;
      }
    }
  }
  return 0;
}


/****************************************************
  val_comp:
    compare two values per cond
    returns result of comparison
****************************************************/
boolean val_cmp(const valstruct *left, const valstruct *right, vtw_cond_e cond) 
{
  unsigned int left_parts[9], right_parts[9];
  vtw_type_e val_type;
  int parts_num, lstop, rstop, lcur, rcur;
  char const *format;
  char *lval, *rval;
  int ret=0, step=0, res=0;

  val_type = left->val_type;
  if (left->cnt)
    lstop = left->cnt;
  else
    lstop = 1;
  if (right->cnt)
    rstop = right->cnt;
  else
    rstop = 1;
  
  DPRINT("val_cmp: type=%d count=(%d,%d) val=(%s,%s)\n",
         val_type, lstop, rstop, left->val, right->val);
  for(lcur = 0; lcur < lstop; ++lcur) {
    if (!lcur && !left->cnt)
      lval = left->val;
    else
      lval = left->vals[lcur];
    for(rcur = 0; rcur < rstop; ++rcur) {
      if (!rcur && !right->cnt)
	rval = right->val;
      else
	rval = right->vals[rcur];
      
      parts_num = 0;
      switch (val_type) {
      case IPV6_TYPE:
	parts_num = 8;
	goto ipv6_common;
      case IPV6NET_TYPE:
	parts_num = 9;
      ipv6_common:
	scan_ipv6(lval,left_parts);
	scan_ipv6(rval,right_parts);
	break;
      case IPV4_TYPE:
      case IPV4NET_TYPE:
      case MACADDR_TYPE:
      case INT_TYPE:
	format = cond_formats[val_type];
	parts_num = cond_format_lens[val_type];
	(void) sscanf(lval, format, left_parts, left_parts+1, 
		      left_parts+2, left_parts+3, left_parts+4,
		      left_parts+5); 
	(void) sscanf(rval, format, right_parts, right_parts+1, 
		      right_parts+2, right_parts+3, right_parts+4,
		      right_parts+5); 
	break;
      case TEXT_TYPE:
      case BOOL_TYPE:
	res = strcmp(lval, rval);
	goto done_comp;
      default:
	bye("Unknown value in switch on line %d\n", __LINE__);
      }
      /* here to do a multistep int compare */
      for (step = 0; step < parts_num; ++ step) {
	if (left_parts[step] > right_parts[step]) {
	  res = 1;
	  break; /* no reason to continue checking other steps */
	}
	if (left_parts[step] < right_parts[step]) {
	  res = -1;
	  break; /* no reason to continue checking other steps */
	}
	res = 0;
      }
    done_comp:
      if(res > 0) res = 1;
      else if(res < 0) res = -1;
      ret = ((res == cond1[cond]) || 
	     (res == cond2[cond]));
      if (ret && cond == IN_COND) {
	set_in_cond_tik(rcur); /* for delete */
	/* one success is enough for right cycle 
	   in case of IN_COND, continue left cycle */
	break;
      }
      if (!ret && cond != IN_COND) 
	/* one failure is enough in cases 
	   other than IN_COND - go out */
	return ret;
      /* in all other cases: 
	 (fail & IN_COND) or (success & !IN_COND) 
	 contniue checking; */
    }
  }
  return ret;
}



/****************************************************
  check_comp:
    evaluate comparison node.
    returns boolean value of result
****************************************************/
static boolean check_comp(vtw_node *cur)
{
  int ret;
  int status;
  valstruct left, right;

  memset(&left, 0 , sizeof(left));
  memset(&right, 0 , sizeof(right));
  ret = FALSE; /* in case of status */
  status = eval_va(&left, cur->vtw_node_left);
  DPRINT("check_comp left status=%d type=%d cnt=%d val=[%s]\n",
         status, left.val_type, left.cnt, left.val); 
  if (status) 
    goto free_and_return;
  status = eval_va(&right, cur->vtw_node_right);
  DPRINT("check_comp right status=%d type=%d cnt=%d val=[%s]\n",
         status, right.val_type, right.cnt, right.val); 
  if (status)
    goto free_and_return;
  if(left.val_type != right.val_type) {
    printf("Different types in comparison\n");
    goto free_and_return;
  }
  ret = val_cmp(&left, &right,cur->vtw_node_aux);
 free_and_return:
  if (left.free_me)
    free_val(&left);
  if (right.free_me)
    free_val(&right);
  return ret;
}

/******************
  Change value of var in the file

*****************/

static int write_value_to_file(const char* var_path,const char* value) {

  if(var_path && value) {

    {
      /*Build directory, if necessary:*/
      clind_path_ref var_dir_path=clind_path_construct(var_path);
      
      if(!var_dir_path) bye("Can not construct path %s", var_path);
      else {

	char* end = clind_path_pop_string(var_dir_path);
	
	if(!end || strcmp(end,VAL_NAME)) {
	  bye("Wrong end of path: %s (%s)", end,var_path);
	}
	    
	free(end);end=NULL;
	
	touch();
	touch_dir(clind_path_get_path_string(var_dir_path));

	clind_path_destruct(&var_dir_path);
      }
    }

    {
      /*Write to file*/
      FILE* fp = fopen(var_path, "w"); 
      if(!fp) bye("Can not open value file %s", var_path);
	  
      if (fputs(value, fp) < 0 || fputc('\n',fp) < 0)
	bye("Error writing file %s", var_path);
      
      fclose(fp);

    }
  }

  return 0;
}

static int change_var_value(const char* var_reference,const char* value, int active_dir) {

  int ret=-1;

  if(var_reference && value) {
	
    char* var_path=NULL;

    clind_path_ref n_cfg_path=NULL;
    clind_path_ref n_tmpl_path=NULL;
    clind_path_ref n_cmd_path=NULL;
	
    if(set_reference_environment(var_reference,
				 &n_cfg_path,
				 &n_tmpl_path,
				 &n_cmd_path,
				 active_dir)==0) {
	  
      clind_val cv;
	  
      memset(&cv,0,sizeof(cv));
	  
      if(clind_config_engine_apply_command_path(n_cfg_path,
						n_tmpl_path,
						n_cmd_path,
						FALSE,
						&cv,
						get_cdirp(),
						get_tdirp(),
						TRUE)==0) {
	var_path=cv.value;
	
      }
      
    }
	
    if(n_cfg_path) clind_path_destruct(&n_cfg_path);
    if(n_tmpl_path) clind_path_destruct(&n_tmpl_path);
    if(n_cmd_path) clind_path_destruct(&n_cmd_path);
	
    if(var_path) {
      ret=write_value_to_file(var_path,value);
      free(var_path);
    }
  }

  return ret;
}

int system_out(const char *command);

/****************************************************
 check_syn:
   evaluate syntax tree;
   returns TRUE if all checks are OK,
   returns FALSE if check fails.
****************************************************/
static boolean check_syn_func(vtw_node *cur,const char* func,int line)
{
  int status;
  int ret;
  int ii;

  switch(cur->vtw_node_oper) {
  case LIST_OP:
    ret = TRUE;
    if (is_in_commit() || !cur->vtw_node_aux) {
      ret = check_syn(cur->vtw_node_left);
    }
    if (!ret || !cur->vtw_node_right) /* or no right operand */
      return ret;
    return check_syn(cur->vtw_node_right);
  case HELP_OP:
    ret = check_syn(cur->vtw_node_left);
    if (ret <= 0){
      if (expand_string(cur->vtw_node_right->vtw_node_string) == VTWERR_OK) {
	fprintf(out_stream, "%s\n", exe_string);
      }
    }
    return ret;

  case ASSIGN_OP:

    if (is_in_exec()) {

      valstruct right;
	
      char* var_reference = NULL;
      
      memset(&right, 0, sizeof(right));
      status = eval_va(&right, cur->vtw_node_right);

      if (status || right.cnt) { /* bad or multi */
	if (right.free_me) free_val(&right);
	return FALSE;
      }

      if (strncmp(cur->vtw_node_left->vtw_node_string,
                  VAR_REF_MARKER, VAR_REF_MARKER_LEN) != 0) {
        /* bad reference. should not happen */
        return FALSE;
      }
      /* point to char next to '(' */
      var_reference = strdup(cur->vtw_node_left->vtw_node_string
                             + VAR_REF_MARKER_LEN);
      
      {
	int i=0;
	while(var_reference[i]) {
	  if(var_reference[i]==')') {
	    var_reference[i]=0;
	    break;
	  }
	  i++;
	}
      }

      change_var_value(var_reference,right.val,FALSE);
      change_var_value(var_reference,right.val,TRUE);

      if (right.free_me) free_val(&right);

      if(var_reference) free(var_reference);
    }

    return TRUE;

  case EXEC_OP:
    /* for every value */
    if (in_validate_val) {
      char *save_at = get_at_string();
      for(ii = 0; ii < validate_value_val.cnt || ii == 0; ++ii) {
	set_at_string(validate_value_val.cnt?
	  validate_value_val.vals[ii]:validate_value_val.val);
	status = expand_string(cur->vtw_node_left->vtw_node_string);
	if (status != VTWERR_OK) {
	  set_at_string(save_at);
	  return FALSE;
	}
	ret = system_out(exe_string);
	if (ret) {
	  set_at_string(save_at);
	  return FALSE;
	}
      }
      set_at_string(save_at);
      return TRUE;
    }
    /* else */
    status = expand_string(cur->vtw_node_left->vtw_node_string);
    if (status != VTWERR_OK) {
      return FALSE;
    }
    ret = system_out(exe_string);
    return !ret;
    
  case PATTERN_OP:  /* left to var, right to pattern */
    {
      valstruct left;
      regex_t myreg;
      boolean ret;
      int ii;

      ret = TRUE;
      status = eval_va(&left, cur->vtw_node_left);
      if (status) {
	ret = FALSE;
	goto free_and_return;
      }
      status = regcomp(&myreg, cur->vtw_node_right->vtw_node_string,
                       REG_EXTENDED);
      if (status)
	bye("Can not compile regex |%s|, result %d\n", 
	    cur->vtw_node_right->vtw_node_string, status);
	/* for every value */
	for(ii = 0; ii < left.cnt || ii == 0; ++ii) {
	status = regexec(&myreg, left.cnt?
			 left.vals[ii]:left.val,
			 0, 0, 0);
	if(status) {
	  ret = FALSE;
	  break;
	}
      }
    free_and_return:
      if (left.free_me)
	free_val(&left);
      return ret;
    }
    
  case OR_OP:
    ret = check_syn(cur->vtw_node_left) || 
      check_syn(cur->vtw_node_right);
    return ret;
  case AND_OP:
    ret = check_syn(cur->vtw_node_left) && 
      check_syn(cur->vtw_node_right);
    return ret;
  case NOT_OP:
    ret = check_syn(cur->vtw_node_left);
    return !ret;
    
  case COND_OP:   /* aux field specifies cond type (GT, GE, etc.)*/
    ret = check_comp(cur);
    return ret;
      
  case VAL_OP:
    bye("VAL op in check_syn\n");
  case VAR_OP:
    bye("VAR op in check_syn\n");
  default:
    bye("unknown op %d in check_syn\n", cur->vtw_node_oper);
  }
  /* not reachable */
  return FALSE;
}

/*************************************************
  copy_path:
    copy path
    if destination path owns memory, free it
**************************************************/
void copy_path(vtw_path *to, vtw_path *from)
{
  if (to->path_buf)
    my_free(to->path_buf);
  if (to->path_ends)
    my_free(to->path_ends);
  *to = *from;
  to->path_buf = (char *) my_malloc(from->path_alloc+2, "copy_path1");
  memcpy(to->path_buf, from->path_buf, to->path_alloc + 1);
  to->path = to->path_buf + (from->path-from->path_buf);
  to->path_ends = (int *) my_malloc(to->path_ends_alloc * sizeof(int),
				    "copy_path2");
  memcpy(to->path_ends, from->path_ends, 
	 to->path_ends_alloc * sizeof(int));
}

/*****************************************************
  eval_va:
    converts VAR_OP or VAL_OP node into valstruct
    in case of VAR_OP we need to find corresponding
    template node to obtain type. 
	
*****************************************************/
static int eval_va(valstruct *res, vtw_node *node)
{  
  char *cp=NULL;
  char *pathp=NULL;
  int   status=0;

  switch (node->vtw_node_oper) {
  case VAR_OP:

    {
      char *endp = 0;
      clind_path_ref n_cfg_path=NULL;
      clind_path_ref n_tmpl_path=NULL;
      clind_path_ref n_cmd_path=NULL;
      
      pathp = node->vtw_node_string;
      DPRINT("eval_va var[%s]\n", pathp);
      
      assert(strncmp(pathp, VAR_REF_MARKER, VAR_REF_MARKER_LEN) == 0);
      pathp += VAR_REF_MARKER_LEN;

      if(pathp[0] == '@' && pathp[1]!='@'){
	/* this is why we passed at_val all around */
	*res = validate_value_val;
	res->free_me = FALSE;
	return 0;
      }

      memset(res,0,sizeof(*res));
      
      if ((endp = strchr(pathp, ')')) == NULL) {
	printf("invalid VAR_OP [%s]\n", node->vtw_node_string);
	return VTWERR_BADPATH;
      }
      
      *endp = 0;
      
      if(set_reference_environment(pathp,
				   &n_cfg_path,
				   &n_tmpl_path,
				   &n_cmd_path,
				   is_in_delete_action())==0) {
	clind_val cv;
	
	memset(&cv,0,sizeof(cv));

	status=clind_config_engine_apply_command_path(n_cfg_path,
						      n_tmpl_path,
						      n_cmd_path,
						      TRUE,
						      &cv,
						      get_cdirp(),
						      get_tdirp(),
						      FALSE);

	if(status==0) {
	  if(cv.value) {
	    res->val_type = cv.val_type;
	    res->free_me = TRUE;
	    res->val = cv.value;
	  }
	}
      }
      
      if(n_cfg_path) clind_path_destruct(&n_cfg_path);
      if(n_tmpl_path) clind_path_destruct(&n_tmpl_path);
      if(n_cmd_path) clind_path_destruct(&n_cmd_path);

      *endp = ')';

      return status;
    }

  case VAL_OP:
    DPRINT("eval_va val[%s]\n", res->val);
    *res = node->vtw_node_val;
    res->free_me = FALSE; 
    return 0;
  case B_QUOTE_OP:
    {
      FILE *f;
      int a_len, len, rd;

      status = expand_string(node->vtw_node_string);
      if (status != VTWERR_OK) {
	return FALSE;
      }
      f = popen(exe_string, "r");
      if (!f)
	return -1;
#define LEN 24
      len = 0;
      cp = my_malloc(LEN,"");
      a_len = LEN;
      for(;;){
	rd = fread(cp + len, 1, a_len - len , f);
	len += rd;
	if (len < a_len)
	  break;
	cp = my_realloc(cp, a_len+LEN, "");
	a_len += LEN;
      }
      cp[len] = 0;
      pclose(f);
      memset(res, 0, sizeof (*res));
      res->val_type = TEXT_TYPE;
      res->free_me = TRUE;
      res->val = cp;
    }
    return 0;
  default:
    return 0;
  }
}

/**********************************************************
 expand_string:
   expand string replacing var references with the appropriate 
   values, the formed string is collected in the buffer pointed 
   at by the global exe_string. The buffer dynamically allocated 
   and reallocated.
***********************************************************/
static int expand_string(char *stringp)
{
  char *scanp;
  char *resp = exe_string;
  int left = exe_string_len; 
  int my_len;
  int len;

  scanp = stringp; /* save stringp for printf */

  do{

    if (left <= 1){
       my_len = resp - exe_string;
       exe_string_len += EXE_STRING_DELTA;
       exe_string = my_realloc(exe_string, exe_string_len, "expand_string 1");
       left += EXE_STRING_DELTA;
       resp = exe_string + my_len;
       /* back in business */
    }
    if (*scanp != '$') {
      /* we don't check for '\''$' any more.
       * only "$VAR(" is significant now */
      *resp++ = *scanp++;
      --left;
    } else if (strlen(scanp) < (VAR_REF_MARKER_LEN + 1 + 1)) {
      /* shorter than "$VAR(@)". cannot be a reference */
      *resp++ = *scanp++;
      --left;
    } else if (strncmp(scanp, VAR_REF_MARKER, VAR_REF_MARKER_LEN) != 0) {
      /* doesn't start with "$VAR(". not a reference */
      *resp++ = *scanp++;
      --left;
    } else {
      /* the first char is '$'
       * && remaining length is enough for a reference
       * && starts with marker.
       */
      char *cp=NULL;
      boolean my_cp=FALSE;

      /* advance scanp to 'R'. */
      scanp += 3;

      if(scanp[2] == '@' && scanp[3] == ')') {

	cp = get_at_string();
	my_cp = FALSE;
	scanp += 4;

      } else {
      
	clind_path_ref n_cfg_path=NULL;
	clind_path_ref n_tmpl_path=NULL;
	clind_path_ref n_cmd_path=NULL;

	char *endp;

	endp = strchr(scanp, ')');
	if (!endp ){
	  return -1;
	}

	scanp += 2;
	/* path reference */
	*endp = 0;
	if (endp == scanp)
	  bye("Empty path");	  
	
	if(set_reference_environment(scanp,
				     &n_cfg_path,
				     &n_tmpl_path,
				     &n_cmd_path,
				     is_in_delete_action())==0) {

	  clind_val cv;
	  
	  memset(&cv,0,sizeof(cv));

	  if(clind_config_engine_apply_command_path(n_cfg_path,
						    n_tmpl_path,
						    n_cmd_path,
						    TRUE,
						    &cv,
						    get_cdirp(),
						    get_tdirp(),
						    FALSE)==0) {
	    cp=cv.value;

	  }

	}

	if(n_cfg_path) clind_path_destruct(&n_cfg_path);
	if(n_tmpl_path) clind_path_destruct(&n_tmpl_path);
	if(n_cmd_path) clind_path_destruct(&n_cmd_path);
	
	if(!cp) {
	  cp="";
	} else {
	  my_cp=TRUE;
	}
	
	*endp = ')';
	
	scanp = strchr(scanp, ')') + 1;
      }
      len = strlen(cp);
      while(len + 1 > left) { /* 1 for termination */
	my_len = resp - exe_string;
	exe_string_len += EXE_STRING_DELTA;
	exe_string = my_realloc(exe_string, exe_string_len, "expand_string 2");
	left += EXE_STRING_DELTA;
	resp = exe_string + my_len;
	/* back in business */
      }

      strcpy(resp, cp);
      if(my_cp && cp) free(cp);
      resp += len;
      left -= len;
    }

  } while(*scanp);
  
  *resp = 0;
  
  return VTWERR_OK; 
}

/*****************************************************
  free_sorted:
    free all memory allocated to sorted
*****************************************************/
void free_sorted(vtw_sorted *sortp)
{
  if(sortp->ptrs)
    my_free(sortp->ptrs);
  if (sortp->parts)
    my_free(sortp->parts);
}


/*****************************************************
  free_def:
    free all memory allocated to def
*****************************************************/
void free_def(vtw_def *defp)
{
  vtw_act_type act;
  for(act=0; act<top_act; ++ act)
    if (defp->actions[act].vtw_list_head)
      free_node_tree(defp->actions[act].vtw_list_head);
  if (defp->def_type_help)
    my_free(defp->def_type_help);
  if (defp->def_node_help) {
    my_free(defp->def_node_help);
  }
  if (defp->def_default)
    my_free(defp->def_default);
}

/*****************************************************
  free_node - add node to free list 
*****************************************************/
static void free_node(vtw_node *node)
{
  --node_cnt;
  ++free_node_cnt;
  node->vtw_node_left = vtw_free_nodes;
  vtw_free_nodes = node;
}

/*****************************************************
  free_node_tree - add all nodes of the tree to free list 
*****************************************************/
static void free_node_tree(vtw_node *node)
{
  if (node->vtw_node_left)
    free_node_tree(node->vtw_node_left);
  if (node->vtw_node_right)
    free_node_tree(node->vtw_node_right);
  if (node->vtw_node_string)
    free_string(node->vtw_node_string);
  if (node->vtw_node_val.free_me)
    free_val(&(node->vtw_node_val));
  free_node(node);
}

void free_path(vtw_path *path)
{
  if (path->path_ends)
    my_free(path->path_ends);
  if (path->path_buf) {
    my_free(path->path_buf);
  }
}

static void free_reuse_list()
{
  vtw_node *next;
  int cnt = 0;
  
  while (vtw_free_nodes) {
    next = vtw_free_nodes->vtw_node_left;
    my_free(vtw_free_nodes);
    ++cnt;
    vtw_free_nodes = next;
    --free_node_cnt;
  }
#if DEBUG
  printf("%d nodes used\n", cnt);
#endif
}

/*****************************************************
  free_val - dealloc allocated memory of valstruct
*****************************************************/
void free_val(valstruct *val)
{
  int cnt;

  assert(val->free_me);
  if (val->val) 
    my_free(val->val);
  for (cnt = 0; cnt < val->cnt; ++ cnt)
    my_free(val->vals[cnt]);
  if(val->vals)
    my_free(val->vals);
}
/*****************************************************
  free_string - dealloc string
  just free for now, we might do something else later
*****************************************************/
static void free_string(char *str)
{
  my_free(str);
}


/*****************************************************
  get_node - take node from free list or allocate
*****************************************************/
static vtw_node * get_node(void)
{
  vtw_node *ret;
  if (vtw_free_nodes){
    ret = vtw_free_nodes;
    vtw_free_nodes = vtw_free_nodes->vtw_node_left;
    --free_node_cnt;
  } else {
    ret = my_malloc(sizeof(vtw_node), "New node");
  }
  ++node_cnt;
  memset(ret, 0, sizeof(vtw_node));
  return ret;
}

/****************************************************
 get_value: 
   for a given path (*path) verify that value exists,
   open it and read it. The pointer to allocated 
   memory is returned in valpp.  It is responsibility
   of a caller to release memory.
   Returns: 
******************************************************/
int get_value(char **valpp, vtw_path *pathp)
{
    struct stat    statbuf;
    int status = VTWERR_OK;
    char const *err = NULL;
    FILE *in = NULL;
    char *valp;
    int   readcnt;

    
    /* find value */
    *valpp = 0;
    push_path(pathp, val_name);

    if (lstat(pathp->path, &statbuf) < 0) {
      err = "no value file in [%s]\n";
      goto bad_path;
    }
    if ((statbuf.st_mode & S_IFMT) != S_IFREG) {
      err = "no value file in [%s]\n";
      goto bad_path;
    }
    in = fopen(pathp->path, "r");
    if (!in) {
      err = "Can not open value file in [%s]\n";
      goto bad_path;
    }
    valp = my_malloc(statbuf.st_size + 1, "get_value");
    readcnt = fread(valp, 1, statbuf.st_size, in);
    if (readcnt != statbuf.st_size) {
      my_free(valp);
      err = "Error reading value file in [%s]\n";
      goto bad_path;
    }
    valp[statbuf.st_size] = 0;
    /* remove \n at the line end */
    if (valp[statbuf.st_size - 1] == '\n')
      valp[statbuf.st_size - 1] = 0;
    *valpp = valp;
    status = 0;
pop:
    if (in)
      fclose(in);
    pop_path(pathp);
    if (err) {
      fprintf(stderr, err, pathp->path_buf + m_path.print_offset);
      printf(err, pathp->path_buf + m_path.print_offset);
    }
    return status;
 bad_path:
    status = VTWERR_BADPATH;
    goto pop;
}

int get_value_to_at_string(vtw_path *pathp) {

  char* at=NULL;
  int status = get_value(&at,pathp);

  if(status==0) {
    set_at_string(at);
  } else {
    set_at_string(NULL);
  }

  return status;
}  

/*****************************************************
 out_of_memeory
 print out of memory message and exit 
*****************************************************/
void out_of_memory()
{
  bye("\n\t!!! OUT OF MEMORY !!!\n");
}

/*************************************************
  init_path:
    init path, exit if not able (out_of_memory)
**************************************************/
void init_path(vtw_path *path, const char *root)
{
    long   path_len;
    memset(path, 0, sizeof(vtw_path));
    path_len = pathconf(root, _PC_PATH_MAX);
    if (path_len < 0)
	path_len = PATH_DELTA;
    path->path_alloc = path_len - 2; 
    /* 1 byte for null termination, and 1 byte for '/' */
    path->path_buf = path->path = 
      (char *)my_malloc(path_len, "init_path 1");
    strcpy(path->path, root);
    path->path_len = strlen(root);
    path->path_ends = (int *)my_malloc(ENDS_ALLOC * sizeof(int *), 
				       "init_path 2");
    path->path_lev = 1;
    path->path_ends[0] = path->path_len;
    path->path_ends_alloc = ENDS_ALLOC;
}

/*****************************************************
  pop_path - shorten path by one segment
*****************************************************/

void pop_path(vtw_path *path)
{
    if (--path->path_lev < 1) {
      INTERNAL;
    }
    path->path_len = path->path_ends[path->path_lev - 1];
    path->path_buf[path->path_len] = 0;
}
void warrant_path(vtw_path *path, int len)
{
  int delta = path->path - path->path_buf;

  while(path->path_alloc - path->path_len < len + 1){
    path->path_buf = (char *)my_realloc(path->path_buf, 
				    path->path_alloc +
			     PATH_DELTA, "push_path 1");
    path->path_alloc += PATH_DELTA;
  }
  path->path = path->path_buf + delta;
}
/*****************************************************
  push_path - extend path by '/' and one new segment 
*****************************************************/
void push_path(vtw_path *path, const char *segm)
{
    int len;
    const char *cp;
    char *pp;

    for(cp=segm, len=0;*cp;++cp, ++len)
      if(*cp=='%' || *cp=='/')
	len +=2;
    warrant_path(path, len + 1);
    path->path_buf[path->path_len] = '/';
    path->path_buf[++path->path_len] = 0;	
    for(pp=path->path_buf + path->path_len,cp=segm;
	*cp;++cp, ++pp)
      if(*cp=='%') {
	pp[0] = '%';
	pp[1] = '2';
	pp[2] = '5';
	pp += 2;
      }else if (*cp == '/') {
	pp[0] = '%';
	pp[1] = '2';
	pp[2] = 'F';
	pp += 2;
      }else 
	*pp = *cp; 
    *pp = 0;
    path->path_len += len;
    if (path->path_lev == path->path_ends_alloc){
	path->path_ends_alloc += ENDS_ALLOC;
	path->path_ends = (int *)my_realloc(path->path_ends, 
		     sizeof(int *)*path->path_ends_alloc, "push_path 2");
    }
    path->path_ends[path->path_lev++] = path->path_len;
    //    push_path_no_escape();
}

/**
 * Version of above that doesn't escape value before stuffing.
 *
 **/
void push_path_no_escape(vtw_path *path, char *segm)
{
    int len;
    char *cp;
    char *pp;
    
    for(cp=segm, len=0;*cp;++cp, ++len);
    warrant_path(path, len + 1);
    path->path_buf[path->path_len] = '/';
    path->path_buf[++path->path_len] = 0;	
    for(pp=path->path_buf + path->path_len,cp=segm;
	*cp;++cp, ++pp) {
      *pp = *cp; 
    }
    *pp = 0;
    path->path_len += len;
    if (path->path_lev == path->path_ends_alloc){
	path->path_ends_alloc += ENDS_ALLOC;
	path->path_ends = (int *)my_realloc(path->path_ends, 
		     sizeof(int *)*path->path_ends_alloc, "puhs_path 2");
    }
    path->path_ends[path->path_lev++] = path->path_len;
}

/****************************************************
  scan_ipv6:
    scans ipv6 or ipv6net pointed by val 
    and returns as array of integers pointed
    by parts
***************************************************/
static void scan_ipv6(char *val, unsigned int *parts)
{
  int num = 0;
  int num_cnt = 0;
  int dot_dot_pos = -1;
  int dot_cnt = 0;
  char c;
  char *p;
  int base = 16;
  int total = 8;
  int gap;

  p = val;
  if (strncmp(p, ".wh.", 4) == 0)
    p = p + 4;
  for ( ;TRUE; ++p) {
    switch ((c = *p)) {
    case '.':
      if (dot_cnt == 0) {
	/* turn out it was decimal, convert our wrong
	   hex interpretation;
	   decimal may not have more than 3 digits */
	num = (num/256)*100 + (num%256)/16*10 + num%16;
	base = 10;
      }
      ++dot_cnt;
      break;
    case ':':
      if (p[1] == ':'){
	++p;
	dot_dot_pos = num_cnt + 1;
      }
      break;
    case '/':
      base = 10;
      total = 9;
      break;
    case 0:
      break;
    default:
      /* must be a digit */
      c = tolower(*p);
      if (isdigit(c))
	num = num * base + c - '0';
      else
	num = num * base + c - 'a' + 10;
      continue;
    }
    /* close the number */
    /* the case of "::234: etc " 
     handled automatically as 0::234
    with allowing :: to represent 0 or more
    groups instead of 1 or more */
    
    parts[num_cnt] = num;
    num = 0;
    ++num_cnt;
    /* combine two decimal if needed */
    if (dot_cnt == 2 || (dot_cnt == 3 && (c == 0 || c == '/'))) {
      --num_cnt;
      parts[num_cnt - 1] = parts[num_cnt - 1] * 256 + parts[num_cnt];
    }
    if (*p == 0)
      break;
  }
  /* replace '::' with 0s */
  if (dot_dot_pos != -1 && total != num_cnt) {
    int i;
    gap = total - num_cnt;
    if (dot_dot_pos != num_cnt)
      memmove(parts+dot_dot_pos+gap, parts+dot_dot_pos,
	      (num_cnt-dot_dot_pos)*sizeof(int));
    for (i = 0; i<gap; ++i)
      parts[dot_dot_pos+i] = 0;
  }
}

/***************************************************
  switch_path:
   switch m_path between mcd and ccd directories - 
   modified (UNIONFS) configuration and changed 
   (real) configuration
****************************************************/
void switch_path(first_seg *segp)
{
  memcpy(m_path.path_buf + segp->f_segoff, segp->f_segp,
	 segp->f_seglen);
  m_path.path = m_path.path_buf + segp->f_segoff;
}

/*************************************************
  validate_value:
    validates value against type and syntax 
   return TRUE if OK, FALSE otherwise
**************************************************/
boolean validate_value(vtw_def *def, char *cp)
{
  int        status;
  boolean    ret=TRUE;

  /* prepare cur_value */
  set_at_string(cp);
  status = char2val(def, cp, &validate_value_val);
  if (status != VTWERR_OK)
    return FALSE;
  if ((def->def_type!=ERROR_TYPE) && 
      (validate_value_val.val_type != def->def_type)) {
    if (def->def_type_help){
      (void)expand_string(def->def_type_help);
      fprintf(out_stream, "%s\n", exe_string);
    } else {
      fprintf(out_stream, "\"%s\" is not a valid value of type \"%s\"\n",
	      cp, type_to_name(def->def_type));
    }
    ret = FALSE;
    goto  validate_value_free_and_return;
  }
  ret = TRUE;
  if (def->actions  && def->actions[syntax_act].vtw_list_head){
    in_validate_val = TRUE;
    ret = check_syn(def->actions[syntax_act].vtw_list_head);
    in_validate_val = FALSE;
  }
 validate_value_free_and_return:
  free_val(&validate_value_val);
  return ret;
}

void subtract_values(char **lhs, const char *rhs)
{
  size_t length = 0, lhs_cnt = 0, rhs_cnt = 0, i;
  const char *line = NULL;
  char *rhs_copy = NULL, *res = NULL;
  const char **head = NULL, **ptr = NULL;
  const char **new_head = NULL, **new_ptr = NULL;

  if (lhs == NULL || *lhs == NULL || **lhs == '\0' || rhs == NULL || *rhs == '\0')
    return;

  /* calculate number of rhs entries */
  rhs_copy = strdup(rhs);
  line = strtok(rhs_copy, "\n\r");
  while (line != NULL && *line != '\0') {
    rhs_cnt++;
    line = strtok(NULL, "\n\r");
  }

  /* strtok destroys the string. dup again. */
  free(rhs_copy);
  rhs_copy = strdup(rhs);

  /* allocate enough space for all old entries (to be subtracted) */
  length = rhs_cnt * sizeof(char *);
  head = ptr = my_malloc(length, "subtract_values list1");
  memset(head, 0, length);

  /* parse the entries and put them in head[] */
  line = strtok(rhs_copy, "\n\r");
  while (line != NULL && *line != '\0') {
    *ptr = line;
    ptr++;
    line = strtok(NULL, "\n\r");
  }

  /* calculate number of lhs entries */
  {
    char *lhs_copy = strdup(*lhs);
    line = strtok(lhs_copy, "\n\r");
    while (line != NULL && *line != '\0') {
      lhs_cnt++;
      line = strtok(NULL, "\n\r");
    }
    free(lhs_copy);
  }

  /* allocate enough space for all new entries */
  length = lhs_cnt * sizeof(char *);
  new_head = new_ptr = my_malloc(length, "subtract_values list2");
  memset(new_head, 0, length);

  /* reset length and lhs_cnt. they are now used for the "new" array (i.e.,
   * after subtraction). */
  length = 0;
  lhs_cnt = 0;
  line = strtok(*lhs, "\n\r");
  while (line != NULL && *line != '\0') {
    for (i = 0; i < rhs_cnt; i++) {
      if (strncmp(line, head[i], strlen(line)) == 0)
        break;
    }
    if (i >= rhs_cnt) {
      *new_ptr = line;
      length += strlen(line) + 1;
      new_ptr++;
      lhs_cnt++;
    }
    line = strtok(NULL, "\n\r");
  }

  res = (char *) my_malloc(length + 1, "subtract_values result");
  *res = '\0';
  for (i = 0; i < lhs_cnt; i++) {
     strcat(res, new_head[i]);
     strcat(res, "\n");
  }
  
  my_free(head);
  my_free(new_head);
  if (rhs_copy != NULL)
    my_free(rhs_copy);
  my_free(*lhs);

  *lhs = res;
}

int cli_val_read(char *buf, int max_size)
{
  int len;
  
  if (cli_val_len > max_size)
    len = max_size;
  else
    len = cli_val_len;
  if (len) {
    (void)memcpy(buf, cli_val_ptr, len);
    cli_val_len -= len;
    cli_val_ptr += len;
  }
  return len;
}
void done(void)
{
  free_reuse_list();
  free_path(&t_path);
  free_path(&m_path);
  if (exe_string)
    my_free(exe_string);
}
void mark_paths(vtw_mark *markp)
{
  markp->m_lev = m_path.path_lev;
  markp->t_lev = t_path.path_lev;
}
void restore_paths(vtw_mark *markp)
{
  while(markp->m_lev < m_path.path_lev)
    pop_path(&m_path);
  while(markp->t_lev < t_path.path_lev)
    pop_path(&t_path);
}

void touch_file(const char *filename)
{
  int fd = creat(filename, 0666);
  if (fd < 0)
    {
      if (errno == EEXIST)
	utime(filename, NULL);
      else
	bye("can't touch %s (%s)", filename, strerror(errno));
    }
  else
    close(fd);
}

void touch(void) 
{
  char filename[strlen(get_mdirp()) + 20];
  sprintf(filename, "%s/%s", get_mdirp(), MOD_NAME);
  touch_file(filename);
}
  
const char *type_to_name(vtw_type_e type) {
  switch(type) {
  case INT_TYPE: return("u32");
  case IPV4_TYPE: return("ipv4");
  case IPV4NET_TYPE: return("ipv4net");
  case IPV6_TYPE: return("ipv6");
  case IPV6NET_TYPE: return("ipv6net");
  case MACADDR_TYPE: return("macaddr");
  case DOMAIN_TYPE: return("domain");
  case TEXT_TYPE: return("text");
  case BOOL_TYPE: return("bool");
  default: return("unknown");
  }
}

#ifdef CLI_DEBUG
void dump_log(int argc, char **argv)
{
  int i;

  printf("Command:");
  for (i = 0; i < argc; ++i) {
	  putchar(' ');
	  puts(argv[i]);
  }
  putchar('\n');
}
#endif

/********************* New Dir ****************************/

static int set_reference_environment(const char* var_reference,
				     clind_path_ref *n_cfg_path,
				     clind_path_ref *n_tmpl_path,
				     clind_path_ref *n_cmd_path,
				     int active) {

  if(var_reference && n_cfg_path && n_tmpl_path && n_cmd_path) {

    if(*var_reference=='/') {
      
      if(is_in_delete_action()) {
	*n_cfg_path=clind_path_construct(get_adirp());
      } else {
	*n_cfg_path=clind_path_construct(get_mdirp());
      }
      *n_tmpl_path=clind_path_construct(get_tdirp());
      *n_cmd_path=clind_path_construct(var_reference);

    } else {

      vtw_path n_vt_path;
	
      memset(&n_vt_path,0,sizeof(n_vt_path));

      copy_path(&n_vt_path, &m_path);
      /* switch to MPATH */
      memcpy(n_vt_path.path_buf + get_f_seg_m_ptr()->f_segoff, get_f_seg_m_ptr()->f_segp,
	     get_f_seg_m_ptr()->f_seglen);
      n_vt_path.path = n_vt_path.path_buf + get_f_seg_m_ptr()->f_segoff;

      if(active) {

	vtw_path active_path;
	
	memset(&active_path,0,sizeof(active_path));
	
	copy_path(&active_path, &n_vt_path);
	
	memcpy(active_path.path_buf + get_f_seg_a_ptr()->f_segoff, get_f_seg_a_ptr()->f_segp,
	       get_f_seg_a_ptr()->f_seglen);
	active_path.path = active_path.path_buf + get_f_seg_a_ptr()->f_segoff;
	
	*n_cfg_path=clind_path_construct(active_path.path);
        
        free_path(&active_path);
      } else {
	
	*n_cfg_path=clind_path_construct(n_vt_path.path);

      }

      *n_tmpl_path=clind_path_construct(t_path.path);
      *n_cmd_path=clind_path_construct(var_reference);
      
      free_path(&n_vt_path);
    }

    return 0;

  } else {

    return -1;

  }
}

/*** output ***/

int out_fd = -1;
FILE *out_stream = NULL;

int err_fd = -1;
FILE *err_stream = NULL;
int new_out_fd = -1;
int new_err_fd = -1;

int
initialize_output()
{
  if ((out_fd = dup(STDOUT_FILENO)) == -1) {
    return -1;
  }
  if ((out_stream = fdopen(out_fd, "a")) == NULL) {
    return -1;
  }
  if ((err_fd = dup(STDOUT_FILENO)) == -1) {
    return -1;
  }
  if ((err_stream = fdopen(err_fd, "a")) == NULL) {
    return -1;
  }

  new_out_fd = open(LOGFILE_STDOUT, O_WRONLY | O_CREAT, 0660);
  new_err_fd = open(LOGFILE_STDERR, O_WRONLY | O_CREAT, 0660);
  if (new_out_fd == -1 || new_err_fd == -1) {
    return -1;
  }
  if ((lseek(new_out_fd, 0, SEEK_END) == ((off_t) -1))
      || (lseek(new_err_fd, 0, SEEK_END) == ((off_t) -1))) {
    return -1;
  }
  if ((dup2(new_out_fd, STDOUT_FILENO) == -1)
      || (dup2(new_err_fd, STDERR_FILENO) == -1)) {
    return -1;
  }

  return 0;
}

int
redirect_output()
{
  if ((dup2(new_out_fd, STDOUT_FILENO) == -1)
      || (dup2(new_err_fd, STDERR_FILENO) == -1)) {
    return -1;
  }
  return 0;
}

int
restore_output()
{
  if ((dup2(out_fd, STDOUT_FILENO) == -1)
      || (dup2(err_fd, STDERR_FILENO) == -1)) {
    return -1;
  }
  return 0;
}

/* system_out:
 * call system() with output re-enabled.
 * output is again redirected before returning from here.
 */
int
system_out(const char *command)
{
  int ret = -1;
  if (restore_output() == -1) {
    return -1;
  }
  ret = system(command);
  if (redirect_output() == -1) {
    return -1;
  }
  return ret;
}

/**********************************************************/
