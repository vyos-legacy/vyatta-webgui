#include <unistd.h>
#include <sys/time.h>
#include <sys/sysinfo.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <pwd.h>
#include <signal.h>
#include <syslog.h>
#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <iostream>
#include <string>
#include "common.hh"
#include "chunker_processor.hh"

using namespace std;

/**
 *
 **/
void
ChunkerProcessor::start_new(string token, const string &cmd)
{
  if (_debug) {
    cout << "ChunkerProcessor::start_new(): starting new processor" << endl;
  }

  struct sigaction sa;
  sigaction(SIGCHLD, NULL, &sa);
  sa.sa_flags |= SA_NOCLDWAIT;//(since POSIX.1-2001 and Linux 2.6 and later)
  sigaction(SIGCHLD, &sa, NULL);

  if (fork() != 0) {
    //parent
    return;
  }

  //should detach child process at this point

  umask(0);
  setsid();

  int cp[2]; /* Child to parent pipe */

  if( pipe(cp) < 0) {
    perror("Can't make pipe");
    exit(1);
  }
  
  pid_t pid = fork();
  if (pid == 0) {
    //child
    writer(token,cmd,cp);
    exit(0);
  }
  else {
    //parent
    reader(token,cp);

    //now wait on child to kick the bucket
    wait();
    exit(0);
  }
}

/**
 *
 **/
void
ChunkerProcessor::writer(string token, const string &cmd,int (&cp)[2])
{
  //set up to run as user id...

  string file = WebGUI::VYATTA_MODIFY_FILE + token;
  struct stat buf;
  if (stat(file.c_str(), &buf) != 0) {
    return;
  }
  FILE *fp = fopen(file.c_str(), "r");
  if (!fp) {
    return;
  }
  char name_buf[1025];
  if (fgets(name_buf, 1024, fp) == NULL) {
    fclose(fp);
    return;
  }
  fclose(fp);
  struct passwd *pw;
  pw = getpwnam(name_buf);
  if (pw == NULL) {
    return;
  }

  //move this up the timeline in the future, but this is where we will initially set the uid/gid
  //retreive username, then use getpwnam() from here to populate below
  if (setgid(pw->pw_gid) != 0) {
    return;
  }
  if (setuid(pw->pw_uid) != 0) {
    return;
  }

  //now we are ready to do some real work....


  //use child pid to allow cleanup of parent
  if (_pid_path.empty() == false) {
    _pid_path += "/" + token;
    pid_output(_pid_path.c_str());
  }
  /* Child. */
  close(1); /* Close current stdout. */
  dup2( cp[1],1); /* Make stdout go to write end of pipe. */
  dup2( cp[1],2); /* Make stderr go to write end of pipe. */
  close(0); /* Close current stdin. */
  close( cp[0]);

  string opmodecmd = cmd;

  //  opmodecmd = WebGUI::mass_replace(cmd,"'","'\\''");
  //  opmodecmd = opmodecmd + "'";

  //opmodecmd = WebGUI::mass_replace(cmd,"'","");

  
  //--rcfile /etc/bash_completion -i -c
  string arg1="--rcfile";
  string arg2="/etc/bash_completion";
  string arg3="-i";
  string arg4="-c";

  syslog(LOG_DEBUG,"command: %s",opmodecmd.c_str());
  if (_debug) {
    cout << "ChunkerProcessor::writer(): command to be executed: " << opmodecmd << endl;
  }

  int err = execlp("/bin/bash",
		   "/bin/bash",
		   arg1.c_str(),
		   arg2.c_str(),
		   arg3.c_str(),
		   arg4.c_str(),
		   opmodecmd.c_str(),
		   NULL);
  if (_debug) {
    cout << "ChunkerProcessor::writer(): finished executing cmd: " << err << endl;
  }
  syslog(LOG_ERR, "ERROR RECEIVED FROM EXECVP(1): %d, %d",err, errno);
}

/**
 *
 **/
void
ChunkerProcessor::reader(string token,int (&cp)[2])
{
  /* Parent. */
  /* Close what we don't need. */
  char buf[_chunk_size+1];
  long chunk_ct = 0;
  string tmp;
  
  usleep(1000*1000);
  struct sysinfo info;
  long last_time = info.uptime = 0;
  if (sysinfo(&info) == 0) {
    last_time = info.uptime;
  }
  close(cp[1]);
  while ((read(cp[0], &buf, 1) == 1)) {
    tmp += string(buf);
    tmp = process_chunk(tmp, token, chunk_ct, last_time);
  }
  process_chunk_end(tmp,token,chunk_ct);
}


/**
 * write out remainder and create bumper
 **/
void
ChunkerProcessor::process_chunk_end(string &str, string &token, long &chunk_ct)
{
  string chunk = str;
  /*
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
  */
  char buf[80];
  sprintf(buf,"%lu",chunk_ct);
  string file = WebGUI::CHUNKER_RESP_TOK_DIR + WebGUI::CHUNKER_RESP_TOK_BASE + token + "_" + string(buf);
  FILE *fp = fopen(file.c_str(), "w");
  if (fp) {
    fwrite(chunk.c_str(),1,chunk.length(),fp);
    fclose(fp);
  }
  else {
    syslog(LOG_ERR,"webgui: Failed to write out response chunk");
  }
  

  //if we naturally end write out bumper file to common directory...
  file = WebGUI::CHUNKER_RESP_TOK_DIR + WebGUI::CHUNKER_RESP_TOK_BASE + token + "_end";
  fp = fopen(file.c_str(), "w");
  if (fp) {
    fwrite("end",1,3,fp);
    fclose(fp);
  }
  return;
}

/**
 *
 **/
string 
ChunkerProcessor::process_chunk(string &str, string &token, long &chunk_ct, long &last_time)
{
  struct sysinfo info;
  unsigned long cur_time = 0;
  if (sysinfo(&info) == 0) {
    cur_time = info.uptime;
  }

  if (str.size() > _chunk_size || last_time + WebGUI::CHUNKER_MAX_WAIT_TIME < cur_time) {
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
    string file = WebGUI::CHUNKER_RESP_TOK_DIR + WebGUI::CHUNKER_RESP_TOK_BASE + token + "_" + string(buf);
    FILE *fp = fopen(file.c_str(), "w");
    if (fp) {
      fwrite(chunk.c_str(),1,chunk.length(),fp);
      ++chunk_ct;
      last_time = cur_time;
      fclose(fp);
    }
    else {
      syslog(LOG_ERR,"webgui: Failed to write out response chunk");
    }
  }
  return str;
}

/**
 *
 **/
void  
ChunkerProcessor::parse(char *line, char **argv)
{
  while (*line != '\0') {       /* if not the end of line ....... */ 
    while (*line == ' ' || *line == '\t' || *line == '\n')
      *line++ = '\0';     /* replace white spaces with 0    */
    *argv++ = line;          /* save the argument position     */
    while (*line != '\0' && *line != ' ' && 
	   *line != '\t' && *line != '\n') 
      line++;             /* skip the argument until ...    */
  }
  *argv = '\0';                 /* mark the end of argument list  */
}


/**
 *
 *below borrowed from quagga library.
 **/
#define PIDFILE_MASK 0644
pid_t
ChunkerProcessor::pid_output (const char *path)
{
  FILE *fp;
  pid_t pid;
  mode_t oldumask;

  //  pid = getpid();
  //switched to pid group!
  pid = getpgrp();

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
