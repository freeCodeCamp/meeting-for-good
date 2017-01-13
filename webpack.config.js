const wbpkcnf = require('webpack-config');

function setting() {
  return process.env.NODE_ENV;
}

wbpkcnf.environment.setAll({
  env: setting,
});

// Also you may use `'conf/webpack.[NODE_ENV].config.js'`
module.exports = new wbpkcnf.Config().extend('./webpack.[env].config.js');
