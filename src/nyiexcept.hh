#include <stdexcept>
#include <stdio.h>


#define NYIEXCEPT	\
{ \
	char buf[256]; \
	sprintf(buf, "NYI  %s  %d", __FILE__, __LINE__); \
	throw std::logic_error(buf); \
}
