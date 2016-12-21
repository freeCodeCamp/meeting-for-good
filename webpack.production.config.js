const HtmlWebpackPlugin   = require('html-webpack-plugin');
const webpack             = require('webpack');
const ExtractTextPlugin   = require('extract-text-webpack-plugin');
const OptimizeCSS         = require('optimize-css-assets-webpack-plugin');
const ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');

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
      'materialize-css',
      'react-masonry-component',
      'colorsys',
      'react-addons-update',
    ],
  },
  output: {
    path: require('path').resolve('./build/client'),
    filename: 'app.[chunkhash].js',
    publicPath: '/client/',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
    new ExtractTextPlugin('vendor.css'),
    new OptimizeCSS({
      cssProcessorOptions: { discardComments: { removeAll: true } },
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor', 
      filename: 'vendor.[chunkhash].js',
    }),
    new ChunkManifestPlugin({
      filename: 'manifest.json',
      manifestVariable: 'webpackManifest',
    }),
    new HtmlWebpackPlugin({
      title: 'Lets Meet',
      template: 'html-loader!./client/index.html',
      filename: '../index.html',
      inject: 'body',
    }),
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
      {
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file-loader',
      },
      { test: /\.(png|jpg|gif)$/,
        loader: 'url-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.css'],
  },
};
