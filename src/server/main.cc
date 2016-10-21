/*
 * Module: main.cc
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 as published
 * by the Free Software Foundation.
 */
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/wait.h>
#include <signal.h>
#include <syslog.h>
#include <stdio.h>
#include <iostream>
#include <unistd.h>
#include "sessionexchange.hh"
#include "sessionexchangefile.hh"
#include "sessionexchangesocket.hh"
#include "sessionexchangestdio.hh"
#include "manager.hh"

pid_t pid_output (const char *path);

Manager *g_manager;

using namespace std;

static void usage()
{
  cout << "webgui -pvidh" << endl;
  cout << "-p port" << endl;
  cout << "-v print debug output" << endl;
  cout << "-i specify location of pid directory" << endl;
  cout << "-d run as daemon" << endl;
  cout << "-s strip error messages" << endl;
  cout << "-h help" << endl;

}

static void sig_end(int signo)
{
  cerr << "End signal: " << signo << endl;
  syslog(LOG_ERR, "webgui, exit signal caught, exiting..");
  exit(0);
}

static void sig_user(int signo)
{
  cerr << "User signal: " << signo << endl;
  syslog(LOG_ERR, "webgui, user exit signal caught, exiting..");
  exit(0);
}


int main(int argc, char* argv[])
{
  int ch;
  bool debug = false;
  bool strip_err_msg = false;
  bool daemon = false;
  string pid_path = "/opt/vyatta/var/run/webgui.pid";
  string file; 
  unsigned long port = 0;


  //DISABLE OLD API
  //exit(0);

  //grab inputs
  while ((ch = getopt(argc, argv, "p:vi:df:hs")) != -1) {
    switch (ch) {
    case 'p':
      port = strtoul(optarg,NULL,10);
      break;
    case 'v':
      debug = true;
      break;
    case 'i':
      pid_path = optarg;
      break;
    case 'd':
      daemon = true;
      break;
    case 'f':
      file = optarg;
    case 's':
      strip_err_msg = true;
    case 'h':
    default:
      usage();
      exit(0);
    }
  }
  if (daemon) {
    int s(0);
    if (fork() != 0) {
      wait(&s);
      exit(0);
    }
  }

  if (pid_path.empty() == false) {
    pid_output(pid_path.c_str());
  }

  //fork
  //crack open sessionid, match and get guid/uid
  //child sets guid/uid
  //parent dies
  int s(0);
  if (fork() != 0) {
    wait(&s);
    exit(0); //always fork and kill parent
  }

  signal(SIGINT, sig_end);
  signal(SIGTERM, sig_end);
  signal(SIGUSR1, sig_user);
  SessionExchange *se;
  if (port > 0) {
    se = new SessionExchangeSocket(port, debug);
  }
  else if (!file.empty()) {
    se = new SessionExchangeFile(file, debug);
  }
  else {
    se = new SessionExchangeStdIO(debug);
  }
  se->init();
  g_manager = new Manager(se, strip_err_msg, debug);


  if (debug) {
    cout << "main: Entering main processing loop" << endl;
  }

  //application logic right here
  /*
  while (g_manager->process()) {
    usleep(1000*1000); //for one second
  }
  */
  //set up for single shot right now--will fix later

  g_manager->process();

  if (debug) {
    cout << "main(): Shutting down" << endl;
  }

  if (g_manager) {
    delete g_manager;
  }

  exit(0);
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
