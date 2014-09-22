"use strict";

var fs = require('fs');

/**
 * Get Users from the users file specified in config.json file
 * @param  String   path to users file - from config.json
 * @param  Function Callback function that gets called with the return result
 * @return Array    list of users
 */
function getUsers(path, callback) {
    fs.readFile(path, function (err, data) {
        if (err) {
            throw err;
        }

        var users = [];
        var userData = data.toString().split('\n');
        userData.map(function (line) {
            if (line[0] !== "#") {
                // replace tabs with spaces
                var lineData = line.replace(/\t/g, ' ');

                // split the file by spaces
                var userRow = lineData.split(' ');

                // filter empty array values
                userRow = userRow.filter(function (userItemData) {
                    return userItemData.length > 0;
                });

                // build the user
                if (userRow.length > 0) {
                    users[userRow[0]] = { username: userRow[0], server: userRow[1], password: userRow[2], allowedip: userRow[3] };
                }
            }
        });

        callback(users);
    });
}

/**
 * Write users to the users file specified in the config.json file
 * @param  String   path of users file specified in config.json
 * @param  Array    array of users to write
 * @param  Function callback function with the boolean return result
 * @return Boolean  true or false depending on if write was successful
 */
function writeUsers(path, users, callback) {
    // move the old file
    fs.rename(path, path + '.backup');

    // build a string to write
    var newdata = "";
    var prop;
    for (prop in users) {
        if (users.hasOwnProperty(prop)) {
            newdata += users[prop].username + " " + users[prop].server + " " + users[prop].password + " " + users[prop].allowedip + "\n";
        }
    }

    // write the file
    fs.writeFile(path, newdata, function (err) {
        if (err) {
            throw err;
        }

        callback();
    });
}

/**
 * Add a user to the users file specified in the config.json file
 * @param  String   path to the users file
 * @param  String   username of the user being added
 * @param  String   server name of the user being added
 * @param  String   password of the user being added
 * @param  String   allowedip of the user being added
 * @param  Function callback function called with the return result.
 * @return Boolean  true or false depending on if the user was added successfully
 */
function addUser(path, username, server, password, allowedip, callback) {
    getUsers(path, function (users) {
        if (users[username] === undefined) {
            // add the user
            users[username] = { username: username, server: server, password: password, allowedip: allowedip };

            // write the changes
            writeUsers(path, users, function () {
                callback(true);
            });
        } else {
            callback(false);
        }
    });
}

/**
 * Remove a user from the users file specified in config.json
 * @param  String   path to the config.json
 * @param  String   username of the user to remove
 * @param  Function callback function called with the return result
 * @return Boolean  true of false depending on if the user was removed successfully
 */
function removeUser(path, username, callback) {
    getUsers(path, function (users) {
        if (users[username] === undefined) {
            callback(false);
        } else {
            // remove the user
            delete users[username];

            // write the changes
            writeUsers(path, users, function () {
                callback(true);
            });
        }
    });
}

module.exports = function (conf) {
    var module = {};

    module.all = function (callback) {
        fs.exists(conf.path.users, function (exists) {
            if (exists) {
                getUsers(conf.path.users, function (users) {
                    callback(users);
                });
            } else {
                callback([]);
            }
        });
    };

    module.add = function (username, server, password, allowedip, callback) {
        fs.exists(conf.path.users, function (exists) {
            if (exists) {
                addUser(conf.path.users, username, server, password, allowedip, function (result) {
                    callback(result);
                });
            } else {
                callback(false);
            }
        });
    };

    module.remove = function (username, callback) {
        fs.exists(conf.path.users, function (exists) {
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
};