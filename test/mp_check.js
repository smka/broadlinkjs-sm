'use strict';
let broadlink = require('../../broadlinkjs-sm');
let fs = require('fs');

var b = new broadlink();

b.discover();

b.on("deviceReady", (dev) => {
    if (dev.type == "MP1") {
        console.log("check power...");
        dev.check_power();

        dev.on("s1_power", (s1) => {
            console.log("s1 power is on " + s1);
        });

        dev.on("s2_power", (s2) => {
            console.log("s2 power is on " + s2);
        });

        dev.on("s3_power", (s3) => {
            console.log("s3 power is on " + s3);
        });

        dev.on("s4_power", (s4) => {
            console.log("s4 power is on " + s4);
        });

        setTimeout(function() {
            console.log("power s1 ON...");
            dev.set_power(1, 1);
            dev.check_power();
        }, 2000);

        setTimeout(function() {
            console.log("power s1 OFF...");
            dev.set_power(1, 0);
            dev.exit();
        }, 3000);

    } else {
        console.log(dev.type + "@" + dev.host.address + " found... not MP1!");
        dev.exit();
    }

});