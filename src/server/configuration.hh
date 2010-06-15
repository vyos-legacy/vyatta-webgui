#ifndef __CONFIGURATION_HH__
#define __CONFIGURATION_HH__

#include <map>
#include <string>
#include "systembase.hh"
#include "processor.hh"

class Configuration : public SystemBase
{
public:
  typedef enum {k_ENABLE,k_ENABLE_LOCAL,k_DISABLE,k_DISABLE_LOCAL} DISABLE_STATE;

public:
  Configuration();
  ~Configuration();

  void
  get_config();

private:
  DISABLE_STATE
  is_disabled(const std::string &rel_data_path, const std::string &conf_id, bool check_ancestors);

  std::string
  get_template();

  void
  get_template_node(const std::string &path, TemplateParams &params);

  std::string
  get_configuration();

  void
  get_full_level(const std::string &root_node, std::string &out, bool recursive);

  std::string
  get_full_op_level();

  std::map<std::string,WebGUI::NodeState>
  get_conf_dir(const std::string &root);

  void
  parse_value(std::string &rel_path, std::string &node_name, std::string &out);

  bool
  validate_session(std::string id);
};

#endif //__CONFIGURATION_HH__
