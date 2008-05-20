#ifndef __CONFIGURATION_HH__
#define __CONFIGURATION_HH__

#include <map>
#include <string>
#include "systembase.hh"
#include "processor.hh"

class Configuration : public SystemBase
{
public:
  Configuration();
  ~Configuration();

  void
  get_config();

private:
  std::string
  get_template();

  void
  get_template_node(const std::string &path, TemplateParams &params);

  std::string
  get_configuration();

  std::map<std::string,WebGUI::NodeState>
  get_conf_dir(const std::string &root);

  void
  parse_configuration(std::string &rel_config, std::string &rel_template, long &depth, std::string &out);

  void
  parse_template(std::string &rel_template, long &depth, std::string &out);

  void
  parse_value(std::string &root, std::string &out);

  bool
  validate_session(unsigned long id);
};

#endif //__CONFIGURATION_HH__
