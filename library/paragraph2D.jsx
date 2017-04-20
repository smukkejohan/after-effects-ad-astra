{
/*
** A paragraph represents one or more lines of text in a single container with a common anchor point
** WARNING: do not use this inside a for(var i) loop, since i will be manipulated!
*/

var _textSizeCache =  {};
var _textFontName;

var Paragraph2D = function(origin, container, options) {

	var font, bounds, direction;
	var words, widths, assumedHeight, offset;

	if(!options.offset) {
		offset = utils.getLineHeight(origin, 0.85);
	} else {
		offset = options.offset;
	}

	__construct = function() {
		_textFontName = origin.property("Source Text").value.font+"_"+origin.property("Source Text").value.fontSize;
    	font = Font.get(origin.property("Source Text").value.font);

		if(!options.direction) direction = "down"; // todo else parse it if it is there
		if(!options.padding) padding = [0, 0, 0, 0];
		origin.disable();
		var cloneName = "Paragraph-"+origin.containingComp.name+"-"+origin.name;
		origin = origin.clone(cloneName);
		this.layers = [origin];

		bounds = new Size(
			container.getSize().w - padding[1] - padding[3],
			container.getSize().h - padding[0] - padding[2]
			)

		var assumedLineNum = origin.getSize().w / bounds.w;
		assumedHeight = new Size(0, assumedLineNum * offset).h

		origin.disable();
		getWordWidths();
	};

	this.getAssumedFit = function() {
		return assumedHeight < bounds.h;
	};

	this.getName = function() {
		return origin.name;
	};

  getTextSize = function(layer, word){
    word = word.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

    if(!word)
      return {w:0, h:0};

    if(_textSizeCache[_textFontName+'_'+word] !== undefined){
      return _textSizeCache[_textFontName+'_'+word];
    }

    _textSizeCache[_textFontName+'_'+word] = layer.getTextSize(word);
    return _textSizeCache[_textFontName+'_'+word];
  };

	getWordWidths = function() {
		widths = [];
		words = utils.splitText(origin.getText());

		for(i in words) {
			var debugOrigin = origin;
      widths.push( getTextSize(origin, words[i]).w);
		}	
	};

	this.getOrigin = function() {
		return origin;
	};

	this.indentLines = function() {
		// indent all lines with lookup on first letter in the parsed offsetobject for font
		if(font) {
			var is3D				= false;
			var fontSize    = origin.getFontSize();
			var offsetScale = font.CalcFromSize/fontSize;
			var x           = origin.pos.getX();

			for(i in this.layers) {
				var line 				= this.layers[i];
				var firstLetter = line.getText().substring(0,1);

				for(j in font.offsets) {
					if(font.offsets[j][0] == firstLetter){
						var offset = font.offsets[j][1]*offsetScale;
						line.pos.setX(x+offset);
					}
				}
			}
		}
	};

	this.draw = function() {

		this.split();
		this.indentLines();
		this.enable();
		return this;
	};

	this.debug = function() {
		if(DEBUG) {
			var testlayer = container.clone();
			testlayer.name = "MAX DIMENSIONS "+ this.getName();
			testlayer.replaceSource(_.getItem("DEBUG-BOUNDS"), false);
			testlayer.setSize(bounds);
			testlayer.pos.set(new Vec2(container.pos.get().x + padding[3], container.pos.get().y + padding[0]));
			var textsizelayer = container.clone();
			textsizelayer.name = "TEXT SIZE " + this.getName();
			textsizelayer.replaceSource(_.getItem("DEBUG-SIZE"), false);
			textsizelayer.setSize(new Size(this.getProjectedWidth(), this.getProjectedHeight()));
			var th = textsizelayer.getSize().h;
			textsizelayer.pos.set(new Vec2(container.pos.get().x + padding[3], container.pos.get().y + padding[0] + container.getSize().h-padding[0]-padding[2] - th));
			textsizelayer.enable();
			testlayer.enable();
		}
	};

	this.fits = function() {
		if (this.getProjectedWidth() < bounds.w && this.getProjectedHeight() < bounds.h) return true;
		return false;
	};

	this.getLines = function() {
		return this.layers
	};

	this.getOffset = function() {
		return offset;
	};

	this.disable = function() {
		for(i in this.layers) {
			this.layers[i].disable()
		}
	};

	this.purge = function() {
		for(var i=0;i<this.layers.length;i++) {
			try{
				this.layers[i].remove()
			} catch(e) {
				debug.log("Catch in purge");
			}
		}

    	//origin.remove()
    	this.layers = null
		return null
	};

	this.enable = function() {
		for(i in this.layers) {
			this.layers[i].enable()
		}
	};

	this.split = function() {
		var w = origin.getSize().w

		if(w > bounds.w || origin.getText().indexOf("//") !== -1) {

			debug.log("\n Trying to split " + origin.name + " width is " + w + " and max width is: " + bounds.w);
			this.layers = this.splitTextLayer();

      		if(!this.layers){
        		return;
      		}

			for(i in this.layers) {
				var index = i;

				var line = this.layers[index];
				//debug.log("line: "+line.name)

				var npos = line.pos.get();
				npos.y += (i) * offset;
				var prop = line.property("Position");

				if(prop.numKeys != 0){
					for(var i=1; i<=prop.numKeys; i++) {
						var value   = prop.valueAtTime(prop.keyTime(i), false);

						line.setPos([value[0], npos.y], prop.keyTime(i));
					}
				} else {
					line.setPos([npos.x, npos.y], 0);
				}
			}

		} else {

		}

		if(this.layers === undefined || this.layers.length < 1) {
			this.layers = [origin]
		}

		this.enable();
		return this
	};


	//Takes the text and splits it up ind different line layers
	this.splitTextLayer = function() {
		var sum = 0; // width of words in current line
		var line = []; //The current working line
		var lines = []; // The list of lines
		var numWords = words.length;
		var i = 0;

		while (0<=words.length-1) {
			i = numWords - words.length;
			//debug.log("Working on '"+words[0]+"'  "+widths[i]);

      		//array of lengths of words
      sum += widths[i];

      var word = words[0].replace(/^\s\s*/, '').replace(/\s\s*$/, '');

      if(widths[i] == 0){
        words.shift();
      }
      else if(word == "//" && !options.disableLinebreak){
        //debug.log("New line")
        line.push(word);
        words.shift();
        _.trimArray(line);
        lines.push(line.join(" "));

        line = [];
        sum = 0;
      }
      else if(sum <= bounds.w){ //we are less then a whole line, lets push it to the line
        //debug.log("Push");
        line.push(word);
        words.shift()
      }
      else if(widths[i] > bounds.w) { //The word itself is longer then the bounds
        //debug.log("Word "+words[0]+" is longer then bounds");
        if(line.length > 0){
          _.trimArray(line);
          lines.push(line.join(" "));
          line = [];
        }
        lines.push(words.shift()); //Add the word as a word itself
        sum = 0;
      }
      else if(sum > bounds.w){ //The sum is bigger then the sum, so we split
        //debug.log("Splitting line")
        _.trimArray(line);
        lines.push(line.join(" "));

        line = [];
        sum = 0;
      }


			if(words.length == 0){ // add the last word
				//debug.log("Finishing up")
				if(line.length > 0){
					_.trimArray(line);
          lines.push(line.join(" "));
					// this might be where we get the duplicate line
				}
			}
		}

		//Trim whitespaces
		for(var i = 0; i < lines.length; i++){
			lines[i] = lines[i].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
		}

		for(var i = 0; i < lines.length; i++){
      var ret = utils.normalize2DTextLines(origin, lines, bounds.w);
      if(ret){
        lines = ret;
      } else {
        i = lines.length;
      }
    }

		//Strip newlines (//)
		for(var i = 0; i < lines.length; i++){
			lines[i] = _.stripNewlines(lines[i]);
		}

		while(options.maxLines && lines.length > options.maxLines){
			debug.log("To many lines, cutting it...");
			lines.pop();
			lines[lines.length-1] += "...";
		}


		var clonePrefix = "cloned-text-";
		//this.cleanUpContainingComp(layer, clonePrefix);

		this.layers = [];
		/*if(lines.length <= 1) {
			this.layers.push(origin);
		}
		else {*/
			for(i in lines) {
				this.layers.push(origin.clone().setText(lines[i]));
				this.layers[i].name = clonePrefix + origin.name + "-" + i;
			}
		//}

		return this.layers;
	};

	this.getProjectedHeight = function() { // DEPRECATE for 2D text layer
		return this.layers.length * offset
	};

	this.getHeight = function() {
		return this.layers.length * offset
	};

	/*
	** Returns the viewport dimensions of the longest line
	*/
	this.getProjectedWidth = function() {
		var width = 0;
		var linewidth = 0;
		if(this.layers.length > 0) {
			for(i in this.layers) {
				linewidth = this.layers[i].getSize().w;

				if(linewidth > width) {
					width = linewidth;
				}
			}
		}
		return width
	};

	this.collectInComp = function(time) {

		var comp = app.project.items.addComp(origin.name+"-Layers", Math.ceil(this.getProjectedWidth())+7, Math.ceil(this.getHeight()), 1, time, SETTINGS.FRAMERATE);
		comp = _.getComp(comp.name);
		//var compLayers = [];

		for(i in this.layers){
			this.layers[i].disable();
			this.layers[i].copyToComp(comp);
		}

		var parentLayer = comp.getLayer(comp.numLayers);
		var lastLayerHeight = comp.getLayer(1).getHeight();
		var hDiff = offset - lastLayerHeight;
		comp.height = Math.ceil(comp.height - hDiff+3);

		for(var i=1; i<=comp.numLayers; i++){
			var layer = comp.getLayer(i).enable();
			if(i < comp.numLayers){
				layer.parent = parentLayer;
			}
		}
		var rect = parentLayer.sourceRectAtTime(0,false);
		parentLayer.setPos([0,Math.abs(rect.top)+2]);

		return comp;
	};

	__construct()
};

// This will try and balance the lines better
utils.normalize2DTextLines = function(layer, lines, projectedMaxWidth) {
	var widths = [];
	var lineWords = [];
   var anyChanges = false;

	for(i in lines){
		widths.push(layer.getTextSize(lines[i]).w);
		lineWords.push(utils.splitText(lines[i]));
	}

	for(j in lines){

		var width = widths[j];
		var space = projectedMaxWidth - width;

		var prevLine = "";
		if(j>0) {
			prevLine = lineWords[j-1];

      if( widths[j-1] > widths[j]){
        var lastWordInPrevLine = prevLine[prevLine.length - 1];
        var wordWidth = getTextSize(layer, lastWordInPrevLine).w;

        //Dont move words if its ending with colon or is a linebreak (//)
        if(lastWordInPrevLine.substr(lastWordInPrevLine.length - 1) !== ":"
          && lastWordInPrevLine !== "//"){

          if(wordWidth < space ){

            //Hmm hvad gør det her godt for?!

            /*if(widths[j-1]-wordWidth < wordWidth+widths[j] && j == 1) {
                debug.log("WORD MOVED: "+lastWordInPrevLine +" | from line: "+prevLine.join(""));
                var word = lineWords[j-1].pop();
                if(word.substring(word.length-1,word.length) != "-"){
                  word += " "
                }
                if(word == "-"){
                  word += " ";
                }
                lineWords[j].unshift(word);
            } else*/

            if(widths[j-1]-wordWidth > wordWidth+widths[j]) {
                debug.log("WORD MOVED: "+lastWordInPrevLine +" | from line: "+prevLine.join(""));
                anyChanges = true;
                var word = lineWords[j-1].pop();
                if(word.substring(word.length-1,word.length) != "-"){
                  word += " ";
                }
                if(word == "-"){
                  word += " ";
                }
                lineWords[j].unshift(word);
            }
          }
				}
			}
		}
	}

  if(!anyChanges){
    return false;
  }
	lines = [];
	for(k in lineWords){
		lines.push(lineWords[k].join(""));
	}

	return lines;
}


}