import React, { Component } from 'react';
import { Router, Route, browserHistory, IndexRoute, Redirect } from 'react-router';
import 'dialog-polyfill/dialog-polyfill';
import 'dialog-polyfill/dialog-polyfill.css';
// Import App
import App from './components/App';
import Home from './pages/home/';
import Dashboard from './pages/Dashboard';
import EventDetails from './pages/EventDetails/EventDetails';
import NewEvent from './pages/NewEvent/';
import LoginController from './components/Login/loginController';

// Vendor Dependencies
import './styles/no-css-modules/nprogress.css';
import './styles/no-css-modules/react-notifications.css';

require('es6-promise').polyfill();

const Routes = () => {
  return (
    <Router history={browserHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={Home} />
        <Route path="loginController" component={LoginController} />
        <Route path="dashboard" component={Dashboard} />
        <Route path="event">
          <Route path="new" component={NewEvent} />
          <Route path=":uid" component={EventDetails} />
        </Route>
      </Route>
      <Redirect from="*" to="/" />
    </Router>
  );
};

export default Routes;
