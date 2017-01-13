/* eslint-disable no-console */
import webpack from 'webpack';
import config from '../webpack.config.prod';

webpack(config).run((error, stats) => {
  if (error) {
    console.log(error);
    return 1;
  }

  const jsonStats = stats.toJson();

  if (jsonStats.hasErrors) {
    return jsonStats.errors.map(error => console.log(error));
  }

  if (jsonStats.hasWarnings) {
    jsonStats.warnings.map(warning => console.log(warning));
  }

  console.log(`Build complete -  stats: ${stats}`);

  return 0;
});
