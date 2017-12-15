

$.evalFile("adastra.jsx");


function sampleAverageFootageColor(options) {

    var footageName = options.footageName || "FOOTAGE";
    
    var inT = options.inTimeSeconds || 0;
    var outT = options.outTimeSeconds || project.duration;
    var dur = outT - inT;
    var pos = options.position || [960,540];
    //var xy_samples = options.xy_samples || [3,3];
    var sampleExtent = options.sampleExtent || [180,180];
    var sampleType = options.sampleType || "PER_SECOND";

    var samples;
    if(sampleType === "PER_SECOND") {
        samples = options.samples || 4;
        samples *= dur;
    } else {
        samples = options.samples || 20;
    }

    samples = 27;

    var uCID = "SAMPLE " + footageName + "[" + inT + "-" + outT + "]";
   
    var sampleComp = _.getComp("SAMPLE").clone(uCID);
    var mLayer = sampleComp.getLayer("SAMPLE_MOSAIC").cloneComp(uCID + "mosaic");
    var mComp = mLayer.getComp();

    // potentially more efficientto sample with a mosaic whle keeping sampleExtent to 1 pixel ?
    //var mE = mLayer("Effects")("Mosaic");
    //mE("Horizontal Blocks").setValue(xy_samples[0]);
    //mE("Vertical Blocks").setValue(xy_samples[1]);

    // add footage
    var fLayer = _.getComp(footageName).addToComp(mComp);
    
    for(var s=0; s<samples; s++) {
        var _l = fLayer.clone(" s:" + s + " " + footageName);

        // stack sample frames at time 0
       _l.startTime = -(inT + ((dur/samples)*s));

       // set opacity
       _l("Transform")("Opacity").setValue(Math.floor(100.0/samples * (s+1)));
    }

    var expr = "sampleImage([" + pos[0] + "," + pos[1] + "], [" + sampleExtent[0] + "," + sampleExtent[1] + "])";
    var cC = mLayer("Effects")("Color Control")("Color");
    cC.expressionEnabled = true;
    cC.expression = expr;

    //$.sleep(1000);  // hacky way recommended by AE to avoid this being async when it should not be 
    
    //var timeStr = system.callSystem("date +%s");
    //$.writeln("Start time: " + timeStr);
    while(cC.value[3] === 0) {
        // wait for result of expr - in profiling took under 1 ms 
    }
    var res = cC.value;
   // timeStr = system.callSystem("date +%s");
   // $.writeln("After time: " + timeStr);

    //$.bp();
    //$.writeln(res);
    return res;
}