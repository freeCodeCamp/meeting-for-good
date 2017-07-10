/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/ggCalendar/list             ->  listCalendars
 * GET     /api/ggCalendar/listEvents       ->  listEvents
 */

import gcal from 'google-calendar';
import refresh from 'passport-oauth2-refresh';
import User from '../user/user.model';

// Get the user's credentials.
const getCredencials = async req => User.findById(req.user);

const refreshToken = (curUser, req, res, origin) => {
  refresh.requestNewAccessToken('google', curUser.refreshToken,
    (err, newAccessToken) => {
      console.log('requestNewAccessToken', newAccessToken, origin);

      if (err) {
        console.error('ERROR at refreshToken requestNewAccessToken', err);
        return res.status(500).send('ERROR at refreshToken requestNewAccessToken');
      }
      curUser.accessToken = newAccessToken;
      curUser.save((err) => {
        if (err) {
          console.error('ERROR at save curUserrequestNewAccessToken', err);
          return res.status(500).send('ERROR at save curUserrequestNewAccessToken');
        }
          /* eslint-disable */
        switch (origin) {
          case 'getCalList':
            return getCalList(res, curUser, true);
          case 'getCalEventsList':
            return getCalEventsList(req, res, curUser, true);
          default:
            // return res.sendFile(`${path}/build/index.html`);  
            console.error('No callback defined at refresh token');
            return res.status(500).send('No callback defined at refresh token');
        }
          /* eslint-enable */
      });
    });
};

const processCalendarList = (err, calendarList, req, res, curUser, withNewToken) => {
  if (err && err.code === 401 && !withNewToken) { // if the token is outdated refresh the auth
    return refreshToken(curUser, req, res, 'getCalList');
  }
  if (err) {
    console.error('ERROR at processCalendarList', err);
    return res.status(500).send(err);
  }
  return res.status(200).send(calendarList);
};

const getCalList = (req, res, curUser, withNewToken = false) => {
  const googleCalendar = new gcal.GoogleCalendar(curUser.accessToken);
  return googleCalendar.calendarList.list(
    (err, calendarList) => processCalendarList(err, calendarList, req, res, curUser, withNewToken));
};


const processCalendarEvents = (err, req, res, calendarEvents, withNewToken, curUser) => {
  if (err && err.code === 401 && !withNewToken) { // if the token is outdated refresh the auth
    return refreshToken(curUser, req, res, 'processCalendarEvents');
  }
  if (err) {
    console.error('ERROR at processCalendarEvents', err);
    return res.status(500).send(err);
  }
  return res.status(200).json(calendarEvents);
};

const getCalEventsList = (req, res, curUser, withNewToken = false) => {
  const calendarId = req.params.calendarId;
  const minDate = decodeURI(req.params.minDate);
  const maxDate = decodeURI(req.params.maxDate);
  const googleCalendar = new gcal.GoogleCalendar(curUser.accessToken);
  return googleCalendar
    .events.list(calendarId, { timeMax: maxDate, timeMin: minDate }, (err, calendarEvents) =>
      processCalendarEvents(err, req, res, calendarEvents, withNewToken, curUser));
};


const listEvents = async (req, res) => {
  let curUser;
  try {
    curUser = await getCredencials(req);
  } catch (err) {
    console.error('ERROR at listEvents get curUser', err);
    return res.status(500).send(err);
  }
  return getCalEventsList(req, res, curUser);
};

const listCalendars = async (req, res) => {
  let curUser;
  try {
    curUser = await getCredencials(req);
    if (!curUser.accessToken) {
      console.error('no accessToken, listCalendars');
      return res.redirect('/auth');
    }
  } catch (err) {
    console.error('ERROR at listCalendars get curUser', err);
    return res.status(500).send(err);
  }
  return getCalList(req, res, curUser);
};

export { listCalendars, listEvents };
