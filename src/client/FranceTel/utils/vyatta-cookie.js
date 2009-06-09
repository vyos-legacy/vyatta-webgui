/*
    Document   : ft_vyatta-cookie.js
    Created on : Feb 25, 2009, 3:19:25 PM
    Author     : Kevin.Choi
    Description:
*/

var g_cookie =
{
    m_userNameExpire: (5*60*60*1000),
    m_helpExpire: (5 * 60 * 60 * 1000),
	m_langExpire: (5 * 60 * 60 * 1000),
    m_namePrefix: 'dom0_',

    /**
     * pName - the name for the cookie to be set
     *         (which will be prepended with dom0 prefix)
     * pValue - the value for the cookie to be set
     * pExpires - the time before the cookies to be set expires
     *            (in milliseconds)
     * pPath - the path for the cookie ('/' if not specified)
     * @return - return whether the cookies was set or not
     */
    f_set: function(pName, pValue, pExpires, pPath)
    {
        pName = this.m_namePrefix + pName;
        return this.f_set_raw(pName, pValue, pExpires, pPath);
    },

    f_set_raw: function(pName, pValue, pExpires, pPath)
    {
//        opera.postError('f_set_raw cookie: name=' + pName + ' value=' + pValue);
				
        var expires = g_consObj.V_NOT_FOUND;

        if(pExpires != undefined)
        {
            ///////////////////////////////
            // get a base time for expiration date
            var expDate = new Date(new Date().getTime() + pExpires);

            expires = '; expires=' + expDate.toGMTString();
        }

        var path = '; path=/';
        if (pPath != undefined) {
          path = '; path=' + escape(pPath);
        }

        return (document.cookie = escape(pName) + '=' + escape(pValue || '')
                                  + path + expires);
    },

    f_get: function(pName)
    {
        ////////////////////////////////////////
        // get the matching cookie
        pName = this.m_namePrefix + pName;
        return this.f_get_raw(pName);
    },

    f_get_raw: function(pName)
    {
        ////////////////////////////////////////
        // get the matching cookie
        var cookie = document.cookie.match(new RegExp('(^|;)\\s*' +
                      escape(pName) + '=([^;\\s]*)'));

//        if (cookie) {
//			opera.postError('f_get_raw cookie: name=' + pName + ' value=' + unescape(cookie[2]));
//		} else {
//			opera.postError('f_get_raw cookie: name=' + pName + ' is undefined');
//		}
        return (cookie ? unescape(cookie[2]) : g_consObj.V_NOT_FOUND);
    },

    f_remove: function(pName)
    {
        ///////////////////////////////////
        // get the cookie for pName
        var cookie = this.f_get(pName) || true;

        this.f_set(pName, '', -1);

        return cookie;
    },

    f_remove_all: function()
    {
      var str = document.cookie;
      var keys = str.split(';');
      for (var i = 0; i < keys.length; i++) 
      {
        if(keys[i].indexOf(g_consObj.V_COOKIES_LANG) >= 0)
            continue;
			
        if(keys[i].indexOf(g_consObj.V_COOKIES_BLB) >= 0)
            continue;			

        var avp = keys[i].match(new RegExp('^\\s*([^\\s]+)=([^\\s]*)\\s*$'));
        if (avp != undefined && avp[1] != undefined)
        {
            this.f_set_raw(avp[1], '', -1);
        }
      }
    }
}
