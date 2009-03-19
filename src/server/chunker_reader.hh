#ifndef __CHUNKER_READER_HH__
#define __CHUNKER_READER_HH__

class ChunkerReader : public ThreadBase
{
public:
  ChunkerReader(unsigned long key, ChunkerManager &mgr) : _key(key), _mgr(mgr) {}
  ~ChunkerReader();

  std::string
  process_chunk();

  void
  run();

private:
  bool _shutdown;
  unsigned long _key;
  ChunkerManager _mgr;
};

#define //__CHUNKER_READER_HH__
