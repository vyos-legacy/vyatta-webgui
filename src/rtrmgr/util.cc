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

#include "nyiexcept.hh"

#include "rtrmgr_module.h"

#include "libxorp/xorp.h"
#include "libxorp/xlog.h"
#include "libxorp/debug.h"
#include "libxorp/utility.h"
#include "libxorp/utils.hh"

#include <list>

#include "util.hh"

#ifdef	HOST_OS_WINDOWS
#include <io.h>
#define	access(x,y)	_access(x,y)
#define	stat		_stat
#define	S_ISREG		_S_ISREG
#endif

//static string s_bin_root = XORP_INSTALL_ROOT;
//static string s_cfg_root = SYSCONFDIR;
//static string s_boot_file = SYSCONFDIR "/config/config.boot";
//static string s_template_dir = TEMPLATESDIR;
//static string s_xrl_targets_dir = XRLSDIR;

const string&
xorp_binary_root_dir()
{
NYIEXCEPT;
//    return s_bin_root;
}

const string&
xorp_config_root_dir()
{
NYIEXCEPT;
//    return s_cfg_root;
}

const string&
xorp_template_dir()
{
NYIEXCEPT;
//    return s_template_dir;
}

void
xorp_set_template_dir(const char* arg_t)
{
NYIEXCEPT;
//    s_template_dir = arg_t;
}

const string&
xorp_boot_file()
{
NYIEXCEPT;
//    return s_boot_file;
}

void
xorp_set_boot_file(const char* arg_b)
{
    if (arg_b != NULL) {
	string::size_type idx = 0;

NYIEXCEPT;
//	s_boot_file = arg_b;
//	idx = s_boot_file.rfind(PATH_DELIMITER_STRING);
//	if (idx != string::npos) {
//	    s_cfg_root = s_boot_file;
//	    s_cfg_root.erase(idx);
//	}
    }
}

const string&
xorp_xrl_targets_dir()
{
NYIEXCEPT;
//    return s_xrl_targets_dir;
}

void
xorp_set_xrl_targets_dir(const char* arg_x)
{
NYIEXCEPT;
//    s_xrl_targets_dir = arg_x;
}

string&
unquote(string& s)
{
    if (s.length() >= 2 && s[0] == '"' && s[s.size() - 1] == '"') {
	s = s.substr(1, s.size() - 2);
    }
    return s;
}

string
unquote(const string& s)
{
    if (s.length() >= 2 && s[0] == '"' && s[s.size() - 1] == '"') {
	return s.substr(1, s.size() - 2);
    }
    return s;
}

bool
is_quotable_string(const string& s)
{
    size_t i;

    for (i = 0; i < s.size(); i++) {
	if (! xorp_isalnum(s[i]))
	    return (true);
    }

    return (false);
}

string
find_executable_filename(const string& program_filename)
{
    string executable_filename;

NYIEXCEPT;
//    struct stat statbuf;
//
//    if (program_filename.size() == 0) {
//	return string("");			// Error
//    }
//
//    // Assume the path passed to us is a UNIX-style path.
//    executable_filename = unix_path_to_native(program_filename);
//
//    //
//    // TODO: take care of the commented-out access() calls below (by BMS).
//    //
//    // Comment out the access() calls for now -- xorpsh does not
//    // like them, when running under sudo -u xorp (euid?) and
//    // as a result xorpsh fails to start up.
//    // Consider checking for it in configure.in and shipping
//    // our own if we can't find it on the system.
//    //
//    if (is_absolute_path(executable_filename)) {
//	// Absolute path name
//	if (stat(executable_filename.c_str(), &statbuf) == 0 &&
//	    // access(executable_filename.c_str(), X_OK) == 0 &&
//	    S_ISREG(statbuf.st_mode)) {
//	    return executable_filename;
//	}
//	return string("");			// Error
//    }
//
//    // Relative path name
//    string xorp_root_dir = xorp_binary_root_dir();
//
//    list<string> path;
//    path.push_back(xorp_root_dir);
//
//    // Expand path
//    const char* p = getenv("PATH");
//    if (p != NULL) {
//	list<string> l2 = split(p, PATH_ENV_DELIMITER_CHAR);
//	path.splice(path.end(), l2);
//    }
//
//    // Search each path component
//    while (!path.empty()) {
//	// Don't forget to append the executable suffix if needed.
//	string full_path_executable = path.front() + PATH_DELIMITER_STRING +
//				      executable_filename + EXECUTABLE_SUFFIX;
//#ifdef HOST_OS_WINDOWS
//	// Deal with any silly tricks which MSYS may have pulled on
//	// us, like using UNIX-style slashes in a DOS-style path. Grr. -bms
//	full_path_executable = unix_path_to_native(full_path_executable);
//#endif
//	if (stat(full_path_executable.c_str(), &statbuf) == 0 &&
//	    // access(program_filename.c_str(), X_OK) == 0 &&
//	    S_ISREG(statbuf.st_mode)) {
//	    executable_filename = full_path_executable;
//	    return executable_filename;
//	}
//	path.pop_front();
//    }
//    return string("");				// Error
}

void
find_executable_filename_and_arguments(const string& program_request,
				       string& executable_filename,
				       string& program_arguments)
{
    executable_filename = strip_empty_spaces(program_request);
    program_arguments = "";

    string::size_type space;
    space = executable_filename.find(' ');
    if (space == string::npos)
	space = executable_filename.find('\t');

    if (space != string::npos) {
	program_arguments = executable_filename.substr(space + 1);
	executable_filename = executable_filename.substr(0, space);
    }

    executable_filename = find_executable_filename(executable_filename);
    if (executable_filename.empty())
	program_arguments = "";
}
