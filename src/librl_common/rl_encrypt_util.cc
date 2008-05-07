/*
 * Module: rl_encrypt_util.cc
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
#include "rl_encrypt_util.hh"

#define _XOPEN_SOURCE
#include <unistd.h>
#include <time.h>
#include <errno.h>
//#include <stdio.h>

int RLEncryptUtil::i64c(int i)
{
  if (i <= 0)
    return ('.');
  if (i == 1)
    return ('/');
  if (i >= 2 && i < 12)
    return ('0' - 2 + i);
  if (i >= 12 && i < 38)
    return ('A' - 12 + i);
  if (i >= 38 && i < 63)
    return ('a' - 38 + i);
  return ('z');
}

char * RLEncryptUtil::crypt(const char * strPlainTextPasswd) {
	return ::crypt(strPlainTextPasswd, crypt_make_salt());
}
char * RLEncryptUtil::crypt_make_salt(void)
{
  time_t now;
  static unsigned long x;
  static char result[3];

  time(&now);
  x += now + getpid() + clock();
  result[0] = i64c(((x >> 18) ^ (x >> 6)) & 077);
  result[1] = i64c(((x >> 12) ^ x) & 077);
  result[2] = '\0';
  return result;
}


