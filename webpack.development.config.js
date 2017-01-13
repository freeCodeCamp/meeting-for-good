const WriteFilePlugin = require('write-file-webpack-plugin');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const wbpkcnf = require('webpack-config');

module.exports = new wbpkcnf.Config().extend('./webpack.base.config.js').merge({
  context: __dirname,
  entry: {
    bundle: [
      'react-hot-loader/patch',
      'webpack-hot-middleware/client?reload=true',
      './client/main.js',
    ],
  },
  output: {
    path: path.resolve('./build/client'),
    publicPath: '/client/',
    filename: '[name].[hash].js',
  },
  module: {
    rules: [
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
        loader: ExtractTextPlugin.extract({
          fallbackLoader: 'style-loader?sourceMap',
          loader: 'css-loader',
        }),
      },
    ],
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
    }),
    new WriteFilePlugin({
      test: /\.html$/,
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoErrorsPlugin(),
  ],
  devtool: 'source-map',
});
