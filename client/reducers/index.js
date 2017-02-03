import { combineReducers } from 'redux';
import _ from 'lodash';
import * as actions from '../actions';

const initialState = {
  events: [],
  currentUser: {},
  userAuth: undefined,
};

const entities = (state = initialState, action) => {
  // console.log('entities at reducers', state);
  if (action.response && action.response.entities) {
    let newState = {};
    newState = _.merge({}, state);

    if (action.type === actions.DELETE_EVENT_SUCCESS) {
      newState.events = newState.events.filter(ev =>
        ev._id !== action.response.result,
      );
    } else {
      newState = _.merge(newState, action.response.entities);
    }

    if (action.type === actions.USER.SUCCESS) {
      newState = _.merge(newState, {
        userAuth: true,
      });
    }

    return newState;
  }

  if (action.type === actions.USER.FAILURE) {
    return _.merge(state, {
      userAuth: false,
    });
  }

  return state;
};

const errorMessages = (state = null, action) => {
  const { error } = action;
  if (error) return action.error;
  return state;
};

export default combineReducers({
  entities,
  errorMessages,
});
