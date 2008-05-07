// -*- c-basic-offset: 4; tab-width: 8; indent-tabs-mode: t -*-

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

// $XORP$

#ifndef __LIBXORP_EVENTLOOP_FACTORY_HH__
#define __LIBXORP_EVENTLOOP_FACTORY_HH__

#include "libxorp/eventloop.hh"

enum EventLoopType { eventloop_st, eventloop_mt };
    
/**
 * @short Event Loop Factory.
 *
 */
class EventLoopFactory {
public:

    /**
     * Create new EventLoop according to the specified type.
     *
     * @return new instance of the EventLoop
     */
    EventLoop* create(EventLoopType type);

    /**
     * Get the the instance of the EventLoop factory.
     *
     * @return current instance of the EventLoopFactory
     */
    static EventLoopFactory& instance() { return *_instance; }

private:

    EventLoopFactory();
    ~EventLoopFactory();

    EventLoopFactory(const EventLoopFactory&);			// not implemented
    EventLoopFactory& operator=(const EventLoopFactory&);	// not implemented
    
private:

    static EventLoopFactory *_instance;

};

#endif // __LIBXORP_EVENTLOOP_FACTORY_HH__
