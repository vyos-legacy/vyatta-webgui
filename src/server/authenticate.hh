#ifndef __AUTHENTICATE_HH__
#define __AUTHENTICATE_HH__

#include <string>

class Authenticate
{
public:
  uid_t test_auth(const std::string &username, const std::string &password);

};

#endif //__AUTHENTICATE_HH__
