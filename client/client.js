// Vendor Dependencies
import React from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory, IndexRoute, Redirect } from 'react-router';
import 'dialog-polyfill/dialog-polyfill';
import 'dialog-polyfill/dialog-polyfill.css';
import './styles/no-css-modules/nprogress.css';
import './styles/no-css-modules/react-notifications.css';

require('es6-promise').polyfill();

// Import App
import App from './components/App';
import Home from './components/Home';
import DashboardContainer from './components/Dashboard/Container';
import EventDetailsContainer from './components/EventDetails/Container';
import NewEventContainer from './components/NewEvent/Container';

render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
      <Route path="dashboard" component={DashboardContainer} />
      <Route path="event">
        <Route path="new" component={NewEventContainer} />
        <Route path=":uid" component={EventDetailsContainer} />
      </Route>
    </Route>
    <Redirect from="*" to="/" />
  </Router>
), document.getElementById('app'));
