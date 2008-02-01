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
 *  Module:       net_data_info.cc
 *
 *  Author(s):    Marat Nepomnyashy
 *  Date:         2006
 *  Description:  This class encapsulates various network data counters used to output statistics.
 *
 */


#include "net_data_info.hh"

#include <iostream>

NetDataCommonInfo::NetDataCommonInfo() : m_bytes(0), m_compressed(0), m_drop(0), m_errs(0), m_fifo(0), m_packets(0) {
}
NetDataCommonInfo::~NetDataCommonInfo() {
}
unsigned long NetDataCommonInfo::getBytes() const {
	return m_bytes;
}
unsigned long NetDataCommonInfo::getCompressed() const {
	return m_compressed;
}
unsigned long NetDataCommonInfo::getDrop() const {
	return m_drop;
}
unsigned long NetDataCommonInfo::getErrs() const {
	return m_errs;
}
unsigned long NetDataCommonInfo::getFifo() const {
	return m_fifo;
}
unsigned long NetDataCommonInfo::getPackets() const {
	return m_packets;
}

void NetDataCommonInfo::incrementBytes(const unsigned long bytes) {
	m_bytes += bytes;
}
void NetDataCommonInfo::incrementCompressed(const unsigned long compressed) {
	m_compressed += compressed;
}
void NetDataCommonInfo::incrementDrop(const unsigned long drop) {
	m_drop += drop;
}
void NetDataCommonInfo::incrementErrs(const unsigned long errs) {
	m_errs += errs;
}
void NetDataCommonInfo::incrementFifo(const unsigned long fifo) {
	m_fifo += fifo;
}
void NetDataCommonInfo::incrementPackets(const unsigned long packets) {
	m_packets += packets;
}

void NetDataCommonInfo::print() const {
	std::cout << "bytes:       " << m_bytes << std::endl;
	std::cout << "compressed:  " << m_compressed << std::endl;
	std::cout << "drop:        " << m_drop << std::endl;
	std::cout << "errs:        " << m_errs << std::endl;
	std::cout << "fifo:        " << m_fifo << std::endl;
	std::cout << "packets:     " << m_packets << std::endl;
}

void NetDataCommonInfo::setBytes(const unsigned long bytes) {
	m_bytes = bytes;
}
void NetDataCommonInfo::setCompressed(const unsigned long compressed) {
	m_compressed = compressed;
}
void NetDataCommonInfo::setDrop(const unsigned long drop) {
	m_drop = drop;
}
void NetDataCommonInfo::setErrs(const unsigned long errs) {
	m_errs = errs;
}
void NetDataCommonInfo::setFifo(const unsigned long fifo) {
	m_fifo = fifo;
}
void NetDataCommonInfo::setPackets(const unsigned long packets) {
	m_packets = packets;
}
const NetDataReceiveInfo & NetDataInfo::getConstIn() const {
	return m_in;
}
const NetDataTransmitInfo & NetDataInfo::getConstOut() const {
	return m_out;
}
void NetDataInfo::print() const {
	std::cout << "in:" << std::endl;
	m_in.print();
	std::cout << "out:" << std::endl;
	m_out.print();
}

NetDataReceiveInfo::NetDataReceiveInfo() : m_frame(0), m_multicast(0) {
}
unsigned long NetDataReceiveInfo::getFrame() const {
	return m_frame;
}
unsigned long NetDataReceiveInfo::getMulticast() const {
	return m_multicast;
}
void NetDataReceiveInfo::incrementFrame(const unsigned long frame) {
	m_frame += frame;
}
void NetDataReceiveInfo::incrementMulticast(const unsigned long multicast) {
	m_multicast += multicast;
}
void NetDataReceiveInfo::setFrame(const unsigned long frame) {
	m_frame = frame;
}
void NetDataReceiveInfo::setMulticast(const unsigned long multicast) {
	m_multicast = multicast;
}


NetDataTransmitInfo::NetDataTransmitInfo() : m_colls(0), m_carrier(0) {
}

unsigned long NetDataTransmitInfo::getColls() const {
	return m_colls;
}
unsigned long NetDataTransmitInfo::getCarrier() const {
	return m_carrier;
}
void NetDataTransmitInfo::incrementColls(const unsigned long colls) {
	m_colls += colls;
}
void NetDataTransmitInfo::incrementCarrier(const unsigned long carrier) {
	m_carrier += carrier;
}
void NetDataTransmitInfo::setColls(const unsigned long colls) {
	m_colls = colls;
}
void NetDataTransmitInfo::setCarrier(const unsigned long carrier) {
	m_carrier = carrier;
}

