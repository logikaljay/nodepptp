/*jslint plusplus: true */
"use strict";

var exec = require('child_process').exec;

function parse(callback) {
    exec('ifconfig', function (err, stdout, stderr) {
        process(err, stdout, stderr, callback);
    });
}

function process(error, stdout, stderr, cb) {
    if (error) {
        throw error;
    }

    if (stderr) {
        throw stderr;
    }

    var interfaces = [];
    var interfacetmp = [];
    var interfacedata = stdout.split('\n');
    var result = [];
    var tmp;
    var ifname;
    var localip;
    var assignedip;
    var rxpackets;
    var rxbytes;
    var txpackets;
    var txbytes;
    var rx;
    var tx;
    var i;

    while (interfacedata.length > 0) {
        if (interfacedata[0] === '') {
            interfaces.push(interfacetmp);
            interfacetmp = [];
            interfacedata.shift();
        } else {
            interfacetmp.push(interfacedata.shift());
        }
    }

    for (i = 0; i < interfaces.length; i++) {
        tmp = null;
        ifname = null;
        localip = null;
        assignedip = null;
        rxpackets = null;
        rxbytes = null;
        txpackets = null;
        txbytes = null;
        rx = null;
        tx = null;

        tmp = interfaces[i].toString();

        // get the interface name
        ifname = tmp.split(' ')[0].replace(':', '');

        // get the interface localip
        localip = tmp.match(/inet addr:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
        if (localip === null || localip === undefined) {
            localip = tmp.match(/inet (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
        }

        // get the ppp assigned ip
        assignedip = tmp.match(/P-t-P:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/i);
        if (assignedip === null || assignedip === undefined) {
            assignedip = tmp.match(/destination (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
        }

        // only add devices with a local ip
        if (localip !== null && assignedip !== null) {
            // get RX data
            rxpackets = tmp.match(/RX packets:(\d+)/);
            rxbytes = tmp.match(/RX bytes:(\d+)/);

            // get TX data
            txpackets = tmp.match(/TX packets:(\d+)/);
            txbytes = tmp.match(/TX bytes:(\d+)/);

            if (rxbytes === null) {
                rxpackets = tmp.match(/RX packets (\d+){2}bytes (\d+) /);
                rxbytes = tmp.match(/RX packets (\d+){2}bytes (\d+) /);
                rxbytes.shift();
            }

            if (txbytes === null) {
                txpackets = tmp.match(/TX packets (\d+){2}bytes (\d+) /);
                txbytes = tmp.match(/TX packets (\d+){2}bytes (\d+) /);
                txbytes.shift();
            }

            rx = { packets: rxpackets[1], bytes: rxbytes[1] };
            tx = { packets: txpackets[1], bytes: txbytes[1] };

            result[ifname] = { device: ifname, localip: localip[1], assignedip: assignedip[1], rx: rx, tx: tx };
        }

    }

    cb(result);
}

module.exports = parse;
