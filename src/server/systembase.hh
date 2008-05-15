#ifndef __SYSTEM_BASE__
#define __SYSTEM_BASE__

#include <iostream>
#include "processor.hh"

class SystemBase
{
public:
  SystemBase() : _proc(NULL) {}
  virtual ~SystemBase() {}

  void
  init(Processor *proc) {_proc = proc;}
  
protected:
  bool
  validate_session() {return true;}

  //protected:
public:
  Processor *_proc;
};

#endif //__SYSTEM_BASE__
