const webpack             = require('webpack');
const ExtractTextPlugin   = require('extract-text-webpack-plugin');
const ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');
const path = require('path');
const wbpkcnf = require('webpack-config');

module.exports = new wbpkcnf.Config().extend('./webpack.base.config.js').merge({
  entry: {
    app: './client/main.js',
  },
  output: {
    path: path.resolve('./build/client'),
    filename: '[name].[hash].js',
    publicPath: '/client/',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: [/node_modules/, /no-css-modules/],
        loaders: [
          'style-loader',
          'css-loader?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]',
        ],
      },
      {
        test: /\.css$/,
        include: [/node_modules/, /no-css-modules/],
        loader: ExtractTextPlugin.extract({
          fallbackLoader: 'style-loader',
          loader: 'css-loader',
        }),
      },
    ],
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.[chunkhash].js',
    }),
    new ChunkManifestPlugin({
      filename: 'manifest.json',
      manifestVariable: 'webpackManifest',
    }),
  ],
});
