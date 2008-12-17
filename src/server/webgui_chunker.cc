/*
 * Module: webgui_chunker.cc
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 as published
 * by the Free Software Foundation.
 */
#include <unistd.h>
#include <sys/types.h>
#include <sys/time.h>
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

//globals
unsigned long g_last_request_time = 0;


string 
process_chunk(string &str, string &token, long chunk_size, long &chunk_ct, long &last_time, long delta);

pid_t
pid_output (const char *path);

/**
 *
 **/
static void usage()
{
  cout << "webgui_chunker -cth" << endl;
  cout << "  -c command" << endl;
  cout << "  -t token" << endl;
  cout << "  -s chunk size" << endl;
  cout << "  -i pid" << endl;
  cout << "  -k kill timeout (seconds)" << endl;
  cout << "  -h help" << endl;
}

/**
 *
 **/
static void sig_end(int signo)
{
  syslog(LOG_ERR, "webgui_chunker, exit signal caught, exiting..");
}

static void sig_user2(int signo)
{
  //used to wake up the process to check paths
  struct timeval t;
  gettimeofday(&t,NULL);
  g_last_request_time = t.tv_sec;
}

/**
 *
 **/
int main(int argc, char* argv[])
{
  int ch;
  string pid_path = WebGUI::WEBGUI_MULTI_RESP_PID;
  string command, token;
  long chunk_size = 8192;
  long delta = 5;  //no outputs closer than 5 seconds apart
  unsigned long kill_timeout = 300; //5 minutes

  signal(SIGINT, sig_end);
  signal(SIGTERM, sig_end);
  signal(SIGUSR2, sig_user2);

  //grab inputs
  while ((ch = getopt(argc, argv, "c:s:t:i:k:h")) != -1) {
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
    case 'i':
      pid_path = optarg;
      break;
    case 'k':
      kill_timeout = strtoul(optarg,NULL,10);
      if (kill_timeout > 86400) { //one hour
	kill_timeout = 86400;
      }
      break;
    case 'h':
    default:
      usage();
      exit(0);
    }
  }


  if (fork() != 0) {
    //      int s;
    //      wait(&s);
    exit(0);
  }

  if (pid_path.empty() == false) {
    pid_output(pid_path.c_str());
  }

  //on start clean out directory as we are only allowing a single processing running at a time for now.
  string clean_cmd = string("rm -f ") + WebGUI::WEBGUI_MULTI_RESP_TOK_DIR + "/* >/dev/null";
  //  remove(string(WebGUI::WEBGUI_MULTI_RESP_TOK_DIR).c_str());
  system(clean_cmd.c_str());
  
  command = WebGUI::mass_replace(command,"'","'\\''");
  string opmodecmd = "/bin/bash -i -c '" + command + "'";
  FILE *fp = popen(command.c_str(), "r");

  char buf[chunk_size+1];
  long chunk_ct = 0;
  long last_time = 0;
  string tmp;
  /*
    Need to implement a kill switch here that allows this process
    to die if no msg is received from parent.   
  */
  struct timeval t;
  gettimeofday(&t,NULL);
  unsigned long cur_time;
  g_last_request_time = cur_time = t.tv_sec;

  while (fgets(buf, chunk_size, fp) && (g_last_request_time + kill_timeout > cur_time)) {
    tmp += string(buf);
    tmp = process_chunk(tmp, token, chunk_size, chunk_ct, last_time, delta);

    //now update our time
    gettimeofday(&t,NULL);
    cur_time = t.tv_sec;
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
    else {
      syslog(LOG_ERR,webgui:"Failed to write out response chunk");
    }
  }
  return str;
}

/**
 *
 *below borrowed from quagga library.
 **/
#define PIDFILE_MASK 0644
pid_t
pid_output (const char *path)
{
  FILE *fp;
  pid_t pid;
  mode_t oldumask;

  pid = getpid();

  oldumask = umask(0777 & ~PIDFILE_MASK);
  fp = fopen (path, "w");
  if (fp != NULL) 
    {
      fprintf (fp, "%d\n", (int) pid);
      fclose (fp);
      umask(oldumask);
      return pid;
    }
  /* XXX Why do we continue instead of exiting?  This seems incompatible
     with the behavior of the fcntl version below. */
  syslog(LOG_ERR,"Can't fopen pid lock file %s, continuing",
            path);
  umask(oldumask);
  return -1;
}
