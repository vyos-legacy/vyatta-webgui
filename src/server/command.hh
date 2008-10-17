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
  execute_command();

  void
  execute_single_command(std::string &cmd, std::string &resp, int &err);

private:
  bool
  validate_session(unsigned long id);

  bool
  validate_op_cmd(std::string &cmd);
};
#endif //__COMMAND_HH__
