#ifndef __COMMAND_HH__
#define __COMMAND_HH__

#include "systembase.hh"
#include "processor.hh"

class Command : public SystemBase
{
public:
  Command();
  ~Command();

  void
  execute_command(const std::string &username, WebGUI::AccessLevel access_level);

private:
  bool
  multi_part_op_cmd(std::string &cmd,std::string &username);

  void
  execute_single_command(std::string &cmd, const std::string &username, WebGUI::AccessLevel access_level, std::string &resp, WebGUI::Error &err);

  bool
  validate_session(std::string id);

  WebGUI::AccessLevel
  validate_op_cmd(const std::string &username, WebGUI::AccessLevel user_access_level, std::string &cmd);
};
#endif //__COMMAND_HH__
