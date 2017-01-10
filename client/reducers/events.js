import {
  EVENTS_FETCH_SUCCEEDED,
} from '../actions/';


export default (state = [], action) => {
  switch (action) {
    case EVENTS_FETCH_SUCCEEDED:
      state = {
        ...state,
        events: action.payload,
      };
      break;

    default:
      break;
  }

  return state;
};
