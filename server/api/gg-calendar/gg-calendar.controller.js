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

const cbGetCalList = (err, accessToken, res) =>
  gcal(accessToken).calendarList.list((err, calendarList) => {
    if (err) {
      console.error('ERROR at requestNewAccessToken getCalList gg-calendar.control', err);
      return res.status(500).send(err);
    }
    return res.status(200).send(calendarList);
  });

const getCalList = (res, curUser) =>
  refresh.requestNewAccessToken('google', curUser.accessToken,
    (err, accessToken) => cbGetCalList(err, accessToken, res));


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

const cbGetCalEventsList = (err, accessToken, refreshToken, req, res) => {
  const calendarId = req.params.calendarId;
  const minDate = decodeURI(req.params.minDate);
  const maxDate = decodeURI(req.params.maxDate);
  gcal(accessToken)
    .events.list(calendarId, { timeMax: maxDate, timeMin: minDate }, (err, data) => {
      if (err) {
        console.error('ERROR GetCalEventsList at gg-calendar.controler', err);
        return res.status(500).send(err);
      }
      return res.status(200).json(data);
    });
};

const GetCalEventsList = (req, res, curUser) =>
  refresh.requestNewAccessToken('google', curUser.accessToken,
    (err, accessToken, refreshToken) =>
      cbGetCalEventsList(err, accessToken, refreshToken, req, res));

const listEvents = async (req, res) => {
  let curUser;
  try {
    curUser = await getCredencials(req);
  } catch (err) {
    console.error('ERROR at listEvents get curUser', err);
    return res.status(500).send(err);
  }
  return GetCalEventsList(req, res, curUser);
};


export { listCalendars, listEvents };
