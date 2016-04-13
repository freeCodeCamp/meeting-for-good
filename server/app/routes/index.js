const path = process.cwd();
import Meeting from '../models/meeting';

export default (app) => {
  // function isLoggedIn (req, res, next) {
  //   if (req.isAuthenticated()) {
  //     return next();
  //   }
  //
  //   res.redirect('/login');
  // }

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

  app.route('/api/:id')
    .get((req, res) => {
      res.json(req.user.github);
    });

  // app.route('/auth/github')
  //   .get(passport.authenticate('github'));
  //
  // app.route('/auth/github/callback')
  //   .get(passport.authenticate('github', {
  //     successRedirect: '/',
  //     failureRedirect: '/login',
  //   }));

  app.route('*')
    .get((req, res) => res.sendFile(`${path}/client/index.html`));
};
