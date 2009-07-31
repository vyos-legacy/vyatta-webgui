
#include "chunker_reader.hh"

using namespace std;

/**
 *
 **/
void
ChunkerReader::run()
{
    /* Parent. */
    /* Close what we don't need. */
    char buf[chunk_size+1];
    long chunk_ct = 0;
    long last_time = 0;
    string tmp;

    //mutex protected access
    ProcessData data = mgr.get_data(key);

    usleep(1000*1000);
    close(cp[1]);
    while ((read(cp[0], &buf, 1) == 1) && (g_shutdown == false) && (g_last_request_time + kill_timeout > cur_time)) {
      tmp += string(buf);
      tmp = process_chunk(tmp, token, chunk_size, chunk_ct, last_time, delta);
      
      //now update our time
      gettimeofday(&t,NULL);
      cur_time = t.tv_sec;
    }
    exit(0);
}


/**
 *
 **/
string 
ChunkerReader::process_chunk()
{
  struct sysinfo info;
  long cur_time = 0;
  if (sysinfo(&info) == 0) {
    cur_time = info.uptime;
  }

  if ((long)str.size() > chunk_size || last_time + delta < cur_time) {
    //OK, let's find a natural break and start processing
    size_t pos = str.rfind('\n');
    string chunk;
    if (pos != string::npos) {
      chunk = str.substr(0,pos);
      str = str.substr(pos+1,str.length());
    }
    else {
      chunk = str;
      str = string("");
    }

    char buf[80];
    sprintf(buf,"%lu",chunk_ct);
    string file = WebGUI::WEBGUI_MULTI_RESP_TOK_DIR + WebGUI::WEBGUI_MULTI_RESP_TOK_BASE + token + "_" + string(buf);
    FILE *fp = fopen(file.c_str(), "w");
    if (fp) {
      fwrite(chunk.c_str(),1,chunk.length(),fp);
      ++chunk_ct;
      last_time = cur_time;
      fclose(fp);
    }
    else {
      syslog(LOG_ERR,"dom0: Failed to write out response chunk");
    }
  }
  return str;
}

