#include <stdio.h>
#include <iostream>
#include <string>
#include "common.hh"

using namespace std;

const unsigned long WebGUI::ID_START = 2147483648;

char const* WebGUI::ErrorDesc[8] = {"n/a",
				    "request cannot be parsed",
				    "username/password are not valid",
				    "session is not valid",
				    "general server failure",
				    "command failed",
				    "commit is in progress",
				    "configuration has changed"};


bool
WebGUI::execute(std::string &cmd, bool read)
{
  string dir = "w";
  if (read == true) {
    dir = "r";
  }

  FILE *f = popen(cmd.c_str(), dir.c_str());
  if (f) {
    if (pclose(f) != 0) {
      //      syslog(LOG_ERR, "Error executing system command: %s", cmd.c_str());
    }
  }
  else {
    //    syslog(LOG_ERR, "Error executing system command: %s", cmd.c_str());
  }
  return false;
}

/**
 *
 **/
std::string // replace all instances of victim with replacement
WebGUI::mass_replace(const std::string &source, const std::string &victim, const
	     std::string &replacement)
{
  std::string answer = source;
  std::string::size_type j = 0;
  while ((j = answer.find(victim, j)) != std::string::npos )
    answer.replace(j, victim.length(), replacement);
  return answer;
}

