const path = process.cwd();
import Meeting from '../models/meeting';
import User from '../models/users';
import passport from 'passport';

export default (app) => {
  /*
  ....###....########..####..######.
  ...##.##...##.....##..##..##....##
  ..##...##..##.....##..##..##......
  .##.....##.########...##...######.
  .#########.##.........##........##
  .##.....##.##.........##..##....##
  .##.....##.##........####..######.
  */

  /* auth stuff */

  app.route('/api/auth/current')
    .get((req, res) => {
      res.status(200).send(req.user);
    });

  app.route('/api/auth/github')
    .get(passport.authenticate('github'));

  app.route('/api/auth/github/callback')
    .get(passport.authenticate('github', {
      successRedirect: '/dashboard',
      failureRedirect: '/login',
    }));

  app.route('/api/auth/facebook')
    .get(passport.authenticate('facebook'));

  app.route('/api/auth/facebook/callback')
    .get(passport.authenticate('facebook', {
      successRedirect: '/dashboard',
      failureRedirect: '/login',
    }));


  app.route('/api/auth/local/login')
    .post(passport.authenticate('login', {
      successRedirect: '/dashboard',
      failureRedirect: '/login',
    }));

  app.route('/api/auth/local/signup')
    .post(passport.authenticate('signup', {
      successRedirect: '/dashboard',
      failureRedirect: '/signup',
      failureFlash: true,
    }));

  app.route('/api/auth/logout')
    .get((req, res) => {
      req.logout();
      res.redirect('/');
    });

  /* meeetings API*/

  app.route('/api/meetings')
    .get((req, res) => {
      Meeting.find((err, meetings) => {
        if (err) res.status(500).send(err);
        return res.status(200).json(meetings);
      });
    });

  app.route('/api/meetings')
    .post((req, res) => {
      Meeting.create(req.body, (err, meeting) => {
        if (err) return res.status(500).send(err);
        return res.status(201).json(meeting);
      });
    });

  /* users API */

  app.route('/api/users')
    .get((req, res) => {
      User.find((err, users) => {
        if (err) res.status(500).send(err);
        return res.status(200).json(users);
      });
    });

  app.route('*')
    .get((req, res) => res.sendFile(`${path}/build/index.html`));
};
