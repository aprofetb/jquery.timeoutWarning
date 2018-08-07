# jquery.timeoutWarning
jQuery Session Timeout Warning is a plugin that shows a session-about-to-expire message and allows the user to remain in the session by clicking a button. Here is a simple [demo](https://codepen.io/aprofetb/pen/oMaXPg).

## Usage
```js
$.timeoutWarning({
  cookieName              : "sessionExpiresOn",     // cookie name where the session expiration is stored
  sessionExpired          : function() {            // callback function called when the session expires
                              return location.reload();
                            },
  timeSpanAfterExpiration : 2000,                   // milliseconds to wait after the session expires before
                                                    //   calling the `sessionExpired` callback function
  pingUrl                 : "/",                    // url to send the ping to remain in the session
  sessionTimeout          : 1000 * 60 * 15,         // milliseconds the session lasts
  notifyBefore            : 1000 * 30,              // milliseconds before the session expires to display
                                                    //   the warning message
  enabled                 : true,                   // schedule the session timeout warning when the `init`
                                                    //   method is executed
  resetOnAjaxComplete     : true,                   // reset the session timeout when the document's ajaxComplete
                                                    //   event is fired
  alert                   : bootbox.alert,          // alert function
  warningMessage          : "For your protection, you are about to be automatically logged out.<br>" +
                            "If you would like to remain in the session, click OK."
});
```
