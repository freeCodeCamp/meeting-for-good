import fetch from 'isomorphic-fetch';
import nprogress from 'nprogress';
import { checkStatus, parseJSON } from './fetch.util';

export async function loadEvents(showPastEvents) {
  let urlToFetch = '/api/events/getByUser';
  nprogress.configure({ showSpinner: false });
  nprogress.start();
  if (!showPastEvents) {
    const date = new Date();
    urlToFetch = `/api/events/getByUser/${date.toISOString()}`;
  }
  const response = await fetch(urlToFetch, { credentials: 'same-origin' });
  let events;
  try {
    checkStatus(response);
    events = await parseJSON(response);
    return events;
  } catch (err) {
    console.log('loadEvents, at Dashboard', err);
    return err;
  } finally {
    nprogress.done();
  }
}
