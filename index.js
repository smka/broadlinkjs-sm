var util = require('util');
let EventEmitter = require('events');
let dgram = require('dgram');
let os = require('os');
let crypto = require('crypto');

var Broadlink = module.exports = function() {
    EventEmitter.call(this);
    this.devices = {};
}
util.inherits(Broadlink, EventEmitter);


Broadlink.prototype.genDevice = function(devtype, host, mac) {
    var dev;
    if (devtype == 0) { // SP1
        dev = new device(host, mac);
        dev.sp1();
        return dev;
    } else if (devtype == 0x2711) { // SP2
        dev = new device(host, mac);
        dev.sp2();
        return dev;
    } else if (devtype == 0x2719 || devtype == 0x7919 || devtype == 0x271a || devtype == 0x791a) { // Honeywell SP2
        dev = new device(host, mac);
        dev.sp2();
        return dev;
    } else if (devtype == 0x2720) { // SPMini
        dev = new device(host, mac);
        dev.sp2();
        return dev;
    } else if (devtype == 0x753e) { // SP3
        dev = new device(host, mac);
        dev.sp2();
        return dev;
    } else if (devtype == 0x2728) { // SPMini2
        dev = new device(host, mac);
        dev.sp2();
        return dev;
    } else if (devtype == 0x2733 || devtype == 0x273e) { // OEM branded SPMini Contros
        dev = new device(host, mac);
        dev.sp2();
        return dev;
    } else if (devtype >= 0x7530 && devtype <= 0x7918) { // OEM branded SPMini2
        dev = new device(host, mac);
        dev.sp2();
        return dev;
    } else if (devtype == 0x2736) { // SPMiniPlus
        dev = new device(host, mac);
        dev.sp2();
        return dev;
    }
    /*else if (devtype == 0x2712) { // RM2
           dev = new device(host, mac);
           dev.rm();
           return dev;
       } else if (devtype == 0x2737) { // RM Mini
           dev = new device(host, mac);
           dev.rm();
           return dev;
       } else if (devtype == 0x273d) { // RM Pro Phicomm
           dev = new device(host, mac);
           dev.rm();
           return dev;
       } else if (devtype == 0x2783) { // RM2 Home Plus
           dev = new device(host, mac);
           dev.rm();
           return dev;
       } else if (devtype == 0x277c) { // RM2 Home Plus GDT
           dev = new device(host, mac);
           dev.rm();
           return dev;
       } else if (devtype == 0x272a) { // RM2 Pro Plus
           dev = new device(host, mac);
           dev.rm();
           return dev;
       } else if (devtype == 0x2787) { // RM2 Pro Plus2
           dev = new device(host, mac);
           dev.rm();
           return dev;
       } else if (devtype == 0x278b) { // RM2 Pro Plus BL
           dev = new device(host, mac);
           dev.rm();
           return dev;
       } else if (devtype == 0x278f) { // RM Mini Shate
           dev = new device(host, mac);
           dev.rm();
           return dev;
       } */
    else if (devtype == 0x2714) { // A1
        dev = new device(host, mac);
        dev.a1();
        return dev;
    } else if (devtype == 0x4EB5) { // MP1
        dev = new device(host, mac);
        dev.mp1();
        return dev;
    } else if (devtype == 0x4F1B) { // MP2
        dev = new device(host, mac);
        dev.mp2();
        return dev;
    } else {
        //console.log("unknown device found... dev_type: " + devtype.toString(16) + " @ " + host.address);
        //dev = new device(host, mac);
        //dev.device();
        return null;
    }
}

Broadlink.prototype.discover = function(local_ip_address) {
    self = this;
    var interfaces = os.networkInterfaces();
    if (local_ip_address) {
        var address = local_ip_address;
    } else {
        var addresses = [];
        for (var k in interfaces) {
            for (var k2 in interfaces[k]) {
                var address = interfaces[k][k2];
                if (address.family === 'IPv4' && !address.internal) {
                    addresses.push(address.address);
                }
            }
        }
        var address = addresses[0];
    }
    var cs = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    cs.on('listening', function() {
        cs.setBroadcast(true);

        var port = cs.address().port;
        var now = new Date();
        var starttime = now.getTime();

        var timezone = now.getTimezoneOffset() / -3600;
        var packet = Buffer.alloc(0x30, 0);

        var year = now.getYear();

        if (timezone < 0) {
            packet[0x08] = 0xff + timezone - 1;
            packet[0x09] = 0xff;
            packet[0x0a] = 0xff;
            packet[0x0b] = 0xff;
        } else {
            packet[0x08] = timezone;
            packet[0x09] = 0;
            packet[0x0a] = 0;
            packet[0x0b] = 0;
        }
        packet[0x0c] = year & 0xff;
        packet[0x0d] = year >> 8;
        packet[0x0e] = now.getMinutes();
        packet[0x0f] = now.getHours();
        var subyear = year % 100;
        packet[0x10] = subyear;
        packet[0x11] = now.getDay();
        packet[0x12] = now.getDate();
        packet[0x13] = now.getMonth();
        var address_parts = address.split('.');
        packet[0x18] = parseInt(address_parts[0]);
        packet[0x19] = parseInt(address_parts[1]);
        packet[0x1a] = parseInt(address_parts[2]);
        packet[0x1b] = parseInt(address_parts[3]);
        packet[0x1c] = port & 0xff;
        packet[0x1d] = port >> 8;
        packet[0x26] = 6;
        var checksum = 0xbeaf;

        for (var i = 0; i < packet.length; i++) {
            checksum += packet[i];
        }
        checksum = checksum & 0xffff;
        packet[0x20] = checksum & 0xff;
        packet[0x21] = checksum >> 8;

        cs.sendto(packet, 0, packet.length, 80, '255.255.255.255');

    });

    cs.on("message", (msg, rinfo) => {
        var host = rinfo;

        var mac = Buffer.alloc(6, 0);
        msg.copy(mac, 0x00, 0x3F);
        msg.copy(mac, 0x01, 0x3E);
        msg.copy(mac, 0x02, 0x3D);
        msg.copy(mac, 0x03, 0x3C);
        msg.copy(mac, 0x04, 0x3B);
        msg.copy(mac, 0x05, 0x3A);

        var devtype = msg[0x34] | msg[0x35] << 8;
        if (!this.devices) {
            this.devices = {};
        }

        if (!this.devices[mac]) {
            var dev = this.genDevice(devtype, host, mac);
            if (dev) {
                this.devices[mac] = dev;
                dev.on("deviceReady", () => { this.emit("deviceReady", dev); });
                dev.auth();
            }
        }
    });

    cs.on('close', function() {
        //console.log('===Server Closed');
    });

    cs.bind(0, address);

    setTimeout(function() {
        cs.close();
    }, 300);
}

function device(host, mac, timeout = 10) {
    this.host = host;
    this.mac = mac;
    this.emitter = new EventEmitter();

    this.on = this.emitter.on;
    this.emit = this.emitter.emit;
    this.removeListener = this.emitter.removeListener;

    this.timeout = timeout;
    this.count = Math.random() & 0xffff;
    this.key = new Buffer([0x09, 0x76, 0x28, 0x34, 0x3f, 0xe9, 0x9e, 0x23, 0x76, 0x5c, 0x15, 0x13, 0xac, 0xcf, 0x8b, 0x02]);
    this.iv = new Buffer([0x56, 0x2e, 0x17, 0x99, 0x6d, 0x09, 0x3d, 0x28, 0xdd, 0xb3, 0xba, 0x69, 0x5a, 0x2e, 0x6f, 0x58]);
    this.id = new Buffer([0, 0, 0, 0]);
    this.cs = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    this.cs.on('listening', function() {
        //this.cs.setBroadcast(true);
    });
    this.cs.on("message", (response, rinfo) => {
        var enc_payload = Buffer.alloc(response.length - 0x38, 0);
        response.copy(enc_payload, 0, 0x38);

        var decipher = crypto.createDecipheriv('aes-128-cbc', this.key, this.iv);
        decipher.setAutoPadding(false);
        var payload = decipher.update(enc_payload);
        var p2 = decipher.final();
        if (p2) {
            payload = Buffer.concat([payload, p2]);
        }

        if (!payload) {
            return false;
        }

        var command = response[0x26];
        var err = response[0x22] | (response[0x23] << 8);

        if (err != 0) return;

        if (command == 0xe9) {
            this.key = Buffer.alloc(0x10, 0);
            payload.copy(this.key, 0, 0x04, 0x14);

            this.id = Buffer.alloc(0x04, 0);
            payload.copy(this.id, 0, 0x00, 0x04);
            this.emit("deviceReady");
        } else if (command == 0xee) {
            this.emit("payload", err, payload);
        }

    });
    this.cs.bind();
    this.type = "Unknown";

}

device.prototype.auth = function() {
    var payload = Buffer.alloc(0x50, 0);
    payload[0x04] = 0x31;
    payload[0x05] = 0x31;
    payload[0x06] = 0x31;
    payload[0x07] = 0x31;
    payload[0x08] = 0x31;
    payload[0x09] = 0x31;
    payload[0x0a] = 0x31;
    payload[0x0b] = 0x31;
    payload[0x0c] = 0x31;
    payload[0x0d] = 0x31;
    payload[0x0e] = 0x31;
    payload[0x0f] = 0x31;
    payload[0x10] = 0x31;
    payload[0x11] = 0x31;
    payload[0x12] = 0x31;
    payload[0x1e] = 0x01;
    payload[0x2d] = 0x01;
    payload[0x30] = 'T'.charCodeAt(0);
    payload[0x31] = 'e'.charCodeAt(0);
    payload[0x32] = 's'.charCodeAt(0);
    payload[0x33] = 't'.charCodeAt(0);
    payload[0x34] = ' '.charCodeAt(0);
    payload[0x35] = ' '.charCodeAt(0);
    payload[0x36] = '1'.charCodeAt(0);

    this.sendPacket(0x65, payload);

}

device.prototype.exit = function() {
    var self = this;
    setTimeout(function() {
        self.cs.close();
    }, 500);
}

device.prototype.getType = function() {
    return this.type;
}

device.prototype.sendPacket = function(command, payload) {
    this.count = (this.count + 1) & 0xffff;
    var packet = Buffer.alloc(0x38, 0);
    packet[0x00] = 0x5a;
    packet[0x01] = 0xa5;
    packet[0x02] = 0xaa;
    packet[0x03] = 0x55;
    packet[0x04] = 0x5a;
    packet[0x05] = 0xa5;
    packet[0x06] = 0xaa;
    packet[0x07] = 0x55;
    packet[0x24] = 0x2a;
    packet[0x25] = 0x27;
    packet[0x26] = command;
    packet[0x28] = this.count & 0xff;
    packet[0x29] = this.count >> 8;
    packet[0x2a] = this.mac[0];
    packet[0x2b] = this.mac[1];
    packet[0x2c] = this.mac[2];
    packet[0x2d] = this.mac[3];
    packet[0x2e] = this.mac[4];
    packet[0x2f] = this.mac[5];
    packet[0x30] = this.id[0];
    packet[0x31] = this.id[1];
    packet[0x32] = this.id[2];
    packet[0x33] = this.id[3];

    var checksum = 0xbeaf;
    for (var i = 0; i < payload.length; i++) {
        checksum += payload[i];
        checksum = checksum & 0xffff;
    }

    var cipher = crypto.createCipheriv('aes-128-cbc', this.key, this.iv);
    payload = cipher.update(payload);
    var p2 = cipher.final();

    packet[0x34] = checksum & 0xff;
    packet[0x35] = checksum >> 8;

    packet = Buffer.concat([packet, payload]);

    checksum = 0xbeaf;
    for (var i = 0; i < packet.length; i++) {
        checksum += packet[i];
        checksum = checksum & 0xffff;
    }
    packet[0x20] = checksum & 0xff;
    packet[0x21] = checksum >> 8;
    //console.log("dev send packet to " + this.host.address + ":" + this.host.port);
    this.cs.sendto(packet, 0, packet.length, this.host.port, this.host.address);
}

device.prototype.mp1 = function() {
    this.type = "MP1";

    this.set_power = function(sid, state) {
        //"""Sets the power state of the smart power strip."""
        var sid_mask = 0x01 << (sid - 1);
        var packet = Buffer.alloc(16, 0);
        packet[0x00] = 0x0d;
        packet[0x02] = 0xa5;
        packet[0x03] = 0xa5;
        packet[0x04] = 0x5a;
        packet[0x05] = 0x5a;
        packet[0x06] = 0xb2 + (state ? (sid_mask << 1) : sid_mask);
        packet[0x07] = 0xc0;
        packet[0x08] = 0x02;
        packet[0x0a] = 0x03;
        packet[0x0d] = sid_mask;
        packet[0x0e] = state ? sid_mask : 0;

        this.sendPacket(0x6a, packet);
    }

    this.check_power = function() {
        //"""Returns the power state of the smart power strip in raw format."""
        var packet = Buffer.alloc(16, 0);
        packet[0x00] = 0x0a;
        packet[0x02] = 0xa5;
        packet[0x03] = 0xa5;
        packet[0x04] = 0x5a;
        packet[0x05] = 0x5a;
        packet[0x06] = 0xae;
        packet[0x07] = 0xc0;
        packet[0x08] = 0x01;

        this.sendPacket(0x6a, packet);
    }

    this.on("payload", (err, payload) => {
        var param = payload[0];
        switch (param) {
            case 1:
                console.log("case 1 -");
                break;
            case 2:
                console.log("case 2 -");
                break;
            case 3:
                console.log("case 3 -");
                break;
            case 4:
                console.log("case 4 -");
                break;
            case 14:
                var s1 = Boolean(payload[0x0e] & 0x01);
                var s2 = Boolean(payload[0x0e] & 0x02);
                var s3 = Boolean(payload[0x0e] & 0x04);
                var s4 = Boolean(payload[0x0e] & 0x08);
                this.emit("mp_power", [s1, s2, s3, s4]);
                break;
            default:
                console.log("case default - " + param);
                break;
        }
    });
}

device.prototype.mp2 = function() {
    this.type = "MP2";

    this.set_power = function(sid, state) {
        //"""Sets the power state of the smart power strip."""
        var sid_mask = 0x01 << (sid - 1);
        var packet = Buffer.alloc(16, 0);
        packet[0x00] = 0x0d;
        packet[0x02] = 0xa5;
        packet[0x03] = 0xa5;
        packet[0x04] = 0x5a;
        packet[0x05] = 0x5a;
        packet[0x06] = 0xb2 + (state ? (sid_mask << 1) : sid_mask);
        packet[0x07] = 0xc0;
        packet[0x08] = 0x02;
        packet[0x0a] = 0x03;
        packet[0x0d] = sid_mask;
        packet[0x0e] = state ? sid_mask : 0;

        this.sendPacket(0x6a, packet);
    }

    this.check_power = function() {
        //"""Returns the power state of the smart power strip in raw format."""
        var packet = Buffer.alloc(16, 0);
        packet[0x00] = 0x0a;
        packet[0x02] = 0xa5;
        packet[0x03] = 0xa5;
        packet[0x04] = 0x5a;
        packet[0x05] = 0x5a;
        packet[0x06] = 0xae;
        packet[0x07] = 0xc0;
        packet[0x08] = 0x01;

        this.sendPacket(0x6a, packet);
    }

    this.on("payload", (err, payload) => {
        var param = payload[0];
        switch (param) {
            case 1:
                console.log("case 1 -");
                break;
            case 2:
                console.log("case 2 -");
                break;
            case 3:
                console.log("case 3 -");
                break;
            case 4:
                console.log("case 4 -");
                break;
            case 0x1b:
                var s1 = Boolean(payload[0x0e] & 0x01);
                var s2 = Boolean(payload[0x0e] & 0x02);
                var s3 = Boolean(payload[0x0e] & 0x04);
                var s4 = Boolean(payload[0x0e] & 0x08);
                this.emit("mp_power", [s1, s2, s3, s4]);
                break;
            default:
                console.log("case default - " + param);
                break;
        }
    });
}

device.prototype.sp1 = function() {
    this.type = "SP1";
    this.set_power = function(state) {
        var packet = Buffer.alloc(4, 4);
        packet[0] = state;
        this.sendPacket(0x66, packet);
    }
}



device.prototype.sp2 = function() {
    var self = this;
    this.type = "SP2";
    this.set_power = function(state) {
        //"""Sets the power state of the smart plug."""
        var packet = Buffer.alloc(16, 0);
        packet[0] = 2;
        packet[4] = state ? 1 : 0;
        this.sendPacket(0x6a, packet);

    }

    this.check_power = function() {
        //"""Returns the power state of the smart plug."""
        var packet = Buffer.alloc(16, 0);
        packet[0] = 1;
        this.sendPacket(0x6a, packet);

    }

    this.on("payload", (err, payload) => {
        var param = payload[0];
        switch (param) {
            case 1: //get from check_power
                var pwr = Boolean(payload[0x4]);
                this.emit("power", pwr);
                break;
            case 3:
                console.log('case 3');
                break;
            case 4:
                console.log('case 4');
                break;
        }

    });


}

device.prototype.a1 = function() {
    this.type = "A1";
    this.check_sensors = function() {
        var packet = Buffer.alloc(16, 0);
        packet[0] = 1;
        this.raw= false;
        this.sendPacket(0x6a, packet);
    }
    
    this.decode_payload = function(payload) {
    	var temperature = (payload[0x4] * 10 + payload[0x5]) / 10.0;
    	var humidity    = (payload[0x6] * 10 + payload[0x7]) / 10.0;
    	var light       = payload[0x8];
    	var air_quality = payload[0x0a];
    	var noise       = payload[0xc];
    	return  {temperature: temperature, light: light, air_quality: air_quality,  noise: noise};
    }
    
    this.on("payload", (err, payload) => {

    	var info= this.decode_payload(payload);

    	this.emit("temperature", info.temperature);
    	this.emit("humidity", info.humidity);

    	if (this.raw) {
    		switch (info.light) {
    		case 0:
    			info.light = 'dark';
    			break;
    		case 1:
    			info.light = 'dim';
    			break;
    		case 2:
    			info.light = 'normal';
    			break;
    		case 3:
    			info.light = 'bright';
    			break;
    		default:
    			info.light = 'unknown';
    		break;
    		}

    		switch (info.air_quality) {
    		case 0:
    			info.air_quality = 'excellent';
    			break;
    		case 1:
    			info.air_quality = 'good';
    			break;
    		case 2:
    			info.air_quality = 'normal';
    			break;
    		case 3:
    			info.air_quality = 'bad';
    			break;
    		default:
    			info.air_quality = 'unknown';
    		break;
    		}
    		switch (info.noise) {
    		case 0:
    			info.noise = 'quiet';
    			break;
    		case 1:
    			info.noise = 'normal';
    			break;
    		case 2:
    			info.noise = 'noisy';
    			break;
    		default:
    			info.noise = 'unknown';
    		break;
    		}

    	}
    	this.emit("light", info.light);
    	this.emit("air_quality", info.air_quality);

    	this.emit("noise", info.noise);
    	this.emit("all_info", info)
    });

    this.check_sensors_raw = function() {
        var packet = Buffer.alloc(16, 0);
        packet[0] = 1;
        this.raw= true;
        this.sendPacket(0x6a, packet);
    }
}


device.prototype.rm = function() {
    this.type = "RM2";
    this.checkData = function() {
        var packet = Buffer.alloc(16, 0);
        packet[0] = 4;
        this.sendPacket(0x6a, packet);
    }

    this.sendData = function(data) {
        packet = new Buffer([0x02, 0x00, 0x00, 0x00]);
        packet = Buffer.concat([packet, data]);
        this.sendPacket(0x6a, packet);
    }

    this.enterLearning = function() {
        var packet = Buffer.alloc(16, 0);
        packet[0] = 3;
        this.sendPacket(0x6a, packet);
    }

    this.checkTemperature = function() {
        var packet = Buffer.alloc(16, 0);
        packet[0] = 1;
        this.sendPacket(0x6a, packet);
    }

    this.on("payload", (err, payload) => {
        var param = payload[0];
        switch (param) {
            case 1:
                var temp = (payload[0x4] * 10 + payload[0x5]) / 10.0;
                this.emit("temperature", temp);
                break;
            case 4: //get from check_data
                var data = Buffer.alloc(payload.length - 4, 0);
                payload.copy(data, 0, 4);
                this.emit("rawData", data);
                break;
            case 3:
                break;
            case 4:
                break;
        }
    });
}
