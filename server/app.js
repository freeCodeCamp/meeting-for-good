process.env.NODE_ENV = process.env.NODE_ENV || 'development';
if (process.env.NODE_ENV === 'development') require('dotenv').load();

import express from 'express';
import routes from './app/routes/routes';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackConfig from '../webpack.config';

const app = express();
mongoose.connect(process.env.MONGO_URI);

if (process.env.NODE_ENV === 'development') {
  // Development Env specific stuff
  // - Seed DB every time server is starter
  // - Run the webpack middleware for react hot reloading
  // - Use MemoryStore for the session

  require(`${__dirname}/app/config/seed.js`);
  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler));
  app.use(webpackHotMiddleware(compiler));
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

require('./app/config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.use('/controllers', express.static(`${__dirname}/app/controllers`));
app.use('/', express.static(`${__dirname}/client`));

routes(app);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Node.js listening on port ${port}...'`);
});
