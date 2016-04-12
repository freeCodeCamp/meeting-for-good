require('dotenv').load();
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

import express from 'express';
import routes from './app/routes/';
import mongoose from 'mongoose';
// import passport from 'passport';
import session from 'express-session';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackConfig from '../webpack.config';

const compiler = webpack(webpackConfig);
const app = express();

app.use(webpackDevMiddleware(compiler));
app.use(webpackHotMiddleware(compiler));

// require('./app/config/passport')(passport);

mongoose.connect(process.env.MONGO_URI);

if (process.env.NODE_ENV === 'development') {
  require(`${__dirname}/app/config/seed.js`);
}

app.use('/controllers', express.static(`${__dirname}/app/controllers`));
app.use('/', express.static(`${__dirname}/client`));

app.use(session({
  secret: 'secretClementine',
  resave: false,
  saveUninitialized: true,
}));

// app.use(passport.initialize());
// app.use(passport.session());

routes(app);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Node.js listening on port ${port}...'`);
});
