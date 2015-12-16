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


	// Define Global variables
	var mainComp, projectName, project, path, projectVersion;

  var handleFootage = function(){
    for(var i in SubsParams.clips){

      var name =  SubsParams.clips[i].name;//.toString().replace('{','').replace('}','')
      remoteLog("Try to import "+name);
      try{
        var comp = _.getItem(name);
      } catch(e){
        remoteLog("Could not find footage composition "+name);
      }
      if(comp){
      //  try {      
          var fn = new File(SubsParams.clips[i].substitute);
          if(fn.exists) {

            comp.replace(fn)
            remoteLog("Imported " + SubsParams.clips[i].substitute, "debug")

            var match = SubsParams.clips[i].name.toString().match(/\{((\S+)-\d)\}/);

            if (match) {
              var usageComp = utils.getComp(match[1])
              if (usageComp) {
                var layers = usageComp.getAllLayers();
                for (var i = 0; i < layers.length; i++) {
                  try {
                    layers[i].scaleToHD();
                  } catch (e) {
                  }

                  layers[i].setTimeRemap();
                }
              }

              var usageComp2 = utils.getComp(match[2])
              if (usageComp2) {
                var layers = usageComp2.getAllLayers();
                for (var i = 0; i < layers.length; i++) {
                  try {
                    layers[i].scaleToHD();
                  } catch (e) {
                  }

                  layers[i].setTimeRemap();
                }
              }
            }
          } else {
            remoteLog("Could not import "+SubsParams.clips[i].substitute+" file is missing", "error")
            throw new Error("Could not import "+SubsParams.clips[i].substitute+" file is missing");
          }
        /*} catch(e) {
          remoteLog("Could not import "+SubsParams.clips[i].substitute+ " Error: "+e.message, "error")
          //$.write("Could not replace "+name+" "+e.message)
        }*/
      }
    }
  }



	var build = function() {
		if( !app.project ) {
		  throw new Error("No project is loaded")
		} else {
      handleFootage();

			mainComp = _.getComp('stage');
      if(!mainComp){
        mainComp = _.createComp('stage');
      }

			projectName = SubsParams.projectName;
      projectVersion = SubsParams.projectVersion;

      SubsParams.params['BASEPATH'] =  new File($.fileName).parent.parent.path;

      // get all subprojects
      if(File(PATH + "/../subprojects/subprojects.jsx").exists){
        $.evalFile(PATH + "/../subprojects/subprojects.jsx");
      }

      // get project file
      $.evalFile(PATH + "/../scripts/"+projectName+".jsx");
      SETTINGS = project.SETTINGS;
      project.create();
		}
	}

	app.beginUndoGroup("UNDO LOVENEST");
  build();
	app.endUndoGroup();
}
