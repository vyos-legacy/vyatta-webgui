#ifndef CLI_DEF_H
#define CLI_DEF_H

#define BITWISE 0 /* no partial commit */

#define boolean int
#define TRUE 1
#define FALSE 0

/* allocation unit for vals in valstruct */
#define MULTI_ALLOC 5 /* we have room if cnt%MULTI_ALLOC != 0 */

typedef enum {
  do_del_mode,
  del_mode,
  create_mode,
  update_mode
}vtw_cmode;
typedef enum {
  ERROR_TYPE,
  INT_TYPE,
  IPV4_TYPE,
  IPV4NET_TYPE,
  IPV6_TYPE,
  IPV6NET_TYPE,
  MACADDR_TYPE,
  DOMAIN_TYPE,  /*end of addr types */
  TEXT_TYPE,
  BOOL_TYPE
}vtw_type_e;

typedef enum {
  EQ_COND = 1,
  NE_COND,
  LT_COND,
  LE_COND,
  GT_COND,
  GE_COND,
  IN_COND, 
  TOP_COND
}vtw_cond_e;
/* IN_COND is like EQ for singular compare, but OR for multivalue right operand */

typedef enum {
  LIST_OP,  /* right is next, left is list elem */
  HELP_OP,  /* right is help string, left is elem */
  EXEC_OP, /* left command string, right help string */
  PATTERN_OP,  /* left to var, right to pattern */
  OR_OP,    
  AND_OP,
  NOT_OP,
  COND_OP,   /* aux field specifies cond type (GT, GE, etc.)*/
  VAL_OP,    /* for strings used in other nodes */
  VAR_OP,    /* string points to var */
  B_QUOTE_OP, /* string points to operand to be executed */
  ASSIGN_OP  /* left to var, right to exp */
}vtw_oper_e;

typedef struct {
  vtw_type_e val_type;
  char      *val;
  int        cnt;  /* >0 means multivalue */
  char     **vals; /* We might union with val */
  boolean    free_me;
}valstruct;

typedef struct vtw_node{
  vtw_oper_e       vtw_node_oper;
  struct vtw_node *vtw_node_left;
  struct vtw_node *vtw_node_right;
  char            *vtw_node_string;
  int              vtw_node_aux;
  vtw_type_e       vtw_node_type;
  valstruct        vtw_node_val; /* we'll union it later */
}vtw_node;

typedef struct {
  vtw_node *vtw_list_head;
  vtw_node *vtw_list_tail;
}vtw_list;

typedef struct {
  int  t_lev;
  int  m_lev;
}vtw_mark;

typedef enum {
  delete_act,
  create_act,
  activate_act,
  update_act,
  syntax_act,
  commit_act,
  begin_act,
  end_act,
  top_act
}vtw_act_type;

typedef struct {
  vtw_type_e def_type;
  char      *def_type_help;
  char      *def_node_help;
  char      *def_default;
  unsigned int def_priority;
  boolean    tag;
  boolean    multi;
  vtw_list   actions[top_act];
}vtw_def;

typedef struct {
  const char *f_segp;
  int   f_seglen;
  int   f_segoff;
} first_seg;
/* the first segment might be ADIR, or CDIR, or MDIR 
   we reserve space large enough for any one. 
   If the shorter one is used, it right aligned.
   path points to the start of the current first 
   segment 
*/
typedef struct {
  char *path_buf;       /* path buffer */
  char *path;           /* path */
  int   path_len;       /* path length used */
  int   path_alloc;     /* allocated - 1*/
  int  *path_ends;       /* path ends for dif levels*/
  int   path_lev;       /* how many used */
  int   path_ends_alloc; /* how many allocated */
  int   print_offset;  /* for additional optional output information */
} vtw_path;  /* vyatta tree walk */

typedef struct {
  int   num;
  int   partnum;
  void **ptrs;
  unsigned int  *parts;
}vtw_sorted;

extern int char2val(vtw_def *def, char *value, valstruct *valp);
extern int get_value(char **valpp, vtw_path *pathp);
extern int get_value_to_at_string(vtw_path *pathp);
extern vtw_node * make_node(vtw_oper_e oper, vtw_node *left, 
			    vtw_node *right);
extern vtw_node *make_str_node(char *str);
extern vtw_node *make_var_node(char *str);
extern vtw_node *make_str_node0(char *str, vtw_oper_e op);
extern void append(vtw_list *l, vtw_node *n, int aux);
extern int parse_def(vtw_def *defp, char *path, boolean type_only);

extern int yy_cli_val_lex(void);
extern void cli_val_start(char *s);
extern void cli_val_done(void);
extern void init_path(vtw_path *path, const char *root);
extern void pop_path(vtw_path *path);
extern void push_path(vtw_path *path, const char *segm);
extern void push_path_no_escape(vtw_path *path, char *segm);
extern void free_def(vtw_def *defp);
extern void free_sorted(vtw_sorted *sortp);

extern vtw_path m_path, t_path;

/*************************************************
     GLOBAL FUNCTIONS
***************************************************/
extern void add_val(valstruct *first, valstruct *second);
extern int cli_val_read(char *buf, int max_size);
extern vtw_node *make_val_node(valstruct *val);
extern valstruct str2val(char *cp);
extern void dump_tree(vtw_node *node, int lev);
extern void dump_def(vtw_def *defp);
extern boolean val_cmp(const valstruct *left, const valstruct *right,
		       vtw_cond_e cond);
extern void out_of_memory(void)  __attribute__((noreturn));
extern void subtract_values(char **lhs, const char *rhs);
extern boolean validate_value(vtw_def *def, 
			      char *value);
extern void internal_error(int line, const char *file)
  __attribute__((noreturn));
extern void done(void);
extern void del_value(vtw_def *defp, char *cp);
extern void bye(const char *msg, ...) 
  __attribute__((format(printf, 1, 2), noreturn));
extern void print_msg(const char *msg, ...)
  __attribute__((format(printf, 1, 2)));
extern void switch_path(first_seg *seg);
extern void vtw_sort(valstruct *valp, vtw_sorted *sortp);
extern void free_val(valstruct *val);
extern void touch(void);
extern int mkdir_p(const char *path);

extern const char *type_to_name(vtw_type_e type);
extern boolean execute_list(vtw_node *cur, vtw_def *def);
extern void touch_dir(const char *dp);
extern void touch_file(const char *name);

extern void copy_path(vtw_path *to, vtw_path *from);
extern void free_path(vtw_path *path);

void mark_paths(vtw_mark *markp);
void restore_paths(vtw_mark *markp);

extern int get_config_lock(void);

#define    VTWERR_BADPATH  -2 
#define    VTWERR_OK     0
#define    TAG_NAME "node.tag"
#define    DEF_NAME "node.def"
#define    VAL_NAME "node.val"
#define    MOD_NAME ".modified"
#define    OPQ_NAME ".wh.__dir_opaque"

#define INTERNAL  internal_error(__LINE__, __FILE__)

/*** output ***/
#define LOGFILE_STDOUT "/tmp/cfg-stdout.log"
#define LOGFILE_STDERR "/tmp/cfg-stderr.log"

extern int out_fd;
extern FILE *out_stream;
extern FILE *err_stream;

extern int initialize_output(void);

/* debug hooks? */
#define my_malloc(size, name)		malloc(size)
#define my_realloc(ptr, size, name)	realloc(ptr, size)
#define my_strdup(str, name)		strdup(str)
#define my_free(ptr)			free(ptr)

/*** debug ***/
#undef CLI_DEBUG
#ifdef CLI_DEBUG
#define DPRINT(fmt, arg...)	printf(fmt, #arg)
extern void dump_log(int argc, char **argv);
#else
#define DPRINT(fmt, arg...)	while (0) { printf(fmt, ##arg); }
#define dump_log(argc, argv)
#endif
#endif
