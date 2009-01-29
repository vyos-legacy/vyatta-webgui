#include <unistd.h>
#include <sys/time.h>
#include <sys/sysinfo.h>
#include <sys/types.h>
#include <sys/stat.h>
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
  //use child pid to allow cleanup of parent
  if (_pid_path.empty() == false) {
    _pid_path += "/" + token;
    pid_output(_pid_path.c_str());
  }
  /* Child. */
  close(1); /* Close current stdout. */
  dup( cp[1]); /* Make stdout go to write end of pipe. */
  close(0); /* Close current stdin. */
  close( cp[0]);

  string opmodecmd;
  opmodecmd = WebGUI::mass_replace(cmd,"'","'\\''");
  opmodecmd = "/bin/bash -c '" + opmodecmd + "'";
  //    string opmodecmd = "/bin/bash -i -c " + command;
  //  string opmodecmd = cmd;

  //  syslog(LOG_ERR, "chunker command: %s",opmodecmd.c_str());

  char *argv_tmp[64], *argv[64];
  char *tmp = (char*)cmd.c_str();
  //  parse(tmp, argv_tmp);
  /*
  argv[0] = "/bin/bash\0";
  //  argv[1] = "-i\0";
  argv[1] = "-c\0";
  string str = string("'") + cmd.c_str() + "'\0";
  argv[2] = (char*)str.c_str();

  printf("argv[0]: %s, %s\n",argv[0],argv_tmp[0]);
  printf("argv[1]: %s, %s\n",argv[1],argv_tmp[1]);
  printf("argv[2]: %s, %s\n",argv[2],argv_tmp[2]);
  //  printf("argv[3]: %s, %s\n",argv[3],argv_tmp[3]);
  */

  
string shell = "export VYATTA_TEMPLATE_LEVEL=/;\
export vyatta_datadir=/opt/vyatta/share;\
export vyatta_op_templates=/opt/vyatta/share/vyatta-op/templates;\
export vyatta_sysconfdir=/opt/vyatta/etc;\
export vyatta_sharedstatedir=/opt/vyatta/com;\
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin;\
export vyatta_sbindir=/opt/vyatta/sbin;export vyatta_bindir=/opt/vyatta/bin;\
export vyatta_libdir=/opt/vyatta/lib;\
export vyatta_localstatedir=/opt/vyatta/var;\
export vyatta_libexecdir=/opt/vyatta/libexec;\
export vyatta_infodir=/opt/vyatta/share/info;source /etc/bash_completion.d/10vyatta-op; _vyatta_op_run ";
  


  opmodecmd = WebGUI::mass_replace(cmd,"'","");
  char tmpcmd[1024];


  //  opmodecmd = "/bin/bash -c '" + shell + opmodecmd + "'";
  //  opmodecmd = shell + opmodecmd;

  //  need to set up the cmd like: argv[0] = /bin/bash, 1 = -c 2 = rest


  syslog(LOG_DEBUG,"command: %s",opmodecmd.c_str());

  sprintf(tmpcmd,"%s",opmodecmd.c_str());
  //  printf("%s<end>\n",tmpcmd);
  /*

  sprintf(tmpcmd,"ping  10.3.0.1");
  printf("%s<end>\n",tmpcmd);
  */
  //  parse(tmpcmd,argv);
  //  syslog(LOG_ERR,"argv[x]: %s, %s, %s",argv[0],argv[1],argv[2]);
  /*
  printf("argv[0]: %s\n",argv[0]);
  printf("argv[1]: %s\n",argv[1]);
  */
  
  //let's give the reader a chance to write out a single chunk
  //  execvp(argv[0], argv);
  //  int err = execlp("/bin/ping","/bin/ping", "10.3.0.232",NULL);
  //  opmodecmd = "'" + opmodecmd + "'";

  int err = execlp("/usr/lib/cgi-bin/chunker_cmd",
		   "/usr/lib/cgi-bin/chunker_cmd",
		   opmodecmd.c_str(),
		   NULL);
  syslog(LOG_ERR, "ERROR RECEIVED FROM EXECVP(1): %d, %d",err, errno);
  /*
  err = execlp("_vyatta_op_run",
	       "_vyatta_op_run",
	       "/bin/ping", 
	       "10.3.0.232",
	       NULL);

  syslog(LOG_ERR, "ERROR RECEIVED FROM EXECVP(2): %d, %d",err, errno);
  */
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
  
  struct sysinfo info;
  unsigned long cur_time = 0;
  long last_time = info.uptime = 0;
  if (sysinfo(&info) == 0) {
    last_time = info.uptime;
  }
  usleep(1000*1000);
  close(cp[1]);
  while ((read(cp[0], &buf, 1) == 1)) {
    tmp += string(buf);
    tmp = process_chunk(tmp, token, chunk_ct, last_time);

    //now update our time
    if (sysinfo(&info) == 0) {
      cur_time = info.uptime;
    }
  }
  process_chunk_end(tmp,token,chunk_ct);
}


/**
 * write out remainder and create bumper
 **/
void
ChunkerProcessor::process_chunk_end(string &str, string &token, long &chunk_ct)
{
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
