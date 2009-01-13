#ifndef __CHUNKER_PROCESSOR_HH__
#define __CHUNKER_PROCESSOR_HH__

#include <string>

class ChunkerProcessor 
{
public:
  ChunkerProcessor() {}

  void
  init (unsigned long chunk_size, const std::string &pid_path, bool debug) 
  {
    _chunk_size = chunk_size;
    _pid_path = pid_path;
    _debug = debug;
  }

  void
  start_new(std::string token, const std::string &cmd);
  
private:
  void
  writer(std::string token, const std::string &cmd,int (&cp)[2]);
  
  void
  reader(std::string token, int (&cp)[2]);
  
  
  std::string 
  process_chunk(std::string &str, std::string &token, long &chunk_ct, long &last_time);
  
  void  
  parse(char *line, char **argv);
  
  pid_t
  pid_output (const char *path);


private:
  unsigned long _chunk_size;
  std::string _pid_path;
  unsigned long _kill_timeout;
  bool _debug;
};

#endif //__CHUNKER_PROCESSOR_HH__
