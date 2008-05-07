/*
 * Module: rl_encrypt_util.hh
 *
 * **** License ****
 * Version: VPL 1.0
 *
 * The contents of this file are subject to the Vyatta Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.vyatta.com/vpl
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * This code was originally developed by Vyatta, Inc.
 * Portions created by Vyatta are Copyright (C) 2005, 2006, 2007 Vyatta, Inc.
 * All Rights Reserved.
 *
 * Author: Michael Larson
 * Date: 2005
 * Description:
 *
 * **** End License ****
 *
 */
#ifndef	__INCLUDE_RL_ENCRYPT_UTIL__
#define __INCLUDE_RL_ENCRYPT_UTIL__

class RLEncryptUtil {
public:
	static int i64c(int i);
	static char *crypt(const char * strPlainTextPasswd);
	static char *crypt_make_salt(void);
};

#endif

