#!/usr/bin/env node

var shelljs = require('shelljs');
var addCheckMark = require('./checkmark');
var path = require('path');

var cpy = path.join(__dirname, '/node_modules/cpy-cli/cli.js');
shelljs.exec(cpy + ' server/api/email/templates/ownerNotification/* build/api/email/templates/ownerNotification/', addCheckMark.bind(null, callback));

function callback() {
  process.stdout.write(' Copied /static/* to the /build/ directory\n\n');
}
