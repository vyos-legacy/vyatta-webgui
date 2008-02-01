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
 *  Module:       net_data_info.hh
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  This class encapsulates various network data counters used to output statistics.
 *
 */


#ifndef __INCLUDE_NET_DATA_INFO__
#define __INCLUDE_NET_DATA_INFO__

class NetDataCommonInfo {
public:
	NetDataCommonInfo();
	virtual ~NetDataCommonInfo();

	unsigned long getBytes() const;
	unsigned long getCompressed() const;
	unsigned long getDrop() const;
	unsigned long getErrs() const;
	unsigned long getFifo() const;
	unsigned long getPackets() const;

	void incrementBytes(const unsigned long bytes);
	void incrementCompressed(const unsigned long compressed);
	void incrementDrop(const unsigned long drop);
	void incrementErrs(const unsigned long errs);
	void incrementFifo(const unsigned long fifo);
	void incrementPackets(const unsigned long packets);

	virtual void print() const;

	void setBytes(const unsigned long bytes);
	void setCompressed(const unsigned long compressed);
	void setDrop(const unsigned long drop);
	void setErrs(const unsigned long errs);
	void setFifo(const unsigned long fifo);
	void setPackets(const unsigned long packets);

private:
	unsigned long m_bytes;
	unsigned long m_compressed;
	unsigned long m_drop;
	unsigned long m_errs;
	unsigned long m_fifo;
	unsigned long m_packets;
};



class NetDataReceiveInfo : public NetDataCommonInfo {
public:
	NetDataReceiveInfo();

	unsigned long getFrame() const;
	unsigned long getMulticast() const;

	void incrementFrame(const unsigned long frame);
	void incrementMulticast(const unsigned long multicast);

	void setFrame(const unsigned long frame);
	void setMulticast(const unsigned long multicast);

private:
	unsigned long m_frame;
	unsigned long m_multicast;	
};

class NetDataTransmitInfo : public NetDataCommonInfo {
public:
	NetDataTransmitInfo();
	
	unsigned long getColls() const;
	unsigned long getCarrier() const;

	void incrementColls(const unsigned long colls);
	void incrementCarrier(const unsigned long carrier);

	void setColls(const unsigned long colls);
	void setCarrier(const unsigned long carrier);

private:
	unsigned long m_colls;
	unsigned long m_carrier;
};

class NetDataInfo {
public:
	void print() const;
	
	const NetDataReceiveInfo & getConstIn() const;
	const NetDataTransmitInfo & getConstOut() const;

protected:
	NetDataReceiveInfo m_in;
	NetDataTransmitInfo m_out;
};


#endif

