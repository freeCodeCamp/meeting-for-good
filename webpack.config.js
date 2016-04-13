const precss            = require('precss');
const autoprefixer      = require('autoprefixer');
const cssnano           = require('cssnano');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack           = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: [
    'webpack-hot-middleware/client',
    './client/client.js',
  ],
  output: {
    path: require('path').resolve('./build/client'),
    filename: 'bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Lets Meet',
      template: 'html!./client/index.html',
      filename: '../index.html',
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new ExtractTextPlugin('styles.css'),
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react'],
          plugins: ['transform-decorators-legacy'],
        },
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract(
          'style?sourceMap',
          'css?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]',
          'postcss'
        ),
      },
      {
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file-loader',
      },
    ],
  },
  postcss: function postcss() {
    return [cssnano, precss, autoprefixer];
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.js', '.css'],
  },
};
