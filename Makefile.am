wwwdir = /var/www
cgidir = /usr/lib/cgi-bin

AM_CPPFLAGS = -I src/server -Wall -DDEBUG -g

CLEANFILES = src/server/main.o src/server/manager.o src/server/session.o src/server/processor.o src/server/sessionexchange.o src/server/sessionexchangefile.o src/server/sessionexchangesocket.o src/server/sessionexchangestdio.o src/server/test.o src/server/authenticate.o src/server/common.o src/server/command.o src/server/configuration.o src/server/rl_str_proc.o

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

src_server_webgui_LDADD = -lexpat
src_server_webgui_LDADD += -lpam

www_DATA = src/client/index.html
www_DATA += src/client/vyatta.js

cgi_PROGRAMS = src/server/webgui
cgi_SCRIPTS = src/server/webgui-wrap
sbin_PROGRAMS = src/server/test

# XXX get Ext here for now
install-exec-hook:
	mkdir -p $(DESTDIR)/var/www
	rm -f /tmp/ext-2.1.zip
	wget -q -O /tmp/ext-2.1.zip \
			http://packages.vyatta.com/vyatta-dev/tmp/ext-2.1.zip
	cd $(DESTDIR)/var/www \
	&& unzip -qq /tmp/ext-2.1.zip
	cd $(DESTDIR)/var/www/ext-2.1 \
	&& rm -rf air build docs examples ext-all-debug.js ext-core-debug.js source
	rm -f /tmp/ext-2.1.zip

