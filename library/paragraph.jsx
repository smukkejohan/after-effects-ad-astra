{
//var TextLayer = function(layer)

/*
** A paragraph represents one or more lines of text in a single container with a common anchor point
*/
var Paragraph = function(origin, container, padding) {
	
	var font, layers, projectedBounds, direction;
	var words, widths, assumedHeight;
	
	var offset = utils.getLineHeight(origin, 0.85);

	__construct = function() {
		
		font = Font.get(origin.property("Source Text").value.font);
		
		direction = "up";
		if(!padding) padding = [0, 0, 0, 0];
		layers = [origin];
		
		projectedBounds = new Size(
		    container.d3.getProjectedSize().w - padding[1] - padding[3], 
				container.d3.getProjectedSize().h - padding[0] - padding[2]
		);
		
		var assumedLineNum = origin.d3.getProjectedSize().w / projectedBounds.w;
		assumedHeight = new Size(0, assumedLineNum * offset).h	
				
		origin.disable();
		getWordWidths();
	};
	
	this.getAssumedFit = function() {
		return assumedHeight < projectedBounds.h;
	};
	
	this.getName = function() {
		return origin.name;
	};
	
	getWordWidths = function() {
		widths = [];
		words = utils.splitText(origin.getText());
		
		for(i in words) {
			 widths.push( origin.d3.getProjectedTextSize(words[i]).w );
		}	
	};
	
	this.indentLines = function() { 	
		// indent all lines with lookup on first letter in the parsed offsetobject for font
		var is3D				= false;
		var fontSize    = origin.getFontSize();
		//var offsetScale = font.CalcFromSize/fontSize;
		var offsetScale = fontSize/font.CalcFromSize;
		var x           = origin.pos.getX(d3.time);
		
		if(origin.d3.getViewPos().x != "Infinity"){ // the layer is in a 3D world
			x = origin.d3.getViewPos().x;
			is3D = true;
		}
		
		for(i in layers) {
			var line 				= layers[i];
			var firstLetter = line.getText().substring(0,1);
			
			for(j in font.offsets) {
				if(font.offsets[j][0] == firstLetter){
					var offset = font.offsets[j][1]*offsetScale;
					//debug.log(origin.name+": "+offset+" | offsetScale: "+offsetScale)
					if(!is3D) {
						line.pos.setX(x+offset);
					} else {
						var viewPos = new Vec2(line.d3.getViewPos().x+offset, line.d3.getViewPos().y);
						
						line.d3.setViewPos(viewPos)
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
	  /*if(DEBUG) {
		  var testlayer = container.clone();
  		testlayer.name = "MAX DIMENSIONS "+ this.getName();
  		testlayer.replaceSource(_.getItem("DEBUG-BOUNDS"), false);
  		testlayer.d3.setProjectedSize(projectedBounds);
  		testlayer.d3.setViewPos(new Vec2(container.d3.getViewPos().x + padding[3], container.d3.getViewPos().y + padding[0]));
  		var textsizelayer = container.clone();
  		textsizelayer.name = "TEXT SIZE " + this.getName();
  		textsizelayer.replaceSource(_.getItem("DEBUG-SIZE"), false);
  		textsizelayer.d3.setProjectedSize(new Size(this.getProjectedWidth(), this.getProjectedHeight()));
  		var th = textsizelayer.d3.getProjectedSize().h;
  	  textsizelayer.d3.setViewPos(new Vec2(container.d3.getViewPos().x + padding[3], container.d3.getViewPos().y + padding[0] + container.d3.getProjectedSize().h-padding[0]-padding[2] - th));
  		textsizelayer.enable();
  		testlayer.enable();
	  }*/
	};
	
	this.fits = function() {
		if (this.getProjectedWidth() < projectedBounds.w && this.getProjectedHeight() < projectedBounds.h) return true;
		return false;
	};
	
	this.getLines = function() {
		return layers;
	};
	
	this.getOffset = function() {
		return offset;
	};
	
	this.disable = function() {
		for(i in layers) {
			layers[i].disable();
		}
	};
	
	this.purge = function() {
	  for(i in layers) {
			layers[i].remove();
		}
		layers = null;
		return null;
	};
	
	this.enable = function() {
		for(i in layers) {
			layers[i].enable();
		}
	};
	
	this.split = function() {	
		var w = origin.d3.getProjectedSize().w;
		
		if(w > projectedBounds.w) {
      
      //debug.log("\n Trying to split " + origin.name + " width is " + w + " and max width is: " + projectedBounds.w)
      
			layers = splitTextLayer();

			for(i in layers) {
				var index = i;
				
				if(direction == 'down') {
					index = layers.length-i;
					offset = offset*-1;
				}
				var line = layers[index];
				
				var npos = line.d3.getViewPos();	
				npos.y -= (layers.length-i-1) * offset;
				
				line.d3.setViewPos(npos);
			}		

		} else {

		}
		
		if(layers.length < 1) {
		  layers = [origin]
		}
		
		this.enable();
		return this
	};
	
	splitTextLayer = function() {	
		//var width = layer.d3.getProjectedSize().w;
	
		var sum = 0; // width of words in current line
		var line = [];
		var lines = [];
		var numWords = words.length;
	  var i = 0;
	  
		while (0<=words.length-1) {	
			i = numWords - words.length;
			sum += widths[i];
			if(sum < projectedBounds.w){
				line.push(words.shift());
			} else if(widths[i] > projectedBounds.w) {
				if(line.length > 0){
					_.trimArray(line);
					lines.push(line.join(""));
					line = [];
				}
				lines.push(words.shift());
				sum = 0;
			
			} else if(sum > projectedBounds.w){
			
				_.trimArray(line);
				lines.push(line.join(""));
			
				line = [];
				sum = 0;
			}
		
			if(words.length == 0){ // add the last word
				if(line.length > 0){ 
					_.trimArray(line);
					lines.push(line.join(""));
					// this might be where we get the duplicate line
				}
			}
		}
	
		for(var i = 0; i < lines.length; i++){
			lines = utils.normalizeTextLines(origin, lines, projectedBounds.w);
		}
		
		var clonePrefix = "cloned-text-";
		//this.cleanUpContainingComp(layer, clonePrefix);
	
		layers = [];
		for(i in lines) {
			layers.push(origin.clone().setText(lines[i]));
			layers[i].name = clonePrefix + origin.name + "-" + i;
		}

		return layers;
	};
	
	this.getProjectedHeight = function() {			
		return layers.length * offset
	};
	
	/*
	** Returns the viewport dimensions of the longest line
	*/
	this.getProjectedWidth = function() {	
		var width = 0;
		var linewidth = 0;
		if(layers.length > 0) {			
			for(i in layers) {
				linewidth = layers[i].d3.getProjectedSize().w;

				if(linewidth > width) {
					width = linewidth;
				}
			}
		}
		return width
	};
	
	__construct();
};

utils.normalizeTextLines = function(layer, lines, projectedMaxWidth) {
	var widths = [];
	var lineWords = [];
	
	for(i in lines){
		widths.push(layer.d3.getProjectedTextSize(lines[i]).w);
		lineWords.push(utils.splitText(lines[i]));
	}
	
	for(j in lines){
		
		var width = widths[j];
		var space = projectedMaxWidth - width;
		
		var prevLine = "";
		if(j>0) {
			prevLine = lineWords[j-1];
			var lastWordInPrevLine = prevLine[prevLine.length - 1];
			var wordWidth = layer.d3.getProjectedTextSize(lastWordInPrevLine).w;
				if(wordWidth < space && widths[j-1] > widths[j]){
					
					if(widths[j-1]-wordWidth < wordWidth+widths[j] && j == 1) {
						//debug.log("WORD MOVED: "+lastWordInPrevLine +" | from line: "+prevLine.join(""));
						var word = lineWords[j-1].pop();
						if(word.substring(word.length-1,word.length) != "-"){
							word += " "
						}
						if(word == "-"){
							word += " ";
						}
						lineWords[j].unshift(word);
					} else if(widths[j-1]-wordWidth > wordWidth+widths[j]) {
						//debug.log("WORD MOVED: "+lastWordInPrevLine +" | from line: "+prevLine.join(""));
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
	
	lines = [];
	for(k in lineWords){
		lines.push(lineWords[k].join(""));
	}
	
	return lines;
};

// formatting functions
utils.getLineHeight = function(textLayer, lineHeight) {
	return textLayer.property("Source Text").value.fontSize*lineHeight;
};
utils.getFontSize = function(textLayer) {
	return textLayer.property("Source Text").value.fontSize;
};
utils.trimArray = function(array, deleteValue) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] == deleteValue) {         
			array.splice(i, 1);
			i--;
		}
	}
	return array;
};

utils.stripNewlines = function(str){
	return str.replace(/\s*\/\/\s*/, ' ');
};

utils.splitText = function(str) {
	var splitArray = [];
	str = str.replace(/\/\//g,' // ');
	var spaceArr = str.split(/[ ]/);
	for(i in spaceArr){
		if(i<spaceArr.length-1){
	  	spaceArr[i] = spaceArr[i] + " ";
	  }

	  var dashArr = spaceArr[i].split(/[-]/);
    if(dashArr.length > 1){
      for(j in dashArr){
        if(j<dashArr.length-1) {
          dashArr[j] = dashArr[j] + "-";
          splitArray.push(dashArr[j]);
        } else {
          splitArray.push(dashArr[j]);
        }
      }
    } else {
      splitArray.push(spaceArr[i]);
    }

	}
	return splitArray;	
};


}