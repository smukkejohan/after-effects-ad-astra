{
    
    var logger = {};
    
    // RFC5424 log levels
    logger.levels = { emerg: 0, alert: 1, crit: 2, error: 3, warning: 4, notice: 5, info: 6, debug: 7};
    
    logger.log = function(msg, level) {
        
        if(!level) {
            level = 'info';
        }
        // TODO: check the log level exist ?
        // TODO: this flag (this.DEBUG) should actually be producton / development
        if(DEBUG) {
            // if we are debugging write log to extendscript console
            $.writeln("log " + "[" + level + "]" + ":" + msg );
            
        } else {
            
            // TODO: insert logging method here than can be caught by winston in render server
            // warning and above should be sent to remote logging on logentries
            // everything above debug (ubless debug log level set) to local log file and to progressbar
        }
    };
    logger.debug   = function(msg) { logger.log(msg, "debug");   };
    logger.info    = function(msg) { logger.log(msg, "info");    };
    logger.notice  = function(msg) { logger.log(msg, "notice");  };
    logger.warning = function(msg) { logger.log(msg, "warning"); };
    logger.error   = function(msg) { logger.log(msg, "error");   };
    logger.crit    = function(msg) { logger.log(msg, "crit");    };
    logger.alert   = function(msg) { logger.log(msg, "alert");   };
    logger.emerg   = function(msg) { logger.log(msg, "emerg");   };
}

