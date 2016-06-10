const path = process.cwd();
import Event from '../models/event';
import User from '../models/users';
import passport from 'passport';
import _ from 'lodash';
import sendEmail from '../config/email';

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
  app.route('/api/events')
    .get(isAuthenticated, (req, res) => {
      Event.find((err, events) => {
        if (err) res.status(500).send(err);
        return res.status(200).json(events);
      });
    })
    .post(isAuthenticated, (req, res) => {
      const name = (req.user.facebook.username ||
                      req.user.github.username ||
                      req.user.local.username);
      const avatar = (req.user.facebook.avatar ||
                      req.user.github.avatar ||
                      req.user.local.avatar);
      const _id = req.user._id;

      req.body.participants = [{ name, avatar, _id }];
      req.body.owner = name;
      Event.create(req.body, (err, event) => {
        if (err) return res.status(500).send(err);
        return res.status(201).json(event);
      });
    });

  app.route('/api/events/:id')
    .get(isAuthenticated, (req, res) => {
      Event.findById(req.params.id, (err, event) => {
        if (err) return res.status(500).send(err);
        if (!event) return res.status(404).send('Not found.');
        return res.status(200).json(event);
      });
    })
    .put(isAuthenticated, (req, res) => {
      Event.findById(req.params.id, (err, event) => {
        if (err) return res.status(500).send(err);
        if (!event) return res.status(404).send('Not found.');

        const updated = _.extend(event, req.body);
        updated.save(err => {
          if (err) return res.status(500).send(err);
          return res.status(200).json(event);
        });
      });
    })
    .delete(isAuthenticated, (req, res) => {
      Event.findById(req.params.id, (err, event) => {
        if (err) return res.status(500).send(err);
        if (!event) return res.status(404).send('Not found.');

        event.remove(err => {
          if (err) return res.status(500).send(err);
          return res.status(204).send('No Content');
        });
      });
    });

  app.route('/api/events/:id/updateAvail')
    .put(isAuthenticated, (req, res) => {
      Event.findOne({"uid": req.params.id}, (err, event) => {
        if (err) return res.status(500).send(err);
        if (!event) return res.status(404).send('Not found.');

        let participants;
        let newParticipant;
        let userExists = false;
        let username;
        let userAvatar;

        if (req.body.user.local) {
          username = req.body.user.local.username;
          userAvatar = req.body.user.local.avatar;
        } else if (req.body.user.github) {
          username = req.body.user.github.username;
          userAvatar = req.body.user.github.avatar;
        } else if (req.body.user.facebook) {
          username = req.body.user.facebook.username;
          userAvatar = req.body.user.facebook.avatar;
        }

        if (event.participants.length !== 0) {
          participants = event.participants;
          participants.map(user => {
            if (user.name === username) {
              user.availability = req.body.data;
              userExists = true;
            }
            if (user.name !== username) {
              newParticipant = {
                avatar: userAvatar,
                name: username,
                availability: req.body.data,
              };
            }
            return user;
          });
          if (newParticipant !== null && !userExists) participants.push(newParticipant);
        } else {
          participants = {
            avatar: userAvatar,
            name: username,
            availability: req.body.data,
          };
        }

        event.participants = participants;
        event.markModified('participants');
        event.save((err) => {
          if (err) return res.status(500).send(err);
          return res.status(200).json(event);
        });
      });
    });

  app.route('/api/events/getbyuid/:uid')
    .get((req, res) => {
      const uid = req.params.uid;
      Event.find({ uid }, (err, events) => {
        if (err) res.status(500).send(err);
        return res.status(200).json(events[0]);
      });
    });

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

  app.route('/api/users/current/events')
    .get(isAuthenticated, (req, res) => {
      const username = (req.user.facebook.username ||
                        req.user.github.username ||
                        req.user.local.username);
      Event.find({ 'participants.name': username }, (err, events) => {
        if (err) return res.status(500).send(err);
        return res.status(200).json(events);
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
