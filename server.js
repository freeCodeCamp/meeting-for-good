var express = require('express');
var app = express();
var passport = require('passport');

require('dotenv').load();
require('./app/config/passport')(passport);

require('mongoose').connect(process.env.MONGO_URI);
require('./app/config/seed.js');

app.set('views', __dirname + '/app/views');
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine());

app.use('/public', express.static( __dirname + '/public'));

app.use(require('express-session')({
  secret: 'asecretthatsnotreallysecret',
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

require('./app/routes/routes')(app, passport);

app.listen('3000', function(){
  console.log('server listening on port 3000...');
});
