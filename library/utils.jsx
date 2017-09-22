
	var utils = new Object();
	var _ = utils; // shorthand

	utils.importProject = function(path) {
		var projectFile = File(path);
		var io = new ImportOptions(projectFile);
		if (io.canImportAs(ImportAsType.PROJECT)){
			io.importAs = ImportAsType.PROJECT;
			io.file = projectFile;
			app.project.importFile(io);

			return true;
		} else {
			return false;
		}
	};

  utils.importFootage = function(path) {
    var file = File(path);
    var io = new ImportOptions(file);
    if (io.canImportAs(ImportAsType.FOOTAGE)) {
      io.importAs = ImportAsType.FOOTAGE;
      io.file = file;
      return  _.getItem(app.project.importFile(io).name);
    }
    return false;
  };

    // randomInt()
	//
	// Description:
	//   Gets a random integer between two values.
	//
	// Parameters:
	//   min - The minimum value of the random number.
	//   max - The maximum value of the random number.
	//
	// Returns:
	//   A random integer in the specified range.
	//
	function rI(min, max) { return randomInt(min, max); }
	function randomInt(min, max) {
		logger.warning("All random methods in jsx will be deprecated. Randomization should be moved to frontend.");		
		return Math.floor(Math.random()*((max+1)-min)+min); // TODO: use new method generateRandomNumber() Math.random() has errors when CPU threading
	};

	// convert time string to seconds
	function parseTime(str){
		// http://docs.aenhancers.com/globals/#currentformattotime
		// make sure current timecode format in project settings is not set to frames
		var n = Number(currentFormatToTime(str, 25, false));		
		return n;
	};


	// makeStruct(names)
	//
	// Description:
	// This function creates a closure that
	// can be used to instantiate class-like
	// data structures.
	//
	// Parameters:
	//   names - A string containing space-delimited
	//           properties of the object.
	//	 setup - A function to be called when a new object is created.
	//
	// Returns:
	//   An object constructor.
	//
	utils.makeStruct = function(names) {
	  var names = names.split(' ');
	  var count = names.length;
	  function constructor() {
	    for (var i = 0; i < count; i++) {
	      this[names[i]] = arguments[i];
	    }
	  }
	  return constructor;
	};

    /*DEPRECATE*/
	utils.loadParams = function() {
      logger.warning("utils.loadParams function will be DEPRECATED");
	  return SubsParams.params;
	};

	utils.getStringParam = function(str, num){
		if(num !== undefined) str = str +"-"+num;		
		return SubsParams.params[str];
	}
	utils.getBoolParam = function(str, num){
		var val = utils.getStringParam(str,num);
		if(!val) return false;
		switch (val.toLowerCase()) {
			case "true":
			case "1":
				return true;
		}
		return false;
	};

	utils.getTimeParam = function(str,num){
		var val = utils.getStringParam(str,num);
		if(!val){
			return false;
		}
		return parseTime(val);
	};

	utils.getNumberParam = function(str,num){
		var val = utils.getStringParam(str,num);
		if(val === undefined){
			return undefined;
		}
		return parseFloat(val);
	};

	utils.getClipsParams = function(){
			return SubsParams.clips;
	};

	utils.getFootageParam = function(number){
		var footage = utils.getClipsParams();
		for(var i=0;i<footage.length;i++){
			if(footage[i].name.toUpperCase() == '{FOOTAGE-'+number+'}'){
				return footage[i].substitute;
			}
		}
	};

	utils.getSpeakParam = function(number){
		var footage = utils.getClipsParams();
		for(var i=0;i<footage.length;i++){
			if(footage[i].name.toUpperCase() == '{SPEAK-'+number+'}'){
				return footage[i].substitute;
			}
		}
	};


	/*
	** Initiate the stage composition. Disables all parameter layers
	** then resets and enables the stage.
	*/
	utils.stage = function() {
        logger.warning("utils.stage function will be DEPRECATED, setup your stage/main composition explicitly in your project");
        
		mainComp.disableAll();
		var stage = this.getComp("stage");
		stage.clear();
		var stageLayer = mainComp.getLayer("stage");

    	if(stageLayer){
      		stageLayer.enable();
      		stageLayer.moveToBeginning();
		}
    	stage.openInViewer();

    	return stage;
	};

	/*
	** Set duration of the main composition.
	*/
	// DEPRECATE - too specific for framework
	utils.setDuration = function(time) {
        logger.warning("utils.setDuration function will be DEPRECATED");
		mainComp.duration = time;
	};

	/*
    ** Copy a template composition into a composition.
    * DEPRECATE use addToComp instead
	*/
	utils.copyTemplate = function(templateComp, copyToComp) {
        logger.warning("utils.copyTemplate function will be DEPRECATED");
		return utils.enhanceLayer(copyToComp.layers.add(templateComp));
    };
    
    /*
    ** Add item to a composition and enhance the layer
    */
    utils.addToComp = function(src, targetComp) {
		return utils.enhanceLayer(targetComp.layers.add(src));
	};
 
	
	// todo: new method setOut for layers that sets outPoint and increases duration for source first if neccesarry
    utils.setCompDuration = function(comp, duration, recursive) {
        
        comp.duration = duration;
        if(!recursive) {
        	recursive = false;
		}
        
        layers = comp.getAllLayers();
        for(var i=0; i<layers.length; i++){
    
            var layer = layers[i];
            if(layer.isComp()) {
                if(layer.timeRemapEnabled) {
                    layer.setTimeRemap(duration);
                } else {
                    utils.setCompDuration(layer.getComp(), duration, recursive);
                }
            }
            layer.outPoint = duration;
        }
    };
	
	
    // TODO: change method named - it is poorly named
	utils.expandLayerDuration = function(comp, duration) {
		utils.getComp(comp.name).duration = duration;
		for(var i = 1; i <= comp.numLayers; i++){
			var layer = comp.layer(i);
			if(!layer.locked) layer.outPoint = duration - layer.inPoint;
		}
	};

	// TODO: change syntax to new AEComp("name") or similar
	// getComp()
	//
	// Description:
	// This function localizes the composition in the Project
	//
	// Parameters:
	//   comp - The composition name as a string, or comp as object
	//
	// Returns:
	// CompItem Object.
	//
	utils.getComp = function(comp) // this can be merged with getItem
	{
		var proj = app.project;
		for( var i = 1 ; i <= proj.numItems; i++) {
			var item = proj.item(i);
			if (item == comp || item.name == comp) {
			  if(item instanceof CompItem) {
				  // extend the returned comp with new awesome functions
					item.clone = function(compName)                  	  			{ return utils.cloneComp(item, compName);        }
					item.getLayer = function(layerName)                   			{ return utils.getLayer(item, layerName);        }
					item.layerExists = function(layerName)                   		{ return utils.layerExists(item, layerName);     }
					item.searchLayer = function(str)                      			{ return utils.searchForLayer(item, str);        }
					item.searchLayers = function(str)                      			{ return utils.searchForLayers(item, str);       }
					item.clear = function()                               			{ return utils.clearComp(item);                  }
					item.mute = function()                                			{ return utils.muteCompAndAllNestedLayers(item); }
					item.disableAll = function()                          			{ return utils.disableAllLayers(item);           }
					item.enableAll = function()                           			{ return utils.enableAllLayers(item);            }
					item.getCamera = function()                           			{ return utils.getCamera(item);                  }
					item.setupCamera = function()                         			{ return utils.setupCamera(item);                }
					item.addToComp = function(comp)                       			{ return utils.addToComp(item, comp);         }
					item.getRandomLayer = function()                      			{ return utils.getRandomLayer(item);             }
					item.getAllCompLayers = function()                    			{ return utils.getAllCompLayers(item);           }
					item.getAllLayers = function()                        			{ return utils.getAllLayers(item);               }
					item.moveAllKeys = function(inTime, outTime, offset)  			{ return utils.moveAllKeysOnAllLayers(item, inTime, outTime, offset); }
					item.changeResolution = function(width, height, pixelAspect)	{ return utils.changeCompResolution(item, width, height, pixelAspect);}
					return item;
			  }
			}
		}
		//throw new Error("Item " + compName + " was not found in the project.")
	  return null;
	};

	utils.createComp = function(str){
		return utils.getComp(app.project.items.addComp(str, 1920, 1080, 1, 10, 25));
	};

	//color array [R, G, B] 0-1
	utils.createSolid = function(comp,str, color){
		return comp.getLayer(comp.layers.addSolid(color, str, 1920, 1080, 1, 10).name);
	};

	utils.cloneComp = function(comp, str) {
		var cloneComp = utils.getComp(comp.duplicate());
		if(str !== undefined){
			cloneComp.name = str;
		}
		return cloneComp;
	};

	utils.getItem = function(itemName)
	{
		var proj = app.project;
		for( var i = 1 ; i <= proj.numItems; i++) {
			var item = proj.item(i);
			if (item == itemName || item.name == itemName) {

				// extend the returned comp with new awesome functions
				item.getLayer = function(layerName) {
					return utils.getLayer(this, layerName);
				}
				item.addToComp = function(comp)     { return utils.addToComp(this, comp);  }
				return item;
			}
		}

		throw new Error("Item " + itemName + " was not found in the project.")
	};

	// Composition specific functions
	utils.disableAllLayers = function(comp) {
		for(i=0; i< comp.numLayers;i++) {
			comp.getLayer(comp.layers[i+1].name).disable();
		}
		return comp;
	};

	utils.enableAllLayers = function(comp) {
		for(i=0; i< comp.numLayers;i++) {
			comp.getLayer(comp.layers[i+1].name).enable();
		}
		return comp;
	};

	// remove all layers in a composition
	utils.clearComp = function(comp) {
		for(i=0; i< comp.numLayers;i++) {
			comp.layers[i+1].remove();
		}
		return comp;
	};

	utils.muteCompAndAllNestedLayers = function(comp) {
		var layers = comp.getAllLayers();
		for(var i=0; i<layers.length; i++){
			layers[i].mute();
			if(layers[i].isComp()) utils.muteCompAndAllNestedLayers(layers[i].getComp());
		}
	};

	utils.getLayer = function(comp, layerName) {
	    if(typeof layerName != "string" && typeof layerName != "number") {
		  throw new TypeError("LayerName is not a valid string or integer.")
		}
		var layer = comp.layer(layerName);
		if (!isValid(layer)) {
            return null;
            // throw new Error("Layer " + layerName + " is not valid or was not found. Check that it exists in the composition.");
        }
		return utils.enhanceLayer(layer);
	};

	utils.searchForLayer = function(comp, str) {
		var layers = utils.getAllLayers(comp);
		for(var i=0; i<layers.length; i++){
			if(str instanceof RegExp){
				if(layers[i].name.match(str)) return layers[i];
			} else {
				if(layers[i].name.indexOf(str) !== -1) return layers[i];
			}
		}
	};

	utils.searchForLayers = function(comp, str) {
		var layers = utils.getAllLayers(comp);
		var ret = [];
		for(var i=0; i<layers.length; i++){
			if(str instanceof RegExp){
				if(layers[i].name.match(str)) ret.push(layers[i]);
			} else {
				if(layers[i].name.indexOf(str) !== -1) ret.push(layers[i]);
			}
		}
		return ret;
	};

	utils.layerExists = function(comp, layerName){
		if(typeof layerName != "string" && typeof layerName != "number") {
		  throw new TypeError("LayerName is not a valid string or integer.")
		}
	  try {
		  var layer = comp.layer(layerName);
		  if (isValid(layer)) {
 				return true;
		  }
			return false;
		  return utils.enhanceLayer(layer);
	  } catch (e) {
	    return false;
	  }
	};
	
	// TODO: rename getLayers
	utils.getAllLayers = function(comp) {
	  var layers = [];
	  for(var i=0; i < comp.numLayers; i++) {
	    layers.push(comp.getLayer(comp.layer(i+1).name))
	  }
	  return layers;
	};
    
    // TODO: rename getCompLayers
	utils.getAllCompLayers = function(comp) {
	  var layers = utils.getAllLayers(comp);
	  var compLayers = [];
	  for(var i = 0; i < layers.length; i++) {
	    if(layers[i].isComp()) {
	      compLayers.push(layers[i]);
        }
	  }
	  return compLayers;
	};

    // DEPRECATED
	utils.getRandomLayer = function(comp) {
        logger.warning("All randomization methods in the airlook framework will be deprecated, randomization should be moved to the frontend.");
		return comp.getLayer(rI(1,comp.numLayers));
	};

	utils.setupCamera = function(comp) {
		var camera = comp.getCamera();
		camera.cameraOption.depthOfField.setValueAtTime(0, 0);
		camera.transform.property("Point of Interest").expression = "transform.position;";
		return camera;
	};

	utils.getCamera = function(comp) {
		for(var i = 1; i <= comp.numLayers; i++){
			var layer = comp.getLayer(i);
			if(layer.matchName == "ADBE Camera Layer"){
				return layer;
			}
		}
	};

	utils.changeCompResolution = function(comp, width, height, pixelAspect) {
		// var compName = comp.name+"_"+width+"x"+height;
		var compName = comp.name;
		comp.name = comp.name + "_original";
		var newComp = app.project.items.addComp(compName, width, height, pixelAspect, comp.duration, SETTINGS.FRAMERATE);
		newComp = _.getComp(compName);

		var layer = comp.addToComp(newComp);
		var sX = width/comp.width * 100 * pixelAspect;
		var sY = height/comp.height * 100;
		layer.setKey("scale", [sX,sY], 0);

		return newComp;
	};

	/*
	** Extend a layer with new awesome functions
	*/
	utils.enhanceLayer = function(layer) {

		layer.setText         = function(str)                              			{ return utils.setLayerText(this, str); };
		layer.getText         = function()		                           			{ return utils.getLayerText(this); };
        layer.getFontSize     = function()		                           			{ return utils.getFontSize(this); };
        layer.setFont   	  = function(font)							   			{ return utils.setLayerFont(this, font); };
		layer.setTextColor	  = function(color)							   			{ return utils.setLayerTextColor(this, color); };
		layer.enable          = function()                                 			{ return utils.enableLayer(this); };
		layer.disable         = function()                                 			{ return utils.disableLayer(this); };
		layer.getScale        = function(time)                             			{ return utils.getLayerScale(this, time); };
		layer.setScale        = function(time)                             			{ return utils.setLayerScale(this, time); };
		layer.getWidth        = function(time)                             			{ return utils.getLayerWidth(this, time); }; // will be deprecated
		layer.getHeight       = function(time)                             			{ return utils.getLayerHeight(this, time); }; // will be deprecated
		layer.getSize         = function(time)                             			{ return utils.getLayerSize(this, time); };
		layer.getTextSize     = function(str, time)                        			{ return utils.getTextLayerSize(this, str, time); };
		layer.clone           = function(str)                              			{ return utils.cloneLayer(this, str); };
		layer.cloneComp       = function(str)                              			{ return utils.cloneLayersComp(this, str); };
		//layer.deepClone       = function(str)                            			{ return utils.deepCloneLayer(this, str); };
		layer.scaleToHD       = function(time)                             			{ return utils.scaleLayerToHD(this, time); };
		layer.setTimeRemap    = function(time)                             			{ return utils.setTimeRemap(this, time); };
		layer.setStartTime 	  = function(time)									    { return utils.setStartTime(this, time); };
		layer.setEndTime 	  = function(time)									    { return utils.setEndTime(this, time); };
		layer.addToComp       = function(comp)                             			{ return utils.copyLayerToComp(this, comp); };
		layer.getComp         = function()                                 			{ return utils.getCompFromLayer(this); };
		layer.isComp          = function()                                 			{ return (this.source instanceof CompItem) };
		layer.getMarkerIndex  = function(comment)                          			{ return utils.getLayerMarkerIndexByComment(this, comment) };
		layer.getMarkerTime   = function(comment)                          			{ return utils.getLayerMarkerTimeByComment(this, comment) };
		layer.getMask         = function(name)                             			{ return utils.getMaskByName(this, name); };
		layer.addMask         = function(arr)                              			{ return utils.addMaskToLayer(this, arr); };
		layer.masksToShapes   = function()                                 			{ return utils.rd_MasksToShapes_doIt(this); };
		layer.setPos          = function(arr, time)                        			{ return utils.setLayerPosition(this, arr, time); };
		layer.getPos          = function(time)                             			{ return utils.getLayerPosition(this, time); };
		layer.setAnchor       = function(arr, time)                        			{ return utils.setLayerAnchorPoint(this, arr, time); };
		layer.getAnchor       = function(time)                             			{ return utils.getLayerAnchorPoint(this, time); };
		layer.snapGrid        = function(gx, gy, time)                     			{ return utils.snapLayerToGrid(this, gx, gy, time); };
		layer.getOffset       = function(time)                             			{ return utils.getLayerOffset(this, time); };
		layer.getKey          = function(propStr, index)                   			{ return utils.getKeyframeAtIndex(this, propStr, index); };
		layer.getKeys         = function(propStr)                          			{ return utils.getKeyframes(this, propStr); };
		layer.setKey          = function(propStr, value, time)             			{ return utils.setKeyframeAtTime(this, propStr, value, time); };
		layer.deleteKey       = function(propStr, time)                    			{ return utils.deleteKeyframeAtTime(this, propStr, time); };
		layer.updateKey       = function(propStr, value, index)            			{ return utils.updateKeyframeAtIndex(this, propStr, value, index); };
		layer.offsetAllKeys   = function(prop, offset, preExpression) 	  			{ return utils.offsetAllKeyframesForProp(this, prop, offset, preExpression); };
		layer.offsetKey       = function(prop, index, offset, preExpression) 		{ return utils.offsetKeyframeForProp(layer, prop, index, offset, preExpression); };
		layer.easeKey         = function(prop, value1, value2, index)      			{ return utils.setEaseAtKeyIndex(this, prop, value1, value2, index); };
		layer.selectKeys      = function(inTime, outTime)                  			{ return utils.selectPropKeys(this, inTime, outTime); };
		layer.moveAllKeys	  = function(inTime, outTime, offset)					{ return utils.movePropKeys(this, inTime, outTime, offset); };
		layer.moveKeys        = function(propStr, inTime, outTime, offset) 			{ return utils.movePropKeys(this, propStr, inTime, outTime, offset); };
		layer.mute            = function()                                 			{ return utils.mute(this); };
		layer.unMute          = function()                                 			{ return utils.unMute(this); };
		layer.copyPasteKeys   = function(keyStartTime, keyEndTime, toLayer, offset) { return utils.copyPasteKeys(this, keyStartTime, keyEndTime, toLayer, offset); };

		layer.getMarkerKeyTime = function(comment) {
		  var index = this.getMarkerIndex(comment);
		  if(index) return this.property("Marker").keyTime(index);
		  return null
		};

		layer.fadeSoundOverTime = function(volumeIn, volumeOut, inTime, outTime) {
		  return utils.fadeSoundOverTime(this, volumeIn, volumeOut, inTime, outTime);
		};

		// inline functions for manipulating the layers position
		layer.setSize = function(dimensions, time) {
			return utils.setLayerSize(layer, dimensions, time);
		};

		layer.pos = {
			set: function(vector, time) {
					return utils.setLayerPos(layer, vector, time);
				},
			get: function(time) {
					return utils.getLayerPos(layer, time);
				},
			setX: function(x, time) { this.set(new Vec3(x,           this.getY(), this.getZ()), time); },
			setY: function(y, time) { this.set(new Vec3(this.getX(), y,           this.getZ()), time); },
			setZ: function(z, time) { this.set(new Vec3(this.getX(), this.getY(), z),           time); },

			getX: function(time)    { return this.get(time).x; },
			getY: function(time)    { return this.get(time).y; },
			getZ: function(time)    { return this.get(time).z; },

			getLowerLeft:  function(time) {return utils.getLayerCorners(layer, time)[0]; },
			getUpperRight: function(time) {return utils.getLayerCorners(layer, time)[1]; },
		};

		if(d3) d3.enhanceLayer(layer);

		return layer;
	};

	utils.offsetKeyframeForProp = function(layer, prop, index, offset, preExpression) {
		if(preExpression == undefined) preExpression = false;
		var t = 0;
		if(prop.numKeys != 0){
			t = prop.keyTime(index);
		}

		var val = prop.valueAtTime(t, preExpression);
		if(prop.propertyValueType == PropertyValueType.TwoD_SPATIAL || prop.propertyValueType == PropertyValueType.TwoD) {
			var newVal = [];
			for(var j=0; j<2; j++){
				if(offset[j] != undefined){
					newVal.push(val[j]+offset[j]);
				} else {
					newVal.push(val[j]);
				}
			}
			prop.setValueAtTime(t, newVal);
		} else if(prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL || prop.propertyValueType == PropertyValueType.ThreeD) {
			var newVal = [];
			for(var j=0; j<3; j++){
				if(offset[j] != undefined){
					newVal.push(val[j]+offset[j]);
				} else {
					newVal.push(val[j]);
				}
			}
			prop.setValueAtTime(t, newVal);
		} else {
			prop.setValueAtTime(t, val+offset);
		}
		return prop;
	};

	utils.offsetAllKeyframesForProp = function(layer, prop, offset, preExpression) {
		if(preExpression == undefined) preExpression = false;

		for(var i=1; i<= prop.numKeys; i++){
			utils.offsetKeyframeForProp(layer, prop, i, offset, preExpression);
		}
	};

	// Layer specific functions


	utils.mute = function(layer) {
		layer.audioEnabled = false;
		return layer;
	};
	utils.unMute = function(layer) {
		layer.audioEnabled = true;
		return layer;
	};

	utils.getCompFromLayer = function(layer) {
		return utils.getComp(layer.source.name);
	};

	utils.copyLayerToComp = function(layer, comp) {

		return layer.getComp().addToComp(comp);

	};

	utils.setLayerSize = function(layer, dimensions, time) {
		if(!time)	time = 0;

		var position = new Vec3(layer.transform.position.value[0],
								layer.transform.position.value[1],
								layer.transform.position.value[2]);

		var transform = layer.calculateTransformFromPoints([position.x, position.y, position.z],
														[position.x+dimensions.w, position.y, position.z],
														[position.x+dimensions.w, position.y+dimensions.h, position.z]);

		for(var selector in transform) {
			layer.transform[selector].setValueAtTime(time, transform[selector]);
		}

		// this needs to use the transform object
		return layer;
	};

	utils.setLayerPos = function(layer, vec, time) {
		if(!time)	time = 0;
		layer.Transform.Position.setValueAtTime(time, [vec.x,vec.y,vec.z]);
		return layer;
	};

	utils.getLayerPos = function(layer, time) {
		if(!time)	time = 0;

		var pos = layer.Transform.Position.valueAtTime(time, false)
		return new Vec3(pos[0], pos[1], pos[2]);
	};

	utils.setLayerText = function(layer, str) {
		if(typeof layer !== "function"){
			if(str == undefined || typeof str !== "string") str = "";
			layer.text.sourceText.setValue(str);
			return layer;
		}
//		alert(layer);
//		alert(str);
	};

    //utils.setTextProperty = function()

    utils.setLayerTextProperty = function(layer, property, value){
        try{
			var textProp = layer.property("Source Text");
			var textDocument = textProp.value;
			textDocument[property] = value;
			textProp.setValue(textDocument);
		} catch(e){
			logger.warning("Could not set font of layer "+e);
		}
		return layer;
    };

    utils.setLayerFont = function(layer, font){
        return utils.setLayerTextProperty(layer, "font", font);
    };

	utils.setLayerTextColor = function(layer, color){
        return sutils.etLayerTextProperty(layer, "fillColor", color);
	};

	/* POSITION FUNCTIONS wOut vectors */
	utils.setLayerPosition = function(layer, pos, time) {
		if(!time)	time = 0;
		layer.Transform.Position.setValueAtTime(time, pos);
		return layer;
	};

	utils.getLayerPosition = function(layer, time) {
		if(!time)	time = 0;
		var pos = layer.Transform.Position.valueAtTime(time, false)
		return pos;
	};

	utils.setLayerAnchorPoint = function(layer, pos, time) {
		if(!time)	time = 0;
		layer.Transform.anchorPoint.setValueAtTime(time, pos);
		return layer;
	};

	utils.getLayerAnchorPoint = function(layer, time) {
		if(!time)	time = 0;
		var anchor = layer.Transform.anchorPoint.valueAtTime(time, false)
		return anchor;
	};

	utils.getClosetGridPoint = function(pos, gX, gY, time) {
		if(!time)	time = 0;
		var mX = Math.round(pos[0]/gX) * gX;
		var mY = Math.round(pos[1]/gY) * gY;
		return [mX, mY];
	};

	utils.snapLayerToGrid = function(layer, gX, gY, time) {
		if(!time)	time = 0;
		var pos = layer.getPos(time);
		var gridPos = utils.getClosetGridPoint(pos, gX, gY, time);
		layer.setPos(gridPos, time);
		return layer;
	};

	utils.getLayerOffset = function(layer, time) {
		if(!time)	time = 0;
		var offsetX = layer.getAnchor(time)[0] - layer.getPos(time)[0];
		var offsetY = layer.getAnchor(time)[1] - layer.getPos(time)[1];
		return [offsetX, offsetY];
	};

	utils.findClosestPoint = function(p, vertices) {
		var distArray = [];
		for(var i = 0; i < vertices.length; i++) {
			distArray.push([_.lineDistance(vertices[i], p), i, vertices[i]])

		}
		var sortArray  = distArray.sort(function(a,b) { return (a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0)); });
		return sortArray;
	};

	/* POSITIONS FUNCTIONS END */

	utils.getLayerText = function(layer, time) {
		if(!time)	time = 0;
		try {
		  return layer.text.sourceText.valueAtTime(time, false).toString();
	  } catch (e) {
	    return ""
	  }
	};

	utils.enableLayer = function(layer) {
		layer.enabled = true;
		return layer;
	};

	utils.disableLayer = function(layer) {
		layer.enabled = false;
		return layer;
	};

	utils.getLayerSize = function(layer, time) {
	  if(!time)	time = 0;
	  return new Size(layer.getWidth(time), layer.getHeight(time));
	};

	utils.getLayerScale = function(layer, time) {
	  if(!time) time = 0;
	  return layer.scale.valueAtTime(time, false)
	};

	utils.setLayerScale = function(layer, value, time) {
	  if(!time) time = 0;
	  return layer.scale.setValueAtTime(time, value)
	};

	utils.getLayerWidth = function(layer, time) {
		if(!time)	time = 0;
		return layer.sourceRectAtTime(time, false).width * Math.abs(layer.getScale(time)[0])/100;
	};

	utils.getLayerHeight = function(layer, time) {
		if(!time)	time = 0;
		return layer.sourceRectAtTime(time, false).height * Math.abs(layer.getScale(time)[1])/100;
	};


	utils.scaleLayerToHD = function(layer, time)
	{
		if(!time)       time = 0;
		var width = layer.width;
		var height = layer.height;
		var duration = layer.source.duration;

		var prop = layer.property("scale");
		if(duration == 0) {
			var sH = Math.ceil(100 * 1080/height);
			var sW = Math.ceil(100 * 1920/width);
			prop.setValueAtTime(layer.startTime, [sW, sH, 100]);
		} else {
			if(height != 1080){
				var s = Math.ceil(100 * 1080/height);
				prop.setValueAtTime(layer.startTime, [s, s, 100]);
			}
		}

		return layer;
	};

	utils.setTimeRemap = function(layer, time) {
		if(!time)	time = 10000;
		if(layer.canSetTimeRemapEnabled){
			layer.timeRemapEnabled = true;
			layer.outPoint = time;
		}
		return layer;
	};

	utils.setStartTime = function(layer, time){
		if(layer.isComp()){
			layer.startTime = time;
		} else {
			layer.startTime = time + layer.startTime-layer.inPoint;
		}
		return layer;
	};

	utils.setEndTime = function(layer, time){
		if(layer.isComp()){
			layer.startTime = time - (layer.outPoint - layer.startTime);
		} else {
			layer.startTime = time + layer.startTime-layer.inPoint  - (layer.outPoint - layer.inPoint);
		}
		return layer;
	};

	utils.getKeyframeAtIndex = function(layer, propertyStr, index) {
		if(!index)	index = 1;
		var prop = layer.property(propertyStr);
		var keyTime = prop.keyTime(index);
		return prop.valueAtTime(keyTime, false);
	};

	utils.getKeyframes = function(layer, propertyStr) {

		var prop = layer.property(propertyStr);
		var keys = [];
		for(var i=1; i<=prop.numKeys; i++) {
			var value   = prop.valueAtTime(prop.keyTime(i), false);
			keys.push([prop.keyTime(i), value]);
		}
		return keys;
	};

	utils.setKeyframeAtTime = function(layer, propertyStr, value, time) {
		if(!time)	time = 0;
		var prop = layer.property(propertyStr);
		prop.setValueAtTime(time, value);
		return layer;
	};

	utils.deleteKeyframeAtTime = function(layer, propertyStr, time) {
		if(!time)	time = 0;
		var prop = layer.property(propertyStr);
		prop.removeKey(prop.nearestKeyIndex(time));
		return layer;
	};

	utils.updateKeyframeAtIndex = function(layer, propertyStr, value, index) {
		if(!index)	index = 1;
		var prop = layer.property(propertyStr);
		prop.setValueAtKey(index, value);
		return layer;
	};

	utils.setEaseAtKeyIndex = function(layer, propertyStr, value1, value2, index) {
		if(!index)	index = 1;
		var prop = layer.property(propertyStr);

		var easeIn = [];
		var easeOut = [];

		for(var i = 0; i < value1.length; i++) {
			var easeInObj = new KeyframeEase(value1[i][0], value1[i][1]);
			easeIn.push(easeInObj);
			var easeOutObj = new KeyframeEase(value2[i][0], value2[i][1]);
			easeOut.push(easeOutObj);
		}
		prop.setTemporalEaseAtKey(index, easeIn, easeOut);
		return layer;
	};

	/*
	** Return the lowerLeft and upperRight of a flat plane in 3D space
	*/
	utils.getLayerCorners = function(layer, time) {
		if(!time)	time = 0;

		var scale = layer.scale.valueAtTime(time, false);
		var rect = layer.sourceRectAtTime(0, false);

		var lowerLeft  = new Vec3(
			layer.pos.getX(time) + rect.left* Math.abs(scale[0])/100,
			layer.pos.getY(time) + layer.getHeight(time) + rect.top*Math.abs(scale[0])/100,
			layer.pos.getZ(time),
		);
		var upperRight = new Vec3(
			layer.pos.getX(time) + rect.left*Math.abs(scale[0])/100 + layer.getWidth(time),
		  layer.pos.getY(time) + rect.top*Math.abs(scale[0])/100,
			layer.pos.getZ(time),
		);

		return [lowerLeft, upperRight]
	};

	utils.cloneLayer = function(layer, str) {
		var clone = utils.enhanceLayer(layer.duplicate());
		if(str){
			clone.name = str;
		}
		return clone;
	};

	utils.cloneLayersComp = function(layer, str) {
		var origComp = layer.getComp();
		var cloneComp = utils.getComp(origComp.duplicate());

		if(str !== undefined){
			cloneComp.name = str;
		}

		layer.replaceSource(cloneComp,false);
		return layer;
	};

	/*utils.deepCloneLayer = function(layer, str){
		debug.log("Clone layer "+layer.name);
		var clone = utils.enhanceLayer(layer.duplicate());
		utils.deepCloneComp(clone.getComp());
		if(str){
			clone.name = str;
		}
		return clone;
	}

	utils.deepCloneComp = function(comp, str){
		debug.log("Clone comp "+comp.name);
		var clone = utils.getComp(comp.duplicate());

		var layers = clone.getAllLayers();
		for(var i=0; i<layers.length; i++){
			if(layers[i].isComp()) {
				utils.deepCloneLayer(layers[i]);
			}
			else {
				utils.cloneLayer(layers[i]);
			}
			debug.log(i + ": "+ layers[i].name);
		}

		return clone;
	}
	**/
	/*
	** Gets the width current layer would have if containing given string
	*/
	utils.getTextLayerSize = function(layer, str, time) {
	  if(!time)	time = 0;
		var text = layer.clone();
    text.setText(str);
		var w = text.getWidth(time);
		var h = text.getHeight(time);
		text.remove();
		return new Size(w, h);
	};

	utils.cleanUpContainingComp = function(layer, prefix) {
		var comp = layer.containingComp;
		var removeLayers = [];
		for(var i = 1; i < comp.numLayers; i++){
			var l = comp.layer(i);
			if(l.name.indexOf(prefix) !== -1){
				removeLayers.push(l);
			}
		}
		for(var i = 0; i < removeLayers.length; i++) {
			removeLayers[i].remove();
		}
	};


	utils.getLayerMarkerIndexByComment = function(layer, comment)
  {
    try{
      	var markers = layer.property("Marker");
		  var numMarkers = markers.numKeys;
		  for(var i = 1; i <= numMarkers; i++){
  			if(markers.keyValue(i).comment.toString()){
					//alert("|"+markers.keyValue(i).comment.toString()+"|");
  				if(markers.keyValue(i).comment.toString().indexOf(comment) !== -1){
  					return i;
  				}
  			}
  		};
		} catch(exception) {
  		return null;
  	}
  };


	utils.getLayerMarkerTimeByComment = function(layer, comment)
  {
    try{
			var index = layer.getMarkerIndex(comment);
      var markers = layer.property("Marker");
			var time = markers.keyTime(index);
			return time
		} catch(exception) {
  		return null;
  	}
  };

	utils.getMaskByName = function(layer, str) {
		if(!str)	str = 1;

		var masksGroup = layer.property("ADBE Mask Parade");
		var mask;
		if(masksGroup.property(str)){
			mask = utils.enhanceMask(masksGroup.property(str));
		} else {
			mask = undefined;
		}

		return mask;
	};

	utils.addMaskToLayer = function(layer, arr) {
		mask = layer.Masks.addProperty("Mask");
		maskShape = mask.property("maskShape");
		shape = maskShape.value;
		shape.vertices = arr;
		shape.closed = true;
		maskShape.setValue(shape);
		return layer;
	};

	/*
	** Extend a mask with new awesome functions
	*/
	utils.enhanceMask  = function(mask) {
		//mask.anchor = [0,0]
		mask.getAnchor   = function()    { return utils.getMaskAnchor(this); };
		mask.setAnchor   = function(arr) { return utils.setMaskAnchor(this, arr); };
		mask.getPath     = function()    { return utils.getMaskPath(this); };
		mask.getVertices = function()    { return utils.getMaskVertices(this); };
		mask.setVertices = function(arr) { return utils.setMaskVertices(this, arr); };
		mask.getWidth    = function()    { return utils.getMaskWidth(this); };
		mask.setWidth    = function(w)   { return utils.setMaskWidth(this,w); };
		mask.getHeight   = function()    { return utils.getMaskHeight(this); };
		mask.getMinX     = function()    { return utils.getMaskMinX(this); };
		mask.getMaxX     = function()    { return utils.getMaskMaxX(this); };
		mask.getMinY     = function()    { return utils.getMaskMinY(this); };
		mask.getMaxY     = function()    { return utils.getMaskMaxY(this); };
		mask.setPos      = function(arr) { return utils.setMaskPosition(this, arr); };
		mask.getPos      = function()    { return utils.getMaskPosition(this); };
		mask.offset      = function(arr) { return utils.offsetMaskPosition(this, arr); };
		mask.getAvrPoint = function()    { return utils.getMaskPathAveragePoint(this); };
		mask.setDirection= function(str) { return utils.setMaskVerticesDirection(this, str); };
		mask.debugPairs  = function()    { return utils.roundMaskVerticesPairs(this); };
		return mask;
	};

	utils.getMaskAnchor = function(mask) {
		return mask.anchor;
	};

	utils.setMaskAnchor = function(mask, pos) {
		mask.anchor = pos;
		return mask;
	};

	utils.setMaskVerticesDirection = function(mask, str) {

		var a = mask.getAvrPoint();
		var maskPath = mask.getVertices();
		var angle1_A = _.calcAngle(maskPath[0],a);
		var angle1_2 = _.calcAngle(maskPath[0],maskPath[1]);
		var angleSum = angle1_A - angle1_2;
		//debug.log("SUM: "+angleSum+"\n");
		mask.debugPairs();
		if(angleSum > 0){
			logger.debug("CONCLUSION: PATH IS CW");

			if(str == "CCW") {
				mask.setVertices(maskPath.reverse());
				logger.debug(" - should be CCW; reverse the current path");
				mask.debugPairs();
			}

		} else {
			logger.debug("CONCLUSION: PATH IS CCW");

			if(str == "CW") {
				mask.setVertices(maskPath.reverse());
				logger.debug(" - should be CW; reverse the current path");
				mask.debugPairs();
			}
		}

		return mask;
	};

	utils.getMaskPath = function(mask) {
		var path = mask.property("ADBE Mask Shape");
		return path;
	};

	utils.getMaskVertices = function(mask) {
		return mask.getPath().value.vertices;
	};

	utils.setMaskVertices = function(mask, newVerts) {
		var newPath = mask.getPath().value;
		newPath.vertices = newVerts;
		mask.getPath().setValue(newPath);
		return mask;
	};

	utils.getMaskWidth = function(mask) {
		var verts    = mask.getVertices();
		var sortedX  = verts.sort(function(a,b) { return (a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0)); });
		var minX     = sortedX[0][0];
		var maxX     = sortedX[sortedX.length-1][0];
		return maxX - minX;
	};

	// this is not done!
	utils.setMaskWidth = function(mask, w) {
		var verts    = mask.getVertices();
		var sortedX  = verts.sort(function(a,b) { return (a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0)); });
		var left1    = sortedX[0];
		var left2    = sortedX[1];
		var right1   = sortedX[sortedX.length-2];
		var right2   = sortedX[sortedX.length-1];

		// TOP-LEFT = 0, TOP-RIGHT = 1, BOTTOM-RIGHT = 2, BOTTOM-LEFT = 3;

		if(left1[1] > left2[1]) {

		}

		return maxX - minX;
	};

	utils.getMaskPathAveragePoint = function(mask) {
		var verts    = mask.getVertices();
		var ySum = 0;
		var xSum = 0;
		for(var i = 0; i < verts.length; i++){
			xSum += verts[i][0]
			ySum += verts[i][1]
		}
		return [xSum/verts.length, ySum/verts.length];
	};

	utils.getMaskHeight = function(mask) {
		var minY     = mask.getMinY();
		var maxY     = mask.getMaxY();
		return maxY - minY;
	};

	utils.getMaskMinX = function(mask) {
		var verts = mask.getVertices();
		var sortedX  = verts.sort(function(a,b) { return (a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0)); });
		return sortedX[0][0];
	};

	utils.getMaskMaxX = function(mask) {
		var verts = mask.getVertices();
		var sortedX  = verts.sort(function(a,b) { return (a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0)); });
		sortedX = sortedX.reverse()
		return sortedX[0][0];
	};

	utils.getMaskMinY = function(mask) {
		var verts   = mask.getVertices();
		var sortedY = verts.sort(function(a,b) { return (a[1] < b[1] ? -1 : (a[1] > b[1] ? 1 : 0)); });
		return sortedY[0][1];
	};

	utils.getMaskMaxY = function(mask) {
		var verts   = mask.getVertices();
		var sortedY = verts.sort(function(a,b) { return (a[1] < b[1] ? -1 : (a[1] > b[1] ? 1 : 0)); });
		sortedY = sortedY.reverse();
		return sortedY[0][1];
	};

	utils.setMaskPosition = function(mask, pos) {
		var verts = mask.getVertices();
		var offsetX = mask.getMinX() - pos[0] - mask.anchor[0];
		var offsetY = mask.getMinY() - pos[1] - mask.anchor[1];
		var newVerts = [];
		for(var i = 0; i < verts.length; i++){
			var v = verts[i];
			newVerts.push([[v[0]-offsetX],[v[1]-offsetY]])
		}
		return mask.setVertices(newVerts);
	};

	utils.getMaskPosition = function(mask) {
		var x = mask.getMinX() + mask.anchor[0];
		var y = mask.getMinY() + mask.anchor[1];
		return [x,y];
	};

	utils.offsetMaskPosition = function(mask, offset) {
		var verts = mask.getVertices();
		var newVerts = [];
		for(var i = 0; i < verts.length; i++){
			var v = verts[i];
			newVerts.push([[v[0]+offset[0]],[v[1]+offset[1]]])
		}
		return mask.setVertices(newVerts);
	};

	utils.roundMaskVerticesPairs = function(mask) {
		var verts = mask.getVertices();
		debug.log("Rounded vertices for mask: "+mask.name)
		for(var i = 0; i < verts.length; i++){
			var v = verts[i];
			logger.debug(i+": "+Math.round(v[0])+", "+Math.round(v[1]));
		}
		logger.debug("\n")
	};

	utils.fadeSoundOverTime = function(layer, volumeIn, volumeOut, inTime, outTime)
	{
		logger.debug("FADE SOUND\n"+layer.name+"\nVol: "+volumeIn+" -> "+volumeOut+"\nTime: "+inTime+" -> "+outTime);

		try{
			layer.property("Audio Levels").setValueAtTime(inTime, [volumeIn, volumeIn]);
			layer.property("Audio Levels").setValueAtTime(outTime, [volumeOut, volumeOut]);

		} catch (exception){
			logger.debug('DR ERROR | fadeSoundOverTime | Could not fade audio for: '+layer.name+' - exception ' + exception.toString());
		}

		return layer;
	};


	// Find least common denominator for all numbers in array
	//+ Jonas Raoni Soares Silva
  // http://jsfromhell.com/math/mmc [rev. #1]
  var mmc = function(o) {
      for(var i, j, n, d, r = 1; (n = o.pop()) != undefined;)
          while(n > 1){
              if(n % 2){
                  for (i = 3, j = Math.floor(Math.sqrt(n)); i <= j && n % i; i += 2);
                  d = i <= j ? i : n;
              }
              else
                  d = 2;
              for(n /= d, r *= d, i = o.length; i; !(o[--i] % d) && (o[i] /= d) == 1 && o.splice(i, 1));
          }
      return r;
  };

	/*
	** Weighted random
	*/

	// 
	function wRand(data) {
		logger.warning("All random methods in jsx will be deprecated. Randomization should be moved to frontend.");
	    var _rand, _lcd;
	    var _weights = [];
	    var _select = [];

	    for (var i = 0; i < data.length; i++) {
        _weights.push[Math.ceil(data[i][1])]
      }
	    _lcd = mmc(_weights);

	    // cycle through the data and populate _select
	    for (var i = 0; i < data.length; i++) {
	        // add each item weight times
	        for (var j = 0; j < Math.ceil(data[i][1])/_lcd; j++) {
	            _select.push(data[i][0]);
	        }
	    }
			if (!_select.length) return null;
			// randomly pick one
	    _rand = Math.floor(Math.random() * _select.length);
	    return _select[_rand];
	};

	/*
	** Get a random position outside the viewport in 0, 90, 180 or 270 degrees from a vector point
	*/

	utils.randomPos = function(vector, layer) {
		logger.warning("All random methods in jsx will be deprecated. Randomization should be moved to frontend.");
		
		var compW  = layer.containingComp.width;
		var compH  = layer.containingComp.height;
		var offset = 20;

		var w = layer.getWidth();
		var h = layer.getHeight();

		var x, y;

		var r = rI(0,3);

		if(r == 0){ // op
			x = vector.x;
			y = -h - offset;

		} else if (r == 1){ // ned
			x = vector.x;
			y = compH + offset;

		} else if (r == 2){ // højre
			x = compW + offset;
			y = vector.y;

		} else if (r == 3){ // venstre
			x = -w - offset;
			y = vector.y;

		}

		return new Vec3(x,y,0);
	};

	//var testWeightedRandomData = [["A",3],["B",2],["c",10]];
	//alert(wRand(testWeightedRandomData));

	// rd_MasksToShapes_doIt()
	//
	// Description:
	// This callback function performs the main operation.
	//
	// Parameters:
	// None.
	//
	// Returns:
	// Nothing
	//
	utils.rd_MasksToShapes_doIt = function(masksLayer) {
		var masksGroup = masksLayer.property("ADBE Mask Parade");

		// Create an empty shape layer
		var suffix = " Shapes";
		var shapeLayer = masksLayer.containingComp.layers.addShape();
		shapeLayer.name =  masksLayer.name.substr(0,31-suffix.length) + suffix;
		shapeLayer.moveBefore(masksLayer);

		var shapeLayerContents = shapeLayer.property("ADBE Root Vectors Group");
		var shapeGroup = shapeLayerContents; //.addProperty("ADBE Vector Group");
		//shapeGroup.name = "Masks";
		var shapePathGroup, shapePath, shapePathData;

		// Get the mask layer's pixel aspect; if layer has no source, use comp's pixel aspect
		var pixelAspect = (masksLayer.source != null) ? masksLayer.source.pixelAspect : 1.0; //comp.pixelAspect;

		// Iterate over the masks layer's masks, converting their paths to shape paths
		var mask, maskPath, vertices;
		for (var m=1; m<=masksGroup.numProperties; m++)
		{
			// Get mask info
			mask = masksGroup.property(m);
			maskPath = mask.property("ADBE Mask Shape");

			// Create new shape path using mask info
			shapePathGroup = shapeGroup.addProperty("ADBE Vector Shape - Group");
			shapePathGroup.name = mask.name;
			shapePath = shapePathGroup.property("ADBE Vector Shape");

			shapePathData = new Shape();

			// ...adjust mask vertices (x axis) by pixel aspect
			vertices = new Array();
			for (var v=0; v<maskPath.value.vertices.length; v++)
				vertices[vertices.length] = [maskPath.value.vertices[v][0] * pixelAspect, maskPath.value.vertices[v][1]];
			shapePathData.vertices = vertices;

			shapePathData.inTangents = maskPath.value.inTangents;
			shapePathData.outTangents = maskPath.value.outTangents;
			shapePathData.closed = maskPath.value.closed;
			shapePath.setValue(shapePathData);
		}

		// Match the mask layer's transforms
		shapeLayer.transform.anchorPoint.setValue(masksLayer.transform.anchorPoint.value);
		shapeLayer.transform.position.setValue(masksLayer.transform.position.value);
		shapeLayer.transform.scale.setValue(masksLayer.transform.scale.value);
		if (masksLayer.threeDLayer)
		{
			shapeLayer.threeDLayer = true;
			shapeLayer.transform.xRotation.setValue(masksLayer.transform.xRotation.value);
			shapeLayer.transform.yRotation.setValue(masksLayer.transform.yRotation.value);
			shapeLayer.transform.zRotation.setValue(masksLayer.transform.zRotation.value);
			shapeLayer.transform.orientation.setValue(masksLayer.transform.orientation.value);
		}
		else
		{
			shapeLayer.transform.rotation.setValue(masksLayer.transform.rotation.value);
		}
		shapeLayer.transform.opacity.setValue(masksLayer.transform.opacity.value);

		// Mute the mask layer
		masksLayer.enabled = false;

		return masksLayer;

	};



	/* MATH */

	utils.lineDistance = function( point1, point2 ) {
	  var xs = 0;
	  var ys = 0;

	  xs = point2[0] - point1[0];
	  xs = xs * xs;
		ys = point2[1] - point1[1];
	  ys = ys * ys;

	  return Math.sqrt( xs + ys );
	};

	utils.calcAngle = function(p1, p2) {
		var x1, x2, y1, y2, deltaY, deltaX;
		x1 = p1[0];
		y1 = p1[1];
		x2 = p2[0];
		y2 = p2[1];

		deltaY = y2 - y1;
		deltaX = x2 - x1;

		angleInDegrees = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

		if(angleInDegrees<0) + 360;

		return angleInDegrees;
	};

	utils.dynamicSort = function(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1, property.length - 1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
	}

