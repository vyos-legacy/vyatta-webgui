/*
 * Module: main.cc
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 as published
 * by the Free Software Foundation.
 */
#include <sys/types.h>
#include <sys/stat.h>
#include <vector>
#include <signal.h>
#include <syslog.h>
#include <stdio.h>
#include <unistd.h>
#include <errno.h>
#include <arpa/inet.h>
#include <sys/types.h>
#include <netdb.h>
#include <netinet/in.h>
#include <sys/ioctl.h>
#include <sys/socket.h>
#include <iostream>

using namespace std;


int init(string &server, unsigned short port);

int
authenticate(int sock);

bool
get_config(int sock, int id);

bool
send_cmd(int sock);


static void usage()
{
  cout << "test address -pvidh" << endl;
  cout << "-p port" << endl;
  cout << "-p file" << endl;
  cout << "-v print debug output" << endl;
  cout << "-h help" << endl;

}

int main(int argc, char* argv[])
{
  int ch;
  bool debug = false;
  bool config_debug_mode = false, daemon = false;
  string pid_path = "/var/run";
  string file; 
  string server = "127.0.0.1";
  unsigned short port = 80;

  //grab inputs
  while ((ch = getopt(argc, argv, "s:p:vf:h")) != -1) {
    switch (ch) {
    case 's':
      server = optarg;
      break;
    case 'p':
      port = strtoul(optarg,NULL,10);
      break;
    case 'v':
      debug = true;
      break;
    case 'f':
      file = optarg;
    case 'h':
    default:
      usage();
      exit(0);
    }
  }

  int sock = init(server,port);
  if (sock > 0) {
    int id = authenticate(sock);
    if (id != 0) {
      if (get_config(sock, id)) {
	//print out config here
	cout << "getting configuration" << endl;
      }
      
      if (send_cmd(sock)) {
	cout << "sent command" <<endl;
      }
    }
  }
  exit(0);
}


int 
init(string &server, unsigned short port)
{
  int sock = socket(AF_INET, SOCK_STREAM, 0);
  if (sock < 0){
    cerr << "LBPathTest::LBPathTest(): no send sock: " << sock << endl;
    return 0;
  }

  struct sockaddr_in addr;
  memset( &addr, 0, sizeof( struct sockaddr_in ));
  addr.sin_family = AF_INET;

  //convert target_addr to ip addr
  in_addr_t tmp_addr = inet_addr(server.c_str());
  addr.sin_addr.s_addr = tmp_addr; 
  addr.sin_port = htons(port);

  cout << "connecting" << endl;
  int ret = connect(sock, (struct sockaddr*)&addr, sizeof(addr));
  if (ret != 0) {
    cerr << "failed on connect: " << ret << ", " << strerror(errno) << ", on " << server << endl;
    return 0;
  }
  return sock;
}



int
authenticate(int sock)
{
  int id = -1;
  cout << "authenticating" << endl;
  /*
    now send along authentication request

    <?xml version="1.0" encoding="utf-8"?>
    <vyatta>
    <auth>
    <user>username</user>
    <pswd>password</pswd>
    </auth>
    </vyatta>
   */
  string auth_string = "<?xml version='1.0' encoding='utf-8'?><vyatta><auth><user>foo</user><pswd>bar</pswd></auth></vyatta>";

  //now go ahead and send this
  int ret = send(sock, auth_string.c_str(), auth_string.length(), 0);
  if (ret < 0) {
    cerr << "received error on authenticate send: " << strerror(errno) << endl;
    //error in send
    return 0;
  }
  cout << "sent " << ret << " bytes. now receiving response " << endl;
  
  //now recv resp
  char buffer[2048];
  ret = recv(sock, &buffer, 2048, 0);
  if (ret > 0) {
    //parse out id here and return



    cout << "received response from authentication request" << endl;
    for (int i = 0; i < ret; ++i) {
      cout << buffer[i];
    }
    //dump out buffer here
    cout << endl;
  }
  else {
    cerr << "received error on authenticate recv" << endl;
  }
  return id;
}


bool
get_config(int sock, int id)
{
  char buf[20];
  sprintf(buf, "%d",id);
  //format a simple configuration request here
  string request = "<?xml version='1.0' encoding='utf-8'?><vyatta><configuration><id>"+string(buf)+"</id><node mode='all' depth='child'>node</node></configuration></vyatta>";

  char buffer[2048];
  int ret = send(sock, request.c_str(), request.length(), 0);
  if (ret < 0) {
    cerr << "received error on configuration send: " << strerror(errno) << endl;
    //error in send
    return false;
  }
  cout << "sent " << ret << " bytes. now receiving response " << endl;
  
  //now recv resp
  ret = recv(sock, &buffer, 2048, 0);
  if (ret > 0) {
    //parse out id here and return
    cout << "received response from configuration request" << endl;
    for (int i = 0; i < ret; ++i) {
      cout << buffer[i];
    }
    //dump out buffer here
    cout << endl;
  }
  else {
    cerr << "received error on configuration recv" << endl;
  }
  return true;
}

bool
send_cmd(int sock)
{

}
