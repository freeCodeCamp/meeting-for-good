const path = process.cwd();
console.log(path);
import Meeting from '../models/meeting';
import passport from 'passport';

export default (app) => {
  const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect('/');
    }
  };

  app.route('/dashboard')
    .get(isLoggedIn, (req, res, next) => {
      next();
    });


  /*
  ....###....########..####..######.
  ...##.##...##.....##..##..##....##
  ..##...##..##.....##..##..##......
  .##.....##.########...##...######.
  .#########.##.........##........##
  .##.....##.##.........##..##....##
  .##.....##.##........####..######.
  */

  app.route('/api/meetings')
    .get((req, res) => {
      Meeting.find((err, meetings) => {
        if (err) res.status(500).send(err);
        return res.status(200).json(meetings);
      });
    });

  app.route('/api/getuser')
    .get((req, res) => {
      res.status(200).json(req.user);
    });

  app.route('/auth/github')
    .get(passport.authenticate('github'));

  app.route('/auth/github/callback')
    .get(passport.authenticate('github', {
      successRedirect: '/dashboard',
      failureRedirect: '/login'
    }));

  app.route('/auth/local')
    .post(passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/login',
  }));

  app.route('/logout')
    .get((req, res) => {
      req.logout();
      res.redirect('/');
    });

  app.route('*')
    .get((req, res) => res.sendFile(`${path}/build/index.html`));
};
