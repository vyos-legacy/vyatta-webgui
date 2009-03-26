/* a client in the unix domain */
#include <sys/types.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <string>
#include <stdio.h>
#include "common.hh"

using namespace std;

void error(char *);

int main(int argc, char *argv[])
{
  int sockfd, servlen,n;
  struct sockaddr_un  serv_addr;
  char buffer[1025];

  bzero((char *)&serv_addr,sizeof(serv_addr));
  serv_addr.sun_family = AF_UNIX;
  strcpy(serv_addr.sun_path, WebGUI::CHUNKER_SOCKET.c_str());
  servlen = strlen(serv_addr.sun_path) + 
    sizeof(serv_addr.sun_family);
  if ((sockfd = socket(AF_UNIX, SOCK_STREAM,0)) < 0)
    error("Creating socket");
  if (connect(sockfd, (struct sockaddr *) 
	      &serv_addr, servlen) < 0)
    error("Connecting");
  printf("Please enter your message: ");
  bzero(buffer,1024);
  fgets(buffer,1024,stdin);

  string tok = "999";
  char buffer2[1024];
  bzero(buffer2,1024);
  sprintf(buffer2,WebGUI::CHUNKER_MSG_FORMAT.c_str(),tok.c_str(),buffer);



  write(sockfd,buffer2,strlen(buffer2));
  n=read(sockfd,buffer,1024);
  printf("The return message was\n");
  write(1,buffer,n);   
  return 0;
}

void error(char *msg)
{
  perror(msg);
}
