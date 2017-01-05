// const CopyWebpackPlugin = require('copy-webpack-plugin');
// const WriteFilePlugin   = require('write-file-webpack-plugin');
const webpack           = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const VENDOR_LIBS = [
  'moment',
  'lodash',
  'react',
  'react-dom',
  'react-router',
  'react-css-modules',
  'isomorphic-fetch',
  'es6-promise',
  'react-day-picker',
  'autobind-decorator',
  'materialize-css',
  'react-masonry-component',
  'colorsys',
  'react-addons-update',
];


module.exports = [{
  context: __dirname,
  entry: {
    bundle: [
      'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
      './client/client.js'],
    vendor: VENDOR_LIBS,
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].[hash].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
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
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
    }),
    /*new CopyWebpackPlugin([
      {
        from: path.join(__dirname, 'client/index.dev.html'),
        to: path.join(__dirname, 'build/index.html'),
      },
    ]),*/
    new HtmlWebpackPlugin({
      template: './client/index.html',
    }),
    /* new WriteFilePlugin({
      test: /\.html$/,
    }), */
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoErrorsPlugin(),
  ],
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.css'],
  },
}];
