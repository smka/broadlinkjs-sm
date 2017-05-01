let broadlink = require('../../broadlinkjs-sm');
var b = new broadlink();

b.on("deviceReady", (dev) => {
    if (dev.host.address == "192.168.1.92") {
        dev.set_power(false);
        dev.exit();
    } else {
        dev.exit();
    }
});

b.discover();