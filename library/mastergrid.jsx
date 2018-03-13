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
    var transitionTimeSeconds = 0.6;
    // transitions over this time linear scale and opacity 0 - 100%
            
    this.addLogoBug = function(options) { 
        
        var channel = options.channel || project.SETTINGS.CHANNEL;
        var stage = options.stage || project.stage;        
        
        if(channel === "NO_LOGO") return false;
        
        var version = options.version || "break";
        var inTimeSeconds = options.inTimeSeconds || 0.0;
        var outTimeSeconds = options.outTimeSeconds || project.duration;

        var align = options.align || "TOPLEFT";
        var pos = options.position || [120,60]; // default topleft pos

        var duration = outTimeSeconds - inTimeSeconds;

        if(version === "program") { // We are only home anyway
            channel = "DR2";
        }
        
        var uCID = "Logobug " + channel + ":" + version + " [" + inTimeSeconds + " - " + outTimeSeconds + "]";

        //var inLayer, freezeLayer, outLayer;
        var logoComp;
        var logoLayer;
        var logoInnerLayer;

        if(version === "program") {
            logoComp = _.getComp("_VM_T_PLACE_" + channel).clone("VM Logo " + uCID);
            logoInnerLayer = logoComp.getLayer("VM_TRANSP_REGULERING_DRK");

        } else {

            var logoCompName;
            if(DR_Utils.isChannelLogoSquare(channel)) {
                logoCompName = "IPP_KANALLOGO-SQ-80PX";
            } else {
                if(channel === "DR") {
                    // TODO: get koncern logo 130px
                } else {
                    logoCompName = "IPP_KANALLOGO-RKT-80PX";
                }
            }

            logoComp = _.getComp(logoCompName).clone("Logo " + uCID);
            logoComp.disableAll();
            logoInnerLayer = logoComp.getLayer(channel);
            logoInnerLayer.enable();
        }

        logoLayer = logoComp.addToComp(stage);

        logoLayer.startTime = inTimeSeconds;
        
        logoComp.duration = duration;
        logoLayer.outPoint = outTimeSeconds;
        logoInnerLayer.outPoint = duration;

        var bTIn = true;
        var bTOut = true;

        if(version === "program") {
            if(inTimeSeconds === 0) {
                bTIn = false; // cut on vandmærke
            }
            if(outTimeSeconds === project.duration) {
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
            logoInnerLayer.transform.opacity.setValueAtTime(duration - transitionTimeSeconds, 100);
            logoInnerLayer.transform.opacity.setValueAtTime(duration, 0);
            logoInnerLayer.transform.scale.setValueAtTime(duration - transitionTimeSeconds, [100,100]);
            logoInnerLayer.transform.scale.setValueAtTime(duration, [0,0]);
        }

        if(align === "LEFT") { // , center
            logoLayer.setAnchor([0, logoLayer.getAnchor()[1]]);
        } else if(align === "RIGHT") { // , center
            logoLayer.setAnchor([logoLayer.getWidth(),logoLayer.getAnchor()[1]]);
        } else if(align === "TOPLEFT") {
            logoLayer.setAnchor([0, 0 ]);
        }

        logoLayer.setPos(pos);

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
       
        return logoLayer;
    };

    //this.addLogoTakeOver = function(options) {
        // use for DR TV logovender at first

    //}
}

var DR_Mastergrid = new DR_Mastergrid_C();
