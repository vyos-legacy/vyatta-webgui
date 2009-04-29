tmpdir = /usr/lib/cgi-bin/tmp/webgui
chunkerinitdir = /usr/lib/cgi-bin/etc/init.d
chunkerpiddir = /usr/lib/cgi-bin/var/run
wwwdir = /var/www
cgidir = /usr/lib/cgi-bin
initddir = /etc/init.d
cfgdir = $(datadir)/vyatta-cfg/templates
opdir = $(datadir)/vyatta-op/templates
procdir = $(datadir)/vyatta-proc/templates

AM_CPPFLAGS = -I src/server -I src/lib -Wall -DDEBUG -g \
              -I /usr/include/glib-2.0 -I /usr/lib/glib-2.0/include

CLEANFILES = src/server/main.o src/server/manager.o src/server/session.o src/server/processor.o src/server/sessionexchange.o src/server/sessionexchangefile.o src/server/sessionexchangesocket.o src/server/sessionexchangestdio.o src/server/test.o src/server/authenticate.o src/server/common.o src/server/command.o src/server/configuration.o src/server/rl_str_proc.o src/server/multirespcmd.o src/server/guicmdhandler.o

src_server_chunker_SOURCES = src/server/chunker_main.cc
src_server_chunker_SOURCES += src/server/chunker_manager.cc
src_server_chunker_SOURCES += src/server/chunker_processor.cc
src_server_chunker_SOURCES += src/server/common.cc

src_server_chunker_test_SOURCES = src/server/chunker_test.cc
src_server_chunker_test_SOURCES += src/server/common.cc

src_server_test_SOURCES = src/server/test.cc

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
src_server_webgui_LDADD += /usr/lib/libglib-2.0.la
src_server_webgui_LDADD += src/lib/libclibe.a

cgi_PROGRAMS = src/server/webgui
cgi_PROGRAMS += src/server/chunker
cgi_PROGRAMS += src/server/test
cgi_PROGRAMS += src/server/chunker_test

cgi_SCRIPTS = src/server/webgui-wrap
cgi_SCRIPTS += scripts/site-to-site-easy.pl

sbin_SCRIPTS = scripts/enterprise-mib.pl

# library
AM_CFLAGS = -I src/lib -Wall -I /usr/include/glib-2.0 \
            -I /usr/lib/glib-2.0/include
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
	mkdir -p $(DESTDIR)$(chunkerinitdir)/
	mkdir -p $(DESTDIR)$(chunkerpiddir)/
	mkdir -p $(DESTDIR)$(tmpdir)/
	touch $(DESTDIR)$(tmpdir)/dummy
	mkdir -p $(DESTDIR)/$(initddir)
	cp scripts/vyatta-webgui-chunker.init $(DESTDIR)/$(initddir)/vyatta-webgui-chunker
	cp scripts/chunker_cmd $(DESTDIR)/$(cgidir)/chunker_cmd
	cp scripts/show $(DESTDIR)/$(cgidir)/show
	cp scripts/mandatory $(DESTDIR)/$(cgidir)/mandatory
	mkdir -p $(DESTDIR)/$(cgidir)/
	cp scripts/webgui.conf $(DESTDIR)/$(cgidir)/
	cp scripts/notify-backup-conf $(DESTDIR)/$(cgidir)/
	cp scripts/notify-backup-data $(DESTDIR)/$(cgidir)/
	cp scripts/notify-restore-conf $(DESTDIR)/$(cgidir)/
	cp scripts/notify-restore-data $(DESTDIR)/$(cgidir)/
	cp scripts/vyatta-proc $(DESTDIR)/$(cgidir)/


	mkdir -p $(DESTDIR)/etc/lighttpd/conf-enabled/.
	cp scripts/15-cfg.conf $(DESTDIR)/etc/lighttpd/conf-enabled/.

	@mkdir -p $(DESTDIR)$(wwwdir)/utm
	@for v in 2.2; do \
		rm -f /tmp/ext-$$v.zip; \
		wget -q -O /tmp/ext-$$v.zip \
			http://packages.vyatta.com/vyatta-dev/tmp/ext-$$v.zip; \
		( \
			cd $(DESTDIR)$(wwwdir)/utm; \
			unzip -qq /tmp/ext-$$v.zip; \
			cd ext-$$v; \
			rm -rf air build docs examples ext-all-debug.js \
				ext-core-debug.js source; \
		); \
		rm -f /tmp/ext-$$v.zip; \
	done

	mkdir -p $(DESTDIR)$(wwwdir)/notification/archive/backup/conf
	mkdir -p $(DESTDIR)$(wwwdir)/notification/archive/backup/data
	mkdir -p $(DESTDIR)$(wwwdir)/notification/archive/restore/conf
	mkdir -p $(DESTDIR)$(wwwdir)/notification/archive/restore/data
	
	mkdir -p $(DESTDIR)$(wwwdir)/archive/backup
	mkdir -p $(DESTDIR)$(wwwdir)/archive/restore
	
	cp -r webroot/. $(DESTDIR)$(wwwdir)
	@cd src/client ; $(cpiop) $(DESTDIR)$(wwwdir)
	@mkdir -p $(DESTDIR)$(cfgdir); \
	cd templates-cfg; $(cpiop) $(DESTDIR)$(cfgdir)
	@mkdir -p $(DESTDIR)$(opdir); \
	cd templates-op; $(cpiop) $(DESTDIR)$(opdir)
	@mkdir -p $(DESTDIR)$(procdir); \
	cd templates-proc; $(cpiop) $(DESTDIR)$(procdir)

