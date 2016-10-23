#!/usr/bin/env node
"use strict";
var program = require('commander');
var fs = require('fs');
var path = require('path');
var child_process_1 = require('child_process');
var extract = function (command) {
    var packageJsonData = fs.readFileSync('package.json', { encoding: 'utf8' });
    var packageJson = JSON.parse(packageJsonData);
    if (!packageJson['configFiles']) {
        console.log('no configFiles in package.json');
        return;
    }
    if (!packageJson['configFiles']['_mapping']) {
        console.log('no configFiles._mapping in package.json');
        return;
    }
    var filename = packageJson['configFiles']['_mapping'][command];
    if (!filename) {
        console.log("no mapping for " + command + " in package.json");
        return;
    }
    var data = packageJson['configFiles'][filename];
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    // todo check if file exists
    return filename;
};
var embed = function (filename, indent) {
    var packageJsonData = fs.readFileSync('package.json', { encoding: 'utf8' });
    var packageJson = JSON.parse(packageJsonData);
    var embedData = fs.readFileSync(filename, { encoding: 'utf8' });
    var obj = JSON.parse(embedData);
    var base = path.basename(filename);
    packageJson['configFiles'] = packageJson['configFiles'] || {};
    packageJson['configFiles'][base] = obj;
    var data = JSON.stringify(packageJson, null, parseInt(indent));
    fs.writeFileSync('package.json', data);
};
program
    .version('0.1')
    .arguments('<command>')
    .action(function (command) {
    var args = process.argv.slice(3);
    var commandName = path.basename(command);
    var extractedFile = extract(commandName);
    // todo: add support for node_modules/.bin
    var obj = child_process_1.spawnSync(command, args, { 'stdio': 'pipe' });
    if (obj.error) {
        console.log(obj.error);
    }
    fs.unlinkSync(extractedFile);
});
program.command('set <file>')
    .option('--indent <num_spaces>', 'number of lines to indent JSON', '4')
    .action(function (file, options) {
    if (file === 'package.json') {
        return;
    }
    embed(file, options.indent);
    console.log("added " + file + " to package.json");
});
program.command('register <command> <file>')
    .option('--indent <num_spaces>', 'number of lines to indent JSON', 4)
    .action(function (command, file, options) {
    if (file === 'package.json') {
        return;
    }
    var packageJsonData = fs.readFileSync('package.json', { encoding: 'utf8' });
    var packageJson = JSON.parse(packageJsonData);
    packageJson['configFiles'] = packageJson['configFiles'] || {};
    packageJson['configFiles']['_mapping'] = packageJson['configFiles']['_mapping'] || {};
    packageJson['configFiles']['_mapping'][command] = file;
    var data = JSON.stringify(packageJson, null, parseInt(options.indent));
    fs.writeFileSync('package.json', data);
});
program.parse(process.argv);
