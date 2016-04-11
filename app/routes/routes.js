var Meeting = require('../models/meeting.js');

module.exports = function(app, passport){
  app.route('/')
    .get(function(req,res){
      res.render('index');
    });

  app.route('/dashboard')
    .get(function(req,res){

      Meeting.find(function(err, meetings) {
        if (err) throw err;
        res.render('dashboard', { meetings: meetings });
      });
    });

  app.route('/auth/github')
    .get(passport.authenticate('github'));

  app.route('/auth/github/callback')
    .get(passport.authenticate('github', {
      successRedirect: '/dashboard',
      failureRedirect: '/',
    }));
};
