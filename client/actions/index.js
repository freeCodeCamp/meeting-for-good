const REQUEST = 'REQUEST';
const SUCCESS = 'SUCCESS';
const FAILURE = 'FAILURE';

const createRequestTypes = base => [REQUEST, SUCCESS, FAILURE].reduce((acc, type) => {
  acc[type] = `${base}_${type}`;
  return acc;
}, {});

const action = (type, payload = {}) => ({ type, ...payload });

export const EVENT = createRequestTypes('EVENT');
export const EVENTS = createRequestTypes('EVENTS');
export const USER = createRequestTypes('USER');

export const LOAD_EVENTS = 'LOAD_EVENTS';
export const LOAD_EVENT = 'LOAD_EVENT';
export const FETCH_CURRENT_USER = 'FETCH_CURRENT_USER';

export const NEW_EVENT_SENT = 'NEW_EVENT_SENT';
export const UPDATE_EVENT_SENT = 'UPDATE_EVENT_SENT';
export const NEW_EVENT_FAILURE = 'NEW_EVENT_FAILURE';
export const NEW_EVENT_REQUEST = 'NEW_EVENT_REQUEST';
export const NEW_EVENT_SUCCESS = 'NEW_EVENT_SUCCESS';
export const UPDATE_EVENT_REQUEST = 'UPDATE_EVENT_REQUEST';
export const UPDATE_EVENT_SUCCESS = 'UPDATE_EVENT_SUCCESS';

export const events = {
  request: () => action(EVENTS.REQUEST),
  success: response => action(EVENTS.SUCCESS, { response }),
  failure: error => action(EVENTS.FAILURE, { error }),
};

export const event = {
  request: id => action(EVENT.REQUEST, { id }),
  success: response => action(EVENT.SUCCESS, { response }),
  failure: error => action(EVENT.FAILURE, { error }),
  newEventRequest: body => action(NEW_EVENT_SENT, { body }),
  newEventSuccess: response => action(NEW_EVENT_SUCCESS, { response }),
  updateEventRequest: (id, method, body) => action(UPDATE_EVENT_SENT, {
    id,
    method,
    body,
  }),
  updateEventSuccess: response => action(UPDATE_EVENT_SUCCESS, {
    response,
  }),
};

export const user = {
  request: () => action(USER.REQUEST),
  success: response => action(USER.SUCCESS, { response }),
  failure: error => action(USER.FAILURE, { error }),
};

export const loadEvents = () => action(LOAD_EVENTS);
export const loadEvent = id => action(LOAD_EVENT, { id });
export const fetchCurrentUser = () => action(FETCH_CURRENT_USER);
export const newEvent = body => action(NEW_EVENT_REQUEST, { body });
export const updateEvent = (id, method, body) => action(UPDATE_EVENT_REQUEST, {
  id,
  method,
  body,
});
