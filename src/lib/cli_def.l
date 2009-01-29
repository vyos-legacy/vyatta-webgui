%x action
%x expression
%x str
%option noyywrap
%{
#include "cli_val.h"
#include "cli_parse.h"

#define YY_DECL int real_yy_cli_def_lex(void)

#define BUF_INCREMENT 4096
static int action_buflen = 0;
static char *action_buf = NULL;
static char *action_ptr = NULL;
static int str_buflen = 0;
static char *str_buf = NULL;
static char *str_ptr = NULL;
static char str_delim = 0;
static int eof_seen = 0;
static int pre_str_state = 0;

static char *reg_fields[] = { "default", "tag", "type", "multi", "priority",
                              NULL };
static int reg_fields_t[] = { DEFAULT, TAG, TYPE, MULTI, PRIORITY, 0 };
static char *act_fields[] = { "help", "syntax", "commit",
                              "delete", "update", "activate", "create",
                              "begin", "end",
                              "comp_help", "allowed",
                              NULL };
static int act_fields_t[] = { HELP, SYNTAX, COMMIT,
                              ACTION, ACTION, ACTION, ACTION,
                              ACTION, ACTION,
                              DUMMY, DUMMY,
                              0 };
static int act_types[] = { -1, -1, -1,
                           delete_act, update_act, activate_act, create_act,
                           begin_act, end_act,
                           -1, -1,
                           -1 };

static char *type_names[] = { "txt", "u32", "ipv4", "ipv4net",
                              "ipv6", "ipv6net", "bool", "macaddr",
                              NULL };
static int type_t[] = { TEXT_TYPE, INT_TYPE, IPV4_TYPE, IPV4NET_TYPE,
                        IPV6_TYPE, IPV6NET_TYPE, BOOL_TYPE, MACADDR_TYPE, 0 };

static char *op_cond_strs[] = { "in", "==", "!=", "<", ">", "<=", ">=", NULL };
static int op_cond_types[] = { IN_COND, EQ_COND, NE_COND, LT_COND,
                               GT_COND, LE_COND, GE_COND, 0 };

static char *op_strs[] = { "pattern", "exec", ",", "||", "&&", "=", "!",
                           "(", ")", ";", NULL };
static int op_types[] = { PATTERN, EXEC, COMMA, OR, AND, ASSIGN,
                          NOT, LP, RP, SEMI, 0 };

static void
append_action(char *text)
{
  int tlen = strlen(text);
  if (((action_ptr + tlen) - action_buf) >= action_buflen) {
    action_buflen += BUF_INCREMENT;
    action_buf = realloc(action_buf, action_buflen);
    if (!action_buf) {
      printf("Failed to allocate memory\n");
      exit(-1);
    }
  }
  strcpy(action_ptr, text);
  action_ptr += tlen;
}

static void
append_str(char *text)
{
  int tlen = strlen(text);
  if (((str_ptr + tlen) - str_buf) >= str_buflen) {
    str_buflen += BUF_INCREMENT;
    str_buf = realloc(str_buf, str_buflen);
    if (!str_buf) {
      printf("Failed to allocate memory\n");
      exit(-1);
    }
  }
  strcpy(str_ptr, text);
  str_ptr += tlen;
}

static int
return_action()
{
  *action_ptr = 0;
  yy_cli_parse_lval.strp = strdup(action_buf);
  action_ptr = action_buf;
  return STRING;
}

static int
return_str(char str_delim)
{
  *str_ptr = 0;
  yy_cli_parse_lval.strp = strdup(str_buf);
  str_ptr = str_buf;
  return ((str_delim == '"') ? STRING : EX_STRING);
}

static int 
return_act_field(char *name)
{
  int idx = 0, ret = 0;
  char *fname = NULL;
  char *dname = strdup(name);
  char *ptr = strchr(dname, ':');
  if (ptr) {
    *ptr = 0;
  }
  while ((fname = act_fields[idx])) {
    if (strcmp(dname, fname) == 0) {
      if (act_types[idx] >= 0) {
        yy_cli_parse_lval.action = act_types[idx];
      }
      ret = act_fields_t[idx];
      break;
    }
    ++idx;
  }
  free(dname);
  return ret;
}

static int 
return_reg_field(char *name)
{
  int idx = 0, ret = 0;
  char *fname = NULL;
  char *dname = strdup(name);
  char *ptr = strchr(dname, ':');
  if (ptr) {
    *ptr = 0;
  }
  while ((fname = reg_fields[idx])) {
    if (strcmp(dname, fname) == 0) {
      ret = reg_fields_t[idx];
      break;
    }
    ++idx;
  }
  free(dname);
  return ret;
}

static int 
return_value(vtw_type_e type)
{
  yy_cli_parse_lval.val.free_me = TRUE;
  yy_cli_parse_lval.val.val = strdup(yy_cli_def_text);
  yy_cli_parse_lval.val.val_type = type;
  return VALUE;
}

%}

/* IPv4 address representation. */
RE_IPV4_BYTE	25[0-5]|2[0-4][0-9]|[01][0-9][0-9]|([0-9]{1,2})
RE_IPV4		{RE_IPV4_BYTE}(\.{RE_IPV4_BYTE}){3}
RE_IPV4_PREFIXLEN (3[012]|[12][0-9]|[0-9]) 
RE_IPV4NET	{RE_IPV4}"/"{RE_IPV4_PREFIXLEN}

/*
 * IPv6 address representation in Augmented Backus-Naur Form (ABNF)
 * as defined in RFC-2234. 
 * IPv6 address representation taken from RFC-3986.
 */
RE_H16		[a-fA-F0-9]{1,4}
RE_H16_COLON	{RE_H16}":"
RE_LS32		(({RE_H16}":"{RE_H16})|{RE_IPV4})
RE_IPV6_P1	{RE_H16_COLON}{6}{RE_LS32}
RE_IPV6_P2	"::"{RE_H16_COLON}{5}{RE_LS32}
RE_IPV6_P3	({RE_H16})?"::"{RE_H16_COLON}{4}{RE_LS32}
RE_IPV6_P4	({RE_H16_COLON}{0,1}{RE_H16})?"::"{RE_H16_COLON}{3}{RE_LS32}
RE_IPV6_P5	({RE_H16_COLON}{0,2}{RE_H16})?"::"{RE_H16_COLON}{2}{RE_LS32}
RE_IPV6_P6	({RE_H16_COLON}{0,3}{RE_H16})?"::"{RE_H16_COLON}{1}{RE_LS32}
RE_IPV6_P7	({RE_H16_COLON}{0,4}{RE_H16})?"::"{RE_LS32}
RE_IPV6_P8	({RE_H16_COLON}{0,5}{RE_H16})?"::"{RE_H16}
RE_IPV6_P9	({RE_H16_COLON}{0,6}{RE_H16})?"::"
RE_IPV6		{RE_IPV6_P1}|{RE_IPV6_P2}|{RE_IPV6_P3}|{RE_IPV6_P4}|{RE_IPV6_P5}|{RE_IPV6_P6}|{RE_IPV6_P7}|{RE_IPV6_P8}|{RE_IPV6_P9}
RE_IPV6_PREFIXLEN 12[0-8]|1[01][0-9]|[0-9][0-9]?
RE_IPV6NET	{RE_IPV6}"/"{RE_IPV6_PREFIXLEN}

/* Ethernet MAC address representation. */
RE_MACADDR	[a-fA-F0-9]{1,2}(:[a-fA-F0-9]{1,2}){5}

/*
 * URL-related regular expressions.
 * Implementation is based on the BNF-like specification from:
 * - RFC-1738: HTTP, FTP, FILE
 * - RFC-3617: TFTP
 * - RFC-3986: update of RFC-1738
 */
RE_URL		{RE_URL_FILE}|{RE_URL_FTP}|{RE_URL_HTTP}|{RE_URL_TFTP}

/* URL schemeparts for IP based protocols. */
RE_URL_LOGIN	({RE_URL_USER}(":"{RE_URL_PASSWORD})?"@")?{RE_URL_HOSTPORT}
RE_URL_HOSTPORT	{RE_URL_HOST}(":"{RE_URL_PORT})?
RE_URL_HOST	{RE_URL_HOSTNAME}|{RE_IPV4}|{RE_URL_IP_LITERAL}
RE_URL_IP_LITERAL "["({RE_IPV6}|{RE_URL_IPV_FUTURE})"]"
RE_URL_IPV_FUTURE "v"({RE_URL_HEXDIG})+"."({RE_URL_UNRESERVED}|{RE_URL_SUBDELIMS}|":")+
RE_URL_HOSTNAME	({RE_URL_DOMAINLABEL}".")*{RE_URL_TOPLABEL}
RE_URL_DOMAINLABEL {RE_URL_ALPHADIGIT}|{RE_URL_ALPHADIGIT}({RE_URL_ALPHADIGIT}|"-")*{RE_URL_ALPHADIGIT}
RE_URL_TOPLABEL	{RE_URL_ALPHA}|{RE_URL_ALPHA}({RE_URL_ALPHADIGIT}|"-")*{RE_URL_ALPHADIGIT}
RE_URL_ALPHADIGIT {RE_URL_ALPHA}|{RE_URL_DIGIT}
RE_URL_HOSTNUMBER {RE_URL_DIGITS}"."{RE_URL_DIGITS}"."{RE_URL_DIGITS}"."{RE_URL_DIGITS}
RE_URL_PORT	{RE_URL_DIGITS}
RE_URL_USER	({RE_URL_UCHAR}|";"|"?"|"&"|"=")*
RE_URL_PASSWORD	({RE_URL_UCHAR}|";"|"?"|"&"|"=")*

/* FILE URL regular expression. */
RE_URL_FILE	"file://"({RE_URL_HOST}|"localhost")?"/"{RE_URL_FPATH}

/* FTP URL regular expression. */
RE_URL_FTP	"ftp://"{RE_URL_LOGIN}("/"{RE_URL_FPATH}(";type="{RE_URL_FTPTYPE})?)?
RE_URL_FPATH	{RE_URL_FSEGMENT}("/"{RE_URL_FSEGMENT})*
RE_URL_FSEGMENT	({RE_URL_UCHAR}|"?"|":"|"@"|"&"|"=")*
RE_URL_FTPTYPE	"A"|"I"|"D"|"a"|"i"|"d"

/* HTTP URL regular expression. */
RE_URL_HTTP	"http://"{RE_URL_HOSTPORT}("/"{RE_URL_HPATH}("?"{RE_URL_SEARCH})?)?
RE_URL_HPATH	{RE_URL_HSEGMENT}("/"{RE_URL_HSEGMENT})*
RE_URL_HSEGMENT	({RE_URL_UCHAR}|";"|":"|"@"|"&"|"=")*
RE_URL_SEARCH	({RE_URL_UCHAR}|";"|":"|"@"|"&"|"=")*

/* TFTP URL regular expression. */
RE_URL_TFTP	"tftp://"{RE_URL_HOST}"/"{RE_URL_TFTP_FILE}({RE_URL_TFTP_MODE})?
RE_URL_TFTP_MODE ";""mode="("netascii"|"octet")
RE_URL_TFTP_FILE ({RE_URL_UNRESERVED}|{RE_URL_ESCAPE})*

/* URL-related miscellaneous definitions. */
RE_URL_LOWALPHA	[a-z]
RE_URL_HIALPHA	[A-Z]
RE_URL_ALPHA	{RE_URL_LOWALPHA}|{RE_URL_HIALPHA}
RE_URL_DIGIT	[0-9]
RE_URL_SAFE	"$"|"-"|"_"|"."|"+"
RE_URL_EXTRA	"!"|"*"|"'"|"("|")"|","
RE_URL_NATIONAL	"{"|"}"|"|"|"\"|"^"|"~"|"["|"]"|"`"
RE_URL_PUNCTUATION "<"|">"|"#"|"%"|<">
RE_URL_RESERVED	";"|"/"|"?"|":"|"@"|"&"|"="
RE_URL_HEXDIG	{RE_URL_DIGIT}|[A-F]|[a-f]
RE_URL_ESCAPE	"%"{RE_URL_HEXDIG}{RE_URL_HEXDIG}
RE_URL_UNRESERVED {RE_URL_ALPHA}|{RE_URL_DIGIT}|{RE_URL_SAFE}|{RE_URL_EXTRA}
RE_URL_UCHAR	{RE_URL_UNRESERVED}|{RE_URL_ESCAPE}
RE_URL_XCHAR	{RE_URL_UNRESERVED}|{RE_URL_RESERVED}|{RE_URL_ESCAPE}
RE_URL_DIGITS	{RE_URL_DIGIT}{1,}
RE_URL_SUBDELIMS "!"|"$"|"&"|"'"|"("|")"|"*"|"+"|","|";"|"="

/* type names */
RE_TYPE_NAME (txt|u32|ipv4|ipv4net|ipv6|ipv6net|bool|macaddr)

/* values */
RE_VAL_U32 [0-9]+
RE_VAL_BOOL (true|false)

/* operators */
RE_OP_COND (==|!=|<|>|<=|>=|in)
RE_OP_OTHER (pattern|exec|,|\|\||&&|=|!|\(|\)|;)

/* template fields */
RE_REG_FIELD (default|tag|type|multi|priority)
RE_ACT_FIELD (help|syntax|commit|delete|update|activate|create|begin|end|comp_help|allowed)

%%

#[^\n]*\n {
    /* comment */
    ++yy_cli_def_lineno;
  }

\n {
    ++yy_cli_def_lineno;
    return EOL;
  }

{RE_REG_FIELD}:[ \t]* {
    return return_reg_field(yy_cli_def_text);
  }

<INITIAL>[\`\"] {
    BEGIN(str);
    pre_str_state = INITIAL;
    str_delim = yy_cli_def_text[0];
  }

<expression>[\`\"] {
    BEGIN(str);
    pre_str_state = expression;
    str_delim = yy_cli_def_text[0];
  }

<str>[\"\`] {
    if (str_delim == yy_cli_def_text[0]) {
      BEGIN(pre_str_state);
      return return_str(str_delim);
    } else {
      char tmp[2] = { yy_cli_def_text[0], 0 };
      append_str(tmp);
    }
  }

<str>\\\n {
    ++yy_cli_def_lineno;
    /* continuation */
  }

<str>\\. {
    unsigned int i = 0;
    unsigned char tbl[256];
    unsigned char c = 0;
    char tmp[2] = { 0, 0 };
    for (i = 0; i < 256; i++) {
      tbl[i] = i;
    }
    c = 'n'; tbl[c] = '\n';
    c = 't'; tbl[c] = '\t';
    c = 'r'; tbl[c] = '\r';
    c = 'b'; tbl[c] = '\b';
    c = 'f'; tbl[c] = '\f';
    /* note: can't have "[[" or "]]" (confuses m4) */
    tmp[0] = tbl[ (int) yy_cli_def_text[1] ];
    append_str(tmp);
  }

<str>[^\"\`\\]+ {
    append_str(yy_cli_def_text);
  }

<str><<EOF>> {
    BEGIN(INITIAL);
    return return_str(str_delim);
  }

{RE_ACT_FIELD}:expression:[ \t]* {
    BEGIN(expression);
    return return_act_field(yy_cli_def_text);
  }

{RE_ACT_FIELD}:[ \t]* {
    BEGIN(action);
    return return_act_field(yy_cli_def_text);
  }

<expression>\n(({RE_REG_FIELD}|{RE_ACT_FIELD}):|#).* {
    int i = 0;
    char *tmp = strdup(yy_cli_def_text);
    BEGIN(INITIAL);
    for (i = yy_cli_def_leng - 1; i >= 0; --i) {
      unput( tmp[i] );
    }
    free(tmp);
  }

<expression>\n {
    /* skip the \n */
    ++yy_cli_def_lineno;
  }

<expression><<EOF>> {
    BEGIN(INITIAL);
    eof_seen = 1;
    return EOL;
  }

<action>\n(({RE_REG_FIELD}|{RE_ACT_FIELD}):|#).* {
    int i = 0;
    char *tmp = strdup(yy_cli_def_text);
    BEGIN(INITIAL);
    for (i = yy_cli_def_leng - 1; i >= 0; --i) {
      unput( tmp[i] );
    }
    free(tmp);
    return return_action();
  }

<action>\n?.* {
    if (yy_cli_def_text[0] == '\n') {
      ++yy_cli_def_lineno;
    }
    append_action(yy_cli_def_text);
  }

<action><<EOF>> {
    BEGIN(INITIAL);
    return return_action();
  }

<<EOF>> {
    if (eof_seen) {
      eof_seen = 0;
      yyterminate();
    }
    eof_seen = 1;
    return EOL;
  }

<INITIAL,expression>[ \t]+ { /* space */ }

<expression>\\\n {
    /* continuation */
    ++yy_cli_def_lineno;
  }

{RE_TYPE_NAME} {
    int i = 0;
    while (type_names[i]) {
      if (strcmp(type_names[i], yy_cli_def_text) == 0) {
        yy_cli_parse_lval.type = type_t[i];
        return TYPE_DEF;
      }
      i++;
    }
  }

<expression>{RE_OP_COND} {
    int i = 0;
    while (op_cond_strs[i]) {
      if (strcmp(op_cond_strs[i], yy_cli_def_text) == 0) {
        yy_cli_parse_lval.cond = op_cond_types[i];
        return COND;
      }
      i++;
    }
  }

<INITIAL,expression>{RE_OP_OTHER} {
    int i = 0;
    while (op_strs[i]) {
      if (strcmp(op_strs[i], yy_cli_def_text) == 0) {
        return op_types[i];
      }
      i++;
    }
  }

<expression>\$VAR\([^)]+\) {
    yy_cli_parse_lval.strp = strdup(yy_cli_def_text);
    return VAR;
  }

<INITIAL,expression>{RE_VAL_U32}  { return return_value(INT_TYPE); }
<INITIAL,expression>{RE_IPV4}     { return return_value(IPV4_TYPE); }
<INITIAL,expression>{RE_IPV4NET}  { return return_value(IPV4NET_TYPE); }
<INITIAL,expression>{RE_IPV6}     { return return_value(IPV6_TYPE); }
<INITIAL,expression>{RE_IPV6NET}  { return return_value(IPV6NET_TYPE); }
<INITIAL,expression>{RE_VAL_BOOL} { return return_value(BOOL_TYPE); }
<INITIAL,expression>{RE_MACADDR}  { return return_value(MACADDR_TYPE); }

<*>. {
    return SYNTAX_ERROR;
  }

%%

static void
init_bufs()
{
  action_buf = malloc(BUF_INCREMENT);
  action_ptr = action_buf;
  action_buflen = BUF_INCREMENT;
  
  str_buf = malloc(BUF_INCREMENT);
  str_ptr = str_buf;
  str_buflen = BUF_INCREMENT;
  
  if (!action_buf || !str_buf) {
    printf("Failed to allocate memory\n");
    exit(-1);
  }
}

int
yy_cli_def_lex()
{
  if (!action_buf) {
    init_bufs();
  }
  return real_yy_cli_def_lex();
}

#if 0
#define STANDALONE_TEST
#endif
#ifdef STANDALONE_TEST
/* build:
   flex -d --prefix=yy_cli_def_ -o cli_def.c cli_def.l && gcc -o test_def
     cli_def.c cli_parse.o cli_new.o cli_objects.o cli_path_utils.o
     cli_val_engine.o cli_val.o
 */
int
main(int argc, char *argv[])
{
  int token = 0;
  yy_cli_def_in = fopen(argv[1], "r");
  while((token = yy_cli_def_lex()) > 0) {
    printf("token[%d]\n", token);
  }
  return 0;
}
#endif

