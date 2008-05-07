#                                               -*- Autoconf -*-
# Process this file with autoconf to produce a configure script.

AC_PREREQ(2.61)
AC_INIT(vyatta-webgui, VERSION_ID, vyatta-support@vyatta.com)
AC_CONFIG_SRCDIR([src/config.h.in])
AC_CONFIG_HEADER([src/config.h])

AC_CONFIG_AUX_DIR([config])
AM_INIT_AUTOMAKE([gnu no-dist-gzip dist-bzip2 subdir-objects])
AC_PREFIX_DEFAULT([/opt/vyatta])



# Checks for programs.
AC_PROG_CXX
AC_PROG_CC
AM_PROG_CC_C_O
#AC_PROG_INSTALL
AC_PROG_LN_S
AC_PROG_LIBTOOL

# Checks for libraries.
# FIXME: Replace `main' with a function in `-lcrypt':
AC_CHECK_LIB([crypt], [main])
# FIXME: Replace `main' with a function in `-lexpat':
AC_CHECK_LIB([expat], [main])
# FIXME: Replace `main' with a function in `-lpam':
AC_CHECK_LIB([pam], [main])
# FIXME: Replace `main' with a function in `-lpam_misc':
AC_CHECK_LIB([pam_misc], [main])
# FIXME: Replace `main' with a function in `-luuid':
AC_CHECK_LIB([uuid], [main])

# Checks for header files.
AC_HEADER_STDC
AC_HEADER_SYS_WAIT
AC_CHECK_HEADERS([arpa/inet.h fcntl.h netdb.h netinet/in.h paths.h stdlib.h string.h strings.h sys/ioctl.h sys/param.h sys/socket.h sys/time.h syslog.h termios.h unistd.h])

# Checks for typedefs, structures, and compiler characteristics.
AC_HEADER_STDBOOL
AC_C_CONST
AC_TYPE_UID_T
AC_C_INLINE
AC_TYPE_INT32_T
AC_TYPE_INT64_T
AC_TYPE_PID_T
AC_TYPE_SIZE_T
AC_TYPE_SSIZE_T
AC_HEADER_TIME
AC_STRUCT_TM
AC_TYPE_UINT16_T
AC_TYPE_UINT32_T
AC_TYPE_UINT64_T
AC_TYPE_UINT8_T

# Checks for library functions.
AC_FUNC_ERROR_AT_LINE
AC_PROG_GCC_TRADITIONAL
AC_FUNC_MALLOC
AC_FUNC_MEMCMP
AC_FUNC_SELECT_ARGTYPES
AC_FUNC_SETVBUF_REVERSED
AC_TYPE_SIGNAL
AC_FUNC_STAT
AC_FUNC_STRFTIME
AC_FUNC_VPRINTF
AC_CHECK_FUNCS([gethostbyname gethostname gettimeofday inet_ntoa isascii localtime_r memset select socket strcasecmp strdup strerror strrchr strstr strtol strtoul tzset])

AC_CONFIG_FILES([Makefile])
AC_OUTPUT
