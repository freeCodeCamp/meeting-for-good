const exec = require('child_process').exec;
require('dotenv').config();

let args = `https://intake.opbeat.com/api/v1/organizations/${process.env.OPBEAT_ORGANIZATION_ID}/apps/${process.env.OPBEAT_APP_ID}/releases/ `;
args += `-H "Authorization: Bearer ${process.env.OPBEAT_SECRET_TOKEN}" `;
args += '-d rev=`git log -n 1 --pretty=format:%H` ';
args += '-d branch=`git rev-parse --abbrev-ref HEAD` ';
args += '-d status=completed';

exec(`curl ${args}`, (error, stdout, stderr) => {
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
  if (error !== null) {
    console.log(`exec error: ${error}`);
  }
});

