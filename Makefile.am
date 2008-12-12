wwwdir = /var/www
cgidir = /usr/lib/cgi-bin
initddir = etc/init.d

AM_CPPFLAGS = -I src/server -Wall -DDEBUG -g

CLEANFILES = src/server/main.o src/server/manager.o src/server/session.o src/server/processor.o src/server/sessionexchange.o src/server/sessionexchangefile.o src/server/sessionexchangesocket.o src/server/sessionexchangestdio.o src/server/test.o src/server/authenticate.o src/server/common.o src/server/command.o src/server/configuration.o src/server/rl_str_proc.o src/server/multirespcmd.o

src_server_webgui_chunker_SOURCES = src/server/webgui_chunker.cc
src_server_webgui_chunker_SOURCES += src/server/common.cc

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

src_server_webgui_LDADD = -lexpat
src_server_webgui_LDADD += -lpam

cgi_PROGRAMS = src/server/webgui
sbin_PROGRAMS = src/server/webgui_chunker
sbin_PROGRAMS += src/server/test
cgi_SCRIPTS = src/server/webgui-wrap

cpiop = find  . ! -regex '\(.*~\|.*\.bak\|.*\.swp\|.*\#.*\#\)' -print0 | \
				cpio -0pd

# XXX get Ext here for now
install-exec-hook:
	mkdir -p $(DESTDIR)/$(cgidir)/$(initddir)/
	cp scripts/vyatta-webgui-chunker.init $(DESTDIR)/$(cgidir)/$(initddir)/vyatta-webgui-chunker
	mkdir -p $(DESTDIR)/$(cgidir)/
	cp scripts/webgui.conf $(DESTDIR)/$(cgidir)/
	@mkdir -p $(DESTDIR)/var/www
	@for v in 2.1 2.2; do \
		rm -f /tmp/ext-$$v.zip; \
		wget -q -O /tmp/ext-$$v.zip \
			http://packages.vyatta.com/vyatta-dev/tmp/ext-$$v.zip; \
		( \
			cd $(DESTDIR)/var/www; \
			unzip -qq /tmp/ext-$$v.zip; \
			cd ext-$$v; \
			rm -rf air build docs examples ext-all-debug.js \
				ext-core-debug.js source; \
		); \
		rm -f /tmp/ext-$$v.zip; \
	done
	@cd src/client ; $(cpiop) $(DESTDIR)$(wwwdir)

