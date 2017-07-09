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
  refresh.requestNewAccessToken('google', curUser.accessToken,
    (err, newAccessToken) => {
      if (err) {
        console.error('ERROR at refreshToken requestNewAccessToken', err);
        return res.status(500).send(err);
      }
      console.log('requestNewAccessToken', newAccessToken, origin);
      curUser.save({ accessToken: newAccessToken }, () => {
        switch (origin) {
          case 'getCalList':
            return getCalList(res, curUser, true);
          case 'getCalEventsList':
            return getCalEventsList(req, res, curUser, true);
          default:
            return res.status(500).send('No callback defined at refresh token');
        }
      });
    });
};

const processCalendarList = (err, calendarList, res, curUser, withNewToken) => {
  if (err && err.code === 401 && !withNewToken) { // if the token is outdated refresh the auth
    return refreshToken(curUser, res, 'getCalList');
  }
  if (err) {
    console.error('ERROR at processCalendarList', err);
    return res.status(500).send(err);
  }
  return res.status(200).send(calendarList);
};

const getCalList = (res, curUser, withNewToken = false) => {
  const googleCalendar = new gcal.GoogleCalendar(curUser.accessToken);
  return googleCalendar.calendarList.list(
    (err, calendarList) => processCalendarList(err, calendarList, res, curUser, withNewToken));
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
  return getCalList(res, curUser);
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

export { listCalendars, listEvents };
