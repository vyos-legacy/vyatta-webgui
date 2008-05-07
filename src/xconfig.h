// auotconf creates a bad configuration file
// which mis-detects the signal return type

#ifdef	RETSIGTYPE
#define	SAVE_RETSIGTYPE	SAVE_RETSIGTYPE		// save the value if found
#undef	RETSIGTYPE
#endif

#include "config.h"

#ifdef	SAVE_RETSIGTYPE
#undef	RETSIGTYPE
#define	RETSIGTYPE	$SAVE_RETSIGTYPE	// restore the correct def--so sorry for the kludge
#endif
