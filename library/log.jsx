{
  // 0: FATAL, 1: ERROR, 2: WARN, 3: INFO
  var log = function(msg, level) {
      if(!level) level = 2
       if(this.LOG_LEVEL > level) {
          if(this.DEBUG) {
            $.writeln("log:" + msg + $.line);
          } else {
            reportError(msg);
    	  }
       }
	}
}