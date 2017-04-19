'use strict';
let broadlink = require('broadlinkjs-sm');
let fs = require('fs');

var b = new broadlink("192.168.1.92"); // your SP ip here
b.discover();

b.on("deviceReady", (dev) => {
    setTimeout(function() {
        console.log("send check!");
        dev.check_power();
    }, 1000);

    dev.on("power", (pwr) => {
        console.log("power is on " + pwr);
        //dev.exit();
    });

    setTimeout(function() {
        console.log("power ON...");
        dev.set_power(true);
        //dev.check_power();
    }, 4000);

    setTimeout(function() {
        console.log("power OFF...");
        dev.set_power(false);
        dev.exit();
    }, 6000);

});