cfgdir = $(datadir)/vyatta-cfg/templates

initddir	 = /etc/init.d
etcdir           = /etc

AM_CPPFLAGS = -I src/server -Wall -DDEBUG -g

CLEANFILES = src/main.o src/manager.o src/session.o src/processor.o src/sessionexchange.o src/sessionexchangefile.o src/sessionexchangesocket.o sessionexchangestdio.o test.o

sbin_SCRIPTS = scripts/vyatta-webgui.init

src_test_SOURCES = src/server/test.cc

src_webgui_SOURCES = src/server/main.cc
src_webgui_SOURCES += src/server/manager.cc
src_webgui_SOURCES += src/server/session.cc
src_webgui_SOURCES += src/server/sessionexchange.cc
src_webgui_SOURCES += src/server/sessionexchangefile.cc
src_webgui_SOURCES += src/server/sessionexchangesocket.cc
src_webgui_SOURCES += src/server/sessionexchangestdio.cc
src_webgui_SOURCES += src/server/processor.cc

sbin_PROGRAMS = src/server/webgui
sbin_PROGRAMS += src/server/test

cpiop = find  . ! -regex '\(.*~\|.*\.bak\|.*\.swp\|.*\#.*\#\)' -print0 | \
	cpio -0pd

install-exec-hook:
	mkdir -p $(DESTDIR)$(cfgdir)
	cd templates; $(cpiop) $(DESTDIR)$(cfgdir)
	find etc ! -regex '\(.*~\|.*\.bak\|.*\.swp\|.*\#.*\#\)' -print0 |  cpio -0pd $(DESTDIR)