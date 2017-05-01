'use strict';
let broadlink = require('../../broadlinkjs-sm');
let fs = require('fs');

var b = new broadlink(); // your SP ip here
//var b = new broadlink("", );
var mcb = function() {
    var mac = new Buffer(6);
    var mac_str = "34:ea:34:e4:00:55";
    var values = mac_str.split(':');
    for (var i = 0; i < values.length; ++i) {
        var tmpByte = parseInt(values[i], 16);
        mac.writeUInt8(tmpByte, i);
    }
    return mac;
}
b.discover();

b.on("deviceReady", (dev) => {
    if (mcb().equals(dev.mac) || dev.host.address == "192.168.1.92") {
        setTimeout(function() {
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
        }, 2000);

        setTimeout(function() {
            console.log("power OFF...");
            dev.set_power(false);
            dev.exit();
        }, 3000);
    } else {
        dev.exit();
    }

    // сделать проверку введенного мак адреса!
    // var m = "34:ea:34:e4:00:55";
    // var m = "34:ea:34:e3:e4:6b";

});