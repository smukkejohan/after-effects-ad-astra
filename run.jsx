// when running locally or producing previews or renders 
// using our own service this script is the entry point
// and replaces the functionality of the miranda script 
// the input XML should be IRS compliant

{
  var PATH = new File($.fileName).path;
  var DONT_RENDER = false;

  // test LS object - some of this should be loaded from args
  var DEBUG =false;
  
  if(DEBUG == false){
      app.beginSuppressDialogs();
  }
  
  var outputExtension = "";
  
  // set default arguments
  var args = {
    destination: "",
    id: 'test',
    input: new File(PATH + "/../renderService/data/render.xml"),
    //OMTemplate: 'TR_til_MA',
    RSTemplate: 'Preview',
    OMTemplate: 'Preview',
  //  RSTemplate: 'MA'
  };
  
  // Load local settings from xml file
  var argsFile = new File(PATH + "/../renderService/data/args.xml"); 
  if (argsFile) {
    argsFile.open('r'); 
    var argsXml = new XML(argsFile.read());
    
    args.input = new File(argsXml.input);
  //  $.write(args.input);
   // $.write(argsXml.input);
    args.destination = argsXml.destination;
    args.logDestination = "c:/DR-Airlook/gmab/log.txt";
    

    //outputExtension = argsXml.outputExtension;



    argsFile.close();    
  }
  
  /* Read the input XML */
  var config = args.input;
  if (config) {
    config.open("r");
    var myXML = new XML(config.read());
    // the name attribute is formatted as AE Project Name/{Main Composition Name}
    var name = myXML.Page[0].@name; 
    var projectName = name.split('\\')[0];
    var compName = name.split('\\')[1];
    var forceRender = (myXML.Page[0].@forceRender == "true");

    if(myXML.Page[0].@OutputName !== undefined && myXML.Page[0].@OutputName.length > 0){
    }

    if(argsXml.preset != "preview"){
      args.fileName = myXML.Page[0].@OutputName;
      args.RSTemplate = "Best Settings";
      args.OMTemplate = argsXml.preset;

    } else {
      args.fileName = argsXml.id+ ".mp4";      
    }

    if(argsXml.preset == "MA"){
      args.fileName = args.fileName + ".mxf";
    }

    if(argsXml.preset == "XMS-HD"){
      args.fileName = args.fileName + ".mxf";
    }
 

    if(argsXml.preset == "XMS-HDMOV"){
      args.fileName = args.fileName + ".mov";      
    }

    if(argsXml.preset == "XMS-SDMOV"){
      args.fileName = args.fileName + ".mov";      
    }

    if(argsXml.preset == "XMS-MAILMOV"){
      args.fileName = args.fileName + ".mov";      
    }

    if(argsXml.preset == "XMS-HDWMP"){
      args.fileName = args.fileName + ".wmv";      
    }
    
    if(argsXml.preset == "XMS-SDWMP"){
      args.fileName = args.fileName + ".wmv";      
    }


    if(DONT_RENDER){
      forceRender = false;
    }
  
    var SubsParams = {
      'substitutions': [], // filled later
      'projectFile': PATH + "/" + projectName + "/" + projectName + ".aep", 
      'compositionName': compName,
      'outputFile': args.destination + '/' + args.fileName , 
      'OMTemplate': args.OMTemplate,
      'RSTemplate': args.RSTemplate,
      'renderLogFile': args.logDestination   
    };
    
    for each(var child in myXML) {
      for each(var subchild in child){
        if(subchild.name() == "Textbox") {
          SubsParams.substitutions.push( {'type': 'text', 'name': subchild.@name, 'substitute': subchild.toString(), 'inFrame': 'null' }, );
        } else if (subchild.name() == "Clip") {
          SubsParams.substitutions.push( {'type': 'footage', 'name': subchild.@name, 'substitute': 'file://'+subchild.toString(), 'inFrame': 'null' }, );
        }
      }
    }
        
      config.close();
    
  } else {
       throw new Error("Could not open XML input file.")
    }
  

/* This is Miranda code, do not edit*/ 
function trace(msg) {
    var date = new Date();
    var traceFile = new File(PATH + "/trace/trace.txt");
    traceFile.open("a","TEXT", "ttxt");
    traceFile.writeln(date.toString() + ": " + msg);
    traceFile.close();
}

trace("begin");

/**
   *  ValidateParameters(params)
   *
   *  Validate the params JSON object, ensuring the existence of all mandatory arguments.
   */
function validateParameters(params) {
    if (params.substitutions == null ||
        params.projectFile == null ||
        params.outputFile == null ) {
        return false;
    }
    var subIndex;
    for (subIndex = 0; subIndex < params.substitutions.length; subIndex++) {
        if (params.substitutions[subIndex].type == null ||
            params.substitutions[subIndex].name == null ||
            params.substitutions[subIndex].substitute == null) {
            return false;
        }
    }
    return true;
}

/**
   * reportError(errorText)
   *
   * When this.debug is true show errorText with an alert() dialog when false write to trace file.
   */
function reportError(errorText) {
    if (this.debug && this.popDialogs) {
        alert(errorText.toString());
    }
    trace(errorText);
}

/**
   * getTempFolder()
   *
   * Platform independent function returns a string containing the path to a temporary
   * working folder to write temporary files.
   */
function getTempFolder() {
    var folder = null;
    if ($.os.indexOf('Windows') > -1) {
        folder = new Folder($.getenv('TMP'));
    } else {
        folder = new Folder('/tmp');
    }
    return folder;
}

function AnimInfo () {
    this.startIndex = -1;
    this.numFiles = 0;
    this.numDigits = 0;
    this.path = '';
    this.filenameStarter = '';
    this.fileExtension = '';
    this.pathSeparator = '/';

    this.setFilename = function(filenameArg) {
        var filenameParts = File(filenameArg).toString().split(this.pathSeparator);
        var matches = RegExp('(.*[^0-9]{1})([0-9]{1,20})(\\..+)').exec(filenameParts[filenameParts.length-1]);
        if (matches != null && matches.length == 4) {
            this.numDigits = matches[2].length;
            if (this.numDigits > 0 && this.numDigits <= 20) {
                this.startIndex = Number(matches[2]);
                this.filenameStarter = matches[1];
                filenameParts.pop();
                this.path =filenameParts.join(this.pathSeparator);
                this.fileExtension = matches[3];
                return true;
            }
        }
        return false;
    }

    this.getDigitsAt = function(index) {
        var digits = '00000000000000000000' + String(index);
        return digits.substr(digits.length - this.numDigits);
    }
       
    this.getFilenameAt = function(index) {
        return this.path + this.pathSeparator + this.filenameStarter + this.getDigitsAt(index) + this.fileExtension;
    }

    this.isAnim = function() {
        trace("numFiles = " + this.numFiles + 
            ", startIndex = " + this.startIndex + 
            ", numDigits = " + this.numDigits + 
            ", path = " + this.path + 
            ", filenameStarter = " + this.filenameStarter + 
            ", fileExtension = " + this.fileExtension);
        return this.numFiles > 1 && this.numDigits > 0 && this.filenameStarter.length > 0 && this.fileExtension.length > 0;
    }

    this.fileAtIndexExists = function(index) {
        return File(this.getFilenameAt(index)).exists;
    }

    this.countFilesInSequence = function() {
        if (this.startIndex >= 0) {
            this.numFiles = 0;
            for (var digitsNextIndex = this.startIndex; this.fileAtIndexExists(digitsNextIndex); digitsNextIndex++, this.numFiles++) {
            }
        }
    }

    this.makeFootageName = function () {
        return this.filenameStarter + '[' + this.getDigitsAt(this.startIndex) + '-' + this.getDigitsAt(this.numFiles) + ']' + this.fileExtension;
    }
}

function getAnimInfo(filenameArg) {

    var filename = new String(filenameArg);  // ensure we're working with a string    
    var animInfo = new AnimInfo();
    
    if (File(filename).exists) {        
        // find the postion and the number of digits at end of filename and before the file extension
        if (animInfo.setFilename(filename)) {
            animInfo.countFilesInSequence();
        }
    }
    
    return animInfo;
}

/**
   * gluedCompPath(compPath, name)
   *
   * Specialized to bind the two args together, delimited by the composition path
   * delimiter, forward slash '/'.  Specialized in the sense that if the compPath is null
   * or zero-length, simply return name.  If name is null uses ''.
   */
function gluedCompPath(compPath, name) {
    var compositionPathDelimiter = '/';
    var tmpname = (name != null)? name: '';
    if (! (compPath == null || compPath == '')) {
        return compPath + compositionPathDelimiter + tmpname;
    }
    return tmpname;
}

/**
   * massageSubsParams(params)
   *
   * Insert the composition name before the names given if they do not have it already.
   * It is needed for further processing when scanning for matching tag items in 
   * functions findSubstitution() and findSubstitutionInFrame().
   */
function massageSubsParams(params) {
    var subIndex;
    var prefix = gluedCompPath(SubsParams.compositionName, '');
    for (subIndex = 0; subIndex < params.substitutions.length; subIndex++) {
        if (params.substitutions[subIndex].name.indexOf(prefix, 0) != 0) {
            params.substitutions[subIndex].name = prefix + params.substitutions[subIndex].name;
        }
        trace("massaged: " + params.substitutions[subIndex].type + ":" + params.substitutions[subIndex].name + ":" + params.substitutions[subIndex].substitute);
    }
}

/**
   * findSubstitution(subType, objName)
   *
   * Finds a matching substitution in the parameters provided to this script in the variable
   * named SubsParams.  It checks SubsParams for matching substitution.type and
   * substitution.name properties.
   * Returns a valid substitution record of the SubsParams JSON object if found, otherwise
   * null.
   */
function findSubstitution(subType, objName, compPath) {
    if (compPath == null) {
        reportError('findSubstitution: compPath is null');
        return null;
    }
    var keyName = gluedCompPath(compPath, objName);
    for (subIndex = 0; subIndex < SubsParams.substitutions.length; subIndex++) {
        if (SubsParams.substitutions[subIndex].type == subType &&
            SubsParams.substitutions[subIndex].name == keyName) {
            trace("found substitution for: " + keyName + ":" + subType + " = " + SubsParams.substitutions[subIndex].substitute);
            return SubsParams.substitutions[subIndex].substitute;
        }
    }
    trace("no substitution for: " + keyName + ":" + subType);
    return null;
}
/**
   *  findSubstitutionInFrame(subType, objName, compPath)
   *
   * Using algorithm as findSubstitution, find the objName in SubsParams but
   * return the inFrame value, if not found return '-1'.
   */
function findSubstitutionInFrame(subType, objName, compPath) {
    if (compPath == null) {
        reportError('findSubstitutionInFrame: compPath is null');
        return '-1';
    }
    var keyName = gluedCompPath(compPath, objName);
    for (subIndex = 0; subIndex < SubsParams.substitutions.length; subIndex++) {
        if (SubsParams.substitutions[subIndex].type == subType &&
            SubsParams.substitutions[subIndex].name == keyName) {
            var inFrame = SubsParams.substitutions[subIndex].inFrame;
            if (inFrame != null && inFrame != '') {
                return inFrame;
            }
        }
    }
    return '-1';
}

  function findFile(filenameToFind, folder) {
      try {
          if (folder instanceof Folder && folder.exists) {
             files = folder.getFiles('*');
             for (var i = 0; i < files.length; i++) {
                 if (files[i] instanceof Folder) {
                     var result = findFile(filenameToFind, files[i]);
                     if (result != null) {
                         return result;
                     }
                 } else if (files[0] instanceof File && filenameToFind.toLowerCase() == files[i].name.toLowerCase()) {
                     return new File(files[i]);
                 }
             }
          }
      } catch (exception) {
          reportError('findFile: exception ' + exception.toString());
      }
      return null;
  }

  function resetFootageFileReference(footage) {
      try {
          if (footage.file != null && ! footage.file.exists) {
              var projectFile = new File(SubsParams.projectFile);
              var foundFile = findFile(footage.file.name, projectFile.parent);
              if (foundFile != null) {
                  var animInfo = getAnimInfo(foundFile.toString());
                  if (animInfo.isAnim()) {
                      footage.replaceWithSequence(foundFile, true);
                      trace("reset footage with sequence " + foundFile.toString());
                  } else {
                      footage.replace(foundFile);
                      trace("reset footage with file " + foundFile.toString());
                  }
                  return true;
              }
          }
      } catch (exception) {
          reportError('resetFootageFileReference: exception ' + exception.toString());
      }
      return false;
  }

  /**
     * processFootage(footage)
     *
     * Examines the given footage object for matching substitution and performs
     * the substitution using footage.replace(File()) if a match is found and the
     * provided substitution file exists.
     */
  var replacedFootageNames = '';
  function processFootage(layer, compPath) {
      var name = layer.name;
      if (name == null) {
          reportError('processFootage: error, assertion failure, expecting a layer object');
          return;
      }
      var footage = layer.source;
      if (footage == null) {
          reportError('processFootage: error, assertion failure, given a non footage layer');
          return;
      }
      trace("walked to footage: " + name + ", in composition: " + compPath);
      var subText = findSubstitution ('footage', name, compPath);
      if (subText != null) {
          // find starting frame number in substitution text, it must trail delimited by a colon
          var frameNo = findSubstitutionInFrame('footage', name, compPath) * 1;
          try {
              var subFile = new File(subText);
              if (subFile == null) {
                  reportError("subFile cannot be null, from " + subText);
                  return;
              }
              if (footage.file != null && (footage.file.toString() == subFile.toString())) {
                  trace("skipping substitution of " + name + " because the substitute is no different than current");
                  return;
              }
              if (subFile.exists) {
                  var subFileAnimInfo = getAnimInfo(subFile.toString());
                  if (subFileAnimInfo.isAnim()) {
                      footage.replaceWithSequence(subFile, true);
                      trace("replaced footage " + name + " with sequence " + subFile.toString());
                  } else {
                      footage.replace(subFile);
                      trace("replaced footage " + name + " with file " + subFile.toString());
                  }
                  if (replacedFootageNames.indexOf(name) > 0) {
                      // tolerate but warn
                      trace("replaced footage " + name + " more than once, this time with " + subFile.toString());
                  }
                  replacedFootageNames += "," + name;
                  trace("replaced footage, " + name + ": " + subFile.toString());
                  if (footage.hasVideo && frameNo >= 0) {
                      try {
                         var prevStartTime = layer.startTime;
                         var prevInPoint = layer.inPoint;
                         var prevOutPoint = layer.outPoint;
                         layer.startTime = prevInPoint - (frameNo * footage.frameDuration);
                         layer.outPoint = prevOutPoint;
                         layer.inPoint  = prevInPoint;
                      } catch (exception) {
                          reportError('processFootage: exception ' + exception.toString() + ', error computing: layer.inPoint = ' + frameNo + ' * ' + footage.frameDuration);
                      }
                  }
              } else {
                  trace("subFile " + subFile.toString() + " does not exist, skipping substitution");
              }
          } catch (exception) {
              reportError('processFootage: exception while replacing ' + exception.toString());
          }
      }  else {
          if (resetFootageFileReference(footage)) {
              trace('reset footage in layer ' + layer.name);
          } else {
              trace('did not reset footage in layer ' + layer.name);
          }
      }
  }

  /**
     * processTextLayer(layer, compPath)
     *
     * Examines the given TestLayer object for matching substitution and performs
     * the substitution using sourceText.setValue(subText) if a match is found.
     */
  function processTextLayer(layer, compPath) {
      try {
          var sourceText = layer.sourceText;
          var subText = findSubstitution('text', layer.name, compPath);
          if (subText != null) {
              sourceText.setValue(subText);
              trace("replaced text, " + gluedCompPath(compPath, layer.name) + ": " + subText);
          }            
      } catch (exception) {
          reportError('processText: exception ' + exception.toString());
      }
  }

  /**
     * processComposition(comp)
     *
     * Examines the given composition (comp) object for matching substitutions by layer
     * names' and performs the substitution using layer.sourceText.setValue(subsitutionText)
     * if a match is found.
     */
  function processComposition(comp, compPath, layerName) {
      var slayers = '';
      var layerIndex;        
      var keyParentPath = gluedCompPath(compPath, layerName);
      
      for (layerIndex = 1; layerIndex <= comp.numLayers; layerIndex++) {
           var layer = comp.layers[layerIndex];             
           try {
               if (this.debug) {
                   slayers += 'compPath: ' + keyParentPath + ',';
                   if (layer.source != null) {
                      slayers += 'type: ' + layer.source.typeName + ',';
                   }
                   slayers += 'name: ' + gluedCompPath(keyParentPath, layer.name) + ', ';
                   slayers += 'comment: ' + layer.comment + ', ';
                   slayers += 'index: ' + layer.index;
                   slayers += '\r\n';
               }
               if (layer instanceof TextLayer) {
                   processTextLayer(layer, keyParentPath);
               } else if (layer instanceof AVLayer && layer.source != null) {
                   if (layer.source instanceof FootageItem) {
                       processFootage(layer, keyParentPath);
                   } else if (layer.source instanceof CompItem) {
                       processComposition(layer.source, keyParentPath, layer.name);
                   } 
               }
           } catch (exception) {
               reportError('processComposition: exception ' + exception.toString());
           }
      }
      if (this.debug && this.popDialogs) {
          //alert(slayers);
      }
  }

  /**
     * performSubstitutions(project)
     *
     * This is the entry point for processing the substitutions provided in the SubsParams
     * JSON object provided to the script by the caller.  It iterates through the named
     * composition and footage items and calls further functions to find matches and
     * peforms the substitutions.  This function should be expanded to provide more
     * functionality of performing substitutions on additional object types.
     */
  function performSubstitutions(project) {
      var sitems = '';
      var i;
      var processed = false;
      for (i = 1; i <= project.numItems && ! processed; i++) {
          var item = project.items[i];
          if (this.debug) {
              sitems += 'name: ' + item.name + ', ';
              sitems += 'comment: ' + item.comment + ', ';
              sitems += 'id: ' + item.id + ', ';
              sitems += 'type: ' + item.typeName + ', ';
              sitems += '\r\n';
          }
          switch (item.typeName) {
          case 'Composition':
              if (SubsParams.compositionName == "" || item.name == SubsParams.compositionName) {
                  // Assume the first composition if none is provided in SubsParams
                  SubsParams.compositionName = item.name;
              }
              if (item.name == SubsParams.compositionName) {
                  massageSubsParams(SubsParams);
                  processComposition(item, '', item.name);
                  processed = true;
              }
              break;
          }
      }
      if (this.debug && this.popDialogs) {
          //alert(sitems);
      }
  }

  /** 
      * build_render_script(params)
      *
      * Build a string that calls gAECommandLineRenderer.Render based on the parameters
      * provided to this script.  The parameters are assumed to come from a  JSON object
      * defined and instantiated by the caller of this script.  We are using a map of argument
      * names because the naming convention used by gAECommandLineRenderer.Render
      * really known as aerender.exe is inconsistent.  We want a consistent convention of
      * argument names.
      * The only way to call gAECommandLineRenderer.Render is as shown here:
      *
      *      gAECommandLineRenderer.Render('-project','project.aep','-comp','Comp 1', '-output','clip.mpg');
      *  
      * Since we are mapping names and especially because all arguments as essentially
      * optional and not ordered, we have to construct a script in a string which makes the call.
      * It is expected the caller of this function will call eval() with the result string.  As such:
      *
      *       eval(build_render_script(jsonobject_with_params));
      *
      * There is no other practical way of doing this.
      */
  function build_render_script(params) {
      var argmap = [
          ['projectFile','project'],
          ['compositionName','comp'],
          ['outputFile','output'],
          ['renderLogFile','log'],
          ['OMTemplate','OMtemplate'],
          ['rqIndex','rqindex'],
          ['startFrame','s'],
          ['endFrame','e'],
          ['RSTemplate','RStemplate'],
          ['increment','i'],
          ['memUsage','mem_usage'],
          ['continueOnMissingFootage','continueOnMissingFootage'],
          ['Port','port']
          ];
      var resultArgs = new Array(0);
      var addedPort = false;
      for (iarg = 0; iarg < argmap.length; iarg++) {
/*
          if (this.usePort && argmap[iarg][0] == 'renderLogFile') {
              continue;
          } else*/ if (argmap[iarg][0] == 'Port') {
              addedPort = true;
          }

          if (params[argmap[iarg][0]] != null) {
              resultArgs.push('"-' + argmap[iarg][1] + '"');
              resultArgs.push('"' + params[argmap[iarg][0]] + '"');
          }
      }
      if (this.usePort && ! addedPort) {
          resultArgs.push('"-port"');
          resultArgs.push('"127.0.0.1:' + this.portNumber + '"');
      }
      return 'gAECommandLineRenderer.Render(' + resultArgs.join(',') + ');'
  }

  /**
     * render(projectFile)
     *
     * Performs the rendering operation on the given project file using params
     * provided in the SubsParams JSON object.  It depends on the AE built in
     * startup script called AECommandLineRenderer.jsx, found in, 
     * c:\Program Files\Adobe\Adobe After Effects CS5\Support Files\Scripts\Startup
     */
  function render(projectFile) {
      if (typeof gAECommandLineRenderer == 'undefined') {
          app.exitCode = 13;
      } else {
          SubsParams.projectFile = projectFile.toString();
          try {
              app.exitCode = 0;
              eval(build_render_script(SubsParams));
              trace("aerender exitCode = " + app.exitCode);
          } catch (exception) {
              reportError('render: exception ' + exception.toString());
          }
      }
  }

  /**
     * main()
     *
     * Serves as the second main entry point for this script.  It validates parameters
     * checks for files and paths, and if is correct, performs the actual function of
     * this script to make substitutions on a composition and follow up by rendering
     * the composition to an output file.
     */
  function main() {
      var proceed = true;

      if (! validateParameters(SubsParams)) {
          reportError("main: error, invalid parameters");
          app.exitCode = 1;
          return;
      }

      var projectFile = new File(SubsParams.projectFile);
      var outputFile = new File(SubsParams.outputFile);

      try {
          if (app.project != null) {
              app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
          }
      } catch (exception) {
      }

      if (! projectFile.exists) {
          reportError("main: error, project " + projectFile.toString() + " does not exist or cannot be read");
          app.exitCode = 1;
          proceed = false;
      } else if (outputFile.exists) {
          try {
              if (! outputFile.remove()) {
                  reportError("main: error, output file " + outputFile.toString() + " could not be clobbered");
                  app.exitCode = 2;
                  proceed = false;
              }
          } catch (exception) {
            app.exitCode = 1;
            proceed = false;
          }
        }

        if (proceed) {
          app.exitCode = 0;
          var tempProjectFile = new File(getTempFolder().fullName + '/' + (new Date()).getTime().toString(16) + '.aep');
          
         try { // We can remove this try while testing 

          if (app.openFast(projectFile) == null) {
           reportError("main: error, failed to open project " + projectFile.toString());
           app.exitCode = 99;                 
         } else {
          performSubstitutions(app.project);

          /* START of injected code block */
          loadNestedScript();
          /* END of injected code block */

          if(forceRender == true){
            tempProjectFile.remove();                        
            app.project.save(tempProjectFile);
            app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
            if (this.performRender) {
              trace("Calling render.");
              render(tempProjectFile);
              trace("Returned from render.");
            }
            else {
              trace("this.performRender is false, rendering skipped.");
            }
          }
        }
      } catch (exception) {
        reportError('main: exception ' + exception.toString());
        app.exitCode = 10;
      //  app.quit();

      } finally {
        trace('finally');
        tempProjectFile.remove();
        app.exitCode = 0;
       // app.quit();
      }
    }
  }

  /**
     * Script Entry Point!
     
     * The script starts here.
     */
  /**
     *  this.debug
     *
     *  Set to true to show alerts in reportError and not set $.level to 0.
     */

     this.debug = DEBUG;
     this.popDialogs = this.debug;
     this.performRender = true;
     this.usePort = true;
     this.portNumber = 4567;

    // set up the script environment
    if (!this.debug) {
        // set $.level to 0 so the ExtendScript debugger window won't popup in production mode
        $.level = 0;  // watch out!  This will make your debugger window disappear if you are stepping through this code
        app.exitAfterLaunchAndEval = true;
        app.saveProjectOnCrash = true;
        app.beginSuppressDialogs();
      } else {
        $.level = 2;
      }

      trace("calling main");
    main(); // begin validation and processing
    trace("returned from main");
    
    //app.quit();
    $.sleep(2000)
    app.quit();
    
    /* START of injected code block */
    function loadNestedScript() {
          $.evalFile(PATH + "/init.jsx"); // Todo: this need to be an absolute path on  SAN
    }
    
}
