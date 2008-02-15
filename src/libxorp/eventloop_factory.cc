// -*- c-basic-offset: 4; tab-width: 8; indent-tabs-mode: t -*-
// vim:set sts=4 ts=8:

// Copyright (c) 2001-2007 International Computer Science Institute
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software")
// to deal in the Software without restriction, subject to the conditions
// listed in the XORP LICENSE file. These conditions include: you must
// preserve this copyright notice, and you cannot mention the copyright
// holders in advertising related to the Software without their permission.
// The Software is provided WITHOUT ANY WARRANTY, EXPRESS OR IMPLIED. This
// notice is a summary of the XORP LICENSE file; the license in that file is
// legally binding.

#ident "$XORP$"


#include "nyiexcept.hh"

#include "eventloop_factory.hh"
//#include "eventloop_st.hh"
//#include "eventloop_mt.hh"

EventLoopFactory* EventLoopFactory::_instance = new EventLoopFactory();
//static EventLoopST *_est = 0;
//static EventLoopMT *_emt = 0;

EventLoopFactory::EventLoopFactory()
{
}

EventLoopFactory::~EventLoopFactory()
{
//    delete _est;
//    delete _emt;
}

EventLoop*
EventLoopFactory::create(EventLoopType type)
{
    switch (type) {
    case eventloop_st: {

NYIEXCEPT;
//	if (!_est)
//	    _est = new EventLoopST();
//        return _est;
	}
    case eventloop_mt: {

/*	if (!_emt)
	    _emt = new EventLoopMT();
        return _emt;*/
	return 0;
	}
    }
    return 0;
}
