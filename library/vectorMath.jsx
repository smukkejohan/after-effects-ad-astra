// tools for working with vector math in 2d and 3d depends on utils.jsx
{
	
	var Size = function(w, h) {
	  
	  this.w = w;
	  this.h = h;
	  
	  this.getArea = function() {
	    return this.w*this.h
	  };
	  
	  this.subtract = function(size) {
	    return new Size(this.w-size.w, this.h-size.h);
	  };
	  
	  this.add = function(size) {
	    return new Size(this.w+size.w, this.h+size.h);
	  };
	  
	};
	
	var Vec2 = function(x, y) {
	  this.x = x;
	  this.y = y;
	  
	  this.dot      = function(v) { return (this.x * v.x) + (this.y * v.y); };
	  this.subtract = function(v) { return new Vec2(this.x - v.x, this.y - v.y); };
  	this.add      = function(v) { return new Vec2(this.x + v.x, this.y + v.y); };
  	
  	this.array    = function()  { return [this.x, this.y]; };
	};


	// A 3-dimensional vector and necessary operations
	var Vec3 = function(x, y, z) {
	  this.x = x;
	  this.y = y;
	  this.z = z;
	  
	  this.dot       = function (v) { return (this.x * v.x) + (this.y * v.y) + (this.z * v.z);   };
  	this.subtract  = function (v) { return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z); };
  	this.add       = function (v) { return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z); };
  	
  	this.multiply  = function (t) { 
  	  return new Vec3(this.x*t, this.y*t, this.z*t); 
  	};
  	
  	this.cross     = function (v) { 
  	  return new Vec3(this.y*v.z-this.z*v.y, this.z*v.x-this.x*v.z, this.x*v.y-this.y*v.x); 
  	};
  	
  	this.normalize = function () { 
  	  var m = Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z); 
  	  return new Vec3(this.x/m, this.y/m, this.z/m); 
  	};
  	
	  this.array    = function()  { return [this.x, this.y, this.z]; };
  };
	
	// A plane defines an infinite plane in 3D space by a position
	// on the plane and a plane-normal vector.
	var Plane = _.makeStruct("point normal");
	Plane.IntersectRayWithPlane = function(origin, vector, plane) {
		var ray = vector.subtract(origin).normalize();
		var d = -1*(plane.point.dot(plane.normal));
		var t = (-1*(origin.dot(plane.normal)+d)) / ray.dot(plane.normal);
		var intersection = origin.add(ray.multiply(t));
		return intersection;
	};
	Plane.DistanceToPoint = function (plane, point) {
		var unitNormalVector = plane.normal.normalize();
		var v = point.subtract(plane.point);
		var distance = v.dot(unitNormalVector);
		return distance;
	};

	// Holds information about 2-dimensional dimensions
	var Dimensions = _.makeStruct("w h"); 

}