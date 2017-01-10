import 'isomorphic-fetch';
import { checkStatus, parseJSON } from '../util/fetch.util';

const fetchData = (endpoint) => {
  return fetch(`/api/${endpoint}`, { credentials: 'same-origin' })
    .then(checkStatus)
    .then(parseJSON)
    .then(response => ({ response }))
    .catch(error => `Something bad happened: ${error}`);
};

const sendData = (endpoint, method, body) => {
  return fetch(`/api/${endpoint}`, {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method,
    body,
  })
    .then(checkStatus)
    .then(parseJSON)
    .then(response => ({ response }))
    .catch(error => `Something bad happened: ${error}`);
};

export const fetchEvents = () => fetchData('/events/getByUser');
export const fetchEvent = uid => fetchData(`/events/${uid}`);
export const fetchUser = () => fetchData('/auth/current');
export const newEvent = body => sendData('/events', 'POST', body);
export const updateEvent = (id, method, body) =>
  sendData(`/events/${id}`, method, body);
