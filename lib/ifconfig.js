var exec = require('child_process').exec;

function parse(callback) {
	exec('ifconfig', function(err, stdout, stderr) {
		process(err, stdout, stderr, callback);
	});
};

function process(error, stdout, stderr, cb) {
	var interfaces = [];
	var interfacetmp = [];
	var interfacedata = stdout.split('\n');
	while(interfacedata.length > 0) {
		if (interfacedata[0] == '') {
			interfaces.push(interfacetmp);
			interfacetmp = [];
			interfacedata.shift();
		} else {
			interfacetmp.push(interfacedata.shift());
		}
	}
	
	var result = [];
	for (var i = 0; i<interfaces.length; i++) {
		var tmp = interfaces[i].toString();

		// get the interface name
		var ifname = tmp.split(' ')[0];

		// get the interface localip
		var localip = tmp.match(/inet addr:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);

		// get the ppp assigned ip
		var assignedip = tmp.match(/P-t-P:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/i);
		
		// only add devices with a local ip
		if (localip !== null && assignedip !== null) {
			// get RX data
        	        var rxpackets = tmp.match(/RX packets:(\d+)/);
	                var rxbytes = tmp.match(/RX bytes:(\d+)/);

                	// get TX data
        	        var txpackets = tmp.match(/TX packets:(\d+)/);
	                var txbytes = tmp.match(/TX bytes:(\d+)/);

			var rx = { packets: rxpackets[1], bytes: rxbytes[1] };
			var tx = { packets: txpackets[1], bytes: txbytes[1] };

			result[ifname] = { device: ifname, localip: localip[1], assignedip: assignedip[1], rx: rx, tx: tx };
		}
		
	}

	cb(result);
}

module.exports = parse
