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
    console.log('loadEvents, at events.js', err);
    return err;
  } finally {
    nprogress.done();
  }
}

export async function loadEvent(id) {
  nprogress.configure({ showSpinner: false });
  nprogress.start();
  const response = await fetch(`/api/events/${id}`, {
    credentials: 'same-origin',
  });
  try {
    checkStatus(response);
    const event = await parseJSON(response);
    return event;
  } catch (err) {
    console.log('err at componentWillMount EventDetail', err);
    return null;
  } finally {
    nprogress.done();
  }
}

export async function addEvent(event) {
  console.log('addEvent', event);
  nprogress.configure({ showSpinner: false });
  nprogress.start();
  const response = await fetch('/api/events', {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: event,
    credentials: 'same-origin',
  });

  let newEvent;
  try {
    checkStatus(response);
    newEvent = await parseJSON(response);
    return newEvent;
  } catch (err) {
    console.log('err at POST NewEvent', err);
    return err;
  } finally {
    nprogress.done();
  }
}

export async function deleteEvent(id) {
  nprogress.configure({ showSpinner: false });
  nprogress.start();
  const response =  await fetch(
  `/api/events/${id}`,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'DELETE',
      credentials: 'same-origin',
    },
  );
  try {
    checkStatus(response);
    return true;
  } catch (err) {
    console.log('deleteEvent', err);
    return false;
  } finally {
    nprogress.done();
  }
}

export async function editEvent(patches, eventId) {
  nprogress.configure({ showSpinner: false });
  nprogress.start();
  const response = await fetch(`/api/events/${eventId}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    method: 'PATCH',
    body: JSON.stringify(patches),
  });

  try {
    checkStatus(response);
    return true;
  } catch (err) {
    console.log('events editEvent', err);
    return false;
  } finally {
    nprogress.done();
  }
}
