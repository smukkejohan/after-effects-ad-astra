
// Debugging level
//  0: No debugging
//  1: Break on runtime errors
//  2: Full debug mode
//  $.level = 2;

var PATH = new File($.fileName).path;
var OS = $.os;

$.evalFile(PATH + "/library/prototype.jsx");

// The order of these includes matter!
$.evalFile(PATH + "/library/debug.jsx");
$.evalFile(PATH + "/library/log.jsx");
$.evalFile(PATH + "/library/fonts.jsx");
$.evalFile(PATH + "/library/utils.jsx");
$.evalFile(PATH + "/library/utils_keys.jsx");
$.evalFile(PATH + "/library/vectorMath.jsx");
$.evalFile(PATH + "/library/3d.jsx");
$.evalFile(PATH + "/library/paragraph.jsx"); // TODO: Update with new boxText methods
$.evalFile(PATH + "/library/paragraph2D.jsx");

// Define Global variables
// TODO: make library not dependent on theese
var mainComp, projectName, project, path, projectVersion;