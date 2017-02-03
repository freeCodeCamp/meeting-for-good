import { take, put, call, fork } from 'redux-saga/effects';
import { browserHistory } from 'react-router';
import api from '../services';
import * as actions from '../actions';

const { events, event, user } = actions;

function* fetchEntity(entity, apiFn, id) {
  yield put(entity.request(id));
  const { response, error } = yield call(apiFn, id);
  if (response) yield put(entity.success(response));
  else yield put(entity.failure(error));
}

function* newEvent(body) {
  yield put(event.newEventRequest(body));
  const { response, error } = yield call(api.newEvent, body);
  if (response) {
    // console.log('index saga newEvent', response);
    yield call(fetchEntity.bind(null, events, api.fetchEvents));
    yield browserHistory.push(`/event/${response.result}`);
    yield put(event.newEventSuccess(response));
  } else yield put(event.failure(error));
}

function* updateEvent(id, method, body) {
  yield put(event.updateEventRequest(id, method, body));
  const { response, error } = yield call(api.updateEvent, id, method, body);
  if (response) {
    yield put(event.updateEventSuccess(response));
  } else yield put(event.failure(error));
}

function* deleteEvent(id) {
  yield put(event.deleteEventRequest(id));
  const { response, error } = yield call(api.deleteEvent, id);
  if (response) {
    yield put(event.deleteEventSuccess(response));
  } else yield put(event.failure(error));
}

export const fetchEvents = fetchEntity.bind(null, events, api.fetchEvents);
export const fetchEvent  = fetchEntity.bind(null, event, api.fetchEvent);
export const fetchUser   = fetchEntity.bind(null, user, api.fetchUser);

function* loadEvents() {
  yield call(fetchEvents);
}

function* loadEvent(id) {
  yield call(fetchEvent, id);
}

function* loadUser() {
  yield call(fetchUser);
}

// WATCHERS

function* watchLoadEvents() {
  while (true) {
    // console.log('saga index watchLoadEvents');
    yield take(actions.LOAD_EVENTS);
    yield fork(loadEvents);
  }
}

function* watchLoadEvent() {
  while (true) {
    const { id } = yield take(actions.LOAD_EVENT);
    yield fork(loadEvent, id);
  }
}

function* watchLoadUser() {
  while (true) {
    yield take(actions.FETCH_CURRENT_USER);
    yield fork(loadUser);
  }
}

function* watchNewEvent() {
  while (true) {
    const { body } = yield take(actions.NEW_EVENT_REQUEST);
    console.log('watchNewEvent', body);
    yield fork(newEvent, body);
  }
}

function* watchUpdateEvent() {
  while (true) {
    const { id, method, body } = yield take(actions.UPDATE_EVENT_REQUEST);
    yield fork(updateEvent, id, method, body);
  }
}

function* watchDeleteEvent() {
  while (true) {
    const { id } = yield take(actions.DELETE_EVENT_REQUEST);
    yield fork(deleteEvent, id);
  }
}

export default function* root() {
  yield [
    fork(watchLoadEvents),
    fork(watchLoadEvent),
    fork(watchLoadUser),
    fork(watchNewEvent),
    fork(watchUpdateEvent),
    fork(watchDeleteEvent),
  ];
}
