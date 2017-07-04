
import events from '../../api/events';
import users from '../../api/user';
import auth from '../../auth';
import email from '../../api/email';
import ggcalendar from '../../api/gg-calendar';
import stats from '../../api/stats';

const path = process.cwd();

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
  /* email API */
  app.use('/api/email', email);
  /* Google Calendar API */
  app.use('/api/ggcalendar', ggcalendar);
  /* stats API */
  app.use('/api/stats', stats);

  app.route('*')
    .get((req, res) => res.sendFile(`${path}/build/index.html`));
};
