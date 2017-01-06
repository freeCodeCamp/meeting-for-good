import { combineReducers } from 'redux';
import EventsReducer from './events';
import UsersReducers from './users';

export default combineReducers({
  events: EventsReducer,
  users: UsersReducers,
});
