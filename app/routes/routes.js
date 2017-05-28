module.exports = function(app, passport){
    app.route("/")
        .get(function(req,res){
            res.render("index")
        })

    app.route("/dashboard")
        .get(function(req,res){
            res.send("Logged in")
        })

    app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/dashboard',
			failureRedirect: '/'
		}));
}
