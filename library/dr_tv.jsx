{
 
    var DR_TV = new Object();
    
    DR_TV.addLogoVender = function () {
            if(_.getBoolParam("HASDRTVLOGO", 1)) {
                
                var tI   = _.getTimeParam("DRTVLOGO-TIME-IN", 1);
                var tO   = _.getTimeParam("DRTVLOGO-TIME-OUT", 1);
                var tD   = tO - tI;
                var lTxt = _.getStringParam("DRTVLABEL", 1);
                
                var logoComp  = _.getComp("LOGOCOMP_MAIN");
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
                    _.movePropKeys(labelLayer, 9, 10, -(10 - (tD - outAnimDur)));
                }
                
                var startLogoLayer = logoComp.getLayer(_.getStringParam("CHANNEL",1) + "_in_place_out");
                var endLogoLayer   = startLogoLayer.clone();
                
                startLogoLayer.outPoint = tI;
                endLogoLayer.startTime  = tO;
            }
        };
}