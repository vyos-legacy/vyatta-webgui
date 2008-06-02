#ifndef __AUTHENTICATE_HH__
#define __AUTHENTICATE_HH__

#include <iostream>
#include <string>
#include "systembase.hh"
#include "processor.hh"

class Authenticate : public SystemBase
{
public:
  Authenticate();
  ~Authenticate();
  
  bool
  create_new_session();

private:
  unsigned long test_auth(const std::string &username, const std::string &password);
};

#endif //__AUTHENTICATE_HH__
