#include <stdio.h>
#include <iostream>
#include <string>
#include "common.hh"

using namespace std;

const unsigned long WebGUI::ID_START = (unsigned long)2147483648;
const unsigned long WebGUI::ID_RANGE = (unsigned long)2147483647;

const string WebGUI::ACTIVE_CONFIG_DIR = "/opt/vyatta/config/active";
const string WebGUI::CONFIG_TMP_DIR = "/opt/vyatta/config/tmp/tmp_";
const string WebGUI::LOCAL_CHANGES_ONLY = "/tmp/changes_only_";
const string WebGUI::LOCAL_CONFIG_DIR = "/opt/vyatta/config/tmp/new_config_";
const string WebGUI::CFG_TEMPLATE_DIR = "/opt/vyatta/share/vyatta-cfg/templates";
const string WebGUI::COMMIT_LOCK_FILE = "/opt/vyatta/config/.lock";
const string WebGUI::VYATTA_MODIFY_FILE = "/opt/vyatta/config/tmp/.vyattamodify_";

char const* WebGUI::ErrorDesc[8] = {"n/a",
				    "request cannot be parsed",
				    "authentication error",
				    "session is not valid",
				    "general server failure",
				    "command failed",
				    "commit is in progress",
				    "configuration has changed"};

/**
 *
 **/
std::string
WebGUI::generate_response(Error err)
{
    char buf[40];
    sprintf(buf, "%d", err);
    return ("<?xml version='1.0' encoding='utf-8'?><vyatta><error><code>"+string(buf)+"</code><error>"+string(WebGUI::ErrorDesc[err])+"</error></vyatta>");
}

/**
 *
 **/
int
WebGUI::execute(std::string &cmd, std::string &stdout, bool read)
{
  int err = 0;

  string dir = "w";
  if (read == true) {
    dir = "r";
  }
  //  cout << "WebGUI::execute(A): '" << cmd << "'" << endl;
  FILE *f = popen(cmd.c_str(), dir.c_str());
  if (f) {
    if (read == true) {
      fflush(f);
      char *buf = NULL;
      size_t len = 0;
      size_t read_len = 0;
      while ((read_len = getline(&buf, &len, f)) != -1) {
	//	cout << "WebGUI::execute(): " << string(buf) << ", " << len << ", " << read_len << endl;
	stdout += string(buf) + " ";
      }

      if (buf) {
	free(buf);
      }
    }
    err = pclose(f);
  }
  return err;
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

/**
 *
 **/
std::string
WebGUI::trim_whitespace(const std::string &src)
{
  string str(src);
  size_t startpos = str.find_first_not_of(" \t"); 
  size_t endpos = str.find_last_not_of(" \t"); 
  if(( string::npos == startpos ) || ( string::npos == endpos)) {
    str = "";
  }
  else {
    str = str.substr( startpos, endpos-startpos+1 );
  }
  return str;
}
