#ifndef __COMMON_HH__
#define __COMMON_HH__

class WebGUI
{
public:
  const static unsigned long ID_START;
  const static unsigned long ID_RANGE;

  const static unsigned long SESSION_TIMEOUT_WINDOW;

  const static std::string OP_COMMAND_DIR;
  const static std::string ACTIVE_CONFIG_DIR;
  const static std::string CONFIG_TMP_DIR;
  const static std::string LOCAL_CHANGES_ONLY;
  const static std::string LOCAL_CONFIG_DIR;
  const static std::string CFG_TEMPLATE_DIR;
  const static std::string OP_TEMPLATE_DIR;
  const static std::string COMMIT_LOCK_FILE;
  const static std::string VYATTA_MODIFY_DIR;
  const static std::string VYATTA_MODIFY_FILE;
  const static std::string VERBATIM_OUTPUT;

  const static std::string CHUNKER_RESP_CMDS;
  const static std::string CHUNKER_RESP_INIT;
  const static std::string CHUNKER_RESP_TOK_DIR;
  const static std::string CHUNKER_RESP_TOK_BASE;
  const static std::string CHUNKER_RESP_PID;
  const static std::string CHUNKER_SOCKET;
  const static unsigned long CHUNKER_MAX_WAIT_TIME;
  const static std::string CHUNKER_MSG_FORMAT;
  const static std::string CHUNKER_UPDATE_FORMAT;

  enum Error {SUCCESS = 0,
	      MALFORMED_REQUEST,
	      AUTHENTICATION_FAILURE,
	      SESSION_FAILURE,
	      SERVER_FAILURE,
	      COMMAND_ERROR,
	      COMMIT_IN_PROGRESS,
	      CONFIGURATION_CHANGE};


  static char const *ErrorDesc[];


  enum MsgType {NEWSESSION = 0,
		CLICMD,
		GETCONFIG,
		CLOSESESSION,
		NOTIFICATION,
		TOKEN,
		VMSTATUS,
		VMUSER};

  enum ParseNode {EMPTY = 0,
		  NEWSESSION_USER,
		  NEWSESSION_PSWD,
		  GETCONFIG_ID,
		  GETCONFIG_NODE,
		  CLICMD_ID,
		  VMSTATUS_ID,
		  VMUSER_ID};

  enum Attributes {NOATTR = 0,
		   OP};

  enum NodeType {NONE,
		 TEXT,
		 IPV4,
		 IPV4NET,
		 IPV6,
		 IPV6NET,
		 U32,
		 BOOL,
		 MACADDR};
  
  enum NodeState {ACTIVE,
		  DELETE,
		  SET};
  
  
  enum AccessLevel {ACCESS_USER = 0,
                    ACCESS_ADMIN = 1,
                    ACCESS_INSTALLER = 2,
		    ACCESS_NONE = 3};
  

  static std::string
  generate_response(std::string &token, Error err);

  /**
   *
   *
   **/
  static int
  execute(std::string &cmd, std::string &stdout, bool &verbatim,
          bool read = false, bool raw = false);

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

  /**
   *
   *
   **/
  static void
  remove_session(unsigned long id);
  static void
  remove_session(std::string &id);
  static void
  discard_session(std::string &id);
  
  static int 
  mkdir_p(const char *path);

  static std::string
  unionfs(void);

};


#endif
