#ifndef CLI_OBJ_H
#define CLI_OBJ_H

#include "cli_val.h"

#define APATH (get_f_seg_a_ptr())
#define CPATH (get_f_seg_c_ptr())
#define MPATH (get_f_seg_m_ptr())

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

/* the string to use as $(@), must be set 
   before call to expand_string */
char* get_at_string(void);
void set_at_string(char* s);
void free_at_string(void);

boolean is_in_delete_action(void);
void set_in_delete_action(boolean b);

boolean is_in_commit(void);
void set_in_commit(boolean b);

boolean is_in_exec(void);
void set_in_exec(boolean b);

boolean is_echo(void);
void set_echo(boolean b);

boolean is_silent_msg(void);
void set_silent_msg(boolean b);

valstruct* get_cli_value_ptr(void);

first_seg* get_f_seg_a_ptr(void);
first_seg* get_f_seg_c_ptr(void);
first_seg* get_f_seg_m_ptr(void);

int is_in_cond_tik(void);
void set_in_cond_tik(int ict);
void dec_in_cond_tik(void);

const char* get_tdirp(void);
const char* get_cdirp(void);
const char* get_adirp(void);
const char* get_mdirp(void);
const char* get_tmpp(void);

char* get_elevp(void);
char* get_tlevp(void);

void init_edit(void);
void init_paths(boolean for_commit);

#endif /* CLI_OBJ_H */
