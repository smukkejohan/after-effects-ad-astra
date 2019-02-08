﻿var AIRLOOKFRAMEWORK_PATH = new File($.fileName).path;

// deprecate this - include all dependencies instead from project itself
$.evalFile(AIRLOOKFRAMEWORK_PATH + "/adastra.jsx");

{
	var SETTINGS;

	var handleFootage = function () {
		for (var i = 0; i < SubsParams.clips.length; i++) {

			var name = SubsParams.clips[i].name; //.toString().replace('{','').replace('}','')
			remoteLog("Try to import " + name);
			try {
				var comp = _.getItem(name);
			} catch (e) {
				remoteLog("Could not find footage composition " + name);
				comp = undefined;
			}
			if (comp) {
				//  try {
				var fn = new File(SubsParams.clips[i].substitute);
				if (fn.exists) {

					comp.replace(fn);
					remoteLog("Imported " + SubsParams.clips[i].substitute, "debug");

					if(!comp.mainSource.isStill){
						comp.mainSource.fieldSeparationType = FieldSeparationType.UPPER_FIELD_FIRST;
					}

					var match = SubsParams.clips[i].name.toString().match(/\{((\S+)-\d)\}/);

					if (match) {
						var usageComp = utils.getComp(match[1]);
						if (usageComp) {
							var layers = usageComp.getAllLayers();
							for (var il = 0; il < layers.length; il++) {
								if (layers[il].hasVideo === true) {
									try {
										layers[il].scaleToHD();
									} catch (e) {}
									layers[il].setTimeRemap();
								} else if (layers[il].hasAudio === true){
									layers[il].outPoint = comp.duration;
								}
							}
						}

						var usageComp2 = utils.getComp(match[2]);
						if (usageComp2) {
							var layers = usageComp2.getAllLayers();
							for (var il = 0; il < layers.length; il++) {
								if (layers[il].hasVideo === true) {
									try {
										layers[il].scaleToHD();
									} catch (e) {}
									layers[il].setTimeRemap();
								} else if (layers[il].hasAudio === true){
									layers[il].outPoint = comp.duration;
								}
							}
						}
					}
				} else {
					remoteLog("Could not import " + SubsParams.clips[i].substitute + " file is missing", "error");
					throw new Error("Could not import " + SubsParams.clips[i].substitute + " file is missing");
				}
				/*} catch(e) {
remoteLog("Could not import "+SubsParams.clips[i].substitute+ " Error: "+e.message, "error")
          //$.write("Could not replace "+name+" "+e.message)
        }*/
			}
		}
	};

	var build = function () {
		if (!app.project) {
			throw new Error("No project is loaded");
		} else {
			handleFootage();

			mainComp = _.getComp("stage");
			if (!mainComp) {
				mainComp = _.createComp("stage");
			}

			projectName = SubsParams.projectName;
			projectVersion = SubsParams.projectVersion;

			SubsParams.params['BASEPATH'] = new File($.fileName).parent.parent.path;

			// get all subprojects
			if (File(AIRLOOKFRAMEWORK_PATH + "/../subprojects/subprojects.jsx").exists) {
				$.evalFile(AIRLOOKFRAMEWORK_PATH + "/../subprojects/subprojects.jsx");
			}



			// get project file
			$.evalFile(AIRLOOKFRAMEWORK_PATH + "/../scripts/" + projectName + ".jsx");
			SETTINGS = project.SETTINGS;
			project.create();
		}
	};

	app.beginUndoGroup("UNDO LOVENEST");
	build();
	app.endUndoGroup();
}
