import { call, put, takeEvery } from 'redux-saga/effects';
import fetch from 'isomorphic-fetch';
import { checkStatus, parseJSON } from '../util/fetch.util';
import {
  REQUEST_EVENTS,
  EVENTS_FETCH_SUCCEEDED,
  EVENTS_FETCH_FAILED,
} from './index';

function* fetchEvents(action) {
  try {
    const response = yield call(fetch(`/api/${action.payload}`, {
      credentials: 'same-origin',
    }));

    checkStatus(response);
    const events = parseJSON(response);
    yield put({ type: EVENTS_FETCH_SUCCEEDED, payload: events });
  } catch (err) {
    yield put({ type: EVENTS_FETCH_FAILED, err });
  }
}

export default function* rootSaga() {
  yield [
    takeEvery(REQUEST_EVENTS, fetchEvents),
  ];
}

