"use strict";

var exec = require('child_process').exec,
    child;
var ifconfig = require('./ifconfig.js');

function killConnection(assignedip, callback) {
	sessions(function (sessions) {
		var sessionToKill = sessions.filter(function(session) {
			if (session.interface.assignedip == assignedip) {
				return true;
			} else {
				return false;
			}
		});

		if (sessionToKill.length > 0) {
			// get the pid of the session by the assigned IP
			child = exec('ps -eo pid,command | grep -v grep | grep ' + assignedip, function(err, stdout, stderr) {
				if (stdout.length > 0) {
					var pid = stdout.split(' ')[0];

					// kill the pid
					process.kill(pid);
					callback(true);
				} else {
					callback(false);
				}
			});
		} else {
			callback(false);
		}
	});
}

function sessions(callback) {
	ifconfig(function(interfaces) {

		var sessions = [];

		child = exec('last -F | grep ppp', function (error, stdout, stderr) {
			var lines = stdout.split('\n');
			lines.forEach(function(line, index) {
				var data = line.split(' ');
				data = data.filter(function (item) {
					if (item.length == 0) {
						return false;
					}
					return true;
				});

				var session = mapLastToSession(data, interfaces);
				if (session !== undefined) {
					sessions.push(session);
				}
			});
			callback(sessions);
		});
	});
}

function mapLastToSession(data, interfaces) {
	var session = {};
	if (data !== undefined && data.length > 0) {
		session.user = data.shift();
		session.interface = data.shift();
		session.clientip = data.shift();

		// build the connected string for connect/disconnect operations
		var connected = data.join(' ');
	
		// match connected string to get connected/disconnected
		var matches = connected.match(/(.+) - (.+) \(.+:.+\)/);
		if (matches !== null && matches.length > 0) {	
			session.connected = new Date(matches[1]);
			session.disconnected = new Date(matches[2]);

			// session was in the past - set the old interface data
			session.interface = { device: session.interface };
		} else if (connected.indexOf(' still logged in') > -1) {
			session.connected = connected.replace(' still logged in', '');
			session.disconnected = null;

			// session is still active - set the interface data
			session.interface = interfaces[session.interface];
		}

		return session;
	}
}

module.exports = function() {
	var module = {};
	module.active = function(callback) {
		sessions(function(data) {
			var connected = data.filter(function(session) {
				return session.disconnected == null;
			});

			callback(connected);
		});
	};

	module.inactive = function(callback) {
		sessions(function(data) {
			var disconnected = data.filter(function(session) {
				return session.disconnected !== null;
			});

			callback(disconnected);
		});
	};

	module.kill = function(assignedip, callback) {
		killConnection(assignedip, function(result) {
			callback(result);
		});
	};

	return module;
}
