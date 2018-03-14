

function DR_Mastergrid_C() {

    /* addLogoBug
        adds logo scale in and scale out

        Arguments:
            options: {
                inTimeSeconds: float seconds
                outTimeSeconds: float seconds
                channel: enum channel, defaults to DR2
                version: enum break, program (todo: takeover ? )
                align: "LEFT" || "RIGHT" || "TOPLEFT"
                TODO: stage - default to project.stage 
            }
    */

    var _this = this;
    var isProjectLoaded = false; 
    var transitionTimeSeconds = 0.6;
    // transitions over this time linear scale and opacity 0 - 100%
    var projectPath = PATH+'/../../../AirlookMaster/master.aep';

    //
    _this.logos = {};
    
    var getLogoAtTime = function(t) {
        
        for(var l=0; l<_this.logos.length; l++) {
            if(_this.logos[l].inTimeSeconds <= t && _this.logos[l].outTimeSeconds >= t) {
                return _this.logos[l];
            }
        }

    }

    var __construct = function() {
        loadProject();
    }

    var loadProject = function() {
        if(!isProjectLoaded) {
            //utils.loadProject(projectPath);
            isProjectLoaded = true;
            // or check if master.aep is loaded ? 
        }
    }

    // should be called after all calls to addLogoBug
    this.addDRTVTakeover = function(options) {
        o = options;
        o.channel = "DRTV";
        o.stage = o.stage || project.stage;

        o.align = o.align || "TOPLEFT";        
        o.position = o.position || [120,60]; // default topleft pos

        o.uCID = "Logo takeover " + " [" + o.inTimeSeconds + " - " + o.outTimeSeconds + "]";    

        o.duration = o.outTimeSeconds - o.inTimeSeconds;

        // "BREAKLOGO_SQ_DRTV_TAKEOVER+PLACE"
        // takeover DRTV logo

        var inPlaceComp = _.getComp("DRTV+TAKEOVER+PLACE").clone("in place " + o.uCID );
        var outComp = _.getComp("DRTV+OUT").clone("out " + o.uCID );

        inPlaceComp.duration = o.duration;
        var inPlaceLayer = inPlaceComp.addToComp(o.stage);
        var outLayer = outComp.addToComp(o.stage);

        inPlaceLayer.startTime = o.inTimeSeconds;
        inPlaceLayer.outPoint = o.outTimeSeconds - transitionTimeSeconds;
        outLayer.startTime = o.outTimeSeconds - transitionTimeSeconds;
        
        if(o.align === "LEFT") { // , center
            inPlaceLayer.setAnchor([0, logoLayer.getAnchor()[1]]);
            outLayer.setAnchor([0, logoLayer.getAnchor()[1]]);
        } else if(o.align === "RIGHT") { // , center
            inPlaceLayer.setAnchor([logoLayer.getWidth(),logoLayer.getAnchor()[1]]);
            outLayer.setAnchor([logoLayer.getWidth(),logoLayer.getAnchor()[1]]);
        } else if(o.align === "TOPLEFT") {
            inPlaceLayer.setAnchor([0, 0 ]);
            outLayer.setAnchor([0, 0 ]);
        }

        inPlaceLayer.setPos(o.position);
        outLayer.setPos(o.position);

        // Special case for DRK toptext
        // DRK_TOPTEXT_SQ_IN+PLACE
        if(project.SETTINGS.CHANNEL === "DRK" && o.label) {
            var topTextComp = _.getComp("DRK_TOPTEXT_SQ_IN+PLACE").clone("label " + o.uCID);
            var topTextLayer = topTextComp.addToComp(o.stage);
            var tLayer = topTextComp.getLayer("TOPTEXT_62PX");
            // out is fade opacity in 0.4 seconds
            tLayer.setText(o.label).enable();
            
            topTextComp.duration = o.duration;
            topTextLayer.startTime = o.inTimeSeconds + transitionTimeSeconds;

            tLayer.transform.opacity.setValueAtTime(o.duration - 0.4 - transitionTimeSeconds, 100);
            tLayer.transform.opacity.setValueAtTime(o.duration - transitionTimeSeconds, 0);
        }

        if(project.SETTINGS.CHANNEL === "DR3" && o.label) {
            var topTextComp = _.getComp("DR3_TOPTEXT_SQ").clone("label " + o.uCID);
            var topTextLayer = topTextComp.addToComp(o.stage);
            var tLayer = topTextComp.getLayer("TOPTXT_42PX");
            tLayer.setText(o.label).enable();
            
            topTextComp.duration = o.duration;
            topTextLayer.startTime = o.inTimeSeconds + transitionTimeSeconds;
        }        

        // add toptext next to 
        // o.label


        // go back to logo in logos data 
        //var logoTakeBackData = getLogoAtTime(o.outTimeSeconds);

        // animate position
        // 40, 120 to 40, 40  = ypos +80

    }


    this.addLogoBug = function(options) {
        o = options;
        if(o.channel === "NO_LOGO") return false;

        // set defaults
        o.channel = o.channel || project.SETTINGS.CHANNEL;
        o.stage = o.stage || project.stage;
        o.version = o.version || "break";
        o.inTimeSeconds = o.inTimeSeconds || 0.0;
        o.outTimeSeconds = o.outTimeSeconds || project.duration;
        o.align = o.align || "TOPLEFT";        
        o.position = o.position || [120,60]; // default topleft pos

        // set computed options
        o.duration = o.outTimeSeconds - o.inTimeSeconds;
        o.uCID = "Logobug " + o.channel + ":" + o.version + " [" + o.inTimeSeconds + " - " + o.outTimeSeconds + "]";    

        var logoComp;
        var logoLayer;
        var logoInnerLayer;

        if(version === "program") {
            logoComp = _.getComp("_VM_T_PLACE_" + o.channel).clone("VM Logo " + o.uCID);
            logoInnerLayer = logoComp.getLayer("VM_TRANSP_REGULERING_DRK");

        } else {

            var logoCompName;
            if(DR_Utils.isChannelLogoSquare(o.channel)) {
                logoCompName = "IPP_KANALLOGO-SQ-80PX";
            } else {
                if(channel === "DR") {
                    // TODO: get koncern logo 130px
                } else {
                    logoCompName = "IPP_KANALLOGO-RKT-80PX";
                }
            }

            logoComp = _.getComp(logoCompName).clone("Logo " + o.uCID);
            logoComp.disableAll();
            logoInnerLayer = logoComp.getLayer(o.channel);
            logoInnerLayer.enable();
        }

        logoLayer = logoComp.addToComp(o.stage);
        logoLayer.startTime = o.inTimeSeconds;
        
        logoComp.duration = o.duration;
        logoLayer.outPoint = o.outTimeSeconds;
        logoInnerLayer.outPoint = o.duration;

        var bTIn = true;
        var bTOut = true;

        if(o.version === "program") {
            if(o.inTimeSeconds === 0) {
                bTIn = false; // cut on vandmærke
            }
            if(o.outTimeSeconds === project.duration) {
                bTOut = false; // cut off vandmærke
            }
        }

        // double intime here becuase bith inner and outer intimeseconds fix !
        if(bTIn) {
            logoInnerLayer.transform.opacity.setValueAtTime(0, 0);
            logoInnerLayer.transform.opacity.setValueAtTime(0 + transitionTimeSeconds, 100);
            logoInnerLayer.transform.scale.setValueAtTime(0, [0,0]);
            logoInnerLayer.transform.scale.setValueAtTime(0 + transitionTimeSeconds, [100,100]);
        }

        if(bTOut) {
            logoInnerLayer.transform.opacity.setValueAtTime(o.duration - transitionTimeSeconds, 100);
            logoInnerLayer.transform.opacity.setValueAtTime(o.duration, 0);
            logoInnerLayer.transform.scale.setValueAtTime(o.duration - transitionTimeSeconds, [100,100]);
            logoInnerLayer.transform.scale.setValueAtTime(o.duration, [0,0]);
        }

        if(o.align === "LEFT") { // , center
            logoLayer.setAnchor([0, logoLayer.getAnchor()[1]]);
        } else if(o.align === "RIGHT") { // , center
            logoLayer.setAnchor([logoLayer.getWidth(),logoLayer.getAnchor()[1]]);
        } else if(o.align === "TOPLEFT") {
            logoLayer.setAnchor([0, 0 ]);
        }

        logoLayer.setPos(o.position);

        /*
        inLayer.startTime = inTimeSeconds;
        if(version === "program"){
            inLayer.getComp().duration = transitionTimeSeconds;
            inLayer.getComp().outPoint = inTimeSeconds + transitionTimeSeconds;
        }

        freezeLayer.getComp().duration = outTimeSeconds - inTimeSeconds;
        freezeLayer.getComp().layers[1].outPoint = outTimeSeconds - inTimeSeconds;
        freezeLayer.startTime = inTimeSeconds + transitionTimeSeconds;
        freezeLayer.outPoint = outTimeSeconds - transitionTimeSeconds;
        outLayer.startTime = outTimeSeconds - transitionTimeSeconds;
        */
       
        // save data
        _this.logos.push(o);

        return logoLayer;
    };

    //this.addLogoTakeOver = function(options) {
        // use for DR TV logovender at first

    //}

    __construct();

}

var DR_Mastergrid = new DR_Mastergrid_C();
