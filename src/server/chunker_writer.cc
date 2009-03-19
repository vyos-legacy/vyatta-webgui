#include <unistd.h>
#include "common.hh"
#include "chunker_writer.hh"

using namespace std;

/**
 *
 **/
void
ChunkerWriter::run()
{
    /* Child. */
  close(1); /* Close current stdout. */
  dup( cp[1]); /* Make stdout go to write                                                                                        
		  end of pipe. */
  close(0); /* Close current stdin. */
  close( cp[0]);
  
  cmd = WebGUI::mass_replace(cmd,"'","'\\''");
  //    string opmodecmd = "/bin/bash -i -c '" + command + "'";
  //    string opmodecmd = "/bin/bash -i -c " + command;
  string opmodecmd = cmd;
  
  char *argv[64];
  char *tmp = (char*)opmodecmd.c_str();
  parse(tmp, argv);

  //probably need to fork here and get pid of child so that it can be killed by the parent
  
  execvp(argv[0], argv);
}
