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

// $XORP$

#ifndef __RTRMGR_UTIL_HH__
#define __RTRMGR_UTIL_HH__

/**
 * Return top-level directory of xorp binaries.
 */
const string& xorp_binary_root_dir();

/**
 * Return top-level directory of xorp configuration files.
 */
const string& xorp_config_root_dir();

/**
 * Return the path of the xorp templates directory given the xorp_root
 * path.
 */
const string& xorp_template_dir();

/**
 * Set and return the path of the xorp templates directory.
 */
void xorp_set_template_dir(const char*);

/**
 * Return the path of the xrl targets directory given the xorp_root
 * path.
 */
const string& xorp_xrl_targets_dir();

/**
 * Set path of the xrl targets directory.
 */
void xorp_set_xrl_targets_dir(const char*);

/**
 * Return path of boot config file.
 */
const string& xorp_boot_file();

/**
 * Set path of boot config file/directory.
 */
void xorp_set_boot_file(const char*);

/**
 * Remove enclosing quotes from string.
 *
 * @param s string that may have enclosing quotes.
 * @return string with quotes removed.
 */
string& unquote(string& s);

/**
 * Remove enclosing quotes from string value.
 *
 * @param s string that may have enclosing quotes.
 * @return copy of string with quotes removed.
 */
string unquote(const string& s);

/**
 * Test if a string should be in quotes.
 * A string should be in quotes if it contains a character that is not
 * a letter or a digit.
 * 
 * @param s the string to test.
 * @return true if the string should be in quotes, otherwise false.
 */
bool is_quotable_string(const string& s);

/**
 * Find the name (including the path) of an executable program.
 * 
 * If the filename contains an absolute pathname, then we return the
 * program filename or an error if the program is not executable.
 * If the pathname is relative, then first we consider the XORP binary
 * root directory, and then the directories in the user's PATH environment.
 * 
 * @param program_filename the name of the program to find.
 * @return the name of the executable program on success, empty string
 * on failure.
 */
string find_executable_filename(const string& program_filename);

/**
 * Find the name (including the path) and the arguments of an executable
 * program and return them by reference.
 * 
 * If the filename contains an absolute pathname, then we return-by-reference
 * the program filename or an error if the program is not executable.
 * If the pathname is relative, then first we consider the XORP binary
 * root directory, and then the directories in the user's PATH environment.
 * 
 * @param program_request a string with the name of the program to find
 * and its arguments.
 * @param executable_filename the return-by-reference name of the executable
 * program on success, empty string on failure.
 * @param program_arguments the return-by-reference program arguments,
 * or an empty string if no arguments were supplied.
 */
void find_executable_filename_and_arguments(const string& program_request,
					    string& executable_filename,
					    string& program_arguments);

#endif // __RTRMGR_UTIL_HH__
