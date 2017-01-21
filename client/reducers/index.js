import { combineReducers } from 'redux';
import _ from 'lodash';
import * as actions from '../actions';

const initialState = {
  events: [],
  currentUser: {},
  userAuth: undefined,
};

const entities = (state = initialState, action) => {
  if (action.response && action.response.entities) {
    let newState = _.merge({}, state, action.response.entities);

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
