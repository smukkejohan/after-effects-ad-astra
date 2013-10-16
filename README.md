Scripts for automatic rendering of Airlooks for DR2, DR3 and Ultra in After Effects. Written by Martin Bollerup mboh@dr.dk, Johan Bichel Lindegaard johan@johan.cc, and maqp@dr.dk for DR in 2012/2013.


We may want to sue some stuff from here: https://code.google.com/p/beforeeffects

# Manual Usage
Open up the NEW_MIRANDA_script.jsx in extend script toolkit, fill in the appropriate parameters and hit run.


# Parameters
N is a placeholder for the item number. e.g. {DURATION-1} specifies the duration for the first item in the template.
Times, and durations are specified in the format "minutes:seconds:frames" e.g. "00:07:10".

# Miranda IRS
The scripts are made for injection in the Miranda IRS rendering service. 


## XML Validation
Link to breaktools


# Code Guidelines

Everything except stuff that extends prototype should be enclosed in an empty object '{}'.

Create private variables in objects, only make them public if they absolutely need to be public.
Make stuff self contained and pass stuff around.

All objects should define a:

__construct
	Private functions that should be executed on object instantiation

this.create
	If the object does something that is dependent on local variables being accesible through a parent scope then this it where it starts.
	
__construct() should go in the bottom of all functions so that all definitions have been made before execution.


Explain scope stuff


project has

constructor
here we can manipulate teh global scope


a create function

then it closes in



# BEST PRACTICES 
Do not redeclare global variables for an object inside inline functions. Then the global will be set to undefined in lines preceding.


If you are parsing objects to a function more than once in an instance you should instantiate it as an object with the new keyword. 




Marks notes for 3d calculations:

// ---------------------------------- //
// ---------------NOTES-------------- //
// ---------------------------------- //
/*

	This script assumes a film size
	of 100mm in the camera in AE.
	
	The time-code we are operating
	with is fixed at the moment. It
	should ideally be fetched from
	the keyframe marker in AE. Look
	for the "time" variable.
	
	The text-transform function is
	currently rudimentary. While it
	does a basic job, it needs to be
	expanded to handle actual text
	sizes.
	
	A method of moving the camera
	according to the sign composition
	needs to be implemented.
	
	Code is sensibly commented, apart
	from most of the vector math. If
	in doubt, ask maqp@dr.dk. 
	
	That should be all :P

*/
// ---------------------------------- //
// ---------------------------------- //
// ---------------------------------- //


