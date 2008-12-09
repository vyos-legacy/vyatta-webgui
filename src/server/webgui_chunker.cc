/*
 * Module: webgui_chunker.cc
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 as published
 * by the Free Software Foundation.
 */
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/wait.h>
#include <sys/sysinfo.h>
#include <signal.h>
#include <stdlib.h>
#include <syslog.h>
#include <stdio.h>
#include <iostream>
#include <string>
#include "common.hh"

using namespace std;


string 
process_chunk(string &str, string &token, long chunk_size, long &chunk_ct, long &last_time, long delta);

/**
 *
 **/
static void usage()
{
  cout << "webgui_chunker -cth" << endl;
  cout << "  -c command" << endl;
  cout << "  -t token" << endl;
  cout << "  -s chunk size" << endl;
  cout << "  -h help" << endl;
}

/**
 *
 **/
static void sig_end(int signo)
{
  cerr << "End signal: " << signo << endl;
  syslog(LOG_ERR, "webgui_chunker, exit signal caught, exiting..");
}

/**
 *
 **/
static void sig_user(int signo)
{
  cerr << "User signal: " << signo << endl;
  syslog(LOG_ERR, "webgui_chunker, user exit signal caught, exiting..");
}

/**
 *
 **/
int main(int argc, char* argv[])
{
  int ch;
  string command, token;
  long chunk_size = 8192;
  long delta = 5;  //no outputs closer than 5 seconds apart

  //grab inputs
  while ((ch = getopt(argc, argv, "c:s:t:h")) != -1) {
    switch (ch) {
    case 'c':
      command = optarg;
      break;
    case 't':
      token = optarg;
      break;
    case 's':
      chunk_size = strtoul(optarg,NULL,10);
      if (chunk_size < 1024 || chunk_size > 131072) {  //to 2^17
	chunk_size = 8192;
      }
      break;
    case 'h':
    default:
      usage();
      exit(0);
    }
  }
  
  FILE *fp = popen(command.c_str(), "r");

  char buf[chunk_size+1];
  long chunk_ct = 0;
  long last_time = 0;
  string tmp;
  while (fgets(buf, chunk_size, fp)) {
    tmp += string(buf);
    tmp = process_chunk(tmp, token, chunk_size, chunk_ct, last_time, delta);
  }
  pclose(fp);
  exit(0);
}

/**
 *
 **/
string 
process_chunk(string &str, string &token, long chunk_size, long &chunk_ct, long &last_time, long delta)
{
  struct sysinfo info;
  long cur_time = 0;
  if (sysinfo(&info) == 0) {
    cur_time = info.uptime;
  }

  if ((long)str.size() > chunk_size || last_time + delta < cur_time) {
    //OK, let's find a natural break and start processing
    size_t pos = str.rfind('\n');
    string chunk;
    if (pos != string::npos) {
      chunk = str.substr(0,pos);
      str = str.substr(pos+1,str.length());
    }
    else {
      chunk = str;
      str = string("");
    }

    char buf[80];
    sprintf(buf,"%lu",chunk_ct);
    string file = WebGUI::WEBGUI_MULTI_RESP_TOK_DIR + WebGUI::WEBGUI_MULTI_RESP_TOK_BASE + token + "_" + string(buf);
    FILE *fp = fopen(file.c_str(), "w");
    if (fp) {
      fwrite(chunk.c_str(),1,chunk.length(),fp);
      ++chunk_ct;
      last_time = cur_time;
      fclose(fp);
    }
  }
  return str;
}
