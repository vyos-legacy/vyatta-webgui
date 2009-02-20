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
  
  WebGUI::AccessLevel
  get_access_level(const std::string &username, gid_t &gid);

private:
  bool
  test_auth(const std::string &username, const std::string &password);

  unsigned long
  reuse_session();

  unsigned long
  create_new_id();
 
  // is the user a member of the "group struct"?
  bool is_grp_member(struct group *g, const std::string &username);
  
  // is the user a member of the "named group"?
  bool is_group_member(const char *grpname, const std::string &username);
};

#endif //__AUTHENTICATE_HH__
