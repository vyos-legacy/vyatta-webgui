/**
 * Module: guicmdhandler.cc
 *
 * Author: Michael Larson
 * Date: 2009
 */
#include <string.h>
#include <iostream>
#include <syslog.h>
#include <string>
#include <vector>
#include "rl_str_proc.hh"
#include "common.hh"
#include "guicmdhandler.hh"

using namespace std;

/**
 *
 *
 **/
WebGUI::Error
GUICmdHandler::process()
{
  string cmd = string(_msg._request);
  //parse the command and data segments
  size_t start_pos = cmd.find("<handler>");
  if (start_pos == string::npos) {
    return WebGUI::COMMAND_ERROR;  
  }
  size_t end_pos = cmd.find("</handler>");
  if (start_pos == string::npos) {
    return WebGUI::COMMAND_ERROR;  
  }
  string command = cmd.substr(start_pos+9,end_pos-start_pos-9);

  if (command.empty()) {
    //return error
    _resp = WebGUI::ErrorDesc[WebGUI::COMMAND_ERROR];
    return WebGUI::COMMAND_ERROR;
  }
  //WILL ALLOW EMPTY DATA FIELDS
  start_pos = cmd.find("<data>");
  end_pos = cmd.find("</data>"); 
  string data;
  if (start_pos != string::npos && end_pos != string::npos) {
    data = cmd.substr(start_pos+6,end_pos-start_pos-6);
  }
  //parse the node.def that contains the specific command
  StrProc str_proc(command, " ");
  
  //let's piece  together the path
  string path;
  vector<string> coll = str_proc.get();
  vector<string>::iterator iter = coll.begin();
  while (iter != coll.end()) {
    path += *iter + "/";
    ++iter;
  }
  path += "node.def";

  //now execute the whole kabob

  //execute
  string opmodecmd = cmd;
  
  cmd = WebGUI::mass_replace(cmd,"'","'\\''");

  data = WebGUI::mass_replace(data,"'","'\\'\\\\\\'\\''");
  data = "'\\''" + data + "'\\''";

  string environment = "export VYATTA_CONFIG_TMP=/opt/vyatta/config/tmp/tmp_" + _msg.id() + "; \
export VYATTA_CHANGES_ONLY_DIR="+WebGUI::LOCAL_CHANGES_ONLY + _msg.id() + "; \
export VYATTA_TEMP_CONFIG_DIR="+WebGUI::LOCAL_CONFIG_DIR+_msg.id();


  opmodecmd = "/bin/bash -c '" + environment + ";source /usr/lib/cgi-bin/vyatta-proc;_vyatta_proc_run " + command  + " " + data + "'";
  
  string stdout;
  bool verbatim = false;
  
  WebGUI::Error err;
  if (WebGUI::execute(opmodecmd,stdout,true) == 0) {
    err = WebGUI::SUCCESS;
  } else {
    err = WebGUI::COMMAND_ERROR;
  }
  
  //set the error response
  _resp = stdout;
  return err;
}

/**
 *
 *
 **/
std::string
GUICmdHandler::get_response_str()
{
  return _resp;
}
