'use strict';
var broadlink = require('broadlinkjs-sm');

var b = new broadlink();

b.on("deviceReady", (dev) => {
    
    if(dev.getType() !== 'A1') {
        console.log(dev.getType() + 'Not a supported device yet.')
        return;
    }

    console.log("New device %s host: %j, mac: %j", dev.getType(), dev.host, dev.mac);

    var raw_info=false;
    
    var timer = setInterval(function(){
        console.log("send check!");
        if (raw_info) {
        	dev.check_sensors_raw();
        } else {
        	dev.check_sensors();
        }
        raw_info = ! raw_info;
    }, 1000);
    

    dev.check_sensors();
    dev.on("all_info", (info)=>{
        console.log("get all_info %j", info);
    });

    dev.on("temperature", (info)=>{
        console.log("get temperature %s", info);
    });
});

b.discover();
