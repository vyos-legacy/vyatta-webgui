#ifndef __CHUNKER_WRITER_HH__
#define __CHUNKER_WRITER_HH__

#include "thread_base.hh"

class ChunkerWriter : ThreadBase
{
public:
  ChunkerWriter(int pipe);
  ~ChunkerWriter();

  void
  run();

};



#endif __CHUNKER_WRITER_HH__
