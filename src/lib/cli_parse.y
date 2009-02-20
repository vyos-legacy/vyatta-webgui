%{
#include <assert.h>
#include <stdio.h>
#include <string.h>
#include <errno.h>
#include <stdlib.h>

#define __USE_ISOC99
#include <limits.h>

#include "cli_val.h"

extern int yy_cli_def_lineno;
extern char *yy_cli_def_text;
static vtw_def *parse_defp;
static int parse_status; 
static boolean cli_def_type_only=0; /*{ if (cli_def_type_only) YYACCEPT;}*/
/* XXX: sigh, the -p flag to yacc should do this for us kkkk*/
#define yystacksize tpltstacksize
#define yysslim tpltsslim

/* forward prototypes */
extern int yy_cli_parse_parse();
extern int yy_cli_def_lex();
extern void yy_cli_parse_error(const char *);
static  void cli_deferror(const char *);
 extern FILE *yy_cli_def_in;
#define YYDEBUG 1
#define yy_cli_parse_lex yy_cli_def_lex
%}
%token EOL
%token MULTI
%token TAG
%token TYPE
%token HELP
%token DEFAULT
%token PRIORITY
%token PATTERN
%token EXEC
%token SYNTAX
%token COMMIT
%token CHECK
%token DUMMY
%left SEMI
%token <val>VALUE
%token <type>TYPE_DEF
%token <strp>VAR
%token <strp> STRING
%token <strp> EX_STRING
%token SYNTAX_ERROR
%token <action>ACTION
%left ASSIGN
%left OR
%left AND
%right NOT
%left COMMA
%nonassoc <cond>COND
%token RP
%token LP
%type <nodep> val
%type <nodep> exp
%type <val>   val0
%type <nodep> action
%type <nodep> action0

%union {
  char *strp;
  valstruct val;
  vtw_type_e type;
  vtw_cond_e cond;
  vtw_node *nodep;
  vtw_act_type action;
}

%%

input:          tag 
                | EOL input
                | tag otherinput
		;

otherinput:     type EOL 
                | cause EOL
                | otherinput type EOL 
                | otherinput cause EOL
                | otherinput EOL
                | EOL
		| syntax_error 
		;

tag:            /* empty */
		| TAG EOL {parse_defp->tag = TRUE;}
		| MULTI EOL {parse_defp->multi = TRUE;}
		;

type:	      	TYPE TYPE_DEF SEMI STRING
		{ parse_defp->def_type = $2; 
                  parse_defp->def_type_help = $4; }
		;


type:	      	TYPE TYPE_DEF
		{ parse_defp->def_type = $2; 
                }
		;

cause:		help_cause
		| default_cause
		| priority_stmt
		| syntax_cause
                | ACTION action { append(parse_defp->actions + $1, $2, 0);}
                | dummy_stmt
		;

dummy_stmt:     DUMMY STRING { /* ignored */ }
                ;

help_cause:	HELP STRING 
                { parse_defp->def_node_help = $2; /* no semantics for now */ 
                }

default_cause:  DEFAULT VALUE 
		{
		   if ($2.val_type != parse_defp->def_type)
		     yy_cli_parse_error((const char *)"Bad default\n");
		   parse_defp->def_default = $2.val;
		}
default_cause:  DEFAULT STRING 
		{
		   if (TEXT_TYPE != parse_defp->def_type)
		     yy_cli_parse_error((const char *)"Bad default\n");
		   parse_defp->def_default = $2;
		}

priority_stmt:  PRIORITY VALUE
                {
                  char *tmp = $2.val;
                  long long int cval = 0;
                  char *endp = NULL;
                  errno = 0;
                  cval = strtoll(tmp, &endp, 10);
                  if (($2.val_type != INT_TYPE)
                      || (errno == ERANGE
                          && (cval == LLONG_MAX || cval == LLONG_MIN))
                      || (errno != 0 && cval == 0)
                      || (*endp != '\0') || (cval < 0) || (cval > UINT_MAX)) {
                    yy_cli_parse_error((const char *)
                                       "Priority must be <u32>\n");
                  } else {
                    parse_defp->def_priority = cval;
                  }
                }

syntax_cause:   SYNTAX exp {append(parse_defp->actions + syntax_act, $2, 0);}
		;

syntax_cause:   COMMIT exp {append(parse_defp->actions + syntax_act, $2, 1);}
		;

action0:        STRING { $$ = make_node(EXEC_OP, make_str_node($1),NULL);}
                ;
action:         action0
                | action0 SEMI STRING 
                   {$$ = make_node(HELP_OP, $1, make_str_node($3));}
                | exp 
                ;
exp:		  LP exp RP 
		   {$$=$2;}
		| exp AND exp {$$ = make_node(AND_OP,$1,$3);}
		| exp OR exp {$$ = make_node(OR_OP,$1,$3);}
		| val COND val 
		   {$$ = make_node(COND_OP,$1,$3);$$->vtw_node_aux = $2;}
		| PATTERN VAR STRING 
		   { $$ = make_node(PATTERN_OP,make_var_node($2),
				     make_str_node($3));}
		| EXEC STRING
		   { $$ = make_node(EXEC_OP,make_str_node($2),NULL);}
		| NOT exp {$$ = make_node(NOT_OP,$2,NULL);}
                | exp SEMI STRING 
                   {$$ = make_node(HELP_OP, $1, make_str_node($3));}
                | VAR ASSIGN val
                   {$$ = make_node(ASSIGN_OP, make_var_node($1), $3);}
		;

val:		  VAR {$$ = make_var_node($1);}
                | val0 {$$ = make_val_node(&($1));}
                | EX_STRING {$$=make_str_node0($1, B_QUOTE_OP);}
		;

val0:           VALUE 

                | val0 COMMA val0 { add_val(&($1), &($3)); $$=$1; }

		| STRING {$$ = str2val($1);}
                ;

syntax_error:	  SYNTAX_ERROR {
			cli_deferror("syntax error");
		}
		;


%%
char *parse_path;
int parse_def(vtw_def *defp, char *path, boolean type_only)
{
   int status;
   yy_cli_def_lineno = 1;
   parse_status = 0;
   parse_defp = defp;
   cli_def_type_only = type_only;
   yy_cli_def_in = fopen(path, "r");
#if 0
   yy_cli_parse_debug = 1;
#endif
   if (!yy_cli_def_in)
     return -5;
   parse_path = path;
   status = yy_cli_parse_parse(); /* 0 is OK */
   fclose(yy_cli_def_in);
   return status;
}
static void
cli_deferror(const char *s)
{
  printf("Error: %s in file [%s], line %d, last token [%s]\n",s, parse_path, 
	 yy_cli_def_lineno, yy_cli_def_text);
}

void yy_cli_parse_error(const char *s)
{
  cli_deferror(s);
}
  
  



