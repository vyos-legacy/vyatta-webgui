statedir = $(localstatedir)/run
wwwdir = /var/www
cgidir = /usr/lib/cgi-bin
initddir = /etc/init.d
opdir = $(datadir)/vyatta-op/templates
cfgdir = $(datadir)/vyatta-cfg/templates
oaperldir = $(datadir)/perl5/OpenApp

AM_CPPFLAGS = -I src/server -Wall -DDEBUG -g

CLEANFILES = src/server/main.o src/server/manager.o src/server/session.o src/server/processor.o src/server/sessionexchange.o src/server/sessionexchangefile.o src/server/sessionexchangesocket.o src/server/sessionexchangestdio.o src/server/test.o src/server/authenticate.o src/server/common.o src/server/command.o src/server/configuration.o src/server/rl_str_proc.o

src_server_chunker_SOURCES = src/server/chunker_main.cc
src_server_chunker_SOURCES += src/server/chunker_manager.cc
src_server_chunker_SOURCES += src/server/chunker_processor.cc
src_server_chunker_SOURCES += src/server/common.cc

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
cgi_PROGRAMS += src/server/chunker

cgi_SCRIPTS = src/server/webgui-oa
cgi_SCRIPTS += scripts/chunker_cmd

sbin_PROGRAMS = src/server/test

sbin_SCRIPTS = src/server/vyatta-vmstatus.pl
sbin_SCRIPTS += src/server/vyatta-vmop.pl
sbin_SCRIPTS += src/server/vyatta-vmuser.pl
sbin_SCRIPTS += src/server/vyatta-vmbackup.pl
sbin_SCRIPTS += src/server/vyatta-vmdeploy
sbin_SCRIPTS += src/server/vyatta-vmdeploy-op
sbin_SCRIPTS += src/server/vyatta-vmbackup-all
sbin_SCRIPTS += src/server/openapp-user.pl
sbin_SCRIPTS += src/server/openapp-vm-query.pl

oaperl_DATA = src/server/lib/perl5/OpenApp/VMMgmt.pm

initd_SCRIPTS = scripts/vyatta-webgui-chunker

cpiop = find  . ! -regex '\(.*~\|.*\.bak\|.*\.swp\|.*\#.*\#\)' -print0 | \
	cpio -0pd

# XXX get Ext here for now
install-exec-hook:
	@mkdir -p $(DESTDIR)/var/www
	@for v in 2.2; do \
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
	@mkdir -p $(DESTDIR)$(statedir)/vmstatus
	@cd src/client ; $(cpiop) $(DESTDIR)$(wwwdir)
	@mkdir -p $(DESTDIR)$(opdir)
	@cd src/server/templates; $(cpiop) $(DESTDIR)$(opdir)
	@mkdir -p $(DESTDIR)$(cfgdir); \
	cd templates-cfg; $(cpiop) $(DESTDIR)$(cfgdir)
	@mkdir -p $(DESTDIR)$(opdir); \
	cd templates-op; $(cpiop) $(DESTDIR)$(opdir)

