#!/usr/bin/env node

'use strict';

var program = require('commander'),
    fs = require('fs'),
    path = require('path'),
    inquirer = require('inquirer'),
    slugify = require('underscore.string/slugify'),
    chalk = require('chalk'),
    utils = require('../lib/utils'),
    nunjucks = require('nunjucks'),
    npm = require('npm'),
    bower = require('bower');

var pkg = require(path.join(__dirname, '..', 'package.json') );

program
    .version(pkg.version)
    .description('Create a noradf module for development')
    .option('-n, --install-npm [package]', 'Install a npm package in the module')
    .option('-b, --install-bower [package]', 'Install a bower package in the module')
    .parse(process.argv);

var modulePath = process.cwd();

var createModule = function (name, modules) {

    console.log(chalk.green('Creating module %s'), name);

    nunjucks.configure(path.join(__dirname, 'tpl/module'));

    var props = {
        name: name,
        modules: modules,
        slug: slugify
    };

    var moduleJson = nunjucks.render('module.json.tpl', props);
    var moduleJs = nunjucks.render('module.js.tpl', props);

    fs.writeFileSync(path.join(modulePath, 'module.json'), moduleJson);
    fs.writeFileSync(path.join(modulePath, 'module.js'), moduleJs);

};

if (program.args.length === 1) {
    return createModule(program.args[0]);
}

if (program.installNpm || program.installBower) {

    if (!fs.existsSync(path.join(modulePath, 'module.json'))) {
        return console.log(chalk.red('Please initialize module first with command \'noradf module-dev\''));
    }

    var dependencies = [program.installNpm || program.installBower];
    var moduleJson = JSON.parse(fs.readFileSync(path.join(modulePath, 'module.json')).toString());

    if (program.installNpm) {
        npm.load(moduleJson, function (err) {
            if (err) {
                throw new Error(err);
            }

            npm.on('log', function (message) {
                console.log(message);
            });

            console.log();
            console.log(chalk.green('Installing ' + program.installNpm));

            npm.commands.install(dependencies, function (err, data) {
                if (err) {
                    return console.log(chalk.red(err));
                }

                var npmPackage = data[data.length - 1][0];
                var npmPackageSplit = npmPackage.split('@');

                if (!moduleJson.dependencies) {
                    moduleJson.dependencies = {};
                }

                moduleJson.dependencies[npmPackageSplit[0]] = '^' + npmPackageSplit[1];
                fs.writeFileSync(path.join(modulePath, 'module.json'), JSON.stringify(moduleJson, null, 2));

                console.log();
                console.log(chalk.green('Installed ' + npmPackage));
            });
        });
    }
    else {
        console.log();
        console.log(chalk.green('Installing bower dependencies'));

        bower.commands.install(dependencies, {}, {force: true})
            .on('error', function (error) {
                callback(error);
            })
            .on('end', function (data) {
                if (!moduleJson.bowerDependencies) {
                    moduleJson.bowerDependencies = {};
                }

                moduleJson.bowerDependencies[data[dependencies[0]].endpoint.name] = data[dependencies[0]].endpoint.target;
                fs.writeFileSync(path.join(modulePath, 'module.json'), JSON.stringify(moduleJson, null, 2));

                console.log();
                console.log(chalk.green('Installed ' + data[dependencies[0]].endpoint.name + ' (' + data[dependencies[0]].endpoint.target + ')'));
            });
    }
}
else {

    var questions = [
        {
            type: 'input',
            name: 'name',
            message: 'What would be your module name',
            default: 'Noradf Module',
            validate: function (value) {
                return !!value.trim() || 'Required';
            }
        },
        {
            type: 'input',
            name: 'modules',
            message: 'Does your module require any other module? (Separate them with comma)'
        }
    ];

    inquirer.prompt(questions, function(results) {
        var modules = [];

        if (results.modules) {
            modules = results.modules.split(',');
        }

        createModule(results.name, modules);
    });
}