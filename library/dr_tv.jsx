{
 
    var DR_TV = new Object();
    

// TODO: new add logovender comp that can be used multiple times and is compatible with mastergrid  
// TODO: make sure we have overlap for takeover on DRK and DR3 ... 

    /*

        Add drtv logo takeover with otional label

        options = {
            title: 
        }
    */
    DR_TV.add = function(inTimeSeconds, outTimeSeconds, options) {

        

    };



    DR_TV.addLogoVender = function (_logoComp, _placeLogoLayerName, _i) {
    
            var logoComp;
            var i;
            if(!_i) {
                i = 1;
            } else {
                i = _i;
            }
            
            
            if(!_logoComp) {
                logoComp  = _.getComp("LOGOCOMP_MAIN");
            } else {
                logoComp = _logoComp;
            }
    
    
        var startLogoLayer;
    
        if(!_placeLogoLayerName) {
            startLogoLayer = logoComp.getLayer(_.getStringParam("CHANNEL",i) + "_in_place_out");
        } else {
            startLogoLayer = logoComp.getLayer(_placeLogoLayerName);
        }
        
            if(_.getBoolParam("HASDRTVLOGO", i)) {
                
                var tI   = _.getTimeParam("DRTVLOGO-TIME-IN", i);
                var tO   = _.getTimeParam("DRTVLOGO-TIME-OUT", i);
                var tD   = tO - tI;
                var lTxt = _.getStringParam("DRTVLABEL", i);
                
                var drTvLayer = logoComp.getLayer("DRTV_vender_in_place_out");
                var drTvComp  = drTvLayer.getComp();
                
                //var startLayer = drTvComp.getLayer("START");
                var stillLayer = drTvComp.getLayer("STILL");
                var slutLayer  = drTvComp.getLayer("SLUT");
                var labelLayer = drTvComp.getLayer("LABEL");
                
                drTvLayer.enable();
                drTvComp.duration   = tD;
                drTvLayer.startTime = tI;
                drTvLayer.outPoint  = tO;
                
                var outAnimDur = slutLayer.getComp().duration; //slutLayer.outPoint - slutLayer.startTime;
                
                //TODO: freeze frame at method ... simplify these 2 lines
                stillLayer.setTimeRemap(tD - outAnimDur);
                _.movePropKeys(stillLayer, 0, tO, tO*2);
                
                slutLayer.startTime = tD - outAnimDur;
                
                if(lTxt !== "") {
                    labelLayer.setText(lTxt);
                    labelLayer.outPoint = tD - outAnimDur;
                    labelLayer.enable();
                    _.movePropKeys(labelLayer, 9, 10, -(10 - (tD )));
                }
    
                var endLogoLayer   = startLogoLayer.clone();
                
                if(startLogoLayer.isComp()) {
    
                    startLogoLayer.outPoint = tI;
                    endLogoLayer.startTime  = tO;
                    
                } else {
    
                    startLogoLayer.outPoint = tI;
                    endLogoLayer.inPoint  = tO;
                }
            }
        };
}