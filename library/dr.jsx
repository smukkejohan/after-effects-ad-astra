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
        {name: "DR1", logo: {width:80, height:80}, color: [255, 0, 30] },
        {name: "DR2", logo: {width:80, height:80}, color: [0, 200, 255] },
        {name: "DR3", logo: {width:80, height:80}, color: [0, 215, 0] },
        {name: "DRU", logo: {width:80, height:80}, color: [228, 255, 23] },
        {name: "DRK", logo: {width:80, height:80}, color: [87, 49, 140] },
        {name: "DRR", logo: {width:80, height:80}, color: [0, 254, 254 ] },
        {name: "P1", logo: {width:120, height:80}, color: [ 255, 100, 0] },
        {name: "P3", logo: {width:120, height:80}, color: [140, 160, 160] },
        {name: "P2", logo: {width:120, height:80}, color: [0, 50, 160 ] },
        {name: "P4", logo: {width:120, height:80}, color: [255, 160, 0] },
        {name: "P5", logo: {width:120, height:80}, color: [210, 28, 93 ] },
        {name: "P6", logo: {width:120, height:80}, color: [80, 75, 80 ] },
        {name: "P7", logo: {width:120, height:80}, color: [0, 159, 139] },
        {name: "P8", logo: {width:120, height:80}, color: [115, 45, 140] },
        {name: "DRDK", logo: {width:120, height:80}, color: [5, 9, 2 ] },
        {name: "DRTV", logo: {width:120, height:80}, color: [255, 212, 0 ] },
        {name: "DR", logo: {width:130, height:41}, color: [255, 0, 30] }, // 40.625
    ];

    this.getAllChannels = function() {
        return CHANNELS.slice();
    };

    this.getChannelColor = function(logo) { 
        // AE needs decimal values, but AE's color picker displays them as 0-255
        return this.getChannelInfo(logo).color / 255.0;
    };

    this.getChannelInfo = function(channel) {
        var channels = this.getAllChannels();
        for(var i=0; i< channels.length; i++) {
            if(channels[i].name === channel) {
                return channels[i];
            }
        }
    };

    this.getChannelLogoWidthInPixels = function(channel) {
        return this.getChannelInfo(channel).logo.width;
    };

    this.getChannelLogoHeightInPixels = function(channel) {
        return this.getChannelInfo(channel).logo.height;
    };

    this.isChannelLogoSquare = function(channel) {
        var logoInfo = this.getChannelInfo(channel).logo;

        return (logoInfo.width === logoInfo.height);
    }; 
}

var DR_Utils = new DR_Utils_C();