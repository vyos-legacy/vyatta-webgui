#include <sys/types.h>
#include <sys/stat.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <netinet/in.h>
#include <sys/time.h>
#include <strings.h>
#include <string.h>
#include <unistd.h>
#include <stdlib.h>
#include <syslog.h>
#include <unistd.h>
#include <fcntl.h>
#include <iostream>
#include <string>
#include <map>
#include "common.hh"
#include "chunker_manager.hh"

using namespace std;

/**
 *
 **/
ProcessQueue::ProcessQueue(unsigned long depth, const std::string &pid, unsigned long kill_timeout, unsigned long chunk_size, bool debug) : 
  _depth(depth),
  _pid(pid),
  _chunk_size(chunk_size),
  _kill_timeout(kill_timeout),
  _debug(debug)
{
}

/**
 *
 **/
ProcessQueue::~ProcessQueue()
{
}

/**
 * updates current time for specific process coll
 **/
void
ProcessQueue::update_time()
{
  timeval t;
  gettimeofday(&t,NULL);
  _active_proc._time = t.tv_sec;
}

/**
 * runs through all keys for timeout, kills and restarts
 **/
void
ProcessQueue::cull()
{
  struct timeval t;
  gettimeofday(&t,NULL);
  unsigned long cur_time = t.tv_sec;
  
  if ((_active_proc._time + _kill_timeout) < cur_time ||
      is_done() == true) {
    //kill current process
    WebGUI::debug("ProcessQueue::cull() process killed, exceeded timeout: ");
    
    //erase and start second process
    kill_process();
    start_new_proc();
  }
}

/**
 * pushes process into key queue, will start process is necessary
 **/
void
ProcessQueue::push(string key, ProcessData &pd)
{
  if (key.empty()) {
    return;
  }

  WebGUI::debug("ProcessQueue::push(), entering push");
  ProcIter i = _proc_coll.find(key);
  if (i == _proc_coll.end()) {
    _proc_coll.insert(pair<string,ProcessData>(key,pd));
    i = _proc_coll.find(key);
  }
  else {
    i->second = pd;
    //replace last entry...
  }
  char buf[80];
  sprintf(buf,"%d",(int)_proc_coll.size());
  WebGUI::debug("ProcessQueue::push(), pushing command into queue of size: " + string(buf));

  //only start if this is the first one
  if (_active_proc._active == false) {
    start_new_proc();
  }
}

/**
 *
 **/
void
ProcessQueue::start_new_proc()
{
  ProcIter i = _proc_coll.begin();
  if (i != _proc_coll.end()) {
      WebGUI::debug("ProcessQueue::start_new_proc(): starting new process...");
      _active_proc = i->second;
      _active_proc._proc.init(_chunk_size,_pid,_debug);
      _active_proc._proc.start_new(_active_proc._token,_active_proc._command);
      _active_proc._active = true;
      _proc_coll.erase(i);
  }
  else {
    _active_proc = ProcessData(); //reset with empty non-processing process
  }
}

/**
 *
 **/
void
ProcessQueue::kill_process()
{
  string cmd = "kill -9 -"; //now is expecting to kill group

  //need to get pid from pid directory...
  string file = WebGUI::CHUNKER_RESP_PID + "/" + _active_proc._token;
  FILE *fp = fopen(file.c_str(), "r");
  char pid[81];
  if (fp) {
    fread(pid,80,1,fp);
    fclose(fp);
  }
  else {
    return;
  }

  cmd += string(pid);

  system(cmd.c_str());
}

/**
 *
 **/
bool
ProcessQueue::is_done()
{
  string end_file = WebGUI::CHUNKER_RESP_TOK_DIR + WebGUI::CHUNKER_RESP_TOK_BASE + _active_proc._token + "_end";
  struct stat s;

  WebGUI::debug("ProcessQueue::is_done(): checking for end file status: " + end_file);

  return (lstat(end_file.c_str(), &s) == 0);
}

/**
 *
 **/
ChunkerManager::~ChunkerManager()
{
  //close the socket
  close(_listen_sock);
}

/**
 *
 **/
void
ChunkerManager::init()
{
  //clean up output directory on startup
  string clean_cmd = string("rm -f ") + WebGUI::CHUNKER_RESP_TOK_DIR + "/* >/dev/null";
  system(clean_cmd.c_str());

  string clean_connector = string("rm -f ") + WebGUI::CHUNKER_SOCKET;
  system(clean_connector.c_str());

  int servlen;
  struct sockaddr_un serv_addr;
  
  if ((_listen_sock = socket(AF_UNIX,SOCK_STREAM,0)) < 0) {
    WebGUI::debug("ChunkerManager::init(): error in creating listener socket");
    syslog(LOG_ERR, "dom0: err in creating listener socket");
    //    error("creating socket");
    return;
  }


  bzero((char *) &serv_addr, sizeof(serv_addr));
  serv_addr.sun_family = AF_UNIX;
  strcpy(serv_addr.sun_path, WebGUI::CHUNKER_SOCKET.c_str());
  servlen=strlen(serv_addr.sun_path) + sizeof(serv_addr.sun_family);
  if(bind(_listen_sock,(struct sockaddr *)&serv_addr,servlen)<0) {
    WebGUI::debug("ChunkerManager::init(): error in binding listener socket");
    syslog(LOG_ERR, "dom0: err in binding listener socket");
    return;
  }

  
  //set non-blocking
  int flags;
  if (-1 == (flags = fcntl(_listen_sock, F_GETFL, 0))) {
    flags = 0;
  }
  fcntl(_listen_sock, F_SETFL, flags | O_NONBLOCK);
  chmod(WebGUI::CHUNKER_SOCKET.c_str(),S_IROTH|S_IWOTH|S_IXOTH|S_IRGRP|S_IWGRP|S_IXGRP|S_IRUSR|S_IWUSR|S_IXUSR);
}

/**
 * listen for commands from pipe
 **/
void
ChunkerManager::read()
{
  char buf[1025];
  struct sockaddr_un  cli_addr;
  //listen for new connection
  listen(_listen_sock,5);
  int clilen = sizeof(cli_addr);
  int clientsock = accept(_listen_sock,(struct sockaddr *)&cli_addr,(socklen_t*)&clilen);
  if (clientsock > -1) {
    int n = ::read(clientsock,buf,1024);
    buf[n] = '\0';
    process(buf);
    //done processing now close the socket
    close(clientsock);
  }
  else {
    process(NULL);
  }
  //  printf("Read %d bytes from socket: %s\n",n,buf);

  return;
}


/**
 *
 **/
void
ChunkerManager::process(char *buf)
{
  struct timeval t;
  gettimeofday(&t,NULL);
  unsigned long cur_time = t.tv_sec;
    
  if (buf != NULL) {
    string command = string(buf);
    
    //grab the token
    size_t start_pos = command.find("<token>");
    size_t stop_pos = command.find("</token>");
    if (start_pos == string::npos || stop_pos == string::npos) {
      WebGUI::debug("ChunkerManager::process(): received empty token message");
      syslog(LOG_DEBUG,"dom0: received empty token message");
      return;
    }
    string token = command.substr(start_pos+7,stop_pos-start_pos-7);
    if (token.empty()) {
      WebGUI::debug("ChunkerManager::process(): received empty token message");
      syslog(LOG_DEBUG,"dom0: received empty token message");
      return;
    }
    
    //now grab the command
    string statement;
    start_pos = command.find("<statement>");
    stop_pos = command.find("</statement>");
    if (start_pos == string::npos || stop_pos == string::npos) {
      //do nothing here
    }
    else {
      statement = command.substr(start_pos+11,stop_pos-start_pos-11);
    }
    WebGUI::debug("ChunkerManager::process(): command received, token: " + token + ", statement: " + statement);
    
    /*
      Let's do the following:
      1) push new request into queue
      2) kill any timeout processes
      3) start any new processes if there is an opening
    */

    //add new command to queue
    if (statement.empty() == false) {
      ProcessData pd;
      pd._time = cur_time;
      pd._token = token;
      pd._command = statement;

      //will start process if nothing in active queue
      _proc_queue.push(token,pd);
    }
    else {
      _proc_queue.update_time();
    }
  }    
  //now go through and cull any orphaned processes
  _proc_queue.cull();

}

/**
 *
 **/
void
ChunkerManager::shutdown()
{
  _proc_queue.kill_process();
  //clean up output directory on startup
  string clean_cmd = string("rm -f ") + WebGUI::CHUNKER_RESP_TOK_DIR + "/* >/dev/null";
  system(clean_cmd.c_str());
}



