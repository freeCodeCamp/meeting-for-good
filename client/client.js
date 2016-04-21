// Vendor Dependencies
import React from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import 'materialize-css/dist/js/materialize.min.js';
import 'materialize-css/dist/css/materialize.min.css';

require('es6-promise').polyfill();

// Import App
import App from './components/App';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EventDetails from './pages/EventDetails';
import NewEvent from './components/NewEvent';

render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <Route path="dashboard" component={Dashboard} />
      <Route path="login" component={Login} />
      <Route path="signup" component={Signup} />
      <Route path="event">
        <Route path="new" component={NewEvent} />
        <Route path=":uid" component={EventDetails} />
      </Route>
    </Route>
  </Router>
), document.getElementById('app'));
