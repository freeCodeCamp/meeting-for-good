const CopyWebpackPlugin = require('copy-webpack-plugin');
const WriteFilePlugin   = require('write-file-webpack-plugin');
const webpack           = require('webpack');
const path              = require('path');

module.exports = {
  context: __dirname,
  entry: [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
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
    new webpack.NamedModulesPlugin(),
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
        exclude: [/node_modules/, /no-css-modules/],
        loaders: [
          'style-loader?sourceMap',
          'css-loader?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]',
        ],
      },
      {
        test: /\.css$/,
        include: [/node_modules/, /no-css-modules/],
        loaders: ['style-loader?sourceMap', 'css-loader'],
      },
      {
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file-loader',
      },
      { test: /\.(png|jpg|gif)$/,
        loader: 'url-loader',
      },
    ],
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.css'],
  },
};
