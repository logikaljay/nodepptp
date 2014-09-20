/*jslint regexp: true */
"use strict";

var exec = require('child_process').exec,
    child;
var ifconfig = require('./ifconfig.js');

/**
 * Map `last` to a Session
 * @param  String data output from `last` command
 * @param  Object interfaces
 * @return Object sessions that have been mapped from last
 */
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

            // test if session.disconnected is a date
            if (Object.prototype.toString.call(session.disconnected) !== "[object Date]" || isNaN(session.disconnected.getTime())) {
                session.disconnected = matches[2];
            } else {
                session.disconnected = new Date(matches[2]);
            }

            // session was in the past - set the old interface data
            session.interface = { device: session.interface };
        } else if (connected.indexOf(' still logged in') > -1) {
            session.connected = connected.replace(' still logged in', '');
            session.connected = new Date(session.connected);
            session.disconnected = null;

            // session is still active - set the interface data
            session.interface = interfaces[session.interface];
        }

        return session;
    }
}

/**
 * Get list of sessions from last
 * @param  Function callback function with the return result
 * @return Array   array of sessions
 */
function sessions(callback) {
    ifconfig(function (interfaces) {

        var result = [];

        child = exec('last -F | grep ppp', function (error, stdout, stderr) {
            if (stderr) {
                throw stderr;
            }

            if (error) {
                throw error;
            }

            var lines = stdout.split('\n');
            lines.forEach(function (line) {
                var data = line.split(' ');
                data = data.filter(function (item) {
                    if (item.length === 0) {
                        return false;
                    }
                    return true;
                });

                var session = mapLastToSession(data, interfaces);
                if (session !== undefined) {
                    result.push(session);
                }
            });
            callback(result);
        });
    });
}

/**
 * Kill a connection by Assigned IP Address
 * @param  String   assignedip the assigned ip address
 * @param  Function callback function called with the return type
 * @return Boolean  true if user existed and their process was killed, false if not found.
 */
function killConnection(assignedip, callback) {
    sessions(function (sessions) {
        var sessionToKill = sessions.filter(function (session) {
            if (session.interface.assignedip === assignedip) {
                return true;
            }

            return false;
        });

        if (sessionToKill.length > 0) {
            // get the pid of the session by the assigned IP
            child = exec('ps -eo pid,command | grep -v grep | grep ' + assignedip, function (err, stdout, stderr) {
                if (err) {
                    throw err;
                }

                if (stderr) {
                    throw stderr;
                }

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

module.exports = function () {
    var module = {};
    module.active = function (callback) {
        sessions(function (data) {
            var connected = data.filter(function (session) {
                return session.disconnected === null;
            });

            callback(connected);
        });
    };

    module.inactive = function (callback) {
        sessions(function (data) {
            var disconnected = data.filter(function (session) {
                return session.disconnected !== null;
            });

            callback(disconnected);
        });
    };

    module.kill = function (assignedip, callback) {
        killConnection(assignedip, function (result) {
            callback(result);
        });
    };

    return module;
};
