import 'isomorphic-fetch';
import { schema, normalize } from 'normalizr';
import { checkStatus, parseJSON } from '../util/fetch.util';

const fixJSON = (json) => {
  if (json.entities.events) {
    json.entities.events = Object.keys(json.entities.events).map(key =>
      json.entities.events[key],
    );
  }

  if (json.entities.currentUser) {
    json.entities.currentUser = json.entities.currentUser[
      Object.keys(json.entities.currentUser)[0]
    ];
  }

  return json;
};

const useFetch = (endpoint, options, schema) => {
  return fetch(`/api${endpoint}`, options)
    .then(checkStatus)
    .then(parseJSON)
    .then(json => Object.assign({}, normalize(json, schema)))
    .then(fixJSON)
    .then(
      response => ({ response }),
      error => ({ error }),
    );
};

const fetchData = (endpoint, schema) => useFetch(endpoint, {
  credentials: 'same-origin',
  method: 'GET',
}, schema);

const sendData = (endpoint, method, body, schema) => useFetch(endpoint, {
  credentials: 'same-origin',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  method,
  body,
}, schema);

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
export const newEvent = body => sendData('/events', 'POST', body, eventSchema);
export const updateEvent = (id, method, body) => sendData(`/events/${id}`, method, body, eventSchema);
