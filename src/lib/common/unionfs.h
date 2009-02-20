#ifndef __UNIONFS_HH__
#define __UNIONFS_HH__

#include <glib-2.0/glib.h>
#include <stdio.h>
#include "defs.h"
#include "../cli_val.h"
#include "../cli_objects.h"

/* names of VYATTA env vars */
#define ENV_EDIT_LEVEL "VYATTA_EDIT_LEVEL"
#define ENV_TEMPLATE_LEVEL "VYATTA_TEMPLATE_LEVEL"
#define ENV_A_DIR "VYATTA_ACTIVE_CONFIGURATION_DIR"
#define ENV_C_DIR "VYATTA_CHANGES_ONLY_DIR"
#define ENV_M_DIR "VYATTA_TEMP_CONFIG_DIR"
#define ENV_T_DIR "VYATTA_CONFIG_TEMPLATE"
#define ENV_TMP_DIR "VYATTA_CONFIG_TMP"
#define DEF_A_DIR "/opt/vyatta/config/active"
#define DEF_T_DIR "/opt/vyatta/share/ofr/template"
#define ENV_OLD_PS1 "VYATTA_OLD_PS1"
#define NODE_PRIORITY_FILE "/opt/vyatta/share/vyatta-cfg/priority"

#define NODE_TAG_FILE "node.tag"
#define VALUE_FILE "node.val"
#define MODIFIED_FILE ".modified"
#define DEF_FILE "def"
#define WHITEOUT_FILE ".wh.__dir_opaque"
#define DELETED_NODE ".wh."

#define MAX_LENGTH_DIR_PATH 1024
#define MAX_LENGTH_HELP_STR 1024

boolean
value_exists(char *path);

struct PriData {
  unsigned long _pri;
  gchar **_tok_str;
};


struct ValueData
{
  boolean _leaf;
  NODE_OPERATION _state;
};


#endif //__UNIONFS_HH__
