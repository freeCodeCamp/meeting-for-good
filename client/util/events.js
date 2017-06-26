import fetch from 'isomorphic-fetch';
import nprogress from 'nprogress';
import jsonpatch from 'fast-json-patch';

import { checkStatus, parseJSON } from './fetch.util';

export const loadEvents = async (showPastEvents) => {
  let urlToFetch = '/api/events/getByUser';
  nprogress.configure({ showSpinner: false });
  nprogress.start();
  if (!showPastEvents) {
    const date = new Date();
    urlToFetch = `/api/events/getByUser/${date.toISOString()}`;
  }
  try {
    const response = await fetch(urlToFetch, { credentials: 'same-origin' });
    checkStatus(response);
    const events = await parseJSON(response);
    return events;
  } catch (err) {
    console.error('loadEvents, at events.js', err);
    return err;
  } finally {
    nprogress.done();
  }
};

export const loadEvent = async (id, full = false) => {
  nprogress.configure({ showSpinner: false });
  const urlToFecth = (full) ? `/api/events/getFull/${id}` : `/api/events/${id}`;
  nprogress.start();
  const response = await fetch(urlToFecth, { credentials: 'same-origin' });
  try {
    checkStatus(response);
    const event = await parseJSON(response);
    return event;
  } catch (err) {
    console.error('err at loadEvent EventDetail', err);
    return null;
  } finally {
    nprogress.done();
  }
};

export const addEvent = async (event) => {
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
  try {
    checkStatus(response);
    const newEvent = await parseJSON(response);
    return newEvent;
  } catch (err) {
    console.log('err at POST NewEvent', err);
    return err;
  } finally {
    nprogress.done();
  }
};

export const deleteEvent = async (id) => {
  nprogress.configure({ showSpinner: false });
  nprogress.start();
  const response = await fetch(
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
};

export const deleteGuest = async (guestToDelete) => {
  nprogress.configure({ showSpinner: false });
  nprogress.start();
  const response = await fetch(
    `/api/events/participant/${guestToDelete}`,
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
    const editEvent = await parseJSON(response);
    return editEvent;
  } catch (err) {
    console.log('error at deleteEvent Modal', err);
    return false;
  } finally {
    nprogress.done();
  }
};

export const editEvent = async (patches, eventId) => {
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
    const EditEvent = await parseJSON(response);
    return EditEvent;
  } catch (err) {
    console.log('events editEvent', err);
    return false;
  } finally {
    nprogress.done();
  }
};

export const loadOwnerData = async (_id) => {
  const response = await fetch(`/api/user/${_id}`, { credentials: 'same-origin' });
  try {
    checkStatus(response);
    return await parseJSON(response);
  } catch (err) {
    console.log('loadOwnerData', err);
    return null;
  }
};

/**
 * @param {*} guestId user id to edit as participant
 * @param {*} event to add the user as participant
 * @param {*} status to set at participant
 */
export const EditStatusParticipantEvent = async (guestId, event, status) => {
  const observe = jsonpatch.observe(event);
  event.participants.map((participant) => {
    if (participant.userId._id.toString() === guestId) {
      participant.status = status;
    }
    return participant;
  });
  const patch = jsonpatch.generate(observe);
  return editEvent(patch, event._id);
};

export const AddEventParticipant = async (guestId, event) => {
  const observe = jsonpatch.observe(event);
  event.participants.push({ userId: guestId, status: 1 });
  const patch = jsonpatch.generate(observe);
  const response = await editEvent(patch, event._id);
  return response;
};

export const handleDismiss = async (participantId) => {
  const response = await fetch(`/api/events/GuestNotificationDismiss/${participantId}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    method: 'PATCH',
  });
  try {
    checkStatus(response);
    const nEvent = await parseJSON(response);
    return nEvent;
  } catch (err) {
    console.error('handleDismiss', err);
    return null;
  }
};
