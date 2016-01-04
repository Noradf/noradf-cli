#!/usr/bin/env node

'use strict';

var program = require('commander'),
    path = require('path'),
    chalk = require('chalk'),
    _ = require('lodash');

var pkg = require(path.join(__dirname, '..', 'package.json') );

program
    .version(pkg.version)
    .command('init', 'Create a noradf project')
    .command('install', 'Install a noradf module or all the modules')
    .command('module', 'Create a noradf module')
    .parse(process.argv);

if (program.args.length < 1) {
    program.help();
}

var commands = program.commands.map(function(command) {
    return command._name;
});

if (!_.contains(commands, program.args[0])) {
    console.log(chalk.red('noradf: \'' + program.rawArgs[2] + '\' is not a noradf command. See \'noradf --help\''));
    process.exit(1);
}