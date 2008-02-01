/*
 *  Copyright 2006, Vyatta, Inc.
 *
 *  GNU General Public License
 * 
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License, version 2, 
 *  as published by the Free Software Foundation.
 * 
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 *  02110-1301 USA
 *
 *  Module:       xorp_node_info.hh
 *
 *  Author(s):    Marat Nepomnyashy, parts based on XORP
 *  Date:         2006
 *  Description:  Server-side code for encapsulation of XORP operational commands
 *
 */


#ifndef	__INCLUDE_XORP_OPCMD_INFO_HH__
#define	__INCLUDE_XORP_OPCMD_INFO_HH__

#include <list>

#include "rtrmgr/cli.hh"
#include "rtrmgr/conf_tree.hh"
#include "rtrmgr/op_commands.hh"
#include "common/opcmd_info.hh"

class XorpOpCmd : public OpCmd {
public:
	XorpOpCmd(OpCommand & oc, const ConfigTree & ctSync);
	XorpOpCmd(OpCommand & oc, const ConfigTree & ctSync, const std::string & strName, const std::string & strAction, OpCmdType oct);

	unsigned long getId() const;
	void determineAllowedValues(const ConfigTree & ctSync);

	OpCommand & getOpCommand();

	const std::string & getCachedCommandLine() const;
	const OpCommand & getConstOpCommand() const;

protected:
	OpCommand &  m_oc;
	std::string  m_strCachedCommandLine;

	void retrCommandLine(const std::list<std::string> & listCommandLine, std::string & strCommandLine) const;
	void retrListCommandLine(std::list<std::string> & listCommandLine) const;
};

class ModXorpOpCmd : public XorpOpCmd {
public:
	ModXorpOpCmd(OpCommand & oc, const ConfigTree & ctSync);
	ModXorpOpCmd(OpCommand & oc, const ConfigTree & ctSync, const std::string & strName, const std::string & strAction, OpCmdType oct);

	OpCmdName & getOpCmdName();

protected:
private:
	unsigned long getId() const;
};

class ExecutableXorpOpCmd : public ModXorpOpCmd {
public:
	ExecutableXorpOpCmd(OpCommand & oc, const ConfigTree & ctSync);
	ExecutableXorpOpCmd(OpCommand & oc, const ConfigTree & ctSync, const std::string & strName, const std::string & strAction, OpCmdType oct);

	OpInstance * execute(EventLoop& eventloop, RouterCLI::OpModePrintCallback print_cb, RouterCLI::OpModeDoneCallback done_cb);

protected:
};

class XorpOpCmds {
public:
	~XorpOpCmds();
	XorpOpCmds();

	void clear();
	void processLists(OpCommandList & ocl, const ConfigTree & ctSync);

	const std::list<XorpOpCmd*> & getConstListBasic() const;
	const std::list<XorpOpCmd*> & getConstListExtra() const;

	XorpOpCmd * findXorpOpCmd(unsigned long command_id);
	XorpOpCmd * findXorpOpCmdByName(const std::string & strCommandName);
	XorpOpCmd * findXorpOpCmdByParts(const std::list<std::string> & listCmdParts);

private:
	std::list<XorpOpCmd*> m_cmdsBasic;
	std::list<XorpOpCmd*> m_cmdsExtra;

	unsigned long doExpand(ModXorpOpCmd & mxocBase, std::vector<CommandNameSegment*>::size_type pos, unsigned long totalAllowedHops, OpCommand & oc, const ConfigTree & ctSync);
	void checkBasicList(const ConfigTree & ctSync);
	void clearList(std::list<XorpOpCmd*> & cmds);
	void loadBasicList(OpCommandList & ocl, const ConfigTree & ctSync);
	void loadExtraList(const ConfigTree & ctSync);

	XorpOpCmd * findXorpOpCmd(std::list<XorpOpCmd*> & cmds, unsigned long command_id);
	XorpOpCmd * findXorpOpCmdByParts(std::list<XorpOpCmd*> & cmds, const std::list<std::string> & listCmdParts);
	XorpOpCmd * findXorpOpCmdByParts(std::list<XorpOpCmd*> & cmds, const std::vector<std::string> & vectorCmdParts);

};

#endif

