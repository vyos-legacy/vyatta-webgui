#ifndef __MULTIRESPONSECOMMAND_HH__
#define __MULTIRESPONSECOMMAND_HH__

#include <string>
#include <set>

class MultiResponseCommand 
{
  typedef std::set<std::string> CmdColl;
  typedef std::set<std::string>::iterator CmdIter;

public:
  MultiResponseCommand(std::string session_id, std::string &cmd);
  ~MultiResponseCommand();

  void
  init();

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

  std::string
  get_next_resp_file(std::string &tok);

private:
  std::string _session_id;
  std::string _cmd;
  CmdColl _cmd_coll;
  std::string _resp;
  std::string _next_token;
  int _sock; //used to talk to chunker daemon
};
#endif //__MULTIRESPONSECOMMAND_HH__
