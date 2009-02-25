#include <time.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <string.h>
#include <grp.h>
#include <pwd.h>
#include <unistd.h>
#include <dirent.h>
#include <iostream>
#include <unistd.h>
#include <vector>
#include <string>
#include "common.hh"
#include "processor.hh"
#include "session.hh"

using namespace std;

/**
 *
 **/
Session::Session(int sock, bool debug) : 
  _sock(sock),
  _valid(false),
  _debug(debug)
{
  _processor = NULL;
}

/**
 *
 **/
void
Session::init(Processor *proc)
{
  _processor = proc;

  _authenticate.init(_processor);
  _configuration.init(_processor);
  _command.init(_processor);
}

/**
 *
 **/
void
Session::set_sock(int sock) 
{
  _sock = sock;
  if (_sock > 0) {
    _valid = true;
  }
}

/**
 *
 **/
void
Session::set_message(vector<uint8_t> &buf)
{
  _processor->set_request(buf);
}

/**
 *
 **/
void
Session::set_message(string &str)
{
  _processor->set_request(str);
}

std::string
Session::get_message() 
{
  return _processor->get_response();
}

/**
 *
 **/
bool
Session::process_message()
{
  if (_debug) {
    cout << "Session::process_message(), entering" << endl;
  }

  //parse the message, and compute the response back
  if (_processor->parse() == true) {
    if (_debug) {
      cout << "Session::process_message(), session received valid request" << endl;
    }

    Message msg = _processor->get_msg();

    /* 
       Clean up any dangling sessions here. Makes sense to check 
       here and nowhere else, as this is the only command that
       creates new sessions.
    */
    clean_up_old_sessions();

    switch (msg._type) {
    case WebGUI::NEWSESSION:
      if (_debug) {
	cout << "Session::process_message(): NEWSESSION" << endl;
      }
      //also handles the case where the session is already active
      if (_authenticate.create_new_session() == true) {
	start_session();
      }
      break;

    case WebGUI::CLICMD:
      if (_debug) {
	cout << "Session::process_message(): CLICMD" << endl;
      }

      if (!commit()) {
	return false;
      }

      if (!update_session()) {
	return false;
      }
      _command.execute_command(_access_level);
      break;

    case WebGUI::GETCONFIG:
      if (_debug) {
	cout << "Session::process_message(): GETCONFIG" << endl;
      }

      if (!commit()) {
	return false;
      }

      if (!update_session()) {
	return false;
      }
      _configuration.get_config();
      break;

    case WebGUI::CLOSESESSION:
      if (_debug) {
	cout << "Session::process_message(): CLOSESESSION" << endl;
      }
      close_session();
      break;

    default:
      if (_debug) {
	cerr << "Session::process_message(): message type is unknown: " << endl;
      }
      _processor->set_response(WebGUI::MALFORMED_REQUEST);
      return false;
    }
  }
  else {
    if (_debug) {
      cerr << "Session::process_message(): message is unknown" << endl;
    }
    _processor->set_response(WebGUI::MALFORMED_REQUEST);
    return false;
  }
  return true;
}

/**
 *
 **/
void
Session::clear_message()
{
  _processor->clear_message();
}

/**
 *
 **/
bool
Session::commit()
{
  string file(WebGUI::COMMIT_LOCK_FILE);
  struct stat tmp;
  if (stat(file.c_str(), &tmp) == 0) {
    _processor->set_response(WebGUI::COMMIT_IN_PROGRESS);
    return false;
  }
  return true;
}

/**
 *
 **/
bool
Session::update_session()
{
  string stdout;
  //get timestamp from file
  string file = WebGUI::VYATTA_MODIFY_FILE + _processor->get_msg().id();
  
  //  cout << "file: " << file << endl;

  struct stat buf;

  if (stat(file.c_str(), &buf) != 0) {
    _processor->set_response(WebGUI::SESSION_FAILURE);
    return false;
  }

  FILE *fp = fopen(file.c_str(), "r");
  if (!fp) {
    _processor->set_response(WebGUI::SESSION_FAILURE);
    return false;
  }

  char name_buf[1025];
  if (fgets(name_buf, 1024, fp) == NULL) {
    _processor->set_response(WebGUI::SESSION_FAILURE);
    fclose(fp);
    return false;
  }

  fclose(fp);

  struct passwd *pw;
  pw = getpwnam(name_buf);
  if (pw == NULL) {
    _processor->set_response(WebGUI::SESSION_FAILURE);
    return false;
  }

  //let's check whether the user is currently a member of vyattacfg or operator group
  _access_level = _authenticate.get_access_level(name_buf);
  if (_processor->get_msg()._conf_mode == WebGUI::CONF && _access_level != WebGUI::ACCESS_ALL) {
    _processor->set_response(WebGUI::SESSION_ACCESS_FAILURE);
    return false;
  }

  //move this up the timeline in the future, but this is where we will initially set the uid/gid
  //retreive username, then use getpwnam() from here to populate below
  struct group *gr = NULL;
  if (_access_level == WebGUI::ACCESS_ALL) {
    gr = getgrnam("vyattacfg");
  } 
  else if (_access_level == WebGUI::ACCESS_OPER) {
    gr = getgrnam("operator");
  }
  if (gr == NULL) {
    _processor->set_response(WebGUI::SESSION_FAILURE);
    return false;
  }

  if (setgid(gr->gr_gid) != 0) {
    _processor->set_response(WebGUI::SESSION_FAILURE);
    return false;
  }

  if (setuid(pw->pw_uid) != 0) {
    _processor->set_response(WebGUI::SESSION_FAILURE);
    return false;
  }

  //now touch session time mark file'
  string update_file = "sudo touch " + file;
  WebGUI::execute(update_file, stdout);
  return true;
}

/**
 *
 **/
void
Session::start_session()
{
  //get timestamp from file
  string file = WebGUI::VYATTA_MODIFY_FILE + _processor->get_msg().id();

  string update_file = "sudo touch " + file;
  //now touch session time mark file
  string stdout;
  WebGUI::execute(update_file,stdout);
}



/**
 *
 **/
void
Session::clean_up_old_sessions()
{
  /*
    iterate through .vyattamodify_* files and check timestamp.
    if timestamp is old then parse id and discard session.
  */

  DIR *dp;
  struct dirent *dirp;

  if ((dp = opendir(WebGUI::VYATTA_MODIFY_DIR.c_str())) == NULL) {
    return;
  }
  while ((dirp = readdir(dp)) != NULL) {
    if (strncmp(dirp->d_name, ".vyattamodify_", 14) == 0) {
      struct stat tmp;
      if (lstat((WebGUI::VYATTA_MODIFY_DIR + string(dirp->d_name)).c_str(), &tmp) == 0) {
	string id_str = string(dirp->d_name).substr(14,24);
	time_t t = time(NULL);
	if ((tmp.st_mtime + WebGUI::SESSION_TIMEOUT_WINDOW) < (unsigned)t) {

	  //as requested by justin don't discard changes on timeout expiration!
	  WebGUI::discard_session(id_str);
	  //have to clean up session at this point!!!!!!!!

	  //now blow away the cookie file
	  string cookie_file = WebGUI::VYATTA_MODIFY_FILE + id_str;
	  unlink(cookie_file.c_str());
	}
      }
    }
  }
  closedir(dp);
}

