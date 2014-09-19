"use strict";

var fs = require('fs');

function getUsers(path, callback) {
	fs.readFile(path, function(err, data) {
		if (err) {
			throw err;
		}

		var users = [];
		var userData = data.toString().split('\n');
		userData.map(function(line) {
			if (line[0] !== "#") {
				// replace tabs with spaces
				var lineData = line.replace(/\t/g, ' ');

				// split the file by spaces
				var userData = lineData.split(' ');
				
				// filter empty array values
				userData = userData.filter(function(userItemData) {
					return userItemData.length > 0;
				});

				// build the user
				if (userData.length > 0) {
					users[userData[0]] = { username: userData[0], server: userData[1], password: userData[2], allowedip: userData[3] };
				}
			}
		});

		callback(users);
	});
}
function addUser(path, username, server, password, allowedip, callback) {
	getUsers(path, function(users) {
		if (users[username] === undefined) {
			// add the user
			users[username] = { username: username, server: server, password: password, allowedip: allowedip };
			
			// write the changes
			writeUsers(path, users, function() {
				callback(true);
			});
		} else {
			callback(false);
		}
	});
}

function removeUser(path, username, callback) {
	getUsers(path, function(users) {
		if (users[username] === undefined) {
			callback(false);
		} else {
			// remove the user
			delete users[username];
			
			// write the changes
			writeUsers(path, users, function() {
				callback(true);
			});
		}
	});
}

function writeUsers(path, users, callback) {
	// move the old file
	fs.rename(path, path + '.backup');

	// build a string to write
	var newdata = "";
	for (var prop in users) {
		newdata += users[prop].username + " " + users[prop].server + " " + users[prop].password + " " + users[prop].allowedip+ "\n";
	}

	// write the file
	fs.writeFile(path, newdata, function(err) {
		if (err) {
			throw err;
		}

		callback();
	});
}

module.exports = function(conf) {
	var module = {};

	module.all = function (callback) {
		fs.exists(conf.path.users, function(exists) {
			if (exists) {
				getUsers(conf.path.users, function (users) {
					callback(users);
				});
			} else {
				callback([]);
			}
		});
	};

	module.add = function(username, server, password, allowedip, callback) {
		fs.exists(conf.path.users, function(exists) {
			if (exists) {
				addUser(conf.path.users, username, server, password, allowedip, function (result) {
					callback(result);
				});
			} else {
				callback(false);
			}
		});
	};

	module.remove = function(username, callback) {
		fs.exists(conf.path.users, function(exists) {
			if (exists) {
				removeUser(conf.path.users, username, function (result) {
					callback(result);
				});
			} else {
				callback(false);
			}
		});
	};

	return module;
}
