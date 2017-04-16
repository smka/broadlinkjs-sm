'use strict';
let broadlink = require('broadlinkjs-sm');
let fs = require('fs');

var b = new broadlink();
b.discover();

b.on("deviceReady", (dev) => {
    setTimeout(function() {
        console.log("send check!");
        dev.check_power();
    }, 1000);

    // dev.check_power();
    dev.on("power", (pwr) => {
        console.log("power is on " + pwr);
        //dev.exit();
    });

    setTimeout(function() {
        // console.log("new on discover");
        // b.discover();
        console.log("power ON...");
        dev.set_power(true);
        //dev.check_power();
    }, 7000);

    setTimeout(function() {
        // console.log("new off discover");
        // b.discover();
        console.log("power OFF...");
        dev.set_power(false);
        dev.exit();
    }, 8000);

});