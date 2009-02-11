#ifndef __CHUNKER_MANAGER_HH__
#define __CHUNKER_MANAGER_HH__

#include <string>
#include <map>
#include "chunker_processor.hh"

class ProcessData
{
public:
  ChunkerProcessor _proc;
  unsigned long _time;
  std::string _command;
  std::string _token; //is the string version of the key
};

class ChunkerManager
{
public:
  typedef std::map<unsigned long, ProcessData> ProcColl;
  typedef std::map<unsigned long, ProcessData>::iterator ProcIter;

public:
  ChunkerManager(const std::string &pid, unsigned long kill_timeout, unsigned long chunk_size,bool debug) : 
    _pid(pid),
    _kill_timeout(kill_timeout),
    _chunk_size(chunk_size),
    _debug(debug) {}
  ~ChunkerManager();

  void
  init();

  //listens on pipe for message from webserver
  void
  read();

  void
  kill_all();

  void
  shutdown();
  
private:
  void
  process(char *buf);

  void
  kill_process(unsigned long key);

private:
  ProcColl _proc_coll;
  std::string _pid;
  int _listen_sock;
  unsigned long _kill_timeout;
  unsigned long _chunk_size;
  bool _debug;
};

#endif //__CHUNKER_MANAGER_HH__
