import 'isomorphic-fetch';
import { schema, normalize } from 'normalizr';
import { checkStatus, parseJSON } from '../util/fetch.util';

const fetchData = (endpoint, schema) => {
  return fetch(`/api${endpoint}`, { credentials: 'same-origin' })
    .then(checkStatus)
    .then(parseJSON)
    .then(json => Object.assign({}, normalize(json, schema)))
    .then((json) => {
      if (json.entities.events) {
        json.entities.events = Object.keys(json.entities.events).map(key =>
          json.entities.events[key],
        );
      }
      return json;
    })
    .then(
      response => ({ response }),
      error => ({ error }),
    );
};

const sendData = (endpoint, method, body) => {
  return fetch(`/api${endpoint}`, {
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
    .then(
      response => ({ response }),
      error => ({ error: error || 'Something Bad Happened :O' }),
    );
};

const userSchema = new schema.Entity('currentUser', {}, {
  idAttribute: '_id',
});

const eventSchema = new schema.Entity('events', {}, {
  idAttribute: '_id',
});

const eventSchemaArray = new schema.Array(eventSchema);

export const fetchEvents = () => fetchData('/events/getByUser', eventSchemaArray);
export const fetchEvent = uid => fetchData(`/events/${uid}`, eventSchema);
export const fetchUser = () => fetchData('/auth/current', userSchema);
export const newEvent = body => sendData('/events', 'POST', body);
export const updateEvent = (id, method, body) => sendData(`/events/${id}`, method, body);
