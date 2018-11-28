
// Debugging level
//  0: No debugging
//  1: Break on runtime errors
//  2: Full debug mode
//  $.level = 2;

// todo set variable to check if it has been included, so it only ever gets included once 

var AIRLOOKFRAMEWORK_PATH = new File($.fileName).path;
var OS = $.os;

$.evalFile(AIRLOOKFRAMEWORK_PATH + "/library/prototype.jsx");

// The order of these includes matter!
$.evalFile(AIRLOOKFRAMEWORK_PATH + "/library/debug.jsx");
$.evalFile(AIRLOOKFRAMEWORK_PATH + "/library/log.jsx");
$.evalFile(AIRLOOKFRAMEWORK_PATH + "/library/fonts.jsx");
$.evalFile(AIRLOOKFRAMEWORK_PATH + "/library/utils.jsx");
$.evalFile(AIRLOOKFRAMEWORK_PATH + "/library/utils_keys.jsx");
$.evalFile(AIRLOOKFRAMEWORK_PATH + "/library/vectorMath.jsx");
$.evalFile(AIRLOOKFRAMEWORK_PATH + "/library/3d.jsx");
$.evalFile(AIRLOOKFRAMEWORK_PATH + "/library/paragraph.jsx"); // TODO: Update with new boxText methods
$.evalFile(AIRLOOKFRAMEWORK_PATH + "/library/paragraph2D.jsx");

// Define Global variables
// TODO: make library not dependent on theese
var mainComp, projectName, project, path, projectVersion;