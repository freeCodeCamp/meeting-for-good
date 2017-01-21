import { take, put, call, fork } from 'redux-saga/effects';
import api from '../services';
import * as actions from '../actions';

const { events, event, user } = actions;

function* fetchEntity(entity, apiFn, id) {
  yield put(entity.request(id));
  const { response, error } = yield call(apiFn, id);
  if (response) yield put(entity.success(response));
  else yield put(entity.failure(error));
}

function* newEvent(entity, body) {
  yield put(event.newEventRequest(body));
  const { response, error } = yield call(api.newEvent, body);
  if (response) yield put(event.newEventSuccess({ response }));
  else yield put(event.failure(error));
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
    yield fork(newEvent, event, body);
  }
}

export default function* root() {
  yield [
    fork(watchLoadEvents),
    fork(watchLoadEvent),
    fork(watchLoadUser),
    fork(watchNewEvent),
  ];
}
