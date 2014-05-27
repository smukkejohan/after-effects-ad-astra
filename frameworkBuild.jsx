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
      var comp = _.getItem(name);
      if(comp){      
        try {
          comp.replace( new File(SubsParams.clips[i].substitute) )

          var match = SubsParams.clips[i].name.toString().match(/\{((\S+)-\d)\}/);
          
          if(match){
            var usageComp = utils.getComp( match[1] )
            if(usageComp){                            
              var layers = usageComp.getAllLayers();
              for(var i=0; i<layers.length; i++){
                try{
                  layers[i].scaleToHD();
                } catch(e){}
                
                layers[i].setTimeRemap();
              }            
            }

            var usageComp2 = utils.getComp( match[2])
            if(usageComp2){
              var layers = usageComp2.getAllLayers();
              for(var i=0; i<layers.length; i++){
                try{
                  layers[i].scaleToHD();
                } catch(e){}

                layers[i].setTimeRemap();
              }            
            }
          }
         
          
        } catch(e) {
          //$.write("Could not replace "+name+" "+e.message)
        }
      }
    }
  }

 
  
	var build = function() {
		if( !app.project ) {		  
		  throw new Error("No project is loaded")
		} else {		
      handleFootage();

			mainComp = new Object(_.getComp('stage'));

			projectName = SubsParams.projectName;
      projectVersion = SubsParams.projectVersion;

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
