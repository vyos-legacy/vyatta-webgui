#ifndef __CHUNKER_MANAGER_HH__
#define __CHUNKER_MANAGER_HH__

#include <string>
#include <vector>
#include <map>
#include "chunker_processor.hh"

/**
 *
 *
 **/
class ProcessData
{
public:
  ProcessData() : _active(false) {}

  ChunkerProcessor _proc;
  unsigned long _time;
  std::string _command;
  std::string _token; //is the string version of the key
  bool _active;
};

/**
 *
 *
 **/
class ProcessQueue 
{
public:
  typedef std::map<std::string, ProcessData> ProcColl;
  typedef std::map<std::string, ProcessData>::iterator ProcIter;

public:
  ProcessQueue(unsigned long depth, const std::string &pid, unsigned long kill_timeout, unsigned long chunk_size, bool debug);
  virtual ~ProcessQueue();

  void
  update_time();
  
  void
  cull();

  void 
  push(std::string key, ProcessData &pd);

  void
  kill_process();

private:
  void
  start_new_proc();

  bool
  is_done();

  void
  pop();


private:
  ProcessData _active_proc;
  unsigned long _depth;
  ProcColl _proc_coll;
  const std::string _pid;
  unsigned long _chunk_size;
  unsigned long _kill_timeout;
  bool _debug;
};


/**
 *
 *
 **/
class ChunkerManager
{
public:
  ChunkerManager(const std::string &pid, unsigned long kill_timeout, unsigned long chunk_size,bool debug) : 
    _proc_queue(1,pid,kill_timeout,chunk_size,debug),
    _debug(debug) {}
  ~ChunkerManager();

  void
  init();

  //listens on pipe for message from webserver
  void
  read();

  void
  shutdown();
  
private:
  void
  process(char *buf);

private:
  ProcessQueue _proc_queue;
  int _listen_sock;
  bool _debug;
};

#endif //__CHUNKER_MANAGER_HH__
