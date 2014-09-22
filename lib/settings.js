"use strict";

var fs = require('fs');

/**
 * Load settings
 * @param  String   path to load the settings from
 * @param  Function callback called with the return result
 * @return Array    list of settings
 */
function loadSettingsFile(path, callback) {
    fs.readFile(path, function (err, data) {
        if (err) {
            throw err;
        }

        var raw = data.toString();
        var lines = raw.split('\n');
        lines = lines.filter(function (line) {
            return line.length > 0 && line[0] !== '#';
        });

        callback(lines);
    });
}

/**
 * Save settings to path
 * @param  String   path to save the settings to
 * @param  Array    settings list of settings to save
 * @param  Function callback called with the return result
 * @return Boolean  true if settings were saved
 */
function saveSettingsFile(path, settings, callback) {
    if (settings !== undefined && settings.length > 0) {
        // build the string to write
        var data = settings.join('\n');

        // write the data to the file
        fs.writeFile(path, data, function (err) {
            if (err) {
                callback(false);
            } else {
                callback(true);
            }
        });
    } else {
        callback(false);
    }
}

module.exports = function (conf) {
    var module = {};
    module.pptpd = {};
    module.pptpd.load = function (callback) {
        fs.exists(conf.path.pptpd, function (exists) {
            if (exists) {
                loadSettingsFile(conf.path.pptpd, function (result) {
                    callback(result);
                });
            } else {
                callback([]);
            }
        });
    };

    module.pptpd.save = function (settings, callback) {
        fs.exists(conf.path.pptpd, function (exists) {
            if (exists) {
                saveSettingsFile(conf.path.pptpd, settings, function (result) {
                    callback(result);
                });
            } else {
                callback(false);
            }
        });
    };

    module.options = {};
    module.options.load = function (callback) {
        fs.exists(conf.path.options, function (exists) {
            if (exists) {
                loadSettingsFile(conf.path.options, function (result) {
                    callback(result);
                });
            } else {
                callback([]);
            }
        });
    };

    module.options.save = function (settings, callback) {
        fs.exists(conf.path.options, function (exists) {
            if (exists) {
                saveSettingsFile(conf.path.options, settings, function (result) {
                    callback(result);
                });
            } else {
                callback(false);
            }
        });
    };

    return module;
};
