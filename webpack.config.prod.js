const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCSS = require('optimize-css-assets-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const OfflinePlugin = require('offline-plugin');
const WebpackAssetsManifest = require('webpack-assets-manifest');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const VENDOR_LIBS = [
  'autobind-decorator',
  'bluebird',
  'clipboard',
  'chroma-js',
  'es6-promise',
  'fast-json-patch',
  'immutable',
  'isomorphic-fetch',
  'jstimezonedetect',
  'lodash',
  'material-ui',
  'moment',
  'moment-range',
  'nprogress',
  'react',
  'react-addons-update',
  'react-day-picker',
  'react-tap-event-plugin',
  'react-dom',
  'react-css-modules',
  'react-infinite',
  'react-input-range',
  'react-masonry-component',
  'react-notification-system',
  'react-router',
];

module.exports = {
  entry: {
    bundle: './client/main.js',
    vendor: VENDOR_LIBS,
  },
  output: {
    path: path.resolve('./build/client'),
    filename: 'app.[chunkhash].js',
    publicPath: '/client/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(ttf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
        use: 'file-loader',
      },
      {
        test: /\.(png|jp?g|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: { limit: 10000 },
          },
          {
            loader: 'image-webpack-loader',
            query: {
              mozjpeg: {
                progressive: true,
              },
              gifsicle: {
                interlaced: false,
              },
              optipng: {
                optimizationLevel: 4,
              },
              pngquant: {
                quality: '75-90',
                speed: 3,
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        exclude: [/node_modules/, /no-css-modules/],
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]',
          },
        ],
      },
      {
        test: /\.css$/,
        include: [/node_modules/, /no-css-modules/],
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          loader: 'css-loader',
        }),
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.GoogleAnalyticsID': JSON.stringify(process.env.GoogleAnalyticsID),
      'process.env.GoogleAnalyticsDebug': JSON.stringify(process.env.GoogleAnalyticsDebug),
    }),
    new ExtractTextPlugin('vendor.css'),
    new OptimizeCSS({
      cssProcessorOptions: { discardComments: { removeAll: true } },
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.[chunkhash].js',
      minChunks: 'Infinity',
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new FaviconsWebpackPlugin({
      logo: './client/assets/favicons/logo.png',
      icons: {
        appleStartup: false,
      },
      background: 'transparent',
      persistentCache: true,
      inject: true,
    }),
    new HtmlWebpackPlugin({
      title: 'Meeting for Good',
      template: 'html-loader!./client/index.html',
      filename: '../index.html',
      inject: 'body',
    }),
    new WebpackAssetsManifest({
      writeToDisk: true,
      merge: true,
      done(manifest) {
        console.log(`The manifest has been written to ${manifest.getOutputPath()}`);
      },
      apply(manifest) {
        manifest.set('start_url', '/?homescreen=1');
        manifest.set('manifest_version', '2');
        manifest.set('version', '1');
        manifest.set('default_locale', 'en');
        manifest.set('description', 'THE BEST MEETING COORDINATION APP');
        manifest.set('display', 'fullscreen');
        manifest.set('short_name', 'MeetingFG');
        manifest.set('name', 'Meeting For Good');
        manifest.set('background_color', '#FBFFFB');
        manifest.set('theme_color', '#FBFFFB');
      },
    }),
    new OfflinePlugin({
      caches: {
        main: [
          'app.*.js',
          '*.app.*.js',
          'vendor.*.js',
          'vendor.css',
          '*.png',
          '*.ttf',
          '*.gif',
        ],
      },
      externals: [
        '/',
      ],
      ServiceWorker: {
        navigateFallbackURL: '/',
      },
    }),
  ],
  resolve: {
    extensions: ['.js', '.css'],
  },
};
