const exec = require('child_process').exec;
require('dotenv').config();

let args = `-H "Authorization: Bearer${process.env.OP_BEAT_SECRET_TOKEN}" `;
args += '-d "rev=git log -n 1 --pretty=format:%H" ';
args += '-d "branch=git rev-parse --abbrev-ref HEAD" ';
args += '-d status=completed ';
args += `https://opbeat.com/api/v1/organizations${process.env.OP_BEAT_ORGANIZATION_ID}/apps/${process.env.OP_BEAT_APP_ID}/releases/ `;

exec(`curl ${args}`, (error, stdout, stderr) => {
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
  if (error !== null) {
    console.log(`exec error: ${error}`);
  }
});

