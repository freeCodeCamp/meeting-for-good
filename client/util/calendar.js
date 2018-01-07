import fetch from 'isomorphic-fetch';
import nprogress from 'nprogress';
import { checkStatus, parseJSON } from './fetch.util';

nprogress.configure({ showSpinner: false });

const listCalendars = async () => {
  nprogress.start();
  try {
    const response = await fetch('/api/ggcalendar/list', { credentials: 'same-origin' });
    checkStatus(response);
    let calendars = await parseJSON(response);
    calendars = calendars.items.filter(item => item.accessRole === 'owner');
    return calendars;
  } catch (err) {
    console.error('listCalendars at calendars.js', err);
    return err;
  } finally {
    nprogress.done();
  }
};

const headerForGet = {
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  credentials: 'same-origin',
  method: 'GET',
};

const loadCalendarEvents = async (urlToFetch) => {
  try {
    const calendarEvents = await fetch(encodeURI(urlToFetch), headerForGet);
    checkStatus(calendarEvents);
    const result = parseJSON(calendarEvents);
    return result;
  } catch (err) {
    console.error('ERROR at loadCalendarEvents', err);
    return err;
  }
};

const listEventsForCalendar = async (maxMinDates, calendar) => {
  const urlToFetch =
    encodeURI(`/api/ggcalendar/listEvents/${calendar.calendarId}/${maxMinDates.minDate.utc().format()}/${maxMinDates.maxDate.utc().format()}`);
  try {
    const result = await loadCalendarEvents(urlToFetch);
    return result;
  } catch (err) {
    console.error('ERROR at listEventsForCalendar calendar', err);
    return err;
  }
};

const flatCalendarEvents = async (googleCalendars, maxMinDates) => {
  const events = [];
  try {
    await Promise.all(googleCalendars.map(async (calendar) => {
      const calendarEvents = await listEventsForCalendar(maxMinDates, calendar);
      calendarEvents.items.forEach(event => events.push(event));
    }));
    return events;
  } catch (err) {
    console.error('ERROR flatCalendarEvents calendar.js', err);
    return [];
  }
};

const listCalendarEvents = async (maxMinDates, curUser) => {
  const googleCalendars = curUser.GoogleSelectedCalendars;
  if (googleCalendars.length > 0) {
    try {
      nprogress.start();
      const result = await flatCalendarEvents(googleCalendars, maxMinDates);
      return result;
    } catch (err) {
      console.error('listCalendarEvents calendar.js', err);
    } finally {
      nprogress.done();
    }
  }
  return [];
};

export { listCalendars, listCalendarEvents };
