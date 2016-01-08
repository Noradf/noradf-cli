#!/usr/bin/env node

'use strict';

var program = require('commander'),
    fs = require('fs'),
    path = require('path'),
    inquirer = require('inquirer'),
    slugify = require('underscore.string/slugify'),
    chalk = require('chalk'),
    utils = require('../lib/utils'),
    nunjucks = require('nunjucks');

var pkg = require(path.join(__dirname, '..', 'package.json') );

program
    .version(pkg.version)
    .description('Create a noradf module inside an application')
    .parse(process.argv);

var createModule = function (name, modules) {
    var moduleSlug = slugify(name);

    var projectPath = process.cwd();

    utils.mkdirSync('modules');

    if (fs.existsSync(path.join('modules', moduleSlug))) {
        return console.log(chalk.red('Directory %s already exists'), moduleSlug);
    }

    console.log(chalk.green('Creating module %s'), name);

    utils.mkdirSync(path.join('modules', moduleSlug));

    nunjucks.configure(path.join(__dirname, 'tpl/module'));

    var props = {
        name: name,
        modules: modules,
        slug: slugify
    };

    var moduleJson = nunjucks.render('module.json.tpl', props);
    var moduleJs = nunjucks.render('module.js.tpl', props);

    fs.writeFileSync(path.join(projectPath, 'modules', moduleSlug, 'module.json'), moduleJson);
    fs.writeFileSync(path.join(projectPath, 'modules', moduleSlug, 'module.js'), moduleJs);

};

if (program.args.length === 1) {
    return createModule(program.args[0]);
}

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