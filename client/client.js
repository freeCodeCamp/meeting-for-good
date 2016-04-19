// Vendor Dependencies
import React from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';

require('es6-promise').polyfill();

// Import App
import App from './components/App';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MeetingDetails from './pages/MeetingDetails';

render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/event/:uid" component={MeetingDetails} />
    </Route>
  </Router>
), document.getElementById('app'));
