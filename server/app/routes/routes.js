import passport from 'passport';
import _ from 'lodash';
import Event from '../../api/events/events.model';
import User from '../models/users';
import sendEmail from '../config/email';

const path = process.cwd();

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();

  return res.status(403).send('Authentiation required.');
};

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
      if (req.user) return res.status(200).send(req.user);
      return res.status(500).send('User not found');
    });

  app.route('/api/auth/google')
    .get(passport.authenticate('google', {
      scope: ['profile'],
    }));

  app.route('/api/auth/google/callback')
    .get(passport.authenticate('google', {
      successRedirect: '/dashboard',
    }));

  app.route('/api/auth/facebook')
    .get(passport.authenticate('facebook'));

  app.route('/api/auth/facebook/callback')
    .get(passport.authenticate('facebook', {
      successRedirect: '/dashboard',
    }));

  app.route('/api/auth/logout')
    .get((req, res) => {
      req.logout();
      res.redirect('/');
    });

  /* meeetings API*/
  app.use('/api/events', require('../../api/events'));

  /* users API */
  app.route('/api/users')
    .get(isAuthenticated, (req, res) => {
      User.find((err, users) => {
        if (err) res.status(500).send(err);
        return res.status(200).json(users);
      });
    });

  app.route('/api/users/:id')
    .get(isAuthenticated, (req, res) => {
      User.findById(req.params.id, (err, user) => {
        if (err) return res.status(500).send(err);
        if (!user) return res.status(404).send('Not found.');
        return res.status(200).json(user);
      });
    })
    .put(isAuthenticated, (req, res) => {
      User.findById(req.params.id, (err, user) => {
        if (err) return res.status(500).send(err);
        if (!user) return res.status(404).send('Not found.');
        if (user._id !== req.user._id) return res.status(550).send('Permission denied.');

        const updated = _.extend(user, req.body);
        updated.save(err => {
          if (err) return res.status(500).send(err);
          return res.status(200).json(user);
        });
      });
    });


  app.route('/api/sendEmail')
    .post(isAuthenticated, (req, res) => {
      sendEmail(req.body.message, (err, info) => {
        if (err) return res.status(500).send(err);
        return res.status(200).json(info);
      });
    });

  app.route('*')
    .get((req, res) => res.sendFile(`${path}/build/index.html`));
};
