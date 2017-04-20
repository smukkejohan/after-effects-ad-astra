{
  var DEBUG = this.DEBUG;
  
	var debug = new Object();
	
	// Debug helpers //
	///////////////////

	// Peek inside an object and print contents
	// to console log
	debug.peekIn = function (pObj) {
		var out = "Contents of \"" + pObj.toString() + "\"";
		for (var p in pObj) {
				out += "\n";
				try {
					var name = p.toString();
					if (name == "") name = "Constructor";
					var content = pObj[p.toString()].toString().split("\n").join("\n      ");
					if (content.substr(-7,1) == "\n") content = content.substr(0, content.length-7);
					out += name + ": " + content;
				} catch (e) {
					out += p.toString() + ": Access denied by AE";
				}
				out +="\n";
		}
		this.log(out);
	};
	
	
	debug.probeProperties = function (pObj) { probePropertiesAtTime(pObj, 0); }
	debug.probePropertiesAtTime = function (pObj, timeValue) {
		var out = "Probing properties of \”" + pObj.name.toString() + "\"\n";
		var hitBounds = false;
		var i = 1;
        while (!hitBounds) {
            try {
                try {
                    out += "      " + i + ": " + pObj.property(i).name+" = " + pObj.property(i).valueAtTime(timeValue, null) + "\n";
                } catch (e) {
                    try {
                        out += "      "+ i + ": " + pObj.property(i).name+ pObj.property(i).toString() + "\n";
                    } catch (e) {
                        out += "      " + i + ": " + pObj.property(i).name + "(no direct access)\n";
                    }
                }
				i++;
			} catch (e) {
				try {
					out += "      Value: " + pObj.value.toString() + " (no properties, this is directly from object)\n";
				} catch (e) {
					log("EXCP: "+e.message);
				}
				hitBounds = true;
			}
		}
		this.log(out);
	};
	
	// Outputs string to AE JavaScript console
	debug.log = function (string) {
    if(typeof string == 'object'){
      var str = '';
      for (var p in string) {
          if (string.hasOwnProperty(p)) {
              str += p + '::' + string[p] + '\n';
          }
      }
      string = str;
    }
		if (DEBUG) $.writeln(string);

    if(this.comp !== undefined && string !== undefined && string.replace !== undefined){
      var l = _.enhanceLayer(this.comp.layers.addText(string.replace(/\n/g,'')));
      
      var textProp = l.property("Source Text");
      var textDocument = textProp.value;
      textDocument.resetCharStyle();
      textDocument.fillColor = [1, 1, 1];
      textDocument.fontSize = 55;
      textProp.setValue(textDocument);      
      
      l.setKey('Scale', [50,50]);
      l.setPos([10,this.logY]);
      this.logY += 30;
    }
	};
  
  debug.createComp = function(){
		var comp = app.project.items.addComp("__DEBUG",1920, 1080, 1, 1/25, 25)
		this.comp = utils.getComp(comp.name);
    
    this.comp.layers.addSolid([0,0,0],"BACKGROUND", 1920, 1080, 1, 1/25);
    
    
    this.logY = 50;
    
    
    
    var l = _.enhanceLayer(this.comp.layers.addText("LOG:"));
    
    var textProp = l.property("Source Text");
    var textDocument = textProp.value;
    textDocument.resetCharStyle();
    textDocument.fillColor = [1, 0.5, 0.5];
    textDocument.fontSize = 40;
    textProp.setValue(textDocument);      
    
    l.setPos([10,this.logY]);
    this.logY += 40;
  };
  
  debug.logParams = function(params){
    var i=50;
    for(var key in params){
      if(this.comp !== undefined){
        var l = _.enhanceLayer(this.comp.layers.addText(key+": "+params[key]));
      
        var textProp = l.property("Source Text");
        var textDocument = textProp.value;
        textDocument.resetCharStyle();
        textDocument.fillColor = [1, 1, 1];
        textDocument.fontSize = 55;
        textProp.setValue(textDocument);      
      
        l.setKey('Scale', [60,60]);
        l.setPos([1200,i]);
        i += 40;
      }
    }
  };

  debug.addDebugComp = function(mainComp){
    this.comp.addToComp(mainComp);    
  };

  if (DEBUG) {
      debug.log("\n \n===================================\nDebug helpers are active \n");
  }

}
