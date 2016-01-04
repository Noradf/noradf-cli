#!/usr/bin/env node

'use strict';

var program = require('commander'),
    fs = require('fs'),
    path = require('path'),
    inquirer = require('inquirer'),
    slugify = require('underscore.string/slugify'),
    chalk = require('chalk'),
    npm = require('npm'),
    utils = require('../lib/utils');

var pkg = require(path.join(__dirname, '..', 'package.json') );

program
    .version(pkg.version)
    .description('Create a noradf project')
    .parse(process.argv);

var questions = [
    {
        type: 'input',
        name: 'name',
        message: 'What would be your Noradf project name',
        default: 'Noradf Project',
        validate: function (value) {
            return !!value.trim() || 'Required';
        }
    }
];

inquirer.prompt(questions, function(results) {
    var pkg = {
        name: slugify(results.name),
        version: '0.0.1',
        description: results.name + ' a Noradf project',
        main: 'server.js',
        keywords: ['noradf']
    };

    var projectPath = process.cwd();

    console.log(chalk.green('Initializing project %s'), results.name);

    fs.writeFileSync(path.join(projectPath, 'package.json'), JSON.stringify(pkg, null, 2));

    utils.mkdirSync(path.join('config', 'env'));
    fs.writeFileSync(path.join(projectPath, 'config', 'env', 'common.json'), JSON.stringify({}, null, 2));
    fs.writeFileSync(path.join(projectPath, 'config', 'env', 'development.json'), JSON.stringify({}, null, 2));

    npm.load(pkg, function (err) {
        if (err) {
            throw new Error(err);
        }

        npm.on('log', function (message) {
            console.log(message);
        });

        npm.config.set('save', true);

        var dependencies = ['noradf-core'];

        console.log();
        console.log(chalk.green('Installing dependencies'));

        npm.commands.install(dependencies, function (err, data) {
            if (err) {
                return console.log(chalk.red(err));
            }
        });
    });
});
