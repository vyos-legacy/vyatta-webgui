// -*- c-basic-offset: 4; tab-width: 8; indent-tabs-mode: t -*-

// Copyright (c) 2001-2007 International Computer Science Institute
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software")
// to deal in the Software without restriction, subject to the conditions
// listed in the XORP LICENSE file. These conditions include: you must
// preserve this copyright notice, and you cannot mention the copyright
// holders in advertising related to the Software without their permission.
// The Software is provided WITHOUT ANY WARRANTY, EXPRESS OR IMPLIED. This
// notice is a summary of the XORP LICENSE file; the license in that file is
// legally binding.

#ident "$XORP$"

#include "libxorp_module.h"
#include "libxorp/xorp.h"
#include "libxorp/xlog.h"

#include <vector>

#include "c_format.hh"


using namespace std;


#ifndef HOST_OS_WINDOWS
#define HAVE_C99_SNPRINTF	// [v]snprintf() conforms to ISO C99 spec
#endif

#define FORMAT_BUFSIZE	4096

void
c_format_validate(const char* fmt, int exp_count)
{
    const char *p = fmt;
    int state = 0;
    int count = 0;
    
    while(*p != 0) {
	if (state == 0) {
	    if (*p == '%') {
		count++;
		state = 1;
	    }
	} else {
	    switch (*p) {
	    case 'd':
	    case 'i':
	    case 'o':
	    case 'u':
	    case 'x':
	    case 'X':
	    case 'D':
	    case 'O':
	    case 'U':
	    case 'e':
	    case 'E':
	    case 'f':
	    case 'g':
	    case 'G':
	    case 'c':
	    case 's':
	    case 'p':
		//parameter type specifiers
		state = 0;
		break;
	    case '%':
		//escaped percent
		state = 0;
		count--;
		break;
	    case 'n':
		//we don't permit %n
		fprintf(stderr, "%%n detected in c_format()\n");
		abort();
	    case '*':
		//field width or precision also needs a parameter
		count++;
		break;
	    }
	}
	p++;
    }
    if (exp_count != count) {
	abort();
    }
}

char *c_format_buf = (char *) 0;
size_t c_format_buf_size = FORMAT_BUFSIZE;             // Default buffer size

string
do_c_format(const char* fmt, ...)
{
    va_list ap;

    if (!c_format_buf)
	c_format_buf = (char *) malloc(c_format_buf_size);

    do {
	va_start(ap, fmt);
	int ret = vsnprintf(&c_format_buf[0], c_format_buf_size, fmt, ap);
#ifndef HAVE_C99_SNPRINTF
	// We have an evil vsnprintf() implementation (MSVC)
	if (ret != -1 && ((size_t)ret < c_format_buf_size)) {
	    string r = string(&c_format_buf[0]);	// Buffer size is OK
	    va_end(ap);
	    return r;
	}
	c_format_buf_size += FORMAT_BUFSIZE;
#else	// HAVE_C99_SNPRINTF
	// We have a C99 compliant implementation
	if ((size_t)ret < c_format_buf_size) {
	    string r = string(&c_format_buf[0]);	// Buffer size is OK
	    va_end(ap);
	    return r;
	}
	c_format_buf_size = ret + 1;
#endif	// HAVE_C99_SNPRINTF
	// Try a larger buffer...
	free(c_format_buf);
	c_format_buf = (char *) malloc(c_format_buf_size);
    } while (true);

    XLOG_UNREACHABLE();
}

#ifdef TESTING_C_FORMAT_123
int main(int, char**)
{
    c_format("%d", 3);

    printf("%s", c_format("hello%%\n").c_str());
    printf("%s", c_format("hello %d\n", 27).c_str());
    printf("%s", c_format("hello %3d %%%s\n", 27, "xyz").c_str());
    printf("%s", c_format("hello %*d %%%s\n", 5, 27, "xyz").c_str());
    printf("%s", c_format("hello %%%*n\n").c_str());
}
#endif // TESTING_C_FORMAT_123
