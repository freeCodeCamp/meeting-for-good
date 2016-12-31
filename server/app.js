import mongoose from 'mongoose';
import bluebird from 'bluebird';
import path from 'path';
import passport from 'passport';
import session from 'express-session';
import bodyParser from 'body-parser';
import compression from 'compression';
import dotenv from 'dotenv';
import express from 'express';
import connectMongo from 'connect-mongo';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpack from 'webpack';
import routes from './app/routes/routes';
import webpackConfig from './../webpack.config';

dotenv.load();
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();
app.use(compression({ threshold: 0 }));
mongoose.Promise = bluebird;
mongoose.connect(process.env.MONGO_URI);

if (process.env.NODE_ENV === 'development') {
  // Development Env specific stuff
  // - Use MemoryStore for the session
  // - Start web-dev-server
  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler, {
    compress: true,
    contentBase: path.join(__dirname, '/build'),
    filename: 'bundle.js',
    hot: true,
    publicPath: '/assets/',
    historyApiFallback: true,
    stats: {
      colors: true,
    },
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
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

require('./app/config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.use('/', express.static(`${__dirname}/`, { maxAge: 31557600000 }));
app.use('/client/', express.static(`${__dirname}/client/`, { maxAge: 31557600000 }));

routes(app);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Node.js listening on port ${port}...'`);
});
