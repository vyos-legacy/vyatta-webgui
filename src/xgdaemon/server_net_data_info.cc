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
 *  Module:       server_net_data_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  Code for server-side encapsulation of data related to net statistics.
 *
 */



#include "server_net_data_info.hh"

#include <stdexcept>

#include "xgdaemon_proc_util.hh"
#include "common/textparse/text_parse_util.hh"

ServerNetDataInfo::ServerNetDataInfo() {
}
bool ServerNetDataInfo::readProc() {
	ANTokenizedStrings ants;
	if (XGDaemonProcUtil::readProcNetDev(ants) == false) return false;

	if (ants.getTotalLines() < 2) return false;
	ants.popFirst();
	ants.popFirst();

	if (ants.getUniformANTokens() == 0) return false;

	TableRows * p_trows = new TableRows(ants);
	if (p_trows == NULL) return false;
	
	unsigned long totalRows = p_trows->getTotalRows();
	for (unsigned long i = 0; i < totalRows; i++) {
		const TableRow * p_trow = p_trows->getConstPtrRow(i);
		if (p_trow == NULL) throw std::logic_error("Expected non-NULL TableRow.");
		
		const std::string firstCol = p_trow->getColumn(PROC_COLUMN_INTF);
		if (firstCol != PROC_COLUMN_INTF_LO) {
			m_in.incrementBytes(p_trow->getULColumn(PROC_COLUMN_IN_BYTES));
			m_in.incrementPackets(p_trow->getULColumn(PROC_COLUMN_IN_PACKETS));
			m_in.incrementErrs(p_trow->getULColumn(PROC_COLUMN_IN_ERRS));
			m_in.incrementDrop(p_trow->getULColumn(PROC_COLUMN_IN_DROP));
			m_in.incrementFifo(p_trow->getULColumn(PROC_COLUMN_IN_FIFO));
			m_in.incrementFrame(p_trow->getULColumn(PROC_COLUMN_IN_FRAME));
			m_in.incrementCompressed(p_trow->getULColumn(PROC_COLUMN_IN_COMPRESSED));
			m_in.incrementMulticast(p_trow->getULColumn(PROC_COLUMN_IN_MULTICAST));

			m_out.incrementBytes(p_trow->getULColumn(PROC_COLUMN_OUT_BYTES));
			m_out.incrementPackets(p_trow->getULColumn(PROC_COLUMN_OUT_PACKETS));
			m_out.incrementErrs(p_trow->getULColumn(PROC_COLUMN_OUT_ERRS));
			m_out.incrementDrop(p_trow->getULColumn(PROC_COLUMN_OUT_DROP));
			m_out.incrementFifo(p_trow->getULColumn(PROC_COLUMN_OUT_FIFO));
			m_out.incrementColls(p_trow->getULColumn(PROC_COLUMN_OUT_COLLS));
			m_out.incrementCarrier(p_trow->getULColumn(PROC_COLUMN_OUT_CARRIER));
			m_out.incrementCompressed(p_trow->getULColumn(PROC_COLUMN_OUT_COMPRESSED));
		}
	}
	
	return true;
}
