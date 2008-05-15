cfgdir = $(datadir)/vyatta-cfg/templates

initddir	 = /etc/init.d
etcdir           = /etc

AM_CPPFLAGS = -I src/server -Wall -DDEBUG -g

CLEANFILES = src/server/main.o src/server/manager.o src/server/session.o src/server/processor.o src/server/sessionexchange.o src/server/sessionexchangefile.o src/server/sessionexchangesocket.o src/server/sessionexchangestdio.o src/server/test.o src/server/authenticate.o src/server/common.o src/server/command.o src/server/configuration.o

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

src_server_webgui_LDADD = -lexpat
src_server_webgui_LDADD += -lpam


sbin_PROGRAMS = src/server/webgui
sbin_PROGRAMS += src/server/test

cpiop = find  . ! -regex '\(.*~\|.*\.bak\|.*\.swp\|.*\#.*\#\)' -print0 | \
	cpio -0pd

install-exec-hook:
	mkdir -p $(DESTDIR)$(cfgdir)
	cd templates; $(cpiop) $(DESTDIR)$(cfgdir)
	find etc ! -regex '\(.*~\|.*\.bak\|.*\.swp\|.*\#.*\#\)' -print0 |  cpio -0pd $(DESTDIR)