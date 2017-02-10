
import sendEmail from '../config/email';
import events from '../../api/events';
import users from '../../api/user';
import auth from '../../auth';

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
  app.use('/api/auth', auth);
  /* meeetings API*/
  app.use('/api/events', events);
  /* users API */
  app.use('/api/user', users);

  app.route('/api/sendEmail')
    .post(isAuthenticated, (req, res) => {
      sendEmail(req.body, (err, info) => {
        if (err) {
          console.log('err at route sendMail', err);
          return res.status(500).send(err);
        }
        return res.status(200).json(info);
      });
    });

  app.route('*')
    .get((req, res) => res.sendFile(`${path}/build/index.html`));
};
