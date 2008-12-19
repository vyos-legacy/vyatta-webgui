#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <string>
#include <iostream>
#include "common.hh"
#include "multirespcmd.hh"

using namespace std;

/**
 *
 **/
MultiResponseCommand::MultiResponseCommand(string &cmd) : _cmd(cmd)
{
  //read in valid cmd list
  load_valid_multi_cmds();
}

/**
 *
 **/
MultiResponseCommand::~MultiResponseCommand()
{

}


/**
 *
 **/
bool
MultiResponseCommand::process()
{
  //first check if this matches the next token in an ongoing multi-part cmd
  CmdIter iter = _cmd_coll.begin();
  bool found = false;
  while (iter != _cmd_coll.end()) {
    if (strncmp(iter->c_str(),_cmd.c_str(),iter->length()) == 0) {
      found = true;
      break;
    }
    ++iter;
  }
  if (found == false) {
    //OK, is this a request for an ongoing transaction?
    if (strncmp(WebGUI::WEBGUI_MULTI_RESP_TOK_BASE.c_str(),_cmd.c_str(),WebGUI::WEBGUI_MULTI_RESP_TOK_BASE.length()) == 0) {
      _next_token = _cmd;
    }
    else {
      return false;
    }
  }

  if (_next_token.empty() == true) { //want to start a new command
    _next_token = start_new_proc();
    _next_token = WebGUI::WEBGUI_MULTI_RESP_TOK_BASE + _next_token + "_1";
  }
  
  //then check if this matches a mult-part cmd
  string file_chunk = WebGUI::WEBGUI_MULTI_RESP_TOK_DIR + "/" + _next_token;
  struct stat s;
  if ((lstat(file_chunk.c_str(), &s) == 0) && S_ISREG(s.st_mode)) {
    //found chunk now read next
    FILE *fp = fopen(file_chunk.c_str(), "r");
    if (fp) {
      char buf[1025];
      while (fgets(buf,1024,fp) != 0) {
	_resp += string(buf);
      }
      _next_token = get_next_resp_file(_next_token);
      fclose(fp);
      return true;
    }
  }
  else { //need to determine if the chunker is done, or the request needs to be resent
    FILE *fp = fopen(WebGUI::WEBGUI_MULTI_RESP_PID.c_str(),"r"); //can we find the pid file...
    if (fp) {
      char buf[1025];
      if (fgets(buf, 1024, fp)) { //read the pid
	pid_t pid = (int)strtoul(buf,NULL,10);
	if (getpgid(pid)) {  //is the pid running?
	  fclose(fp);
	  return true; //yes, then return the same token as before
	}
      }
      fclose(fp);
    }
    
  }
  return false;
}

/**
 *
 **/
string
MultiResponseCommand::start_new_proc()
{
  //GOT TO FIGURE HOW TO KICK THIS OFF....
  /*
    probably make this a separate process that is started/stopped via script, i.e.
    /etc/init.d/multi_resp_webgui 'ping 12.12.12.12' token restart
   */
  string tok;
  tok = generate_token(tok);
  string command = WebGUI::WEBGUI_MULTI_RESP_INIT + " '" +  _cmd + "' " + tok + string(" restart");
  system(command.c_str());
  
  //CRAJ--RETURN INITIAL TOKEN KEY HERE
  return tok;
}

/**
 *
 **/
void
MultiResponseCommand::get_resp(string &token, string &output)
{
  string cmd = "kill -12 ";
  FILE *fp = fopen(WebGUI::WEBGUI_MULTI_RESP_PID.c_str(),"r"); //can we find the pid file...
  if (fp) {
    char buf[1025];
    if (fgets(buf, 1024, fp)) { //read the pid
      cmd  += string(buf);
      system(cmd.c_str());
    }
    fclose(fp);
  }
  token = _next_token;
  output = _resp;
}

/**
 *
 **/
void
MultiResponseCommand::load_valid_multi_cmds()
{
  //read in conf file and stuff values into set
  FILE *fp = fopen(WebGUI::WEBGUI_MULTI_RESP_CMDS.c_str(),"r"); 
  if (fp) {
    char buf[1025];
    while (fgets(buf,1024,fp) != 0) {
      string tmp(buf);
      int pos = tmp.find('#');
      if (pos > 0) {
	tmp = tmp.substr(0,pos);
      }
      pos = tmp.find('\n');
      if (pos > 0) {
	tmp = tmp.substr(0,pos);
      }
      //now if empty skip and make sure to drop '/n'
      if (tmp.empty() == false) {
	_cmd_coll.insert(tmp);
      }
    }
    fclose(fp);
  }
}

/**
 * Token is of the form: multi_%rand%_%chunk%
 **/
string
MultiResponseCommand::generate_token(std::string &tok)
{
  string ret = string("");;
  //if tok is empty then generate a new one
  if (tok.empty()) {
    unsigned long val;
    char buf[80];
    
    FILE *fp = fopen("/dev/urandom", "r");
    if (fp) {
      char *ptr = (char*)&val;
      
      *ptr = fgetc(fp); if (*ptr == EOF) return string("");
      *(ptr+1) = fgetc(fp); if (*(ptr+1) == EOF) return ret;
      *(ptr+2) = fgetc(fp); if (*(ptr+2) == EOF) return ret;
      *(ptr+3) = fgetc(fp); if (*(ptr+3) == EOF) return ret;

      unsigned long id = (float(val) / float(4294967296.)) * WebGUI::ID_RANGE * 2;
      sprintf(buf,"%lu",id);
      
      ret = string(buf);
      fclose(fp);
    }
  }
  return ret;
}

/**
 *
 **/
string
MultiResponseCommand::get_next_resp_file(std::string &tok)
{
  //find last character and add 1
  int pos = _cmd.rfind("_");
  string tmp = _cmd.substr(pos+1,_cmd.length());
  int val = strtoul(tmp.c_str(),NULL,10);
  ++val;
  char buf[80];
  sprintf(buf,"%d",val);
  return _cmd.substr(0,pos) + "_" + string(buf);
}
