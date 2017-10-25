/*!
 * jQuery.timeoutWarning: jQuery Session Timeout Warning v1.0.0.20171024
 * https://github.com/aprofetb/jquery.timeoutWarning
 * 
 * @requires jQuery v1.5 or above
 * @requires JavaScript Cookie v2.1.4 or above (https://github.com/js-cookie/js-cookie)
 * @optional bootbox.js (https://github.com/makeusabrew/bootbox)
 */

(function($){

  function reload() {
    return window.location.reload();
  }

  function debug(level) {
    if (window.console) {
      var log = level && window.console[level] || window.console.log;
      log.apply(this, Array.prototype.slice.call(arguments, 1));
    }
  }

  function validateOptions(options) {
    var noErrors = true;
    $.each(defaults, function(key, defaultValue) {
      var optionValue = options[key];
      var optionType = typeof optionValue;
      if (optionType !== 'undefined' && (optionType !== typeof defaultValue || (optionType === 'string' && !optionValue))) {
        debug('error', 'Invalid option: ' + key + '=' + optionValue);
        noErrors = false;
      }
    });
    return noErrors;
  }

  var timers = [], warningDialog;

  function clearTimers() {
    for (var i = 0; i < timers.length; i++)
      clearTimeout(timers[i]);
    timers.length = 0;
  }

  function clearWarningDialog() {
    if (warningDialog) {
      if (warningDialog.modal)
        warningDialog.modal('hide');
      warningDialog = null;
    }
  }

  function scheduleWarning() {
    clearTimers();
    timers.push(setTimeout(function() {
      if (getMillisLeftToExpire() > settings.notifyBefore) {
        // it seems that the session was pinged by another browser instance in the same session, so reschedule the warning
        scheduleWarning();
        return;
      }
      // the session will expire in `settings.notifyBefore` milliseconds
      timers.push(setTimeout(function() {
        if (getMillisLeftToExpire() <= 0) {
          if (settings.sessionExpired)
            settings.sessionExpired();
        }
        else {
          clearWarningDialog();
          scheduleWarning();
        }
      }, getMillisLeftToExpire() + settings.timeSpanAfterExpiration));
      clearWarningDialog();
      var alertCallback = function() {
        // ping the server to keep the session alive when clicking OK
        methods.ping.apply(this);
      };
      // show the session timeout warning dialog
      warningDialog = settings.alert.call(this, settings.warningMessage, alertCallback);
      if (settings.alert.length == 1) {
        // it doesn't accept callback functions, so call it manually
        alertCallback.call(this);
      }
    }, getMillisLeftToExpire() - settings.notifyBefore));
  }

  function getMillisLeftToExpire() {
    return Cookies.get(settings.cookieName) - new Date().getTime();
  }

  var bootboxAlert = typeof bootbox !== 'undefined' && bootbox.alert,
      defaults = {
        cookieName              : 'sessionExpiresOn',     // cookie name where the session expiration is stored
        sessionExpired          : reload,                 // callback function called when the session expires
        timeSpanAfterExpiration : 2000,                   // milliseconds to wait after the session expires before calling the `sessionExpired` callback function (default: 2 seconds)
        pingUrl                 : '/',                    // url to send the ping to remain in the session
        sessionTimeout          : 15 * 60 * 1000,         // milliseconds the session lasts (default: 15 minutes)
        notifyBefore            : 30 * 1000,              // milliseconds before the session expires to display the warning message (default: 30 seconds)
        enabled                 : true,                   // schedule the session timeout warning when the `init` method is executed
        resetOnAjaxComplete     : true,                   // reset the session timeout when the ajaxComplete event is fired
        alert                   : bootboxAlert || alert,  // alert function
        warningMessage          : 'For your protection, you are about to be automatically logged out.' +
                                  (bootboxAlert ? '<br>' : '\n') +
                                  'If you would like to remain in the session, click OK below.'
      },
      settings,
      initialized = false,
      onAjaxComplete = false,
      methods = {
        init: function(options) {
          if (!Cookies || !Cookies.get || !Cookies.set)
            debug('error', 'Cookies library not found (https://github.com/js-cookie/js-cookie)');
          var newSettings = $.extend(true, {}, settings || defaults, options);
          if (!validateOptions(newSettings))
            return;
          settings = newSettings;
          if (settings.enabled) {
            Cookies.set(settings.cookieName, new Date().getTime() + settings.sessionTimeout);
            scheduleWarning();
            if (settings.resetOnAjaxComplete) {
              if (!onAjaxComplete) {
                onAjaxComplete = true;
                $(document).ajaxComplete(function() {
                  if (settings.enabled)
                    methods.init.apply(this);
                });
              }
            }
          }
          else {
            clearTimers();
            clearWarningDialog();
            Cookies.remove(settings.cookieName);
          }
          initialized = true;
        },
        millisLeftToExpire: function() {
          if (!initialized) {
            debug('error', 'The plugin has not been initialized');
            return;
          }
          return getMillisLeftToExpire();
        },
        ping: function() {
          if (!initialized) {
            debug('error', 'The plugin has not been initialized');
            return;
          }
          $.ajax(settings.pingUrl);
        },
        enable: function(options) {
          if (!options)
            options = {};
          options.enabled = true;
          methods.init.call(this, options);
        },
        disable: function() {
          if (!initialized) {
            debug('error', 'The plugin has not been initialized');
            return;
          }
          methods.init.call(this, { enabled: false });
        }
      };

  $.timeoutWarning = function(methodOrOptions) {
    if (methods[methodOrOptions])
      return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
    else if (typeof methodOrOptions === 'object' || ! methodOrOptions)
      return methods.init.apply(this, arguments);
    debug('error', 'Method ' + methodOrOptions + ' does not exist on jQuery.timeoutWarning');
  };

})(jQuery);
