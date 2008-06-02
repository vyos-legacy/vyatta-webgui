#ifndef __COMMON_HH__
#define __COMMON_HH__

class WebGUI
{
public:
  const static unsigned long ID_START;
  const static unsigned long ID_RANGE;

  const static std::string ACTIVE_CONFIG_DIR;
  const static std::string CONFIG_TMP_DIR;
  const static std::string LOCAL_CHANGES_ONLY;
  const static std::string LOCAL_CONFIG_DIR;
  const static std::string CFG_TEMPLATE_DIR;
  const static std::string COMMIT_LOCK_FILE;

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

  typedef enum ParseNode {EMPTY = 0,
			  NEWSESSION_USER,
			  NEWSESSION_PSWD,
			  GETCONFIG_ID,
			  GETCONFIG_NODE,
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

  typedef enum NodeState {ACTIVE,
			  DELETE,
			  SET};


  static std::string
  generate_response(Error err);

  /**
   *
   *
   **/
  static int
  execute(std::string &cmd, std::string &stdout, bool read = false);

  /**
   *
   *
   **/
  static std::string
  mass_replace(const std::string &source, const std::string &victim, const std::string &replacement);

  /**
   *
   *
   **/
  static std::string
  trim_whitespace(const std::string &src);

};


#endif
