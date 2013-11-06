// Debugging level 
//  0: No debugging
//  1: Break on runtime errors 
//  2: Full debug mode // note this is set in miranda.jsx
//$.level = 2;
  var PATH = new File($.fileName).path;

// Prototype contains functions that extend core javascript objects
//   everything else goes into anonomous objects '{}'
$.evalFile(PATH + "/library/prototype.jsx");
{
  var SETTINGS;
	var OS = $.os;
  
  // The order of theese includes matters!
  $.evalFile(PATH + "/library/debug.jsx");
  $.evalFile(PATH + "/library/log.jsx");
  $.evalFile(PATH + "/library/fonts.jsx");
  
  $.evalFile(PATH + "/library/utils.jsx");
  $.evalFile(PATH + "/library/utils_keys.jsx");
  
  $.evalFile(PATH + "/library/vectorMath.jsx");
  $.evalFile(PATH + "/library/3d.jsx");
  
  $.evalFile(PATH + "/library/paragraph.jsx");
  $.evalFile(PATH + "/library/paragraph2D.jsx");
  
  // Define Global CONSTANTS
  // Turn debug fram on when not in production
  if( PATH.toLowerCase().indexOf("master") == -1 ) {
     //var DEBUG_FRAME = true;
     var DEBUG_FRAME = false;
  } else {
     var DEBUG_FRAME = false;
  }
	
  var TEST = false; //True if running init stand alone

  // TEST DATA - When running with test true data is inserted directly into the fields in the ae project
  var testDebug = false;
  var testCompName = "{BH}";
  var testProjectName = "DR1"; 

  if(TEST) {
    var DEBUG = testDebug;
    if(DEBUG) {
      $.level = 2;
    } else {
      $.level = 0;
    }
  }
  
	// Define Global variables
	var mainComp, projectName, project, path, projectVersion;
  
	var run = function() {
		if( !app.project ) {		  
		  throw new Error("No project is loaded")
		} else {
			if(TEST == false) {
				mainComp = new Object(_.getComp(SubsParams.compositionName));
				var a = SubsParams.projectFile.split("/");

        var projectComponents =  a[a.length-1].split(".")[0].split("_");
      	projectName = projectComponents[0];
        projectVersion = projectComponents[1];

			} else {
				mainComp = new Object(_.getComp(testCompName));
				projectName = testProjectName;
			}
      
      if(DEBUG_FRAME){
        debug.createComp(mainComp);
      }
			
      var project;		

      $.evalFile(PATH + "/../scripts/"+projectName+".jsx");      
      
      SETTINGS = project.SETTINGS;
      project.create();
      
			/*if(projectName == "DR2") {
			  
			  $.evalFile(PATH + "/DR2/scripts/DR2.jsx");		  
				project = new DR2();
				SETTINGS = project.SETTINGS;
				project.create();
				
			} else if (projectName.indexOf("DR3") !== -1) {
              
			  $.evalFile(PATH + "/DR3/scripts/DR3.jsx");			  
				project = new DR3();
				SETTINGS = project.SETTINGS;
				project.create();            
            
			} else if (projectName == "DR1") {
		
			  $.evalFile(PATH + "/DR1/scripts/DR1.jsx");			  
				project = new DR1();
				SETTINGS = project.SETTINGS;
				project.create();
		
			} else if (projectName == "DRU") {
			  
			  $.evalFile(PATH + "/DRU/scripts/DRU.jsx");			  
				project = new DRU();
				SETTINGS = project.SETTINGS;
				project.create();
				
			} else if (projectName == "NOLOOK") {
			  
			  $.evalFile(PATH + "/NOLOOK/scripts/NOLOOK.jsx");			  
				project = new NOLOOK();
				SETTINGS = project.SETTINGS;
				project.create();
				
			} else {
			  throw new Error("Project not valid.")
			}*/
			
      if(DEBUG_FRAME){
        debug.addDebugComp(mainComp);
      }      
		}
	}
	
	app.beginUndoGroup("UNDO LOVENEST");	
	
	// only catch all errors when we are not debugging
	if(!DEBUG) {
  	try {
  	  run();
    } catch (e) {
      log(e.name + ": " + e.message, 1)
    }
  } else {
    run();
  }
  
	app.endUndoGroup();
}
