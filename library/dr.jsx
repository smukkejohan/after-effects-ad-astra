/** 
 * Object that contains usefull fuctions that are sued across all channels
 * and relate specifically to DR
*/

function DR_Utils_C() {

    var CHANNELS = [
        {name: "DR1", logoShape: "SQUARE", color: "" },
        {name: "DR2", logoShape: "SQUARE", color: "" },
        {name: "DR3", logoShape: "SQUARE", color: "" },    
        {name: "DRU", logoShape: "SQUARE", color: "" },
        {name: "DRK", logoShape: "SQUARE", color: "" },
        {name: "DRR", logoShape: "SQUARE", color: "" },
    
        {name: "P1", logoShape: "RECTANGLE", color: "" },
        {name: "P2", logoShape: "RECTANGLE", color: "" },
        {name: "P3", logoShape: "RECTANGLE", color: "" },
        {name: "P4", logoShape: "RECTANGLE", color: "" },
        {name: "P5", logoShape: "RECTANGLE", color: "" },
        {name: "P6", logoShape: "RECTANGLE", color: "" },
        {name: "P7", logoShape: "RECTANGLE", color: "" },
        {name: "P8", logoShape: "RECTANGLE", color: "" },
        {name: "LB", logoShape: "RECTANGLE", color: "" },
        {name: "DRDK", logoShape: "RECTANGLE", color: "" },
        {name: "DRTV", logoShape: "RECTANGLE", color: "" },
    ];

    this.getAllChannels = function() {
        return CHANNELS.slice();
    }

    this.getChannelInfo = function(channel) {
        var channels = this.getAllChannels();
        for(var i=0; i< channels.length; i++) {
            if(channels[i].name === channel) {
                return channels[i];
            }
        }
    }

    this.isChannelLogoSquare = function(logo) {
        return this.getChannelInfo(logo).logoShape === "SQUARE";
    }  

}

var DR_Utils = new DR_Utils_C();