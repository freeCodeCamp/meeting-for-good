// Vendor Dependencies
import React from 'react';
import { render } from 'react-dom';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory, IndexRoute, Redirect } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';
import 'dialog-polyfill/dialog-polyfill';
import 'dialog-polyfill/dialog-polyfill.css';
import './styles/no-css-modules/nprogress.css';
import './styles/no-css-modules/react-notifications.css';

// Import App
import reducer from './reducers';
import App from './components/App';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import EventDetails from './pages/EventDetails';
import NewEvent from './pages/NewEvent';

require('es6-promise').polyfill();

const store = createStore(
  combineReducers({
    reducer,
    routing: routerReducer,
  }),
);

const history = syncHistoryWithStore(browserHistory, store);

render((
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={App}>
        <IndexRoute component={Home} />
        <Route path="dashboard" component={Dashboard} />
        <Route path="event">
          <Route path="new" component={NewEvent} />
          <Route path=":uid" component={EventDetails} />
        </Route>
      </Route>
      <Redirect from="*" to="/" />
    </Router>
  </Provider>
), document.getElementById('app'));
