// Vendor Dependencies
import React from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import 'velocity-animate/velocity.min.js';
import 'normalize.css/normalize.css';

// Import App
import App from './components/App';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/login" component={Login} />
    </Route>
  </Router>
), document.getElementById('app'));
