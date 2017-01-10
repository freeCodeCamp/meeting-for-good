export const REQUEST_EVENTS = 'REQUEST_EVENTS';
export const EVENTS_FETCH_FAILED = 'FETCH_FAILED';
export const EVENTS_FETCH_SUCCEEDED = 'FETCH_SUCCEEDED';

export const requestEvents = (url) => {
  return { type: REQUEST_EVENTS, payload: url };
};

