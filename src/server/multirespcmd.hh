#ifndef __MULTIRESPONSECOMMAND_HH__
#define __MULTIRESPONSECOMMAND_HH__

#include <string>
#include <set>

class MultiResponseCommand 
{
  typedef std::set<std::string> CmdColl;
  typedef std::set<std::string>::iterator CmdIter;

public:
  MultiResponseCommand(std::string &cmd);
  ~MultiResponseCommand();

  bool
  process();

  void
  get_resp(std::string &error, std::string &output);

private:
  void
  load_valid_multi_cmds();

  std::string
  start_new_proc();

  std::string
  generate_token(std::string &tok);

private:
  std::string _cmd;
  CmdColl _cmd_coll;
  std::string _resp;
  std::string _next_token;
};
#endif //__MULTIRESPONSECOMMAND_HH__
