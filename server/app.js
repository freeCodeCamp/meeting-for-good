require('dotenv').load();
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

import express from 'express';
import routes from './app/routes/routes';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import bodyParser from 'body-parser';

const app = express();
mongoose.connect(process.env.MONGO_URI);

if (process.env.seedDB === 'true') require(`${__dirname}/app/config/seed.js`);

if (process.env.NODE_ENV === 'development') {
  // Development Env specific stuff
  // - Run the webpack middleware for react hot reloading
  // - Use MemoryStore for the session
  const webpack = require('webpack');
  const webpackConfig = require('../webpack.config');
  const compiler = webpack(webpackConfig);
  app.use(require('webpack-dev-middleware')(compiler));
  app.use(require('webpack-hot-middleware')(compiler));
  app.use(session({
    secret: 'secretClementine',
    resave: false,
    saveUninitialized: true
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

app.use('/controllers', express.static(`${__dirname}/app/controllers`));
app.use('/', express.static(`${__dirname}/`));

routes(app);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Node.js listening on port ${port}...'`);
});
