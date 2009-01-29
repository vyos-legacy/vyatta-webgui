%{
#define __USE_ISOC99
#include <limits.h>

#include "cli_val.h"
#include "cli_parse.h"
#include "cli_objects.h"
static void make_val_value(vtw_type_e type);
#define YY_INPUT(buf,result,max_size) (result)=cli_val_read((buf), (max_size))
%}
%option noyywrap
%option nounput
%option never-interactive

/*
 * Regular expressions of IP and MAC addresses, URLs, etc.
 */

/*
 * IPv4 address representation.
 */
RE_IPV4_BYTE	25[0-5]|2[0-4][0-9]|[01][0-9][0-9]|([0-9]{1,2})
RE_IPV4		{RE_IPV4_BYTE}(\.{RE_IPV4_BYTE}){3}
RE_IPV4_PREFIXLEN (3[012]|[12][0-9]|[0-9]) 
RE_IPV4NET	{RE_IPV4}"/"{RE_IPV4_PREFIXLEN}

/*
 * IPv6 address representation in Augmented Backus-Naur Form (ABNF)
 * as defined in RFC-2234. 
 * IPv6 address representation taken from RFC-3986:
 *
 *  IPv6address   =                            6( h16 ":" ) ls32
 *                /                       "::" 5( h16 ":" ) ls32
 *                / [               h16 ] "::" 4( h16 ":" ) ls32
 *                / [ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
 *                / [ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
 *                / [ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
 *                / [ *4( h16 ":" ) h16 ] "::"              ls32
 *                / [ *5( h16 ":" ) h16 ] "::"              h16
 *                / [ *6( h16 ":" ) h16 ] "::"
 *
 *  h16           = 1*4HEXDIG
 *  ls32          = ( h16 ":" h16 ) / IPv4address
 *  IPv4address   = dec-octet "." dec-octet "." dec-octet "." dec-octet
 *  dec-octet     = DIGIT                  ; 0-9
 *                 / %x31-39 DIGIT         ; 10-99
 *                 / "1" 2DIGIT            ; 100-199
 *                 / "2" %x30-34 DIGIT     ; 200-249
 *                 / "25" %x30-35          ; 250-255
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

/*
 * Ethernet MAC address representation.
 */
RE_MACADDR	[a-fA-F0-9]{1,2}(:[a-fA-F0-9]{1,2}){5}

/*
 * URL-related regular expressions.
 *
 * Implementation is based on the BNF-like specification from:
 * - RFC-1738: HTTP, FTP, FILE
 * - RFC-3617: TFTP
 * - RFC-3986: update of RFC-1738
 */
RE_URL		{RE_URL_FILE}|{RE_URL_FTP}|{RE_URL_HTTP}|{RE_URL_TFTP}

/*
 * URL schemeparts for IP based protocols.
 * Representation taken from RFC-1738, and some of it is updated by RFC-3986.
 *
 * login          = [ user [ ":" password ] "@" ] hostport
 * hostport       = host [ ":" port ]
 * host           = hostname | hostnumber
 * hostname       = *[ domainlabel "." ] toplabel
 * domainlabel    = alphadigit | alphadigit *[ alphadigit | "-" ] alphadigit
 * toplabel       = alpha | alpha *[ alphadigit | "-" ] alphadigit
 * alphadigit     = alpha | digit
 * hostnumber     = digits "." digits "." digits "." digits
 * port           = digits
 * user           = *[ uchar | ";" | "?" | "&" | "=" ]
 * password       = *[ uchar | ";" | "?" | "&" | "=" ]
 */
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

/*
 * FILE URL regular expression.
 * Representation taken from RFC-1738.
 *
 * fileurl        = "file://" [ host | "localhost" ] "/" fpath
 */
RE_URL_FILE	"file://"({RE_URL_HOST}|"localhost")?"/"{RE_URL_FPATH}

/*
 * FTP URL regular expression.
 * Representation taken from RFC-1738.
 *
 * ftpurl         = "ftp://" login [ "/" fpath [ ";type=" ftptype ] ]
 * fpath          = fsegment *[ "/" fsegment ]
 * fsegment       = *[ uchar | "?" | ":" | "@" | "&" | "=" ]
 * ftptype        = "A" | "I" | "D" | "a" | "i" | "d"
 */
RE_URL_FTP	"ftp://"{RE_URL_LOGIN}("/"{RE_URL_FPATH}(";type="{RE_URL_FTPTYPE})?)?
RE_URL_FPATH	{RE_URL_FSEGMENT}("/"{RE_URL_FSEGMENT})*
RE_URL_FSEGMENT	({RE_URL_UCHAR}|"?"|":"|"@"|"&"|"=")*
RE_URL_FTPTYPE	"A"|"I"|"D"|"a"|"i"|"d"

/*
 * HTTP URL regular expression.
 * Representation taken from RFC-1738.
 *
 * httpurl        = "http://" hostport [ "/" hpath [ "?" search ] ]
 * hpath          = hsegment *[ "/" hsegment ]
 * hsegment       = *[ uchar | ";" | ":" | "@" | "&" | "=" ]
 * search         = *[ uchar | ";" | ":" | "@" | "&" | "=" ]
 */
RE_URL_HTTP	"http://"{RE_URL_HOSTPORT}("/"{RE_URL_HPATH}("?"{RE_URL_SEARCH})?)?
RE_URL_HPATH	{RE_URL_HSEGMENT}("/"{RE_URL_HSEGMENT})*
RE_URL_HSEGMENT	({RE_URL_UCHAR}|";"|":"|"@"|"&"|"=")*
RE_URL_SEARCH	({RE_URL_UCHAR}|";"|":"|"@"|"&"|"=")*

/*
 * TFTP URL regular expression.
 * Representation taken from RFC-3617.
 *
 * tftpURI         = "tftp://" host "/" file [ mode ]
 * mode            = ";"  "mode=" ( "netascii" / "octet" )
 * file            = *( unreserved / escaped )
 * host            = <as specified by RFC 2732 [3]>
 * unreserved      = <as specified in RFC 2396 [4]>
 * escaped         = <as specified in RFC 2396>
 */
RE_URL_TFTP	"tftp://"{RE_URL_HOST}"/"{RE_URL_TFTP_FILE}({RE_URL_TFTP_MODE})?
RE_URL_TFTP_MODE ";""mode="("netascii"|"octet")
RE_URL_TFTP_FILE ({RE_URL_UNRESERVED}|{RE_URL_ESCAPE})*

/*
 * URL-related miscellaneous definitions.
 * Representation taken from RFC-1738 and from RFC-3986.
 *
 * lowalpha       = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" |
 *                  "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" |
 *                  "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" |
 *                  "y" | "z"
 * hialpha        = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" |
 *                  "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" |
 *                  "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z"
 * alpha          = lowalpha | hialpha
 * digit          = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" |
 *                  "8" | "9"
 * safe           = "$" | "-" | "_" | "." | "+"
 * extra          = "!" | "*" | "'" | "(" | ")" | ","
 * national       = "{" | "}" | "|" | "\" | "^" | "~" | "[" | "]" | "`"
 * punctuation    = "<" | ">" | "#" | "%" | <">
 *
 *
 * reserved       = ";" | "/" | "?" | ":" | "@" | "&" | "="
 * hex            = digit | "A" | "B" | "C" | "D" | "E" | "F" |
 *                  "a" | "b" | "c" | "d" | "e" | "f"
 * escape         = "%" hex hex
 *
 * unreserved     = alpha | digit | safe | extra
 * uchar          = unreserved | escape
 * xchar          = unreserved | reserved | escape
 * digits         = 1*digit
 *
 * sub-delims     = "!" / "$" / "&" / "'" / "(" / ")"
 *                / "*" / "+" / "," / ";" / "="
 */
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


%%
::	{
        make_val_value(IPV6_TYPE);
	return VALUE;
	}

true	{
        make_val_value(BOOL_TYPE);
	return VALUE;
	}

false	{
        make_val_value(BOOL_TYPE);
	return VALUE;
	}

[0-9]+	{
        long long int cval = 0;
        char *endp = NULL;
        errno = 0;
        cval = strtoll(yytext, &endp, 10);
        if ((errno == ERANGE && (cval == LLONG_MAX || cval == LLONG_MIN))
            || (errno != 0 && cval == 0)
            || (*endp != '\0') || (cval < 0) || (cval > UINT_MAX)) {
          return SYNTAX_ERROR;
        }
        make_val_value(INT_TYPE);
	return VALUE;
	}

{RE_IPV4}	{
        make_val_value(IPV4_TYPE);
	return VALUE;
	}

{RE_IPV4NET} {
        make_val_value(IPV4NET_TYPE);
	return VALUE;
	}

{RE_IPV6}	{
        make_val_value(IPV6_TYPE);
	return VALUE;
	}

{RE_IPV6NET} {
        make_val_value(IPV6NET_TYPE);
	return VALUE;
	}

{RE_MACADDR}	{
        make_val_value(MACADDR_TYPE);
	return VALUE;
	}

\\\n    /* whitespace */

[ \t]+ /*whitespace */
\n     return EOL;
.	{
	/* everything else is a syntax error */
	return SYNTAX_ERROR;
	}


%%
static void make_val_value(vtw_type_e type)
{
   memset(get_cli_value_ptr(), 0, sizeof(valstruct));
   get_cli_value_ptr()->free_me = TRUE;
   get_cli_value_ptr()->val = my_strdup(yytext, "cli_val.l");
   get_cli_value_ptr()->val_type = type;
}


















