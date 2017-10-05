/** 
 * Object that contains usefull fuctions that are sued across all channels
 * and relate specifically to DR
*/

/*
colors in comments picked from logos in IPP project 2017
*/

function DR_Utils_C() {

    var CHANNELS = [

        // TODO: change to something like widthAsPercentOfHeight instead of logoShape 
        {name: "DR1", logoShape: "SQUARE", color: [255, 0, 30] },
        {name: "DR2", logoShape: "SQUARE", color: [0, 200, 255] },
        {name: "DR3", logoShape: "SQUARE", color: [0, 215, 0] },
        {name: "DRU", logoShape: "SQUARE", color: [228, 255, 23] },
        {name: "DRK", logoShape: "SQUARE", color: [87, 49, 140] },
        {name: "DRR", logoShape: "SQUARE", color: [0, 254, 254 ] },
    
        {name: "P1", logoShape: "RECTANGLE", color: [ 255, 100, 0] },
        {name: "P2", logoShape: "RECTANGLE", color: [0, 50, 160 ] },
        {name: "P3", logoShape: "RECTANGLE", color: [140, 160, 160] },
        {name: "P4", logoShape: "RECTANGLE", color: [255, 160, 0] },
        {name: "P5", logoShape: "RECTANGLE", color: [210, 28, 93 ] },
        {name: "P6", logoShape: "RECTANGLE", color: [80, 75, 80 ] },
        {name: "P7", logoShape: "RECTANGLE", color: [0, 159, 139] },
        {name: "P8", logoShape: "RECTANGLE", color: [115, 45, 140] },

        {name: "LB", logoShape: "RECTANGLE", color: [0,0,0] }, // DEPRECATE

        {name: "DRDK", logoShape: "RECTANGLE", color: [5, 9, 2 ] },

        {name: "DR", logoShape: "RECTANGLE", color: [0, 0, 0 ] },
        
        {name: "DRTV", logoShape: "RECTANGLE", color: [255, 212, 0 ] }
    ];

    this.getAllChannels = function() {
        return CHANNELS.slice();
    }

    this.getChannelColor = function(logo) { 
        // AE needs decimal values, but AE's color picker displays them as 0-255
        return this.getChannelInfo(logo).color / 255.0;
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