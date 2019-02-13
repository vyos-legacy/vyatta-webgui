tmpdir = $(prefix)/tmp/webgui
chunkerpiddir = $(prefix)/var/run
wwwdir = /var/www/html
cgidir = /usr/lib/cgi-bin
initddir = /etc/init.d
cfgdir = $(datadir)/vyatta-cfg/templates
cfgrootdir = $(datadir)/vyatta-cfg
opdir = $(datadir)/vyatta-op/templates
appperldir = $(datadir)/perl5/App
ssbindir = /usr/sbin
glib20lib = `pkg-config --cflags glib-2.0`
glib20libfl = `pkg-config --libs glib-2.0`

AM_CPPFLAGS = -I src/server -I src/lib -Wall -DDEBUG -g $(glib20lib)
CLEANFILES = src/server/main.o src/server/manager.o src/server/session.o src/server/processor.o src/server/sessionexchange.o src/server/sessionexchangefile.o src/server/sessionexchangesocket.o src/server/sessionexchangestdio.o src/server/test.o src/server/authenticate.o src/server/common.o src/server/command.o src/server/configuration.o src/server/rl_str_proc.o src/server/multirespcmd.o src/server/guicmdhandler.o
BUILT_SOURCES =  src/lib/cli_parse.h src/lib/cli_def.c src/lib/cli_val.c

src_server_chunker_SOURCES = src/server/chunker_main.cc
src_server_chunker_SOURCES += src/server/chunker_manager.cc
src_server_chunker_SOURCES += src/server/chunker_processor.cc
src_server_chunker_SOURCES += src/server/common.cc

#src_server_chunker_test_SOURCES = src/server/chunker_test.cc
#src_server_chunker_test_SOURCES += src/server/common.cc

#src_server_test_SOURCES = src/server/test.cc

src_server_webgui_SOURCES = src/server/main.cc
src_server_webgui_SOURCES += src/server/common.cc
src_server_webgui_SOURCES += src/server/manager.cc
src_server_webgui_SOURCES += src/server/session.cc
src_server_webgui_SOURCES += src/server/sessionexchange.cc
src_server_webgui_SOURCES += src/server/sessionexchangefile.cc
src_server_webgui_SOURCES += src/server/sessionexchangesocket.cc
src_server_webgui_SOURCES += src/server/sessionexchangestdio.cc
src_server_webgui_SOURCES += src/server/processor.cc
src_server_webgui_SOURCES += src/server/authenticate.cc
src_server_webgui_SOURCES += src/server/command.cc
src_server_webgui_SOURCES += src/server/configuration.cc
src_server_webgui_SOURCES += src/server/rl_str_proc.cc
src_server_webgui_SOURCES += src/server/multirespcmd.cc
src_server_webgui_SOURCES += src/server/guicmdhandler.cc

src_server_webgui_LDADD = -lexpat
src_server_webgui_LDADD += -lpam
src_server_webgui_LDADD += src/lib/libclibe.a

src_server_webgui_LDFLAGS = $(glib20libfl)

cgi_PROGRAMS = src/server/webgui
cgi_SCRIPTS = src/server/webgui-wrap

ssbin_PROGRAMS = src/server/chunker

ssbin_SCRIPTS = scripts/chunker_cmd

sbin_SCRIPTS = scripts/vyatta-update-webgui-listen-addr.pl

initd_SCRIPTS = scripts/vyatta-webgui-chunker

# library
AM_CFLAGS = -I src/lib -Wall -I /usr/include/glib-2.0 $(glib20lib)
AM_YFLAGS = -d --name-prefix=yy_`basename $* .y`_
AM_LFLAGS = --prefix=yy_`basename $* .l`_ -olex.yy.c
noinst_LIBRARIES = src/lib/libclibe.a
src_lib_libclibe_a_SOURCES = src/lib/cli_parse.y src/lib/cli_def.l \
                             src/lib/cli_val.l src/lib/cli_new.c \
                             src/lib/cli_path_utils.c src/lib/common/common.c \
                             src/lib/common/unionfs.c \
                             src/lib/cli_val_engine.c src/lib/cli_objects.c

cpiop = find  . ! -regex '\(.*~\|.*\.bak\|.*\.swp\|.*\#.*\#\)' -print0 | \
				cpio -0pd

# XXX get Ext here for now
install-exec-hook:
	mkdir -p $(DESTDIR)$(chunkerpiddir)/
	mkdir -p $(DESTDIR)$(tmpdir)/
	touch $(DESTDIR)$(tmpdir)/dummy
	
	mkdir -p $(DESTDIR)/$(cgidir)/
	
	@mkdir -p $(DESTDIR)/var/www

	@cd src/client ; $(cpiop) $(DESTDIR)$(wwwdir)
	@mkdir -p $(DESTDIR)$(cfgdir); \
	cd templates-cfg; $(cpiop) $(DESTDIR)$(cfgdir)
	@mkdir -p $(DESTDIR)$(opdir); \
	cd templates-op; $(cpiop) $(DESTDIR)$(opdir)

