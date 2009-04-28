/**
 * Module: guicmdhandler.hh
 *
 * Author: Michael Larson
 * Date: 2009
 */
#ifndef __GUICMDHANDLER_HH__
#define __GUICMDHANDLER_HH__

#include <string>
#include "processor.hh"

class GUICmdHandler
{
public:
  GUICmdHandler(Message &msg) : _msg(msg) {}
  ~GUICmdHandler() {}

  WebGUI::Error
  process();

  std::string
  get_response_str();

private: //variables
  Message _msg;
  std::string _resp;
};
#endif //__GUICMDHANDLER_HH__
