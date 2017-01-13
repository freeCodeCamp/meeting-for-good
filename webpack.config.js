const wbpkcnf = require('webpack-config');

function setting() {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }
  return process.env.NODE_ENV;
}

wbpkcnf.environment.setAll({
  env: setting,
});

module.exports = new wbpkcnf.Config().extend('./webpack.[env].config.js');
