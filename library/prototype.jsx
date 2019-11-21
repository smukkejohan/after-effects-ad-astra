String.prototype.replaceAll = function (str1, str2, ignore) {
	return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
};


if (!Array.prototype.map) {
	Array.prototype.map = function (fun /*, thisArg */ ) {
		"use strict";

		if (this === void 0 || this === null)
			throw new TypeError();

		var t = Object(this);
		var len = t.length >>> 0;
		if (typeof fun !== "function")
			throw new TypeError();

		var res = new Array(len);
		var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
		for (var i = 0; i < len; i++) {
			// NOTE: Absolute correctness would demand Object.defineProperty
			//       be used.  But this method is fairly new, and failure is
			//       possible only if Object.prototype or Array.prototype
			//       has a property |i| (very unlikely), so use a less-correct
			//       but more portable alternative.
			if (i in t)
				res[i] = fun.call(thisArg, t[i], i, t);
		}

		return res;
	};
}

if (!Array.prototype.filter){
	Array.prototype.filter = function(func, thisArg) {
	  'use strict';
	  if ( ! ((typeof func === 'Function' || typeof func === 'function') && this) )
		  throw new TypeError();
	 
	  var len = this.length >>> 0,
		  res = new Array(len), // preallocate array
		  t = this, c = 0, i = -1;
  
	  var kValue;
	  if (thisArg === undefined){
		while (++i !== len){
		  // checks to see if the key was set
		  if (i in this){
			kValue = t[i]; // in case t is changed in callback
			if (func(t[i], i, t)){
			  res[c++] = kValue;
			}
		  }
		}
	  }
	  else{
		while (++i !== len){
		  // checks to see if the key was set
		  if (i in this){
			kValue = t[i];
			if (func.call(thisArg, t[i], i, t)){
			  res[c++] = kValue;
			}
		  }
		}
	  }
	 
	  res.length = c; // shrink down array to proper size
	  return res;
	};
  }

// This version tries to optimize by only checking for "in" when looking for undefined and
// skipping the definitely fruitless NaN search. Other parts are merely cosmetic conciseness.
// Whether it is actually faster remains to be seen.
if (!Array.prototype.indexOf)
Array.prototype.indexOf = (function(Object, max, min) {
  "use strict"
  return function indexOf(member, fromIndex) {
	if (this === null || this === undefined)
	  throw TypeError("Array.prototype.indexOf called on null or undefined")

	var that = Object(this), Len = that.length >>> 0, i = min(fromIndex | 0, Len)
	if (i < 0) i = max(0, Len + i)
	else if (i >= Len) return -1

	if (member === void 0) {        // undefined
	  for (; i !== Len; ++i) if (that[i] === void 0 && i in that) return i
	} else if (member !== member) { // NaN
	  return -1 // Since NaN !== NaN, it will never be found. Fast-path it.
	} else                          // all else
	  for (; i !== Len; ++i) if (that[i] === member) return i 

	return -1 // if the value was not found, then return -1
  }
})(Object, Math.max, Math.min)