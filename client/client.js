// Vendor Dependencies
import React from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory, IndexRoute, Redirect } from 'react-router';
import './styles/no-css-modules/nprogress.css';
import './styles/no-css-modules/react-notifications.css';
import 'dialog-polyfill/dialog-polyfill.js';
import 'dialog-polyfill/dialog-polyfill.css';

require('es6-promise').polyfill();

// Import App
import App from './components/App';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EventDetails from './pages/EventDetails';
import NewEvent from './pages/NewEvent';

render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
      <Route path="dashboard" component={Dashboard} />
      <Route path="login" component={Login} />
      <Route path="signup" component={Signup} />
      <Route path="event">
        <Route path="new" component={NewEvent} />
        <Route path=":uid" component={EventDetails} />
      </Route>
    </Route>
    <Redirect from="*" to="/" />
  </Router>
), document.getElementById('app'));
