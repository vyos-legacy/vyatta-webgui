/*
 *  Copyright 2006, Vyatta, Inc.
 *
 *  GNU General Public License
 * 
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License, version 2, 
 *  as published by the Free Software Foundation.
 * 
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 *  02110-1301 USA
 *
 *  Module:       misc_util.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Utility code for various miscellaneous functions.
 *
 */



#include <iostream>
#include <sstream>
#include <stdio.h>
#include <termios.h>

#include "misc_util.hh"

std::string MiscUtil::getInputLine(bool flagEcho, bool flagNewLine) {
	termios tOrig, tSet;
	tcgetattr(0, &tOrig);

	tSet = tOrig;

	tSet.c_lflag &= (~ECHO);
	tSet.c_lflag &= (~ICANON);
	tcsetattr(0, TCSANOW, &tSet);

	std::string strInputLine;
	while (true) {
		int c = std::cin.get();

		if (c == EOF) break;
		if (c == 0 || c == '\r' || c == '\n') break;

		if (flagEcho) std::cout << (char)c;
		strInputLine += c;
	}

	tcsetattr(0, TCSANOW, &tOrig);

	if (flagNewLine) std::cout << std::endl;

	return strInputLine;
}

