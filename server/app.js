require('dotenv').load();
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

import express from 'express';
import routes from './app/routes/routes';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import bodyParser from 'body-parser';
import compression from 'compression';

const app = express();
app.use(compression({ threshold: 0 }));
mongoose.connect(process.env.MONGO_URI);

if (process.env.NODE_ENV === 'development') {
  // Development Env specific stuff
  // - Start dev server
  // - Use MemoryStore for the session
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const webpack              = require('webpack');
  const config               = require('../webpack.config');
  const compiler             = webpack(config);

  app.use(webpackDevMiddleware(compiler, {
    hot: true,
    filename: 'bundle.js',
    publicPath: '/client/',
    stats: {
      colors: true,
    },
    historyApiFallback: true,
  }));

  app.use(webpackHotMiddleware(compiler, {
    log: console.log,
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000,
  }));

  app.use(session({
    secret: 'secretClementine',
    resave: false,
    saveUninitialized: true,
  }));
} else {
  // Production Env Production Specific stuff
  // - Use MongoStore instead of MemoryStore for the session
  const MongoStore = require('connect-mongo')(session);
  app.use(session({
    secret: 'secretClementine',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  }));
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

require('./app/config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.use('/', express.static(`${__dirname}/`));

routes(app);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Node.js listening on port ${port}...'`);
});
