{
	/*
	** MANIPULATING KEYFRAMES
	*/
	
	utils.moveAllKeysOnAllLayers = function(comp, inTime, outTime, offset) {
		if(offset!=0){
			var layers = comp.getAllLayers();
			for(var i = 0; i<layers.length; i++){
				utils.movePropKeys(layers[i], inTime, outTime, offset);
			}
		}
		return comp;
	};
	
	utils.selectPropKeys = function(layer, inTime, outTime) {
		utils.selectKeys(layer, inTime, outTime);
		return layer;
	};
	
	utils.movePropKeys = function(layer, inTime, outTime, offset) {
		
		if(offset!=0){
			utils.selectKeys(layer, inTime, outTime);
			utils.moveSelectedKeys(layer, offset, 1);
		}
		return layer;
	};
	
	utils.removePropKeys = function(layer, inTime, outTime) {
		utils.selectKeys(layer, inTime, outTime);
		var props = utils.getSelectedKeys(layer, 1);

		//props.reverse();
		for(var i=0; i<props.length; i++){
			var prop = props[i].prop;
			var keys = props[i].keyTimes.reverse();
			debug.log(prop.name + " | "+ keys.toString());
			for(var j=0; j<keys.length; j++) {
				var keyIndex = prop.nearestKeyIndex(keys[j]);
				prop.removeKey(keyIndex);
			}
		}
		return layer;

	};

	utils.copyPasteKeys = function(fromLayer, keyStartTime, keyEndTime, toLayer, offset){

		if(typeof keyStartTime == "string") {
			keyStartTime = fromLayer.getMarkerTime(keyStartTime);
		}
		if(typeof keyEndTime == "string") {
			keyEndTime = fromLayer.getMarkerTime(keyEndTime);
		}

		fromLayer.selectKeys(keyStartTime,keyEndTime);
		var props = fromLayer.selectedProperties;

		for(var i=0; i<props.length; i++){
			var prop = props[i];

			if(prop.matchName == "ABDE Marker")
				continue;
			if(prop.matchName == "VIDEOCOPILOT 3DArray")
				continue;
			
			var newProp = toLayer;
			var propNames = [];
			var selProp = prop;
			var _depth = prop.propertyDepth;
			//$.bp();
			for(var j=1; j<=_depth; j++) {
				propNames.push(selProp.matchName);
				selProp = selProp.parentProperty;
			}
			propNames.reverse();
			for(var k=0; k<propNames.length; k++) {
				newProp = newProp.property(propNames[k])
			}

			
			var _selKeys = prop.selectedKeys;

			for(var j=0; j<_selKeys.length; j++){

				var keyTime = prop.keyTime(_selKeys[j]);
				var keyToCopy = prop.nearestKeyIndex(keyTime);
				utils.shiftKeyToNewLayer(prop, newProp, keyToCopy, offset);
				prop.setSelectedAtKey(keyToCopy, false);
			}

		}
	};
	
	
	
	// moveSelectedKeys()
	// 
	// Description:
	// This function shifts the specified layer's keyframes (selected or unselected, except markers) 
	// by the specified distance (in seconds).
	// 
	// Parameters:
	//   propGroup - PropertyGroup object (initially, the Layer object) containing keyframes.
	//   offset - Time in seconds to offset the layer's keyframes.
	//   whichKeys - Value controlling which keys to offset (0 = unselected, 1 = selected)
	// 
	// Returns:
	// None.
	//
	utils.moveSelectedKeys = function(propGroup, offset, whichKeys)
	{
		var props = utils.getSelectedKeys(propGroup, whichKeys);
		var prop, propKeyTimes, keyIndex;
		for (var i=0; i<props.length; i++)
		{
			prop = props[i].prop;
			propKeyTimes = props[i].keyTimes;
	
	
			// Loop through the property's keyframes in the direction such that new
			// keyframes will not affect the indices of existing keyframes
			if (offset > 0)
			{
				for (var j=propKeyTimes.length-1; j>=0; j--)
				{
					keyIndex = prop.nearestKeyIndex(propKeyTimes[j]);
					utils.shiftKeyToNewTime(prop, keyIndex, offset, keyIndex);
				}
			}
			else
			{
				for (var j=0; j<propKeyTimes.length; j++)
				{
					keyIndex = prop.nearestKeyIndex(propKeyTimes[j]);
					utils.shiftKeyToNewTime(prop, keyIndex, offset, keyIndex+1);
				}
			}
		}
	};
	
	// getSelectedKeys()
	// 
	// Description:
	// This function retrieves the selected or unselected properties and keyframes (no markers) of the specified property group.
	// 
	// Parameters:
	//   propGroup - PropertyGroup object (initially, the Layer object) containing keyframes.
	//   whichKeys - Value controlling which keys to retrieve (0 = unselected, 1 = selected)
	// 
	// Returns:
	// Array of PropInfo objects representing properties and their selected or unselected key times.
	//
	utils.getSelectedKeys = function(propGroup, whichKeys)
	{
		var props = new Array();
		var prop, propInfo;
	
		// Iterate over the specified property group's properties
		for (var i=1; i<=propGroup.numProperties; i++)
		{
			prop = propGroup.property(i);
			if (prop.propertyType == PropertyType.PROPERTY)			// Found a property
			{
				if (prop.matchName == "ADBE Marker")				// Skip markers; they're processed separately
					continue;
				if (!prop.isTimeVarying)							// Skip properties that aren't keyframed
					continue;
			
				propInfo = new Object;
				propInfo.prop = prop;
				propInfo.keyTimes = new Array();
			
				for (var j=1; j<=prop.numKeys; j++)
					if (((whichKeys == 0) && !prop.keySelected(j)) || ((whichKeys == 1) && prop.keySelected(j)))
						propInfo.keyTimes[propInfo.keyTimes.length] = prop.keyTime(j);
			
				// If there were keys to save, add the property and its keys to the props array
				if (propInfo.keyTimes.length > 0)
					props[props.length] = propInfo;
			}
			else if (prop.propertyType == PropertyType.INDEXED_GROUP)	// Found an indexed group, so check its nested properties
				props = props.concat(utils.getSelectedKeys(prop, whichKeys));
			else if (prop.propertyType == PropertyType.NAMED_GROUP)	// Found a named group, so check its nested properties
				props = props.concat(utils.getSelectedKeys(prop, whichKeys));
		}
	
		return props;
	};
	
	// shiftKeyToNewTime()
	// 
	// Description:
	// This function retrieves the selected or unselected properties and keyframes (no markers) of the specified property group.
	// 
	// Parameters:
	//   prop - the property of the layer
	//   keyToCopy - index of the key to copy
	//   offset - number containing the offset in seconds
	//   keyToRemove - index of the key to remove
	// 
	// Returns:
	// nothing.
	//
	utils.shiftKeyToNewTime = function(prop, keyToCopy, offset, keyToRemove)
	{
		// Remember the key's settings before creating the new setting, just in case creating the new key affects keyToCopy's settings
		var inInterp  = prop.keyInInterpolationType(keyToCopy);
		var outInterp = prop.keyOutInterpolationType(keyToCopy);
	
		if ((inInterp == KeyframeInterpolationType.BEZIER) && (outInterp == KeyframeInterpolationType.BEZIER))
		{
			var tempAutoBezier = prop.keyTemporalAutoBezier(keyToCopy);
			var tempContBezier = prop.keyTemporalContinuous(keyToCopy);
		}
		if (outInterp != KeyframeInterpolationType.HOLD)
		{
			var inTempEase  = prop.keyInTemporalEase(keyToCopy);
			var outTempEase = prop.keyOutTemporalEase(keyToCopy);
		}
		if ((prop.propertyValueType == PropertyValueType.TwoD_SPATIAL) || (prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL))
		{
			var spatAutoBezier = prop.keySpatialAutoBezier(keyToCopy);
			var spatContBezier = prop.keySpatialContinuous(keyToCopy);
			var inSpatTangent  = prop.keyInSpatialTangent(keyToCopy);
			var outSpatTangent = prop.keyOutSpatialTangent(keyToCopy);
			var roving = prop.keyRoving(keyToCopy);
		}
	
		// Create the new keyframe
		var newTime     = prop.keyTime(keyToCopy) + offset;
		var oldValue    = prop.keyValue(keyToCopy);
		var newKeyIndex = prop.addKey(newTime);
		prop.setValueAtKey(newKeyIndex, oldValue);
	
		if (outInterp != KeyframeInterpolationType.HOLD)
		{
			prop.setTemporalEaseAtKey(newKeyIndex, inTempEase, outTempEase);
		}
	
		// Copy over the keyframe settings
		prop.setInterpolationTypeAtKey(newKeyIndex, inInterp, outInterp);
	
		if ((inInterp == KeyframeInterpolationType.BEZIER) && (outInterp == KeyframeInterpolationType.BEZIER) && tempContBezier)
		{
			prop.setTemporalContinuousAtKey(newKeyIndex, tempContBezier);
			prop.setTemporalAutoBezierAtKey(newKeyIndex, tempAutoBezier);		// Implies Continuous, so do after it
		}
	
		if ((prop.propertyValueType == PropertyValueType.TwoD_SPATIAL) || (prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL))
		{
			prop.setSpatialContinuousAtKey(newKeyIndex, spatContBezier);
			prop.setSpatialAutoBezierAtKey(newKeyIndex, spatAutoBezier);		// Implies Continuous, so do after it
		
			prop.setSpatialTangentsAtKey(newKeyIndex, inSpatTangent, outSpatTangent);
		
			prop.setRovingAtKey(newKeyIndex, roving);
		}
	
		// Remove the old keyframe
		try{
			prop.removeKey(keyToRemove);
		} catch(e) {

		}
		
	};

	utils.shiftKeyToNewLayer = function(prop, newProp, keyToCopy, offset)
	{
		// Remember the key's settings before creating the new setting, just in case creating the new key affects keyToCopy's settings
		var inInterp  = prop.keyInInterpolationType(keyToCopy);
		var outInterp = prop.keyOutInterpolationType(keyToCopy);
	
		if ((inInterp == KeyframeInterpolationType.BEZIER) && (outInterp == KeyframeInterpolationType.BEZIER))
		{
			var tempAutoBezier = prop.keyTemporalAutoBezier(keyToCopy);
			var tempContBezier = prop.keyTemporalContinuous(keyToCopy);
		}
		if (outInterp != KeyframeInterpolationType.HOLD)
		{
			var inTempEase  = prop.keyInTemporalEase(keyToCopy);
			var outTempEase = prop.keyOutTemporalEase(keyToCopy);
		}
		if ((prop.propertyValueType == PropertyValueType.TwoD_SPATIAL) || (prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL))
		{
			var spatAutoBezier = prop.keySpatialAutoBezier(keyToCopy);
			var spatContBezier = prop.keySpatialContinuous(keyToCopy);
			var inSpatTangent  = prop.keyInSpatialTangent(keyToCopy);
			var outSpatTangent = prop.keyOutSpatialTangent(keyToCopy);
			var roving = prop.keyRoving(keyToCopy);
		}
	
		// Create the new keyframe
		var newTime     = prop.keyTime(keyToCopy) + offset;
		var oldValue    = prop.keyValue(keyToCopy);
		var newKeyIndex = newProp.addKey(newTime);
		newProp.setValueAtKey(newKeyIndex, oldValue);
	
		if (outInterp != KeyframeInterpolationType.HOLD)
		{
			newProp.setTemporalEaseAtKey(newKeyIndex, inTempEase, outTempEase);
		}
	
		// Copy over the keyframe settings
		newProp.setInterpolationTypeAtKey(newKeyIndex, inInterp, outInterp);
	
		if ((inInterp == KeyframeInterpolationType.BEZIER) && (outInterp == KeyframeInterpolationType.BEZIER) && tempContBezier)
		{
			newProp.setTemporalContinuousAtKey(newKeyIndex, tempContBezier);
			newProp.setTemporalAutoBezierAtKey(newKeyIndex, tempAutoBezier);		// Implies Continuous, so do after it
		}
	
		if ((prop.propertyValueType == PropertyValueType.TwoD_SPATIAL) || (prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL))
		{
			newProp.setSpatialContinuousAtKey(newKeyIndex, spatContBezier);
			newProp.setSpatialAutoBezierAtKey(newKeyIndex, spatAutoBezier);		// Implies Continuous, so do after it
		
			newProp.setSpatialTangentsAtKey(newKeyIndex, inSpatTangent, outSpatTangent);
		
			newProp.setRovingAtKey(newKeyIndex, roving);
		}
		
	};

	utils.updateKeyWithNewValue = function(prop, keyToCopy, newValue)
	{
		// Remember the key's settings before creating the new setting, just in case creating the new key affects keyToCopy's settings
		var inInterp  = prop.keyInInterpolationType(keyToCopy);
		var outInterp = prop.keyOutInterpolationType(keyToCopy);
	
		if ((inInterp == KeyframeInterpolationType.BEZIER) && (outInterp == KeyframeInterpolationType.BEZIER))
		{
			var tempAutoBezier = prop.keyTemporalAutoBezier(keyToCopy);
			var tempContBezier = prop.keyTemporalContinuous(keyToCopy);
		}
		if (outInterp != KeyframeInterpolationType.HOLD)
		{
			var inTempEase  = prop.keyInTemporalEase(keyToCopy);
			var outTempEase = prop.keyOutTemporalEase(keyToCopy);
		}
		if ((prop.propertyValueType == PropertyValueType.TwoD_SPATIAL) || (prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL))
		{
			var spatAutoBezier = prop.keySpatialAutoBezier(keyToCopy);
			var spatContBezier = prop.keySpatialContinuous(keyToCopy);
			var inSpatTangent  = prop.keyInSpatialTangent(keyToCopy);
			var outSpatTangent = prop.keyOutSpatialTangent(keyToCopy);
			var roving = prop.keyRoving(keyToCopy);
		}
	
		// Create the new keyframe
		var newTime     = prop.keyTime(keyToCopy);
		var newKeyIndex = prop.addKey(newTime);
		prop.setValueAtKey(newKeyIndex, newValue);
	
		if (outInterp != KeyframeInterpolationType.HOLD)
		{
			prop.setTemporalEaseAtKey(newKeyIndex, inTempEase, outTempEase);
		}
	
		// Copy over the keyframe settings
		prop.setInterpolationTypeAtKey(newKeyIndex, inInterp, outInterp);
	
		if ((inInterp == KeyframeInterpolationType.BEZIER) && (outInterp == KeyframeInterpolationType.BEZIER) && tempContBezier)
		{
			prop.setTemporalContinuousAtKey(newKeyIndex, tempContBezier);
			prop.setTemporalAutoBezierAtKey(newKeyIndex, tempAutoBezier);		// Implies Continuous, so do after it
		}
	
		if ((prop.propertyValueType == PropertyValueType.TwoD_SPATIAL) || (prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL))
		{
			prop.setSpatialContinuousAtKey(newKeyIndex, spatContBezier);
			prop.setSpatialAutoBezierAtKey(newKeyIndex, spatAutoBezier);		// Implies Continuous, so do after it
		
			prop.setSpatialTangentsAtKey(newKeyIndex, inSpatTangent, outSpatTangent);
		
			prop.setRovingAtKey(newKeyIndex, roving);
		}
	
	};
	
	// selectKeys()
	// 
	// Description:
	// This function localizes and selects all properties with keyframes between the makerKeyTimes.
	// 
	// Parameters:
	//   propGroup - Property Group to look for keyframes in
	//   inTime - time
	//   outTime - time
	//
	// Returns:
	// PropertyGroup.
	//
	utils.selectKeys = function(propGroup, inTime, outTime)
	{
		
		for (var i=1; i <= propGroup.numProperties; i++){
			var prop = propGroup.property(i);
			if (prop.propertyType == PropertyType.PROPERTY){
				var inKeyIndex, inKeyTime, outKeyIndex, outKeyTime;
				if(prop.numKeys != 0){
					//get key index closest to first marker time
					inKeyIndex = prop.nearestKeyIndex(inTime);
					inKeyTime = prop.keyTime(inKeyIndex);
					// if the keyTime is less than the marker then try the next index
					//alert(prop.name +"| key: "+inKeyTime +" < marker: "+ inTime);
					if(inKeyTime < inTime/* && inKeyIndex < prop.numKeys*/){
						//alert(prop.name +"| try next index");
						if(inKeyIndex + 1 <= prop.numKeys){
							inKeyIndex += 1;
						}
						inKeyTime = prop.keyTime(inKeyIndex);
					}
					
					//get key index closest to second marker time
					outKeyIndex = prop.nearestKeyIndex(outTime);
					outKeyTime = prop.keyTime(outKeyIndex);	
					// if the keyTime is more than the marker then try the last index
					if(outKeyTime > outTime){
						if(outKeyIndex - 1 > 0){ // correction here : if(outKeyIndex - 1 >= 0){
							outKeyIndex -= 1; 
						}
						outKeyTime = prop.keyTime(outKeyIndex);
					}
				
					// Select all keys between the markers
					if(inKeyTime >= inTime && inKeyTime <= outTime && outKeyTime >= inTime && outKeyTime <= outTime){
						for(var j=inKeyIndex; j <= outKeyIndex; j++){
							if(!prop.dimensionsSeparated) {
								prop.setSelectedAtKey(j, true);
							}
							
						}
					}
				}
			}
			else if (prop.propertyType == PropertyType.INDEXED_GROUP)	// Found an indexed group, so check its nested properties
				utils.selectKeys(prop, inTime, outTime);
			else if (prop.propertyType == PropertyType.NAMED_GROUP)	// Found a named group, so check its nested properties
				utils.selectKeys(prop, inTime, outTime);
		}
		return propGroup;
	}
	
}