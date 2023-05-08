
// Debugging level
//  0: No debugging
//  1: Break on runtime errors
//  2: Full debug mode
//  $.level = 2;

// todo set variable to check if it has been included, so it only ever gets included once 

if(typeof ADASTRA_PATH === "undefined"){

    var ADASTRA_PATH = new File($.fileName).parent.fsName;
    var OS = $.os;
    
    $.evalFile(ADASTRA_PATH + "/library/prototype.jsx");
    
    // The order of these includes matter!
    $.evalFile(ADASTRA_PATH + "/library/debug.jsx");
    $.evalFile(ADASTRA_PATH + "/library/log.jsx");
    $.evalFile(ADASTRA_PATH + "/library/fonts.jsx");
    $.evalFile(ADASTRA_PATH + "/library/utils.jsx");
    $.evalFile(ADASTRA_PATH + "/library/utils_keys.jsx");
    $.evalFile(ADASTRA_PATH + "/library/vectorMath.jsx");
    $.evalFile(ADASTRA_PATH + "/library/3d.jsx");
    $.evalFile(ADASTRA_PATH + "/library/paragraph.jsx"); // TODO: Update with new boxText methods
    $.evalFile(ADASTRA_PATH + "/library/paragraph2D.jsx");
    $.evalFile(ADASTRA_PATH + "/library/json2.jsx");
    
    // Define Global variables
    // TODO: make library not dependent on theese
    var mainComp, projectName, project, path, projectVersion;
}