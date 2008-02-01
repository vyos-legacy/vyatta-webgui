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
 *  Module:       xgdaemon_util.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Various miscellaneous utility methods for string processing
 *
 */

#include <ctype.h>
#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <fstream>

#include "xgdaemon_util.hh"

std::string XGDaemonUtil::strBlank;

bool XGDaemonUtil::compareIfALessThanB(const std::string & strA, const std::string & strB) {
	if (isStrAllDigits(strA) && isStrAllDigits(strB)) {
		long valueA = XGDaemonUtil::getValueStrL(strA, 0);
		long valueB = XGDaemonUtil::getValueStrL(strB, 0);
		return valueA < valueB;
	} else {
		return (strA < strB);
	}
}
bool XGDaemonUtil::doesExist(const std::string & strFilename) {
	FILE * f = fopen(strFilename.c_str(), "r");
	if (f) {
		fclose (f);
		return true;
	} else {
		return false;
	}
}
bool XGDaemonUtil::doesStringEndWith(const std::string & strTest, const std::string & strEnding) {
	int lengthTest = strTest.length();
	int lengthEnding = strEnding.length();

	if (lengthTest < lengthEnding) return false;

	int iEndingStart = lengthTest - lengthEnding;
	for (int i = 0; i < lengthEnding; i++) {
		if (strTest[iEndingStart + i] != strEnding[i]) return false;
	}

	return true;
}
bool XGDaemonUtil::getValueStrBool(const std::string & strBool, bool valueDefault) {
	const std::string & strBoolL = getToLowerString(strBool);

	if (strBoolL == "true") return true;
	if (strBoolL == "false") return false;

	return valueDefault;
}
bool XGDaemonUtil::isStrAllDigits(const std::string & str) {
	int length = str.length();
	for (int i = 0; i < length; i++) {
		char c = str[i];
		if (isdigit(c) == 0) return false;
	}
	return true;
}
bool XGDaemonUtil::isConfigFile(const std::string & strFilename) {
	if (!doesExist(strFilename)) return true;

	FILE * f = fopen(strFilename.c_str(), "r");
	if (f == NULL) return false;

	char buffer[7];
	if (fread(buffer, 1, 6, f) != 6) return false;
	buffer[6] = 0;
	fclose(f);

	return (strncmp(buffer, "/*XORP", 6) == 0);
}
bool XGDaemonUtil::isStrAllWhitespace(const std::string & str) {
	int length = str.length();
	for (int i = 0; i < length; i++) {
		char c = str[i];
		if (isspace(c) == 0) return false;
	}
	return true;
}
bool XGDaemonUtil::retrFileContents(const std::string & strFilename, std::string & strContents) {
	std::string strError;
	return retrFileContents(strFilename, strContents, strError);
}
bool XGDaemonUtil::retrFileContents(const std::string & strFilename, std::string & strContents, std::string & strError) {
	strContents.clear();
	strError.clear();

	errno = 0;
	FILE * f = fopen(strFilename.c_str(), "r");
	if (f == NULL) {
		strError = strerror(errno);
		return false;
	}
	
	while (feof(f) == 0) {
		errno = 0;
		int ch = fgetc(f);
		if (errno != 0) {
			strError = strerror(errno);
			fclose(f);
			return false;
		}
		if (ch == EOF) break;
		strContents += (char)ch;
	}
	fclose(f);

	return true;
}
bool XGDaemonUtil::retrFileContents(const std::string & strFilename, std::string & strContents, std::string & strError, uid_t uidLoadAs) {
	uid_t uidCurrent = getuid();

	if (seteuid(uidLoadAs) != 0) return false;

	bool flagSuccess = retrFileContents(strFilename, strContents, strError);

	seteuid(uidCurrent);

	return flagSuccess;	
}
bool XGDaemonUtil::saveFileContents(const std::string & strFilename, const std::string & strContents) {
	std::string strError;
	return saveFileContents(strFilename, strContents, strError);
}
bool XGDaemonUtil::saveFileContents(const std::string & strFilename, const std::string & strContents, std::string & strError) {
	strError.clear();

	errno = 0;
	FILE * f = fopen(strFilename.c_str(), "w");
	if (f == NULL) {
		strError = strerror(errno);
		return false;
	}

	errno = 0;	
	fwrite(strContents.c_str(), sizeof(char), strContents.length(), f);
	int savedErrno = errno;
	fclose(f);

	if (savedErrno == 0) {
		return true;
	} else {
		strError = strerror(errno);
		return false;
	}
}
bool XGDaemonUtil::saveFileContents(const std::string & strFilename, const std::string & strContents, std::string & strError, uid_t uidSaveAs) {
	uid_t uidCurrent = getuid();

	if (seteuid(uidSaveAs) != 0) return false;

	bool flagSuccess = saveFileContents(strFilename, strContents, strError);

	seteuid(uidCurrent);

	return flagSuccess;
}
const char * XGDaemonUtil::getStrReprBool(bool value) {
        static const char * strTrue = "true";
        static const char * strFalse = "false";

        return value ? strTrue : strFalse;
}

int XGDaemonUtil::getValueStrInt(const std::string & strInt) {
	return atoi(strInt.c_str());
}
long XGDaemonUtil::getValueStrL(const std::string & strL, long valueDefault) {
	int length = strL.length();
	if (length == 0) {
		return valueDefault;
	} else {
		long value = 0;
		bool flagNegative = false;
		for (int i = 0; i < length; i++) {
			value *= 10;
	
			char c = strL[i];
			if (c == '-' && i == 0) {
				flagNegative = true;
			} else if (c >= '0' && c <= '9') {
				unsigned int d = c - '0';
				value += d;
			} else {
				value = valueDefault;
				break;
			}
		}
		if (flagNegative) return -value; else return value;
	}
}
long long XGDaemonUtil::getValueStrLL(const std::string & strLL, long long valueDefault) {
	int length = strLL.length();
	if (length == 0) {
		return valueDefault;
	} else {
		long long value = 0;
		bool flagNegative = false;
		for (int i = 0; i < length; i++) {
			value *= 10;
	
			char c = strLL[i];
			if (c == '-' && i == 0) {
				flagNegative = true;
			} else if (c >= '0' && c <= '9') {
				unsigned int d = c - '0';
				value += d;
			} else {
				value = valueDefault;
				break;
			}
		}
		if (flagNegative) return -value; else return value;
	}
}
unsigned int XGDaemonUtil::getValueStrUInt(const std::string & strUInt, unsigned int valueDefault) {
	unsigned int value = 0;

	int length = strUInt.length();
	for (int i = 0; i < length; i++) {
		value *= 10;

		char c = strUInt[i];
		if (c >= '0' && c <= '9') {
			unsigned int d = c - '0';
			value += d;
		} else {
			value = valueDefault;
			break;
		}
	}
	return value;
}

unsigned long XGDaemonUtil::getValueStrUL(const std::string & strUL, unsigned long valueDefault) {
	unsigned long value = 0;

	int length = strUL.length();
	for (int i = 0; i < length; i++) {
		value *= 10;

		char c = strUL[i];
		if (c >= '0' && c <= '9') {
			unsigned int d = c - '0';
			value += d;
		} else {
			value = valueDefault;
			break;
		}
	}
	return value;
}
unsigned long XGDaemonUtil::getValueStrUL_Hex(const std::string & strULHex, unsigned long valueDefault) {
	const std::string & strULHexL = getToLowerString(strULHex);

	unsigned long value = 0;

	int length = strULHexL.length();
	for (int i = 0; i < length; i++) {
		value = value << 4;

		char c = strULHexL[i];
		if (c >= '0' && c <= '9') {
			int d = c - '0';
			value += d;
		} else if (c >= 'a' && c <= 'f') {
			int d = 10 + (c - 'a');
			value += d;
		} else {
			value = valueDefault;
			break;
		}
	}
	return value;
}

time_t XGDaemonUtil::getValueStrTime(const std::string & strTime, time_t valueDefault) {
	time_t value = 0;

	int length = strTime.length();
	for (int i = 0; i < length; i++) {
		value *= 10;

		char c = strTime[i];
		if (c >= '0' && c <= '9') {
			unsigned int d = c - '0';
			value += d;
		} else {
			value = valueDefault;
			break;
		}
	}
	return value;
}


std::string XGDaemonUtil::addR(const std::string & str) {
	std::string strOut;
	int length = str.length();
	for (int i = 0; i < length; i++) {
		char c = str[i];
		if (c == '\n') strOut += '\r';
		strOut += c;
	}
	return strOut;
}

const std::string & XGDaemonUtil::getBlankString() {
	return strBlank;
}
std::string XGDaemonUtil::getStrEscapedAmpersand(const std::string & strEscape) {
	std::string strEscaped;
	for (unsigned int i = 0; i < strEscape.length(); i++) {
		unsigned char c = strEscape[i];

		if (c == 0) {
		} else if (c == '\'') {
			strEscaped += "&apos;";
		} else if (c == '"') {
			strEscaped += "&quot;";
		} else if (c == '&') {
			strEscaped += "&amp;";
		} else if (c == '<') {
			strEscaped += "&lt;";
		} else if (c == '>') {
			strEscaped += "&gt;";
		} else if (c == 160) {
			strEscaped += "&nbsp;";
		} else if ((c >= 0x20 && c <= 0x7E) || isspace(c)) {
			strEscaped += c;
		} else {
			strEscaped += "&#x";
			strEscaped += XGDaemonUtil::getStrReprUShort_Hex((short)c, true);
			strEscaped += ";";
		}
	}
	return strEscaped;
}
std::string XGDaemonUtil::getStrEscapedBackSlash(const std::string & strEscape) {
	std::string strEscaped;
	for (unsigned int i = 0; i < strEscape.length(); i++) {
		char c = strEscape[i];
		switch (c) {
		case '\n':
			strEscaped += "\\n";
			break;
		case '\r':
			strEscaped += "\\r";
			break;
		case '\t':
			strEscaped += "\\t";
			break;
		case ' ':
		case '\\':
		case '/':
			strEscaped += '\\';
		default:
			strEscaped += c;			
		}
	}
	return strEscaped;
}
std::string XGDaemonUtil::getStrEscapedCaret(const std::string & strEscape) {
	std::string strEscaped;
	for (unsigned int i = 0; i < strEscape.length(); i++) {
		char c = strEscape[i];
		switch (c) {
		case '^':
			strEscaped += "^^";
			break;
		case '&':
			strEscaped += "^26";
			break;
		default:
			strEscaped += c;		
		}
	}
	return strEscaped;
}
std::string XGDaemonUtil::getStrEscapedPre(const std::string & strEscape) {
	std::string strEscaped;
	for (unsigned int i = 0; i < strEscape.length(); i++) {
		unsigned char c = strEscape[i];

		if (c == 0) {
		} else if (c == '\'') {
			strEscaped += "&apos;";
		} else if (c == '"') {
			strEscaped += "&quot;";
		} else if (c == '&') {
			strEscaped += "&amp;";
		} else if (c == '<') {
			strEscaped += "&lt;";
		} else if (c == '>') {
			strEscaped += "&gt;";
		} else if (c == 160 || c == ' ') {
			strEscaped += "&nbsp;";
		} else if (c == '\n' || c == '\r') {
			strEscaped += "<br>";
			if (c == '\r' && i + 1 < strEscape.length() && strEscape[i+1] == '\n') i++;
		} else if (c == '\t') {
			strEscaped += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
		} else {
			strEscaped += c;
		}
	}
	return strEscaped;
}

std::string XGDaemonUtil::getStrReprInt(int value) {
	std::string strOutput;
	if (value == 0) {
		strOutput = "0";
	} else {
		bool flagNegative = value < 0;
		if (flagNegative) value *= -1;

		while (value > 0) {
			int mod = value % 10;
			char c = ('0' + mod);
			strOutput = c + strOutput;
			value /= 10;
		}

		if (flagNegative) strOutput = "-" + strOutput;
	}

	return strOutput;
}
std::string XGDaemonUtil::getStrReprL(long value) {
	std::string strOutput;
	if (value == 0) {
		strOutput = "0";
	} else {
		bool flagNegative = value < 0;
		if (flagNegative) value *= -1;

		while (value > 0) {
			int mod = value % 10;
			char c = ('0' + mod);
			strOutput = c + strOutput;
			value /= 10;
		}

		if (flagNegative) strOutput = "-" + strOutput;
	}

	return strOutput;
}
std::string XGDaemonUtil::getStrReprLL(long long value) {
	std::string strOutput;
	if (value == 0) {
		strOutput = "0";
	} else {
		bool flagNegative = value < 0;
		if (flagNegative) value *= -1;

		while (value > 0) {
			int mod = value % 10;
			char c = ('0' + mod);
			strOutput = c + strOutput;
			value /= 10;
		}

		if (flagNegative) strOutput = "-" + strOutput;
	}

	return strOutput;
}
std::string XGDaemonUtil::getStrReprTimeT(time_t value) {
	std::string strOutput;
	if (value == 0) {
		strOutput = "0";
	} else {
		while (value > 0) {
			int mod = value % 10;
			char c = ('0' + mod);
			strOutput = c + strOutput;
			value /= 10;
		}
	}

	return strOutput;
}
std::string XGDaemonUtil::getStrReprUInt(unsigned int value) {
	std::string strOutput;
	if (value == 0) {
		strOutput = "0";
	} else {
		while (value > 0) {
			int mod = value % 10;
			char c = ('0' + mod);
			strOutput = c + strOutput;
			value /= 10;
		}
	}

	return strOutput;
}


std::string XGDaemonUtil::getStrReprUL(unsigned long value) {
	std::string strOutput;
	if (value == 0) {
		strOutput = "0";
	} else {
		while (value > 0) {
			int mod = value % 10;
			char c = ('0' + mod);
			strOutput = c + strOutput;
			value /= 10;
		}
	}

	return strOutput;
}

std::string XGDaemonUtil::getStrReprUL_Hex(unsigned long value, bool flagPadZeroes) {
	std::string strOutput;
	while (value > 0) {
		int mod = value % 16;
		char c = mod < 10 ? ('0' + mod) : ('a' + (mod - 10));
		strOutput = c + strOutput;
		value = value >> 4;
	}

	if (flagPadZeroes) {
		unsigned int lengthDesired = (sizeof(value) * 2);
		while (strOutput.length() < lengthDesired) {
			strOutput = '0' + strOutput;
		}
	}

	return strOutput;
}
std::string XGDaemonUtil::getStrReprUShort_Hex(unsigned short value, bool flagPadZeroes) {
	std::string strOutput;
	if (value > 0) {
		int mod = value % 16;
		char c = mod < 10 ? ('0' + mod) : ('a' + (mod - 10));
		strOutput = c + strOutput;
		value = value >> 4;
	}

	if (flagPadZeroes) {
		unsigned int lengthDesired = (sizeof(value) * 2);
		while (strOutput.length() < lengthDesired) {
			strOutput = '0' + strOutput;
		}
	}

	return strOutput;
}
std::string XGDaemonUtil::getStrUnEscapedAmpersand(const std::string & strEscaped) {
	std::string strUnEscaped;
	unsigned int len = strEscaped.length();
	for (unsigned int i = 0; i < len; i++) {
		char c = strEscaped[i];
		if (c == '&') {
			bool flagGotCompleteSequence = false;
			std::string strSequence;
			i++;
			while (i < len) {
				char c = strEscaped[i];
				strSequence += c;
				if (c == ';') {
					flagGotCompleteSequence = true;
					break;
				}
				i++;
			}

			int number = 0;

			if (flagGotCompleteSequence) {
				if (strSequence[0] == '#') {
					if (strSequence.length() != 5) {
						flagGotCompleteSequence = false;
					} else {
						for (int j = 1; j < 4; j++) {
							char d = strSequence[j];
							if (d < '0' || d > '9') {
								flagGotCompleteSequence = false;
								break;
							}
							number += (d - '0');
							number *= 10;
						}
					}
				}
			}
			if (flagGotCompleteSequence) {
				if (strSequence[0] == '#') {
					strUnEscaped += (char)number;
				} else if (strSequence == "lt;") {
					strUnEscaped += '<';
				} else if (strSequence == "gt;") {
					strUnEscaped += '>';
				} else if (strSequence == "amp;") {
					strUnEscaped += '&';
				} else if (strSequence == "apos;") {
					strUnEscaped += '\'';					
				} else if (strSequence == "quot;") {
					strUnEscaped += '"';
				} else if (strSequence == "nbsp;") {
					strUnEscaped += 0x20;
				} else if (strSequence == "reg;") {
					strUnEscaped += "(R)";
				} else if (strSequence == "copy;") {
					strUnEscaped += "(C)";
				} else if (strSequence == "ensp;") {
					strUnEscaped += 0x20;
				} else if (strSequence == "emsp;") {
					strUnEscaped += 0x20;
				} else {
					strUnEscaped += '&';
					strUnEscaped += strSequence;					
				}
			} else {
				strUnEscaped += '&';
				strUnEscaped += strSequence;
			}
		} else {
			strUnEscaped += c;
		}
		
	}
	return strUnEscaped;
}
std::string XGDaemonUtil::getStrUnEscapedBackSlash(const std::string & strEscaped) {
	std::string strUnEscaped;
	unsigned int len = strEscaped.length();
	for (unsigned int i = 0; i < len; i++) {
		char c = strEscaped[i];
		if (c == '\\') {
			i++;
			if (i < len) {
				c = strEscaped[i];
				switch (c) {
				case 'n':
					strUnEscaped += '\n';
					break;
				case 'r':
					strUnEscaped += '\r';
					break;
				case 't':
					strUnEscaped += '\t';
					break;
				case 'x':
					if (i < len-2) {
						std::string strHex = strEscaped.substr(i, 2);
						i+=2;
						
						unsigned long ul = getValueStrUL_Hex(strHex, 0xFFFF);
						if (ul <= 0xFF) strUnEscaped += (char)ul;
					}
				default:
					strUnEscaped += c;
				}
			}
		} else {
			strUnEscaped += c;
		}
	}
	return strUnEscaped;
}

std::string XGDaemonUtil::getStrUnEscapedCaret(const std::string & strEscaped) {
	std::string strUnEscaped;
	unsigned int len = strEscaped.length();
	for (unsigned int i = 0; i < len; i++) {
		char c = strEscaped[i];
		if (c == '^') {
			i++;
			if (i < len) {
				c = strEscaped[i];
				if (c == '^') {
					strUnEscaped += '^';
				} else if (c >= '0' && c <= '9') {
					std::string strHex;
					strHex += c;

					i++;
					if (i < len) {
						char d = strEscaped[i];
						strHex += d;

						unsigned long ul = getValueStrUL_Hex(strHex, 0xFFFF);
						if (ul <= 0xFF) strUnEscaped += (char)ul;
					}
				} else {
					strUnEscaped += c;
				}
			}
		} else {
			strUnEscaped += c;
		}
	}
	return strUnEscaped;
}

std::string XGDaemonUtil::getStrUnEscapedPercent(const std::string & strEscaped) {
	std::string strUnEscaped;
	unsigned int len = strEscaped.length();
	for (unsigned int i = 0; i < len; i++) {
		char c = strEscaped[i];
		if (c == '%') {
			i++;
			if (i < len) {
				c = strEscaped[i];
				if (c == '%') {
					strUnEscaped += '%';
				} else if (c >= '0' && c <= '9') {
					std::string strHex;
					strHex += c;

					i++;
					if (i < len) {
						char d = strEscaped[i];
						strHex += d;

						unsigned long ul = getValueStrUL_Hex(strHex, 0xFFFF);
						if (ul <= 0xFF) strUnEscaped += (char)ul;
					}
				} else {
					strUnEscaped += c;
				}
			}
		} else {
			strUnEscaped += c;
		}
	}
	return strUnEscaped;
}

std::string XGDaemonUtil::getToLowerString(const std::string & str) {
	std::string strLower;
	int length = str.length();
	for (int i = 0; i < length; i++) {
		strLower += tolower(str[i]);
	}
	return strLower;
}


std::string XGDaemonUtil::getTrimmedString(const std::string & str) {
	return getTrimmedStringRight(getTrimmedStringLeft(str));
}
std::string XGDaemonUtil::getTrimmedStringLeft(const std::string & str) {
	int i, length = str.length();

	for (i = 0; i < length; i++) {
		char c = str[i];
		if (isspace(c) == 0) break;
	}

	return str.substr(i);
}
std::string XGDaemonUtil::getTrimmedStringRight(const std::string & str) {
	int i, length = str.length();

	for (i = length - 1; i >= 0; i--) {
		char c = str[i];
		if (isspace(c) == 0) break;
	}

	return str.substr(0, i+1);
}

void XGDaemonUtil::split_string(const std::string & strToSplit, char cSplitBy, std::list<std::string> & listResults) {
	split_string(strToSplit, cSplitBy, listResults, false);
}
void XGDaemonUtil::split_string(const std::string & strToSplit, char cSplitBy, std::list<std::string> & listResults, bool flagTrim) {
	listResults.clear();
	
	std::string strSegment;

	int lengthToSplit = strToSplit.length();
	for (int i = 0; i <= lengthToSplit; i++) {
		bool flagSegmentEnded = false;
		char cHere = strToSplit[i];
		if (cHere == '\\') {
			i++;
			if (i == lengthToSplit) {
				flagSegmentEnded = true;
				cHere = 0;
			} else {
				strSegment += '\\';
				cHere = strToSplit[i];
			}
		} else {
			if (i == lengthToSplit || cHere == cSplitBy) {
				flagSegmentEnded = true;
			}
		}
		
		if (flagSegmentEnded) {
			if (flagTrim) strSegment = XGDaemonUtil::getTrimmedString(strSegment);
			if (strSegment.length() > 0) {
				listResults.push_back(strSegment);
				strSegment.clear();
			}
		} else {
			strSegment += cHere;
		}
	}
}
void XGDaemonUtil::split_string_UL_Hex(const std::string & strToSplit, char cSplitBy, std::vector<unsigned long> & vectorResults, unsigned long valueDefault) {
	vectorResults.clear();

	std::list<std::string> listStrings;
	split_string(strToSplit, cSplitBy, listStrings, true);

	std::list<std::string>::const_iterator i = listStrings.begin();
	const std::list<std::string>::const_iterator iEnd = listStrings.end();

	while (i != iEnd) {
		vectorResults.push_back(getValueStrUL_Hex(*i, valueDefault));
		i++;
	}
}

void XGDaemonUtil::unsplit_string(std::string & strResult, const std::string & strSeparator, const std::list<std::string> & listToUnsplit) {
	strResult.clear();

	std::list<std::string>::const_iterator i = listToUnsplit.begin();
	std::list<std::string>::const_iterator iEnd = listToUnsplit.end();
	while (i != iEnd) {
		if (strResult.length()  > 0) strResult += strSeparator;
		strResult += *i;
		i++;
	}	
}

