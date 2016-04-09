var express = require("express");
var app = express();
var routes = require("./app/routes/routes")
var mongoose = require("mongoose");
var passport = require("passport")
var session = require("express-session")

require("dotenv").load();
require("./app/config/passport")(passport);

mongoose.connect(process.env.MONGO_URI)

app.set("views", __dirname + "/app/views");
app.set("view engine", "jsx");
app.engine('jsx', require('express-react-views').createEngine());

app.use(session({
	secret: 'asecretthatsnotreallysecret',
	resave: false,
	saveUninitialized: true
}))

app.use(passport.initialize());
app.use(passport.session())

routes(app, passport);

app.listen("3000", function(){
    console.log("server listening on port 3000...")
})
