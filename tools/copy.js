#!/usr/bin/env node

const shelljs = require('shelljs');
const addCheckMark = require('./checkmark');
const path = require('path');

function callback() {
  process.stdout.write(' Copied server/api/email/templates/**/ to the /build//api/email/templates/ directory\n\n');
}

const cpy = path.join(__dirname, '../node_modules/cpy-cli/cli.js');
shelljs.exec(`${cpy} server/api/email/templates/ownerNotification/* build/api/email/templates/ownerNotification/`, addCheckMark.bind(null, callback));
shelljs.exec(`${cpy} server/api/email/templates/inviteGuests/* build/api/email/templates/inviteGuests/`, addCheckMark.bind(null, callback));
shelljs.exec(`${cpy} server/api/email/templates/editAvailability/* build/api/email/templates/editAvailability/`, addCheckMark.bind(null, callback));

