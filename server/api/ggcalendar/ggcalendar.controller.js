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

const getCalList = (res, curUser) =>
  gcal(curUser.accessToken).calendarList.list((err, calendarList) => {
    if (err && err.code === 401) {
      refresh.requestNewAccessToken('google', curUser.accessToken,
        (err, accessToken) => {
          if (err) {
            console.error('ERROR at requestNewAccessToken getCalList gg-calendar fist error 401', err);
            return res.status(500).send(err);
          }
          gcal(accessToken).calendarList.list((err, calendarList) => {
            if (err) {
              console.error('ERROR at requestNewAccessToken getCalList gg-calendar getCal after newRequest', err);
              return res.status(500).send(err);
            }
            return res.status(200).send(calendarList);
          });
        });
    }
    if (err && err.code !== 401) {
      console.error('ERROR at requestNewAccessToken getCalList gg-calendar.control', err);
      return res.status(500).send(err);
    }
    return res.status(200).send(calendarList);
  });

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

const getCalEventsList = (req, res, curUser) => {
  const calendarId = req.params.calendarId;
  const minDate = decodeURI(req.params.minDate);
  const maxDate = decodeURI(req.params.maxDate);
  gcal(curUser.accessToken)
    .events.list(calendarId, { timeMax: maxDate, timeMin: minDate }, (err, data) => {
      if (err && err.code === 401) {
        refresh.requestNewAccessToken('google', curUser.accessToken,
          (err, accessToken) => {
            if (err) {
              console.error('ERROR GetCalEventsList at gg-calendar.controler after 401 requestNewAccess', err);
              return res.status(500).send(err);
            }
            gcal(accessToken)
              .events.list(calendarId, { timeMax: maxDate, timeMin: minDate }, (err, data) => {
                if (err) {
                  console.error('ERROR GetCalEventsList at gg-calendar.controler after requestNewAccess', err);
                  return res.status(500).send(err);
                }
                return res.status(200).send(data);
              });
          });
      }
      if (err && err !== 401) {
        console.error('ERROR GetCalEventsList at gg-calendar.controler gCal', err);
        return res.status(500).send(err);
      }
      return res.status(200).json(data);
    });
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
