#!/usr/bin/env node

'use strict';

var program = require('commander'),
    fs = require('fs'),
    path = require('path'),
    shell = require('shelljs'),
    chalk = require('chalk'),
    npm = require('npm'),
    bower = require('bower'),
    async = require('async'),
    each = require('async-each-series'),
    utils = require('../lib/utils'),
    ncp = require('ncp').ncp,
    _ = require('lodash');

var pkg = require(path.join(__dirname, '..', 'package.json'));

program
    .version(pkg.version)
    .description('Install a noradf module or noradf modules from noradf.json')
    .option('-g, --git', 'Install a module from git repository')
    .option('-p, --path', 'Install a module from local path')
    .option('-f, --force', 'Overwrite module if exists')
    .parse(process.argv);

var modules;

if (program.args.length === 0) {
    if (!fs.existsSync('noradf.json')) {
        return console.log(chalk.red('You must provide module name to install'));
    }

    var noradfJson = JSON.parse(fs.readFileSync('noradf.json'));
    if (!noradfJson.modules) {
        return console.log(chalk.red('noradf.json does not contains modules'));
    }

    modules = noradfJson.modules;
}
else {
    if (!program.path && !shell.which('git')) {
        return console.log(chalk.red('git is not installed'));
    }

    if (program.path && program.args.length > 2) {
        return console.log(chalk.red('Only one module can be installed when using path'));
    }

    modules = (program.path ? [program.args[0]] : program.args);
}

each(modules, function (name, next) {

    async.series(
        [
            function (callback) {
                console.log();

                if (program.force && fs.existsSync(path.join('modules', name))) {
                    utils.removeRecursiveSync(path.join('modules', name));
                }
                else if (!program.force && fs.existsSync(path.join('modules', name))) {
                    return callback('Module ' + name + ' already exists. Try again using -f');
                }

                if (program.path) {
                    console.log(chalk.green('Copying module %s from %s'), name, program.args[1]);
                    if (!fs.existsSync(path.resolve(program.args[1]))) {
                        return callback('Directory ' + program.args[1] + ' does not exist');
                    }

                    if (!utils.isDirSync(path.resolve(program.args[1]))) {
                        return callback(program.args[1] + ' is not a directory');
                    }

                    utils.mkdirSync('modules');
                    ncp(path.resolve(program.args[1]), path.join('modules', name), callback);
                }
                else {
                    var source = program.git || ('git@github.com:Noradf/' + name + '.git');
                    var gitCmd = 'git clone ' + source + ' modules/' + name;
                    console.log(chalk.green('Cloning module %s'), name);

                    shell.exec(gitCmd, function (status, output) {
                        if (status) {
                            return callback('Error cloning repository');
                        }

                        callback();
                    });
                }
            },
            function (callback) {
                var modulePath = path.join(path.resolve('.'), 'modules', name);
                var moduleJSONPath = path.join(modulePath, 'module.json');

                if (!fs.existsSync(moduleJSONPath)) {
                    return console.log(chalk.red('File ' + moduleJSONPath + ' doesn\'t exist'));
                }

                var moduleJson = JSON.parse(fs.readFileSync(moduleJSONPath).toString());

                npm.load(moduleJson, function (err) {
                    if (err) {
                        return callback(err);
                    }

                    async.series(
                        [
                            function (callback) {
                                if (!moduleJson.dependencies) {
                                    return callback();
                                }

                                var dependencies = Object.keys(moduleJson.dependencies).map(function (key) {
                                    return key + '@' + moduleJson.dependencies[key];
                                });

                                npm.on('log', function (message) {
                                    console.log(message);
                                });

                                console.log();
                                console.log(chalk.green('Installing npm dependencies'));

                                npm.commands.install(dependencies, function (err, data) {
                                    if (err) {
                                        return callback(err);
                                    }

                                    callback();
                                });
                            },
                            function (callback) {
                                if (!moduleJson.bowerDependencies) {
                                    return callback();
                                }

                                console.log();
                                console.log(chalk.green('Installing bower dependencies'));

                                var dependencies = Object.keys(moduleJson.bowerDependencies).map(function (key) {
                                    return key + '#' + moduleJson.bowerDependencies[key];
                                });

                                bower.commands.install(dependencies)
                                    .on('error', function (error) {
                                        callback(error);
                                    })
                                    .on('end', function () {
                                        callback();
                                    });
                            }
                        ],
                        function (err) {
                            if (err) {
                                return next(err);
                            }

                            if (moduleJson.config) {
                                console.log();
                                console.log(chalk.green('Configuring module'));

                                if (!fs.existsSync(path.join('config', 'env', 'common.json'))) {
                                    fs.writeFileSync(path.join('config', 'env', 'common.json'), JSON.stringify({}, null, 2));
                                }

                                var config = JSON.parse(fs.readFileSync(path.join('config', 'env', 'common.json')));
                                config = _.extend(config, moduleJson.config);
                                fs.writeFileSync(path.join('config', 'env', 'common.json'), JSON.stringify(config, null, 2));
                            }

                            if (!fs.existsSync('noradf.json')) {
                                fs.writeFileSync('noradf.json', JSON.stringify({}, null, 2));
                            }

                            var noradfJson = JSON.parse(fs.readFileSync('noradf.json'));
                            if (!noradfJson.modules) {
                                noradfJson.modules = [];
                            }

                            if (!_.contains(noradfJson.modules, name)) {
                                noradfJson.modules.push(name); //TODO Version
                                fs.writeFileSync('noradf.json', JSON.stringify(noradfJson, null, 2));
                            }

                            callback();
                        }
                    );
                });
            }
        ],
        function (err) {
            next(err);
        });
}, function (err) {
    console.log();

    if (err) {
        return console.log(chalk.red(err));
    }

    console.log(chalk.green('Finished'));
});