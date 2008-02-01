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
 *  Module:       xgdaemon_util.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Various miscellaneous utility methods for string processing
 *
 */


#ifndef __INCLUDE_XGDAEMON_UTIL_HH__
#define __INCLUDE_XGDAEMON_UTIL_HH__

#include <time.h>

#include <list>
#include <string>
#include <vector>


/*
 * Compile time assertion.
 */
#ifndef static_assert
#define static_assert(a)        switch (a) case 0: case (a):
#endif /* static_assert */

#ifndef UNUSED
#define UNUSED(var)             static_assert(sizeof(var) != 0)
#endif


class XGDaemonUtil {
public:
	static bool compareIfALessThanB(const std::string & strA, const std::string & strB);
	static bool doesExist(const std::string & strFilename);
	static bool doesStringEndWith(const std::string & strTest, const std::string & strEnding);
	static bool getValueStrBool(const std::string & strBool, bool valueDefault);
	static bool isConfigFile(const std::string & strFilename);
	static bool isStrAllDigits(const std::string & str);
	static bool isStrAllWhitespace(const std::string & str);
	static bool retrFileContents(const std::string & strFilename, std::string & strContents);
	static bool retrFileContents(const std::string & strFilename, std::string & strContents, std::string & strError);
	static bool retrFileContents(const std::string & strFilename, std::string & strContents, std::string & strError, uid_t uidLoadAs);
	static bool saveFileContents(const std::string & strFilename, const std::string & strContents);
	static bool saveFileContents(const std::string & strFilename, const std::string & strContents, std::string & strError);
	static bool saveFileContents(const std::string & strFilename, const std::string & strContents, std::string & strError, uid_t uidSaveAs);


	static const char * getStrReprBool(bool value);

	static int getValueStrInt(const std::string & strInt);
	static long getValueStrL(const std::string & strL, long valueDefault);
	static long long getValueStrLL(const std::string & strL, long long valueDefault);
	static unsigned int getValueStrUInt(const std::string & strUInt, unsigned int valueDefault);
	static unsigned long getValueStrUL(const std::string & strUL, unsigned long valueDefault);
	static unsigned long getValueStrUL_Hex(const std::string & strULHex, unsigned long valueDefault);

	static time_t getValueStrTime(const std::string & strTime, time_t valueDefault);

	static std::string addR(const std::string & str);

	static const std::string & getBlankString();
	static std::string getStrEscapedAmpersand(const std::string & strEscape);
	static std::string getStrEscapedBackSlash(const std::string & strEscape);
	static std::string getStrEscapedCaret(const std::string & strEscape);
	static std::string getStrEscapedPre(const std::string & strEscape);
	static std::string getStrReprInt(int value);
	static std::string getStrReprL(long value);
	static std::string getStrReprLL(long long value);
	static std::string getStrReprTimeT(time_t value);
	static std::string getStrReprUInt(unsigned int value);
	static std::string getStrReprUL(unsigned long value);
	static std::string getStrReprUL_Hex(unsigned long value, bool flagPadZeroes);
	static std::string getStrReprUShort_Hex(unsigned short value, bool flagPadZeroes);
	static std::string getStrUnEscapedAmpersand(const std::string & strEscaped);
	static std::string getStrUnEscapedBackSlash(const std::string & strEscaped);
	static std::string getStrUnEscapedCaret(const std::string & strEscaped);
	static std::string getStrUnEscapedPercent(const std::string & strEscaped);


	static std::string getToLowerString(const std::string & str);

	static std::string getTrimmedString(const std::string & str);
	static std::string getTrimmedStringLeft(const std::string & str);
	static std::string getTrimmedStringRight(const std::string & str);

	static void split_string(const std::string & strToSplit, char cSplitBy, std::list<std::string> & listResults);
        static void split_string(const std::string & strToSplit, char cSplitBy, std::list<std::string> & listResults, bool flagTrim);
	static void split_string_UL_Hex(const std::string & strToSplit, char cSplitBy, std::vector<unsigned long> & vectorResults, unsigned long valueDefault);

	static void unsplit_string(std::string & strResult, const std::string & strSeparator, const std::list<std::string> & listToUnsplit);

private:
	static std::string strBlank;
};

#endif

