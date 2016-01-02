'use strict';

var fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf');

function mkdirSyncImpl(dir, realPath) {
    try {
        if (!dir || dir === '') {
            return;
        }

        fs.mkdirSync(dir);
    } catch (e) {
        if (e.code != 'EEXIST') {
            throw e;
        }
    }
}

module.exports = {
    mkdirSync: function (dir) {
        var dirs = dir.split(path.sep);
        var realPath = '';
        dirs.forEach(function (dir) {
            realPath = path.join(realPath, dir);
            mkdirSyncImpl(realPath);
        });
    },
    isDirSync: function (dir) {
        return fs.lstatSync(dir).isDirectory();
    },
    removeRecursiveSync: function (dir) {
        rimraf.sync(dir);
    }
};