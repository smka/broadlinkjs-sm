let broadlink = require('broadlinkjs-sm');
var b = new broadlink();

b.on("deviceReady", (dev) => {
    dev.set_power(true);
    dev.exit();
});

b.discover();