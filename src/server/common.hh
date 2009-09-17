#ifndef __COMMON_HH__
#define __COMMON_HH__

class WebGUI
{
public:
  const static unsigned long ID_START;
  const static unsigned long ID_RANGE;
  const static unsigned long ID_MAX;

  const static unsigned long DEFAULT_SESSION_TIMEOUT_WINDOW;
  const static std::string VYATTA_CONFIG_SESSION_TIMEOUT_WINDOW;
  
  const static std::string VYATTA_TEMP_CONFIG_DIR;
  const static std::string VYATTA_CHANGES_ONLY_DIR;
  const static std::string VYATTA_ACTIVE_CONFIGURATION_DIR;

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

  const static std::string OPENAPP_GUI_USER;
  const static std::string OPENAPP_GUI_GROUP;

  const static std::string OPENAPP_USER_RESTRICTED_POLICY_ADMIN;
  const static std::string OPENAPP_USER_RESTRICTED_POLICY_USER;
  
  const static std::string OA_GUI_ENV_AUTH_USER;

  const static std::string OA_GUI_ENV_SESSION_ID;

  enum Error {SUCCESS = 0,
	      MALFORMED_REQUEST,
	      AUTHENTICATION_FAILURE,
	      SESSION_FAILURE,
	      SERVER_FAILURE,
	      COMMAND_ERROR,
	      COMMIT_IN_PROGRESS,
	      CONFIGURATION_CHANGE,
	      RESTRICTED_ACCESS};


  static char const *ErrorDesc[];


  enum MsgType {NEWSESSION = 0,
		CLICMD,
		GETCONFIG,
		CLOSESESSION,
		NOTIFICATION,
		TOKEN};

  enum ParseNode {EMPTY = 0,
		  NEWSESSION_USER,
		  NEWSESSION_PSWD,
		  GETCONFIG_ID,
		  GETCONFIG_NODE,
		  CLICMD_ID,
		  CLICMD_STATEMENT};

  enum Attributes {NOATTR = 0,
		   OP,
		   GUI,
		   CONF};

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
  
  
  enum AccessLevel {ACCESS_RESTRICTED = 0, //only allowed to change pw
		    ACCESS_USER = 1,
                    ACCESS_ADMIN = 2,
                    ACCESS_INSTALLER = 3,
		    ACCESS_NONE = 4};
  
  /**
   *
   *
   **/
  static bool
  is_restricted(std::string id);

  /**
   *
   *
   **/
  static std::string
  get_user(std::string id);

  static bool
  set_user(std::string id, const std::string &user, bool restricted,
           const std::string &pass);

  /**
   *
   *
   **/
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
  static unsigned long
  get_session_timeout();

  /**
   *
   *
   **/
  static void
  remove_session(std::string id);
  static void
  discard_session(std::string &id);
  
  static int 
  mkdir_p(const char *path);

  static std::string
  unionfs(void);

  static int
  get_gui_uid(uid_t &uid);
  
  static int
  get_gui_gid(gid_t &gid);


  static void
  debug(std::string);

  static void
  enable_debug(bool state);

private:
  static bool _debug;
  static FILE* _deb_fp;

};


#endif
