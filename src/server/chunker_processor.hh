#ifndef __CHUNKER_PROCESSOR_HH__
#define __CHUNKER_PROCESSOR_HH__

#include <string>

class ChunkerProcessor 
{
public:
  typedef enum {k_NOT_STARTED, k_IN_PROGRESS, k_DONE} ProcState;

public:
  ChunkerProcessor() : _state(k_NOT_STARTED) {}

  void
  init (unsigned long chunk_size, const std::string &pid_path, bool debug) ;

  void
  start_new(std::string token, const std::string &cmd);
  
  ProcState
  state() {return _state;}

private:
  void
  writer(std::string token, const std::string &cmd,int (&cp)[2]);
  
  void
  reader(std::string token, int (&cp)[2]);
  
  std::string 
  process_chunk(std::string &str, std::string &token, long &chunk_ct, long &last_time);
  
  void
  process_chunk_end(std::string &str, std::string &token, long &chunk_ct);
  
  void  
  parse(char *line, char **argv);
  
  pid_t
  pid_output (const char *path);


private:
  unsigned long _chunk_size;
  std::string _pid_path;
  unsigned long _kill_timeout;
  ProcState _state;
  bool _debug;
};

#endif //__CHUNKER_PROCESSOR_HH__
