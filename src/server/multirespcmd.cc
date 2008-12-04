#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>
#include <stdlib.h>

#include <string>
#include "common.hh"
#include "multirespcmd.hh"

using namespace std;

/**
 *
 **/
MultiResponseCommand::MultiResponseCommand(string &cmd) : _cmd(cmd)
{
  //read in valid cmd list

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
  string cmd;
  CmdIter iter = _cmd_coll.find(_cmd);
  if (iter != _cmd_coll.end()) {
    cmd = start_new_proc();
    ::sleep(1000); //sleep for 1 second
  }
  
  //then check if this matches a mult-part cmd
  string file_chunk = WebGUI::WEBGUI_MULTI_RESP_TOK_DIR + "/" + cmd;
  struct stat s;
  if (lstat(file_chunk.c_str(), &s)) {
    //found chunk now read next
    FILE *fp = fopen(file_chunk.c_str(), "r");
    if (fp) {
      char buf[1025];
      while (fgets(buf,1024,fp) != 0) {
	_resp += string(buf);
      }
      _next_token = generate_token(cmd);
      fclose(fp);
      return true;
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
    /etc/init.d/multi_resp_webgui start token "ping 12.12.12.12"
   */
  string command = "/etc/init.d/multi_resp_webgui start " + _next_token + "'" + _cmd + "'";
  system(command.c_str());
  
  //CRAJ--RETURN INITIAL TOKEN KEY HERE
  return string("");
}

/**
 *
 **/
void
MultiResponseCommand::get_resp(string &token, string &output)
{
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
      _cmd_coll.insert(buf);
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
      
      ret = WebGUI::WEBGUI_MULTI_RESP_TOK_BASE + string(buf) + "_1";
      fclose(fp);
    }
    else {
      //find last character and add 1
      int pos = _cmd.rfind("_");
      string tmp = _cmd.substr(pos,_cmd.length());
      int val = strtoul(tmp.c_str(),NULL,10);
      ++val;
      sprintf(buf,"%d",val);
      ret = _cmd.substr(0,pos) + "_" + string(buf);
    }
  }
  return ret;
}
