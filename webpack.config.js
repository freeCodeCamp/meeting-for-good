const CopyWebpackPlugin = require('copy-webpack-plugin');
const WriteFilePlugin   = require('write-file-webpack-plugin');
const webpack           = require('webpack');
const path              = require('path');

module.exports = {
  entry: [
    'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
    './client/client.js',
  ],
  output: {
    path: path.resolve('./build/client'),
    filename: 'bundle.js',
    publicPath: '/client/',
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, 'client/index.dev.html'),
        to: path.join(__dirname, 'build/index.html'),
      },
    ]),
    new WriteFilePlugin({
      test: /\.html$/,
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react'],
          plugins: [
            'transform-decorators-legacy',
            ['transform-runtime', { polyfill: false, regenerator: true }],
          ],
        },
      },
      {
        test: /\.css$/,
        exclude: [/node_modules/],
        loaders: [
          'style?sourceMap',
          'css?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]',
        ],
      },
      {
        test: /\.css$/,
        include: [/node_modules/],
        loaders: ['style?sourceMap', 'css'],
      },
      {
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file-loader',
      },
    ],
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.js', '.css'],
  },
};
