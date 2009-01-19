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
#include <iostream>
#include <string>
#include <map>
#include "common.hh"
#include "chunker_manager.hh"

using namespace std;

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
    cerr << "ChunkerManager::init(): error in creating listener socket" << endl;
    //    error("creating socket");
    return;
  }
  bzero((char *) &serv_addr, sizeof(serv_addr));
  serv_addr.sun_family = AF_UNIX;
  strcpy(serv_addr.sun_path, WebGUI::CHUNKER_SOCKET.c_str());
  servlen=strlen(serv_addr.sun_path) + sizeof(serv_addr.sun_family);
  if(bind(_listen_sock,(struct sockaddr *)&serv_addr,servlen)<0) {
    cerr << "ChunkerManager::init(): error in binding listener socket" << endl;
    return;
  }

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
  if (clientsock < 0) {
    cerr << "ChunkerManager::read(): error in accepting socket from listener" << endl;
    return;
  }
  int n = ::read(clientsock,buf,1024);
  buf[n] = '\0';
  //  printf("Read %d bytes from socket: %s\n",n,buf);

  process(buf);

  //done processing now close the socket
  close(clientsock);
  return;
}


/**
 *
 **/
void
ChunkerManager::process(char *buf)
{
  /****
       ADD CMD PROCESSOR HERE FOR DATA FROM THE SOCKET
   ****/
  struct timeval t;
  gettimeofday(&t,NULL);
  unsigned long cur_time = t.tv_sec;

  string command = string(buf);

  //grab the token
  size_t start_pos = command.find("<token>");
  size_t stop_pos = command.find("</token>");
  if (start_pos == string::npos || stop_pos == string::npos) {
    cerr << "ChunkerManager::process(): received empty token message" << endl;
    return;
  }
  string token = command.substr(start_pos+7,stop_pos-start_pos-7);
  if (token.empty()) {
    cerr << "ChunkerManager::process(): received empty token message" << endl;
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
  if (_debug) {
    cout << "ChunkerManager::process(): command received, token: " << token << ", statement: " << statement << endl;
  }


  //finally convert the token to a key
  int key = strtoul(token.c_str(),NULL,10);

  //ALSO NEED TO MATCH THE COMMAND TO SEE IF THIS IS A NEW OR ONGOING COMMAND
  ProcIter iter = _proc_coll.find(key);
  if (iter != _proc_coll.end() && statement.empty()) {
    iter->second._time = cur_time; //update time
  }
  else {
    ProcessData pd;
    pd._time = cur_time;
    pd._token = token;
    pd._command = statement;

    if (iter != _proc_coll.end()) {
      //then kill previous process
      kill_process(key);

      //let's clean out this directory now
      string clean_cmd = string("rm -f ") + WebGUI::CHUNKER_RESP_TOK_DIR + "/multi_" + pd._token + "* >/dev/null";
      system(clean_cmd.c_str());
    }

    //now start up the procesor
    pd._proc.init(_chunk_size,_pid,_debug);

    pd._proc.start_new(token,statement);

    _proc_coll.insert(pair<unsigned long, ProcessData>(key,pd));
  }
  
  //now go through and cull any orphaned processes
  iter = _proc_coll.begin();
  while (iter != _proc_coll.end()) {
    if (iter->second._time + _kill_timeout < cur_time) {
      //command might be ended, but just go ahead and clean up anyway

      //clean up entries
      string clean_cmd = string("rm -f ") + WebGUI::CHUNKER_RESP_TOK_DIR + "/multi_" + iter->second._token + "* >/dev/null";
      system(clean_cmd.c_str());

      kill_process(iter->first);
      _proc_coll.erase(++iter);
    }
    else {
      ++iter;
    }
  }
}

/**
 *
 **/
void
ChunkerManager::kill_all()
{
  ProcIter iter = _proc_coll.begin();
  while (iter != _proc_coll.end()) {
    kill_process(iter->first);
    ++iter;
  }
}

/**
 *
 **/
void
ChunkerManager::kill_process(unsigned long key)
{
  char buf[80];
  string cmd = "kill -9 ";

  //need to get pid from pid directory...
  sprintf(buf,"%u",key);
  string file = WebGUI::CHUNKER_RESP_PID + "/" + string(buf);
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
