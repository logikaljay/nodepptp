"use strict";

var conf = require('./config.json');
var settings = require('./lib/settings.js')(conf);
var sessions = require('./lib/sessions.js')(conf);
var users = require('./lib/users.js')(conf);

module.exports = {
    settings: settings,
    sessions: sessions,
    users: users
};

