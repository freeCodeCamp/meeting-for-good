import opbeat from 'opbeat/start';
import mongoose from 'mongoose';
import bluebird from 'bluebird';
import passport from 'passport';
import session from 'express-session';
import bodyParser from 'body-parser';
import compression from 'compression';
import express from 'express';
import connectMongo from 'connect-mongo';
import 'dotenv/config';
import morgan from 'morgan';
import routes from './app/routes/routes';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();
app.use(compression({ threshold: 0 }));
mongoose.Promise = bluebird;
mongoose.connect(process.env.MONGO_URI);

if (process.env.NODE_ENV === 'development') {
  // Development Env specific stuff
  // - Use MemoryStore for the session
  // only load webpack stuff at dev.
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const webpack = require('webpack');
  const webpackConfig = require('../webpack.config.dev');
  const compiler = webpack(webpackConfig);

  app.use(webpackDevMiddleware(compiler, {
    compress: true,
    historyApiFallback: true,
    hot: true,
    publicPath: webpackConfig.output.publicPath,
    stats: {
      colors: true,
      reasons: false,
    },
  }));

  app.use(webpackHotMiddleware(compiler, {
    log: console.log,
    path: '/__webpack_hmr',
    heartbeat: 2000,
  }));

  app.use(session({
    secret: 'secretClementine',
    resave: false,
    saveUninitialized: true,
  }));
} else {
  // Production Env Production Specific stuff
  // - Use MongoStore instead of MemoryStore for the session
  const MongoStore = connectMongo(session);
  app.use(session({
    secret: 'secretClementine',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  }));
  // setup the logger
  app.use(morgan(':status :method :response-time ms - :url'));
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

require('./app/config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.use('/', express.static(`${__dirname}/`, { maxAge: 31557600000 }));
app.use('/client/', express.static(`${__dirname}/client/`, { maxAge: 31557600000 }));
app.use(opbeat.middleware.express());
routes(app);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Node.js listening on port ${port}...'`);
});
