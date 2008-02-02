wwwdir          = /srv/www
pagesdir        = $(wwwdir)/pages
cssdir          = $(pagesdir)/css
imagesdir       = $(pagesdir)/images
jsdir           = $(pagesdir)/js

AM_CFLAGS = -I src -Wall
sbin_PROGRAMS =
pages_PROGRAMS =
noinst_PROGRAMS =
pkglib_LTLIBRARIES =
css_DATA =
images_DATA =
js_DATA =
pages_DATA =
sysconf_DATA =

clean : clean_cgi clean_basic clean_basic_client clean_common clean_xgcgi clean_xgcgi2 clean_xgdaemon

clean_cgi:
	rm src/cgi/*.la;
	rm src/cgi/*.lo;

clean_basic:
	rm src/basic/*.la;
	rm src/basic/*.lo;

clean_basic_client:
	rm src/basic_client/*.la;
	rm src/basic_client/*.lo;

clean_common :
	rm src/common/*.o;
	rm src/common/*.la;
	rm src/common/*.lo;
	rm src/common/data/*.la;
	rm src/common/data/*.lo;
	rm src/common/textparse/*.la;
	rm src/common/textparse/*.lo;

clean_xgcgi :
	rm src/xgcgi/*.o;
	rm src/xgcgi/*.la;
	rm src/xgcgi/*.lo;
	rm src/xgcgi/xgcgi;
	rm src/xgcgi/xgcgi_test;

clean_xgcgi2 :
	rm src/xgcgi2/*.o;
	rm src/xgcgi2/xgcgi2;

clean_xgdaemon :
	rm src/xgdaemon/*.o;
	rm src/xgdaemon/xgdaemon;


sbin_PROGRAMS	+= src/xgdaemon/xgdaemon

pages_PROGRAMS	+= src/xgcgi/xgcgi
pages_PROGRAMS	+= src/xgcgi2/xgcgi2

noinst_PROGRAMS	+= src/xgcgi/xgcgi_test



pkglib_LTLIBRARIES      += src/basic/libbasic.la
pkglib_LTLIBRARIES      += src/basic_client/libbasicclient.la
pkglib_LTLIBRARIES      += src/cgi/libcgi.la
pkglib_LTLIBRARIES      += src/common/libxgcommon.la
pkglib_LTLIBRARIES      += src/common/data/libxgdata.la
pkglib_LTLIBRARIES      += src/common/textparse/libxgtextparse.la
pkglib_LTLIBRARIES      += src/xgcgi/libxgcgi.la



src_basic_libbasic_la_CPPFLAGS  = -I$(srcdir)/src
src_basic_libbasic_la_SOURCES	  = src/basic/basic_error_info.cc
src_basic_libbasic_la_SOURCES	 += src/basic/basic_error_info.hh
src_basic_libbasic_la_SOURCES  += src/basic/common_xml.cc
src_basic_libbasic_la_SOURCES  += src/basic/common_xml.hh
src_basic_libbasic_la_SOURCES  += src/basic/xgdaemon_socket.cc
src_basic_libbasic_la_SOURCES  += src/basic/xgdaemon_socket.hh
src_basic_libbasic_la_SOURCES  += src/basic/xgdaemon_util.cc
src_basic_libbasic_la_SOURCES	 += src/basic/xgdaemon_util.hh
src_basic_libbasic_la_SOURCES  += src/basic/xml_info.cc
src_basic_libbasic_la_SOURCES  += src/basic/xml_info.hh



src_basic_client_libbasicclient_la_CPPFLAGS  = -I$(srcdir)/src
src_basic_client_libbasicclient_la_SOURCES   = src/basic_client/basic_xgdaemon_client.cc
src_basic_client_libbasicclient_la_SOURCES  += src/basic_client/basic_xgdaemon_client.hh



src_cgi_libcgi_la_CPPFLAGS     = -I$(srcdir)/src
src_cgi_libcgi_la_SOURCES	 = src/cgi/cgi_util.cc
src_cgi_libcgi_la_SOURCES	+= src/cgi/cgi_util.hh



src_common_libxgcommon_la_CPPFLAGS	 = -I$(srcdir)/src
src_common_libxgcommon_la_SOURCES	 = src/common/common_session_status_info.cc
src_common_libxgcommon_la_SOURCES	+= src/common/common_session_status_info.hh
src_common_libxgcommon_la_SOURCES	+= src/common/context_info.cc
src_common_libxgcommon_la_SOURCES	+= src/common/context_info.hh
src_common_libxgcommon_la_SOURCES	+= src/common/current_task_info.cc
src_common_libxgcommon_la_SOURCES	+= src/common/current_task_info.hh
src_common_libxgcommon_la_SOURCES	+= src/common/error_info.cc
src_common_libxgcommon_la_SOURCES	+= src/common/error_info.hh
src_common_libxgcommon_la_SOURCES	+= src/common/exec_status_info.cc
src_common_libxgcommon_la_SOURCES	+= src/common/exec_status_info.hh
src_common_libxgcommon_la_SOURCES	+= src/common/executions_status_info.cc
src_common_libxgcommon_la_SOURCES	+= src/common/executions_status_info.hh
src_common_libxgcommon_la_SOURCES	+= src/common/mod_info.cc
src_common_libxgcommon_la_SOURCES	+= src/common/mod_info.hh
src_common_libxgcommon_la_SOURCES	+= src/common/net_data_info.cc
src_common_libxgcommon_la_SOURCES	+= src/common/net_data_info.hh
src_common_libxgcommon_la_SOURCES	+= src/common/nstat_info.cc
src_common_libxgcommon_la_SOURCES	+= src/common/nstat_info.hh
src_common_libxgcommon_la_SOURCES	+= src/common/opcmd_info.cc
src_common_libxgcommon_la_SOURCES	+= src/common/opcmd_info.hh
src_common_libxgcommon_la_SOURCES	+= src/common/session_id.cc
src_common_libxgcommon_la_SOURCES	+= src/common/session_id.hh
src_common_libxgcommon_la_SOURCES	+= src/common/stat_info.cc
src_common_libxgcommon_la_SOURCES	+= src/common/stat_info.hh
src_common_libxgcommon_la_SOURCES	+= src/common/sub_info.cc
src_common_libxgcommon_la_SOURCES	+= src/common/sub_info.hh
src_common_libxgcommon_la_SOURCES	+= src/common/system_info.cc
src_common_libxgcommon_la_SOURCES	+= src/common/system_info.hh
src_common_libxgcommon_la_SOURCES	+= src/common/time_info.cc
src_common_libxgcommon_la_SOURCES	+= src/common/time_info.hh
src_common_libxgcommon_la_SOURCES	+= src/common/xgdaemon_common_xml.cc
src_common_libxgcommon_la_SOURCES	+= src/common/xgdaemon_common_xml.hh



src_common_data_libxgdata_la_CPPFLAGS	 = -I$(srcdir)/src
src_common_data_libxgdata_la_SOURCES	 = src/common/data/data_matrix.cc
src_common_data_libxgdata_la_SOURCES	+= src/common/data/data_matrix.hh
src_common_data_libxgdata_la_SOURCES	+= src/common/data/static_route_4u_data.cc
src_common_data_libxgdata_la_SOURCES	+= src/common/data/static_route_4u_data.hh



src_common_textparse_libxgtextparse_la_CPPFLAGS	 = -I$(srcdir)/src
src_common_textparse_libxgtextparse_la_SOURCES	 = src/common/textparse/text_parse_util.cc
src_common_textparse_libxgtextparse_la_SOURCES	+= src/common/textparse/text_parse_util.hh



src_xgcgi_libxgcgi_la_CPPFLAGS	 = -I$(srcdir)/src
src_xgcgi_libxgcgi_la_SOURCES	 = src/xgcgi/client_current_task_info.cc
src_xgcgi_libxgcgi_la_SOURCES	+= src/xgcgi/client_current_task_info.hh
src_xgcgi_libxgcgi_la_SOURCES	+= src/xgcgi/client_exec_status_info.cc
src_xgcgi_libxgcgi_la_SOURCES	+= src/xgcgi/client_exec_status_info.hh
src_xgcgi_libxgcgi_la_SOURCES	+= src/xgcgi/client_executions_status_info.cc
src_xgcgi_libxgcgi_la_SOURCES	+= src/xgcgi/client_executions_status_info.hh
src_xgcgi_libxgcgi_la_SOURCES	+= src/xgcgi/client_mod_info.cc
src_xgcgi_libxgcgi_la_SOURCES	+= src/xgcgi/client_mod_info.hh
src_xgcgi_libxgcgi_la_SOURCES	+= src/xgcgi/client_opcmd_info.cc
src_xgcgi_libxgcgi_la_SOURCES	+= src/xgcgi/client_opcmd_info.hh
src_xgcgi_libxgcgi_la_SOURCES	+= src/xgcgi/client_session_info.cc
src_xgcgi_libxgcgi_la_SOURCES	+= src/xgcgi/client_session_info.hh
src_xgcgi_libxgcgi_la_SOURCES	+= src/xgcgi/client_session_status_info.cc
src_xgcgi_libxgcgi_la_SOURCES	+= src/xgcgi/client_session_status_info.hh
src_xgcgi_libxgcgi_la_SOURCES	+= src/xgcgi/client_system_info.cc
src_xgcgi_libxgcgi_la_SOURCES	+= src/xgcgi/client_system_info.hh
src_xgcgi_libxgcgi_la_SOURCES	+= src/xgcgi/client_time_info.cc
src_xgcgi_libxgcgi_la_SOURCES	+= src/xgcgi/client_time_info.hh
src_xgcgi_libxgcgi_la_SOURCES	+= src/xgcgi/html_util.hh
src_xgcgi_libxgcgi_la_SOURCES	+= src/xgcgi/xgdaemon_client.cc
src_xgcgi_libxgcgi_la_SOURCES	+= src/xgcgi/xgdaemon_client.hh



src_xgcgi_xgcgi_test_CPPFLAGS	         = -I$(srcdir)/src
src_xgcgi_xgcgi_test_LDADD             = src/basic/libbasic.la
src_xgcgi_xgcgi_test_LDADD		+= src/basic_client/libbasicclient.la
src_xgcgi_xgcgi_test_LDADD		+= src/cgi/libcgi.la
src_xgcgi_xgcgi_test_LDADD		+= src/common/libxgcommon.la
src_xgcgi_xgcgi_test_LDADD		+= src/xgcgi/libxgcgi.la
src_xgcgi_xgcgi_test_LDADD		+= librlxorp.la
src_xgcgi_xgcgi_test_LDADD		+= -luuid
src_xgcgi_xgcgi_test_LDADD		+= -lexpat
src_xgcgi_xgcgi_test_SOURCES	         = src/xgcgi/test_client.cc
src_xgcgi_xgcgi_test_SOURCES	        += src/xgcgi/test_client.hh
src_xgcgi_xgcgi_test_SOURCES	        += src/common/misc_util.cc
src_xgcgi_xgcgi_test_SOURCES	        += src/common/misc_util.hh



src_xgcgi_xgcgi_CPPFLAGS		 = -I$(srcdir)/src
src_xgcgi_xgcgi_LDADD                  = src/basic/libbasic.la
src_xgcgi_xgcgi_LDADD                 += src/basic_client/libbasicclient.la
src_xgcgi_xgcgi_LDADD	                += src/cgi/libcgi.la
src_xgcgi_xgcgi_LDADD	                += src/xgcgi/libxgcgi.la
src_xgcgi_xgcgi_LDADD	                += src/common/libxgcommon.la
src_xgcgi_xgcgi_LDADD	                += librlxorp.la
src_xgcgi_xgcgi_LDADD	                += -luuid
src_xgcgi_xgcgi_LDADD	                += -lexpat
src_xgcgi_xgcgi_SOURCES		 = src/xgcgi/xgcgi.cc
src_xgcgi_xgcgi_SOURCES		+= src/xgcgi/xgcgi.hh



src_xgcgi2_xgcgi2_CPPFLAGS		 = -I$(srcdir)/src
src_xgcgi2_xgcgi2_LDADD                = src/basic/libbasic.la
src_xgcgi2_xgcgi2_LDADD               += src/basic_client/libbasicclient.la
src_xgcgi2_xgcgi2_LDADD		+= src/cgi/libcgi.la
src_xgcgi2_xgcgi2_LDADD		+= librlxorp.la
src_xgcgi2_xgcgi2_LDADD		+= -luuid
src_xgcgi2_xgcgi2_LDADD		+= -lexpat
src_xgcgi2_xgcgi2_SOURCES		 = src/xgcgi2/xgcgi2.cc
src_xgcgi2_xgcgi2_SOURCES		+= src/xgcgi2/xgcgi2.hh
src_xgcgi2_xgcgi2_SOURCES		+= src/xgcgi2/cgi_log.cc
src_xgcgi2_xgcgi2_SOURCES		+= src/xgcgi2/cgi_log.hh



src_xgdaemon_xgdaemon_CPPFLAGS 	 = -I$(srcdir)/src
src_xgdaemon_xgdaemon_LDADD	         = src/basic/libbasic.la
src_xgdaemon_xgdaemon_LDADD	        += src/common/libxgcommon.la
src_xgdaemon_xgdaemon_LDADD           += src/common/data/libxgdata.la
src_xgdaemon_xgdaemon_LDADD           += src/common/textparse/libxgtextparse.la
##
## FIXME! We shouldn't link objects like this but these aren't yet
##	  coalesed in a shared library
##
src_xgdaemon_xgdaemon_LDADD	+= rtrmgr/command_tree.o
src_xgdaemon_xgdaemon_LDADD	+= rtrmgr/config_operators.o
src_xgdaemon_xgdaemon_LDADD	+= rtrmgr/conf_tree.o
src_xgdaemon_xgdaemon_LDADD	+= rtrmgr/conf_tree_node.o
src_xgdaemon_xgdaemon_LDADD	+= rtrmgr/generic_module_manager.o
src_xgdaemon_xgdaemon_LDADD	+= rtrmgr/op_commands.o
src_xgdaemon_xgdaemon_LDADD	+= rtrmgr/randomness.o
src_xgdaemon_xgdaemon_LDADD	+= rtrmgr/slave_conf_tree.o
src_xgdaemon_xgdaemon_LDADD	+= rtrmgr/slave_conf_tree_node.o
src_xgdaemon_xgdaemon_LDADD	+= rtrmgr/slave_module_manager.o
src_xgdaemon_xgdaemon_LDADD	+= rtrmgr/template_base_command.o
src_xgdaemon_xgdaemon_LDADD	+= rtrmgr/template_tree.o
src_xgdaemon_xgdaemon_LDADD	+= rtrmgr/template_tree_node.o
src_xgdaemon_xgdaemon_LDADD	+= rtrmgr/xorp_client.o
src_xgdaemon_xgdaemon_LDADD	+= rtrmgr/util.o
src_xgdaemon_xgdaemon_LDADD	+= rtrmgr/boot_parser.o
src_xgdaemon_xgdaemon_LDADD	+= rtrmgr/opcmd_parser.o
src_xgdaemon_xgdaemon_LDADD	+= rtrmgr/tplt_parser.o
src_xgdaemon_xgdaemon_LDADD	+= rtrmgr/boot_scanner.o
src_xgdaemon_xgdaemon_LDADD	+= rtrmgr/opcmd_scanner.o
src_xgdaemon_xgdaemon_LDADD	+= rtrmgr/tplt_scanner.o
src_xgdaemon_xgdaemon_LDADD	+= librlxorp.la
src_xgdaemon_xgdaemon_LDADD	+= -luuid
src_xgdaemon_xgdaemon_LDADD	+= -lpam
src_xgdaemon_xgdaemon_LDADD	+= -lpam_misc
src_xgdaemon_xgdaemon_LDADD	+= -lexpat
src_xgdaemon_xgdaemon_LDADD	+= -lcrypt
src_xgdaemon_xgdaemon_SOURCES	 = src/xgdaemon/xgdaemon.cc
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xgdaemon.hh
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xgdaemon_current_task_info.cc
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xgdaemon_current_task_info.hh
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/generic_xorp_link.cc
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/generic_xorp_link.hh
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/inter_session_info.cc
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/inter_session_info.hh
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xgdaemon_misc_util.cc
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xgdaemon_misc_util.hh
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/server_net_data_info.cc
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/server_net_data_info.hh
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/server_session_info.cc
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/server_session_info.hh
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/server_session_status_info.cc
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/server_session_status_info.hh
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/server_stat_info.cc
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/server_stat_info.hh
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/server_system_info.cc
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/server_system_info.hh
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/server_time_info.cc
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/server_time_info.hh
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xgdaemon_pam_util.cc
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xgdaemon_pam_util.hh
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xgdaemon_proc_util.cc
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xgdaemon_proc_util.hh
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xgdaemon_server.cc
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xgdaemon_server.hh
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xgdaemon_server_socket.cc
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xgdaemon_server_socket.hh
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xgdaemon_xorp_link.cc
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xgdaemon_xorp_link.hh
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xgdaemon_xorp_util.cc
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xgdaemon_xorp_util.hh
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xorp_dir_info.cc
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xorp_dir_info.hh
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xorp_mod_info.cc
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xorp_mod_info.hh
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xorp_opcmd_info.cc
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xorp_opcmd_info.hh
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xrl_xgdaemon_interface.cc
src_xgdaemon_xgdaemon_SOURCES	+= src/xgdaemon/xrl_xgdaemon_interface.hh



css_DATA	+= src/html/css/main.css

images_DATA	+= src/html/images/body_bg.gif
images_DATA	+= src/html/images/bottom_border.gif
images_DATA	+= src/html/images/bt_add.gif
images_DATA	+= src/html/images/bt_apply_active.gif
images_DATA	+= src/html/images/bt_apply.gif
images_DATA	+= src/html/images/bt_calculate.gif
images_DATA	+= src/html/images/bt_clear_all.gif
images_DATA	+= src/html/images/bt_commit_active.gif
images_DATA	+= src/html/images/bt_commit_error.gif
images_DATA	+= src/html/images/bt_commit_inactive.gif
images_DATA	+= src/html/images/bt_confirm_commit.gif
images_DATA	+= src/html/images/bt_delete.gif
images_DATA	+= src/html/images/bt_delete2_blank.gif
images_DATA	+= src/html/images/bt_delete2.gif
images_DATA	+= src/html/images/bt_execute.gif
images_DATA	+= src/html/images/bt_go.gif
images_DATA	+= src/html/images/bt_help.gif
images_DATA	+= src/html/images/bt_list_networks.gif
images_DATA	+= src/html/images/bt_load_active.gif
images_DATA	+= src/html/images/bt_load.gif
images_DATA	+= src/html/images/bt_load_inactive.gif
images_DATA	+= src/html/images/bt_login.gif
images_DATA	+= src/html/images/bt_logout_active.gif
images_DATA	+= src/html/images/bt_logout_inactive.gif
images_DATA	+= src/html/images/bt_ok.gif
images_DATA	+= src/html/images/bt_remove.gif
images_DATA	+= src/html/images/bt_rename.gif
images_DATA	+= src/html/images/bt_revert_active.gif
images_DATA	+= src/html/images/bt_revert_inactive.gif
images_DATA	+= src/html/images/bt_save_active.gif
images_DATA	+= src/html/images/bt_save.gif
images_DATA	+= src/html/images/bt_save_inactive.gif
images_DATA	+= src/html/images/bt_show.gif
images_DATA	+= src/html/images/bt_support.gif
images_DATA	+= src/html/images/close_button.gif
images_DATA	+= src/html/images/container_bg.gif
images_DATA	+= src/html/images/container_bg_operations.gif
images_DATA	+= src/html/images/container_bg3.gif
images_DATA	+= src/html/images/content_cap_l.gif
images_DATA	+= src/html/images/content_cap_m.gif
images_DATA	+= src/html/images/content_cap_r.gif
images_DATA	+= src/html/images/content_frame_top-02.gif
images_DATA	+= src/html/images/content_frame_top-03.gif
images_DATA	+= src/html/images/content_frame_top.gif
images_DATA	+= src/html/images/content_gutter.gif
images_DATA	+= src/html/images/content_left_bg.gif
images_DATA	+= src/html/images/content_left_border.gif
images_DATA	+= src/html/images/content_right_side_bg.gif
images_DATA	+= src/html/images/leftnav_bg.gif
images_DATA	+= src/html/images/leftnav_support_bg.gif
images_DATA	+= src/html/images/logo_footer.gif
images_DATA	+= src/html/images/logo.gif
images_DATA	+= src/html/images/logo_no_bt.gif
images_DATA	+= src/html/images/maac.gif
images_DATA	+= src/html/images/mab.gif
images_DATA	+= src/html/images/mad.gif
images_DATA	+= src/html/images/main_bg.gif
images_DATA	+= src/html/images/nav_container_bg_expanded.gif
images_DATA	+= src/html/images/nav_container_bg.gif
images_DATA	+= src/html/images/nav_level_3_bg_selected.gif
images_DATA	+= src/html/images/nav_sub1_bg_expanded.gif
images_DATA	+= src/html/images/nav_sub1_bg_expanded_no_child.gif
images_DATA	+= src/html/images/nav_sub1_bg_expanded_selected.gif
images_DATA	+= src/html/images/nav_sub1_bg.gif
images_DATA	+= src/html/images/nav_sub1_bg_no_child.gif
images_DATA	+= src/html/images/nav_sub1_bg_no_child_selected.gif
images_DATA	+= src/html/images/nav_sub1_bg_selected.gif
images_DATA	+= src/html/images/nav_sub2_bg.gif
images_DATA	+= src/html/images/nav_top_bg_expanded.gif
images_DATA	+= src/html/images/nav_top_bg.gif
images_DATA	+= src/html/images/popup_header_bg.gif
images_DATA	+= src/html/images/popup_header.gif
images_DATA	+= src/html/images/spacer.gif
images_DATA	+= src/html/images/status_bar_1.gif
images_DATA	+= src/html/images/status_bar_2.gif
images_DATA	+= src/html/images/status_bar_3.gif
images_DATA	+= src/html/images/status_bar_4.gif
images_DATA	+= src/html/images/status_bar_5.gif
images_DATA	+= src/html/images/status_bar_6.gif
images_DATA	+= src/html/images/sub_hdr_bg.gif
images_DATA	+= src/html/images/sub_hdr_corner_left.gif
images_DATA	+= src/html/images/sub_hdr_corner_right.gif
images_DATA	+= src/html/images/sudHdr_corner_left.gif
images_DATA	+= src/html/images/sudHdr_corner_right.gif
images_DATA	+= src/html/images/tab_collapsed.gif
images_DATA	+= src/html/images/tab.gif
images_DATA	+= src/html/images/tab_status_expanded.gif
images_DATA	+= src/html/images/tab_status.gif
images_DATA	+= src/html/images/tab_tools_expanded.gif
images_DATA	+= src/html/images/tab_tools.gif
images_DATA	+= src/html/images/tac.gif
images_DATA	+= src/html/images/tao.gif
images_DATA	+= src/html/images/topnav_1.gif
images_DATA	+= src/html/images/top_nav_bg.gif
images_DATA	+= src/html/images/topnav_bg.gif
images_DATA	+= src/html/images/topnav_right.jpg

js_DATA		+= src/html/js/app.js
js_DATA		+= src/html/js/brwsniff.js
js_DATA		+= src/html/js/mods.js
js_DATA		+= src/html/js/server.js
js_DATA		+= src/html/js/ui.js
js_DATA		+= src/html/js/xgutil.js
js_DATA		+= src/html/js/xml.js

pages_DATA	+= src/html/debug.html
pages_DATA	+= src/html/index.html
pages_DATA	+= src/html/ipcalc.html
pages_DATA	+= src/html/template.html
pages_DATA	+= src/html/version.cgi

sysconf_DATA	+= src/xgcgi2/xgcgi2.conf

