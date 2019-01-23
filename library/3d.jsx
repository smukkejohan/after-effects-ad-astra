// utils for working with layers in 3 dimensions
// depends on vectorMath

// AE coordinates have 0 in the center
// World coordinates are the coordinates in the 3D scene
// Viewport coordinates have 0 in the upper right corner

// TODO: Deprecate all gridCoord functions and make it all viewport
// Rename functions to sane shorter names


// Ideas
// Rename viewport operations to Projected getProjectPosition setProjectedDimensions ...

// d3 shoudl be named a viewportEnvironment

{
  
  var viewportProperties = "origin pointOfInterest dimensions zoom fov projectionPlaneDistance";
	var Viewport = _.makeStruct(viewportProperties);

	var d3 = {
		
		// setupViewport()
		//
		// Description:
		//   Creates and calculates all necessary
		//   values for the viewport in the scene,
		//   so that we can calculate projections
		//   for 3D objects in the scene.
		//
		// Returns:
		//   Nothing.
		//
		// Notes:
		//   Warning! This function assumes that 100mm
		//   film is used in the camera. I have found
		//   no way to read the film size from AE, but
		//   100mm seems to be default, so it should be
		//   relatively safe.
		
		time: 0,
		
		getTime: function() {
		  return this.time;
		},
		
		setupViewport: function(composition, time) {
		  
		  this.time = time
		  
		  var camera = composition.getCamera()
		  var camProp = camera.property("Position");
		  
		  // if time is not parsed as agument it first looks for the marker on the camera layer called "inPlace" 
		  // if it is not defined it defaults to the last keyframe
		  
		  if(!this.time) {		    
		    var inPlaceTime = camera.getMarkerKeyTime("inPlace");		    
		    if (inPlaceTime) {
		      this.time = inPlaceTime;
		    } else {
		      this.time = camProp.keyTime(camera.property("Position").numKeys);
	      }
	    }
		  
			// A viewport holds all necessary info about the viewport
																											 // This is similar to a camera, an eye or an observer.
			var zoomToFocalLengthRatio = 0.147638;
			var mmToPixelRatio = 1/0.35278;
			var filmSize = 100 * mmToPixelRatio; // Assume film size of 100mm

			var cameraPos = camera.property("position").valueAtTime(this.time, null);
			var cameraPOI = camera.property("Transform").property("Point of Interest").valueAtTime(this.time, null);
			var origin = new Vec3(cameraPos[0], cameraPos[1], cameraPos[2]);
			var pointOfInterest = new Vec3(cameraPOI[0], cameraPOI[1], cameraPOI[2]);
			if (pointOfInterest.x == cameraPos[0] && pointOfInterest.y == cameraPos[1] && pointOfInterest.z == cameraPos[2]) {
				// If POI is not set correctly in AE comp, we are
				// assuming camera is looking down the Z-axis
				//debug.log("No camera POI set, using z-axis unit vector as POI");
				pointOfInterest = new Vec3(0, 0, 1);
			}
			var zoom = camera.property("Camera Options").property("Zoom").valueAtTime(0, null);
			var focalLength = zoom * zoomToFocalLengthRatio;
			var fovRad = 2*Math.atan(filmSize/(2*focalLength)); // FOV in radians
			var fovDeg = 2*Math.atan(filmSize/(2*focalLength)) * (180/Math.PI); // FOV in degrees
			var viewportDimensions = new Dimensions(composition.width, composition.height);

			// Calculate distance to projection plane
			var planeEdgeToCameraAngleDeg = (180 - 90 - (fovDeg/2));
			var planeEdgeToCameraAngleRad = planeEdgeToCameraAngleDeg * (Math.PI/180);
			var projectionPlaneDistance = Math.cos(fovRad/2) * ((viewportDimensions.w/2) / Math.sin(fovRad/2));

			viewport = new Viewport(origin, pointOfInterest, viewportDimensions, zoom, fovDeg, projectionPlaneDistance);
      
			
			this.viewport = viewport;
			return this.viewport;
		},
	
	
		
		/* Add awesome 3d space functions as inline shorthands to our layers */
		enhanceLayer: function(layer) {	
			layer.d3 = new Object();
			
			layer.d3.getProjectedSize = function() {
				return d3.getProjectedSize(layer.pos.getLowerLeft(d3.time), layer.pos.getUpperRight(d3.time));
			};
			
			
			layer.d3.getProjectedTextSize = function(str) {
			  var tmplayer = layer.clone();
			  tmplayer.setText(str);
			  var size = d3.getProjectedSize(tmplayer.pos.getLowerLeft(d3.time), tmplayer.pos.getUpperRight(d3.time));
			  tmplayer.remove();
			  return size;
			};
			
			
			
			
			
			layer.d3.test = function() {
				alert("This Layer has been d3 enhanced!")
			};
			
			/*
			** Sets width and height of a layer so it appears at the specified size in the viewport
			*/
			layer.d3.setProjectedSize = function(dimensions) {
				var world = d3.setProjectedSize(layer, dimensions);
				return layer;
			};
			
			/*
			** Gets the position relative to the viewport, returns a 2d vector
			*/
			layer.d3.getViewPos = function() {
				//debug.log("----- layer.d3.getViewPos TJISD")
				//debug.peekIn(layer.pos.get(d3.time));
				var point = layer.pos.get(d3.time);
				/*if(point.z == 0){
					//var z = _.enhanceLayer(layer.parent).pos.getZ();
					//point.z = z;
					//alert("parent z: "+z);
					
					parentPoint = _.enhanceLayer(layer.parent).pos.get();
					
					point.x -= 500;//parentPoint.x;
					point.y -= 500;//parentPoint.y;
					point.z = parentPoint.z;
					
					
				}*/
				
				return d3.point.worldToViewport(point);
			};
			
			/*
			** Sets position from viewport coordinates, takes a 2d vector returns the layer
			*/
			layer.d3.setViewPos = function(vector) {
				//if(!time) time = 0;
				
				if(typeof vector.x != "number" || typeof vector.y != "number" ) {
				  throw new TypeError("Vector does not contain valid numbers")
				}
				
				var prop = layer.property("Position");
				if(prop.numKeys != 0){
				  var worldPos = d3.point.viewportToWorld(new Vec2(vector.x,vector.y), layer.pos.getZ(d3.time));
  				var keyIndex = prop.nearestKeyIndex(d3.time);
  				var keyTime = prop.keyTime(keyIndex);
  				var posAtMeasuredTime = layer.pos.get(keyTime);
  				var offsetX = worldPos.x - posAtMeasuredTime.x;
  				var offsetY = worldPos.y - posAtMeasuredTime.y;
  				var offsetZ = worldPos.z - posAtMeasuredTime.z;

      		for(var i=1; i <= prop.numKeys; i++) {
    		    var t = prop.keyTime(i);
    		    var pos = layer.pos.get(t)
    		    layer.pos.set(new Vec3(pos.x+offsetX, pos.y+offsetY, pos.z+offsetZ), t);
    		    //debug.log(layer.name)
    		    //debug.log("x: "+pos.x+offsetX)
    		    //debug.log("y: "+pos.y+offsetY)
    		    //debug.log("t: "+t+"\n")
    		  }
				} else {
				  layer.pos.set(d3.point.viewportToWorld(new Vec2(vector.x,vector.y), layer.pos.getZ(d3.time)));
				}
				
				return layer
			}
			return layer;
		},
		
	}
	
	
	d3.point = new Object();
	
	/*
	** Converts a vector from world coordinates to viewport coordinates
	*/
	d3.point.worldToViewport = function(point) {
		//debug.log("----- d3.point.worldToViewport")
		//debug.peekIn(this.worldToAe(point));
		return this.aeToViewport(this.worldToAe(point));
	}
	
	/*
	** Converts vec2 ae coordinates to vec2 viewport coordinates
	*/
	d3.point.aeToViewport = function(point) {
		return new Vec2(point.x+d3.viewport.dimensions.w/2, point.y+d3.viewport.dimensions.h/2);
	};
	
	
	d3.point.viewportToAe = function(point) {
		return new Vec2(point.x-d3.viewport.dimensions.w/2, point.y-d3.viewport.dimensions.h/2);
	};
	
	/* NOT YET TESTEd!!! */
	d3.point.viewportToWorld = function(vector, z) {
		return d3.viewportCoordsTo3dCoordsAtZ(vector, z);
	};
		
	/*
	** Converts vec3 world coordinates to vec2 ae coordinates
	*/
	d3.point.worldToAe = function(point) {
	  
	  if(typeof d3.viewport != 'object') {
	    throw "Viewport invalid or not found. Please make sure you setup the viewport before calling any D3 functions."
	  }
	  
		//debug.log("----- d3.point.worldToAe")
		//debug.peekIn(point);
		
	
		// Get the unit-vector for what we are looking at. We
		// need this all over the place, man! It's important!
		var poiUnitVector = d3.viewport.pointOfInterest.normalize();
		// Create a plane with a normal inversely perpendicular
		// to the cameras point of interest at distance z, aka
		// create a plane the camera is looking directly at :P
		var planePoint = poiUnitVector.multiply(d3.viewport.projectionPlaneDistance);
		var planeNormal = poiUnitVector.multiply(-1);
		var projectionPlane = new Plane(planePoint, planeNormal);
		var ray = point.subtract(d3.viewport.origin);
		var intersection = Plane.IntersectRayWithPlane(d3.viewport.origin, ray, projectionPlane)
		return new Vec2(intersection.x, intersection.y);
	};

	// get - should be getProjectedSize
	d3.getProjectedSize = function(lowerLeft, upperRight) {
		//alert("worldtoviewport")
		var projectedLowerLeft = d3.point.worldToAe(lowerLeft);
		var projectedUpperRight = d3.point.worldToAe(upperRight);
		var dimensionVector = projectedUpperRight.subtract(projectedLowerLeft);
		
		//alert("x:" + dimensionVector.x +" y:" + dimensionVector.y);
		return new Size(Math.abs(dimensionVector.x), Math.abs(dimensionVector.y));
	};
	
	/* 
	** Get world dimensions from projected viewport dimensions
	*/
	d3.setProjectedSize = function(layer, size) {
		
		var position = new Vec3(layer.transform.position.value[0],
								layer.transform.position.value[1],
								layer.transform.position.value[2]);
								
	  var projectedSize	= d3.projectedSizeToWorld(layer, size)
	  
	  //
		// how to handle 0 vector here
  	var transform = layer.calculateTransformFromPoints([position.x, position.y, position.z],
  														[position.x+projectedSize.w, position.y, position.z],
  														[position.x+projectedSize.w, position.y+projectedSize.h, position.z]);
		
		
		  
  	for(var selector in transform) {
  		  debug.log("Selector" + selector)
  		  
  			layer.transform[selector].setValueAtTime(0, transform[selector]);
  		}

		return layer;
	};
	
	
	// layer is not modified and does not need to relate tto the values, just be on the same plane in 3d space
	d3.projectedSizeToWorld = function(layer, size) {
								
		var anchorPlane = d3.layerLocalProjectionPlane(layer);
		var distance = d3.viewportDistanceToPlane(anchorPlane);
		
		if (d3.viewport.projectionPlaneDistance == 0) {
		  throw "Division by 0";
	  }
		var scaleFactor = distance / d3.viewport.projectionPlaneDistance;		

		return new Dimensions(size.w*scaleFactor, size.h*scaleFactor);
	};
	
	// gridCoordsToAe(gridCoords)
	//
	// Description:
	//   Translates grid coordinates into pixel-
	//   coordinates. 
	// 
	// Parameters:
	//   gridCoords - A 2D vector (Vec2) with grid
	//				  coordinates.
	//
	// Returns:
	//   A Vec2 object with the translated pixel-
	//   coordinates.
	//
	d3.gridCoordsToAe = function(gridCoords) {
		var pixelCoords = new Vec2(gridCoords.x*(this.viewport.dimensions.w/SETTINGS.GRIDSLICES_X)-(this.viewport.dimensions.w/2),
								   gridCoords.y*(this.viewport.dimensions.h/SETTINGS.GRIDSLICES_Y)-(this.viewport.dimensions.h/2));
		return pixelCoords;
	};
	
	
	/*UPDATED as point.viewporttoae */
  d3.viewportCoordsToPixelCoords = function(viewportCoords) {
          var pixelCoords = new Vec2(viewportCoords.x - this.viewport.dimensions.w/2, viewportCoords.y - this.viewport.dimensions.h/2);
          return pixelCoords;
  };
	
	// gridDimensionsToPixelDimensions(gridCoords)
	//
	// Description:
	//   Translates grid dimensions into pixel-
	//   dimensions. 
	// 
	// Parameters:
	//   gridDimensions - A Dimensions object
	//				      with grid dimensions.
	//
	// Returns:
	//   A Dimensions object with the translated
	//   pixel dimensions.
	//
	d3.gridDimensionsToPixelDimensions = function(gridCoords) {
		var pixelDimensions = new Dimensions(gridCoords.w*(this.viewport.dimensions.w/SETTINGS.GRIDSLICES_X),
								   		 gridCoords.h*(this.viewport.dimensions.h/SETTINGS.GRIDSLICES_Y));
		return pixelDimensions;
	};
	
	// layerLocalProjectionPlane(layer)
	//
	// Description:
	//   Creates a projection plane local
	//   to the anchor point of the given
	//   layer.
	// 
	// Parameters:
	//   layer - An AE layer object
	//
	// Returns:
	//   A plane object representing the
	//   layer-local projection plane.
	//
	d3.layerLocalProjectionPlane = function(layer) {
		var anchorPoint = new Vec3(layer.transform.position.value[0],
									layer.transform.position.value[1],
									layer.transform.position.value[2]);
		var normal = this.viewport.pointOfInterest.multiply(-1);
		var plane = new Plane(anchorPoint, normal);
		return plane;
	};
	
	// viewportDistanceToPlane(plane)
	//
	// Description:
	//   Calculates the distance from the
	//   viewport origin to a given plane.
	// 
	// Parameters:
	//   plane - A Plane object
	//
	// Returns:
	//   A floating point number indicating
	//   the distance.
	//
	d3.viewportDistanceToPlane = function(plane) {
		var distance = Plane.DistanceToPoint(plane, this.viewport.origin);
		return distance;
	};
	
	// gridCoordsTo3dCoordsAtZ(gridCoords, z)
	//
	// Description:
	//   Given a distance "z" from the viewport
	//   origin*, calculates the 3D coordinates
	//   that will project onto a certain point
	//   in the grid.
	//
	// * The distance (z) is the distance to
	//   a plane containing the projection point,
	//   not the point itself.  
	// 
	// Parameters:
	//   gridCoords - A Vec2 object with grid
	//				  coordinates.
	//	 z			- A number indicating the
	//                distance to the layer-
	//                local projection-plane.
	//
	// Returns:
	//   A Vec2 object with the translated pixel-
	//   dimensions.
	//
	
	d3.gridCoordsTo3dCoordsAtZ = function(gridCoords, z) {
		return this.pixelCoordsTo3dCoordsAtZ(this.gridCoordsToAe(gridCoords), z);
	};
	
	
	d3.viewportCoordsTo3dCoordsAtZ = function(viewportCoords, z) {
		return this.pixelCoordsTo3dCoordsAtZ(this.viewportCoordsToPixelCoords(viewportCoords), z);
	};
		
	d3.pixelCoordsTo3dCoordsAtZ = function(pixelCoords, z) {
		// Get the unit-vector for what we are looking at. We
		// need this all over the place, man! It's important!
		var poiUnitVector = this.viewport.pointOfInterest.normalize();
		
		// Create the cameras projection plane
		var projectionPlanePoint = poiUnitVector.multiply(this.viewport.projectionPlaneDistance);
		var projectionPlaneNormal = poiUnitVector.multiply(-1);
		var projectionPlane = new Plane(projectionPlanePoint, projectionPlaneNormal);
		
		// Translate the pixel coords into 3d world coords by
		// creating two unit vectors defining the local coordi-
		// nate system and getting scalar product from pixcoords
		var unitVectorX = poiUnitVector.cross(new Vec3(0, 1, 0));
		var unitVectorY = poiUnitVector.cross(unitVectorX);
		var worldVectorX = unitVectorX.multiply(-pixelCoords.x);
		var worldVectorY = unitVectorY.multiply(-pixelCoords.y);
		var worldCoords = projectionPlanePoint.add(worldVectorX.add(worldVectorY));
		
		// Create a plane with a normal inversely perpendicular
		// to the cameras point of interest at distance z, aka
		// create a plane the camera is looking directly at :P
		var planePoint = poiUnitVector.multiply(z);
		var planeNormal = poiUnitVector.multiply(-1);
		var plane = new Plane(planePoint, planeNormal);
		
		// Create a ray from the camera through the projection
		// plane coordinate and get world coordinates
		var ray = worldCoords.subtract(this.viewport.origin);
		worldCoords = Plane.IntersectRayWithPlane(viewport.origin, ray, plane);	
		return worldCoords;
	};
}


d3.testProjectedDimensions = function() {
	var t = new Vec2(-850, -371);
	var p = d3.pixelCoordsToGridPixelCoords(t);
	debug.log("GP coords");
	debug.peekIn(p);
	var worldCoords = new Vec3(-1536, -866, 1920);
	var pixelCoords = d3.worldCoordsToPixelCoords(worldCoords);
	var gridPixelCoords = d3.pixelCoordsToGridPixelCoords(pixelCoords);
	debug.log("RESULT:");
	debug.peekIn(gridPixelCoords);
	var lowerLeft = new Vec3(891, 540, 2500);
	var upperRight = new Vec3(891+500, 540+100, 2500);
	var dimensions = d3.getDimensionsInViewport(lowerLeft, upperRight);
	debug.log("Dimensions:");
	debug.peekIn(dimensions);
};

// TODO: INTEGRATE the functions below in d3 and change them to use viewport dimensions

// moveLayerToGridPosition(layer, position)
//
// Description:
//   Moves the specified layer to a position
//   in the grid
// 
// Parameters:
//   layer    - The AE layer object to be moved
//   position - A Vec2 object with the position
//
// Returns:
//   Nothing! It's all movement baby!
//
var moveLayerToGridPosition = function(layer, gridPosition) {  
	var anchorPlane = d3.layerLocalProjectionPlane(layer);
	var distance = d3.viewportDistanceToPlane(anchorPlane);		
	var newPosition = d3.gridCoordsTo3dCoordsAtZ(gridPosition, distance);
	
	layer.transform.position.setValueAtTime(0, [newPosition.x,
									   newPosition.y,
									   newPosition.z]);
};


// setLayerGridSize(layer, gridDimensions)
//
// Description:
//   Resizes the layer to a specified size in
//   grid units
// 
// Parameters:
//   layer      - The AE layer object to resize
//   size - A Dimensions object with the
//                new size.
//
// Returns:
//   Nothing! It's just scaling man!
//
var setLayerGridSize = function(layer, size) {
	//debug.log("DIMENSIONS:");
	//debug.peekIn(size);
	var position = new Vec3(layer.transform.position.value[0],
							layer.transform.position.value[1],
							layer.transform.position.value[2]);
							
	var anchorPlane = d3.layerLocalProjectionPlane(layer);
	var distance = d3.viewportDistanceToPlane(anchorPlane);
	
	//debug.log("PLANE:");
	//debug.peekIn(anchorPlane.point);
	//debug.peekIn(anchorPlane.normal);
	
	//debug.log("DISTANCE:");
	//debug.log(distance);
	
	if (d3.viewport.projectionPlaneDistance == 0) {
	  throw "Division by 0"
	}
	var scaleFactor = distance / d3.viewport.projectionPlaneDistance;
	var newSize = d3.gridDimensionsToPixelDimensions(size);
	//debug.log("NEWSIZE:");
	//debug.peekIn(newSize);
	var projectedSize = new Size(newSize.w*scaleFactor, newSize.h*scaleFactor);
	
	/*debug.log("POSITION:");
	debug.peekIn(position);
	debug.log("PROJSIZE:");
	debug.peekIn(projectedSize);*/
	var transform = layer.calculateTransformFromPoints([position.x, position.y, position.z],
													[position.x+projectedSize.w, position.y, position.z],
													[position.x+projectedSize.w, position.y+projectedSize.h, position.z]);
	
	for(var selector in transform) {
		layer.transform[selector].setValueAtTime(0, transform[selector]);
	}
	
	/*for(var i = 0; i < layer.text.length; i++){
		layer.text[i].transform.scale.setValueAtTime(this.calculateTextTransform(transform));
	}*/
	
};


// calculateTextTransform(transform)
//
// Description:
//   Calculates the text transform that the
//   grid resize function should apply to
//   contained text.
// 
// Parameters:
//   transform - The transform that was
//               applied to the layer.
//
// Returns:
//   An AE Transform array that will be
//   applied to the text layer.
//
