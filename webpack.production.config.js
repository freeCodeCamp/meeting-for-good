const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack           = require('webpack');

module.exports = {
  entry: {
    app: './client/client.js',
    vendor: [
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
    ],
  },
  output: {
    path: require('path').resolve('./build/client'),
    filename: 'app.[chunkhash].js',
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.[chunkhash].js'),
    new HtmlWebpackPlugin({
      title: 'Lets Meet',
      template: 'html!./client/index.html',
      filename: '../index.html',
      inject: 'body',
    }),
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
        exclude: [/node_modules/],
        loaders: [
          'style',
          'css?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]',
        ],
      },
      {
        test: /\.css$/,
        include: [/node_modules/],
        loaders: ['style', 'css'],
      },
      {
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file-loader',
      },
    ],
  },
  resolve: {
    extensions: ['', '.js', '.css'],
  },
};
