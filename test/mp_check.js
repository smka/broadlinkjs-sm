'use strict';
let broadlink = require('../../broadlinkjs-sm');
let fs = require('fs');

var b = new broadlink();

b.discover();

b.on("deviceReady", (dev) => {
    if (dev.type == "MP1") {
        console.log("check power...");
        dev.check_power();

        dev.on("mp_power", (status_array) => {
            console.log("s1 power is on " + status_array[0]);
            console.log("s2 power is on " + status_array[1]);
            console.log("s3 power is on " + status_array[2]);
            console.log("s4 power is on " + status_array[3]);
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