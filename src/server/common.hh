#ifndef __COMMON_HH__
#define __COMMON_HH__

class WebGUI
{
public:
  const static unsigned long ID_START;

  typedef enum Error {SUCCESS = 0,
		      MALFORMED_REQUEST,
		      AUTHENTICATION_FAILURE,
		      SESSION_FAILURE,
		      SERVER_FAILURE,
		      COMMAND_ERROR,
		      COMMIT_IN_PROGRESS,
		      CONFIGURATION_CHANGE};


  static char const *ErrorDesc[];


  typedef enum MsgType {NEWSESSION = 0,
			CLICMD,
			GETCONFIG,
			CLOSESESSION,
			NOTIFICATION};

  typedef enum ParseNode {NEWSESSION_USER = 0,
			  NEWSESSION_PSWD,
			  GETCONFIG_ID,
			  CLICMD_ID};

  typedef enum NodeType {NONE,
			 TEXT,
			 IPV4,
			 IPV4NET,
			 IPV6,
			 IPV6NET,
			 U32,
			 BOOL,
			 MACADDR};


  /**
   *
   *
   **/
  bool static 
  execute(std::string &cmd, bool read = false);


  static std::string
  mass_replace(const std::string &source, const std::string &victim, const std::string &replacement);


};


#endif
